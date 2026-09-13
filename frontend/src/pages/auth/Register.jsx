import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

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

/* ─── Refined Input Component ─────────────────────────────────────────────── */
const RefinedInput = ({ label, error, helper, type = 'text', icon, required = true, ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase">
        {label}
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
            transition-all duration-200 py-3 ${icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-11' : 'pr-4'}`}
          {...props}
        />
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
      {helper && !error && <p className="text-[11px] text-slate-500 mt-0.5">{helper}</p>}
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

const initialForm = {
  organization_name: '',
  contact_person: '',
  email: '',
  phone: '',
  password: '',
  confirm_password: ''
};

/* ══════════════════════════════════════════════════════════════════════════════
   Guest Registration Page for External Organizations
══════════════════════════════════════════════════════════════════════════════ */
const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]               = useState(initialForm);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [apiError, setApiError]       = useState('');
  const [slowWarning, setSlowWarning] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.organization_name || form.organization_name.trim().length < 2)
      errs.organization_name = 'Organization / Company name is required';
    if (!form.contact_person || form.contact_person.trim().length < 2)
      errs.contact_person = 'Contact person name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Enter a valid email address';
    if (!/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.password || form.password.length < 6)
      errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError(''); setSlowWarning(false);
    const wakeTimer = setTimeout(() => setSlowWarning(true), 4000);
    try {
      await authAPI.register({
        organization_name: form.organization_name.trim(),
        contact_person: form.contact_person.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm_password
      });
      navigate('/verify-otp', { state: { personal_email: form.email.trim() } });
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      setApiError(
        isTimeout
          ? 'Server is still waking up. Please try again in 10 seconds.'
          : (err.response?.data?.error || 'Registration failed. Please try again.')
      );
    } finally {
      clearTimeout(wakeTimer);
      setSlowWarning(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden relative">
      {/* ── Official VCET Banner Header ── */}
      <header className="relative z-30 w-full shrink-0">
        <div className="bg-white border-b border-slate-200 flex items-center justify-center px-4 py-2 shadow-xs">
          <Link
            to="/login"
            onClick={() => { window.location.href = '/login'; }}
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

      {/* ── Main Split Section with Ambient Glow ── */}
      <main className="relative flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        {/* Ambient Aurora Glow Orbs */}
        <div className="absolute top-1/4 -left-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-transparent blur-3xl pointer-events-none animate-float-slow -z-10" />
        <div className="absolute bottom-1/4 -right-8 w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-bl from-sky-400/25 via-blue-700/15 to-transparent blur-3xl pointer-events-none animate-float-slow-reverse -z-10" />

        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px] animate-card-entrance">

          {/* ── LEFT PANEL: Institutional Branding & Guidelines ── */}
          <div
            className="lg:col-span-4 relative p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden bg-cover bg-center animate-fade-in-left animation-delay-100"
            style={{ backgroundImage: 'url(/vcet-campus.jpg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-[2px]" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>External Guest Access</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Host Events at VCET Campus
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Register as an external organization, company, or guest organizer to book seminar halls, auditoriums, and convention facilities.
              </p>
            </div>

            <div className="relative z-10 my-6 space-y-3">
              {[
                'Organization-based guest reservation account',
                'Instant OTP verification sent to your official email',
                'Direct access to live hall roadmaps & availability',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-blue-600/40 border border-blue-400/50 flex items-center justify-center shrink-0 text-blue-300 mt-0.5">
                    ✓
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-slate-400">
              Need assistance? Contact VCET Hall Administration
            </div>
          </div>

          {/* ── RIGHT PANEL: Form Container ── */}
          <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div className="w-full space-y-6">

              <div className="text-left space-y-1 animate-fade-in-right animation-delay-150">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Register as Guest</h1>
                <p className="text-sm text-slate-500">Provide your organization and coordinator details to begin</p>
              </div>

              {apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fade-in-right">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {slowWarning && !apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800 animate-fade-in-right">
                  <svg className="w-4 h-4 text-amber-600 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Server is waking up — this takes up to 30 seconds on cold start. Please wait…</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-right animation-delay-250" noValidate autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="ORGANIZATION / GUEST NAME"
                    name="organization_name"
                    value={form.organization_name}
                    onChange={handleChange}
                    error={errors.organization_name}
                    placeholder="e.g. Rotary Club / Guest Speaker"
                  />
                  <RefinedInput
                    label="CONTACT PERSON NAME"
                    name="contact_person"
                    value={form.contact_person}
                    onChange={handleChange}
                    error={errors.contact_person}
                    placeholder="e.g. Indhiran Sivachandran"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="CONTACT EMAIL ADDRESS"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    error={errors.email}
                    placeholder="email@example.com"
                  />
                  <RefinedInput
                    label="CONTACT PHONE NUMBER"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    autoComplete="new-password"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="PASSWORD"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                  />
                  <RefinedInput
                    label="CONFIRM PASSWORD"
                    name="confirm_password"
                    type="password"
                    value={form.confirm_password}
                    onChange={handleChange}
                    error={errors.confirm_password}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative overflow-hidden w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md hover:shadow-xl hover:shadow-blue-900/25 hover:brightness-105 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2 cursor-pointer group"
                  style={{ background: '#2957a4' }}
                >
                  {/* Subtle Light Shimmer Sweep */}
                  <span className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none animate-shimmer-sweep" />

                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin shrink-0 relative z-10" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="relative z-10">Processing Registration…</span>
                    </>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Send OTP & Verify</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold hover:underline" style={{ color: '#2957a4' }}>
                    Sign in to your account
                  </Link>
                </p>
              </div>

            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} Velalar College of Engineering and Technology. All rights reserved.
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Register;
