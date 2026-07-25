-- =============================================================================
-- Hall Reservation System — Database Schema
-- Run this in your Supabase SQL Editor before starting the application.
-- =============================================================================

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name      VARCHAR(100)  NOT NULL,
  last_name       VARCHAR(100)  NOT NULL,
  staff_id        VARCHAR(50)   UNIQUE NOT NULL,
  department      VARCHAR(100)  NOT NULL,
  college_email   VARCHAR(255)  UNIQUE NOT NULL,
  personal_email  VARCHAR(255)  NOT NULL,
  phone           VARCHAR(15)   NOT NULL,
  password_hash   TEXT          NOT NULL,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── OTP ──────────────────────────────────────────────────────────────────────
-- Stores registration OTPs + pending user data in metadata field.
-- Upserted by personal_email so re-registration replaces the old OTP.
CREATE TABLE IF NOT EXISTS otp (
  id             UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  personal_email VARCHAR(255)  UNIQUE NOT NULL,
  otp            VARCHAR(6)    NOT NULL,
  expires_at     TIMESTAMPTZ   NOT NULL,
  verified       BOOLEAN       DEFAULT FALSE,
  metadata       TEXT,         -- JSON: stores registration data until verified
  created_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── Halls ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS halls (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL,
  floor       VARCHAR(50)   NOT NULL,
  location    VARCHAR(255)  NOT NULL,
  description TEXT,
  status      VARCHAR(20)   DEFAULT 'active'  -- active | inactive
);

-- ─── Bookings ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  hall_id       UUID          NOT NULL REFERENCES halls(id)  ON DELETE RESTRICT,
  purpose       TEXT          NOT NULL,
  date          DATE          NOT NULL,
  start_time    TIME          NOT NULL,
  end_time      TIME          NOT NULL,
  participants  INTEGER       NOT NULL CHECK (participants > 0),
  requirements  TEXT,
  status        VARCHAR(20)   DEFAULT 'confirmed',  -- confirmed | cancelled
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- ─── Indexes for query performance ────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_bookings_hall_date    ON bookings(hall_id, date);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id      ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status       ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date         ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_otp_personal_email    ON otp(personal_email);
CREATE INDEX IF NOT EXISTS idx_users_college_email   ON users(college_email);
CREATE INDEX IF NOT EXISTS idx_users_staff_id        ON users(staff_id);
