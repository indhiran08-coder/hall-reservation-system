const express = require('express');
const router = express.Router();

const { getHalls, getAvailability } = require('../controllers/hallController');
const { authenticate } = require('../middleware/auth');

// Protected routes — JWT required
router.get('/', authenticate, getHalls);
router.get('/availability', authenticate, getAvailability);

module.exports = router;
