const supabase = require('../config/db');
const { sendAdminCancellationEmail, sendSupervisorNotification } = require('../services/emailService');

// ── GET /api/admin/bookings ──────────────────────────────────────────────────
// All bookings with optional filters: date_from, date_to, hall_id, status
const getAllBookings = async (req, res) => {
  try {
    const { date_from, date_to, hall_id, status, search } = req.query;

    let query = supabase
      .from('bookings')
      .select(`
        id, purpose, date, start_time, end_time, participants, requirements, status, created_at,
        hall:halls(id, name, floor, location),
        user:users(id, first_name, last_name, department, college_email, personal_email, staff_id)
      `)
      .order('date', { ascending: false })
      .order('start_time', { ascending: false });

    if (date_from) query = query.gte('date', date_from);
    if (date_to)   query = query.lte('date', date_to);
    if (hall_id)   query = query.eq('hall_id', hall_id);
    if (status)    query = query.eq('status', status);

    const { data: bookings, error } = await query;
    if (error) throw error;

    // In-memory search across purpose / staff name
    let results = bookings || [];
    if (search) {
      const s = search.toLowerCase();
      results = results.filter(b =>
        b.purpose?.toLowerCase().includes(s) ||
        b.hall?.name?.toLowerCase().includes(s) ||
        b.user?.first_name?.toLowerCase().includes(s) ||
        b.user?.last_name?.toLowerCase().includes(s) ||
        b.user?.department?.toLowerCase().includes(s)
      );
    }

    res.json({ bookings: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PATCH /api/admin/bookings/:id/cancel ────────────────────────────────────
const cancelBookingAsAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch booking with user + hall details
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select(`*, hall:halls(*), user:users(*)`)
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'Already cancelled' });

    // Cancel it
    const { error: updateErr } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // Send email to staff + supervisors (non-blocking)
    if (booking.user && booking.hall) {
      sendAdminCancellationEmail(booking.user, booking, booking.hall).catch(e =>
        console.error('Admin cancellation email failed:', e.message)
      );
      sendSupervisorNotification('cancelled', booking.user, booking, booking.hall).catch(e =>
        console.error('Supervisor notification (admin cancel) failed:', e.message)
      );
    }

    res.json({ message: 'Booking cancelled by admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/halls ─────────────────────────────────────────────────────
const getHalls = async (req, res) => {
  try {
    const { data: halls, error } = await supabase
      .from('halls')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json({ halls: halls || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── POST /api/admin/halls ────────────────────────────────────────────────────
const createHall = async (req, res) => {
  try {
    const { name, floor, location, description, capacity, status } = req.body;
    if (!name || !floor || !location) {
      return res.status(400).json({ error: 'name, floor, and location are required' });
    }

    const { data: hall, error } = await supabase
      .from('halls')
      .insert({ name, floor, location, description, capacity: capacity || 50, status: status || 'active' })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ hall, message: 'Hall created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── PUT /api/admin/halls/:id ─────────────────────────────────────────────────
const updateHall = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, floor, location, description, capacity, status } = req.body;

    const { data: hall, error } = await supabase
      .from('halls')
      .update({ name, floor, location, description, capacity, status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!hall) return res.status(404).json({ error: 'Hall not found' });
    res.json({ hall, message: 'Hall updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── GET /api/admin/analytics ─────────────────────────────────────────────────
const getAnalytics = async (req, res) => {
  try {
    // All bookings for analytics
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`id, date, start_time, end_time, status, participants, hall:halls(id, name)`)
      .order('date', { ascending: true });

    if (error) throw error;

    const all = bookings || [];
    const confirmed = all.filter(b => b.status === 'confirmed');
    const cancelled = all.filter(b => b.status === 'cancelled');

    // Bookings per hall
    const perHall = {};
    confirmed.forEach(b => {
      const name = b.hall?.name || 'Unknown';
      perHall[name] = (perHall[name] || 0) + 1;
    });

    // Bookings per month (last 6 months)
    const perMonth = {};
    all.forEach(b => {
      const month = b.date?.slice(0, 7); // YYYY-MM
      if (month) perMonth[month] = (perMonth[month] || 0) + 1;
    });

    // Daily bookings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = all.filter(b => new Date(b.date) >= thirtyDaysAgo);
    const perDay = {};
    recent.forEach(b => {
      perDay[b.date] = (perDay[b.date] || 0) + 1;
    });

    // Peak hours
    const perHour = {};
    confirmed.forEach(b => {
      const h = b.start_time?.slice(0, 2);
      if (h) perHour[h] = (perHour[h] || 0) + 1;
    });

    res.json({
      summary: {
        total: all.length,
        confirmed: confirmed.length,
        cancelled: cancelled.length,
        cancellation_rate: all.length ? ((cancelled.length / all.length) * 100).toFixed(1) : '0.0'
      },
      per_hall: perHall,
      per_month: perMonth,
      per_day: perDay,
      per_hour: perHour
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllBookings, cancelBookingAsAdmin, getHalls, createHall, updateHall, getAnalytics };
