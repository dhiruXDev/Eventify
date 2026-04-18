const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Email template for account creation confirmation
 * @param {Object} user - User object with firstName, lastName, email, college, role
 * @returns {String} HTML email template
 */
const ConfirmationMailAccountCreation = (user) => {
    const userName = `${user.firstName} ${user.lastName}`.trim() || user.email;
    const userRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Participant';
    
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Eventify - Account Created</title>
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
            
            .logo {
                max-width: 150px;
                margin-bottom: 15px;
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
            
            .message {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 20px;
                color: #059669;
                text-align: center;
            }
            
            .body {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: left;
                color: #374151;
            }
            
            .welcome-icon {
                text-align: center;
                font-size: 64px;
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
            
            .cta:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(16, 185, 129, 0.4);
            }
            
            .cta-container {
                text-align: center;
                margin: 30px 0;
            }
            
            .support {
                font-size: 14px;
                color: #6b7280;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
            }
            
            .highlight {
                font-weight: bold;
                color: #059669;
            }
            
            .account-details {
                background-color: #f0fdf4;
                border: 2px solid #10b981;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            
            .account-details h3 {
                color: #059669;
                margin-top: 0;
                font-size: 18px;
                border-bottom: 2px solid #10b981;
                padding-bottom: 10px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #d1fae5;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: #374151;
            }
            
            .detail-value {
                color: #059669;
                font-weight: 500;
            }
            
            .role-badge {
                display: inline-block;
                padding: 6px 14px;
                background-color: #d1fae5;
                color: #059669;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                text-transform: capitalize;
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
            
            .footer a {
                color: #10b981;
                text-decoration: none;
            }
            
        </style>
    </head>
    
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to Eventify!</h1>
                <p>College Event Management System</p>
            </div>
            
            <div class="welcome-icon">✨</div>
            
            <div class="message">Account Successfully Created!</div>
            
            <div class="body">
                <p>Dear <span class="highlight">${userName}</span>,</p>
                
                <p>We're thrilled to welcome you to <strong>Eventify</strong> - your gateway to exciting college events and competitions!</p>
                
                <p>Your account has been successfully created. You can now explore events, register for competitions, track your progress, and connect with your college community.</p>
                
                <div class="account-details">
                    <h3>Your Account Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${userName}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Email:</span>
                        <span class="detail-value">${user.email}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">College:</span>
                        <span class="detail-value">${user.college || 'Not specified'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Account Type:</span>
                        <span class="detail-value"><span class="role-badge">${userRole}</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Account Created:</span>
                        <span class="detail-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul style="color: #374151; line-height: 1.8;">
                    <li>Browse upcoming events and competitions</li>
                    <li>Register for events that interest you</li>
                    <li>Track your participation and achievements</li>
                    <li>Connect with other participants and organizers</li>
                    ${user.role === 'organizer' ? '<li>Create and manage your own events</li>' : ''}
                    ${user.role === 'admin' ? '<li>Access admin dashboard for platform management</li>' : ''}
                </ul>
                
                <div class="cta-container">
                    <a class="cta" href="${BASE_URL}/login">Get Started Now</a>
                </div>
                
                <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                    <strong>Need Help?</strong><br>
                    If you have any questions or need assistance, our support team is here to help. 
                    Feel free to reach out to us anytime!
                </p>
            </div>
            
            <div class="support">
                <p>Happy Event Managing! 🎊</p>
                <p style="margin-top: 10px;">
                    Best regards,<br>
                    <strong>The Eventify Team</strong>
                </p>
            </div>
            
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
                <p>© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
                <p>
                    <a href="${BASE_URL}">Visit our website</a> | 
                    <a href="${BASE_URL}/about">About Us</a> | 
                    <a href="mailto:support@eventify.com">Contact Support</a>
                </p>
            </div>
        </div>
    </body>
    
    </html>`;
};

/**
 * Email template for password reset
 * @param {Object} options - Options object with message and resetUrl
 * @returns {String} HTML email template
 */
const PasswordResetEmailTemplate = (options) => {
    // Use cid if logo is attached, otherwise use URL
        const logoUrl = options.logoUrl || process.env.LOGO_URL || 'https://eventify.vercel.app/NavbarLogo.png';
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - Eventify</title>
        <style>
            body {
                background-color: #f4f4f7;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                font-size: 16px;
                line-height: 1.6;
                color: #333333;
                margin: 0;
                padding: 0;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                padding: 40px 20px;
                text-align: center;
            }
            
            .logo-container {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 15px;
                display: inline-block;
                margin-bottom: 20px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            
            .logo {
                max-width: 180px;
                height: auto;
                display: block;
            }
            
            .header-title {
                color: #ffffff;
                font-size: 28px;
                font-weight: bold;
                margin: 15px 0 5px 0;
            }
            
            .header-subtitle {
                color: #dbeafe;
                font-size: 14px;
                margin: 0;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .title {
                font-size: 24px;
                font-weight: bold;
                color: #1f2937;
                margin: 0 0 20px 0;
                text-align: center;
            }
            
            .message {
                font-size: 16px;
                color: #374151;
                line-height: 1.8;
                margin: 20px 0;
            }
            
            .greeting {
                font-size: 16px;
                color: #374151;
                margin-bottom: 20px;
            }
            
            .cta-container {
                text-align: center;
                margin: 40px 0;
            }
            
            .cta-button {
                display: inline-block;
                padding: 16px 32px;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
            }
            
            .info-box {
                background-color: #f0fdf4;
                border-left: 4px solid #10b981;
                padding: 15px 20px;
                margin: 30px 0;
                border-radius: 4px;
            }
            
            .info-box p {
                margin: 5px 0;
                font-size: 14px;
                color: #059669;
            }
            
            .warning {
                font-size: 13px;
                color: #6b7280;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer {
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
                font-size: 14px;
                color: #6b7280;
                margin: 10px 0;
            }
            
            .footer-links {
                margin-top: 15px;
            }
            
            .footer-links a {
                color: #3b82f6;
                text-decoration: none;
                margin: 0 10px;
                font-size: 13px;
            }
            
            .footer-links a:hover {
                text-decoration: underline;
            }
            
            .support-section {
                background-color: #f9fafb;
                padding: 20px;
                margin: 30px 0;
                border-radius: 8px;
                text-align: center;
            }
            
            .support-section p {
                font-size: 14px;
                color: #6b7280;
                margin: 5px 0;
            }
            
            .support-section a {
                color: #3b82f6;
                text-decoration: none;
            }
        </style>
    </head>
    
    <body>
        <div style="padding: 40px 20px;">
            <div class="email-container">
                <!-- Header with Logo -->
                <div class="header">
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="Univent Logo" class="logo" />
                    </div>
                    <h1 class="header-title">Password Reset Request</h1>
                    <p class="header-subtitle">Eventify • College Event Management System</p>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <h2 class="title">Reset Your Password</h2>
                    
                    <p class="greeting">Hello,</p>
                    
                    <p class="message">
                        ${options.message || 'You have requested to reset your password for your Eventify account. Click the button below to create a new password.'}
                    </p>
                    
                    <div class="info-box">
                        <p><strong>⏰ Important:</strong> This password reset link will expire in 30 minutes for security reasons.</p>
                    </div>
                    
                    <div class="cta-container">
                        <a href="${options.resetUrl}" class="cta-button">Reset Password</a>
                    </div>
                    
                    <p class="warning">
                        <strong>Didn't request this?</strong><br>
                        If you didn't request a password reset, please ignore this email. Your password will remain unchanged. 
                        If you're concerned about your account security, please contact our support team immediately.
                    </p>
                    
                    <div class="support-section">
                        <p><strong>Need Help?</strong></p>
                        <p>If you have any questions or need assistance, please feel free to reach out to us.</p>
                        <p>
                            <a href="mailto:support@eventify.com">support@eventify.com</a>
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p class="footer-text">
                        <strong>Eventify</strong><br>
                        College Event Management System
                    </p>
                    <p class="footer-text">
                        This is an automated email. Please do not reply to this message.
                    </p>
                    <div class="footer-links">
                        <a href="${frontendUrl}">Visit Website</a>
                        <a href="${frontendUrl}/about">About Us</a>
                        <a href="mailto:support@eventify.com">Contact Support</a>
                    </div>
                    <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                        © ${new Date().getFullYear()} Eventify. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    </body>
    
    </html>`;
};

/**
 * Email template for event/announcement notification
 * @param {Object} options - Options object with event/announcement details
 * @returns {String} HTML email template
 */
const EventNotificationEmailTemplate = (options) => {
    const logoUrl = options.logoUrl || process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const isEvent = options.type === 'event';
    const title = isEvent ? 'New Event Available!' : 'New Announcement Published!';
    const itemTitle = options.title || 'Untitled';
    const itemDescription = options.description || '';
    const clubName = options.clubName || 'Your Club';
    const itemDate = options.date ? new Date(options.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Eventify</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');
            
            body { background-color: #f3f4f6; font-family: 'Lato', 'Segoe UI', sans-serif; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
            
            .email-wrapper { padding: 40px 10px; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow: hidden; }
            
            /* Header Styling */
            .header { 
                background-color: #064e3b; /* Deep Emerald */
                background-image: linear-gradient(135deg, #064e3b 0%, #042f24 100%);
                padding: 30px 20px; 
                text-align: center; 
                border-bottom: 4px solid #d4af37; /* Gold Accent */
            }
            
            .logo-container { 
                background-color: rgba(255, 255, 255, 0.1); 
                border-radius: 50%; 
                padding: 15px; 
                display: inline-block; 
                margin-bottom: 15px; 
                backdrop-filter: blur(5px);
            }
            .logo { max-width: 60px; height: auto; display: block; }
            
            .header-title { 
                color: #ffffff; 
                font-size: 24px; 
                font-weight: 700; 
                margin: 0; 
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            /* Content Styling */
            .content { padding: 40px 30px; }
            
            .greeting { font-size: 16px; color: #6b7280; margin-bottom: 5px; }
            .notification-intro { font-size: 18px; color: #1f2937; margin: 0 0 25px 0; line-height: 1.5; }
            
            /* The Club Badge */
            .club-badge-container { text-align: center; margin-bottom: 25px; }
            .club-badge { 
                display: inline-block; 
                background-color: #ecfdf5; 
                color: #064e3b; 
                border: 1px solid #059669;
                padding: 8px 20px; 
                border-radius: 50px; 
                font-size: 14px; 
                font-weight: bold; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            /* The Main Event Card */
            .item-card { 
                background-color: #ffffff; 
                border: 1px solid #e5e7eb;
                border-left: 5px solid #d4af37; /* Gold accent border */
                border-radius: 8px; 
                padding: 25px; 
                margin: 20px 0; 
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            
            .item-type {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #9ca3af;
                font-weight: 700;
                margin-bottom: 8px;
                display: block;
            }
            .item-title { 
                font-size: 22px; 
                font-weight: 800; 
                color: #111827; 
                margin-bottom: 12px; 
                line-height: 1.3;
            }
            
            .item-description { 
                color: #4b5563; 
                font-size: 15px; 
                line-height: 1.6; 
                margin-bottom: 20px; 
            }
            
            /* Date Styling */
            .date-box {
                display: flex;
                align-items: center;
                background-color: #f8fafc;
                padding: 10px 15px;
                border-radius: 6px;
                border-left: 3px solid #064e3b;
            }
            .date-icon { font-size: 18px; margin-right: 10px; }
            .date-text { font-weight: 700; color: #064e3b; font-size: 15px; }
            /* Button */
            .cta-container { text-align: center; margin-top: 35px; }
            .cta-button { 
                display: inline-block; 
                padding: 16px 40px; 
                background-color: #064e3b; 
                color: #ffffff; 
                text-decoration: none; 
                border-radius: 6px; 
                font-size: 16px; 
                font-weight: bold; 
                transition: background-color 0.3s;
                box-shadow: 0 4px 6px rgba(6, 78, 59, 0.3);
            }
            /* Hover effect simulation for supported clients */
            .cta-button:hover { background-color: #042f24; }
            /* Footer */
            .footer { 
                background-color: #f9fafb; 
                padding: 30px; 
                text-align: center; 
                border-top: 1px solid #e5e7eb; 
                font-size: 13px; 
                color: #9ca3af; 
            }
            .footer p { margin: 5px 0; }
            .footer strong { color: #6b7280; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <div class="header">
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="Eventify" class="logo" />
                    </div>
                    <h1 class="header-title">${isEvent ? 'New Event Alert' : 'Announcement'}</h1>
                </div>
                <div class="content">
                    <div class="club-badge-container">
                        <span class="club-badge">Posted by ${clubName}</span>
                    </div>
                    <p class="greeting">Hello there,</p>
                    <p class="notification-intro">
                        Exciting news! A new ${isEvent ? 'event' : 'announcement'} has just been published on <strong>Eventify</strong>. Check out the details below:
                    </p>
                    <div class="item-card">
                        <span class="item-type">${isEvent ? 'Upcoming Event' : 'Club Update'}</span>
                        <div class="item-title">${itemTitle}</div>
                        ${itemDescription ? `<div class="item-description">${itemDescription}</div>` : ''}
                        ${itemDate ? `
                        <div class="date-box">
                            <span class="date-icon">📅</span>
                            <span class="date-text">${itemDate}</span>
                        </div>
                        ` : ''}
                    </div>
                    <div class="cta-container">
                        <a href="${frontendUrl}${options.link || (isEvent ? '/events' : '/announcements')}" class="cta-button">
                            View Full Details
                        </a>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>Eventify</strong> • College Event Management System</p>
                    <p>© ${new Date().getFullYear()} Eventify Systems. All rights reserved.</p>
                    <p style="margin-top: 10px; font-size: 11px;">You are receiving this email because you follow ${clubName}.</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
};

/**
 * Email template for Top 5 congratulations
 * @param {Object} options - Options object with user and leaderboard details
 * @returns {String} HTML email template
 */
const Top5CongratulationsEmailTemplate = (options) => {
    const logoUrl = options.logoUrl || process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const userName = options.userName || 'Student';
    const clubName = options.clubName || 'Club';
    const eventName = options.eventName || 'Event';
    const score = options.score || 0;
    const rank = options.rank || 0;
    const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '🏆';
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Congratulations! Top 5 Achievement - Eventify</title>
        <style>
            body { background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; }
            .logo-container { background-color: #ffffff; border-radius: 12px; padding: 15px; display: inline-block; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
            .logo { max-width: 180px; height: auto; display: block; }
            .header-title { color: #ffffff; font-size: 32px; font-weight: bold; margin: 15px 0; }
            .content { padding: 40px 30px; text-align: center; }
            .celebration { font-size: 64px; margin: 20px 0; }
            .title { font-size: 28px; font-weight: bold; color: #1f2937; margin: 20px 0; }
            .message { font-size: 16px; color: #374151; line-height: 1.8; margin: 20px 0; text-align: left; }
            .achievement-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin: 30px 0; }
            .rank-display { font-size: 72px; font-weight: bold; color: #d97706; margin: 10px 0; }
            .score-display { font-size: 36px; font-weight: bold; color: #059669; margin: 10px 0; }
            .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e5e7eb; }
            .info-label { font-weight: 600; color: #6b7280; }
            .info-value { font-weight: bold; color: #1f2937; }
            .cta-button { display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); margin: 20px 10px; }
            .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div style="padding: 40px 20px;">
            <div class="email-container">
                <div class="header">
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="Eventify Logo" class="logo" />
                    </div>
                    <h1 class="header-title">🎉 Congratulations! 🎉</h1>
                </div>
                <div class="content">
                    <div class="celebration">${emoji}</div>
                    <h2 class="title">You're in the Top 5!</h2>
                    <div class="achievement-box">
                        <div class="rank-display">Rank #${rank}</div>
                        <div class="score-display">Score: ${score} Points</div>
                    </div>
                    <div class="message">
                        <p>Dear <strong>${userName}</strong>,</p>
                        <p>We are thrilled to congratulate you on your outstanding performance in <strong>${eventName}</strong> organized by <strong>${clubName}</strong>!</p>
                        <p>Your achievement of securing <strong>Rank #${rank}</strong> with <strong>${score} points</strong> is truly remarkable! 🎊</p>
                        <div class="info-row">
                            <span class="info-label">Event:</span>
                            <span class="info-value">${eventName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Club:</span>
                            <span class="info-value">${clubName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Your Rank:</span>
                            <span class="info-value">#${rank}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Your Score:</span>
                            <span class="info-value">${score} Points</span>
                        </div>
                        <p style="margin-top: 30px;"><strong>Keep up the excellent work!</strong> We encourage you to participate in more events and continue showcasing your talents.</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${frontendUrl}/events" class="cta-button">Explore More Events</a>
                        <a href="${frontendUrl}/leaderboard" class="cta-button">View Leaderboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p><strong>Eventify</strong> • College Event Management System</p>
                    <p>© ${new Date().getFullYear()} Eventify. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
};

/**
 * Email template for certificate
 * @param {Object} options - Options object with certificate details
 * @returns {String} HTML email template
 */
const CertificateEmailTemplate = (options) => {
    const logoUrl = options.logoUrl || process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    const stampUrl = options.stampUrl || process.env.STAMP_URL || 'https://univento.vercel.app/VerifiedStamp.png';
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const userName = options.userName || 'Student';
    const clubName = options.clubName || 'Club';
    const eventName = options.eventName || 'Event';
    const score = options.score || 0;
    const rank = options.rank || 0;
    const eventDate = options.eventDate ? new Date(options.eventDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certificateDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
    });
    
    // Generate certificate ID
    const certificateId = `EVT-${rank}${score}`;
    
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Achievement - Eventify</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Lato:wght@300;400;700&display=swap');
            
            body { margin: 0; padding: 0; background-color: #f0f2f5; font-family: 'Lato', sans-serif; -webkit-font-smoothing: antialiased; }
            
            /* Main Container */
            .email-wrapper { padding: 40px 10px; text-align: center; }
            .certificate-container { 
                max-width: 850px; 
                margin: 0 auto; 
                background-color: #ffffff; 
                position: relative; 
                box-shadow: 0 15px 35px rgba(0,0,0,0.1); 
                border-radius: 8px;
                overflow: hidden;
            }
            /* The Decorative Border */
            .outer-border { padding: 15px; background: #fff; }
            .inner-border { 
                border: 2px solid #064e3b; /* Deep Emerald */
                padding: 40px; 
                position: relative;
                background: #fffdf5; /* Very light cream */
                border-radius: 4px;
            }
            /* Corner Accents (CSS Gold) */
            .inner-border::before, .inner-border::after {
                content: ""; position: absolute; width: 80px; height: 80px; border: 2px solid #d4af37; transition: all 0.3s;
            }
            .inner-border::before { top: 10px; left: 10px; border-right: none; border-bottom: none; }
            .inner-border::after { bottom: 10px; right: 10px; border-left: none; border-top: none; }
            /* Header */
            .header-logo { margin-bottom: 20px; }
            .logo-img { height: 60px; width: auto; }
            
            .org-name { 
                color: #064e3b; 
                font-size: 14px; 
                letter-spacing: 4px; 
                text-transform: uppercase; 
                font-weight: 700; 
                margin-bottom: 10px;
            }
            .main-title { 
                font-family: 'Cinzel', serif; 
                font-size: 48px; 
                color: #064e3b; 
                margin: 0; 
                line-height: 1;
                text-shadow: 1px 1px 0px rgba(0,0,0,0.1);
            }
            
            .sub-title { 
                font-family: 'Lato', sans-serif; 
                font-size: 18px; 
                color: #d4af37; /* Gold */
                text-transform: uppercase; 
                letter-spacing: 2px; 
                margin-top: 10px; 
                font-weight: 700;
            }
            /* Content Body */
            .presentation-text { font-size: 16px; color: #525252; margin-top: 35px; font-style: italic; }
            
            .recipient-name { 
                font-family: 'Great Vibes', cursive; 
                font-size: 64px; 
                color: #1f2937; 
                margin: 10px 0 20px 0; 
                line-height: 1.2;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.05);
            }
            .achievement-text { font-size: 18px; color: #374151; line-height: 1.6; max-width: 80%; margin: 0 auto; }
            .highlight { color: #064e3b; font-weight: 700; }
            
            /* Rank Badge */
            .rank-badge {
                display: inline-block;
                background: linear-gradient(135deg, #d4af37 0%, #b4941f 100%);
                color: white;
                padding: 5px 20px;
                border-radius: 50px;
                font-weight: bold;
                font-size: 14px;
                margin: 15px 0;
                box-shadow: 0 4px 6px rgba(212, 175, 55, 0.3);
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            /* Detail Grid */
            .details-grid {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 20px;
                margin-top: 40px;
                padding-top: 30px;
                border-top: 1px solid #e5e7eb;
            }
            .detail-item { text-align: center; min-width: 120px; }
            .detail-label { display: block; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .detail-value { display: block; font-size: 15px; color: #111827; font-weight: 700; }
            /* Footer / Signatures */
            .footer-section { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
                margin-top: 60px; 
                padding: 0 40px;
            }
            .signature-block { text-align: center; width: 200px; }
            .sign-img { height: 40px; margin-bottom: -10px; } /* Placeholder for signature image */
            .sign-line { border-top: 1px solid #d1d5db; margin: 10px 0; }
            .sign-title { font-size: 14px; color: #6b7280; font-weight: bold; }
            
            .official-seal {
                width: 100px;
                height: 100px;
                border: 2px dashed #d4af37;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #d4af37;
                font-weight: bold;
                font-size: 12px;
                text-align: center;
                opacity: 0.8;
            }
            /* Download Button Container */
            .action-area { margin-top: 30px; }
            .btn-download {
                background-color: #064e3b;
                color: #ffffff;
                text-decoration: none;
                padding: 15px 40px;
                border-radius: 5px;
                font-weight: bold;
                display: inline-block;
                transition: background 0.3s;
            }
            .btn-download:hover { background-color: #042f24; }
            .footer-note { font-size: 12px; color: #9ca3af; margin-top: 30px; }
            /* Mobile Adjustments */
            @media (max-width: 600px) {
                .inner-border { padding: 20px; }
                .main-title { font-size: 32px; }
                .recipient-name { font-size: 42px; }
                .footer-section { flex-direction: column; align-items: center; gap: 30px; }
                .inner-border::before, .inner-border::after { display: none; } /* Hide decoration on small screens */
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="certificate-container">
                <div class="outer-border">
                    <div class="inner-border">
                        <div class="header-logo">
                            <img src="${logoUrl}" alt="Eventify" class="logo-img">
                            <div class="org-name">Eventify Systems</div>
                        </div>
                        
                        <h1 class="main-title">Certificate</h1>
                        <div class="sub-title">Of Achievement</div>
                        <p class="presentation-text">This certificate is proudly presented to</p>
                        
                        <div class="recipient-name">${userName}</div>
                        
                        <div class="achievement-text">
                            For outstanding performance in <span class="highlight">${eventName}</span> organized by <span class="highlight">${clubName}</span>.
                            <br>
                            Your dedication and skill have earned you this recognition.
                        </div>
                        <div class="rank-badge">
                            Rank #${rank} &bull; Score: ${score}
                        </div>
                        <div class="details-grid">
                            <div class="detail-item">
                                <span class="detail-label">Date</span>
                                <span class="detail-value">${eventDate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Certificate ID</span>
                                <span class="detail-value">${certificateId}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Issued</span>
                                <span class="detail-value">${certificateDate}</span>
                            </div>
                        </div>
                        <div class="footer-section">
                            <div class="signature-block">
                                <div style="font-family: 'Great Vibes'; font-size: 24px; margin-bottom: 5px;">Chairman Name</div>
                                <div class="sign-line"></div>
                                <div class="sign-title">Chairman</div>
                            </div>
                            
                            <div class="official-seal">
                                <img src="${stampUrl}" style="width: 80px; opacity: 0.9;" alt="Seal">
                            </div>
                            <div class="signature-block">
                                 <div style="font-family: 'Great Vibes'; font-size: 24px; margin-bottom: 5px;">Club Lead</div>
                                <div class="sign-line"></div>
                                <div class="sign-title">Club President</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="action-area">
                <p style="color: #4b5563; margin-bottom: 20px;">We are proud of your achievement. Keep growing!</p>
                <a href="${frontendUrl}/profile" class="btn-download">View Verified Certificate</a>
                <div class="footer-note">
                    © Eventify. All rights reserved. <br>
                    This is an automated email. Please do not reply.
                </div>
            </div>
        </div>
    </body>
    </html>`;
};
   
module.exports = { 
    ConfirmationMailAccountCreation, 
    PasswordResetEmailTemplate,
    EventNotificationEmailTemplate,
    Top5CongratulationsEmailTemplate,
    CertificateEmailTemplate
};

