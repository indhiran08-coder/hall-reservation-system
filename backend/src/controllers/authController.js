const { initiateRegistration, verifyOTPAndCreateUser, loginUser } = require('../services/authService');

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

module.exports = { register, verifyOTP, login };
