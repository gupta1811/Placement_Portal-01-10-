import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Users, 
  BookOpen,
  CheckCircle,
  ArrowLeft,
  Send,
  AlertCircle,
  Building,
  Calendar
} from 'lucide-react';

export default function JobDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
      
      // Check if user has already applied
      if (isAuthenticated && user?.role === 'student') {
        checkApplicationStatus();
      }
    } catch (error) {
      console.error('Failed to fetch job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/my-applications');
      const applications = response.data.applications || [];
      const hasApplied = applications.some(app => app.jobID._id === id);
      setApplied(hasApplied);
    } catch (error) {
      console.error('Failed to check application status:', error);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }

    if (user?.role !== 'student') {
      alert('Only students can apply for jobs');
      return;
    }

    setApplying(true);
    try {
      await api.post('/applications/apply', {
        jobID: id,
        coverLetter
      });

      setApplied(true);
      setShowApplicationForm(false);
      setCoverLetter('');
      alert('Application submitted successfully! You will receive a confirmation email.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (min, max) => {
    if (!min || !max) return 'Salary not disclosed';
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L per year`;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Active' },
      closed: { class: 'badge-error', text: 'Closed' },
      draft: { class: 'badge-secondary', text: 'Draft' }
    };
    const badge = badges[status] || badges.active;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <Briefcase size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3>Job Not Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/jobs" className="btn btn-primary mt-4">
              <ArrowLeft size={16} />
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container">
        {/* Back Button */}
        <Link to="/jobs" className="btn btn-secondary mb-6">
          <ArrowLeft size={16} />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Content */}
          <div>
            {/* Job Header */}
            <div className="card mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{job.title}</h1>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Building size={20} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--primary)' }}>
                        {job.company}
                      </span>
                    </div>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              </div>

              {/* Job Meta */}
              <div className="grid grid-cols-2 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="flex items-center gap-2">
                  <MapPin size={18} style={{ color: 'var(--text-secondary)' }} />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase size={18} style={{ color: 'var(--text-secondary)' }} />
                  <span>{job.jobType}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign size={18} style={{ color: 'var(--text-secondary)' }} />
                  <span>{formatSalary(job.salary?.min, job.salary?.max)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} style={{ color: 'var(--text-secondary)' }} />
                  <span>{job.applicationsCount || 0} applicants</span>
                </div>
                {job.workMode && (
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span>{job.workMode}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock size={18} style={{ color: 'var(--text-secondary)' }} />
                  <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <div className="mb-4">
                  <h4 style={{ marginBottom: '1rem' }}>Required Skills</h4>
                  <div className="flex gap-2 flex-wrap">
                    {job.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="card mb-6">
              <h3>Job Description</h3>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="card mb-6">
                <h3>Requirements</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {job.requirements.map((req, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="card mb-6">
                <h3>Key Responsibilities</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="card">
                <h3>What We Offer</h3>
                <ul style={{ paddingLeft: '1.5rem' }}>
                  {job.benefits.map((benefit, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Apply Card */}
            <div className="card mb-6" style={{ position: 'sticky', top: '2rem' }}>
              {!isAuthenticated ? (
                <>
                  <h4>Ready to Apply?</h4>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Sign in to apply for this position
                  </p>
                  <Link to="/login" className="btn btn-primary w-full mb-2">
                    Sign In to Apply
                  </Link>
                  <Link to="/register" className="btn btn-secondary w-full">
                    Create Account
                  </Link>
                </>
              ) : user?.role !== 'student' ? (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255, 152, 0, 0.1)', 
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={16} style={{ color: 'var(--warning)' }} />
                  <span style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>
                    Only students can apply for jobs
                  </span>
                </div>
              ) : applied ? (
                <div style={{ textAlign: 'center' }}>
                  <CheckCircle size={48} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
                  <h4 style={{ color: 'var(--success)' }}>Application Submitted!</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Your application has been sent to the recruiter. You'll receive updates via email.
                  </p>
                  <Link to="/student/applications" className="btn btn-outline w-full mt-4">
                    View My Applications
                  </Link>
                </div>
              ) : job.status !== 'active' ? (
                <div style={{ 
                  padding: '1rem', 
                  backgroundColor: 'rgba(244, 67, 54, 0.1)', 
                  borderRadius: 'var(--radius)',
                  textAlign: 'center'
                }}>
                  <AlertCircle size={24} style={{ color: 'var(--error)', margin: '0 auto 0.5rem' }} />
                  <span style={{ color: 'var(--error)' }}>
                    This job is no longer accepting applications
                  </span>
                </div>
              ) : !showApplicationForm ? (
                <>
                  <h4>Apply for this Position</h4>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Join {job.applicationsCount || 0} other candidates who have applied
                  </p>
                  <button
                    onClick={() => setShowApplicationForm(true)}
                    className="btn btn-primary w-full"
                  >
                    <Send size={16} />
                    Apply Now
                  </button>
                </>
              ) : (
                <form onSubmit={handleApply}>
                  <h4>Apply for {job.title}</h4>
                  <div className="form-group">
                    <label className="form-label">Cover Letter (Optional)</label>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      className="form-input form-textarea"
                      placeholder="Tell us why you're perfect for this role..."
                      rows="6"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={applying}
                      className="btn btn-primary flex-1"
                    >
                      {applying ? (
                        <>
                          <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                          Applying...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Application
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Job Info */}
            <div className="card">
              <h4>Job Information</h4>
              <div className="flex flex-col gap-3">
                {job.experience && (
                  <div>
                    <span style={{ fontWeight: '500' }}>Experience Required:</span>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {job.experience.min} - {job.experience.max} years
                    </div>
                  </div>
                )}
                
                {job.applicationDeadline && (
                  <div>
                    <span style={{ fontWeight: '500' }}>Application Deadline:</span>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </div>
                  </div>
                )}

                <div>
                  <span style={{ fontWeight: '500' }}>Job ID:</span>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {job._id}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
