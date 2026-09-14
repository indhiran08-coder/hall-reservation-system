import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FloatingInput from '../../components/ui/FloatingInput';
import TechBackground from '../../components/TechBackground';
import RippleDistortion from '../../components/RippleDistortion';


/* ══════════════════════════════════════════════════════════════════════════════
   Enterprise Split Showcase Login Page with Campus Architectural Backdrop
══════════════════════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, login } = useAuth();

  const [form, setForm]         = useState({ college_email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const justVerified = location.state?.verified;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email.trim());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!isEmailValid) errs.college_email = 'Enter a valid email address';
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
      const isUserAdmin = data.user.role === 'admin' || data.user.college_email?.toLowerCase() === 'indhirans@velalarengg.ac.in';
      login(data.user, data.token);
      navigate(isUserAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-primary-600 selection:text-white overflow-x-hidden relative">
      {/* ── Official VCET Banner Header ── */}
      <header className="relative z-30 w-full shrink-0">
        <div className="bg-white border-b border-slate-200 flex items-center justify-center px-4 py-2 shadow-xs">
          <Link
            to="/login"
            onClick={(e) => {
              if (user) {
                e.preventDefault();
                navigate('/dashboard');
              } else {
                window.location.href = '/login';
              }
            }}
            className="cursor-pointer hover:opacity-95 transition-opacity"
            title="Go to Login Page"
          >
            <img
              src="/vcet-banner.png"
              alt="Velalar College of Engineering and Technology"
              className="w-full max-w-2xl h-auto object-contain cursor-pointer"
              style={{ maxHeight: '64px' }}
            />
          </Link>
        </div>
        <div
          className="py-1.5 text-center text-xs font-bold tracking-[0.25em] uppercase text-white shadow-xs"
          style={{ background: '#2957a4' }}
        >
          Hall Reservation System
        </div>
      </header>

      {/* ── Main Split Showcase Section with Tech Background ── */}
      <main className="relative flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        {/* Dynamic Tech Grid & Floating Geometry Background */}
        <TechBackground />

        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-300/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] animate-card-entrance relative z-10">

          {/* ── LEFT PANEL: Interactive RippleDistortion Campus Image ── */}
          <div
            className="lg:col-span-5 relative text-white flex flex-col justify-between overflow-hidden"
          >
            {/* WebGL Ripple Canvas – fills the entire left panel */}
            <div className="absolute inset-0 z-0">
              <RippleDistortion
                src="/vcet-campus.jpg"
                brushSize={150}
                strength={0.2}
                swirl={1}
                rings={4}
                spread={5}
                fade={3}
                tint="#2957a4"
                tintAmount={0.1}
                trigger="hover"
                clickStrength={2}
                enabled
              />
            </div>

            {/* Dark Deep Royal Blue Gradient Overlay (over the ripple canvas) */}
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/85 via-[#0f1e45]/80 to-indigo-950/85 pointer-events-none" />

            {/* Top Brand Header */}
            <div className="relative z-20 p-8 sm:p-10 space-y-4 animate-fade-in-left animation-delay-100">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-blue-200 border border-white/20 shadow-xs">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>VCET Campus Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Seamless Campus Event &amp; Hall Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Reserve seminar halls, auditoriums, and conference rooms with real-time schedule conflict prevention.
              </p>
            </div>

            {/* Glassmorphism Feature Checklist */}
            <div className="relative z-20 px-8 sm:px-10 space-y-3 flex-1 flex flex-col justify-center">
              {[
                { title: 'Real-Time Schedule Roadmap', sub: 'Instant slot conflict checking' },
                { title: 'Faculty & Admin Workflows', sub: 'Instant approval & notifications' },
                { title: 'PDF & Official Reports', sub: 'Automated authorization exports' },
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md shadow-xs animate-fade-in-left transition-all duration-300 hover:translate-x-1.5 hover:bg-white/15 hover:border-white/30 cursor-pointer group"
                  style={{ animationDelay: `${180 + i * 100}ms` }}
                >
                  <div className="w-8 h-8 rounded-xl bg-primary-500/30 border border-primary-400/40 flex items-center justify-center shrink-0 text-primary-200 group-hover:scale-110 group-hover:bg-primary-500/50 transition-all duration-300">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{feat.title}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{feat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Tag */}
            <div className="relative z-20 px-8 sm:px-10 pb-8 sm:pb-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300 animate-fade-in-left animation-delay-450">
              <span>© 2026 VCET. All rights reserved.</span>
              <span className="text-[10px] text-primary-300 font-semibold tracking-wide">Hover to explore ✦</span>
            </div>
          </div>

          {/* ── RIGHT PANEL: Clean Single Login Form ── */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div className="max-w-sm mx-auto w-full space-y-6">

              {/* Top: Welcome + Check Halls button */}
              <div className="flex items-start justify-between gap-4 animate-fade-in-right animation-delay-150">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
                  <p className="text-sm text-slate-500 mt-1">Login to VCET Hall Reservation Portal</p>
                </div>
                <Link
                  to="/schedule"
                  className="shrink-0 px-4 py-2 rounded-full border-2 border-slate-800 text-xs font-bold text-slate-800 hover:bg-slate-800 hover:text-white transition-all duration-200 whitespace-nowrap shadow-xs hover:shadow-md hover:scale-105 active:scale-95"
                >
                  Check Halls
                </Link>
              </div>

              {/* Success Alert */}
              {justVerified && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-fade-in-right">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Account verified! You can now sign in.</span>
                </div>
              )}

              {/* Error Alert */}
              {apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fade-in-right">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-right animation-delay-250" noValidate>
                <FloatingInput
                  label="Email Address"
                  name="college_email"
                  type="email"
                  required
                  value={form.college_email}
                  onChange={handleChange}
                  error={errors.college_email}
                  isValid={isEmailValid}
                  autoComplete="email"
                />

                <FloatingInput
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                />

                {/* Secure Login Button with Shimmer Sweep */}
                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl hover:shadow-blue-900/25 hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                  style={{ background: '#2957a4' }}
                >
                  {/* Subtle Light Shimmer Sweep */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-sweep" />

                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin shrink-0 relative z-10" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="relative z-10">Authenticating…</span>
                    </>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      Secure Login
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Register as Guest Link */}
              <p className="text-center text-xs sm:text-sm text-slate-600 animate-fade-in-right animation-delay-350">
                External organization?{' '}
                <Link to="/register" className="font-bold hover:underline" style={{ color: '#2957a4' }}>
                  Register as Guest
                </Link>
              </p>

            </div>

            {/* Bottom Copyright */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} VCET. All rights reserved.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;
