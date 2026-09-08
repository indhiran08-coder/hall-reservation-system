const express = require('express');
const router = express.Router();
const supabase = require('../config/db');

/**
 * Public routes — no authentication required.
 * Used for the public hall schedule view.
 */

// GET /api/public/halls — list all active halls
router.get('/halls', async (req, res) => {
  try {
    const { data: halls, error } = await supabase
      .from('halls')
      .select('id, name, floor, location, description, capacity')
      .eq('status', 'active')
      .order('name');
    if (error) throw error;
    res.json({ halls: halls || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load halls' });
  }
});

// GET /api/public/schedule?date=YYYY-MM-DD — confirmed bookings for a given day
router.get('/schedule', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: 'date query param required (YYYY-MM-DD)' });

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, user_id, hall_id, purpose, date, start_time, end_time, participants, status, hall:halls(id, name, floor, location, capacity), user:users(first_name, last_name, department)')
      .eq('date', date)
      .eq('status', 'confirmed')
      .order('start_time');

    if (error) throw error;

    // Detect and enrich multi-day bookings
    const enrichedBookings = await Promise.all((bookings || []).map(async (b) => {
      const { data: siblings } = await supabase
        .from('bookings')
        .select('date')
        .eq('hall_id', b.hall_id)
        .eq('user_id', b.user_id)
        .eq('purpose', b.purpose)
        .eq('status', 'confirmed')
        .order('date');

      const allDates = [...new Set((siblings || []).map(s => s.date))].sort();

      if (allDates.length > 1) {
        const currentDayIndex = allDates.indexOf(b.date);
        return {
          ...b,
          is_multiday: true,
          total_days: allDates.length,
          current_day_index: currentDayIndex >= 0 ? currentDayIndex + 1 : 1,
          start_date: allDates[0],
          end_date: allDates[allDates.length - 1],
          all_dates: allDates
        };
      }

      return {
        ...b,
        is_multiday: false,
        total_days: 1
      };
    }));

    res.json({ bookings: enrichedBookings, date });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load schedule' });
  }
});

module.exports = router;
