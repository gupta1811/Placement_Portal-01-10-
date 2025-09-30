import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit3,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  Building,
  MoreVertical,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showActions, setShowActions] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    // Update URL when filters change
    if (roleFilter !== 'all') {
      setSearchParams({ role: roleFilter });
    } else {
      setSearchParams({});
    }
  }, [roleFilter, setSearchParams]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    if (!confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} this user?`)) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      alert(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(user => user._id !== userId));
      alert('User deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const exportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export users');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && (!user.status || user.status === 'active')) ||
      (statusFilter === 'suspended' && user.status === 'suspended');
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const badges = {
      student: { class: 'badge-primary', text: 'Student', icon: UserCheck },
      recruiter: { class: 'badge-success', text: 'Recruiter', icon: Building },
      admin: { class: 'badge-error', text: 'Admin', icon: Shield }
    };
    const badge = badges[role] || badges.student;
    const Icon = badge.icon;
    return (
      <span className={`badge ${badge.class}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    if (!status || status === 'active') {
      return (
        <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle size={12} />
          Active
        </span>
      );
    } else {
      return (
        <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle size={12} />
          Suspended
        </span>
      );
    }
  };

  const UserModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div className="card" style={{ width: '600px', maxHeight: '80vh', overflow: 'auto' }}>
          <div className="flex justify-between items-center mb-6">
            <h3>User Details</h3>
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div style={{
              width: '80px',
              height: '80px',
              background: user.role === 'student' ? 'var(--primary)' : user.role === 'recruiter' ? 'var(--success)' : 'var(--error)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2rem',
              fontWeight: '600'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0' }}>{user.name}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 0.5rem 0' }}>{user.email}</p>
              <div className="flex gap-2">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h4>Account Created</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h4>Last Login</h4>
              <p style={{ color: 'var(--text-secondary)' }}>
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </p>
            </div>
          </div>

          {user.profile && (
            <div className="mb-6">
              <h4>Profile Information</h4>
              <div className="card" style={{ background: 'var(--bg-tertiary)' }}>
                {user.role === 'student' ? (
                  <div>
                    <p><strong>Phone:</strong> {user.profile.phone || 'Not provided'}</p>
                    <p><strong>Location:</strong> {user.profile.location || 'Not provided'}</p>
                    <p><strong>Skills:</strong> {user.profile.skills?.join(', ') || 'Not provided'}</p>
                  </div>
                ) : (
                  <div>
                    <p><strong>Company:</strong> {user.profile.company || 'Not provided'}</p>
                    <p><strong>Position:</strong> {user.profile.position || 'Not provided'}</p>
                    <p><strong>Industry:</strong> {user.profile.industry || 'Not provided'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleToggleStatus(user._id, user.status || 'active')}
              className={`btn ${(!user.status || user.status === 'active') ? 'btn-warning' : 'btn-success'} flex-1`}
            >
              {(!user.status || user.status === 'active') ? 'Suspend User' : 'Activate User'}
            </button>
            <button
              onClick={() => {
                handleDeleteUser(user._id);
                onClose();
              }}
              className="btn btn-error"
            >
              Delete User
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="text-center py-12">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
    active: users.filter(u => !u.status || u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length
  };

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1>User Management</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Manage all platform users and their permissions
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={exportUsers}
              className="btn btn-outline"
            >
              <Download size={16} />
              Export CSV
            </button>
            <button 
              onClick={fetchUsers}
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{stats.total}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Users</p>
          </div>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--success)' }}>{stats.students}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Students</p>
          </div>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--info)' }}>{stats.recruiters}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Recruiters</p>
          </div>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--warning)' }}>{stats.active}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Active</p>
          </div>
          <div className="card text-center">
            <h3 style={{ fontSize: '1.75rem', color: 'var(--error)' }}>{stats.suspended}</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Suspended</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
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
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-input form-select"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-input form-select"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="card text-center py-12">
            <Users size={64} style={{ color: 'var(--text-light)', margin: '0 auto 1rem' }} />
            <h3>No Users Found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="card">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Joined</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Last Login</th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center gap-3">
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: user.role === 'student' ? 'var(--primary)' : user.role === 'recruiter' ? 'var(--success)' : 'var(--error)',
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
                            <h4 style={{ fontSize: '1rem', margin: 0 }}>{user.name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {getRoleBadge(user.role)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {getStatusBadge(user.status)}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="btn btn-outline btn-sm"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user._id, user.status || 'active')}
                            className={`btn btn-sm ${(!user.status || user.status === 'active') ? 'btn-warning' : 'btn-success'}`}
                          >
                            {(!user.status || user.status === 'active') ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* User Detail Modal */}
        {selectedUser && (
          <UserModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </div>
    </div>
  );
}
