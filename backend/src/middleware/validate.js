const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

/**
 * Returns first error or null
 */
const firstError = (errors) => (errors.length ? errors[0] : null);

// ─── Registration ──────────────────────────────────────────────────────────────
const validateRegister = (req, res, next) => {
  const {
    first_name, department,
    college_email, personal_email, phone,
    password, confirm_password
  } = req.body;

  const errors = [];

  if (!first_name || first_name.trim().length < 2)
    errors.push('Full name must be at least 2 characters');
  if (!department || department.trim().length < 2)
    errors.push('Department is required');

  if (!college_email || !EMAIL_REGEX.test(college_email))
    errors.push('Valid college email is required');
  if (!personal_email || !EMAIL_REGEX.test(personal_email))
    errors.push('Valid personal email is required');
  if (college_email && personal_email && college_email.toLowerCase() === personal_email.toLowerCase())
    errors.push('College email and personal email must be different');

  if (!phone || !PHONE_REGEX.test(phone))
    errors.push('Valid 10-digit mobile number starting with 6–9 is required');

  if (!password || password.length < 8)
    errors.push('Password must be at least 8 characters');
  if (password !== confirm_password)
    errors.push('Passwords do not match');

  if (errors.length > 0) {
    return res.status(400).json({ error: firstError(errors), errors });
  }

  next();
};

// ─── OTP Verification ─────────────────────────────────────────────────────────
const validateVerifyOTP = (req, res, next) => {
  const { personal_email, otp } = req.body;

  const errors = [];
  if (!personal_email || !EMAIL_REGEX.test(personal_email))
    errors.push('Valid personal email is required');
  if (!otp || !/^\d{6}$/.test(String(otp)))
    errors.push('OTP must be a 6-digit number');

  if (errors.length > 0) {
    return res.status(400).json({ error: firstError(errors), errors });
  }

  next();
};

// ─── Login ────────────────────────────────────────────────────────────────────
const validateLogin = (req, res, next) => {
  const { college_email, password } = req.body;

  const errors = [];
  if (!college_email || !EMAIL_REGEX.test(college_email))
    errors.push('Valid college email is required');
  if (!password)
    errors.push('Password is required');

  if (errors.length > 0) {
    return res.status(400).json({ error: firstError(errors), errors });
  }

  next();
};

// ─── Booking ──────────────────────────────────────────────────────────────────
const validateBooking = (req, res, next) => {
  const { hall_id, purpose, date, start_time, end_time, participants } = req.body;

  const errors = [];

  if (!hall_id) errors.push('Hall is required');
  if (!purpose || purpose.trim().length < 5)
    errors.push('Purpose must be at least 5 characters');

  if (!date) {
    errors.push('Date is required');
  } else {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (isNaN(bookingDate.getTime())) errors.push('Invalid date format');
    else if (bookingDate < today) errors.push('Booking date cannot be in the past');
  }

  if (!start_time || !TIME_REGEX.test(start_time))
    errors.push('Valid start time is required (HH:MM)');
  if (!end_time || !TIME_REGEX.test(end_time))
    errors.push('Valid end time is required (HH:MM)');
  if (start_time && end_time && TIME_REGEX.test(start_time) && TIME_REGEX.test(end_time)) {
    if (start_time >= end_time) errors.push('End time must be after start time');
  }

  if (!participants || isNaN(Number(participants)) || Number(participants) < 1)
    errors.push('Number of participants must be at least 1');

  if (errors.length > 0) {
    return res.status(400).json({ error: firstError(errors), errors });
  }

  next();
};

// ─── Profile Update ───────────────────────────────────────────────────────────
const validateProfileUpdate = (req, res, next) => {
  const { personal_email, phone, new_password, password } = req.body;

  const errors = [];

  if (personal_email && !EMAIL_REGEX.test(personal_email))
    errors.push('Valid personal email is required');
  if (phone && !PHONE_REGEX.test(phone))
    errors.push('Valid 10-digit mobile number starting with 6–9 is required');
  if (new_password && new_password.length < 8)
    errors.push('New password must be at least 8 characters');
  if (new_password && !password)
    errors.push('Current password is required to change password');

  if (errors.length > 0) {
    return res.status(400).json({ error: firstError(errors), errors });
  }

  next();
};

module.exports = {
  validateRegister,
  validateVerifyOTP,
  validateLogin,
  validateBooking,
  validateProfileUpdate
};
