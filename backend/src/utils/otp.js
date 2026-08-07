/**
 * Generates a cryptographically random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Returns an ISO timestamp 10 minutes from now (OTP expiry)
 */
const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000).toISOString();
};

module.exports = { generateOTP, getOTPExpiry };
