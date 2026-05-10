import axios from 'axios';

// Base URL for club service through the API gateway
//const API_URL = 'https://univent-event-service.onrender.com/api/clubs';
const API_URL = 'http://localhost:8000/api/clubs';

// Create axios instance with default config
const clubApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Here i comment out the timeout and maxContentLength and maxBodyLength
  // timeout: 120000, // 120 seconds (2 minutes) for large image uploads
  // maxContentLength: 50 * 1024 * 1024, // 50MB
  // maxBodyLength: 50 * 1024 * 1024 // 50MB
});

// Add token to requests if available
clubApi.interceptors.request.use(
  (config) => {
    
    const token = localStorage.getItem('token');
    console.log('Club Service: Token :', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Club service functions
 */
const clubService = {
  // Get all clubs
  getAllClubs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.isPublished !== undefined) {
        params.append('isPublished', filters.isPublished.toString());
      }
      
      const queryString = params.toString();
      const url = queryString ? `?${queryString}` : '';
      const response = await clubApi.get(url);
      // Handle both response formats
      if (response.data && response.data.success !== undefined) {
        return response.data;
      }
      // If response is just an array or object, wrap it
      return {
        success: true,
        count: Array.isArray(response.data) ? response.data.length : 0,
        data: response.data || []
      };
    } catch (error) {
      // If 404 or any error, return empty array instead of throwing
      // This prevents the UI from breaking when no clubs exist or service is down
      return { success: true, count: 0, data: [] };
    }
  },

  // Get club by ID
  getClubById: async (clubId) => {
    try {
      const response = await clubApi.get(`/${clubId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch club');
    }
  },

  // Get club by organizer user ID or member email
  getClubByOrganizer: async (userId, email = '') => {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      // Ensure userId is a string
      const userIdStr = String(userId);
      const url = email ? `/organizer/${userIdStr}?email=${encodeURIComponent(email)}` : `/organizer/${userIdStr}`;
      const response = await clubApi.get(url);
      console.log("Club Data in service  : ", response);
      return response.data;
    } catch (error) {
      console.log("Club Error  in service  : ", error);
       // If 404, it means no club found - this is okay, don't log as error
      if (error.response?.status === 404) {
        const notFoundError = new Error('No club found for this organizer');
        notFoundError.isNotFound = true; // Flag to identify this as expected
        throw notFoundError;
      }
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch club');
    }
  },

  // Create a new club
  createClub: async (clubData) => {
    try {
      console.log("Club Data in service  : ", clubData);
      const response = await clubApi.post('/', clubData);
      return response.data;
    } catch (error) {
      // Extract error message from response
      let errorMessage = 'Failed to create club';
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.join(', ');
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Update club
  updateClub: async (clubId, clubData) => {
    try {
      const response = await clubApi.put(`/${clubId}`, clubData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update club');
    }
  },

  // Add organizer to club
  addOrganizer: async (clubId, organizerData) => {
    try {
      const response = await clubApi.post(`/${clubId}/organizers`, organizerData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add organizer');
    }
  },

  // Add image to gallery
  addGalleryImage: async (clubId, imageData) => {
    try {
      const response = await clubApi.post(`/${clubId}/gallery`, imageData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add gallery image');
    }
  },

  // Delete club (admin only)
  deleteClub: async (clubId) => {
    try {
      const response = await clubApi.delete(`/${clubId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete club');
    }
  }
};

export default clubService;

