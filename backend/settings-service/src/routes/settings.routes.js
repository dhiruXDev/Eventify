const express = require('express');
const { 
  getUserSettings,
  updateUserSettings,
  getSystemSettings,
  updateSystemSettings,
  getAllUserSettings
} = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes are protected
router.use(protect);

// User settings routes
router.get('/user', getUserSettings);
router.put('/user', updateUserSettings);

// System settings routes (admin only)
router.get('/system', authorize('admin'), getSystemSettings);
router.put('/system', authorize('admin'), updateSystemSettings);

// Internal route for other services (no auth for now, add service-to-service auth in production)
router.get('/all-users', getAllUserSettings);

module.exports = router;