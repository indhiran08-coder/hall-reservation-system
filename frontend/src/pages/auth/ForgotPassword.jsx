import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

/* ─── Shared styles ──────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  @keyframes float {
    0%,100% { transform: translateY(0px) scale(1); }
    33%      { transform: translateY(-20px) scale(1.05); }
    66%      { transform: translateY(10px) scale(0.97); }
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
  .card-3d { transform-style: preserve-3d; animation: glow 4s ease-in-out infinite; }
  .card-3d:hover { transform: perspective(1000px) rotateX(1deg) rotateY(-1deg) translateZ(8px); transition: transform 0.4s ease; }
  .slide-up { animation: slideUp 0.6s ease forwards; }
  .btn-glow {
    background: linear-gradient(135deg, #6366f1, #4f46e5, #818cf8, #6366f1);
    background-size: 300% 300%;
    animation: shimmer 3s linear infinite;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(99,102,241,0.6), 0 10px 30px rgba(99,102,241,0.3); }
  .btn-glow:active { transform: translateY(0); }
  .btn-glow:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .glass-ring {
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  .hex-ring  { animation: rotateSlow 20s linear infinite; }
  .hex-ring-2{ animation: rotateSlow 30s linear infinite reverse; }
  input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 30px rgba(99,102,241,0.15) inset !important;
    -webkit-text-fill-color: #fff !important;
    transition: background-color 5000s ease-in-out 0s;
  }
`;

/* ─── Background scene (shared) ──────────────────────────────────────────────── */
const BgScene = () => (
  <>
    <div className="absolute rounded-full pointer-events-none" style={{ width:500,height:500,top:'-10%',left:'-10%',background:'rgba(99,102,241,0.35)',filter:'blur(60px)',animation:'float 10s ease-in-out infinite' }} />
    <div className="absolute rounded-full pointer-events-none" style={{ width:400,height:400,top:'50%',right:'-8%',background:'rgba(139,92,246,0.3)',filter:'blur(60px)',animation:'float 14s ease-in-out infinite',animationDelay:'2s' }} />
    <div className="absolute rounded-full pointer-events-none" style={{ width:300,height:300,bottom:'5%',left:'20%',background:'rgba(59,130,246,0.25)',filter:'blur(60px)',animation:'float 12s ease-in-out infinite',animationDelay:'4s' }} />
    <div className="absolute rounded-full pointer-events-none" style={{ width:200,height:200,top:'30%',left:'40%',background:'rgba(236,72,153,0.15)',filter:'blur(60px)',animation:'float 9s ease-in-out infinite',animationDelay:'1s' }} />
    <div className="hidden lg:block absolute top-1/2 right-8 -translate-y-1/2 opacity-10 hex-ring pointer-events-none">
      <svg width="280" height="280" viewBox="0 0 280 280" fill="none">
        <polygon points="140,8 268,75 268,205 140,272 12,205 12,75" stroke="#818cf8" strokeWidth="1.5" fill="none"/>
        <polygon points="140,38 238,97 238,183 140,242 42,183 42,97" stroke="#6366f1" strokeWidth="1" fill="none"/>
      </svg>
    </div>
    <div className="hidden lg:block absolute top-1/2 left-8 -translate-y-1/2 opacity-10 hex-ring-2 pointer-events-none">
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <polygon points="100,8 190,55 190,145 100,192 10,145 10,55" stroke="#a78bfa" strokeWidth="1.5" fill="none"/>
        <polygon points="100,35 163,70 163,130 100,165 37,130 37,70" stroke="#818cf8" strokeWidth="1" fill="none"/>
      </svg>
    </div>
    <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage:'linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />
  </>
);

/* ─── VCET Banner ─────────────────────────────────────────────────────────────── */
const VCETBanner = () => (
  <div className="relative z-10 w-full">
    <div className="bg-white/95 backdrop-blur-sm flex items-center justify-center px-2 py-1.5 shadow-lg shadow-black/30">
      <img src="/vcet-banner.png" alt="Velalar College of Engineering and Technology" className="w-full max-w-2xl h-auto object-contain" style={{ maxHeight:'64px' }} />
    </div>
    <div className="py-1.5 text-center text-xs font-bold tracking-[0.25em] uppercase text-white" style={{ background:'linear-gradient(90deg, #1e3a8a, #4338ca, #1e3a8a)' }}>
      Hall Reservation System
    </div>
  </div>
);

/* ─── Glass Input ─────────────────────────────────────────────────────────────── */
const GlassInput = ({ label, error, helper, type = 'text', ...props }) => {
  const [showPwd, setShowPwd] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-blue-100 tracking-widest uppercase">{label}</label>
      <div className="relative">
        <input
          type={isPassword ? (showPwd ? 'text' : 'password') : type}
          className="w-full rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-blue-300 bg-white/10 border border-white/20 backdrop-blur-sm focus:outline-none focus:border-blue-300 focus:bg-white/15 focus:ring-2 focus:ring-blue-300/30 transition-all duration-200"
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors" tabIndex={-1}>
            {showPwd
              ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
            }
          </button>
        )}
      </div>
      {helper && !error && <p className="text-xs text-blue-400 mt-0.5">{helper}</p>}
      {error && <p className="text-xs text-red-300 mt-0.5">{error}</p>}
    </div>
  );
};

/* ─── Shimmer button ─────────────────────────────────────────────────────────── */
const ShimmerBtn = ({ loading, children, ...props }) => (
  <button {...props} disabled={loading || props.disabled} className="btn-glow w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2">
    {loading
      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Please wait…</>
      : children
    }
  </button>
);

/* ─── Error alert ─────────────────────────────────────────────────────────────── */
const ErrAlert = ({ msg }) => !msg ? null : (
  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-red-300 mb-4" style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)' }}>
    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
    {msg}
  </div>
);

/* ─── Step dots ──────────────────────────────────────────────────────────────── */
const Steps = ({ current }) => (
  <div className="flex items-center justify-center gap-2 mb-7">
    {[1, 2, 3].map((s) => (
      <React.Fragment key={s}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
          ${s < current  ? 'bg-green-500 text-white shadow-lg shadow-green-500/40' :
            s === current ? 'text-white ring-4 ring-blue-400/30' : 'text-blue-300'}
        `} style={s === current ? { background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 0 20px rgba(99,102,241,0.5)' } : s < current ? {} : { background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)' }}>
          {s < current
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            : s}
        </div>
        {s < 3 && <div className={`h-0.5 w-10 rounded transition-all duration-500 ${s < current ? 'bg-green-500' : 'bg-white/15'}`} />}
      </React.Fragment>
    ))}
  </div>
);

/* ─── OTP boxes ──────────────────────────────────────────────────────────────── */
const OTPInput = ({ value, onChange }) => {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = [...digits];
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { refs[i - 1].current?.focus(); next[i - 1] = ''; onChange(next.join('')); }
      return;
    }
    if (!/^\d$/.test(e.key)) return;
    const next = [...digits]; next[i] = e.key; onChange(next.join(''));
    if (i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(text.padEnd(6, '').slice(0, 6).trimEnd());
    refs[Math.min(text.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center my-5">
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
          onKeyDown={(e) => handleKey(i, e)} onPaste={handlePaste} onChange={() => {}}
          className="w-11 h-13 text-center text-xl font-bold rounded-xl outline-none transition-all"
          style={{ height:'52px', background: d ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)', border: d ? '2px solid rgba(99,102,241,0.8)' : '2px solid rgba(255,255,255,0.2)', color:'white', boxShadow: d ? '0 0 15px rgba(99,102,241,0.4)' : 'none' }}
        />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════════
   Forgot Password Page
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
    { title: 'Forgot Password',  sub: 'Enter your college email to receive an OTP' },
    { title: 'Enter OTP',        sub: `OTP sent to ${email}` },
    { title: 'New Password',     sub: 'Choose a strong new password' },
    { title: 'Password Reset!',  sub: 'Your password has been updated successfully' },
  ];
  const { title, sub } = stepMeta[step - 1];

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => setResendCooldown(c => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault(); setError('');
    if (!email) return setError('Please enter your college email.');
    setLoading(true);
    try { await api.post('/auth/forgot-password', { college_email: email }); setStep(2); startCooldown(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to send OTP. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return; setError(''); setLoading(true);
    try { await api.post('/auth/forgot-password', { college_email: email }); setOtp(''); startCooldown(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to resend OTP.'); }
    finally { setLoading(false); }
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
      await api.post('/auth/reset-password', { college_email: email, otp: otp.replace(/\D/g, ''), new_password: newPassword });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Please try again.');
      if (err.response?.data?.error?.toLowerCase().includes('otp')) setStep(2);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="min-h-screen w-full relative overflow-hidden flex flex-col" style={{ fontFamily:"'Inter',sans-serif", background:'linear-gradient(135deg,#0f0c29 0%,#1a1a4e 30%,#0d1b4b 60%,#0a0e2e 100%)' }}>
        <BgScene />
        <VCETBanner />

        <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md slide-up">
            <div className="card-3d glass-ring rounded-3xl overflow-hidden shadow-2xl">
              <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#6366f1)', backgroundSize:'200% 100%', animation:'shimmer 3s linear infinite' }} />

              <div className="px-7 py-8 sm:px-10 sm:py-10">
                {/* Header icon */}
                <div className="text-center mb-6">
                  <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow:'0 8px 32px rgba(99,102,241,0.4)' }}>
                    {step === 4
                      ? <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                      : <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
                    }
                  </div>
                  <h1 className="text-2xl font-extrabold text-white">{title}</h1>
                  <p className="mt-1 text-sm text-blue-300">{sub}</p>
                </div>

                {step < 4 && <Steps current={step} />}
                <ErrAlert msg={error} />

                {/* Step 1 */}
                {step === 1 && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <GlassInput label="College Email" type="email" required value={email}
                      onChange={(e) => setEmail(e.target.value)} placeholder="yourname@velalarengg.ac.in" autoFocus />
                    <ShimmerBtn type="submit" loading={loading}>
                      Send OTP
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </ShimmerBtn>
                    <p className="text-center text-sm text-blue-300">
                      Remember your password?{' '}
                      <Link to="/login" className="text-white font-semibold hover:text-blue-200 transition-colors underline underline-offset-2">Sign in</Link>
                    </p>
                  </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <p className="text-sm text-center text-blue-300">Enter the 6-digit OTP sent to your email</p>
                    <OTPInput value={otp} onChange={setOtp} />
                    <ShimmerBtn type="submit" disabled={otp.replace(/\D/g,'').length < 6}>
                      Verify OTP
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </ShimmerBtn>
                    <p className="text-center text-sm text-blue-300">
                      Didn't receive it?{' '}
                      <button type="button" onClick={handleResend} disabled={resendCooldown > 0 || loading}
                        className={`font-semibold transition-colors ${resendCooldown > 0 ? 'text-blue-500 cursor-not-allowed' : 'text-white hover:text-blue-200'}`}>
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </p>
                    <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }}
                      className="w-full text-xs text-blue-400 hover:text-blue-200 text-center transition-colors">
                      ← Change email
                    </button>
                  </form>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <form onSubmit={handleReset} className="space-y-4">
                    <GlassInput label="New Password" type="password" required value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 8 characters" autoFocus />
                    <GlassInput label="Confirm Password" type="password" required value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter new password"
                      error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : ''} />
                    <ShimmerBtn type="submit" loading={loading}>
                      Reset Password
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    </ShimmerBtn>
                  </form>
                )}

                {/* Step 4 — Success */}
                {step === 4 && (
                  <div className="text-center space-y-5 py-2">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                      style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.2),rgba(34,197,94,0.1))', border:'2px solid rgba(34,197,94,0.5)', boxShadow:'0 0 40px rgba(34,197,94,0.3)' }}>
                      <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Password updated!</p>
                      <p className="text-sm text-blue-300 mt-1">You can now sign in with your new password.</p>
                    </div>
                    <ShimmerBtn onClick={() => navigate('/login')}>
                      Go to Sign In
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </ShimmerBtn>
                  </div>
                )}
              </div>
            </div>

            <p className="text-center mt-6 text-xs text-blue-400 opacity-70">
              © {new Date().getFullYear()} Velalar College of Engineering and Technology (Autonomous)
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
