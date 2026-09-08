const supabase = require('../config/db');

/**
 * Returns all halls, each decorated with a real-time current_status
 * based on whether any confirmed booking is active right now.
 */
const getAllHalls = async () => {
  const { data: halls, error } = await supabase
    .from('halls')
    .select('*')
    .order('name');

  if (error) throw new Error('Failed to fetch halls');

  // Get currently active bookings (today, ongoing right now)
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const { data: activeBookings } = await supabase
    .from('bookings')
    .select('hall_id')
    .eq('date', today)
    .eq('status', 'confirmed')
    .lte('start_time', currentTime)
    .gte('end_time', currentTime);

  const bookedNow = new Set((activeBookings || []).map((b) => b.hall_id));

  return halls.map((hall) => ({
    ...hall,
    current_status: bookedNow.has(hall.id) ? 'booked' : 'available'
  }));
};

/**
 * Returns all confirmed bookings for a hall on a given date or date range.
 * If start_time + end_time provided, also returns whether the slot is free.
 */
const checkAvailability = async (hallId, date, startTime, endTime, endDate) => {
  let dateList = [date];
  if (endDate && endDate > date) {
    dateList = [];
    const curr = new Date(date + 'T00:00:00');
    const stop = new Date(endDate + 'T00:00:00');
    while (curr <= stop) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      dateList.push(`${y}-${m}-${d}`);
      curr.setDate(curr.getDate() + 1);
    }
  }

  let query = supabase
    .from('bookings')
    .select('id, date, start_time, end_time, purpose')
    .eq('hall_id', hallId)
    .eq('status', 'confirmed');

  if (dateList.length === 1) {
    query = query.eq('date', dateList[0]);
  } else {
    query = query.in('date', dateList);
  }

  const { data: bookings, error } = await query.order('date').order('start_time');

  if (error) throw new Error('Failed to check availability');

  if (startTime && endTime) {
    const conflict = (bookings || []).find(
      (b) => startTime < b.end_time && endTime > b.start_time
    );
    return {
      available: !conflict,
      conflict: conflict || null,
      total_days: dateList.length,
      bookings: bookings || []
    };
  }

  return { bookings: bookings || [], total_days: dateList.length };
};

module.exports = { getAllHalls, checkAvailability };
