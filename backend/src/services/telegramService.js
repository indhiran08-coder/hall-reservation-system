const https = require('https');
try { require('dotenv').config(); } catch {}

// Telegram Bot Credentials with production fallback
const DEFAULT_TOKEN   = '8924729373:AAGH_4QTGdNjL1JQEHaHoeWdPjHUdhBt5Dw';
const DEFAULT_CHAT_ID = '-1003995817599';

const botToken = () => process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TOKEN;
const chatId   = () => process.env.TELEGRAM_CHAT_ID   || DEFAULT_CHAT_ID;


// List of supervisors (for reference and documentation)
const SUPERVISORS = [
  { name: 'K.R.Dhivin',           email: 'krdhivin@gmail.com',            phone: '9345607088' },
  { name: 'G.Aasaithambi',        email: 'aasaithambieee@gmail.com',      phone: '9791273667' },
  { name: 'N.Jeganathan',         email: 'jeganathan1990@gmail.com',   phone: '9790654426' },
  { name: 'K.Shanmugasundaram',   email: 'shanmugasundarammbavcet@gmail.com', phone: '9865960749' }
];

const fmtDate = (dateStr) => {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Sends a message via Telegram Bot API using HTTPS POST
 * @param {string} text - HTML formatted text
 */
const sendTelegramMessage = (text) => {
  return new Promise((resolve, reject) => {
    const token  = botToken();
    const target = chatId();

    if (!token || !target) {
      console.warn('[Telegram Service] Warning: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured in .env');
      return resolve({ skipped: true });
    }

    const payload = JSON.stringify({
      chat_id: target,
      text: text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${token}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.ok) {
            console.log('[Telegram Service] Notification sent successfully! Message ID:', parsed.result.message_id);
            resolve(parsed);
          } else {
            console.error('[Telegram Service Error] API responded with error:', parsed.description);
            resolve(parsed);
          }
        } catch (e) {
          console.error('[Telegram Service Error] Failed to parse response:', e.message);
          resolve({ error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      console.error('[Telegram Service Error] HTTPS Request failed:', err.message);
      resolve({ error: err.message });
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Sends Telegram notification when a hall booking is created or cancelled
 * @param {'confirmed' | 'cancelled'} type
 * @param {object} user - Staff user details
 * @param {object} booking - Booking details
 * @param {object} hall - Hall details
 */
const sendSupervisorNotification = async (type, user, booking, hall) => {
  const staffName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Staff Member';
  const isConfirmed = type === 'confirmed';

  const statusBadge = isConfirmed ? '✅ <b>BOOKING CONFIRMED</b>' : '❌ <b>BOOKING CANCELLED</b>';

  const message = [
    `🏛 <b>VCET HALL RESERVATION SYSTEM</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Status:</b> ${statusBadge}`,
    ``,
    `👤 <b>Staff Member:</b> ${staffName}`,
    `🏢 <b>Department:</b> ${user.department || 'N/A'}`,
    `📧 <b>College Email:</b> ${user.college_email || 'N/A'}`,
    `📍 <b>Hall Name:</b> ${hall.name}`,
    `🏫 <b>Location:</b> ${hall.floor} — ${hall.location}`,
    `📅 <b>Date:</b> ${fmtDate(booking.date)}`,
    `⏰ <b>Time Slot:</b> ${booking.start_time} – ${booking.end_time}`,
    `📝 <b>Purpose:</b> ${booking.purpose}`,
    `👥 <b>Participants:</b> ${booking.participants ?? 'N/A'}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `<i>Velalar College of Engineering and Technology (Autonomous)</i>`
  ].join('\n');

  await sendTelegramMessage(message);
};

module.exports = {
  SUPERVISORS,
  sendTelegramMessage,
  sendSupervisorNotification
};
