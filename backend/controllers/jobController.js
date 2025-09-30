const Job = require('../models/Job');
const Application = require('../models/Application');

// Create new job (Recruiter only)
exports.createJob = async (req, res) => {
  try {
    console.log('📝 Creating new job:', req.body);
    const jobData = {
      ...req.body,
      recruiterID: req.user.id
    };
    
    const job = await Job.create(jobData);
    console.log('✅ Job created:', job._id);
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all jobs with filters and search
exports.getJobs = async (req, res) => {
  try {
    const { 
      search, 
      location, 
      jobType, 
      workMode, 
      minSalary, 
      maxSalary,
      skills,
      page = 1, 
      limit = 10 
    } = req.query;

    let query = { status: 'active' };

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (location) query.location = new RegExp(location, 'i');
    if (jobType) query.jobType = jobType;
    if (workMode) query.workMode = workMode;
    if (minSalary) query['salary.min'] = { $gte: Number(minSalary) };
    if (maxSalary) query['salary.max'] = { $lte: Number(maxSalary) };
    if (skills) query.skills = { $in: skills.split(',') };

    const jobs = await Job.find(query)
      .populate('recruiterID', 'name profile.avatar')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const totalJobs = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalJobs / Number(limit)),
        totalJobs,
        hasMore: (Number(page) * Number(limit)) < totalJobs
      }
    });
  } catch (error) {
    console.error('❌ Get jobs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single job by ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('recruiterID', 'name email profile');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    console.error('❌ Get job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recruiter's jobs
exports.getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterID: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });
  } catch (error) {
    console.error('❌ Get recruiter jobs error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update job (Recruiter only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      recruiterID: req.user.id 
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete job (Recruiter only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOne({ 
      _id: req.params.id, 
      recruiterID: req.user.id 
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    await Job.findByIdAndDelete(req.params.id);
    
    // Also delete related applications
    await Application.deleteMany({ jobID: req.params.id });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
