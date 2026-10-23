import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/authContext';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { token, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="centered">Loading...</div>;
  }

  if (!token || !role) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

