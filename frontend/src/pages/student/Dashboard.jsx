import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Clock, 
  MapPin,
  Building,
  Plus,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    offers: 0
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        api.get('/applications/my-applications'),
        api.get('/jobs?limit=5')
      ]);

      const applications = applicationsRes.data.applications || [];
      setRecentApplications(applications.slice(0, 5));
      
      // Calculate stats
      setStats({
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => ['pending', 'reviewing'].includes(app.status)).length,
        interviewsScheduled: applications.filter(app => app.status === 'interviewed').length,
        offers: applications.filter(app => app.status === 'selected').length
      });

      setRecommendedJobs(jobsRes.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'var(--primary)',
      link: '/student/applications'
    },
    {
      title: 'Pending Review',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'var(--warning)',
      link: '/student/applications'
    },
    {
      title: 'Interviews',
      value: stats.interviewsScheduled,
      icon: TrendingUp,
      color: 'var(--info)',
      link: '/student/applications'
    },
    {
      title: 'Job Offers',
      value: stats.offers,
      icon: CheckCircle,
      color: 'var(--success)',
      link: '/student/applications'
    }
  ];

  return (
    <div className="py-8">
      <div className="container">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Here's your job search progress and recommended opportunities
          </p>
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

        <div className="grid grid-cols-1" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Recent Applications */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Recent Applications</h3>
              <Link to="/student/applications" className="btn btn-outline btn-sm">
                View All
                <ArrowRight size={16} />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
                <h4>No Applications Yet</h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Start applying to jobs to see your progress here
                </p>
                <Link to="/jobs" className="btn btn-primary">
                  <Plus size={16} />
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h4 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                        {application.jobID?.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-1">
                          <Building size={14} />
                          {application.jobID?.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          {application.jobID?.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(application.status)}
                      <Link 
                        to={`/jobs/${application.jobID?._id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Jobs */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Recommended for You</h3>
              <Link to="/jobs" className="btn btn-outline btn-sm">
                <ArrowRight size={16} />
                View All
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              {recommendedJobs.slice(0, 4).map((job) => (
                <div key={job._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                    <Link 
                      to={`/jobs/${job._id}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {job.title}
                    </Link>
                  </h4>
                  
                  <p style={{ 
                    color: 'var(--primary)', 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem'
                  }}>
                    {job.company}
                  </p>

                  <div className="flex items-center gap-3 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      {job.location}
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                      {job.jobType}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      {job.skills?.slice(0, 2).map((skill) => (
                        <span key={skill} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 2 && (
                        <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                          +{job.skills.length - 2}
                        </span>
                      )}
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn btn-primary btn-sm">
                      Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/jobs" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Briefcase size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h4>Browse Jobs</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Discover new opportunities
            </p>
          </Link>

          <Link to="/student/profile" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <FileText size={32} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
            <h4>Update Profile</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Keep your profile current
            </p>
          </Link>

          <Link to="/student/applications" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <TrendingUp size={32} style={{ color: 'var(--info)', margin: '0 auto 1rem' }} />
            <h4>Track Applications</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Monitor your progress
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
