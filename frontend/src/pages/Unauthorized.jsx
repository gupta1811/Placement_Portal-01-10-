import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowLeft, Home } from 'lucide-react';

export default function Unauthorized() {
  const { user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/';
    return `/${user.role}`;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'var(--bg-secondary)'
    }}>
      <div className="container">
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div className="card animate-fade-in">
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, var(--error) 0%, #ff6b6b 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 2rem'
            }}>
              <Shield size={48} color="white" />
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--error)' }}>
              Access Denied
            </h1>
            
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              You don't have permission to access this page. This area is restricted to authorized personnel only.
            </p>

            <div style={{ 
              background: 'rgba(244, 67, 54, 0.1)', 
              padding: '1rem', 
              borderRadius: 'var(--radius)',
              marginBottom: '2rem'
            }}>
              <p style={{ color: 'var(--error)', margin: 0, fontSize: '0.875rem' }}>
                <strong>Error Code:</strong> 403 - Forbidden
              </p>
            </div>

            <div className="flex gap-4" style={{ justifyContent: 'center' }}>
              <button 
                onClick={() => window.history.back()}
                className="btn btn-outline"
              >
                <ArrowLeft size={16} />
                Go Back
              </button>
              
              <Link 
                to={getDashboardLink()}
                className="btn btn-primary"
              >
                <Home size={16} />
                {user ? 'Go to Dashboard' : 'Go Home'}
              </Link>
            </div>

            {user && (
              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-light)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Signed in as: <strong>{user.name}</strong> ({user.role})
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
