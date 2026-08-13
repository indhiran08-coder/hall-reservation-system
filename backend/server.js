require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/authRoutes');
const hallRoutes = require('./src/routes/hallRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const profileRoutes = require('./src/routes/profileRoutes');
const publicRoutes = require('./src/routes/publicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Allow production URL from env + ALL Vercel preview deployments
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Render health checks, curl, mobile)
    if (!origin) return callback(null, true);
    // Allow ALL Vercel deployments (production + every preview URL)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow localhost for development
    if (origin.startsWith('http://localhost')) return callback(null, true);
    // Allow any explicitly listed origins
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/public',  publicRoutes);
app.use('/api/admin',   adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Telegram Diagnostic ───────────────────────────────────────────────────────
// Usage: GET /test-telegram
app.get('/test-telegram', async (req, res) => {
  try {
    const { sendSupervisorNotification } = require('./src/services/telegramService');
    await sendSupervisorNotification(
      'confirmed',
      { first_name: 'Indhiran', last_name: 'Sivachandran', department: 'CSE', college_email: 'indhirans@velalarengg.ac.in' },
      { date: new Date().toISOString().split('T')[0], start_time: '10:00', end_time: '12:00', purpose: 'Live System Test Booking', participants: 45 },
      { name: 'Main Conference Hall', floor: '1st Floor', location: 'Main Building' }
    );
    res.json({ success: true, message: 'Telegram notification triggered!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
