/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load user profile', err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Login handler
  const login = async (emailOrUsername, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { emailOrUsername, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { username, email, password });
      const { token, ...userData } = res.data;
      localStorage.setItem('token', token);
      setUser(userData);
      return { success: true };
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
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
