import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Floating 3-D orb ────────────────────────────────────────────────────── */
const Orb = ({ style }) => (
  <div
    className="absolute rounded-full pointer-events-none"
    style={{
      filter: 'blur(60px)',
      animation: 'float 8s ease-in-out infinite',
      ...style,
    }}
  />
);

/* ─── Password eye toggle icon ─────────────────────────────────────────────── */
const EyeIcon = ({ show }) =>
  show ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

/* ─── Glass input field ─────────────────────────────────────────────────────── */
const GlassInput = ({ label, error, type = 'text', ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-blue-100 tracking-widest uppercase">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className="w-full rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-blue-300
            bg-white/10 border border-white/20 backdrop-blur-sm
            focus:outline-none focus:border-blue-300 focus:bg-white/15 focus:ring-2 focus:ring-blue-300/30
            transition-all duration-200"
          style={{ WebkitAutofill: 'none' }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors"
            tabIndex={-1}
          >
            <EyeIcon show={showPwd} />
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-300 mt-1">{error}</p>}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   Login Page
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

  const justVerified = location.state?.verified;

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
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
      {/* ── Global keyframe animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes float {
          0%,100% { transform: translateY(0px) scale(1); }
          33%      { transform: translateY(-20px) scale(1.05); }
          66%      { transform: translateY(10px) scale(0.97); }
        }
        @keyframes floatSlow {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-30px) rotate(180deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.1); }
          50%      { box-shadow: 0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.3); }
        }
        @keyframes slideUp {
          from { opacity:0; transform: translateY(30px); }
          to   { opacity:1; transform: translateY(0); }
        }
        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .card-3d {
          transform-style: preserve-3d;
          animation: glow 4s ease-in-out infinite;
        }
        .card-3d:hover {
          transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) translateZ(8px);
          transition: transform 0.4s ease;
        }
        .slide-up { animation: slideUp 0.6s ease forwards; }
        .btn-glow {
          background: linear-gradient(135deg, #6366f1, #4f46e5, #818cf8, #6366f1);
          background-size: 300% 300%;
          animation: shimmer 3s linear infinite;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .btn-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(99,102,241,0.6), 0 10px 30px rgba(99,102,241,0.3);
        }
        .btn-glow:active { transform: translateY(0); }
        .glass-ring {
          border: 1px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 30px rgba(99,102,241,0.15) inset !important;
          -webkit-text-fill-color: #fff !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .hex-ring {
          animation: rotateSlow 20s linear infinite;
        }
        .hex-ring-2 {
          animation: rotateSlow 30s linear infinite reverse;
        }
        .schedule-btn {
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          border: 1px solid rgba(255,255,255,0.2);
          transition: all 0.3s ease;
        }
        .schedule-btn:hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.1));
          border-color: rgba(255,255,255,0.35);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
      `}</style>

      <div
        className="min-h-screen w-full relative overflow-hidden flex flex-col"
        style={{ fontFamily: "'Inter', sans-serif", background: 'linear-gradient(135deg, #0f0c29 0%, #1a1a4e 30%, #0d1b4b 60%, #0a0e2e 100%)' }}
      >
        {/* ── Animated background orbs ── */}
        <Orb style={{ width: 500, height: 500, top: '-10%', left: '-10%', background: 'rgba(99,102,241,0.35)', animationDuration: '10s' }} />
        <Orb style={{ width: 400, height: 400, top: '50%', right: '-8%', background: 'rgba(139,92,246,0.3)', animationDuration: '14s', animationDelay: '2s' }} />
        <Orb style={{ width: 300, height: 300, bottom: '5%', left: '20%', background: 'rgba(59,130,246,0.25)', animationDuration: '12s', animationDelay: '4s' }} />
        <Orb style={{ width: 200, height: 200, top: '30%', left: '40%', background: 'rgba(236,72,153,0.15)', animationDuration: '9s', animationDelay: '1s' }} />

        {/* ── Rotating hex rings (desktop decorative) ── */}
        <div className="hidden lg:block absolute top-1/2 right-8 -translate-y-1/2 opacity-10 hex-ring pointer-events-none">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none">
            <polygon points="160,10 305,87.5 305,232.5 160,310 15,232.5 15,87.5" stroke="#818cf8" strokeWidth="1.5" fill="none"/>
            <polygon points="160,40 275,102.5 275,217.5 160,280 45,217.5 45,102.5" stroke="#6366f1" strokeWidth="1" fill="none"/>
            <polygon points="160,70 245,117.5 245,202.5 160,250 75,202.5 75,117.5" stroke="#4f46e5" strokeWidth="0.5" fill="none"/>
          </svg>
        </div>
        <div className="hidden lg:block absolute top-1/2 left-8 -translate-y-1/2 opacity-10 hex-ring-2 pointer-events-none">
          <svg width="220" height="220" viewBox="0 0 220 220" fill="none">
            <polygon points="110,8 208,60 208,160 110,212 12,160 12,60" stroke="#a78bfa" strokeWidth="1.5" fill="none"/>
            <polygon points="110,35 181,75 181,145 110,185 39,145 39,75" stroke="#818cf8" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* ── Grid overlay ── */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,1) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* ══ VCET Banner ══════════════════════════════════════════════════════ */}
        <div className="relative z-10 w-full">
          {/* Banner image on white strip */}
          <div className="bg-white/95 backdrop-blur-sm flex items-center justify-center px-2 py-1.5 shadow-lg shadow-black/30">
            <img
              src="/vcet-banner.png"
              alt="Velalar College of Engineering and Technology"
              className="w-full max-w-2xl h-auto object-contain"
              style={{ maxHeight: '64px' }}
            />
          </div>
          {/* Subtitle bar */}
          <div className="py-1.5 text-center text-xs font-bold tracking-[0.25em] uppercase text-white"
            style={{ background: 'linear-gradient(90deg, #1e3a8a, #4338ca, #1e3a8a)' }}>
            Hall Reservation System
          </div>
        </div>

        {/* ══ Main Content ═════════════════════════════════════════════════════ */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <div
            className={`w-full max-w-md slide-up`}
            style={{ opacity: mounted ? 1 : 0 }}
          >
            {/* ── 3-D Glass Card ── */}
            <div className="card-3d glass-ring rounded-3xl overflow-hidden shadow-2xl">

              {/* Card top accent line */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #6366f1)', backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }} />

              <div className="px-7 py-8 sm:px-10 sm:py-10">

                {/* ── Header ── */}
                <div className="text-center mb-8">
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Welcome Back</h1>
                  <p className="mt-1.5 text-sm text-blue-300">Sign in to your VCET Hall Reservation account</p>
                </div>

                {/* ── Alerts ── */}
                {justVerified && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-green-300"
                    style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Account verified! You can now sign in.
                  </div>
                )}

                {apiError && (
                  <div className="mb-5 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-red-300"
                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                  </div>
                )}

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
                  />

                  <GlassInput
                    label="Password"
                    name="password"
                    type="password"
                    required
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Your password"
                    autoComplete="current-password"
                  />

                  {/* Forgot password */}
                  <div className="text-right">
                    <Link to="/forgot-password" className="text-xs text-blue-300 hover:text-white transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Sign In button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-glow w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Signing In…
                      </>
                    ) : (
                      <>
                        Sign In
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Register link */}
                  <p className="text-center text-sm text-blue-300">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-white font-semibold hover:text-blue-200 transition-colors underline underline-offset-2">
                      Create one
                    </Link>
                  </p>
                </form>

                {/* ── View Hall Schedule ── */}
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Link to="/schedule" className="schedule-btn group flex items-center gap-3 w-full rounded-2xl px-4 py-3.5 backdrop-blur-sm">
                    {/* Icon with live dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-transparent animate-pulse" />
                    </div>
                    {/* Text */}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-blue-100 transition-colors">View Hall Schedule</p>
                      <p className="text-xs text-blue-300 mt-0.5">Live · No login needed</p>
                    </div>
                    {/* Arrow */}
                    <svg className="w-4 h-4 text-blue-400 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

              </div>
            </div>

            {/* Bottom label */}
            <p className="text-center mt-6 text-xs text-blue-400 opacity-70">
              © {new Date().getFullYear()} Velalar College of Engineering and Technology (Autonomous)
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
