const supabase = require('../config/db');
const {
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail
} = require('./emailService');
const { sendSupervisorNotification } = require('./telegramService');


/**
 * Creates a booking after checking for time conflicts.
 * Emails are sent asynchronously; a failure won't roll back the booking.
 */
const createBooking = async (userId, bookingData) => {
  const { hall_id, purpose, date, end_date, start_time, end_time, participants, requirements } = bookingData;

  // ── Calculate list of dates (single or multi-day range) ────────────────────
  let dates = [date];
  if (end_date && end_date > date) {
    dates = [];
    const curr = new Date(date + 'T00:00:00');
    const stop = new Date(end_date + 'T00:00:00');
    while (curr <= stop) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
    }
  }

  // ── Enforce valid future date and time ───────────────────────────────────────
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;
  const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  for (const d of dates) {
    if (d < todayStr) {
      throw new Error(`Cannot book a hall for a past date (${d})`);
    }
    if (d === todayStr && start_time < currentHHMM) {
      throw new Error('Cannot book a hall for a past time slot today');
    }
  }

  // ── Enforce booking hours: 9:00 AM – 10:00 PM (09:00 – 22:00) ─────────────
  if (start_time < '09:00' || start_time > '22:00') {
    throw new Error('Start time must be between 9:00 AM and 10:00 PM');
  }
  if (end_time < '09:00' || end_time > '22:00') {
    throw new Error('End time must be between 9:00 AM and 10:00 PM');
  }
  if (start_time >= end_time) {
    throw new Error('End time must be after start time');
  }

  // ── Conflict check: any confirmed booking overlapping this time across any selected date? ────
  let conflictQuery = supabase
    .from('bookings')
    .select('id, date, start_time, end_time')
    .eq('hall_id', hall_id)
    .eq('status', 'confirmed')
    .lt('start_time', end_time)
    .gt('end_time', start_time);

  if (dates.length === 1) {
    conflictQuery = conflictQuery.eq('date', dates[0]);
  } else {
    conflictQuery = conflictQuery.in('date', dates);
  }

  const { data: conflicts, error: conflictError } = await conflictQuery;

  if (conflictError) throw new Error('Failed to check booking conflicts');
  if (conflicts && conflicts.length > 0) {
    const c = conflicts[0];
    throw new Error(
      `Hall already booked on ${c.date} for selected time (${c.start_time}–${c.end_time})`
    );
  }

  // ── Create bookings (batch insert for multi-day) ───────────────────────────
  const insertRows = dates.map((d) => ({
    user_id: userId,
    hall_id,
    purpose: purpose.trim(),
    date: d,
    start_time,
    end_time,
    participants: parseInt(participants, 10),
    requirements: requirements ? requirements.trim() : null,
    status: 'confirmed'
  }));

  const { data: createdBookings, error: insertError } = await supabase
    .from('bookings')
    .insert(insertRows)
    .select();

  if (insertError || !createdBookings || createdBookings.length === 0) {
    throw new Error('Failed to create booking. Please try again.');
  }

  const primaryBooking = {
    ...createdBookings[0],
    start_date: dates[0],
    end_date: dates[dates.length - 1],
    total_days: dates.length
  };

  // ── Fetch related data for email ───────────────────────────────────────────
  const [{ data: hall }, { data: user }] = await Promise.all([
    supabase.from('halls').select('*').eq('id', hall_id).single(),
    supabase.from('users').select('*').eq('id', userId).single()
  ]);

  // ── Send confirmation email + supervisor notification (non-blocking) ──────
  sendBookingConfirmationEmail(user, primaryBooking, hall).catch((e) =>
    console.error('Confirmation email failed:', e.message)
  );
  sendSupervisorNotification('confirmed', user, primaryBooking, hall).catch((e) =>
    console.error('Supervisor notification (create) failed:', e.message)
  );

  return { booking: primaryBooking, bookings: createdBookings, total_days: dates.length, hall };
};

/**
 * Returns bookings for a user with optional search, status filter, and sorting.
 */
const getUserBookings = async (userId, query = {}) => {
  const { search, status, sort_by = 'date', sort_order = 'desc' } = query;

  let req = supabase
    .from('bookings')
    .select('*, hall:halls(id, name, floor, location)')
    .eq('user_id', userId)
    .order(sort_by, { ascending: sort_order === 'asc' });

  if (status) req = req.eq('status', status);

  const { data: bookings, error } = await req;
  if (error) throw new Error('Failed to fetch bookings');

  // In-memory search across purpose and hall name
  if (search) {
    const s = search.toLowerCase();
    return (bookings || []).filter(
      (b) =>
        b.purpose.toLowerCase().includes(s) ||
        b.hall?.name.toLowerCase().includes(s)
    );
  }

  return bookings || [];
};

/**
 * Cancels a future booking by ID for the authenticated user.
 */
const cancelBooking = async (bookingId, userId) => {
  // Fetch and validate ownership
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !booking) throw new Error('Booking not found');
  if (booking.status === 'cancelled') throw new Error('Booking is already cancelled');

  // Only future bookings can be cancelled
  const bookingDateTime = new Date(`${booking.date}T${booking.start_time}`);
  if (bookingDateTime <= new Date()) {
    throw new Error('Cannot cancel a booking that has already started or passed');
  }

  // Update status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);

  if (updateError) throw new Error('Failed to cancel booking. Please try again.');

  // Fetch related data and send cancellation email + supervisor notification (non-blocking)
  Promise.all([
    supabase.from('halls').select('*').eq('id', booking.hall_id).single(),
    supabase.from('users').select('*').eq('id', userId).single()
  ]).then(([{ data: hall }, { data: user }]) => {
    if (hall && user) {
      sendBookingCancellationEmail(user, booking, hall).catch((e) =>
        console.error('Cancellation email failed:', e.message)
      );
      sendSupervisorNotification('cancelled', user, booking, hall).catch((e) =>
        console.error('Supervisor notification (cancel) failed:', e.message)
      );
    }
  });

  return { message: 'Booking cancelled successfully' };
};

/**
 * Permanently deletes a booking from the database.
 * Users can delete any of their own bookings (past, cancelled, or future).
 */
const deleteBooking = async (bookingId, userId) => {
  // Verify ownership before deleting
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('id, user_id')
    .eq('id', bookingId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !booking) throw new Error('Booking not found');

  const { error: deleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (deleteError) throw new Error('Failed to delete booking. Please try again.');

  return { message: 'Booking deleted successfully' };
};

/**
 * Returns ALL bookings across all staff (for shared dashboard view).
 * Used by the real-time dashboard so every staff sees the full picture.
 */
const getAllBookings = async (query = {}) => {
  const { sort_by = 'date', sort_order = 'asc' } = query;

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, hall:halls(id, name, floor, location), user:users(id, first_name, last_name, department)')
    .order(sort_by, { ascending: sort_order === 'asc' })
    .order('start_time', { ascending: true });

  if (error) throw new Error('Failed to fetch bookings');
  return bookings || [];
};

module.exports = { createBooking, getUserBookings, getAllBookings, cancelBooking, deleteBooking };
