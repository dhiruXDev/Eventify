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
  releaseCertificates,
  sendCertificates,
  manualCheckIn
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

// Attendance and Certificate routes (MUST come before :id routes)
router.get('/attendance/history', protect, getAttendanceHistory);
router.get('/attendance/scans', protect, getScanHistory);
router.post('/:id/certificates/release', protect, authorize('organizer', 'admin'), releaseCertificates);
router.post('/:id/certificates/send', protect, authorize('organizer', 'admin'), sendCertificates);

// Public routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected routes
router.post('/', protect, authorize('organizer', 'admin'), createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

// Registration routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, cancelRegistration);

// Participants route
router.get('/:id/participants', protect, getEventParticipants);

// QR and Attendance scanning
router.get('/:id/qrcode', protect, getQrCode);
router.post('/:id/attendance/scan', protect, scanQrCode);
router.post('/:id/attendance/manual', protect, manualCheckIn);
router.get('/:id/attendance/stats', protect, getAttendanceStats);
router.post('/:id/volunteers', protect, authorize('organizer', 'admin'), assignVolunteers);

// Review routes
router.get('/:eventId/reviews', getEventReviews);
router.get('/:eventId/reviews/my-review', protect, getMyReview);
router.post('/:eventId/reviews', protect, createReview);
router.delete('/:eventId/reviews/:reviewId', protect, deleteReview);

// Platform rating routes
router.get('/platform/ratings', getPlatformRatings);
router.get('/platform/rating/my-rating', protect, getMyPlatformRating);
router.post('/platform/rating', protect, createPlatformRating);
router.delete('/platform/rating/:ratingId', protect, deletePlatformRating);

module.exports = router;
