import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  LogOut, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings,
  Home
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <ul className="navbar-nav">
          <li><Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>Home</Link></li>
          <li><Link to="/jobs" className={`navbar-link ${isActive('/jobs') ? 'active' : ''}`}>Jobs</Link></li>
          <li><Link to="/login" className="btn btn-outline btn-sm">Login</Link></li>
          <li><Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link></li>
        </ul>
      );
    }

    const roleLinks = {
      student: [
        { path: '/student', label: 'Dashboard', icon: Home },
        { path: '/jobs', label: 'Browse Jobs', icon: Briefcase },
        { path: '/student/applications', label: 'My Applications', icon: FileText },
        { path: '/student/notifications', label: 'Notifications', icon: Bell },
      ],
      recruiter: [
        { path: '/recruiter', label: 'Dashboard', icon: Home },
        { path: '/recruiter/jobs', label: 'My Jobs', icon: Briefcase },
        { path: '/recruiter/applications', label: 'Applications', icon: FileText },
        { path: '/recruiter/profile', label: 'Profile', icon: User },
      ],
      admin: [
        { path: '/admin', label: 'Dashboard', icon: Home },
        { path: '/admin/jobs', label: 'All Jobs', icon: Briefcase },
        { path: '/admin/users', label: 'Users', icon: User },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
      ]
    };

    const links = roleLinks[user?.role] || [];

    return (
      <ul className="navbar-nav">
        {links.map(({ path, label, icon: Icon }) => (
          <li key={path}>
            <Link 
              to={path} 
              className={`navbar-link ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={16} />
              {label}
            </Link>
          </li>
        ))}
        <li>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Hello, {user?.name}</span>
            <button 
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </li>
      </ul>
    );
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            🎯 PlaceVerse
          </Link>
          {getNavLinks()}
        </div>
      </div>
    </nav>
  );
}
