const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_NUMBER || '+17372508034';
const smsFrom      = process.env.TWILIO_PHONE_NUMBER    || '+14155238886';


const client = twilio(accountSid, authToken);

// ─── 4 Supervisors to notify via WhatsApp & SMS ──────────────────────────────
const SUPERVISORS = [
  { name: 'K.R.Dhivin',           phone: '+919345607088' },
  { name: 'G.Aasaithambi',        phone: '+919791273667' },
  { name: 'N.Jeganathan',         phone: '+919790654426' },
  { name: 'K.Shanmugasundaram',   phone: '+919865960749' }
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
 * Send WhatsApp and SMS notifications to all supervisors when a booking is created or cancelled
 * @param {'confirmed' | 'cancelled'} type
 * @param {object} user - Staff user details
 * @param {object} booking - Booking details
 * @param {object} hall - Hall details
 */
const sendSupervisorNotification = async (type, user, booking, hall) => {
  const staffName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Staff Member';
  const isConfirmed = type === 'confirmed';

  // ── 1. WhatsApp Message Format ──────────────────────────────────────────────
  const whatsappMsg = [
    `🏛️ *VCET Hall Reservation Notification*`,
    ``,
    `*Status:* ${isConfirmed ? '✅ BOOKING CONFIRMED' : '❌ BOOKING CANCELLED'}`,
    `*Staff Member:* ${staffName}`,
    `*Department:* ${user.department || 'N/A'}`,
    `*College Email:* ${user.college_email || 'N/A'}`,
    `*Hall:* ${hall.name}`,
    `*Floor / Location:* ${hall.floor} — ${hall.location}`,
    `*Date:* ${fmtDate(booking.date)}`,
    `*Time:* ${booking.start_time} – ${booking.end_time}`,
    `*Purpose:* ${booking.purpose}`,
    `*Participants:* ${booking.participants ?? 'N/A'}`,
    ``,
    `_Velalar College of Engineering and Technology (Autonomous)_`
  ].join('\n');

  // ── 2. SMS Message Format (Concise for character limit) ──────────────────────
  const smsMsg = `VCET Hall Reservation: ${isConfirmed ? 'CONFIRMED' : 'CANCELLED'}! ${hall.name} on ${fmtDate(booking.date)} (${booking.start_time}-${booking.end_time}) by ${staffName} (${user.department || 'N/A'}). Purpose: ${booking.purpose}`;

  // ── 3. Send WhatsApp & SMS to each supervisor ──────────────────────────────
  const promises = [];

  for (const sup of SUPERVISORS) {
    const formattedPhone = sup.phone.startsWith('+') ? sup.phone : `+91${sup.phone}`;

    // Send WhatsApp
    const waPromise = client.messages.create({
      from: `whatsapp:${whatsappFrom.replace('whatsapp:', '')}`,
      to: `whatsapp:${formattedPhone}`,
      body: whatsappMsg
    }).then(msg => {
      console.log(`[Twilio WhatsApp] Sent to ${sup.name} (${formattedPhone}): SID ${msg.sid}`);
    }).catch(err => {
      console.error(`[Twilio WhatsApp Error] Failed to send to ${sup.name} (${formattedPhone}):`, err.message);
    });
    promises.push(waPromise);

    // Send SMS
    const smsPromise = client.messages.create({
      from: smsFrom,
      to: formattedPhone,
      body: smsMsg
    }).then(msg => {
      console.log(`[Twilio SMS] Sent to ${sup.name} (${formattedPhone}): SID ${msg.sid}`);
    }).catch(err => {
      console.error(`[Twilio SMS Error] Failed to send to ${sup.name} (${formattedPhone}):`, err.message);
    });
    promises.push(smsPromise);
  }

  await Promise.allSettled(promises);
};

module.exports = {
  SUPERVISORS,
  sendSupervisorNotification
};
