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
      .select('id, hall_id, purpose, date, start_time, end_time, participants, status, hall:halls(id, name, floor, location)')
      .eq('date', date)
      .eq('status', 'confirmed')
      .order('start_time');

    if (error) throw error;
    res.json({ bookings: bookings || [], date });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load schedule' });
  }
});

module.exports = router;
