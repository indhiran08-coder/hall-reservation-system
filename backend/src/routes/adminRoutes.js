const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllBookings, cancelBookingAsAdmin,
  getHalls, createHall, updateHall,
  getAnalytics
} = require('../controllers/adminController');

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

// ── Bookings ─────────────────────────────────────────────────────────────────
router.get('/bookings',                getAllBookings);
router.patch('/bookings/:id/cancel',   cancelBookingAsAdmin);

// ── Halls ─────────────────────────────────────────────────────────────────────
router.get('/halls',        getHalls);
router.post('/halls',       createHall);
router.put('/halls/:id',    updateHall);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get('/analytics',    getAnalytics);

module.exports = router;
