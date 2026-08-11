const express = require('express');
const router = express.Router();

const {
  register,
  verifyOTP,
  login,
  forgotPasswordHandler,
  resetPasswordHandler
} = require('../controllers/authController');

const { validateRegister, validateVerifyOTP, validateLogin } = require('../middleware/validate');

// Public routes — no authentication required
router.post('/register', validateRegister, register);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);

module.exports = router;
