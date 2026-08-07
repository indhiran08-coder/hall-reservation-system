const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
const { generateOTP, getOTPExpiry } = require('../utils/otp');
const { sendOTPEmail } = require('./emailService');

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
    { id: user.id, college_email: user.college_email, first_name: user.first_name, last_name: user.last_name },
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
      phone: user.phone
    }
  };
};

module.exports = { initiateRegistration, verifyOTPAndCreateUser, loginUser };
