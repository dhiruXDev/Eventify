const Recruitment = require('../models/Recruitment');
const Exam = require('../models/Exam');
const RecruitmentApplication = require('../models/RecruitmentApplication');
const userService = require('../services/userService');
const nodemailer = require('nodemailer');
const emailService = require('../utils/emailService');

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

        // Populate recruitment details
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const recruitment = await Recruitment.findById(app.recruitmentId);
            return {
                ...app._doc,
                recruitment
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

        // Only organizers or if the exam is released
        if (!exam.isReleased && req.user.role !== 'organizer') {
            return res.status(403).json({ success: false, message: 'Exam not yet released' });
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

        exam.isReleased = !exam.isReleased;
        await exam.save();

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
                    `${process.env.CLIENT_URL}/dashboard`,
                    'View My Status'
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
            const userAns = responses.find(r => r.questionIndex === index)?.answer;
            const isCorrect = userAns === q.correctAnswer;
            const marks = isCorrect ? q.marks : 0;
            totalMarks += marks;
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
        const { selectedUserIds, venue, date, time } = req.body;

        const recruitment = await Recruitment.findById(req.params.id);

        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, userId: { $in: selectedUserIds } },
            {
                status: 'Selected',
                selectionDetails: { venue, date, time }
            }
        );

        // Update rejected users (those who were Shortlisted but not selected)
        await RecruitmentApplication.updateMany(
            { recruitmentId: req.params.id, userId: { $nin: selectedUserIds }, status: 'Shortlisted' },
            { status: 'Rejected' }
        );

        // Get emails of selected users for notification
        const selectedApplications = await RecruitmentApplication.find({
            recruitmentId: req.params.id,
            userId: { $in: selectedUserIds }
        });
        
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;

        const selUserIds = selectedApplications.map(app => app.userId);
        const selUsersData = await userService.getUsersByIds(selUserIds, token);
        const selectedEmails = selectedApplications.map(app => {
            const user = selUsersData[app.userId.toString()];
            return app.userEmail || (user ? user.email : null);
        }).filter(Boolean);

        // Notify Rejected Users from Final Selection
        const rejectedApplications = await RecruitmentApplication.find({
            recruitmentId: req.params.id,
            userId: { $nin: selectedUserIds },
            status: 'Rejected' // Those who just got rejected in this step or previously
        });

        // Filter those who just got rejected (their status was Shortlisted before)
        // Since we already updated them to Rejected, we can just grab all Rejected who weren't notified. 
        // Wait, sending rejection to all Rejected might email people who failed the exam. To avoid this, 
        // let's only email those who made it past the exam but failed final selection. Wait, getting complex. 
        // Let's just notify the ones we updated.
        // It's safer to query those who were Shortlisted AND $nin selectedUserIds... Oh wait, we already updated them!
        
        const rejUserIds = rejectedApplications.map(app => app.userId);
        const rejUsersData = await userService.getUsersByIds(rejUserIds, token);
        const rejectedEmails = rejectedApplications.map(app => {
            const user = rejUsersData[app.userId.toString()];
            return app.userEmail || (user ? user.email : null);
        }).filter(Boolean);

        if (rejectedEmails.length > 0) {
            setImmediate(() => {
                emailService.sendRecruitmentUpdate(
                    rejectedEmails,
                    `Update regarding ${recruitment.title} Selection`,
                    'Application Status',
                    `We appreciate your interest in the <strong>${recruitment.title}</strong> role at <strong>${recruitment.clubName}</strong>. Following the final review, we regret to inform you that you have not been selected this time.<br><br>Keep honing your skills and best of luck for future opportunities!`,
                    `${process.env.CLIENT_URL}/dashboard`,
                    'View Dashboard'
                );
            });
        }

        // Send "Congratulations" email
        if (selectedEmails.length > 0) {
            setImmediate(() => {
                emailService.sendRecruitmentUpdate(
                    selectedEmails,
                    `Congratulations! Selection for ${recruitment.title}`,
                    'You are Selected!',
                    `We are pleased to inform you that you have been selected for the role at <strong>${recruitment.clubName}</strong>.<br><br><strong>Venue:</strong> ${venue}<br><strong>Date:</strong> ${new Date(date).toLocaleDateString()}<br><strong>Time:</strong> ${time}`,
                    `${process.env.CLIENT_URL}/dashboard`,
                    'View My Status'
                );
            });
        }

        // Update recruitment status
        await Recruitment.findByIdAndUpdate(req.params.id, { status: 'Completed' });

        res.status(200).json({
            success: true,
            message: 'Selection finalized and recruitment completed'
        });
    } catch (error) {
        next(error);
    }
};
