import React from 'react';

/**
 * Layout for unauthenticated pages (Login, Register, VerifyOTP).
 * Premium VCET branding with hall-icon logo.
 */

// Reusable VCET logo component
export const VCETLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { wrap: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm', sub: 'text-xs' },
    md: { wrap: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base', sub: 'text-xs' },
    lg: { wrap: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-xl', sub: 'text-sm' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      {/* Logo mark — pillared hall icon */}
      <div className={`${s.wrap} relative flex items-end justify-center rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg shadow-blue-500/30 shrink-0`}>
        <svg className={`${s.icon} text-white mb-1`} viewBox="0 0 24 24" fill="currentColor">
          {/* Hall / building pillars */}
          <rect x="2" y="20" width="20" height="2" rx="1" fill="white" opacity="0.9" />
          <rect x="4" y="10" width="2.5" height="10" rx="0.5" fill="white" />
          <rect x="8.75" y="10" width="2.5" height="10" rx="0.5" fill="white" />
          <rect x="13.5" y="10" width="2.5" height="10" rx="0.5" fill="white" />
          <rect x="18" y="10" width="2" height="10" rx="0.5" fill="white" />
          {/* Pediment / roof triangle */}
          <path d="M1 10 L12 3 L23 10 Z" fill="white" opacity="0.95" />
        </svg>
      </div>
      {/* Text */}
      <div className="leading-tight">
        <p className={`${s.text} font-bold text-gray-900 tracking-tight`}>VCET Hall</p>
        <p className={`${s.sub} font-semibold text-blue-600 tracking-wide uppercase`}>Reservation</p>
      </div>
    </div>
  );
};

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex flex-col">
      {/* Header */}
      <header className="px-4 sm:px-8 py-5 flex items-center">
        <VCETLogo size="md" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-4 sm:py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} Vel College of Engineering and Technology · VCET
      </footer>
    </div>
  );
};

export default AuthLayout;
