const Recruitment = require('../models/Recruitment');
const Exam = require('../models/Exam');
const RecruitmentApplication = require('../models/RecruitmentApplication');
const userService = require('../services/userService');
const nodemailer = require('nodemailer');
const emailService = require('../utils/emailService');
const Club = require('../models/Club');

// Configure nodemailer (using dummy creds/env for now, similar to other services)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'test@gmail.com',
        pass: process.env.EMAIL_PASS || 'password'
    }
});

/**
 * @desc    Create a new recruitment event
 * @route   POST /api/recruitment
 * @access  Private (Organizer)
 */
exports.createRecruitment = async (req, res, next) => {
    try {
        const recruitment = await Recruitment.create({
            ...req.body,
            createdBy: req.user.id
        });

        // Send email to all users
        // Use setImmediate to not block the response
        setImmediate(() => {
            emailService.sendRecruitmentAnnouncement(recruitment, req.body.clubName || 'Our Club');
        });

        res.status(201).json({
            success: true,
            data: recruitment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all recruitment events
 * @route   GET /api/recruitment
 * @access  Public
 */
exports.getAllRecruitments = async (req, res, next) => {
    try {
        const recruitments = await Recruitment.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: recruitments.length,
            data: recruitments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get recruitment by ID
 * @route   GET /api/recruitment/:id
 * @access  Public
 */
exports.getRecruitmentById = async (req, res, next) => {
    try {
        // Fallback check if route matching fails
        if (req.params.id === 'all-selected') {
            console.log('[RECRUITMENT] Route fallback: all-selected hit getRecruitmentById');
            return exports.getAllSelectedStudents(req, res, next);
        }

        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            console.log('[RECRUITMENT] Invalid ID format:', req.params.id);
            return res.status(404).json({ 
                success: false, 
                message: `Recruitment not found. The ID provided (${req.params.id}) is not a valid format.` 
            });
        }

        const recruitment = await Recruitment.findById(req.params.id);
        if (!recruitment) {
            return res.status(404).json({ success: false, message: 'Recruitment not found' });
        }
        res.status(200).json({
            success: true,
            data: recruitment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update recruitment drive
 * @route   PUT /api/recruitment/:id
 * @access  Private (Organizer)
 */
exports.updateRecruitment = async (req, res, next) => {
    try {
        const recruitment = await Recruitment.findById(req.params.id);

        if (!recruitment) {
            return res.status(404).json({ success: false, message: 'Recruitment not found' });
        }

        // Must be the creator (organizer) or an admin
        if (recruitment.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'User not authorized to update this recruitment' });
        }

        const updatedRecruitment = await Recruitment.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedRecruitment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get applications for a recruitment
 * @route   GET /api/recruitment/:id/applications
 * @access  Private (Organizer)
 */
exports.getRecruitmentApplications = async (req, res, next) => {
    try {
        const applications = await RecruitmentApplication.find({ recruitmentId: req.params.id });

        const userIds = applications.map(app => app.userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const users = await userService.getUsersByIds(userIds, token);

        const populatedApplications = applications.map(app => {
            const user = users[app.userId.toString()];
            const appObj = app.toObject();
            if (user) {
                if (appObj.userName === 'undefined undefined' || !appObj.userName) {
                    appObj.userName = `${user.firstName} ${user.lastName}`;
                }
                appObj.userEmail = appObj.userEmail || user.email;
                appObj.user = user;
            }
            return appObj;
        });

        res.status(200).json({
            success: true,
            count: populatedApplications.length,
            data: populatedApplications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all selected students for all recruitments of an organizer
 * @route   GET /api/recruitment/all-selected
 * @access  Private (Organizer/Admin)
 */
exports.getAllSelectedStudents = async (req, res, next) => {
    try {
        console.log('[RECRUITMENT] getAllSelectedStudents called by:', req.user.id, 'Role:', req.user.role);
        const userId = req.user.id;
        
        // 1. Find all recruitments created by this user
        const query = req.user.role === 'admin' ? {} : { createdBy: userId };
        const recruitments = await Recruitment.find(query);
        console.log(`[RECRUITMENT] Found ${recruitments.length} recruitments`);
        
        const recruitmentIds = recruitments.map(r => r._id);

        if (recruitmentIds.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        // 2. Find all 'Selected' applications for these recruitments
        const applications = await RecruitmentApplication.find({
            recruitmentId: { $in: recruitmentIds },
            status: 'Selected'
        }).lean();
        console.log(`[RECRUITMENT] Found ${applications.length} selected applications`);

        if (applications.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        // 3. Fetch user details (photos) from auth-service
        const userIds = applications.map(app => app.userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const userMap = await userService.getUsersByIds(userIds, token);

        // 4. Group applications by recruitment
        const groupedData = recruitments.map(rec => {
            const recApps = applications.filter(app => app.recruitmentId.toString() === rec._id.toString());
            
            if (recApps.length === 0) return null;

            return {
                recruitmentId: rec._id,
                recruitmentTitle: rec.title,
                clubName: rec.clubName,
                selectedCount: recApps.length,
                students: recApps.map(app => {
                    const userData = userMap[app.userId.toString()];
                    return {
                        ...app,
                        userPhoto: userData?.photo || null,
                        userFirstName: userData?.firstName || 'Student',
                        userLastName: userData?.lastName || ''
                    };
                })
            };
        }).filter(Boolean);

        res.status(200).json({
            success: true,
            count: applications.length,
            data: groupedData
        });
    } catch (error) {
        console.error('[RECRUITMENT] ERROR in getAllSelectedStudents:', error);
        next(error);
    }
};

/**
 * @desc    Get my application status
 * @route   GET /api/recruitment/:id/my-application
 * @access  Private
 */
exports.getMyApplication = async (req, res, next) => {
    try {
        const application = await RecruitmentApplication.findOne({
            recruitmentId: req.params.id,
            userId: req.user.id
        });
        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get my all recruitment applications
 * @route   GET /api/recruitment/my-applications
 * @access  Private
 */
exports.getMyApplications = async (req, res, next) => {
    try {
        const applications = await RecruitmentApplication.find({
            userId: req.user.id
        });

        // Populate recruitment and exam details
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const recruitment = await Recruitment.findById(app.recruitmentId);
            const exam = await Exam.findOne({ recruitmentId: app.recruitmentId });
            
            return {
                ...app._doc,
                recruitment,
                isExamReleased: exam ? exam.isReleased : false,
                examId: exam ? exam._id : null
            };
        }));

        res.status(200).json({
            success: true,
            count: enrichedApplications.length,
            data: enrichedApplications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Close recruitment registrations
 * @route   PUT /api/recruitment/:id/close
 * @access  Private (Organizer)
 */
exports.closeRecruitment = async (req, res, next) => {
    try {
        const recruitment = await Recruitment.findByIdAndUpdate(
            req.params.id,
            { status: 'Completed', deadline: new Date() },
            { new: true }
        );
        res.status(200).json({
            success: true,
            data: recruitment
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get exam details
 * @route   GET /api/recruitment/:id/exam
 * @access  Private
 */
exports.getExam = async (req, res, next) => {
    try {
        const exam = await Exam.findOne({ recruitmentId: req.params.id });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Get user's application to check their status
        const app = await RecruitmentApplication.findOne({ recruitmentId: req.params.id, userId: req.user.id });

        const recruitment = await Recruitment.findById(req.params.id);
        const isOrganizer = recruitment && recruitment.createdBy.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const hasOrganizerRole = req.user.role === 'organizer';

        // Only organizers or if the exam is released AND user is in the target audience
        // Or if the user has ALREADY attempted the exam, let them view it for review!
        if (!isOrganizer && !isAdmin && !hasOrganizerRole) {
            const hasAttempted = app && app.examResponses && app.examResponses.length > 0;
            if (!hasAttempted) {
                if (!exam.isReleased) {
                    return res.status(200).json({ success: true, data: { isReleased: false, scheduled: true } });
                }
                if (!app || !exam.targetAudience.includes(app.status)) {
                    return res.status(403).json({ success: false, message: 'You are not eligible for this exam phase' });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: exam
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle exam release status
 * @route   PUT /api/recruitment/:id/exam/release
 * @access  Private (Organizer)
 */
exports.toggleExamRelease = async (req, res, next) => {
    try {
        const exam = await Exam.findOne({ recruitmentId: req.params.id });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        const { targetAudience } = req.body;

        exam.isReleased = !exam.isReleased;
        if (exam.isReleased && targetAudience && Array.isArray(targetAudience)) {
            exam.targetAudience = targetAudience;
        }

        await exam.save();

        // Notify applicants if released
        if (exam.isReleased) {
            const recruitment = await Recruitment.findById(req.params.id);
            const targetStatus = exam.targetAudience || ['Applied'];
            const applicants = await RecruitmentApplication.find({ 
                recruitmentId: req.params.id,
                status: { $in: targetStatus }
            });
            
            const userIds = applicants.map(app => app.userId);
            const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
            const users = await userService.getUsersByIds(userIds, token);

            const applicantEmails = applicants.map(app => {
                const user = users[app.userId.toString()];
                return app.userEmail || (user ? user.email : null);
            }).filter(Boolean);

            if (applicantEmails.length > 0) {
                setImmediate(() => {
                    emailService.sendRecruitmentUpdate(
                        applicantEmails,
                        `Exam Released: ${recruitment.title}`,
                        'Online Exam is Now Live!',
                        `The online exam for <strong>${recruitment.title}</strong> has been released and is now active.<br><br><strong>Duration:</strong> ${exam.duration} minutes<br>Please complete the exam before the link is retracted.`,
                        `${process.env.CLIENT_URL}/recruitment/attempt-exam/${recruitment._id}`,
                        'Start Exam Now'
                    );
                });
            }
        }

        res.status(200).json({
            success: true,
            data: exam,
            message: `Exam ${exam.isReleased ? 'released' : 'retracted'} successfully`
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Apply for recruitment or express interest
 * @route   POST /api/recruitment/:id/apply
 * @access  Private
 */
exports.applyRecruitment = async (req, res, next) => {
    try {
        const recruitment = await Recruitment.findById(req.params.id);
        console.log("recruitment ", recruitment)
        if (!recruitment) {
            return res.status(404).json({ success: false, message: 'Recruitment not found' });
        }

        if (recruitment.deadline && new Date() > new Date(recruitment.deadline)) {
            return res.status(400).json({ success: false, message: 'Registration has been closed for this drive as the deadline has passed.' });
        }

        let application = await RecruitmentApplication.findOne({
            recruitmentId: req.params.id,
            userId: req.user.id
        });

        if (application) {
            return res.status(400).json({ success: false, message: 'Already applied' });
        }
        console.log("Body", req.body);

        application = await RecruitmentApplication.create({
            recruitmentId: req.params.id,
            userId: req.user.id,
            userName: req.body.name || (req.user.firstName ? `${req.user.firstName} ${req.user.lastName}` : 'Unknown User'),
            userEmail: req.body.email || req.user.email,
            userMobile: req.body.mobile || '',
            branch: req.body.branch || '',
            year: req.body.year || '',
            status: req.body.status || 'Applied'
        });

        // // Send confirmation email to user
        setImmediate(() => {
            emailService.sendRecruitmentUpdate(
                req.user.email,
                `Application Received: ${recruitment.title}`,
                'Application Successful',
                `Hello ${req.user.firstName}, your application for <strong>${recruitment.title}</strong> has been received successfully. We will notify you about the next steps.`,
                `${process.env.CLIENT_URL}/dashboard`,
                'View Dashboard'
            );
        });

        res.status(201).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create/Update Exam for recruitment
 * @route   POST /api/recruitment/:id/exam
 * @access  Private (Organizer)
 */
exports.setupExam = async (req, res, next) => {
    try {
        let exam = await Exam.findOne({ recruitmentId: req.params.id });

        if (exam) {
            exam = await Exam.findOneAndUpdate(
                { recruitmentId: req.params.id },
                req.body,
                { new: true, runValidators: true }
            );
        } else {
            exam = await Exam.create({
                ...req.body,
                recruitmentId: req.params.id
            });
        }

        // Notify applicants about the exam
        const recruitment = await Recruitment.findById(req.params.id);
        const applicants = await RecruitmentApplication.find({ recruitmentId: req.params.id });
        
        const userIds = applicants.map(app => app.userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const users = await userService.getUsersByIds(userIds, token);

        const applicantEmails = applicants.map(app => {
            const user = users[app.userId.toString()];
            return app.userEmail || (user ? user.email : null);
        }).filter(Boolean);

        if (applicantEmails.length > 0) {
            setImmediate(() => {
                emailService.sendRecruitmentUpdate(
                    applicantEmails,
                    `Exam Details: ${recruitment.title}`,
                    'Online Exam Scheduled',
                    `The online exam for <strong>${recruitment.title}</strong> has been scheduled.<br><br><strong>Date:</strong> ${new Date(exam.date).toLocaleDateString()}<br><strong>Time:</strong> ${exam.time}<br><strong>Duration:</strong> ${exam.duration} minutes`,
                    `${process.env.CLIENT_URL}/recruitment/attempt-exam/${recruitment._id}`,
                    'Launch Exam'
                );
            });
        }

        res.status(200).json({
            success: true,
            data: exam
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Submit exam responses and auto-evaluate
 * @route   POST /api/recruitment/:id/submit-exam
 * @access  Private
 */
exports.submitExam = async (req, res, next) => {
    try {
        const exam = await Exam.findOne({ recruitmentId: req.params.id });
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const { responses } = req.body;
        let totalMarks = 0;
        const evaluatedResponses = exam.questions.map((q, index) => {
            const userAns = responses.find(r => r.questionIndex === index)?.answer || '';
            let isCorrect = false;
            let marks = 0;

            if (q.type === 'Paragraph') {
                isCorrect = null; // Needs manual evaluation
                marks = 0; // Granted later
            } else {
                isCorrect = userAns === q.correctAnswer;
                marks = isCorrect ? q.marks : 0;
                totalMarks += marks;
            }

            return {
                questionIndex: index,
                answer: userAns,
                isCorrect,
                marksObtained: marks
            };
        });

        const application = await RecruitmentApplication.findOneAndUpdate(
            { recruitmentId: req.params.id, userId: req.user.id },
            {
                examResponses: evaluatedResponses,
                totalMarks,
                status: 'Exam Attempted'
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            data: application
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Manually evaluate subjective/paragraph exam responses
 * @route   POST /api/recruitment/:id/evaluate-paper/:appId
 * @access  Private (Organizer/Admin)
 */
exports.evaluatePaper = async (req, res, next) => {
    try {
        const { manualMarks } = req.body; // Array of { questionIndex: Number, marksObtained: Number }
        
        const application = await RecruitmentApplication.findById(req.params.appId);
        if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

        let addedMarks = 0;

        application.examResponses.forEach(response => {
            const manualGrade = manualMarks.find(m => m.questionIndex === response.questionIndex);
            if (manualGrade !== undefined) {
                // Remove old marks if it was already evaluated to prevent double adding, though initially it's 0
                addedMarks += (Number(manualGrade.marksObtained) - (response.marksObtained || 0));
                response.marksObtained = Number(manualGrade.marksObtained);
                response.isCorrect = true; // Mark as evaluated
            }
        });

        application.totalMarks += addedMarks;
        await application.save();

        res.status(200).json({
            success: true,
            data: application,
            message: 'Paper evaluated successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Set cutoff and screen users
 * @route   POST /api/recruitment/:id/screen
 * @access  Private (Organizer)
 */
exports.screenUsers = async (req, res, next) => {
    try {
        const { cutoff } = req.body;

        // Update qualified
        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, totalMarks: { $gte: cutoff }, status: 'Exam Attempted' },
            { status: 'Shortlisted' }
        );

        // Notify shortlisted users
        const recruitment = await Recruitment.findById(req.params.id);
        const shortlisted = await RecruitmentApplication.find({
            recruitmentId: req.params.id,
            status: 'Shortlisted'
        });
        
        const userIds = shortlisted.map(app => app.userId);
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        const users = await userService.getUsersByIds(userIds, token);

        const shortlistedEmails = shortlisted.map(app => {
            const user = users[app.userId.toString()];
            return app.userEmail || (user ? user.email : null);
        }).filter(Boolean);

        if (shortlistedEmails.length > 0) {
            setImmediate(() => {
                emailService.sendRecruitmentUpdate(
                    shortlistedEmails,
                    `Congratulations! Shortlisted for ${recruitment.title}`,
                    'You are Shortlisted!',
                    `Congratulations! You have been shortlisted based on your exam performance for <strong>${recruitment.title}</strong>.<br><br>We will notify you soon regarding the final interview/selection process.`,
                    `${process.env.CLIENT_URL}/dashboard`,
                    'View My Status'
                );
            });
        }

        // Update rejected
        const rejected = await RecruitmentApplication.find({ recruitmentId: req.params.id, totalMarks: { $lt: cutoff }, status: 'Exam Attempted' });
        
        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, totalMarks: { $lt: cutoff }, status: 'Exam Attempted' },
            { status: 'Rejected' }
        );

        const rejectedUserIds = rejected.map(app => app.userId);
        const rejectedUsers = await userService.getUsersByIds(rejectedUserIds, token);
        const rejectedEmails = rejected.map(app => {
            const user = rejectedUsers[app.userId.toString()];
            return app.userEmail || (user ? user.email : null);
        }).filter(Boolean);

        if (rejectedEmails.length > 0) {
            setImmediate(() => {
                emailService.sendRecruitmentUpdate(
                    rejectedEmails,
                    `Update regarding ${recruitment.title}`,
                    'Application Status: Not Shortlisted',
                    `We appreciate your interest and the time you took to apply for <strong>${recruitment.title}</strong>. Unfortunately, after carefully reviewing the exam results, we are unable to advance you to the next stage at this time.<br><br>We encourage you to apply for future opportunities with us.`,
                    `${process.env.CLIENT_URL}/dashboard`,
                    'View My Status'
                );
            });
        }

        res.status(200).json({
            success: true,
            message: 'Screening completed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Final selection and send emails
 * @route   POST /api/recruitment/:id/finalize
 * @access  Private (Organizer)
 */
exports.finalizeSelection = async (req, res, next) => {
    try {
        const { selectedUserIds, venue, date, time, offlineNote, selectionType, assignedPosition } = req.body;

        const recruitment = await Recruitment.findById(req.params.id);
        const club = await Club.findById(recruitment.clubId);
        const clubLogo = club ? club.logo : '';
        
        const finalStatus = selectionType === 'shortlist' ? 'Shortlisted' : 'Selected';

        // Update selected users
        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, userId: { $in: selectedUserIds } },
            {
                status: finalStatus,
                selectionDetails: { venue, date, time, offlineNote, assignedPosition }
            }
        );

        if (selectionType !== 'shortlist' && club) {
            try {
                const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
                const usersData = await userService.getUsersByIds(selectedUserIds, token);
                let clubUpdated = false;
                if (!club.members) club.members = [];
                
                const axios = require('axios');
                const { getUsersByIds } = require('../services/userService');
                const mongoose = require('mongoose');
                const usersCollection = mongoose.connection.collection('users');

                for (const uid of selectedUserIds) {
                    const user = usersData[uid.toString()];
                    if (user) {
                        const designation = assignedPosition || recruitment.title || 'Member';
                        const existingIdx = club.members.findIndex(m => m.email === user.email);
                        
                        if (existingIdx === -1) {
                            club.members.push({
                                userId: user._id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                email: user.email,
                                designation: designation,
                                photo: user.photo || ''
                            });
                            clubUpdated = true;
                        } else {
                            club.members[existingIdx].designation = designation;
                            clubUpdated = true;
                        }

                        // Sync to User DB
                        try {
                            await usersCollection.updateOne(
                                { email: user.email },
                                { $set: { clubDesignation: designation } }
                            );
                        } catch (dbErr) {
                            console.error('Failed to sync to user db', dbErr);
                        }
                    }
                }
                if (clubUpdated) await club.save();
            } catch (err) {
                console.error('Error syncing members to club:', err);
            }
        }

        // Update newly rejected users (those who were Shortlisted OR Selected but are no longer in selectedUserIds)
        // This handles re-finalization where an organizer unchecks someone
        const newlyRejected = await RecruitmentApplication.find({ 
            recruitmentId: req.params.id, 
            userId: { $nin: selectedUserIds }, 
            status: { $in: ['Shortlisted', 'Selected'] } 
        });

        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, userId: { $nin: selectedUserIds }, status: { $in: ['Shortlisted', 'Selected'] } },
            { status: 'Rejected' }
        );

        // Notify newly rejected users
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        if (newlyRejected.length > 0) {
            const rejUserIds = newlyRejected.map(app => app.userId);
            const rejUsersData = await userService.getUsersByIds(rejUserIds, token);
            const rejectedEmails = newlyRejected.map(app => {
                const user = rejUsersData[app.userId.toString()];
                return app.userEmail || (user ? user.email : null);
            }).filter(Boolean);

            if (rejectedEmails.length > 0) {
                setImmediate(() => {
                    emailService.sendRecruitmentUpdate(
                        rejectedEmails,
                        `Update regarding ${recruitment.title} Selection`,
                        'Application Status',
                        `We appreciate your interest in the <strong>${recruitment.title}</strong> role at <strong>${recruitment.clubName}</strong>. Following the review, we regret to inform you that you have not been selected for the next phase.<br><br>Keep honing your skills and best of luck for future opportunities!`,
                        `${process.env.CLIENT_URL}/dashboard`,
                        'View Dashboard',
                        clubLogo,
                        recruitment.clubName
                    );
                });
            }
        }

        // Notify selected users
        const { emailUserIds } = req.body;
        // Default to all selectedUserIds if emailUserIds is not provided
        const usersToEmail = Array.isArray(emailUserIds) ? emailUserIds : selectedUserIds;
        
        const selectedApplications = await RecruitmentApplication.find({
            recruitmentId: req.params.id,
            userId: { $in: usersToEmail }
        });
        
        if (selectedApplications.length > 0) {
            const selUserIds = selectedApplications.map(app => app.userId);
            const selUsersData = await userService.getUsersByIds(selUserIds, token);
            const selectedEmails = selectedApplications.map(app => {
                const user = selUsersData[app.userId.toString()];
                return app.userEmail || (user ? user.email : null);
            }).filter(Boolean);

            if (selectedEmails.length > 0) {
                const customNoteHtml = offlineNote ? `<br><br><div style="background:#f4f4f5;padding:15px;border-left:4px solid #4f46e5;border-radius:5px;"><strong>Note from Organizer:</strong><br>${offlineNote.replace(/\n/g, '<br>')}</div>` : '';
                
                if (selectionType === 'shortlist') {
                    const emailSubject = `Update: Shortlisted for ${recruitment.title} Next Round`;
                    const emailTitle = 'You are Shortlisted!';
                    const emailBody = `Congratulations! You have been shortlisted for the next round for the role at <strong>${recruitment.clubName}</strong>.<br><br><strong>Next Round Venue:</strong> ${venue}<br><strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br><strong>Time:</strong> ${time}${customNoteHtml}`;
                    
                    setImmediate(() => {
                        emailService.sendRecruitmentUpdate(
                            selectedEmails,
                            emailSubject,
                            emailTitle,
                            emailBody,
                            `${process.env.CLIENT_URL}/dashboard`,
                            'View My Status',
                            clubLogo,
                            recruitment.clubName
                        );
                    });
                } else {
                    // Final Selection - use personalized congrats email
                    setImmediate(() => {
                        selectedApplications.forEach(app => {
                            const user = selUsersData[app.userId.toString()];
                            const email = app.userEmail || (user ? user.email : null);
                            
                            if (email) {
                                const name = user ? `${user.firstName} ${user.lastName}` : 'Student';
                                const role = assignedPosition || recruitment.title;
                                
                                // Incorporate venue/date/time into the note if provided
                                let finalNote = offlineNote || '';
                                if (venue && date && time) {
                                    const meetingDetails = `Meeting Venue: ${venue}\nDate: ${new Date(date).toLocaleDateString()}\nTime: ${time}`;
                                    finalNote = finalNote ? `${meetingDetails}\n\n${finalNote}` : meetingDetails;
                                }

                                emailService.sendCongratsEmail(
                                    email,
                                    name,
                                    role,
                                    recruitment.clubName,
                                    clubLogo,
                                    `${process.env.CLIENT_URL}/dashboard`,
                                    finalNote
                                );
                            }
                        });
                    });
                }
            }
        }

        // Keep recruitment active until closed manually, or close it automatically? The instruction says re-finalizing should be possible. 
        // We shouldn't auto close here, let the user close it, BUT the original code did auto-close.
        // Wait, original code: await Recruitment.findByIdAndUpdate(req.params.id, { status: 'Completed' });
        // The project has a Close button for Recruitment. But for now I'll just keep the original behavior or modify it to stay active.
        // Let's NOT auto-close it here, so they can update lists continuously until THEY choose to click "Close Registration Drive". 
        // BUT actually original code auto-set to 'Completed', meaning the recruitment itself ended. That's fine. Wait, if it's completed they can't re-finalize?
        // Let's check ManageRecruitments. You can't see the finalize button if it's completed? I'll remove the auto-close.
        // Let's just remove the auto update to Completed so they can keep editing it!

        res.status(200).json({
            success: true,
            message: 'Selection finalized and emails sent'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete Exam
 * @route   DELETE /api/recruitment/:id/exam
 * @access  Private (Organizer)
 */
exports.deleteExam = async (req, res, next) => {
    try {
        const exam = await Exam.findOneAndDelete({ recruitmentId: req.params.id });

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Exam deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
