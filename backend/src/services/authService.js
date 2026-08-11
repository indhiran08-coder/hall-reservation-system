const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail, sendPasswordResetEmail } = require('./emailService');

/**
 * Step 1: Validate uniqueness, generate OTP, store temporarily, send email.
 * The full registration data is stored in otp.metadata until OTP is verified.
 */
const initiateRegistration = async (userData) => {
  const { first_name, last_name = '', staff_id = '', department, college_email, personal_email, phone, password } = userData;

  // Check college email uniqueness
  const { data: byEmail } = await supabase
    .from('users')
    .select('id')
    .eq('college_email', college_email.toLowerCase())
    .maybeSingle();

  if (byEmail) throw new Error('An account with this college email already exists');

  // Generate OTP and store (upsert by personal_email so re-registration works)
  const otp = generateOTP();
  const expires_at = getOTPExpiry();

  const metadata = JSON.stringify({
    first_name: first_name.trim(),
    last_name: (last_name || '').trim() || null,
    staff_id: (staff_id || '').trim() || null,
    department: department.trim(),
    college_email: college_email.trim().toLowerCase(),
    phone: phone.trim(),
    password
  });

  const { error: otpError } = await supabase
    .from('otp')
    .upsert(
      { personal_email: personal_email.trim().toLowerCase(), otp, expires_at, verified: false, metadata },
      { onConflict: 'personal_email' }
    );

  if (otpError) throw new Error('Failed to generate OTP. Please try again.');

  // Send OTP email NON-BLOCKING — respond immediately, email arrives shortly after
  sendOTPEmail(personal_email, first_name.trim(), otp).catch((e) =>
    console.error('OTP email failed:', e.message)
  );

  return { message: 'OTP sent to your personal email. It is valid for 10 minutes.' };
};

/**
 * Step 2: Verify OTP, create user account.
 */
const verifyOTPAndCreateUser = async (personalEmail, otpInput) => {
  const email = personalEmail.trim().toLowerCase();

  const { data: record, error } = await supabase
    .from('otp')
    .select('*')
    .eq('personal_email', email)
    .eq('verified', false)
    .maybeSingle();

  if (error || !record) throw new Error('No pending OTP found. Please register again.');
  if (new Date(record.expires_at) < new Date()) throw new Error('OTP has expired. Please register again.');
  if (record.otp !== String(otpInput)) throw new Error('Incorrect OTP. Please try again.');

  // Parse stored registration data
  const { first_name, last_name, staff_id, department, college_email, phone, password } =
    JSON.parse(record.metadata);

  // Hash password with salt rounds = 12
  const password_hash = await bcrypt.hash(password, 12);

  // Insert user
  const { error: userError } = await supabase.from('users').insert({
    first_name, last_name, staff_id, department,
    college_email, personal_email: email, phone, password_hash
  });

  if (userError) {
    // Handle unique constraint violations gracefully
    if (userError.code === '23505') throw new Error('An account with this email or Staff ID already exists.');
    throw new Error('Failed to create account. Please try again.');
  }

  // Mark OTP as verified
  await supabase.from('otp').update({ verified: true }).eq('personal_email', email);

  return { message: 'Account created successfully. Please login.' };
};

/**
 * Authenticate user and return signed JWT.
 */
const loginUser = async (collegeEmail, password) => {
  const email = collegeEmail.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('college_email', email)
    .maybeSingle();

  if (error || !user) throw new Error('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user.id, college_email: user.college_email, first_name: user.first_name, last_name: user.last_name, role: user.role || 'staff' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      staff_id: user.staff_id,
      department: user.department,
      college_email: user.college_email,
      personal_email: user.personal_email,
      phone: user.phone,
      role: user.role || 'staff'
    }
  };
};

/**
 * Step 1 of password reset: verify email exists, generate OTP, send to college email.
 */
const forgotPassword = async (collegeEmail) => {
  const email = collegeEmail.trim().toLowerCase();

  // Check user exists
  const { data: user, error } = await supabase
    .from('users')
    .select('id, first_name, college_email')
    .eq('college_email', email)
    .maybeSingle();

  if (error || !user) throw new Error('No account found with this college email.');

  // Generate OTP and store it (upsert keyed on email + type)
  const otp = generateOTP();
  const expires_at = getOTPExpiry();

  const { error: upsertErr } = await supabase
    .from('password_reset_otp')
    .upsert(
      { college_email: email, otp, expires_at, used: false },
      { onConflict: 'college_email' }
    );

  if (upsertErr) throw new Error('Failed to initiate password reset. Please try again.');

  // Send OTP email non-blocking
  sendPasswordResetEmail(email, user.first_name, otp).catch((e) =>
    console.error('Password reset email failed:', e.message)
  );

  return { message: 'OTP sent to your college email. It is valid for 10 minutes.' };
};

/**
 * Step 2 of password reset: verify OTP, set new password.
 */
const resetPassword = async (collegeEmail, otp, newPassword) => {
  const email = collegeEmail.trim().toLowerCase();

  const { data: record, error } = await supabase
    .from('password_reset_otp')
    .select('*')
    .eq('college_email', email)
    .eq('used', false)
    .maybeSingle();

  if (error || !record) throw new Error('No pending password reset found. Please request a new OTP.');
  if (new Date(record.expires_at) < new Date()) throw new Error('OTP has expired. Please request a new one.');
  if (record.otp !== String(otp)) throw new Error('Incorrect OTP. Please try again.');

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 12);

  // Update user password
  const { error: updateErr } = await supabase
    .from('users')
    .update({ password_hash })
    .eq('college_email', email);

  if (updateErr) throw new Error('Failed to update password. Please try again.');

  // Mark OTP as used
  await supabase
    .from('password_reset_otp')
    .update({ used: true })
    .eq('college_email', email);

  return { message: 'Password reset successfully. You can now log in.' };
};

module.exports = { initiateRegistration, verifyOTPAndCreateUser, loginUser, forgotPassword, resetPassword };
