const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { 
  ConfirmationMailAccountCreation, 
  PasswordResetEmailTemplate,
  EventNotificationEmailTemplate,
  Top5CongratulationsEmailTemplate,
  CertificateEmailTemplate
} = require('./emailTemplate');

/**
 * Create a transporter for sending emails
 */
const createTransporter = async () => {
  try {
    // Check if we have email credentials in environment variables
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Use configured SMTP (production or development with credentials)
      const emailService = process.env.EMAIL_SERVICE || 'gmail';
      const isSecure = process.env.EMAIL_SECURE === 'true';
      
      // Configure transporter based on service
      let transporterConfig;
      
      if (emailService === 'gmail') {
        // Gmail-specific configuration
        transporterConfig = {
          service: 'gmail',
          auth: { 
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };
      } else {
        // Generic SMTP configuration
        transporterConfig = {
          host: process.env.EMAIL_HOST || emailService,
          port: parseInt(process.env.EMAIL_PORT) || (isSecure ? 465 : 587),
          secure: isSecure,
          auth: { 
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        };
      }

      const transporter = nodemailer.createTransport(transporterConfig);

      // Verify transporter connection
      try {
        await transporter.verify();
        console.log(`Email transporter verified successfully (${emailService})`);
      } catch (verifyError) {
        console.error('Email transporter verification failed:', verifyError.message);
        console.error('This might be due to:');
        console.error('1. Incorrect email credentials');
        console.error('2. Gmail App Password not set (if using Gmail)');
        console.error('3. Network/firewall issues');
        console.error('4. SMTP server configuration');
        console.warn('Falling back to email logging mode...');
        return createFallbackTransporter();
      }

      return transporter;
    } else {
      // Use Ethereal test account for development (if no credentials provided)
      console.log('No email credentials found, using Ethereal test account');
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'abbey.haag61@ethereal.email',
          pass: 'QuamaR8XMsmwpXxr9v'
        }
      });

      // Verify transporter connection
      try {
        await transporter.verify();
        console.log('Ethereal test transporter verified successfully');
      } catch (verifyError) {
        console.warn('Ethereal transporter verification failed, using fallback mode');
        // Return fallback transporter
        return createFallbackTransporter();
      }

      return transporter;
    }
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return createFallbackTransporter();
  }
};

/**
 * Create a fallback transporter that logs emails instead of sending
 */
const createFallbackTransporter = () => {
  return {
    sendMail: async (options) => {
      console.log('\n--- EMAIL FALLBACK (Email not sent, logged instead) ---');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Reset URL: ${options.resetUrl || 'N/A'}`);
      console.log('--- END EMAIL FALLBACK ---\n');

      return Promise.resolve({
        messageId: 'fallback-mock-id',
        previewURL: null,
        accepted: [options.to],
        rejected: []
      });
    }
  };
};

/**
 * Send a password reset email
 */
exports.sendPasswordResetEmail = async (options) => {
  try {
    if (!options.email) {
      throw new Error('Email address is required');
    }

    if (!options.resetUrl) {
      throw new Error('Reset URL is required');
    }

    console.log('Creating email transporter...');
    const transporter = await createTransporter();

    const fromEmail = process.env.EMAIL_USER || 'noreply@univent.com';
    
    // Prepare attachments for logo (if using local file)
    const attachments = [];
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/NavbarLogo.png');
    
    // Try to attach logo if it exists locally, otherwise use URL
    let logoUrl = process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    
    if (fs.existsSync(logoPath)) {
      // Use attachment with cid for inline image
      attachments.push({
        filename: 'NavbarLogo.png',
        path: logoPath,
        cid: 'univent-logo' // Content-ID for inline image
      });
      logoUrl = 'cid:univent-logo'; // Use cid instead of URL
      console.log('Using local logo file as attachment');
    } else {
      console.log('Logo file not found locally, using URL:', logoUrl);
    }
    
    const mailOptions = {
      from: `"Univent Support" <${fromEmail}>`,
      to: options.email,
      subject: options.subject || 'Password Reset Request - Univent',
      text: `${options.message || 'You have requested to reset your password for your Univent account.'}\n\nReset URL: ${options.resetUrl}\n\nIf you did not request this, please ignore this email. This link will expire in 30 minutes.`,
      html: PasswordResetEmailTemplate({
        message: options.message || 'You have requested to reset your password for your Univent account. Click the button below to create a new password.',
        resetUrl: options.resetUrl,
        logoUrl: logoUrl
      }),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log(`Sending password reset email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully. Message ID:', info.messageId);

    // Check if this is an Ethereal email (test account)
    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('⚠️  TEST EMAIL - Preview URL (copy this to view the email):', previewURL);
      console.log('⚠️  In production, emails will be sent to the actual email address.');
    }

    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more detailed error message
    let errorMessage = 'Failed to send password reset email';
    if (error.message) {
      errorMessage += `: ${error.message}`;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Send account creation confirmation email
 */
exports.sendAccountCreationEmail = async (user) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: '"Univent" <noreply@univent.com>',
      to: user.email,
      subject: 'Welcome to Univent - Account Created Successfully!',
      text: `Welcome to Univent!\n\nYour account has been successfully created.\n\nName: ${user.firstName} ${user.lastName}\nEmail: ${user.email}\nCollege: ${user.college || 'Not specified'}\nRole: ${user.role || 'Participant'}\n\nYou can now log in and start exploring events!\n\nVisit ${process.env.BASE_URL || 'http://localhost:3000'}/login to get started.`,
      html: ConfirmationMailAccountCreation(user)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Account creation email sent:', info.messageId);

    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('Preview URL:', previewURL);
    }

    return info;
  } catch (error) {
    console.error('Error sending account creation email:', error);
    // Don't throw error - account creation should succeed even if email fails
    // Just log the error for debugging
    return null;
  }
};

/**
 * Send event/announcement notification email
 */
exports.sendEventNotificationEmail = async (options) => {
  try {
    if (!options.email) {
      throw new Error('Email address is required');
    }

    console.log('Creating email transporter for notification...');
    const transporter = await createTransporter();

    const fromEmail = process.env.EMAIL_USER || 'noreply@eventify.com';
    
    // Prepare attachments for logo
    const attachments = [];
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/NavbarLogo.png');
    let logoUrl = process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'NavbarLogo.png',
        path: logoPath,
        cid: 'eventify-logo'
      });
      logoUrl = 'cid:eventify-logo';
    }
    
    const mailOptions = {
      from: `"Eventify Notifications" <${fromEmail}>`,
      to: options.email,
      subject: options.subject || `${options.type === 'event' ? 'New Event' : 'New Announcement'} - ${options.clubName || 'Eventify'}`,
      html: EventNotificationEmailTemplate({
        ...options,
        logoUrl
      }),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log(`Sending ${options.type} notification email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent successfully. Message ID:', info.messageId);

    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('⚠️  TEST EMAIL - Preview URL:', previewURL);
    }

    return info;
  } catch (error) {
    console.error('Error sending notification email:', error);
    throw new Error(`Failed to send notification email: ${error.message}`);
  }
};

/**
 * Send Top 5 congratulations email
 */
exports.sendTop5CongratulationsEmail = async (options) => {
  try {
    if (!options.email) {
      throw new Error('Email address is required');
    }

    console.log('Creating email transporter for congratulations...');
    const transporter = await createTransporter();

    const fromEmail = process.env.EMAIL_USER || 'noreply@eventify.com';
    
    // Prepare attachments for logo
    const attachments = [];
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/NavbarLogo.png');
    let logoUrl = process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'NavbarLogo.png',
        path: logoPath,
        cid: 'eventify-logo'
      });
      logoUrl = 'cid:eventify-logo';
    }
    
    const mailOptions = {
      from: `"Eventify Achievements" <${fromEmail}>`,
      to: options.email,
      subject: `🎉 Congratulations! You're in Top 5 - ${options.eventName || 'Event'}`,
      html: Top5CongratulationsEmailTemplate({
        ...options,
        logoUrl
      }),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log(`Sending Top 5 congratulations email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Congratulations email sent successfully. Message ID:', info.messageId);

    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('⚠️  TEST EMAIL - Preview URL:', previewURL);
    }

    return info;
  } catch (error) {
    console.error('Error sending congratulations email:', error);
    throw new Error(`Failed to send congratulations email: ${error.message}`);
  }
};

/**
 * Send certificate email
 */
exports.sendCertificateEmail = async (options) => {
  try {
    if (!options.email) {
      throw new Error('Email address is required');
    }

    console.log('Creating email transporter for certificate...');
    const transporter = await createTransporter();

    const fromEmail = process.env.EMAIL_USER || 'noreply@eventify.com';
    
    // Prepare attachments for logo and stamp
    const attachments = [];
    const logoPath = path.join(__dirname, '../../../../frontend/src/assets/NavbarLogo.png');
    const stampPath = path.join(__dirname, '../../../../frontend/src/assets/VerifiedStamp.png');
    
    let logoUrl = process.env.LOGO_URL || 'https://univento.vercel.app/NavbarLogo.png';
    let stampUrl = process.env.STAMP_URL || 'https://univento.vercel.app/VerifiedStamp.png';
    
    if (fs.existsSync(logoPath)) {
      attachments.push({
        filename: 'NavbarLogo.png',
        path: logoPath,
        cid: 'eventify-logo'
      });
      logoUrl = 'cid:eventify-logo';
    }
    
    if (fs.existsSync(stampPath)) {
      attachments.push({
        filename: 'VerifiedStamp.png',
        path: stampPath,
        cid: 'verified-stamp'
      });
      stampUrl = 'cid:verified-stamp';
    }
    
    const mailOptions = {
      from: `"Eventify Certificates" <${fromEmail}>`,
      to: options.email,
      subject: `🏆 Your Certificate of Achievement - ${options.eventName || 'Event'}`,
      html: CertificateEmailTemplate({
        ...options,
        logoUrl,
        stampUrl
      }),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    console.log(`Sending certificate email to: ${options.email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Certificate email sent successfully. Message ID:', info.messageId);

    const previewURL = nodemailer.getTestMessageUrl(info);
    if (previewURL) {
      console.log('⚠️  TEST EMAIL - Preview URL:', previewURL);
    }

    return info;
  } catch (error) {
    console.error('Error sending certificate email:', error);
    throw new Error(`Failed to send certificate email: ${error.message}`);
  }
};
