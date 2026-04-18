const axios = require('axios');
const { sendEventNotificationEmail, sendTop5CongratulationsEmail, sendCertificateEmail } = require('./email.utils');
const User = require('../models/User');

/**
 * Get users who should receive notifications for a club
 * @param {String} clubName - Name of the club
 * @param {String} type - 'event' or 'announcement'
 * @returns {Array} Array of user objects with email and settings
 */
async function getUsersForClubNotifications(clubName, type) {
  try {
    const settingsServiceUrl = process.env.SETTINGS_SERVICE || 'http://localhost:8005';
    
    // Get all user settings
    const response = await axios.get(`${settingsServiceUrl}/api/settings/all-users`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.success) {
      console.log('No user settings found or error fetching settings');
      return [];
    }
    
    const allSettings = response.data.data || [];
    
    // Filter users who:
    // 1. Have email notifications enabled
    // 2. Have the specific notification type enabled (event or announcement)
    // 3. Have this club in their interested clubs list
    const eligibleUsers = allSettings.filter(setting => {
      const hasEmailEnabled = setting.notification?.email === true;
      const hasTypeEnabled = type === 'event' 
        ? setting.notification?.eventNotifications === true
        : setting.notification?.announcementNotifications === true;
      const isInterestedInClub = setting.interestedClubs?.includes(clubName);
      
      return hasEmailEnabled && hasTypeEnabled && isInterestedInClub;
    });
    
    // Get user details (email, name) for each eligible user
    const usersWithDetails = await Promise.all(
      eligibleUsers.map(async (setting) => {
        try {
          const user = await User.findById(setting.userId).select('email firstName lastName');
          if (user && user.email) {
            return {
              userId: setting.userId,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              settings: setting
            };
          }
        } catch (err) {
          console.error(`Error fetching user ${setting.userId}:`, err.message);
        }
        return null;
      })
    );
    
    return usersWithDetails.filter(user => user !== null);
  } catch (error) {
    console.error('Error getting users for club notifications:', error.message);
    return [];
  }
}

/**
 * Send notifications to users interested in a club
 * @param {Object} options - Notification options
 */
async function sendClubNotifications(options) {
  const { clubName, type, title, description, date, link } = options;
  
  try {
    const users = await getUsersForClubNotifications(clubName, type);
    
    if (users.length === 0) {
      console.log(`No users to notify for ${type} from ${clubName}`);
      return { sent: 0, failed: 0 };
    }
    
    console.log(`Sending ${type} notifications to ${users.length} users for club: ${clubName}`);
    
    const results = await Promise.allSettled(
      users.map(user => 
        sendEventNotificationEmail({
          email: user.email,
          type: type,
          clubName: clubName,
          title: title,
          description: description,
          date: date,
          link: link,
          subject: `${type === 'event' ? 'New Event' : 'New Announcement'} from ${clubName}`
        })
      )
    );
    
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`Notifications sent: ${sent}, Failed: ${failed}`);
    
    return { sent, failed };
  } catch (error) {
    console.error('Error sending club notifications:', error);
    return { sent: 0, failed: 0 };
  }
}

/**
 * Send Top 5 congratulations and certificate emails
 * @param {Object} options - User and event details
 */
async function sendTop5Emails(options) {
  const { userId, email, userName, clubName, eventName, eventId, score, rank, eventDate } = options;
  
  try {
    if (rank > 5) {
      console.log(`User ${userName} is rank ${rank}, not in top 5. Skipping emails.`);
      return { congratulations: false, certificate: false };
    }
    
    console.log(`Sending Top 5 emails to ${userName} (Rank #${rank})`);
    
    // Send congratulations email
    const congratsResult = await sendTop5CongratulationsEmail({
      email: email,
      userName: userName,
      clubName: clubName,
      eventName: eventName,
      score: score,
      rank: rank
    }).catch(err => {
      console.error('Error sending congratulations email:', err);
      return null;
    });
    
    // Send certificate email
    const certificateResult = await sendCertificateEmail({
      email: email,
      userName: userName,
      clubName: clubName,
      eventName: eventName,
      score: score,
      rank: rank,
      eventDate: eventDate
    }).catch(err => {
      console.error('Error sending certificate email:', err);
      return null;
    });
    
    return {
      congratulations: congratsResult !== null,
      certificate: certificateResult !== null
    };
  } catch (error) {
    console.error('Error sending Top 5 emails:', error);
    return { congratulations: false, certificate: false };
  }
}

module.exports = {
  getUsersForClubNotifications,
  sendClubNotifications,
  sendTop5Emails
};

