const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  getRecruiterJobs,
  updateJob,
  deleteJob
} = require('../controllers/jobController');
const protect = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

console.log('🛣️ Job routes loaded');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes - Recruiter only
router.use(protect); // All routes below require authentication

router.get('/my/jobs', getRecruiterJobs);
router.post('/', roleCheck(['recruiter', 'admin']), createJob);
router.put('/:id', roleCheck(['recruiter', 'admin']), updateJob);
router.delete('/:id', roleCheck(['recruiter', 'admin']), deleteJob);

module.exports = router;
