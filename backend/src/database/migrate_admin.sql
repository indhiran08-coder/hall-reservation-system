-- =============================================================================
-- Migration: Add admin role, insert admin user, add hall capacity
-- Run this once in your Supabase SQL Editor
-- =============================================================================

-- 1. Add role column to users (staff | admin)
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'staff';

-- 2. Add capacity column to halls
ALTER TABLE halls ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 50;

-- 3. Insert admin user
-- Password: indhiransivachandran (bcrypt hash below)
INSERT INTO users (
  first_name, last_name, department,
  college_email, personal_email,
  phone, password_hash, role
)
VALUES (
  'Admin', 'VCET', 'Administration',
  'indhirans@velalarengg.ac.in',
  'indhirans@velalarengg.ac.in',
  '0000000000',
  '$2a$12$pTCu1Rhi5HcG8qC8pkZ3KuqXqrFcRG4yXak2NAaNg1ZlUDV6WFIVa',
  'admin'
)
ON CONFLICT (college_email)
DO UPDATE SET role = 'admin', password_hash = EXCLUDED.password_hash;

-- 4. Verify
SELECT id, first_name, college_email, role FROM users ORDER BY role;
