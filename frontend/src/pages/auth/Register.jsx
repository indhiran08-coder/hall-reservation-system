import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

/* ─── Eye Icon Toggle ──────────────────────────────────────────────────────── */
const EyeIcon = ({ show }) =>
  show ? (
    <svg className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4.5 h-4.5 text-slate-400 hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

/* ─── Refined Input Component ─────────────────────────────────────────────── */
const RefinedInput = ({ label, error, helper, type = 'text', icon, required = true, ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1.5 text-left">
      <label className="block text-xs font-semibold text-slate-700 tracking-wide">
        {label} {required && <span className="text-rose-500">*</span>}
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
  first_name: '',
  department: '',
  college_email: '',
  personal_email: '',
  phone: '',
  password: '',
  confirm_password: ''
};

/* ══════════════════════════════════════════════════════════════════════════════
   Enterprise Register Page
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
    if (!form.first_name || form.first_name.trim().length < 2) errs.first_name = 'At least 2 characters required';
    if (!form.department || form.department.trim().length < 2) errs.department = 'Department is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email)) errs.college_email = 'Enter a valid email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personal_email)) errs.personal_email = 'Enter a valid email';
    if (form.college_email && form.personal_email && form.college_email.toLowerCase() === form.personal_email.toLowerCase())
      errs.personal_email = 'Must differ from college email';
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirm_password) errs.confirm_password = 'Passwords do not match';
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
        first_name: form.first_name.trim(),
        last_name: '',
        staff_id: '',
        department: form.department.trim(),
        college_email: form.college_email.trim(),
        personal_email: form.personal_email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm_password
      });
      navigate('/verify-otp', { state: { personal_email: form.personal_email.trim() } });
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Official VCET Banner Header ── */}
      <header className="relative z-30 w-full shrink-0">
        <div className="bg-white border-b border-slate-200 flex items-center justify-center px-4 py-2 shadow-xs">
          <img
            src="/vcet-banner.png"
            alt="Velalar College of Engineering and Technology"
            className="w-full max-w-2xl h-auto object-contain"
            style={{ maxHeight: '64px' }}
          />
        </div>
        <div
          className="py-1.5 text-center text-xs font-bold tracking-[0.25em] uppercase text-white shadow-xs"
          style={{ background: 'linear-gradient(90deg, #1e3a8a, #4338ca, #1e3a8a)' }}
        >
          Hall Reservation System
        </div>
      </header>

      {/* ── Main Split Section ── */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">

          {/* ── LEFT PANEL: Institutional Branding & Guidelines ── */}
          <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Faculty Registration</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Create Your Official VCET Account
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Register as an authorized faculty member to manage and reserve campus halls, auditoriums, and seminar facilities.
              </p>
            </div>

            <div className="relative z-10 my-6 space-y-3">
              {[
                'Use your official college email (@velalarengg.ac.in)',
                'OTP verification will be sent to your personal email',
                'Instant access to real-time hall schedule matrix',
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
              Need assistance? Contact VCET IT Support
            </div>
          </div>

          {/* ── RIGHT PANEL: Form Container ── */}
          <div className="lg:col-span-8 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div className="w-full space-y-6">

              <div className="text-left space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
                <p className="text-sm text-slate-500">Register your faculty details to begin hall reservations</p>
              </div>

              {apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{apiError}</span>
                </div>
              )}

              {slowWarning && !apiError && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-800">
                  <svg className="w-4 h-4 text-amber-600 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Server is waking up — this takes up to 30 seconds on cold start. Please wait…</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="Full Name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    placeholder="e.g. Indhiran Sivachandran"
                  />
                  <RefinedInput
                    label="Department"
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    error={errors.department}
                    placeholder="e.g. Computer Science"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="College Email"
                    name="college_email"
                    type="email"
                    value={form.college_email}
                    onChange={handleChange}
                    error={errors.college_email}
                    placeholder="you@velalarengg.ac.in"
                    helper="Used for sign-in & official logs"
                  />
                  <RefinedInput
                    label="Personal Email"
                    name="personal_email"
                    type="email"
                    value={form.personal_email}
                    onChange={handleChange}
                    error={errors.personal_email}
                    placeholder="you@gmail.com"
                    helper="OTP verification sent here"
                  />
                </div>

                <RefinedInput
                  label="Mobile Number"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                  autoComplete="new-password"
                  id="register_phone_field"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <RefinedInput
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                  />
                  <RefinedInput
                    label="Confirm Password"
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
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4.5 h-4.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Processing Registration…</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP & Continue</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <p className="text-xs sm:text-sm text-slate-500">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800 hover:underline">
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
