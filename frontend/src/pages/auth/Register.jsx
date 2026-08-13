import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

/* ─── Shared CSS (same as Login / ForgotPassword) ────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  @keyframes float {
    0%,100% { transform:translateY(0px) scale(1); }
    33%      { transform:translateY(-20px) scale(1.05); }
    66%      { transform:translateY(10px) scale(0.97); }
  }
  @keyframes shimmer {
    0%   { background-position:-200% center; }
    100% { background-position:200% center; }
  }
  @keyframes glow {
    0%,100% { box-shadow:0 0 20px rgba(99,102,241,0.4),0 0 60px rgba(99,102,241,0.1); }
    50%      { box-shadow:0 0 40px rgba(99,102,241,0.7),0 0 80px rgba(99,102,241,0.3); }
  }
  @keyframes slideUp {
    from { opacity:0; transform:translateY(30px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes rotateSlow {
    from { transform:rotate(0deg); }
    to   { transform:rotate(360deg); }
  }
  .card-3d { transform-style:preserve-3d; animation:glow 4s ease-in-out infinite; }
  .card-3d:hover { transform:perspective(1000px) rotateX(1deg) rotateY(-1deg) translateZ(8px); transition:transform 0.4s ease; }
  .slide-up { animation:slideUp 0.6s ease forwards; }
  .btn-glow {
    background:linear-gradient(135deg,#6366f1,#4f46e5,#818cf8,#6366f1);
    background-size:300% 300%;
    animation:shimmer 3s linear infinite;
    transition:transform 0.15s ease,box-shadow 0.15s ease;
  }
  .btn-glow:hover { transform:translateY(-2px); box-shadow:0 0 30px rgba(99,102,241,0.6),0 10px 30px rgba(99,102,241,0.3); }
  .btn-glow:active { transform:translateY(0); }
  .btn-glow:disabled { opacity:0.6; cursor:not-allowed; transform:none; animation:none; background:#4f46e5; }
  .glass-ring { border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); }
  .hex-ring  { animation:rotateSlow 20s linear infinite; }
  .hex-ring-2{ animation:rotateSlow 30s linear infinite reverse; }
  input:-webkit-autofill,input:-webkit-autofill:hover,input:-webkit-autofill:focus {
    -webkit-box-shadow:0 0 0 30px rgba(99,102,241,0.15) inset !important;
    -webkit-text-fill-color:#fff !important;
    transition:background-color 5000s ease-in-out 0s;
  }
`;

/* ─── Background ─────────────────────────────────────────────────────────────── */
const BgScene = () => (
  <>
    <div className="absolute rounded-full pointer-events-none" style={{ width:500,height:500,top:'-10%',left:'-10%',background:'rgba(99,102,241,0.35)',filter:'blur(60px)',animation:'float 10s ease-in-out infinite' }}/>
    <div className="absolute rounded-full pointer-events-none" style={{ width:400,height:400,top:'50%',right:'-8%',background:'rgba(139,92,246,0.3)',filter:'blur(60px)',animation:'float 14s ease-in-out infinite',animationDelay:'2s' }}/>
    <div className="absolute rounded-full pointer-events-none" style={{ width:300,height:300,bottom:'5%',left:'20%',background:'rgba(59,130,246,0.25)',filter:'blur(60px)',animation:'float 12s ease-in-out infinite',animationDelay:'4s' }}/>
    <div className="absolute rounded-full pointer-events-none" style={{ width:200,height:200,top:'30%',left:'40%',background:'rgba(236,72,153,0.15)',filter:'blur(60px)',animation:'float 9s ease-in-out infinite',animationDelay:'1s' }}/>
    <div className="hidden lg:block absolute top-1/2 right-6 -translate-y-1/2 opacity-10 hex-ring pointer-events-none">
      <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
        <polygon points="120,8 228,65 228,175 120,232 12,175 12,65" stroke="#818cf8" strokeWidth="1.5" fill="none"/>
        <polygon points="120,38 198,82 198,158 120,202 42,158 42,82" stroke="#6366f1" strokeWidth="1" fill="none"/>
      </svg>
    </div>
    <div className="hidden lg:block absolute top-1/2 left-6 -translate-y-1/2 opacity-10 hex-ring-2 pointer-events-none">
      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
        <polygon points="90,8 170,50 170,130 90,172 10,130 10,50" stroke="#a78bfa" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
    <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage:'linear-gradient(rgba(148,163,184,1) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,1) 1px,transparent 1px)',backgroundSize:'40px 40px' }}/>
  </>
);

/* ─── VCET Banner ─────────────────────────────────────────────────────────────── */
const VCETBanner = () => (
  <div className="relative z-10 w-full shrink-0">
    <div className="bg-white/95 backdrop-blur-sm flex items-center justify-center px-2 py-1.5 shadow-lg shadow-black/30">
      <img src="/vcet-banner.png" alt="Velalar College of Engineering and Technology" className="w-full max-w-2xl h-auto object-contain" style={{ maxHeight:'64px' }}/>
    </div>
    <div className="py-1.5 text-center text-xs font-bold tracking-[0.25em] uppercase text-white" style={{ background:'linear-gradient(90deg,#1e3a8a,#4338ca,#1e3a8a)' }}>
      Hall Reservation System
    </div>
  </div>
);

/* ─── Glass Input ─────────────────────────────────────────────────────────────── */
const GlassInput = ({ label, error, helper, type='text', ...props }) => {
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

/* ─── Initial form ───────────────────────────────────────────────────────────── */
const initialForm = { first_name:'', department:'', college_email:'', personal_email:'', phone:'', password:'', confirm_password:'' };

/* ══════════════════════════════════════════════════════════════════════════════
   Register Page
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
    setForm(f => ({ ...f, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
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
      await authAPI.register({ first_name:form.first_name.trim(), last_name:'', staff_id:'', department:form.department.trim(), college_email:form.college_email.trim(), personal_email:form.personal_email.trim(), phone:form.phone.trim(), password:form.password, confirm_password:form.confirm_password });
      navigate('/verify-otp', { state: { personal_email: form.personal_email.trim() } });
    } catch (err) {
      const isTimeout = err.code === 'ECONNABORTED' || err.message?.includes('timeout');
      setApiError(isTimeout ? 'Server is still waking up. Please try again in 10 seconds.' : (err.response?.data?.error || 'Registration failed. Please try again.'));
    } finally { clearTimeout(wakeTimer); setSlowWarning(false); setLoading(false); }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col" style={{ fontFamily:"'Inter',sans-serif", background:'linear-gradient(135deg,#0f0c29 0%,#1a1a4e 30%,#0d1b4b 60%,#0a0e2e 100%)' }}>
        <BgScene />
        <VCETBanner />

        <div className="relative z-10 flex-1 flex items-start justify-center px-4 py-8">
          <div className="w-full max-w-lg slide-up">
            <div className="card-3d glass-ring rounded-3xl overflow-hidden shadow-2xl">
              {/* Shimmer top bar */}
              <div className="h-1 w-full" style={{ background:'linear-gradient(90deg,#6366f1,#8b5cf6,#ec4899,#6366f1)',backgroundSize:'200% 100%',animation:'shimmer 3s linear infinite' }}/>

              <div className="px-7 py-8 sm:px-10 sm:py-10">
                {/* Header */}
                <div className="text-center mb-7">
                  <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                    style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)',boxShadow:'0 8px 32px rgba(99,102,241,0.4)' }}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
                  <p className="mt-1.5 text-sm text-blue-300">Register as a faculty member to book halls</p>
                </div>

                {/* Alerts */}
                {apiError && (
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-red-300 mb-5" style={{ background:'rgba(239,68,68,0.12)',border:'1px solid rgba(239,68,68,0.3)' }}>
                    <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                    {apiError}
                  </div>
                )}

                {slowWarning && !apiError && (
                  <div className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-amber-300 mb-5" style={{ background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)' }}>
                    <svg className="w-4 h-4 shrink-0 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
                    Server is waking up — this takes up to 30 seconds. Please wait…
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4" noValidate autoComplete="off">
                  {/* Row 1: Full Name + Department */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput label="Full Name" name="first_name" required value={form.first_name}
                      onChange={handleChange} error={errors.first_name} placeholder="e.g. Indhiran Sivachandran" autoComplete="off"/>
                    <GlassInput label="Department" name="department" required value={form.department}
                      onChange={handleChange} error={errors.department} placeholder="Enter your department" autoComplete="off"/>
                  </div>

                  {/* Row 2: College Email + Personal Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput label="College Email" name="college_email" type="email" required value={form.college_email}
                      onChange={handleChange} error={errors.college_email} placeholder="you@velalarengg.ac.in"
                      helper="Used for login" autoComplete="off"/>
                    <GlassInput label="Personal Email" name="personal_email" type="email" required value={form.personal_email}
                      onChange={handleChange} error={errors.personal_email} placeholder="you@gmail.com"
                      helper="OTP sent here" autoComplete="off"/>
                  </div>

                  {/* Mobile */}
                  <GlassInput label="Mobile Number" name="phone" type="tel" required value={form.phone}
                    onChange={handleChange} error={errors.phone} placeholder="Enter your mobile number"
                    maxLength={10} autoComplete="new-password" id="register_phone_field"/>

                  {/* Row 3: Password + Confirm */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GlassInput label="Password" name="password" type="password" required value={form.password}
                      onChange={handleChange} error={errors.password} placeholder="Min. 8 characters" autoComplete="new-password"/>
                    <GlassInput label="Confirm Password" name="confirm_password" type="password" required value={form.confirm_password}
                      onChange={handleChange} error={errors.confirm_password} placeholder="Repeat password" autoComplete="new-password"/>
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    className="btn-glow w-full py-3.5 rounded-xl text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 mt-2">
                    {loading
                      ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing…</>
                      : <>Send OTP &amp; Continue<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg></>
                    }
                  </button>

                  <p className="text-center text-sm text-blue-300">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold hover:text-blue-200 transition-colors underline underline-offset-2">Sign in</Link>
                  </p>
                </form>
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
};

export default Register;
