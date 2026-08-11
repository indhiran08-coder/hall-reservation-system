const {
  initiateRegistration,
  verifyOTPAndCreateUser,
  loginUser,
  forgotPassword,
  resetPassword
} = require('../services/authService');

const register = async (req, res) => {
  try {
    const result = await initiateRegistration(req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { personal_email, otp } = req.body;
    const result = await verifyOTPAndCreateUser(personal_email, otp);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { college_email, password } = req.body;
    const result = await loginUser(college_email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

const forgotPasswordHandler = async (req, res) => {
  try {
    const { college_email } = req.body;
    if (!college_email) return res.status(400).json({ error: 'College email is required.' });
    const result = await forgotPassword(college_email);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    const { college_email, otp, new_password } = req.body;
    if (!college_email || !otp || !new_password)
      return res.status(400).json({ error: 'college_email, otp, and new_password are required.' });
    if (new_password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    const result = await resetPassword(college_email, otp, new_password);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { register, verifyOTP, login, forgotPasswordHandler, resetPasswordHandler };
