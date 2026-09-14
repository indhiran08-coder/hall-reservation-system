import React, { useEffect, useState } from 'react';

/**
 * Enhanced Modern Interactive Tech Background.
 * Features:
 * - Mouse parallax micro-movement for depth
 * - Subtle horizontal cyber scan-beam light wave
 * - Dynamic animated tech constellation & glowing particle nodes
 * - Clean engineering grid + dot-matrix blueprint vignette
 * - Futuristic architectural HUD accents (rotary dials, compass markers, status telemetry)
 */
const TechBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Normalised coordinates (-15px to +15px) for subtle organic parallax
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 24;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 select-none">
      
      {/* ── 1. Engineering Isometric & Coordinate Grid ── */}
      <div
        className="absolute inset-0 bg-tech-grid opacity-85 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)`
        }}
      />

      {/* ── 2. Dot Matrix Field with Vignette Focus ── */}
      <div
        className="absolute inset-0 bg-tech-dots opacity-70 transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, #000 35%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, #000 35%, transparent 100%)'
        }}
      />

      {/* ── 3. High-Tech Cyber Scanline / Light Beam (Subtle vertical cycle) ── */}
      <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#2957a4]/10 to-transparent animate-scan-beam blur-md" />

      {/* ── 4. Atmospheric Aurora Glow Orbs with Parallax ── */}
      {/* Top Left VCET Brand Blue Glow */}
      <div
        className="absolute -top-12 -left-12 w-[600px] h-[600px] rounded-full blur-3xl opacity-60 animate-float-slow transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          background: 'radial-gradient(circle, rgba(41,87,164,0.6) 0%, rgba(99,102,241,0.3) 45%, transparent 70%)'
        }}
      />

      {/* Bottom Right Sky/Cyan Glow */}
      <div
        className="absolute -bottom-16 -right-16 w-[650px] h-[650px] rounded-full blur-3xl opacity-50 animate-float-slow-reverse transition-transform duration-1000 ease-out"
        style={{
          transform: `translate(${mousePos.x * -0.7}px, ${mousePos.y * -0.7}px)`,
          background: 'radial-gradient(circle, rgba(56,189,248,0.45) 0%, rgba(41,87,164,0.35) 45%, transparent 70%)'
        }}
      />

      {/* Center Depth Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[500px] rounded-full blur-3xl opacity-35 animate-pulse-slow"
        style={{ background: 'radial-gradient(ellipse, rgba(41,87,164,0.38) 0%, transparent 70%)' }}
      />

      {/* ── 5. Interactive Constellation Nodes & Glowing Star Particles ── */}
      <div className="absolute top-[22%] left-[18%] size-2 rounded-full bg-[#2957a4] shadow-[0_0_12px_#2957a4] animate-particle-1" />
      <div className="absolute top-[38%] left-[28%] size-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] animate-particle-2" />
      <div className="absolute top-[68%] left-[12%] size-2.5 rounded-full bg-[#2957a4]/80 shadow-[0_0_14px_#2957a4] animate-particle-1" />
      <div className="absolute top-[16%] right-[22%] size-2 rounded-full bg-indigo-500 shadow-[0_0_12px_#6366f1] animate-particle-2" />
      <div className="absolute top-[72%] right-[19%] size-2 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-particle-1" />
      <div className="absolute top-[45%] right-[28%] size-1.5 rounded-full bg-[#2957a4] shadow-[0_0_10px_#2957a4] animate-particle-2" />

      {/* ── 6. Futuristic Architectural HUD & Geometric Accents ── */}
      {/* Top Right: Rotating Isometric Campus Hex-Cube */}
      <div
        className="absolute top-20 right-[7%] opacity-55 animate-float-slow hidden md:block transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)` }}
      >
        <svg className="w-32 h-32 text-[#2957a4] animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <polygon points="50,8 92,30 92,72 50,94 8,72 8,30" strokeWidth="1.75" strokeDasharray="4 4" />
          <polygon points="50,22 78,37 78,65 50,80 22,65 22,37" strokeWidth="1.5" />
          <circle cx="50" cy="51" r="5" fill="currentColor" opacity="0.8" />
          <line x1="50" y1="8" x2="50" y2="22" strokeWidth="1.5" />
          <line x1="92" y1="72" x2="78" y2="65" strokeWidth="1.5" />
          <line x1="8" y1="72" x2="22" y2="65" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Top Left: Precision Navigational Reticle */}
      <div
        className="absolute top-28 left-[6%] opacity-50 animate-float-slow-reverse hidden md:block transition-transform duration-700 ease-out"
        style={{ transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)` }}
      >
        <svg className="w-24 h-24 text-[#2957a4]" viewBox="0 0 80 80" fill="none" stroke="currentColor">
          <circle cx="40" cy="40" r="34" strokeWidth="1.2" strokeDasharray="3 5" />
          <circle cx="40" cy="40" r="22" strokeWidth="1" opacity="0.6" />
          <line x1="40" y1="2" x2="40" y2="78" strokeWidth="1.5" />
          <line x1="2" y1="40" x2="78" y2="40" strokeWidth="1.5" />
          <circle cx="40" cy="40" r="4" fill="currentColor" />
          <rect x="36" y="10" width="8" height="2" fill="currentColor" />
          <rect x="68" y="36" width="2" height="8" fill="currentColor" />
        </svg>
      </div>

      {/* Bottom Left: Live Telemetry & Campus Geolocation Stamp */}
      <div className="absolute bottom-16 left-[6%] opacity-60 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-slate-500 bg-white/40 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-2xs">
        <div className="flex items-center gap-2 text-[#2957a4] font-bold">
          <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="tracking-widest">SYSTEM ONLINE // NODE: IN-TN</span>
        </div>
        <div className="text-[9px] text-slate-400 tracking-wider">
          COORDINATES: 11°16'44"N 77°43'28"E
        </div>
      </div>

      {/* Bottom Right: Digital Pass Matrix Stamp */}
      <div className="absolute bottom-16 right-[6%] opacity-60 hidden lg:flex flex-col gap-1 font-mono text-[10px] text-slate-500 bg-white/40 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/60 shadow-2xs text-right">
        <div className="flex items-center justify-end gap-2 text-[#2957a4] font-bold">
          <span className="tracking-widest">VCET PROTOCOL // V2.6</span>
          <span className="size-1.5 rounded-full bg-[#2957a4]" />
        </div>
        <div className="text-[9px] text-slate-400 tracking-wider">
          CAMPUS HALL RESERVATION SUITE
        </div>
      </div>

    </div>
  );
};

export default TechBackground;
