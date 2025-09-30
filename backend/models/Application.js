const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobID: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recruiterID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'], 
      default: 'pending' 
    },
    coverLetter: String,
    resumeUrl: String,
    appliedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
    recruiterNotes: String,
    interviewScheduled: {
      date: Date,
      time: String,
      mode: { type: String, enum: ['online', 'offline'] },
      location: String
    }
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ jobID: 1, studentID: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
