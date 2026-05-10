const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Static routes first
router.get('/my-applications', protect, recruitmentController.getMyApplications);
router.get('/all-selected', protect, authorize('organizer', 'admin'), recruitmentController.getAllSelectedStudents);

// Root routes
router.route('/')
    .post(protect, authorize('organizer', 'admin'), recruitmentController.createRecruitment)
    .get(recruitmentController.getAllRecruitments);

// Parameterized routes last
router.route('/:id')
    .get(recruitmentController.getRecruitmentById)
    .put(protect, authorize('organizer', 'admin'), recruitmentController.updateRecruitment);

router.post('/:id/apply', protect, recruitmentController.applyRecruitment);
router.get('/:id/my-application', protect, recruitmentController.getMyApplication);

router.route('/:id/exam')
    .get(protect, recruitmentController.getExam)
    .post(protect, authorize('organizer', 'admin'), recruitmentController.setupExam)
    .delete(protect, authorize('organizer', 'admin'), recruitmentController.deleteExam);

router.put('/:id/exam/release', protect, authorize('organizer', 'admin'), recruitmentController.toggleExamRelease);

router.get('/:id/applications', protect, authorize('organizer', 'admin'), recruitmentController.getRecruitmentApplications);
router.put('/:id/close', protect, authorize('organizer', 'admin'), recruitmentController.closeRecruitment);

router.post('/:id/submit-exam', protect, recruitmentController.submitExam);
router.post('/:id/evaluate-paper/:appId', protect, authorize('organizer', 'admin'), recruitmentController.evaluatePaper);

router.post('/:id/screen', protect, authorize('organizer', 'admin'), recruitmentController.screenUsers);

router.post('/:id/finalize', protect, authorize('organizer', 'admin'), recruitmentController.finalizeSelection);

module.exports = router;
