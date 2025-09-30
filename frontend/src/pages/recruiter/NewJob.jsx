import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { 
  Save, 
  X, 
  Plus,
  Minus,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Users,
  FileText,
  Building
} from 'lucide-react';

export default function NewJob() {
  const navigate = useNavigate();
  const [loading, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    jobType: 'Full-time',
    workMode: 'On-site',
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: '',
    experience: {
      min: 0,
      max: 5
    },
    salary: {
      min: '',
      max: ''
    },
    benefits: [''],
    applicationDeadline: ''
  });

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleSubmit = async (e, status = 'active') => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobData = {
        ...formData,
        status,
        requirements: formData.requirements.filter(req => req.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        skills: typeof formData.skills === 'string' 
          ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
          : formData.skills
      };

      const response = await api.post('/jobs', jobData);
      const jobId = response.data.job._id;
      
      alert(`Job ${status === 'draft' ? 'saved as draft' : 'posted'} successfully!`);
      navigate(`/recruiter/jobs/${jobId}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create job');
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
            <h1>Post a New Job</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Create a compelling job posting to attract the best candidates
            </p>
          </div>
          <button 
            onClick={() => navigate('/recruiter/jobs')}
            className="btn btn-secondary"
          >
            <X size={16} />
            Cancel
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, 'active')}>
          {/* Basic Information */}
          <div className="card mb-6">
            <h3>Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  <Briefcase size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="form-input"
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="form-input"
                  placeholder="Tech Corp Inc."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="form-input"
                  placeholder="San Francisco, CA"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Job Type *
                </label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="form-input form-select"
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Work Mode</label>
                <select
                  value={formData.workMode}
                  onChange={(e) => handleInputChange('workMode', e.target.value)}
                  className="form-input form-select"
                >
                  <option value="On-site">On-site</option>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="card mb-6">
            <h3>Job Description</h3>
            <div className="form-group">
              <label className="form-label">
                <FileText size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="form-input form-textarea"
                rows="8"
                placeholder="Describe the role, what the candidate will be doing, and what makes this opportunity exciting..."
                required
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="card mb-6">
            <h3>Requirements</h3>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="form-group">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                      className="form-input"
                      placeholder="Bachelor's degree in Computer Science or related field"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="btn btn-secondary btn-sm"
                    disabled={formData.requirements.length === 1}
                  >
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} />
              Add Requirement
            </button>
          </div>

          {/* Responsibilities */}
          <div className="card mb-6">
            <h3>Key Responsibilities</h3>
            {formData.responsibilities.map((responsibility, index) => (
              <div key={index} className="form-group">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      type="text"
                      value={responsibility}
                      onChange={(e) => handleArrayChange('responsibilities', index, e.target.value)}
                      className="form-input"
                      placeholder="Design and develop scalable web applications"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayItem('responsibilities', index)}
                    className="btn btn-secondary btn-sm"
                    disabled={formData.responsibilities.length === 1}
                  >
                    <Minus size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="btn btn-outline btn-sm"
            >
              <Plus size={14} />
              Add Responsibility
            </button>
          </div>

          {/* Skills & Experience */}
          <div className="card mb-6">
            <h3>Skills & Experience</h3>
            
            <div className="form-group">
              <label className="form-label">Required Skills</label>
              <input
                type="text"
                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                onChange={(e) => handleSkillsChange(e.target.value)}
                className="form-input"
                placeholder="React, Node.js, JavaScript, Python, etc."
              />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Separate skills with commas
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Minimum Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience.min}
                  onChange={(e) => handleInputChange('experience.min', parseInt(e.target.value))}
                  className="form-input"
                  min="0"
                  max="20"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Maximum Experience (years)</label>
                <input
                  type="number"
                  value={formData.experience.max}
                  onChange={(e) => handleInputChange('experience.max', parseInt(e.target.value))}
                  className="form-input"
                  min="0"
                  max="20"
                />
              </div>
            </div>
          </div>

          {/* Salary & Benefits */}
          <div className="card mb-6">
            <h3>Compensation & Benefits</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Minimum Salary (₹/year)
                </label>
                <input
                  type="number"
                  value={formData.salary.min}
                  onChange={(e) => handleInputChange('salary.min', e.target.value)}
                  className="form-input"
                  placeholder="500000"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Maximum Salary (₹/year)</label>
                <input
                  type="number"
                  value={formData.salary.max}
                  onChange={(e) => handleInputChange('salary.max', e.target.value)}
                  className="form-input"
                  placeholder="1200000"
                />
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: '1rem' }}>Benefits & Perks</h4>
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="form-group">
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleArrayChange('benefits', index, e.target.value)}
                        className="form-input"
                        placeholder="Health insurance, flexible working hours, etc."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('benefits', index)}
                      className="btn btn-secondary btn-sm"
                      disabled={formData.benefits.length === 1}
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('benefits')}
                className="btn btn-outline btn-sm"
              >
                <Plus size={14} />
                Add Benefit
              </button>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between items-center">
            <button 
              type="button"
              onClick={() => navigate('/recruiter/jobs')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, 'draft')}
                className="btn btn-outline"
                disabled={loading}
              >
                Save as Draft
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Post Job
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
