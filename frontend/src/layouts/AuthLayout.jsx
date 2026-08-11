import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Layout for unauthenticated pages (Login, Register, VerifyOTP).
 * Clean, centered card design optimised for both mobile and desktop.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-6 py-4 flex items-center gap-2">
        <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-semibold text-gray-900">Hall Reservation</span>
          <span className="hidden sm:inline text-sm text-gray-400"> — VCET</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-gray-400">
        © {new Date().getFullYear()} Hall Reservation System · VCET
      </footer>
    </div>
  );
};

export default AuthLayout;

