import React from 'react';

/**
 * Reusable compact VCET logo (shield only + "Hall Reservation" text).
 * Used in Sidebar / Navbar where space is limited.
 */
export const VCETLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { img: 'w-7 h-7',  title: 'text-xs',  sub: 'text-xs'  },
    md: { img: 'w-9 h-9',  title: 'text-sm',  sub: 'text-xs'  },
    lg: { img: 'w-12 h-12', title: 'text-base', sub: 'text-xs' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/vcet-logo.png"
        alt="VCET"
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
 * Shows the full VCET college banner as a static image at the top.
 * Fully responsive — banner scales to fit any screen width.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">

      {/* ── VCET College Banner ─────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm w-full overflow-hidden">
        <div className="flex items-center justify-center px-2 py-2">
          <img
            src="/vcet-banner.png"
            alt="Velalar College of Engineering and Technology"
            className="w-full max-w-2xl h-auto object-contain"
            style={{ maxHeight: '72px' }}
          />
        </div>
      </header>

      {/* ── Subtitle bar ───────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white text-center py-1.5 text-xs font-semibold tracking-widest uppercase">
        Hall Reservation System
      </div>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-6 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="text-center py-3 text-xs text-gray-400 border-t border-gray-100 bg-white">
        © {new Date().getFullYear()} Velalar College of Engineering and Technology (Autonomous)
      </footer>
    </div>
  );
};

export default AuthLayout;
