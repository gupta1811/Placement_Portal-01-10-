import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe,
  Building,
  Save,
  Edit3,
  Briefcase,
  Users,
  Award
} from 'lucide-react';

export default function RecruiterProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    company: '',
    position: '',
    location: '',
    website: '',
    bio: '',
    companySize: '',
    industry: ''
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        ...user.profile
      }));
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/profile', profile);
      alert('Profile updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="py-8">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>Company Profile</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Keep your profile updated to attract better candidates
            </p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Personal Information */}
        <div className="card mb-6">
          <h3>Personal Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Full Name
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                className="form-input"
                disabled
                style={{ opacity: 0.7 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Phone Number
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="form-input"
                placeholder="+91 9876543210"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Your Position
              </label>
              <input
                type="text"
                value={profile.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="form-input"
                placeholder="HR Manager, CEO, etc."
              />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="card mb-6">
          <h3>Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">
                <Building size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Company Name
              </label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="form-input"
                placeholder="Tech Corp Inc."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Award size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Industry
              </label>
              <select
                value={profile.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="form-input form-select"
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media & Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="form-input"
                placeholder="San Francisco, CA"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Company Size
              </label>
              <select
                value={profile.companySize}
                onChange={(e) => handleInputChange('companySize', e.target.value)}
                className="form-input form-select"
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1000+">1000+ employees</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">
                <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Company Website
              </label>
              <input
                type="url"
                value={profile.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="form-input"
                placeholder="https://www.company.com"
              />
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="card">
          <h3>Company Description</h3>
          <div className="form-group">
            <label className="form-label">About Your Company</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="form-input form-textarea"
              placeholder="Tell candidates about your company, culture, mission, and what makes it a great place to work..."
              rows="6"
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              This will be visible to candidates when they view your job postings
            </p>
          </div>
        </div>

        {/* Profile Preview */}
        <div className="card mt-6" style={{ background: 'var(--bg-tertiary)' }}>
          <h3>Profile Preview</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            This is how your profile appears to candidates:
          </p>
          
          <div className="card" style={{ background: 'var(--bg-primary)' }}>
            <div className="flex items-start gap-4">
              <div style={{
                width: '60px',
                height: '60px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                {(profile.company || profile.name || 'C').charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h3 style={{ margin: '0 0 0.5rem 0' }}>
                  {profile.company || 'Your Company Name'}
                </h3>
                
                <div className="flex items-center gap-4 mb-2" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {profile.industry && (
                    <div className="flex items-center gap-1">
                      <Award size={14} />
                      {profile.industry}
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profile.location}
                    </div>
                  )}
                  
                  {profile.companySize && (
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {profile.companySize} employees
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {profile.bio}
                  </p>
                )}

                {profile.website && (
                  <div className="mt-2">
                    <a 
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ 
                        color: 'var(--primary)', 
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Globe size={14} />
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
