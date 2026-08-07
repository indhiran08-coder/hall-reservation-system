import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Button from '../../components/ui/Button';
import { authAPI } from '../../services/api';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyOTP = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const personalEmail = location.state?.personal_email || '';

  const [digits, setDigits]     = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [timer, setTimer]       = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);

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
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login', { state: { verified: true } }), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter the 6-digit OTP sent to{' '}
            <span className="font-medium text-gray-700">{personalEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-5">
          {error && <div className="alert-error">{error}</div>}
          {success && <div className="alert-success">{success}</div>}

          {/* OTP digit inputs */}
          <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
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
                className={`w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                  transition-all duration-150
                  ${d ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                  ${error ? 'border-red-400' : ''}`}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            OTP is valid for <strong>10 minutes</strong>
          </p>

          <Button type="submit" loading={loading} className="w-full">
            Verify & Create Account
          </Button>

          {/* Resend */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-medium text-gray-700">{timer}s</span>
              </p>
            ) : (
              <Link
                to="/register"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                Didn't receive OTP? Register again
              </Link>
            )}
          </div>

          <div className="text-center">
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to Registration
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default VerifyOTP;
