import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiStore } from '../api/client';

const AuthContext = createContext(null);

const STORAGE_KEY = 'smart-attendance-auth';

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null); // 'admin' | 'user'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const t = parsed.token || null;
        setToken(t);
        setRole(parsed.role || null);
        setUser(parsed.user || null);
        useApiStore.getState().setToken(t);
      } catch {
        // ignore corrupted storage
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (token && role && user) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ token, role, user })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [token, role, user]);

  const login = ({ token: t, role: r, user: u }) => {
    setToken(t);
    setRole(r);
    setUser(u);

    if (r === 'admin') navigate('/admin', { replace: true });
    if (r === 'user') navigate('/user', { replace: true });
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUser(null);
    useApiStore.getState().setToken(null);
    navigate('/', { replace: true });
  };

  const value = {
    token,
    role,
    user,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

