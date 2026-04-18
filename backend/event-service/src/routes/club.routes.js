const express = require('express');
const {
    createClub,
    getAllClubs,
    getClubById,
    updateClub,
    addOrganizer,
    addGalleryImage,
    getClubByOrganizer,
    deleteClub
} = require('../controllers/club.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/optionalAuth.middleware');

const router = express.Router();

// Public routes (with optional auth for private data)
router.get('/', optionalAuth, getAllClubs);

// Special routes first to avoid matching generic :id
router.get('/organizer/:userId', protect, getClubByOrganizer);

// Generic ID routes
router.get('/:id', optionalAuth, getClubById);

// Protected routes (require authentication)
router.post('/', protect, authorize('organizer', 'admin'), createClub);
router.put('/:id', protect, updateClub);
router.delete('/:id', protect, deleteClub);

// Additional club management routes
router.post('/:id/organizers', protect, addOrganizer);
router.post('/:id/gallery', protect, addGalleryImage);

module.exports = router;
