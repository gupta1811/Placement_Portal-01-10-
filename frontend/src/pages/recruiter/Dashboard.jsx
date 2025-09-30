import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye,
  MapPin,
  Calendar,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  FileText,
  Building
} from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0,
    shortlisted: 0,
    selected: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, applicationsRes, statsRes] = await Promise.all([
        api.get('/jobs/my-jobs?limit=5'),
        api.get('/applications/recruiter-applications?limit=8'),
        api.get('/applications/stats')
      ]);

      setRecentJobs(jobsRes.data.jobs || []);
      setRecentApplications(applicationsRes.data.applications || []);
      
      const jobStats = jobsRes.data.jobs || [];
      const applicationStats = statsRes.data.stats || {};
      
      setStats({
        totalJobs: jobStats.length,
        activeJobs: jobStats.filter(job => job.status === 'active').length,
        totalApplications: applicationStats.totalApplications || 0,
        pendingReview: applicationStats.byStatus?.pending || 0,
        shortlisted: applicationStats.byStatus?.shortlisted || 0,
        selected: applicationStats.byStatus?.selected || 0
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'var(--primary)',
      link: '/recruiter/jobs'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: TrendingUp,
      color: 'var(--success)',
      link: '/recruiter/jobs'
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'var(--info)',
      link: '/recruiter/applications'
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview,
      icon: Clock,
      color: 'var(--warning)',
      link: '/recruiter/applications'
    }
  ];

  return (
    <div className="py-8">
      <div className="container">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage your job postings and review applications
            </p>
          </div>
          <Link to="/recruiter/jobs/new" className="btn btn-primary">
            <Plus size={16} />
            Post New Job
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {statCards.map(({ title, value, icon: Icon, color, link }, index) => (
            <Link key={title} to={link} className="card hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    {title}
                  </p>
                  <h3 style={{ fontSize: '2rem', fontWeight: '700', margin: 0 }}>
                    {value}
                  </h3>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: `${color}20`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} style={{ color }} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Recent Jobs */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Your Recent Jobs</h3>
              <Link to="/recruiter/jobs" className="btn btn-outline btn-sm">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
                <h4>No Jobs Posted Yet</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Start by posting your first job to attract candidates
                </p>
                <Link to="/recruiter/jobs/new" className="btn btn-primary">
                  <Plus size={16} />
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        <Link 
                          to={`/recruiter/jobs/${job._id}`}
                          style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                          {job.title}
                        </Link>
                      </h4>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          {job.applicationsCount || 0} applicants
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                        {job.status}
                      </span>
                      <Link 
                        to={`/recruiter/jobs/${job._id}/applications`}
                        className="btn btn-outline btn-sm"
                      >
                        <Users size={14} />
                        View Applications
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Recent Applications</h3>
              <Link to="/recruiter/applications" className="btn btn-outline btn-sm">
                <ArrowRight size={16} />
                View All
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
                <h4>No Applications Yet</h4>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Applications will appear here once candidates apply to your jobs
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentApplications.slice(0, 6).map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {application.studentID?.name}
                      </h4>
                      <p style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.25rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        Applied for: {application.jobID?.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        {new Date(application.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {getStatusBadge(application.status)}
                      <Link 
                        to={`/recruiter/applications/${application._id}`}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/recruiter/jobs/new" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Plus size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h4>Post New Job</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Create and publish job openings
            </p>
          </Link>

          <Link to="/recruiter/applications" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <FileText size={32} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
            <h4>Review Applications</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Manage candidate applications
            </p>
          </Link>

          <Link to="/recruiter/profile" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Building size={32} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
            <h4>Company Profile</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Update company information
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
