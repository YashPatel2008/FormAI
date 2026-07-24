import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const updateProfile = async (updates) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.put(
        'http://localhost:5000/auth/profile',
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.message === 'Profile updated successfully') {
        // Refresh user data
        const profileResponse = await axios.get('http://localhost:5000/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(profileResponse.data.user);
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data?.error || 'Failed to update profile';
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
