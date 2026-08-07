const express = require('express');
const router = express.Router();

const { getProfile, updateProfile } = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validate');

// Protected routes — JWT required
router.get('/', authenticate, getProfile);
router.put('/', authenticate, validateProfileUpdate, updateProfile);

module.exports = router;
