import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

/* ─── Eye Icon Toggle ──────────────────────────────────────────────────────── */
const EyeIcon = ({ show }) =>
  show ? (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors shrink-0" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors shrink-0" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

/* ─── Refined Input Component with Validation Indicator ───────────────────── */
const RefinedInput = ({ label, error, type = 'text', icon, isValid, ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-semibold text-slate-700 tracking-wide">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className={`w-full rounded-xl text-sm text-slate-900 placeholder-slate-400/70
            bg-slate-50 border border-slate-200
            focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10
            transition-all duration-200 py-3 ${icon ? 'pl-11' : 'pl-4'} ${isPassword || isValid ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
        {/* Valid Checkmark Indicator */}
        {!isPassword && isValid && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none flex items-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {/* Password Eye Icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPwd((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-100 transition-colors"
            tabIndex={-1}
          >
            <EyeIcon show={showPwd} />
          </button>
        )}
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-600 mt-1 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   Enterprise Split Showcase Login Page with Campus Architectural Backdrop
══════════════════════════════════════════════════════════════════════════════ */
const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, login } = useAuth();

  const [roleTab, setRoleTab]   = useState('faculty'); // 'faculty' or 'admin'
  const [form, setForm]         = useState({ college_email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const justVerified = location.state?.verified;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email.trim());
  const needsDomain  = form.college_email.length > 0 && !form.college_email.includes('@');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const handleAppendDomain = () => {
    setForm((f) => ({
      ...f,
      college_email: f.college_email.trim() + '@velalarengg.ac.in',
    }));
    setErrors((p) => ({ ...p, college_email: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!isEmailValid) errs.college_email = 'Enter a valid college email address';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const inputEmail = form.college_email.trim().toLowerCase();

    // Strict Admin Portal Restriction (Confidential)
    if (roleTab === 'admin' && inputEmail !== 'indhirans@velalarengg.ac.in') {
      setApiError('Access Denied: Invalid administrator credentials or unauthorized account.');
      return;
    }

    setLoading(true); setApiError('');
    try {
      const { data } = await authAPI.login(form);
      const isUserAdmin = data.user.role === 'admin' || data.user.college_email?.toLowerCase() === 'indhirans@velalarengg.ac.in';

      if (roleTab === 'admin' && !isUserAdmin) {
        setApiError('Access Denied: Invalid administrator credentials or unauthorized account.');
        setLoading(false);
        return;
      }

      login(data.user, data.token);
      navigate(isUserAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please verify your email and password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
          style={{ background: 'linear-gradient(90deg, #1e3a8a, #4338ca, #1e3a8a)' }}
        >
          Hall Reservation System
        </div>
      </header>

      {/* ── Main Split Showcase Section ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

          {/* ── LEFT PANEL: Subtle Campus Architectural Background Card ── */}
          <div
            className="lg:col-span-5 relative p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: 'url(/vcet-campus.jpg)' }}
          >
            {/* Dark Deep Royal Blue Mask Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-[2px]" />

            {/* Top Brand Header */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-blue-200 border border-white/20 shadow-xs">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>Velalar Campus Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Seamless Campus Event & Hall Management
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Reserve seminar halls, auditoriums, and conference rooms with real-time schedule conflict prevention.
              </p>
            </div>

            {/* Glassmorphism Feature Checklist */}
            <div className="relative z-10 my-6 space-y-3">
              {[
                { title: 'Real-Time Schedule Roadmap', sub: 'Instant slot conflict checking' },
                { title: 'Faculty & Admin Workflows', sub: 'Instant approval & notifications' },
                { title: 'PDF & Official Reports', sub: 'Automated authorization exports' },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-2xl p-3.5 backdrop-blur-md shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center shrink-0 text-blue-300">
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
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-slate-300">
              <span>Velalar College of Eng. & Tech</span>
              <span className="font-semibold text-blue-300">Erode, Tamil Nadu</span>
            </div>
          </div>

          {/* ── RIGHT PANEL: Clean Professional Sign In Form ── */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">

              {/* 🎓 / 🛡️ Role Tab Selector Bar */}
              <div className="bg-slate-100 p-1 rounded-2xl border border-slate-200 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setRoleTab('faculty')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    roleTab === 'faculty'
                      ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">🎓</span>
                  <span>Faculty Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleTab('admin')}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    roleTab === 'admin'
                      ? 'bg-white text-violet-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="text-sm">🛡️</span>
                  <span>Admin Portal</span>
                </button>
              </div>

              {/* Form Title Header */}
              <div className="text-left space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {roleTab === 'admin' ? 'Administrator Sign In' : 'Faculty Sign In'}
                </h1>
                <p className="text-sm text-slate-500 font-normal">
                  {roleTab === 'admin'
                    ? 'Enter administrator credentials to manage bookings & halls'
                    : 'Enter your college credentials to access hall reservations'}
                </p>
              </div>

              {/* Success / Error Alerts */}
              {justVerified && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Account verified successfully! You can now sign in below.</span>
                </div>
              )}

              {apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <RefinedInput
                    label="College Email Address"
                    name="college_email"
                    type="email"
                    required
                    value={form.college_email}
                    onChange={handleChange}
                    error={errors.college_email}
                    isValid={isEmailValid}
                    placeholder="yourname@velalarengg.ac.in"
                    autoComplete="email"
                    icon={
                      <svg className="w-5 h-5 shrink-0" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    }
                  />

                  {/* ⚡ Instant Email Domain Completion Chip */}
                  {needsDomain && (
                    <button
                      type="button"
                      onClick={handleAppendDomain}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg transition-all hover:bg-blue-100 mt-1 cursor-pointer"
                    >
                      <span>⚡ Add @velalarengg.ac.in</span>
                    </button>
                  )}
                </div>

                <RefinedInput
                  label="Password"
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  icon={
                    <svg className="w-5 h-5 shrink-0" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end text-xs">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${
                    roleTab === 'admin'
                      ? 'bg-violet-700 hover:bg-violet-800 active:bg-violet-900 shadow-violet-700/20'
                      : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-600/20'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin shrink-0" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Authenticating…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to {roleTab === 'admin' ? 'Admin Portal' : 'Faculty Account'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Create Account Link */}
              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-slate-500">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
                    Create Faculty Account
                  </Link>
                </p>
              </div>

              {/* View Schedule Direct Banner */}
              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/schedule"
                  className="group flex items-center gap-3 w-full bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-2xl p-3.5 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">View Live Hall Schedule</p>
                    <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Public Access • No Login Required
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

            </div>

            {/* Bottom Institutional Copyright */}
            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Velalar College of Engineering and Technology. All rights reserved.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Login;
