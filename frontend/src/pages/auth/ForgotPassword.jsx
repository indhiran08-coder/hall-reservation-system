import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../services/api';

// ─── Step indicators ──────────────────────────────────────────────────────────
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {[1, 2, 3].map((s) => (
      <React.Fragment key={s}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
          ${s < current ? 'bg-green-500 text-white' :
            s === current ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
            'bg-gray-200 text-gray-500'}`}>
          {s < current ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : s}
        </div>
        {s < 3 && <div className={`h-0.5 w-8 ${s < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
      </React.Fragment>
    ))}
  </div>
);

// ─── OTP input boxes (6 digits) ───────────────────────────────────────────────
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
          onChange={() => {}} // controlled via onKeyDown
          className={`w-11 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none transition-all
            ${d ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-900'}
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
        />
      ))}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
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

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(t); return 0; }
        return c - 1;
      });
    }, 1000);
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

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    if (otp.replace(/\D/g, '').length < 6) return setError('Please enter the complete 6-digit OTP.');
    setStep(3);
  };

  // ── Step 3: Reset Password ────────────────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        college_email: email,
        otp: otp.replace(/\D/g, ''),
        new_password: newPassword,
      });
      setStep(4); // success
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      // If OTP was invalid/expired, go back to step 2
      if (err.response?.data?.error?.toLowerCase().includes('otp')) setStep(2);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold text-gray-900">
            {step === 1 && 'Forgot Password'}
            {step === 2 && 'Enter OTP'}
            {step === 3 && 'New Password'}
            {step === 4 && 'Password Reset!'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {step === 1 && 'Enter your college email to receive an OTP'}
            {step === 2 && `OTP sent to ${email}`}
            {step === 3 && 'Choose a strong new password'}
            {step === 4 && 'Your password has been updated successfully'}
          </p>
        </div>

        <div className="card-body">
          {step < 4 && <Steps current={step} />}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* ── Step 1 ── */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <Input
                label="College Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@velalarengg.ac.in"
                autoFocus
              />
              <Button type="submit" loading={loading} className="w-full">
                Send OTP
              </Button>
              <p className="text-center text-sm text-gray-500">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
              </p>
            </form>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <p className="text-sm text-center text-gray-600 mb-1">Enter the 6-digit OTP</p>
                <OTPInput value={otp} onChange={setOtp} />
              </div>
              <Button type="submit" className="w-full" disabled={otp.replace(/\D/g,'').length < 6}>
                Verify OTP
              </Button>
              {/* Resend */}
              <p className="text-center text-sm text-gray-500">
                Didn't receive it?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-medium ${resendCooldown > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:underline'}`}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </p>
              <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-xs text-gray-400 hover:text-gray-600 text-center">
                ← Change email
              </button>
            </form>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                helper="At least 8 characters"
                autoFocus
              />
              <Input
                label="Confirm Password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
              />
              <Button type="submit" loading={loading} className="w-full">
                Reset Password
              </Button>
            </form>
          )}

          {/* ── Step 4 — Success ── */}
          {step === 4 && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Password updated!</p>
                <p className="text-sm text-gray-500 mt-1">You can now sign in with your new password.</p>
              </div>
              <Button onClick={() => navigate('/login')} className="w-full">
                Go to Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
