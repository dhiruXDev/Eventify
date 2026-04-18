const nodemailer = require('nodemailer');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Generate internal admin token to call other services
 */
const generateInternalToken = () => {
    return jwt.sign(
        { id: 'internal-admin', role: 'admin' },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

/**
 * Fetch all user emails from auth-service
 */
const getAllUserEmails = async () => {
    try {
        const token = generateInternalToken();
        const response = await axios.get('http://localhost:8001/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.success) {
            return response.data.data.map(user => user.email);
        }
        return [];
    } catch (error) {
        console.error('Failed to fetch user emails:', error.message);
        return [];
    }
};

/**
 * Send recruitment announcement to all users
 */
exports.sendRecruitmentAnnouncement = async (recruitment, clubName) => {
    try {
        const emails = await getAllUserEmails();
        if (emails.length === 0) return;

        const mailOptions = {
            from: `"Recruitment Portal" <${process.env.EMAIL_USER}>`,
            to: emails.join(','),
            subject: `New Recruitment Alert: ${recruitment.title} by ${clubName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #4f46e5;">New Recruitment Drive!</h2>
                    <p>Hello Student,</p>
                    <p><strong>${clubName}</strong> has just announced a new recruitment drive for the role of <strong>${recruitment.role}</strong>.</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Title:</strong> ${recruitment.title}</p>
                        <p><strong>Mode:</strong> ${recruitment.mode}</p>
                        <p><strong>Deadline:</strong> ${new Date(recruitment.deadline).toLocaleDateString()}</p>
                        <p><strong>Description:</strong> ${recruitment.description}</p>
                    </div>
                    <p>Click below to view details and apply:</p>
                    <a href="${process.env.CLIENT_URL}/recruitment/${recruitment._id}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">Apply Now</a>
                    <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">This is an automated notification from the University Event Management Portal.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Annoucement sent to ${emails.length} users`);
    } catch (error) {
        console.error('Email sending failed:', error.message);
    }
};

/**
 * Send email to specific users (interested/shortlisted)
 */
exports.sendRecruitmentUpdate = async (emails, subject, title, message, actionUrl, actionLabel) => {
    if (!emails || emails.length === 0) return;

    try {
        const mailOptions = {
            from: `"Recruitment Portal" <${process.env.EMAIL_USER}>`,
            to: Array.isArray(emails) ? emails.join(',') : emails,
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
                    <h2 style="color: #4f46e5;">${title}</h2>
                    <p>${message}</p>
                    ${actionUrl ? `
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${actionUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold;">${actionLabel || 'View Details'}</a>
                        </div>
                    ` : ''}
                    <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">This is an automated notification from the University Event Management Portal.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email update failed:', error.message);
    }
};
