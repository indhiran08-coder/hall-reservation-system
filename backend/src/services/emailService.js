const { sendMail } = require('../utils/email');

// Verified sender — velalarengg.ac.in domain is verified on Resend
const FROM = 'VCET Hall Reservation <indhirans@velalarengg.ac.in>';
const YEAR = new Date().getFullYear();

// ─── Shared HTML Shell ────────────────────────────────────────────────────────
const wrapEmail = (headerColor, headerTitle, bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background:${headerColor};padding:24px 32px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:22px;font-weight:600;">${headerTitle}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">© ${YEAR} Hall Reservation System · All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Row helper for booking detail table ──────────────────────────────────────
const row = (label, value, shade) =>
  `<tr style="background:${shade ? '#f9fafb' : '#fff'};">
    <td style="padding:11px 14px;border:1px solid #e5e7eb;font-weight:600;color:#374151;width:38%;">${label}</td>
    <td style="padding:11px 14px;border:1px solid #e5e7eb;color:#374151;">${value}</td>
  </tr>`;

// ─── Format date for display ──────────────────────────────────────────────────
const fmtDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

// ─── 1. OTP Email ─────────────────────────────────────────────────────────────
const sendOTPEmail = async (personalEmail, firstName, otp) => {
  const body = `
    <p style="color:#374151;font-size:16px;">Hello <strong>${firstName}</strong>,</p>
    <p style="color:#6b7280;">Use the OTP below to complete your registration. It expires in <strong>10 minutes</strong>.</p>
    <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:10px;padding:24px;text-align:center;margin:24px 0;">
      <span style="font-size:40px;font-weight:700;color:#2563eb;letter-spacing:10px;">${otp}</span>
    </div>
    <p style="color:#9ca3af;font-size:13px;">Do not share this OTP with anyone. If you did not request this, please ignore this email.</p>`;

  await sendMail({
    from: FROM,
    to: personalEmail,
    subject: 'Your Registration OTP — Hall Reservation System',
    html: wrapEmail('#2563eb', 'Verify Your Email', body)
  });
};

// ─── 2. Booking Confirmation Email ────────────────────────────────────────────
const sendBookingConfirmationEmail = async (user, booking, hall) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const body = `
    <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
    <p style="color:#6b7280;">Your hall booking has been <strong style="color:#16a34a;">confirmed</strong>. Details below:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      ${row('Hall', hall.name, false)}
      ${row('Floor / Location', `${hall.floor} — ${hall.location}`, true)}
      ${row('Date', fmtDate(booking.date), false)}
      ${row('Time', `${booking.start_time} – ${booking.end_time}`, true)}
      ${row('Purpose', booking.purpose, false)}
      ${row('Participants', booking.participants, true)}
      ${row('Booking ID', `<code style="font-size:12px;">${booking.id}</code>`, false)}
    </table>
    <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:14px;margin-top:16px;">
      <p style="color:#166534;margin:0;font-size:14px;">✓ Your slot is reserved. Please arrive on time.</p>
    </div>
    <p style="color:#9ca3af;font-size:13px;margin-top:20px;">To cancel, visit the Hall Reservation System and go to My Bookings.</p>`;

  // Send to both college and personal email
  const recipients = [user.personal_email, user.college_email].filter(Boolean);
  await sendMail({
    from: FROM,
    to: recipients,
    subject: `✅ Booking Confirmed — ${hall.name} on ${fmtDate(booking.date)}`,
    html: wrapEmail('#2563eb', 'Booking Confirmed ✓', body)
  });
};

// ─── 3. Booking Cancellation Email ────────────────────────────────────────────
const sendBookingCancellationEmail = async (user, booking, hall) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const body = `
    <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
    <p style="color:#6b7280;">Your booking has been <strong style="color:#dc2626;">cancelled</strong>. Details of the cancelled booking:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      ${row('Hall', hall.name, false)}
      ${row('Date', fmtDate(booking.date), true)}
      ${row('Time', `${booking.start_time} – ${booking.end_time}`, false)}
      ${row('Purpose', booking.purpose, true)}
      ${row('Booking ID', `<code style="font-size:12px;">${booking.id}</code>`, false)}
    </table>
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:14px;margin-top:16px;">
      <p style="color:#991b1b;margin:0;font-size:14px;">This booking has been successfully cancelled and the slot is now available.</p>
    </div>`;

  const recipients = [user.personal_email, user.college_email].filter(Boolean);
  await sendMail({
    from: FROM,
    to: recipients,
    subject: `❌ Booking Cancelled — ${hall.name} on ${fmtDate(booking.date)}`,
    html: wrapEmail('#dc2626', 'Booking Cancelled', body)
  });
};

// ─── 4. Admin Booking Cancellation Email ──────────────────────────────────────
const sendAdminCancellationEmail = async (user, booking, hall) => {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
  const body = `
    <p style="color:#374151;font-size:16px;">Hello <strong>${name}</strong>,</p>
    <p style="color:#6b7280;">We regret to inform you that your hall booking has been <strong style="color:#dc2626;">cancelled by the Administrator</strong>. Details of the cancelled booking:</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:20px 0;">
      ${row('Hall', hall.name, false)}
      ${row('Date', fmtDate(booking.date), true)}
      ${row('Time', `${booking.start_time} – ${booking.end_time}`, false)}
      ${row('Purpose', booking.purpose, true)}
      ${row('Booking ID', `<code style="font-size:12px;">${booking.id}</code>`, false)}
    </table>
    <div style="background:#fee2e2;border:1px solid #fca5a5;border-radius:8px;padding:14px;margin-top:16px;">
      <p style="color:#991b1b;margin:0;font-size:14px;">⚠️ This booking was cancelled by the system administrator. The time slot is now available for rebooking.</p>
    </div>
    <p style="color:#6b7280;font-size:13px;margin-top:16px;">If you believe this was a mistake, please contact the administration office.</p>`;

  const recipients = [user.personal_email, user.college_email].filter(Boolean);
  await sendMail({
    from: FROM,
    to: recipients,
    subject: `⚠️ Booking Cancelled by Admin — ${hall.name} on ${fmtDate(booking.date)}`,
    html: wrapEmail('#dc2626', 'Booking Cancelled by Administrator', body)
  });
};

module.exports = {
  sendOTPEmail,
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendAdminCancellationEmail
};
