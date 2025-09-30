import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🚀 Attempting login for:', email);
      
      const response = await api.post('/auth/login', { 
        email: email.trim(), 
        password 
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const { token, user: userData } = response.data;

      if (!token || !userData) {
        throw new Error('Invalid login response - missing token or user data');
      }

      if (!userData.role) {
        throw new Error('Invalid user data - missing role');
      }

      // Store token
      localStorage.setItem('token', token);
      
      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      console.log('✅ Login successful, user set:', userData);

      return { 
        user: userData, 
        token,
        success: true 
      };
    } catch (error) {
      console.error('❌ Login failed:', error);

      // Clear auth state on error
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);

      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
