const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, enum: ['Full-time', 'Part-time', 'Internship', 'Contract'], default: 'Full-time' },
    workMode: { type: String, enum: ['Remote', 'On-site', 'Hybrid'], default: 'On-site' },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' }
    },
    description: { type: String, required: true },
    requirements: [String],
    responsibilities: [String],
    benefits: [String],
    skills: [String],
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 10 }
    },
    applicationDeadline: Date,
    recruiterID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
    applicationsCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Index for better search performance
jobSchema.index({ title: 'text', company: 'text', location: 'text', skills: 'text' });

module.exports = mongoose.model('Job', jobSchema);
