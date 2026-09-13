import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

/**
 * Main dashboard layout with:
 * - Desktop: fixed left sidebar + sticky top navbar
 * - Mobile: slide-in sidebar + bottom navigation bar
 */
const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — always visible on lg+, slide-in on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top navbar */}
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content — pb-20 on mobile to avoid overlap with bottom nav */}
        <main className="relative flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 overflow-x-hidden">
          {/* Ambient subtle backdrop glow orbs */}
          <div className="absolute top-6 right-8 w-96 h-96 rounded-full bg-gradient-to-bl from-blue-500/12 via-indigo-500/8 to-transparent blur-3xl pointer-events-none -z-10 animate-float-slow" />
          <div className="absolute bottom-12 left-8 w-80 h-80 rounded-full bg-gradient-to-tr from-sky-400/15 via-blue-600/8 to-transparent blur-3xl pointer-events-none -z-10 animate-float-slow-reverse" />

          {/* Smooth entrance container */}
          <div className="relative z-10 w-full animate-card-entrance">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
};

export default DashboardLayout;
