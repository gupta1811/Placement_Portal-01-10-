const express = require('express');
const {
  applyToJob,
  getMyApplications,
  getJobApplications,
  getRecruiterApplications,
  updateApplicationStatus,
  getApplicationStats
} = require('../controllers/applicationController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const upload = require('../middleware/upload');

const router = express.Router();

console.log('🛣️ Application routes loaded');

// All routes require authentication
router.use(protect);

// Student routes - UPDATED WITH FILE UPLOAD
router.post('/apply', roleCheck(['student']), upload.single('resume'), applyToJob);
router.get('/my-applications', roleCheck(['student']), getMyApplications);

// Recruiter routes
router.get('/job/:jobId', roleCheck(['recruiter', 'admin']), getJobApplications);
router.get('/recruiter/all', roleCheck(['recruiter', 'admin']), getRecruiterApplications);
router.put('/:applicationId/status', roleCheck(['recruiter', 'admin']), updateApplicationStatus);
router.get('/stats', roleCheck(['recruiter', 'admin']), getApplicationStats);

module.exports = router;
