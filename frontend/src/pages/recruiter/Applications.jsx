import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  User,
  Mail,
  Calendar,
  Eye,
  Download,
  MessageSquare,
  CheckCircle,
  X,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Building
} from 'lucide-react';

export default function RecruiterApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchApplicationsAndJobs();
  }, []);

  const fetchApplicationsAndJobs = async () => {
    setLoading(true);
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        api.get('/applications/recruiter-applications'),
        api.get('/jobs/my-jobs')
      ]);

      setApplications(applicationsRes.data.applications || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus, notes = '') => {
    setUpdatingStatus(applicationId);
    try {
      await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
        recruiterNotes: notes
      });

      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus, recruiterNotes: notes, lastUpdated: new Date() }
          : app
      ));

      alert('Application status updated successfully! Candidate will be notified via email.');
      setSelectedApplication(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'New', icon: Clock },
      reviewing: { class: 'badge-info', text: 'Reviewing', icon: Eye },
      shortlisted: { class: 'badge-primary', text: 'Shortlisted', icon: TrendingUp },
      interviewed: { class: 'badge-info', text: 'Interviewed', icon: CheckCircle },
      selected: { class: 'badge-success', text: 'Selected', icon: CheckCircle },
      rejected: { class: 'badge-error', text: 'Rejected', icon: AlertCircle }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`badge ${badge.class}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.studentID?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.studentID?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.jobID?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobID?._id === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'New Applications' },
    { value: 'reviewing', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const StatusUpdateModal = ({ application, onClose, onUpdate }) => {
    const [newStatus, setNewStatus] = useState(application.status);
    const [notes, setNotes] = useState(application.recruiterNotes || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(application._id, newStatus, notes);
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div className="card" style={{ width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
          <div className="flex justify-between items-center mb-4">
            <h3>Update Application Status</h3>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>

          <div className="mb-4">
            <h4>{application.studentID?.name}</h4>
            <p style={{ color: 'var(--text-secondary)' }}>
              Applied for: {application.jobID?.title}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="form-input form-select"
                required
              >
                <option value="pending">New</option>
                <option value="reviewing">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Notes to Candidate (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input form-textarea"
                placeholder="Add feedback or next steps for the candidate..."
                rows="4"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={updatingStatus === application._id}
                className="btn btn-primary flex-1"
              >
                {updatingStatus === application._id ? (
                  <>
                    <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>Application Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Review and manage candidate applications
            </p>
          </div>
          <button 
            onClick={fetchApplicationsAndJobs}
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{ 
                  position: 'absolute', 
                  left: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)'
                }} />
                <input
                  type="text"
                  placeholder="Search by candidate name, email, or job title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input form-select"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                value={jobFilter}
                onChange={(e) => setJobFilter(e.target.value)}
                className="form-input form-select"
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="card text-center py-12">
            <FileText size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3>
              {applications.length === 0 ? 'No Applications Yet' : 'No Matching Applications'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {applications.length === 0 
                ? 'Applications will appear here when candidates apply to your jobs'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {applications.length === 0 && (
              <Link to="/recruiter/jobs/new" className="btn btn-primary">
                Post a Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {/* Candidate Info */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                          {application.studentID?.name}
                        </h3>
                        <div className="flex items-center gap-4" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center gap-1">
                            <Mail size={14} />
                            {application.studentID?.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                    {/* Job Info */}
                    <div className="flex items-center gap-2 mb-3" style={{ 
                      background: 'var(--bg-tertiary)', 
                      padding: '0.5rem 1rem', 
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem'
                    }}>
                      <Building size={14} style={{ color: 'var(--primary)' }} />
                      <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                        {application.jobID?.title}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        • {application.jobID?.location}
                      </span>
                    </div>

                    {/* Cover Letter Preview */}
                    {application.coverLetter && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={16} style={{ color: 'var(--text-secondary)' }} />
                          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Cover Letter</span>
                        </div>
                        <p style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '0.875rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.4'
                        }}>
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                    {/* Recruiter Notes */}
                    {application.recruiterNotes && (
                      <div style={{ 
                        background: 'rgba(102, 126, 234, 0.1)', 
                        padding: '0.75rem', 
                        borderRadius: 'var(--radius)',
                        borderLeft: '4px solid var(--primary)',
                        marginBottom: '1rem'
                      }}>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={14} style={{ color: 'var(--primary)' }} />
                          <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Your Notes</span>
                        </div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem', margin: 0 }}>
                          {application.recruiterNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => setSelectedApplication(application)}
                      className="btn btn-primary btn-sm"
                    >
                      Update Status
                    </button>
                    
                    {application.resumeUrl && (
                      <a
                        href={application.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <Download size={14} />
                        Resume
                      </a>
                    )}

                    <Link
                      to={`/jobs/${application.jobID?._id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} />
                      View Job
                    </Link>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 mt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Last updated: {new Date(application.lastUpdated || application.appliedAt).toLocaleString()}
                  </div>
                  
                  {application.status === 'selected' && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                      <CheckCircle size={16} />
                      <span>Hired! 🎉</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status Update Modal */}
        {selectedApplication && (
          <StatusUpdateModal
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onUpdate={handleStatusUpdate}
          />
        )}
      </div>
    </div>
  );
}
