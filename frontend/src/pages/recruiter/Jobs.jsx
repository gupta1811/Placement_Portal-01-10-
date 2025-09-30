import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3,
  Trash2,
  Users,
  MapPin,
  Calendar,
  Eye,
  MoreVertical,
  Settings,
  RefreshCw
} from 'lucide-react';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/my-jobs');
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.put(`/jobs/${jobId}`, { status: newStatus });
      setJobs(prev => prev.map(job => 
        job._id === jobId ? { ...job, status: newStatus } : job
      ));
      alert('Job status updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(job => job._id !== jobId));
      alert('Job deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: { class: 'badge-success', text: 'Active' },
      closed: { class: 'badge-error', text: 'Closed' },
      draft: { class: 'badge-secondary', text: 'Draft' }
    };
    const badge = badges[status] || badges.draft;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading your jobs...</p>
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
            <h1>My Jobs</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your job postings and track applications
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={fetchJobs}
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link to="/recruiter/jobs/new" className="btn btn-primary">
              <Plus size={16} />
              Post New Job
            </Link>
          </div>
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
                  placeholder="Search jobs..."
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
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="card text-center py-12">
            <Plus size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3>
              {jobs.length === 0 ? 'No Jobs Posted Yet' : 'No Matching Jobs'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {jobs.length === 0 
                ? 'Create your first job posting to start hiring'
                : 'Try adjusting your search or filter criteria'
              }
            </p>
            {jobs.length === 0 && (
              <Link to="/recruiter/jobs/new" className="btn btn-primary">
                <Plus size={16} />
                Post Your First Job
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <div key={job._id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                        <Link 
                          to={`/jobs/${job._id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {job.title}
                        </Link>
                      </h3>
                      {getStatusBadge(job.status)}
                    </div>

                    <div className="flex items-center gap-4 mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={16} />
                        {job.applicationsCount || 0} applications
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.875rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginBottom: '1rem'
                    }}>
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {job.skills.slice(0, 5).map((skill) => (
                          <span key={skill} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                            +{job.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions Menu */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setShowActions(showActions === job._id ? null : job._id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {showActions === job._id && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 10,
                        minWidth: '180px',
                        marginTop: '0.5rem'
                      }}>
                        <div style={{ padding: '0.5rem' }}>
                          <Link
                            to={`/jobs/${job._id}`}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                            style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
                          >
                            <Eye size={14} />
                            View Job
                          </Link>
                          <Link
                            to={`/recruiter/jobs/${job._id}/edit`}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                            style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
                          >
                            <Edit3 size={14} />
                            Edit Job
                          </Link>
                          <Link
                            to={`/recruiter/jobs/${job._id}/applications`}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                            style={{ display: 'flex', textDecoration: 'none', color: 'inherit' }}
                          >
                            <Users size={14} />
                            View Applications ({job.applicationsCount || 0})
                          </Link>
                          
                          <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--border)' }} />
                          
                          <button
                            onClick={() => handleStatusChange(job._id, job.status === 'active' ? 'closed' : 'active')}
                            className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Settings size={14} />
                            {job.status === 'active' ? 'Close Job' : 'Activate Job'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="w-full text-left p-2 hover:bg-red-100 rounded flex items-center gap-2"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                          >
                            <Trash2 size={14} />
                            Delete Job
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-4 mt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Last updated: {new Date(job.updatedAt || job.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      to={`/recruiter/jobs/${job._id}/applications`}
                      className="btn btn-outline btn-sm"
                    >
                      <Users size={14} />
                      Applications
                    </Link>
                    <Link 
                      to={`/recruiter/jobs/${job._id}/edit`}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit3 size={14} />
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Click outside to close actions menu */}
      {showActions && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5
          }}
          onClick={() => setShowActions(null)}
        />
      )}
    </div>
  );
}