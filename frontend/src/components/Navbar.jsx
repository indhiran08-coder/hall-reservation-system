import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Top navigation bar for the dashboard layout.
 * Shows hamburger (mobile), page title slot, and user info.
 *
 * @param {function} onMenuClick - toggles sidebar on mobile
 */
const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 gap-4">
      {/* Hamburger — mobile only */}
      <button
        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo text — visible on mobile (sidebar is hidden) */}
      <span className="lg:hidden text-sm font-semibold text-gray-900">Hall Reservation</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick actions */}
      <Link
        to="/book"
        className="hidden sm:flex btn-primary text-sm px-3 py-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Book Hall
      </Link>

      {/* User avatar */}
      {user && (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-blue-700">
              {user.first_name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-gray-900 leading-tight">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-500">{user.staff_id}</p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
