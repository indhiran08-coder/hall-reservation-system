import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

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

/* ─── Step Progress Dots ─────────────────────────────────────────────────── */
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-2 my-5">
    {[1, 2, 3].map((s) => (
      <React.Fragment key={s}>
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200
            ${
              s < current
                ? 'bg-emerald-600 text-white'
                : s === current
                ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
        >
          {s < current ? '✓' : s}
        </div>
        {s < 3 && <div className={`h-0.5 w-8 rounded ${s < current ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

/* ─── OTP Input ──────────────────────────────────────────────────────────── */
const OTPInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        refs[i - 1].current?.focus();
        next[i - 1] = '';
        onChange(next.join(''));
      }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits];
    next[i] = e.key;
    onChange(next.join(''));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text.padEnd(6, '').slice(0, 6).trimEnd());
    refs[Math.min(text.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center my-4">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          onChange={() => {}}
          className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
            ${
              d
                ? 'border-blue-600 bg-blue-50/50 text-blue-900'
                : 'border-slate-200 bg-slate-50 text-slate-900'
            } focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10`}
        />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   Enterprise Forgot Password Page
══════════════════════════════════════════════════════════════════════════════ */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]                     = useState(1);
  const [email, setEmail]                   = useState('');
  const [otp, setOtp]                       = useState('');
  const [newPassword, setNewPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const stepMeta = [
    { title: 'Forgot Password', sub: 'Enter your college email to receive a recovery OTP' },
    { title: 'Enter OTP Code', sub: `6-digit verification code sent to ${email}` },
    { title: 'Set New Password', sub: 'Create a strong, secure password for your account' },
    { title: 'Password Updated!', sub: 'Your password has been reset successfully' },
  ];
  const { title, sub } = stepMeta[step - 1];

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault(); setError('');
    if (!email) return setError('Please enter your college email.');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { college_email: email });
      setStep(2);
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { college_email: email });
      setOtp('');
      startCooldown();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault(); setError('');
    if (otp.replace(/\D/g, '').length < 6) return setError('Please enter the complete 6-digit OTP.');
    setStep(3);
  };

  const handleReset = async (e) => {
    e.preventDefault(); setError('');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        college_email: email,
        otp: otp.replace(/\D/g, ''),
        new_password: newPassword,
      });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      if (err.response?.data?.error?.toLowerCase().includes('otp')) setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
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
          style={{ background: 'linear-gradient(90deg, #1e3a8a, #4338ca, #1e3a8a)' }}
        >
          Hall Reservation System
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-8 sm:p-10 space-y-6">

          <div className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3">
              {step === 4 ? (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-xs sm:text-sm text-slate-500">{sub}</p>
          </div>

          {step < 4 && <Steps current={step} />}

          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800">
              <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Send OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <RefinedInput
                label="College Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@velalarengg.ac.in"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? 'Sending OTP…' : 'Send Recovery OTP'}
              </button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
                  ← Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: OTP Entry */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <OTPInput value={otp} onChange={setOtp} />
              <button
                type="submit"
                disabled={otp.replace(/\D/g, '').length < 6}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Verify OTP
              </button>
              <div className="text-center text-xs text-slate-500 space-y-2">
                <p>
                  Didn't receive code?{' '}
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || loading}
                    className={`font-bold ${resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </p>
                <button
                  type="button"
                  onClick={() => { setStep(1); setOtp(''); setError(''); }}
                  className="text-slate-400 hover:text-slate-600 text-xs block mx-auto"
                >
                  ← Change email address
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleReset} className="space-y-4">
              <RefinedInput
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                helper="At least 8 characters long"
                autoFocus
              />
              <RefinedInput
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-md shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Updating Password…' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Step 4: Success Screen */}
          {step === 4 && (
            <div className="text-center space-y-5 py-3">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-slate-900 font-bold text-base">Password Updated!</p>
                <p className="text-xs text-slate-500 mt-1">You can now sign in with your new password.</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all duration-200"
              >
                Go to Sign In
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Velalar College of Engineering and Technology.
          </div>

        </div>
      </main>
    </div>
  );
}
