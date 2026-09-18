const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Returns an ISO timestamp 10 minutes from now (OTP expiry)
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
};

module.exports = { generateOTP, getOTPExpiry };
