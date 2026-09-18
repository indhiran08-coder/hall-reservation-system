const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication endpoints (Login, Registration, Password Resets).
 * Limits each IP to 10 requests per 15-minute window.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Strict limiter specifically for OTP verification to prevent brute-force attacks.
 * 6-digit OTP has 1,000,000 possibilities; limiting to 5 attempts prevents automated guessing.
 */
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many OTP verification attempts from this IP. Please wait 15 minutes before trying again.'
  }
});

/**
 * General limiter for all incoming API traffic to mitigate DoS / scraping.
 * Limits each IP to 300 requests per 15-minute window.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please slow down and try again later.'
  }
});

module.exports = { authLimiter, otpLimiter, apiLimiter };
