const { Resend } = require('resend');

/**
 * Resend email client.
 * Uses HTTPS API — not SMTP — so it works from any cloud provider
 * including Render, Railway, Fly.io etc. without port blocking.
 *
 * Sign up at https://resend.com (free: 100 emails/day, 3000/month)
 * Get your API key from https://resend.com/api-keys
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email using Resend.
 * @param {object} options - { from, to, subject, html }
 */
const sendMail = async ({ from, to, subject, html }) => {
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error('Resend email error:', error);
    throw new Error(`Email send failed: ${error.message || JSON.stringify(error)}`);
  }
  console.log('Email sent:', data?.id);
  return data;
};

module.exports = { sendMail };
