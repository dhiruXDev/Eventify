const axios = require('axios');

const AUTH_SERVICE = process.env.AUTH_SERVICE || 'http://localhost:8001';

/**
 * Fetch user data from auth-service by user ID
 * @param {String} userId - User ID
 * @param {String} authToken - Optional auth token for internal service calls
 * @returns {Object|null} User data or null if not found
 */
const getUserById = async (userId, authToken = null) => {
  try {
    const headers = {};
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await axios.get(`${AUTH_SERVICE}/api/auth/users/${userId}`, {
      headers,
      timeout: 5000 // 5 second timeout
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`[USER-SERVICE] Error fetching user ${userId}:`, error.message);
    // Return null instead of throwing - allows graceful degradation
    return null;
  }
};

/**
 * Fetch multiple users by their IDs
 * @param {Array<String>} userIds - Array of user IDs
 * @param {String} authToken - Optional auth token
 * @returns {Object} Map of userId -> userData
 */
const getUsersByIds = async (userIds, authToken = null) => {
  if (!userIds || userIds.length === 0) {
    return {};
  }

  // Remove duplicates and filter out invalid IDs
  const uniqueIds = [...new Set(userIds.filter(id => id))];

  if (uniqueIds.length === 0) {
    return {};
  }

  try {
    // Fetch all users in parallel
    const userPromises = uniqueIds.map(userId => getUserById(userId, authToken));
    const users = await Promise.all(userPromises);

    // Create a map of userId -> userData
    const userMap = {};
    uniqueIds.forEach((userId, index) => {
      if (users[index]) {
        userMap[userId.toString()] = users[index];
      }
    });

    return userMap;
  } catch (error) {
    console.error('[USER-SERVICE] Error fetching multiple users:', error.message);
    return {};
  }
};

/**
 * Populate organizers array with user data
 * @param {Array} organizers - Array of organizer objects with userId
 * @param {String} authToken - Optional auth token
 * @returns {Array} Organizers with populated user data
 */
const populateOrganizers = async (organizers, authToken = null) => {
  if (!organizers || organizers.length === 0) {
    return [];
  }

  // Extract all user IDs
  const userIds = organizers.map(org => org.userId?.toString()).filter(Boolean);

  // Fetch all users
  const userMap = await getUsersByIds(userIds, authToken);

  // Map organizers with user data
  return organizers.map(org => {
    const userId = org.userId?.toString();
    const userData = userMap[userId] || null;

    return {
      ...org.toObject ? org.toObject() : org,
      userId: org.userId,
      user: userData ? {
        id: userData._id || userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        photo: userData.photo,
        role: userData.role
      } : null
    };
  });
};

module.exports = {
  getUserById,
  getUsersByIds,
  populateOrganizers
};

