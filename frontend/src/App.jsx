import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Auth pages
import Login     from './pages/auth/Login';
import Register  from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';

// Public pages (no auth)
import PublicSchedule from './pages/PublicSchedule';

// Staff dashboard pages
import Dashboard     from './pages/Dashboard';
import Halls         from './pages/Halls';
import HallDetail    from './pages/HallDetail';
import BookHall      from './pages/BookHall';
import BookingHistory from './pages/BookingHistory';
import Calendar      from './pages/Calendar';
import Profile       from './pages/Profile';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings  from './pages/admin/AdminBookings';
import AdminHalls     from './pages/admin/AdminHalls';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public routes — no login required */}
          <Route path="/schedule" element={<PublicSchedule />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected staff routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/halls"     element={<ProtectedRoute><Halls /></ProtectedRoute>} />
          <Route path="/halls/:id" element={<ProtectedRoute><HallDetail /></ProtectedRoute>} />
          <Route path="/book"      element={<ProtectedRoute><BookHall /></ProtectedRoute>} />
          <Route path="/bookings"  element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
          <Route path="/calendar"  element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin-only routes */}
          <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/bookings"  element={<AdminRoute><AdminBookings /></AdminRoute>} />
          <Route path="/admin/halls"     element={<AdminRoute><AdminHalls /></AdminRoute>} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
