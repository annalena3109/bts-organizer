import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bts_user');
    return saved ? JSON.parse(saved) : { id: 'demo-user-1', name: 'Annalena', email: 'annalena@school.edu' };
  });
  const [token, setToken] = useState(() => localStorage.getItem('bts_auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem('bts_auth_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiRequest('/auth/me');
        if (data && data.user) {
          setUser(data.user);
          localStorage.setItem('bts_user', JSON.stringify(data.user));
        }
      } catch (err) {
        // Backend might be starting up or unconfigured; preserve local preview user
        console.warn('Session check skipped, using cached/demo profile.');
      } finally {
        setLoading(false);
      }
    }
    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        localStorage.setItem('bts_auth_token', data.token);
        localStorage.setItem('bts_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      // If backend is not yet started, allow demo mode login
      if (err.message.includes('Failed to fetch') || err.status === 404) {
        const demoUser = { id: 'user-demo', name: email.split('@')[0], email };
        setUser(demoUser);
        localStorage.setItem('bts_user', JSON.stringify(demoUser));
        return { user: demoUser, token: 'demo-token' };
      }
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token) {
        localStorage.setItem('bts_auth_token', data.token);
        localStorage.setItem('bts_user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
      }
      return data;
    } catch (err) {
      if (err.message.includes('Failed to fetch') || err.status === 404) {
        const demoUser = { id: 'user-demo', name, email };
        setUser(demoUser);
        localStorage.setItem('bts_user', JSON.stringify(demoUser));
        return { user: demoUser, token: 'demo-token' };
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('bts_auth_token');
    localStorage.removeItem('bts_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updated) => {
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('bts_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
