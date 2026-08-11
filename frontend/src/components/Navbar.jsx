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
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 relative flex items-end justify-center rounded-lg overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 shrink-0">
          <svg className="w-4 h-4 text-white mb-0.5" viewBox="0 0 24 24" fill="currentColor">
            <rect x="2" y="20" width="20" height="2" rx="1" fill="white" opacity="0.9" />
            <rect x="4" y="10" width="2.5" height="10" rx="0.5" fill="white" />
            <rect x="8.75" y="10" width="2.5" height="10" rx="0.5" fill="white" />
            <rect x="13.5" y="10" width="2.5" height="10" rx="0.5" fill="white" />
            <rect x="18" y="10" width="2" height="10" rx="0.5" fill="white" />
            <path d="M1 10 L12 3 L23 10 Z" fill="white" opacity="0.95" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="text-xs font-bold text-gray-900 tracking-tight leading-none">VCET Hall</p>
          <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase leading-none mt-0.5">Reservation</p>
        </div>
      </div>

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
