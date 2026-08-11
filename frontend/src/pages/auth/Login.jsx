import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [form, setForm]       = useState({ college_email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Show success message if redirected from OTP verification
  const justVerified = location.state?.verified;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email))
      errs.college_email = 'Enter a valid email address';
    if (!form.password)
      errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      const { data } = await authAPI.login(form);
      login(data.user, data.token);
      // Admin goes to admin dashboard, staff to regular dashboard
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold text-gray-900">Welcome Back</h1>
          <p className="text-sm text-gray-500 mt-0.5">Sign in to manage your hall reservations</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4" noValidate>
          {justVerified && (
            <div className="alert-success">
              ✓ Account verified! You can now sign in.
            </div>
          )}

          {apiError && <div className="alert-error">{apiError}</div>}

          <Input
            label="College Email"
            name="college_email"
            type="email"
            required
            value={form.college_email}
            onChange={handleChange}
            error={errors.college_email}
            placeholder="john.doe@college.edu"
            autoComplete="email"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Your password"
            autoComplete="current-password"
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>

          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create one
            </Link>
          </p>

          {/* Public schedule link */}
          <div className="border-t border-gray-100 pt-3">
            <Link
              to="/schedule"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              View Hall Schedule (No login needed)
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
