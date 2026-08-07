const express = require('express');
const router = express.Router();

const { register, verifyOTP, login } = require('../controllers/authController');
const { validateRegister, validateVerifyOTP, validateLogin } = require('../middleware/validate');

// Public routes — no authentication required
router.post('/register', validateRegister, register);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/login', validateLogin, login);

module.exports = router;
