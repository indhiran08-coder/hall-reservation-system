import React from 'react';

/**
 * Modern Interactive Tech Grid + Subtle Floating Geometry + Soft Ambient Glow Background.
 * Provides a high-end, bespoke enterprise tech feel while maintaining high readability.
 */
const TechBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* 1. Subtle Engineering Tech Grid */}
      <div className="absolute inset-0 bg-tech-grid opacity-90" />

      {/* 2. Soft Dot Matrix Layer with Radial Vignette */}
      <div
        className="absolute inset-0 bg-tech-dots opacity-75"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 80% at 50% 50%, #000 40%, transparent 100%)'
        }}
      />

      {/* 3. Deep Atmospheric Gradient Flow */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/40 via-transparent to-slate-200/50" />

      {/* 4. Ambient Colored Glow Orbs */}
      {/* Top Left VCET Brand Blue Glow */}
      <div
        className="absolute -top-16 -left-16 w-[550px] h-[550px] rounded-full blur-3xl opacity-50 animate-float-slow"
        style={{ background: 'radial-gradient(circle, rgba(41,87,164,0.55) 0%, rgba(99,102,241,0.25) 50%, transparent 70%)' }}
      />

      {/* Bottom Right Royal Cyan/Indigo Glow */}
      <div
        className="absolute -bottom-16 -right-16 w-[600px] h-[600px] rounded-full blur-3xl opacity-45 animate-float-slow-reverse"
        style={{ background: 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(41,87,164,0.3) 50%, transparent 70%)' }}
      />

      {/* Center Atmosphere Pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full blur-3xl opacity-30 animate-pulse-slow"
        style={{ background: 'radial-gradient(ellipse, rgba(41,87,164,0.35) 0%, transparent 70%)' }}
      />

      {/* 5. Floating Geometric Accents (Modern Enterprise Motifs) */}
      {/* Floating Isometric Cube / Diamond Wireframe Top Right */}
      <div className="absolute top-24 right-[8%] opacity-45 animate-float-slow hidden sm:block">
        <svg className="w-28 h-28 text-[#2957a4] animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" strokeWidth="1.75" strokeDasharray="4 4" />
          <polygon points="50,25 75,37 75,63 50,75 25,63 25,37" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Architectural Crosshairs / Reticles Top Left */}
      <div className="absolute top-36 left-[7%] opacity-40 animate-float-slow-reverse hidden sm:block">
        <svg className="w-20 h-20 text-[#2957a4]" viewBox="0 0 60 60" fill="none" stroke="currentColor">
          <circle cx="30" cy="30" r="24" strokeWidth="1.5" strokeDasharray="3 4" />
          <line x1="30" y1="4" x2="30" y2="56" strokeWidth="1.5" />
          <line x1="4" y1="30" x2="56" y2="30" strokeWidth="1.5" />
          <circle cx="30" cy="30" r="3.5" fill="currentColor" />
        </svg>
      </div>

      {/* Floating Tech Blueprint Plus Markers */}
      <div className="absolute bottom-28 left-[18%] opacity-30 text-[#2957a4] font-mono text-xs hidden md:flex items-center gap-1.5 animate-pulse-slow">
        <span className="text-base font-bold">+</span>
        <span className="tracking-widest text-[9px] uppercase font-semibold text-slate-500">SYS.VCET // 11.28N</span>
      </div>

      <div className="absolute bottom-32 right-[12%] opacity-25 text-[#2957a4] font-mono text-xs hidden md:flex items-center gap-1.5 animate-pulse-slow">
        <span className="text-base font-bold">+</span>
        <span className="tracking-widest text-[9px] uppercase font-semibold text-slate-500">LOC.GRID // SEC-A</span>
      </div>
    </div>
  );
};

export default TechBackground;
