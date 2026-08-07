const express = require('express');
const router = express.Router();

const { create, getBookings, getAllStaffBookings, cancel, remove } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validate');

// Protected routes — JWT required
router.post('/',            authenticate, validateBooking, create);
router.get('/',             authenticate, getBookings);
router.get('/all',          authenticate, getAllStaffBookings);  // all staff bookings for dashboard
router.patch('/:id/cancel', authenticate, cancel);    // PATCH — cancel (soft, keeps record)
router.delete('/:id',       authenticate, remove);    // DELETE — permanently delete from DB

module.exports = router;
