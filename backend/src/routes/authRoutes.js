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
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register',        authLimiter, validateRegister, register);
router.post('/verify-otp',      otpLimiter,  validateVerifyOTP, verifyOTP);
router.post('/login',           authLimiter, validateLogin, login);
router.post('/forgot-password', authLimiter, forgotPasswordHandler);
router.post('/reset-password',  authLimiter, resetPasswordHandler);

module.exports = router;
