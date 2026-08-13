import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui/Spinner';

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 *
 * Only blocks with a spinner when loading=true AND there's no cached user.
 * When a cached user exists, loading is false and the page renders immediately.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Only show spinner when truly unknown (no cache, API still in-flight)
  if (loading && !user) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
