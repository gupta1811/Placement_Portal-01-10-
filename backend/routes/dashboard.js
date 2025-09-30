// In your backend - Add this to a new file: routes/dashboard.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// Get student dashboard stats
router.get('/student', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ student: req.user.id });
    
    const stats = {
      totalApplications: applications.length,
      inProgressApplications: applications.filter(app => 
        ['applied', 'reviewing', 'shortlisted'].includes(app.status)
      ).length,
      interviewsScheduled: applications.filter(app => app.status === 'interview').length,
      offersReceived: applications.filter(app => app.status === 'offered').length,
      applicationsChange: '+2 this week',
      applicationsTrend: 'up'
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard student error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recruiter dashboard stats
router.get('/recruiter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ createdBy: req.user.id });
    const jobIds = jobs.map(job => job._id);
    const applications = await Application.find({ job: { $in: jobIds } });
    
    const stats = {
      activeJobs: jobs.length,
      totalApplications: applications.length,
      newApplications: applications.filter(app => app.status === 'applied').length,
      interviewsScheduled: applications.filter(app => app.status === 'interview').length,
      jobsChange: '+1 this month',
      jobsTrend: 'up',
      applicationsChange: '+5 this week',
      applicationsTrend: 'up'
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard recruiter error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
