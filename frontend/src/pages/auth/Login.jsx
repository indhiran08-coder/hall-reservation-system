import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Floating 3D Particles ────────────────────────────────────────────────── */
const ParticleField = () => {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: `${Math.random() * 6}s`,
    duration: `${Math.random() * 8 + 6}s`,
    opacity: Math.random() * 0.6 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-indigo-300"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            opacity: p.opacity,
            boxShadow: '0 0 10px rgba(129, 140, 248, 0.8)',
            animation: `floatUp ${p.duration} ease-in-out infinite ${p.delay}`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── 3D Rotating Polyhedron Object ────────────────────────────────────────── */
const Floating3DCube = ({ className, style }) => (
  <div className={`absolute pointer-events-none z-0 ${className}`} style={style}>
    <div className="w-24 h-24 sm:w-32 sm:h-32 relative preserve-3d animate-spin-3d opacity-20">
      <div className="absolute inset-0 border border-indigo-400/40 bg-indigo-500/10 backdrop-blur-md rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.3)] transform translate-z-12" />
      <div className="absolute inset-0 border border-purple-400/40 bg-purple-500/10 backdrop-blur-md rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.3)] transform -translate-z-12 rotate-y-90" />
      <div className="absolute inset-0 border border-blue-400/40 bg-blue-500/10 backdrop-blur-md rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.3)] transform rotate-x-90" />
    </div>
  </div>
);

/* ─── Eye Icon Toggle ──────────────────────────────────────────────────────── */
const EyeIcon = ({ show }) =>
  show ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

/* ─── Premium Glass Input ──────────────────────────────────────────────────── */
const GlassInput = ({ label, error, type = 'text', icon, ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-[11px] font-bold text-indigo-200 uppercase tracking-widest flex items-center justify-between">
        <span>{label}</span>
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 group-focus-within:text-indigo-100 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className={`w-full rounded-2xl text-sm text-white placeholder-indigo-300/60
            bg-slate-900/40 border border-indigo-500/30 backdrop-blur-md
            focus:outline-none focus:border-indigo-400 focus:bg-slate-900/60 focus:ring-4 focus:ring-indigo-500/20
            transition-all duration-300 py-3.5 ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'}
            shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-indigo-300 hover:text-white transition-colors"
            tabIndex={-1}
          >
            <EyeIcon show={showPwd} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-300 font-medium mt-1 flex items-center gap-1"><span>⚠️</span>{error}</p>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   3D Professional Login Page
══════════════════════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [form, setForm]         = useState({ college_email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [mounted, setMounted]   = useState(false);

  // 3D Parallax Tilt State
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, glossX: 50, glossY: 50 });

  const justVerified = location.state?.verified;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Smooth Interactive 3D Cursor Parallax Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation angles max +/- 12deg
    const ry = ((x - centerX) / centerX) * 10;
    const rx = -((y - centerY) / centerY) * 10;

    // Specular reflection percentage
    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;

    setTilt({ rx, ry, glossX, glossY });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0, glossX: 50, glossY: 50 });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email))
      errs.college_email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError('');
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        
        .preserve-3d { transform-style: preserve-3d; }
        .perspective-1000 { perspective: 1200px; }

        @keyframes floatUp {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-35px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }

        @keyframes animate-spin-3d {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg); }
        }

        .animate-spin-3d { animation: animate-spin-3d 25s linear infinite; }

        @keyframes auraGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.08); }
        }

        .aura-glow { animation: auraGlow 6s ease-in-out infinite; }

        @keyframes shimmerBorder {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .shimmer-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%);
          background-size: 200% 200%;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .shimmer-btn:hover {
          background-position: 100% 0%;
          box-shadow: 0 12px 35px -5px rgba(99, 102, 241, 0.6), 0 0 20px rgba(124, 58, 237, 0.4);
          transform: translateY(-2px) translateZ(10px);
        }

        .shimmer-btn:active { transform: translateY(0) translateZ(0); }

        .glass-card-3d {
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6),
                      0 18px 36px -18px rgba(99, 102, 241, 0.35),
                      inset 0 1px 1px rgba(255, 255, 255, 0.2);
          transition: transform 0.15s cubic-bezier(0.2, 0, 0.2, 1), box-shadow 0.3s ease;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 40px rgba(15, 23, 42, 0.9) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      <div
        className="min-h-screen w-full relative overflow-hidden flex flex-col justify-between selection:bg-indigo-500 selection:text-white"
        style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          background: 'radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 45%, #090d16 100%)',
        }}
      >
        {/* ── Background Particle & Light Field ── */}
        <ParticleField />

        {/* ── Ambient Background Lighting ── */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none aura-glow z-0" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-blue-600/15 rounded-full blur-[100px] pointer-events-none z-0" />

        {/* ── 3D Decorative Floating Geometries ── */}
        <Floating3DCube className="top-24 left-12" />
        <Floating3DCube className="bottom-20 right-16" style={{ transform: 'scale(0.8) rotate(45deg)' }} />

        {/* ══ VCET Banner Header ══════════════════════════════════════════════ */}
        <header className="relative z-20 w-full shrink-0">
          <div className="bg-white/95 backdrop-blur-md flex items-center justify-center px-4 py-2 shadow-xl shadow-black/40 border-b border-indigo-100/20">
            <img
              src="/vcet-banner.png"
              alt="Velalar College of Engineering and Technology"
              className="w-full max-w-2xl h-auto object-contain drop-shadow-sm"
              style={{ maxHeight: '62px' }}
            />
          </div>
          <div
            className="py-2 text-center text-[11px] font-extrabold tracking-[0.3em] uppercase text-white shadow-inner flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(90deg, #1e1b4b 0%, #312e81 35%, #4338ca 50%, #312e81 65%, #1e1b4b 100%)' }}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span>Hall Reservation System</span>
            <span className="text-indigo-300/60 font-light">•</span>
            <span className="text-indigo-200 font-semibold tracking-wider">Autonomous Institution</span>
          </div>
        </header>

        {/* ══ Main 3D Card Container ══════════════════════════════════════════ */}
        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 perspective-1000">
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full max-w-[440px] preserve-3d"
            style={{
              transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
              opacity: mounted ? 1 : 0,
              transition: mounted ? 'none' : 'opacity 0.8s ease',
            }}
          >
            {/* ── 3D Interactive Card ── */}
            <div className="glass-card-3d rounded-3xl overflow-hidden relative group">
              {/* Dynamic Specular Reflection Light Sweep */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at ${tilt.glossX}% ${tilt.glossY}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
                }}
              />

              {/* Shimmering Top Edge Accent Line */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899, #3b82f6, #6366f1)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmerBorder 4s linear infinite',
                }}
              />

              <div className="px-8 py-9 sm:px-10 sm:py-10 relative z-10 text-center preserve-3d">
                {/* ── 3D Shield / Key Icon ── */}
                <div
                  className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 relative group/icon preserve-3d"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(124,58,237,0.9))',
                    boxShadow: '0 15px 35px -5px rgba(99,102,241,0.5), inset 0 2px 2px rgba(255,255,255,0.3)',
                    transform: 'translateZ(25px)',
                  }}
                >
                  <svg className="w-10 h-10 text-white drop-shadow-md transition-transform duration-300 group-hover/icon:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 shadow-md animate-pulse" />
                </div>

                {/* ── Title & Subtitle ── */}
                <div className="preserve-3d" style={{ transform: 'translateZ(20px)' }}>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Welcome Back</h1>
                  <p className="mt-2 text-xs sm:text-sm font-medium text-indigo-200/80">Sign in to your VCET Hall Reservation account</p>
                </div>

                {/* ── Alerts ── */}
                {justVerified && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md shadow-lg">
                    <svg className="w-5 h-5 shrink-0 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Account verified! You can now sign in.</span>
                  </div>
                )}

                {apiError && (
                  <div className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-medium text-rose-300 bg-rose-500/10 border border-rose-500/30 backdrop-blur-md shadow-lg">
                    <svg className="w-5 h-5 shrink-0 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{apiError}</span>
                  </div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="mt-7 space-y-5 preserve-3d" style={{ transform: 'translateZ(15px)' }} noValidate>
                  <GlassInput
                    label="College Email"
                    name="college_email"
                    type="email"
                    required
                    value={form.college_email}
                    onChange={handleChange}
                    error={errors.college_email}
                    placeholder="yourname@velalarengg.ac.in"
                    autoComplete="email"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  <GlassInput
                    label="Password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    }
                  />

                  {/* Forgot Password Link */}
                  <div className="text-right pt-0.5">
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-indigo-300 hover:text-white transition-colors duration-200 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="shimmer-btn w-full py-4 rounded-2xl text-white font-extrabold text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg preserve-3d"
                    style={{ transform: 'translateZ(20px)' }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Authenticating…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Register link */}
                  <p className="text-center text-xs sm:text-sm font-medium text-indigo-200/70 pt-1">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-white font-bold hover:text-indigo-200 transition-colors underline underline-offset-4 decoration-indigo-400/50"
                    >
                      Create one
                    </Link>
                  </p>
                </form>

                {/* ── View Hall Schedule Card ── */}
                <div className="mt-8 pt-6 border-t border-indigo-500/20 preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                  <Link
                    to="/schedule"
                    className="group relative flex items-center gap-3.5 w-full rounded-2xl px-4 py-3.5 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-400/30 hover:border-indigo-400/60 backdrop-blur-md transition-all duration-300 shadow-md hover:shadow-indigo-500/20"
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
                    </div>

                    <div className="flex-1 text-left">
                      <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 transition-colors">
                        View Hall Schedule
                      </p>
                      <p className="text-[11px] font-medium text-emerald-400/90 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                        <span>Live • No login needed</span>
                      </p>
                    </div>

                    <svg className="w-5 h-5 text-indigo-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Copyright */}
            <p className="text-center mt-6 text-[11px] font-medium text-indigo-300/60 tracking-wide">
              © {new Date().getFullYear()} Velalar College of Engineering and Technology (Autonomous)
            </p>
          </div>
        </main>
      </div>
    </>
  );
};

export default Login;
