import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Github,
  Linkedin,
  Globe,
  Save,
  Plus,
  Trash2,
  Edit3,
  Upload
} from 'lucide-react';

export default function StudentProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    dateOfBirth: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    social: {
      github: '',
      linkedin: '',
      portfolio: ''
    }
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
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({ ...prev, [field]: value }));
    }
  };

  const addArrayItem = (field, item) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...prev[field], item]
    }));
  };

  const updateArrayItem = (field, index, item) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].map((existing, i) => i === index ? item : existing)
    }));
  };

  const removeArrayItem = (field, index) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setProfile(prev => ({ ...prev, skills: skillsArray }));
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

  const ExperienceForm = ({ experience, onSave, onCancel }) => {
    const [formData, setFormData] = useState(experience || {
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });

    return (
      <div className="card">
        <h4>Add Experience</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="form-input"
              placeholder="Software Engineer"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="form-input"
              placeholder="Tech Corp"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="month"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="month"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="form-input"
              disabled={formData.current}
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                checked={formData.current}
                onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked }))}
              />
              <span style={{ fontSize: '0.875rem' }}>Currently working here</span>
            </label>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="form-input form-textarea"
            placeholder="Describe your role and achievements..."
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(formData)} className="btn btn-primary">Save</button>
          <button onClick={onCancel} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>My Profile</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Keep your profile updated to attract better opportunities
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

        {/* Basic Information */}
        <div className="card mb-6">
          <h3>Basic Information</h3>
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
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="form-input"
                placeholder="City, Country"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Date of Birth
              </label>
              <input
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="form-input form-textarea"
              placeholder="Tell recruiters about yourself, your interests, and career goals..."
              rows="4"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="card mb-6">
          <h3>Skills</h3>
          <div className="form-group">
            <label className="form-label">Technical Skills</label>
            <input
              type="text"
              value={profile.skills.join(', ')}
              onChange={(e) => handleSkillsChange(e.target.value)}
              className="form-input"
              placeholder="React, Node.js, Python, JavaScript, etc."
            />
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Separate skills with commas
            </p>
          </div>
          
          {profile.skills.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {profile.skills.map((skill, index) => (
                <span key={index} className="badge badge-primary">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Social Links */}
        <div className="card mb-6">
          <h3>Social Links</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="form-group">
              <label className="form-label">
                <Github size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                GitHub Profile
              </label>
              <input
                type="url"
                value={profile.social.github}
                onChange={(e) => handleInputChange('social.github', e.target.value)}
                className="form-input"
                placeholder="https://github.com/username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Linkedin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={profile.social.linkedin}
                onChange={(e) => handleInputChange('social.linkedin', e.target.value)}
                className="form-input"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Globe size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Portfolio Website
              </label>
              <input
                type="url"
                value={profile.social.portfolio}
                onChange={(e) => handleInputChange('social.portfolio', e.target.value)}
                className="form-input"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3>Work Experience</h3>
            <button className="btn btn-outline btn-sm">
              <Plus size={16} />
              Add Experience
            </button>
          </div>

          {profile.experience.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
              <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No work experience added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {profile.experience.map((exp, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4>{exp.title}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{exp.company}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                      </p>
                      {exp.description && (
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <button 
                      onClick={() => removeArrayItem('experience', index)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3>Education</h3>
            <button className="btn btn-outline btn-sm">
              <Plus size={16} />
              Add Education
            </button>
          </div>

          {profile.education.length === 0 ? (
            <div className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
              <GraduationCap size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>No education details added yet</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4>{edu.degree}</h4>
                      <p style={{ color: 'var(--primary)', fontWeight: '600' }}>{edu.institution}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {edu.startYear} - {edu.endYear}
                        {edu.grade && ` • Grade: ${edu.grade}`}
                      </p>
                    </div>
                    <button 
                      onClick={() => removeArrayItem('education', index)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
