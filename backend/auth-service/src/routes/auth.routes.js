const express = require('express');
const { 
  register, 
  login, 
  getCurrentUser, 
  refreshToken, 
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  googleAuth,
  getUserById
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleAuth);
// Public endpoint for service-to-service calls to get user by ID
router.get('/users/:id', getUserById);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);

module.exports = router;