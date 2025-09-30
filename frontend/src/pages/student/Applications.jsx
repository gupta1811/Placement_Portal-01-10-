import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar,
  MapPin,
  Building,
  Clock,
  Eye,
  Download,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications/my-applications');
      const apps = response.data.applications || [];
      setApplications(apps);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobID?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobID?.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'Pending', icon: Clock },
      reviewing: { class: 'badge-info', text: 'Under Review', icon: Eye },
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

  const getStatusColor = (status) => {
    const colors = {
      pending: 'var(--warning)',
      reviewing: 'var(--info)',
      shortlisted: 'var(--primary)',
      interviewed: 'var(--info)',
      selected: 'var(--success)',
      rejected: 'var(--error)'
    };
    return colors[status] || 'var(--text-secondary)';
  };

  const statusOptions = [
    { value: 'all', label: 'All Applications' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interviewed', label: 'Interviewed' },
    { value: 'selected', label: 'Selected' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const stats = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading your applications...</p>
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
            <h1>My Applications</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track and manage your job applications
            </p>
          </div>
          <button 
            onClick={fetchApplications}
            className="btn btn-outline"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-6 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{applications.length}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Applications</p>
          </div>
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="card text-center">
              <h3 style={{ fontSize: '1.75rem', color: getStatusColor(status) }}>{count}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                {status === 'reviewing' ? 'Under Review' : status}
              </p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="card mb-6">
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
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
                  placeholder="Search applications..."
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
                ? 'Start applying to jobs to see your applications here'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {applications.length === 0 && (
              <Link to="/jobs" className="btn btn-primary">
                Browse Jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredApplications.map((application) => (
              <div key={application._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                      <Link 
                        to={`/jobs/${application.jobID?._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {application.jobID?.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-4 mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <Building size={16} />
                        <span style={{ color: 'var(--primary)', fontWeight: '600' }}>
                          {application.jobID?.company}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {application.jobID?.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Applied {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {getStatusBadge(application.status)}
                    <Link 
                      to={`/jobs/${application.jobID?._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={16} />
                      View Job
                    </Link>
                  </div>
                </div>

                {/* Cover Letter Preview */}
                {application.coverLetter && (
                  <div style={{ 
                    background: 'var(--bg-tertiary)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius)',
                    marginBottom: '1rem'
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Cover Letter</span>
                    </div>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                {/* Resume Link */}
                {application.resumeUrl && (
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} style={{ color: 'var(--text-secondary)' }} />
                    <a 
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm"
                      style={{ color: 'var(--primary)', textDecoration: 'none' }}
                    >
                      View Submitted Resume
                    </a>
                  </div>
                )}

                {/* Recruiter Notes */}
                {application.recruiterNotes && (
                  <div style={{ 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    padding: '1rem', 
                    borderRadius: 'var(--radius)',
                    borderLeft: '4px solid var(--primary)'
                  }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontWeight: '500', fontSize: '0.875rem' }}>Recruiter Notes</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                      {application.recruiterNotes}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Last updated: {new Date(application.lastUpdated || application.appliedAt).toLocaleString()}
                  </div>
                  
                  {application.status === 'selected' && (
                    <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontSize: '0.875rem' }}>
                      <CheckCircle size={16} />
                      <span>Congratulations! 🎉</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
