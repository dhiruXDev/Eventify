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
            from: `"Eventify Recruitment" <${process.env.EMAIL_USER}>`,
            to: emails.join(','),
            subject: `New Recruitment Alert: ${recruitment.title} by ${clubName}`,
            html: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Recruitment Drive!</title>
                <style>
                    body {
                        background-color: #f0fdf4;
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        font-size: 16px;
                        line-height: 1.6;
                        color: #333333;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        margin-top: 20px;
                        margin-bottom: 20px;
                    }
                    .header {
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        padding: 30px 20px;
                        text-align: center;
                        border-radius: 10px 10px 0 0;
                        margin: -20px -20px 20px -20px;
                    }
                    .header h1 {
                        color: #ffffff;
                        font-size: 28px;
                        margin: 0;
                        font-weight: bold;
                    }
                    .header p {
                        color: #d1fae5;
                        margin: 5px 0 0 0;
                        font-size: 14px;
                    }
                    .welcome-icon {
                        text-align: center;
                        font-size: 64px;
                        margin: 20px 0;
                    }
                    .message-title {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 20px;
                        color: #059669;
                        text-align: center;
                    }
                    .body-content {
                        font-size: 16px;
                        margin-bottom: 20px;
                        text-align: left;
                        color: #374151;
                    }
                    .details-box {
                        background-color: #f0fdf4;
                        border: 2px solid #10b981;
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                    }
                    .cta {
                        display: inline-block;
                        padding: 14px 28px;
                        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 8px;
                        font-size: 16px;
                        font-weight: bold;
                        margin: 20px 0;
                        transition: transform 0.2s, box-shadow 0.2s;
                        box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);
                    }
                    .cta-container {
                        text-align: center;
                        margin: 30px 0;
                    }
                    .footer {
                        background-color: #f9fafb;
                        padding: 20px;
                        text-align: center;
                        border-radius: 0 0 10px 10px;
                        margin: 20px -20px -20px -20px;
                        color: #6b7280;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 New Recruitment Drive</h1>
                        <p>Eventify • College Event Management System</p>
                    </div>
                    
                    <div class="welcome-icon">📣</div>
                    
                    <div class="message-title">Join ${clubName}!</div>
                    
                    <div class="body-content">
                        <p>Hello Student,</p>
                        <p><strong>${clubName}</strong> has just announced a new recruitment drive for the role of <strong>${recruitment.role}</strong>.</p>
                        
                        <div class="details-box">
                            <p style="margin: 5px 0;"><strong>Title:</strong> ${recruitment.title}</p>
                            <p style="margin: 5px 0;"><strong>Mode:</strong> ${recruitment.mode}</p>
                            <p style="margin: 5px 0;"><strong>Deadline:</strong> ${new Date(recruitment.deadline).toLocaleDateString()}</p>
                            <p style="margin: 5px 0; padding-top: 10px; border-top: 1px solid #d1fae5;"><strong>Description:</strong> ${recruitment.description}</p>
                        </div>
                        
                        <p style="text-align: center;">Click below to view details and apply:</p>
                        
                        <div class="cta-container">
                            <a class="cta" href="${process.env.CLIENT_URL}/recruitment/${recruitment._id}">Apply Now</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated notification from the Eventify Portal.</p>
                        <p>© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`
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
exports.sendRecruitmentUpdate = async (emails, subject, title, message, actionUrl, actionLabel, clubLogoUrl) => {
    if (!emails || emails.length === 0) return;

    const logoUrl = clubLogoUrl || process.env.LOGO_URL || 'https://eventify.vercel.app/NavbarLogo.png';

    try {
        const mailOptions = {
            from: `"Eventify Recruitment" <${process.env.EMAIL_USER}>`,
            to: Array.isArray(emails) ? emails.join(',') : emails,
            subject: subject,
            html: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${title}</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
                <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); overflow: hidden;">
                    
                    <div style="background-color: #4f46e5; padding: 25px 20px; text-align: center;">
                        <div style="background-color: #ffffff; border-radius: 8px; padding: 8px; display: inline-block; margin-bottom: 15px;">
                            <img src="${logoUrl}" alt="Logo" style="max-width: 100px; max-height: 60px; display: block; object-fit: contain;" />
                        </div>
                        <h1 style="color: #ffffff; font-size: 22px; margin: 0; font-weight: 600;">Eventify Update</h1>
                    </div>
                    
                    <div style="padding: 30px;">
                        <h2 style="color: #4f46e5; font-size: 20px; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${title}</h2>
                        
                        <div style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 25px;">
                            ${message}
                        </div>
                        
                        ${actionUrl ? `
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${actionUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 15px; font-weight: 600;">${actionLabel || 'View Details'}</a>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
                        <p style="margin: 0 0 10px 0;">This is an automated notification from the Eventify Portal.</p>
                        <p style="margin: 0;">© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Email update failed:', error.message);
    }
};

/**
 * Send Congrats Email using User Template
 */
exports.sendCongratsEmail = async (
  email,
  name,
  role,
  clubName,
  clubLogoUrl,
  actionUrl,
  offlineNote=''
) => {
  if (!email) return;

  const logoUrl =
    clubLogoUrl ||
    process.env.LOGO_URL ||
    "https://eventify.vercel.app/NavbarLogo.png";

  try {
    // ✅ Build dynamic sections separately
    const noteSection = offlineNote
      ? `
      <div style="background:#f0fdf4; padding:20px; border-left:4px solid #16a34a; border-radius:5px; margin: 25px 0;">
        <strong style="color: #16a34a;">Note from Organizer:</strong><br/>
        <p style="font-size: 15px; display: inline-block; margin-top: 5px;"> You are requested to attend the onboarding meeting as per the details below:</p>
        <span style="font-size: 15px; display: inline-block; margin-top: 5px;">
          ${offlineNote.replace(/\n/g, "<br>")}
        </span>
      </div>
    `
      : "";

    const actionButton = actionUrl
      ? `
      <div style="text-align: center; margin: 35px 0;">
        <a href="${actionUrl}" style="display: inline-block; padding: 14px 28px; background: #16a34a; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
          View Dashboard
        </a>
      </div>
    `
      : "";

    const mailOptions = {
      from: `"Eventify Recruitment" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Congratulations! Final Selection for ${clubName}`,
      html: `
      <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
        
        <div style="max-width:600px; margin:auto; background:white; border-radius:10px; overflow:hidden;">
          
          <div style="background:#16a34a; color:white; padding:30px 20px; text-align:center;">
            <div style="background-color:#ffffff; border-radius:12px; padding:10px; display:inline-block; margin-bottom:15px;">
              <img src="${logoUrl}" style="max-width:120px; max-height:80px;" />
            </div>
            <h1>🎉 Congratulations!</h1>
            <p>You’re Selected in ${clubName}</p>
          </div>

          <div style="padding:30px; color:#333;">
            <h2 style="color:#16a34a;">Welcome Aboard! 🎓</h2>

            <p>Dear <strong>${name}</strong>,</p>

            <p>
              You have been selected as <strong>${role}</strong> in 
              <strong>${clubName}</strong>.
            </p>

            <p>Your performance truly stood out, and we’re excited to have you.</p>

            ${noteSection}

            <p>Once again, congratulations! 🚀</p>

            ${actionButton}

            <p>
              Best Regards,<br/>
              <strong>Team Eventify</strong>
            </p>
          </div>

        </div>
      </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Email congrats failed:", error);
  }
};