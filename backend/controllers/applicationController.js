const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const mongoose = require('mongoose');
const emailService = require('../utils/emailService');

// Apply to a job (Student only) - WITH EMAIL NOTIFICATIONS
exports.applyToJob = async (req, res) => {
  try {
    const { jobID, coverLetter } = req.body;
    const studentID = req.user.id;

    console.log('📝 Student applying to job:', { jobID, studentID });

    // Check if job exists
    const job = await Job.findById(jobID).populate('recruiterID', 'name email');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if job is still active
    if (job.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Job is no longer accepting applications' });
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({ jobID, studentID });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied to this job' });
    }

    // Get student data
    const student = await User.findById(studentID);

    // Get resume URL from uploaded file (if any)
    const resumeUrl = req.file ? req.file.path : null;

    // Create application
    const application = await Application.create({
      jobID,
      studentID,
      recruiterID: job.recruiterID._id,
      coverLetter,
      resumeUrl
    });

    // Increment job applications count
    job.applicationsCount += 1;
    await job.save();

    console.log('✅ Application created:', application._id);

    // Send email notifications
    try {
      // Send confirmation to student
      await emailService.sendApplicationReceived(
        { name: student.name, email: student.email },
        { title: job.title, company: job.company, location: job.location },
        { appliedAt: application.appliedAt }
      );

      // Send alert to recruiter
      await emailService.sendNewApplicationAlert(
        { name: job.recruiterID.name, email: job.recruiterID.email },
        { name: student.name, email: student.email },
        { title: job.title },
        { 
          appliedAt: application.appliedAt, 
          coverLetter: application.coverLetter,
          resumeUrl: application.resumeUrl 
        }
      );

      console.log('✅ Email notifications sent');
    } catch (emailError) {
      console.error('❌ Email notification failed:', emailError);
      // Don't fail the application if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Confirmation email sent.',
      application,
      resumeUploaded: !!resumeUrl
    });
  } catch (error) {
    console.error('❌ Apply job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update application status (Recruiter only) - WITH EMAIL NOTIFICATIONS
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, recruiterNotes } = req.body;
    
    const validStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Find application and verify recruiter owns it
    const application = await Application.findOne({ 
      _id: applicationId, 
      recruiterID: req.user.id 
    }).populate([
      { path: 'studentID', select: 'name email' },
      { path: 'jobID', select: 'title company' }
    ]);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });
    }

    const previousStatus = application.status;

    // Update application
    application.status = status;
    if (recruiterNotes) application.recruiterNotes = recruiterNotes;
    application.lastUpdated = new Date();

    await application.save();

    console.log('✅ Application status updated:', { applicationId, status });

    // Send email notification to student if status changed
    if (previousStatus !== status) {
      try {
        await emailService.sendStatusUpdate(
          { name: application.studentID.name, email: application.studentID.email },
          { title: application.jobID.title, company: application.jobID.company },
          application,
          status,
          recruiterNotes
        );
        console.log('✅ Status update email sent');
      } catch (emailError) {
        console.error('❌ Status update email failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Application status updated successfully. Student notified via email.',
      application
    });
  } catch (error) {
    console.error('❌ Update application error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Keep other methods unchanged...
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentID: req.user.id })
      .populate('jobID', 'title company location jobType workMode salary status')
      .populate('recruiterID', 'name email profile.avatar')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('❌ Get applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const recruiterID = req.user.id;

    const job = await Job.findOne({ _id: jobId, recruiterID });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const applications = await Application.find({ jobID: jobId })
      .populate('studentID', 'name email profile')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      job: {
        title: job.title,
        company: job.company,
        applicationsCount: job.applicationsCount
      },
      applications
    });
  } catch (error) {
    console.error('❌ Get job applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecruiterApplications = async (req, res) => {
  try {
    const applications = await Application.find({ recruiterID: req.user.id })
      .populate('jobID', 'title company')
      .populate('studentID', 'name email profile')
      .sort({ appliedAt: -1 });

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('❌ Get recruiter applications error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    const recruiterID = req.user.id;
    const recruiterObjectId = new mongoose.Types.ObjectId(recruiterID);

    const stats = await Application.aggregate([
      { $match: { recruiterID: recruiterObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalApplications = await Application.countDocuments({ recruiterID });
    const totalJobs = await Job.countDocuments({ recruiterID });

    const formattedStats = {
      totalApplications,
      totalJobs,
      byStatus: {
        pending: 0,
        reviewing: 0,
        shortlisted: 0,
        interviewed: 0,
        selected: 0,
        rejected: 0
      }
    };

    stats.forEach(stat => {
      formattedStats.byStatus[stat._id] = stat.count;
    });

    res.json({
      success: true,
      stats: formattedStats
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
