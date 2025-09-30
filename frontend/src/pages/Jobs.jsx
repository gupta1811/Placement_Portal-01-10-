import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  Search, 
  MapPin, 
  Filter, 
  Briefcase, 
  Clock, 
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    location: '',
    jobType: '',
    workMode: '',
    minSalary: '',
    skills: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasMore: false
  });

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12,
        ...Object.entries(filters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {})
      });

      const response = await api.get(`/jobs?${params}`);
      setJobs(response.data.jobs || []);
      setPagination(prev => ({
        ...prev,
        ...response.data.pagination
      }));
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      jobType: '',
      workMode: '',
      minSalary: '',
      skills: ''
    });
  };

  const formatSalary = (min, max) => {
    if (!min || !max) return null;
    return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L`;
  };

  const jobTypes = ['Full-time', 'Part-time', 'Internship', 'Contract'];
  const workModes = ['Remote', 'On-site', 'Hybrid'];

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1>Find Your Perfect Job</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {pagination.totalJobs > 0 && `${pagination.totalJobs} opportunities waiting for you`}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <form onSubmit={handleSearch} className="mb-4">
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
                    placeholder="Search jobs, companies, skills..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '3rem' }}
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Filter size={16} />
                Filters
              </button>
              
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="animate-fade-in" style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              marginTop: '1.5rem'
            }}>
              <div className="grid grid-cols-4 gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    placeholder="City or state"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Job Type</label>
                  <select
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="">Any</option>
                    {jobTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Work Mode</label>
                  <select
                    value={filters.workMode}
                    onChange={(e) => handleFilterChange('workMode', e.target.value)}
                    className="form-input form-select"
                  >
                    <option value="">Any</option>
                    {workModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Skills</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, etc."
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary btn-sm"
                >
                  <X size={16} />
                  Clear Filters
                </button>
                
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {Object.values(filters).filter(Boolean).length} active filters
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Finding perfect jobs for you...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3>No Jobs Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search criteria or filters
            </p>
            <button onClick={clearFilters} className="btn btn-primary mt-4">
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              {jobs.map((job, index) => (
                <div key={job._id} className="card animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                        <Link to={`/jobs/${job._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {job.title}
                        </Link>
                      </h3>
                      <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{job.company}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="badge badge-primary">{job.jobType}</span>
                      {job.workMode && (
                        <span className="badge badge-secondary">{job.workMode}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </div>
                    {job.salary?.min && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {formatSalary(job.salary.min, job.salary.max)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem', 
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {job.skills?.slice(0, 3).map((skill) => (
                        <span key={skill} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 3 && (
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="btn btn-secondary"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    const isActive = page === pagination.currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: page }))}
                        className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="btn btn-secondary"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
