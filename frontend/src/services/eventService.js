import axios from 'axios';

// Base URL for event service
//const API_URL = 'https://univent-event-service.onrender.com/api/events';
const API_URL = 'http://localhost:8002/api/events';

// const API_URL = 'http://localhost:8002/api/events';
// Create axios instance with default config
const eventApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
eventApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Event service functions
const eventService = {
  // Get all events
  getAllEvents: async (filters = {}) => {
    try {
      const response = await eventApi.get('/', { params: filters });
      return response.data;
    } catch (error) {
      console.log("Error : ", error);
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  // Get event by ID
  getEventById: async (eventId) => {
    // Validate eventId before making API call
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid _id: ' + eventId);
    }

    try {
      const response = await eventApi.get(`/${eventId}`);
      return response.data.data; // Extract the data from the nested structure
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event details');
    }
  },

  // Create new event
  createEvent: async (eventData) => {
    try {
      const response = await eventApi.post('/', eventData);
      return response.data.data || response.data; // Extract the data from the nested structure if it exists
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create event');
    }
  },

  // Update event
  updateEvent: async (eventId, eventData) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for update');
    }

    try {
      const response = await eventApi.put(`/${eventId}`, eventData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update event');
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for deletion');
    }

    try {
      const response = await eventApi.delete(`/${eventId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete event');
    }
  },

  // Register for event
  registerForEvent: async (eventId, registrationData) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for registration');
    }

    try {
      const response = await eventApi.post(`/${eventId}/register`, registrationData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
  },

  // Cancel registration
  cancelRegistration: async (eventId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for cancellation');
    }

    try {
      const response = await eventApi.delete(`/${eventId}/register`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to cancel registration');
    }
  },

  // Get registered participants
  getEventParticipants: async (eventId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for fetching participants');
    }

    try {
      const response = await eventApi.get(`/${eventId}/participants`);
      return response.data.data || []; // Extract the data from the nested structure
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch participants');
    }
  },

  // Get all reviews for an event
  getEventReviews: async (eventId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for fetching reviews');
    }

    try {
      const response = await eventApi.get(`/${eventId}/reviews`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
  },

  // Get user's review for an event
  getMyReview: async (eventId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for fetching review');
    }

    try {
      const response = await eventApi.get(`/${eventId}/reviews/my-review`);
      // Backend returns { success: true, data: review } or { success: true, data: null }
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      // If 404, user hasn't reviewed yet - return null instead of throwing
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch review');
    }
  },

  // Create or update a review
  createReview: async (eventId, reviewData) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for creating review');
    }

    try {
      const response = await eventApi.post(`/${eventId}/reviews`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create review');
    }
  },

  // Delete a review
  deleteReview: async (eventId, reviewId) => {
    if (!eventId || eventId === 'undefined' || eventId === 'null') {
      throw new Error('Invalid event ID for deleting review');
    }

    try {
      const response = await eventApi.delete(`/${eventId}/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  },

  // Platform Rating functions
  // Get all platform ratings
  getPlatformRatings: async () => {
    try {
      const response = await eventApi.get('/platform/ratings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch platform ratings');
    }
  },

  // Get user's own platform rating
  getMyPlatformRating: async () => {
    try {
      const response = await eventApi.get('/platform/rating/my-rating');
      return response.data.data;
    } catch (error) {
      // If no rating found, the backend returns 200 with data: null, which is not an error for the UI
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch your platform rating');
    }
  },

  // Create or update a platform rating
  createPlatformRating: async (ratingData) => {
    try {
      const response = await eventApi.post('/platform/rating', ratingData);
      return response.data.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit platform rating');
    }
  },

  // Delete a platform rating
  deletePlatformRating: async (ratingId) => {
    if (!ratingId) throw new Error('Rating ID is required to delete a platform rating');
    try {
      const response = await eventApi.delete(`/platform/rating/${ratingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete platform rating');
    }
  }
};

export default eventService;