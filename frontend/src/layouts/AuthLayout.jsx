import React from 'react';

/**
 * Reusable VCET logo component.
 * Uses the actual VCET college shield logo image.
 *
 * size: 'sm' | 'md' | 'lg'
 */
export const VCETLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { img: 'w-8 h-8',  title: 'text-sm',  sub: 'text-xs'  },
    md: { img: 'w-10 h-10', title: 'text-base', sub: 'text-xs' },
    lg: { img: 'w-14 h-14', title: 'text-xl',  sub: 'text-sm'  },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/vcet-logo.png"
        alt="VCET Logo"
        className={`${s.img} object-contain shrink-0`}
      />
      <div className="leading-tight">
        <p className={`${s.title} font-bold text-gray-900 tracking-tight`}>VCET Hall</p>
        <p className={`${s.sub} font-semibold text-blue-600 tracking-wide uppercase`}>Reservation</p>
      </div>
    </div>
  );
};

/**
 * Layout for unauthenticated pages (Login, Register, VerifyOTP).
 */
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
        © {new Date().getFullYear()} Vel College of Engineering and Technology
      </footer>
    </div>
  );
};

export default AuthLayout;
