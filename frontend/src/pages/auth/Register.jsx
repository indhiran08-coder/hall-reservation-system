import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { authAPI } from '../../services/api';

const initialForm = {
  first_name: '',
  department: '',
  college_email: '',
  personal_email: '',
  phone: '',
  password: '',
  confirm_password: ''
};

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm]         = useState(initialForm);
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.first_name || form.first_name.trim().length < 2)
      errs.first_name = 'At least 2 characters required';
    if (!form.department || form.department.trim().length < 2)
      errs.department = 'Department is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.college_email))
      errs.college_email = 'Enter a valid email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personal_email))
      errs.personal_email = 'Enter a valid email';
    if (
      form.college_email &&
      form.personal_email &&
      form.college_email.toLowerCase() === form.personal_email.toLowerCase()
    )
      errs.personal_email = 'Must differ from college email';
    if (!/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = 'Enter a valid 10-digit mobile number';
    if (!form.password || form.password.length < 8)
      errs.password = 'Minimum 8 characters';
    if (form.password !== form.confirm_password)
      errs.confirm_password = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');
    try {
      // Send first_name as the full name; backend uses first_name column
      await authAPI.register({
        first_name: form.first_name.trim(),
        last_name: '',           // kept empty — still in DB schema
        staff_id: '',            // kept empty — still in DB schema
        department: form.department.trim(),
        college_email: form.college_email.trim(),
        personal_email: form.personal_email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirm_password: form.confirm_password
      });
      navigate('/verify-otp', { state: { personal_email: form.personal_email.trim() } });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="card">
        <div className="card-header">
          <h1 className="text-xl font-semibold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-0.5">Register as a faculty member to book halls</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body space-y-4" noValidate autoComplete="off">
          {apiError && <div className="alert-error">{apiError}</div>}

          {/* Full Name */}
          <Input
            label="Full Name"
            name="first_name"
            required
            value={form.first_name}
            onChange={handleChange}
            error={errors.first_name}
            placeholder="e.g. Indhiran K"
            autoComplete="off"
          />

          {/* Department — free text input */}
          <Input
            label="Department"
            name="department"
            required
            value={form.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="e.g. Computer Science & Engineering"
            autoComplete="off"
          />

          {/* College Email */}
          <Input
            label="College Email"
            name="college_email"
            type="email"
            required
            value={form.college_email}
            onChange={handleChange}
            error={errors.college_email}
            placeholder="you@velalarengg.ac.in"
            helper="Used for official communications and login"
            autoComplete="off"
          />

          {/* Personal Email */}
          <Input
            label="Personal Email"
            name="personal_email"
            type="email"
            required
            value={form.personal_email}
            onChange={handleChange}
            error={errors.personal_email}
            placeholder="you@gmail.com"
            helper="OTP will be sent to this email"
            autoComplete="off"
          />

          {/* Mobile Number — autoComplete="new-password" tricks browser into not autofilling */}
          <Input
            label="Mobile Number"
            name="phone"
            type="tel"
            required
            value={form.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="9876543210"
            maxLength={10}
            autoComplete="new-password"
            id="register_phone_field"
          />

          {/* Password */}
          <Input
            label="Password"
            name="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
          />

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            name="confirm_password"
            type="password"
            required
            value={form.confirm_password}
            onChange={handleChange}
            error={errors.confirm_password}
            placeholder="Repeat password"
            autoComplete="new-password"
          />

          <Button type="submit" variant="primary" loading={loading} className="w-full">
            Send OTP & Continue
          </Button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Register;
