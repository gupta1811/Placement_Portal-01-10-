import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Search, MapPin, Briefcase, Users, TrendingUp, Star, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await api.get('/jobs?limit=6');
      setFeaturedJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Navigate to jobs page with search query
    window.location.href = `/jobs?search=${encodeURIComponent(searchTerm)}`;
  };

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '10K+' },
    { icon: Users, label: 'Happy Candidates', value: '50K+' },
    { icon: TrendingUp, label: 'Success Rate', value: '95%' },
    { icon: Star, label: 'Top Companies', value: '500+' }
  ];

  const features = [
    {
      title: 'Smart Job Matching',
      description: 'Our AI-powered system matches you with the perfect job opportunities based on your skills and preferences.',
      icon: '🎯'
    },
    {
      title: 'Real-time Notifications',
      description: 'Get instant updates about your applications and never miss an opportunity.',
      icon: '🔔'
    },
    {
      title: 'Professional Profiles',
      description: 'Create a standout profile that showcases your skills and attracts top employers.',
      icon: '👤'
    },
    {
      title: 'Easy Application',
      description: 'Apply to multiple jobs with just one click using your saved profile and resume.',
      icon: '⚡'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '4rem 0',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container">
          <div className="grid grid-cols-1" style={{ gridTemplateColumns: '1fr', textAlign: 'center' }}>
            <div className="animate-fade-in">
              <h1 style={{ fontSize: '3.5rem', fontWeight: '700', marginBottom: '1.5rem', lineHeight: '1.2' }}>
                Find Your Dream Job with <br />
                <span style={{ background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  PlaceVerse
                </span>
              </h1>
              <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto 2rem' }}>
                Connect with top companies, discover exciting opportunities, and take your career to the next level.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  maxWidth: '500px',
                  margin: '0 auto',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <input
                    type="text"
                    placeholder="Search jobs, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      padding: '1rem',
                      color: 'white',
                      fontSize: '1rem'
                    }}
                  />
                  <button type="submit" className="btn btn-primary">
                    <Search size={20} />
                    Search
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex gap-4" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                {!isAuthenticated ? (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg">
                      Get Started
                      <ArrowRight size={20} />
                    </Link>
                    <Link to="/jobs" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255, 255, 255, 0.2)', borderColor: 'rgba(255, 255, 255, 0.3)', color: 'white' }}>
                      Browse Jobs
                    </Link>
                  </>
                ) : (
                  <Link to={`/${user?.role}`} className="btn btn-primary btn-lg">
                    Go to Dashboard
                    <ArrowRight size={20} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="grid grid-cols-4 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            {stats.map(({ icon: Icon, label, value }, index) => (
              <div key={label} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem'
                }}>
                  <Icon size={32} color="white" />
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>{value}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>Featured Job Opportunities</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
              Discover amazing career opportunities from top companies
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
              {featuredJobs.slice(0, 6).map((job, index) => (
                <div key={job._id} className="card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{job.title}</h3>
                      <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{job.company}</p>
                    </div>
                    <span className="badge badge-primary">{job.jobType}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {job.location}
                    </div>
                    {job.salary?.min && (
                      <div>
                        ₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L
                      </div>
                    )}
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
                    <div className="flex gap-2">
                      {job.skills?.slice(0, 2).map((skill) => (
                        <span key={skill} className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          {skill}
                        </span>
                      ))}
                      {job.skills?.length > 2 && (
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          +{job.skills.length - 2}
                        </span>
                      )}
                    </div>
                    <Link to={`/jobs/${job._id}`} className="btn btn-outline btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link to="/jobs" className="btn btn-primary">
              View All Jobs
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="text-center mb-8">
            <h2>Why Choose PlaceVerse?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
              We make job searching and hiring simple, efficient, and effective
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {features.map((feature, index) => (
              <div key={feature.title} className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div style={{ fontSize: '3rem', flexShrink: 0 }}>
                  {feature.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{feature.title}</h3>
                  <p style={{ color: 'var(--text-secondary)' }}>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        color: 'white',
        padding: '4rem 0'
      }}>
        <div className="container text-center">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Get Started?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem', opacity: '0.9' }}>
            Join thousands of professionals who found their dream jobs through PlaceVerse
          </p>
          
          {!isAuthenticated && (
            <div className="flex gap-4" style={{ justifyContent: 'center' }}>
              <Link to="/register?role=student" className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--primary)' }}>
                I'm Looking for Jobs
              </Link>
              <Link to="/register?role=recruiter" className="btn btn-outline btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                I'm Hiring Talent
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
