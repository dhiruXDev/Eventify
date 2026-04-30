const express = require('express');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getEventParticipants,
  getQrCode,
  scanQrCode,
  getAttendanceHistory,
  getScanHistory,
  getAttendanceStats,
  assignVolunteers,
  releaseCertificates
} = require('../controllers/event.controller');
const {
  createReview,
  getEventReviews,
  getMyReview,
  deleteReview
} = require('../controllers/review.controller');
const {
  createPlatformRating,
  getPlatformRatings,
  getMyPlatformRating,
  deletePlatformRating
} = require('../controllers/platformRating.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, updateEvent); // Authorization check in controller
router.delete('/:id', protect, deleteEvent); // Authorization check in controller

// Registration routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

// Participants route
router.get('/:id/participants', protect, getEventParticipants); // Authorization check in controller

// Attendance and Certificate routes
router.get('/attendance/history', protect, getAttendanceHistory); // Get user's attendance history
router.get('/attendance/scans', protect, getScanHistory); // Get volunteer's scan history

router.get('/:id/qrcode', protect, getQrCode);
router.post('/:id/attendance/scan', protect, scanQrCode);
router.get('/:id/attendance/stats', protect, getAttendanceStats);
router.post('/:id/volunteers', protect, authorize('organizer', 'admin'), assignVolunteers);
router.post('/:id/certificates/release', protect, authorize('organizer', 'admin'), releaseCertificates);

// Review routes
router.get('/:eventId/reviews', getEventReviews); // Public - anyone can view reviews
router.get('/:eventId/reviews/my-review', protect, getMyReview); // Get user's own review
router.post('/:eventId/reviews', protect, createReview); // Create or update review
router.delete('/:eventId/reviews/:reviewId', protect, deleteReview); // Delete review

// Platform rating routes
router.get('/platform/ratings', getPlatformRatings); // Public - anyone can view platform ratings
router.get('/platform/rating/my-rating', protect, getMyPlatformRating); // Get user's own platform rating
router.post('/platform/rating', protect, createPlatformRating); // Create or update platform rating
router.delete('/platform/rating/:ratingId', protect, deletePlatformRating); // Delete platform rating

module.exports = router;
