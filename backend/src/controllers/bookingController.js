const { createBooking, getUserBookings, cancelBooking, deleteBooking } = require('../services/bookingService');

const create = async (req, res) => {
  try {
    const result = await createBooking(req.user.id, req.body);
    res.status(201).json({ message: 'Booking confirmed successfully', ...result });
  } catch (err) {
    // 409 Conflict for overlap errors, 400 for other validation errors
    const status = err.message.toLowerCase().includes('already booked') ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await getUserBookings(req.user.id, req.query);
    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancel = async (req, res) => {
  try {
    const result = await cancelBooking(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteBooking(req.params.id, req.user.id);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { create, getBookings, cancel, remove };
