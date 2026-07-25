const nodemailer = require('nodemailer');

/**
 * Nodemailer SMTP transport.
 * Configure SMTP_* variables in .env
 * For Gmail: use an App Password (not your account password).
 *
 * connectionTimeout / greetingTimeout / socketTimeout prevent the transporter
 * from hanging on slow cold-start environments like Render free tier.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Timeout settings — prevent hanging on Render cold starts
  connectionTimeout: 10000,   // 10s to establish TCP connection
  greetingTimeout:   10000,   // 10s to receive SMTP greeting
  socketTimeout:     15000    // 15s idle socket timeout
});

// Verify SMTP connection on startup (non-blocking)
transporter.verify((err) => {
  if (err) {
    console.error('⚠️  SMTP connection failed:', err.message);
  } else {
    console.log('✅ SMTP connection established');
  }
});

module.exports = transporter;
