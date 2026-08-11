import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Spinner';

/**
 * AdminRoute — only allows users with role === 'admin'.
 * Redirects staff to /dashboard, unauthenticated to /login.
 */
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading)  return <PageLoader />;
  if (!user)    return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
