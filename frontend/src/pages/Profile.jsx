import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { profileAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';



const Profile = () => {
  const { user, updateUser, isAdmin } = useAuth();

  const [form, setForm]       = useState({
    personal_email: '', phone: '', department: '',
    password: '', new_password: '', confirm_new: ''
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState('');

  useEffect(() => {
    profileAPI.get()
      .then(({ data }) => {
        setForm((f) => ({
          ...f,
          personal_email: data.user.personal_email || '',
          phone: data.user.phone || '',
          department: data.user.department || ''
        }));
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setApiError('');
    setSuccess('');
  };

  const validate = () => {
    const errs = {};
    if (form.personal_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.personal_email))
      errs.personal_email = 'Enter a valid email address';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = 'Enter a valid 10-digit mobile number';
    if (isAdmin && form.new_password) {
      if (form.new_password.length < 6)
        errs.new_password = 'Minimum 6 characters';
      if (form.new_password !== form.confirm_new)
        errs.confirm_new = 'Passwords do not match';
      if (!form.password)
        errs.password = 'Current password required';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {};
    if (isAdmin && form.personal_email) payload.personal_email = form.personal_email;
    if (form.phone)          payload.phone          = form.phone;
    if (isAdmin && form.department)     payload.department     = form.department;
    if (isAdmin && form.new_password) {
      payload.password     = form.password;
      payload.new_password = form.new_password;
    }

    setSaving(true);
    setApiError('');
    setSuccess('');
    try {
      const { data } = await profileAPI.update(payload);
      updateUser(data.user);
      setSuccess('Profile updated successfully!');
      setForm((f) => ({ ...f, password: '', new_password: '', confirm_new: '' }));
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your personal information</p>
        </div>

        {/* Read-only identity card */}
        <div className="card">
          <div className="card-header flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-blue-700">
                {user?.first_name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-500">{user?.department}</p>
            </div>
          </div>
          <div className="card-body grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Staff ID',      value: user?.staff_id || '—' },
              { label: 'College Email', value: user?.college_email },
              { label: 'Department',    value: user?.department },
              { label: 'Member Since',  value: formatDate(user?.created_at?.split('T')[0]) || '—' }
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="text-sm font-medium text-gray-900">{value}</p>
              </div>
            ))}
            <div className="sm:col-span-2">
              <p className="text-xs text-gray-400 mb-1">Account Security & Policy</p>
              <p className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 inline-block">
                {isAdmin ? 'Administrator account with full permissions' : 'Department account — department, email, and password are fixed and managed by administrator'}
              </p>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {apiError && <div className="alert-error">{apiError}</div>}
          {success  && <div className="alert-success">✓ {success}</div>}

          <div className="card p-5 space-y-4">
            <h2 className="font-semibold text-gray-900">Update Information</h2>

            <Input
              label="Personal Email" name="personal_email" type="email"
              value={form.personal_email} onChange={handleChange}
              error={errors.personal_email}
              placeholder="your@gmail.com"
              disabled={!isAdmin}
              helper={!isAdmin ? 'Official department email managed by college administration (read-only)' : undefined}
            />

            <Input
              label="Mobile Number" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              error={errors.phone}
              placeholder="9876543210" maxLength={10}
              helper="Staff contact number for reservation notifications"
            />

            <Input
              label="Department" name="department"
              value={form.department} onChange={handleChange}
              error={errors.department}
              placeholder="e.g. Computer Science, EEE, MBA…"
              disabled={!isAdmin}
              helper={!isAdmin ? 'Official assigned department (read-only)' : undefined}
            />
          </div>

          {/* Password change — Administrator only */}
          {isAdmin && (
            <div className="card p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Change Password</h2>
              <p className="text-sm text-gray-500">Leave blank if you don't want to change your password.</p>

              <Input
                label="Current Password" name="password" type="password"
                value={form.password} onChange={handleChange}
                error={errors.password} placeholder="Your current password"
              />
              <Input
                label="New Password" name="new_password" type="password"
                value={form.new_password} onChange={handleChange}
                error={errors.new_password} placeholder="Min. 6 characters"
              />
              <Input
                label="Confirm New Password" name="confirm_new" type="password"
                value={form.confirm_new} onChange={handleChange}
                error={errors.confirm_new} placeholder="Repeat new password"
              />
            </div>
          )}

          <Button type="submit" variant="primary" loading={saving} className="w-full">
            Save Changes
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
