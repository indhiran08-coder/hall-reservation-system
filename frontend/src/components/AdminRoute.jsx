import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Spinner';

/**
 * AdminRoute — only allows users with role === 'admin'.
 *
 * If loading AND no user yet → show spinner (first cold load, no cache).
 * If we already have a cached user, loading is false → render immediately.
 * Redirects staff to /dashboard, unauthenticated to /login.
 */
const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  // Only block with spinner when truly unknown (no cache, API in-flight)
  if (loading && !user) return <PageLoader />;
  if (!user)    return <Navigate to="/login"    replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
};

export default AdminRoute;
