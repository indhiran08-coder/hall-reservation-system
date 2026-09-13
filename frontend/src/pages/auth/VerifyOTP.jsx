import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyOTP = () => {
  const navigate      = useNavigate();
  const location      = useLocation();
  const personalEmail = location.state?.personal_email || '';

  const [digits, setDigits]       = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [timer, setTimer]         = useState(RESEND_SECONDS);

  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  // Redirect if no email passed
  useEffect(() => {
    if (!personalEmail) navigate('/register');
  }, [personalEmail, navigate]);

  const handleDigitChange = (index, value) => {
    // Only digits allowed
    if (value && !/^\d$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const next = [...digits];
    for (let i = 0; i < paste.length; i++) next[i] = paste[i];
    setDigits(next);
    inputRefs.current[Math.min(paste.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError('Please enter all 6 digits of your OTP');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOTP({ personal_email: personalEmail, otp });
      setSuccess('Account verified successfully! Redirecting to login…');
      setTimeout(() => navigate('/login', { state: { verified: true } }), 1400);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-[#2957a4] selection:text-white overflow-x-hidden relative">
      
      {/* ── Official VCET Banner Header ── */}
      <header className="relative z-30 w-full shrink-0">
        <div className="bg-white border-b border-slate-200 flex items-center justify-center px-4 py-2 shadow-xs">
          <Link
            to="/login"
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

      {/* ── Main Split Showcase Section with Ambient Glow ── */}
      <main className="relative flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex items-center justify-center">
        {/* Ambient Aurora Glow Orbs */}
        <div className="absolute top-1/4 -left-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-indigo-500/15 to-transparent blur-3xl pointer-events-none animate-float-slow -z-10" />
        <div className="absolute bottom-1/4 -right-8 w-80 h-80 sm:w-[400px] sm:h-[400px] rounded-full bg-gradient-to-bl from-sky-400/25 via-blue-700/15 to-transparent blur-3xl pointer-events-none animate-float-slow-reverse -z-10" />

        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[520px] animate-card-entrance">
          
          {/* ── LEFT PANEL: Showcase Architectural Background ── */}
          <div
            className="lg:col-span-5 relative p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden bg-cover bg-center animate-fade-in-left animation-delay-100"
            style={{ backgroundImage: 'url(/vcet-campus.jpg)' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-blue-950/85 to-indigo-950/90 backdrop-blur-[2px]" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Email Verification</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                Activate Your Reservation Portal
              </h2>
              
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Confirm your official email to finalize your guest reservation account and schedule events at VCET campus.
              </p>
            </div>

            <div className="relative z-10 my-6 space-y-3">
              {[
                '6-digit security code sent to your inbox',
                'Valid for 10 minutes to protect your account',
                'Immediate access to hall booking upon verification',
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-blue-600/40 border border-blue-400/50 flex items-center justify-center shrink-0 text-blue-300 mt-0.5 font-bold text-[10px]">
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

          {/* ── RIGHT PANEL: OTP Verification Form ── */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
            <div className="max-w-md mx-auto w-full space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-2 animate-fade-in-right animation-delay-150">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 border shadow-xs"
                  style={{ background: '#f0f4fa', borderColor: '#d3e0f3', color: '#2957a4' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Verify Your Email
                </h1>
                
                <p className="text-xs sm:text-sm text-slate-500">
                  Enter the 6-digit OTP sent to{' '}
                  <strong className="text-slate-800 font-bold block sm:inline">{personalEmail}</strong>
                </p>
              </div>

              {/* Alert Messages */}
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-fade-in-right">
                  <svg className="w-5 h-5 text-rose-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-fade-in-right">
                  <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-right animation-delay-250">
                
                {/* 6 Digit Inputs */}
                <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={(el) => (inputRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className={`w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-xl border-2
                        focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all duration-150
                        ${d ? 'border-[#2957a4] bg-blue-50/40 text-slate-900 shadow-2xs' : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#2957a4]'}
                        ${error ? 'border-rose-400 bg-rose-50/30' : ''}`}
                      aria-label={`OTP digit ${i + 1}`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <p className="text-xs text-slate-400 text-center font-medium">
                  OTP code is valid for <strong className="text-slate-700">10 minutes</strong>
                </p>

                {/* Submit Action with Shimmer Sweep */}
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
                      <svg className="w-5 h-5 animate-spin shrink-0 relative z-10" style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span className="relative z-10">Verifying OTP…</span>
                    </>
                  ) : (
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Verify & Create Account</span>
                      <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </button>

                {/* Resend & Navigation */}
                <div className="space-y-3 text-center pt-1">
                  {timer > 0 ? (
                    <p className="text-xs text-slate-500 font-medium">
                      Resend OTP in <span className="font-bold text-slate-700">{timer}s</span>
                    </p>
                  ) : (
                    <Link
                      to="/register"
                      className="text-xs font-bold hover:underline"
                      style={{ color: '#2957a4' }}
                    >
                      Didn't receive OTP? Register again
                    </Link>
                  )}

                  <div>
                    <Link
                      to="/register"
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
                    >
                      <span>← Back to Registration</span>
                    </Link>
                  </div>
                </div>

              </form>

            </div>

            {/* Footer */}
            <div className="text-center pt-6 text-[11px] text-slate-400">
              © 2026 Velalar College of Engineering and Technology (Autonomous)
            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default VerifyOTP;
