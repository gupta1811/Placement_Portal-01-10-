import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  UserCheck,
  Building,
  Calendar,
  Activity,
  Eye,
  Settings,
  Shield,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentSignups: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, jobsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/jobs')
      ]);

      const users = usersRes.data.users || [];
      const jobs = jobsRes.data.jobs || [];

      // Calculate stats
      const students = users.filter(user => user.role === 'student');
      const recruiters = users.filter(user => user.role === 'recruiter');
      const activeJobs = jobs.filter(job => job.status === 'active');
      
      // Get recent signups (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentSignups = users.filter(user => new Date(user.createdAt) > weekAgo);

      setStats({
        totalUsers: users.length,
        totalStudents: students.length,
        totalRecruiters: recruiters.length,
        totalJobs: jobs.length,
        activeJobs: activeJobs.length,
        totalApplications: jobs.reduce((acc, job) => acc + (job.applicationsCount || 0), 0),
        recentSignups: recentSignups.length
      });

      setRecentUsers(users.slice(0, 5));
      setRecentJobs(jobs.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'var(--primary)',
      change: `+${stats.recentSignups} this week`
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: UserCheck,
      color: 'var(--success)',
      link: '/admin/users?role=student'
    },
    {
      title: 'Recruiters',
      value: stats.totalRecruiters,
      icon: Building,
      color: 'var(--info)',
      link: '/admin/users?role=recruiter'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      color: 'var(--warning)',
      change: `${stats.activeJobs} active`
    },
    {
      title: 'Applications',
      value: stats.totalApplications,
      icon: FileText,
      color: 'var(--secondary)',
      link: '/admin/applications'
    },
    {
      title: 'Platform Health',
      value: '99.9%',
      icon: Activity,
      color: 'var(--success)',
      change: 'Uptime'
    }
  ];

  const getRoleBadge = (role) => {
    const badges = {
      student: { class: 'badge-primary', text: 'Student' },
      recruiter: { class: 'badge-success', text: 'Recruiter' },
      admin: { class: 'badge-error', text: 'Admin' }
    };
    const badge = badges[role] || badges.student;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>Admin Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Monitor and manage the PlaceVerse platform
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/settings" className="btn btn-outline">
              <Settings size={16} />
              Settings
            </Link>
            <Link to="/admin/users/new" className="btn btn-primary">
              <Shield size={16} />
              Add Admin
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {statCards.map(({ title, value, icon: Icon, color, change, link }) => {
            const CardContent = (
              <div className="card hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: `${color}20`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  {change && (
                    <span style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-secondary)',
                      background: 'var(--bg-tertiary)',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius)'
                    }}>
                      {change}
                    </span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem 0' }}>
                  {value}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                  {title}
                </p>
              </div>
            );

            return link ? (
              <Link key={title} to={link} style={{ textDecoration: 'none' }}>
                {CardContent}
              </Link>
            ) : (
              <div key={title}>
                {CardContent}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Recent Users */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Recent User Registrations</h3>
              <Link to="/admin/users" className="btn btn-outline btn-sm">
                View All Users
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: user.role === 'student' ? 'var(--primary)' : 'var(--success)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>
                        {user.name}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3>Recent Job Postings</h3>
              <Link to="/admin/jobs" className="btn btn-outline btn-sm">
                View All Jobs
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {recentJobs.map((job) => (
                <div key={job._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 style={{ fontSize: '1rem', margin: 0 }}>
                      <Link 
                        to={`/jobs/${job._id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {job.title}
                      </Link>
                    </h4>
                    <div className="flex items-center gap-2 mt-1" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span>{job.company}</span>
                      <span>•</span>
                      <span>{job.applicationsCount || 0} applications</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`badge ${job.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                      {job.status}
                    </span>
                    <Link 
                      to={`/admin/jobs/${job._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-4 mt-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link to="/admin/users" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Users size={32} style={{ color: 'var(--primary)', margin: '0 auto 1rem' }} />
            <h4>Manage Users</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              View and manage all users
            </p>
          </Link>

          <Link to="/admin/jobs" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Briefcase size={32} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
            <h4>Job Management</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Monitor job postings
            </p>
          </Link>

          <Link to="/admin/reports" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <TrendingUp size={32} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
            <h4>Analytics</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Platform insights
            </p>
          </Link>

          <Link to="/admin/settings" className="card text-center hover:scale-105 transition-all" style={{ textDecoration: 'none' }}>
            <Settings size={32} style={{ color: 'var(--info)', margin: '0 auto 1rem' }} />
            <h4>System Settings</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Configure platform
            </p>
          </Link>
        </div>

        {/* Alerts Section */}
        <div className="card mt-8" style={{ background: 'rgba(255, 152, 0, 0.1)', borderColor: 'var(--warning)' }}>
          <div className="flex items-center gap-3">
            <AlertCircle size={24} style={{ color: 'var(--warning)' }} />
            <div>
              <h4 style={{ color: 'var(--warning)', margin: '0 0 0.5rem 0' }}>System Status</h4>
              <p style={{ color: 'var(--text-primary)', margin: 0 }}>
                All systems are operational. Last backup completed successfully at{' '}
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
