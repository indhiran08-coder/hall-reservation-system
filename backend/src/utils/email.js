const nodemailer = require('nodemailer');

/**
 * Nodemailer SMTP transport.
 * Configure SMTP_* variables in .env
 * For Gmail: use an App Password (not your account password).
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify SMTP connection on startup
transporter.verify((err) => {
  if (err) {
    console.error('⚠️  SMTP connection failed:', err.message);
  } else {
    console.log('✅ SMTP connection established');
  }
});

module.exports = transporter;
