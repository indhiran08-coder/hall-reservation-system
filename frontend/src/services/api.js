import axios from 'axios';

/**
 * Axios instance targeting the Express backend.
 * - In dev:  Vite proxy forwards /api → http://localhost:5000  (VITE_API_BASE_URL not set)
 * - In prod: VITE_API_BASE_URL = https://your-app.onrender.com/api
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000   // 60s — handles Render free-tier cold start (~30s wake time)
});

// ── Request interceptor: attach JWT ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 globally ───────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login only if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:  (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  login:     (data) => api.post('/auth/login', data)
};

// ── Halls ────────────────────────────────────────────────────────────────────
export const hallsAPI = {
  getAll:          ()       => api.get('/halls'),
  getAvailability: (params) => api.get('/halls/availability', { params })
};

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookingsAPI = {
  create:      (data)   => api.post('/bookings', data),
  getAll:      (params) => api.get('/bookings', { params }),
  getAllStaff: (params) => api.get('/bookings/all', { params }),  // all staff — for dashboard
  cancel:      (id)     => api.patch(`/bookings/${id}/cancel`),
  remove:      (id)     => api.delete(`/bookings/${id}`)
};

// ── Profile ──────────────────────────────────────────────────────────────────
export const profileAPI = {
  get:    ()     => api.get('/profile'),
  update: (data) => api.put('/profile', data)
};

export default api;
