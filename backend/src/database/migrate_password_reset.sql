-- password_reset_otp table
-- Stores OTPs for the forgot-password flow (keyed by college_email).
-- A new OTP request upserts on college_email, overwriting any previous pending OTP.

CREATE TABLE IF NOT EXISTS password_reset_otp (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  college_email TEXT        NOT NULL UNIQUE,
  otp           TEXT        NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  used          BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick look-up
CREATE INDEX IF NOT EXISTS idx_pwr_otp_email ON password_reset_otp (college_email);
