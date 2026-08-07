-- =============================================================================
-- Migration: Update hall locations to "Main Block", remove room numbers,
--            rename "Conference Hall" to "@Sangamam"
-- Run this once in the Supabase SQL Editor.
-- =============================================================================

-- 1. All halls → location = 'Main Block'
UPDATE halls SET location = 'Main Block';

-- 2. Rename Conference Hall → @Sangamam
UPDATE halls SET name = '@Sangamam' WHERE name = 'Conference Hall';

-- 3. Confirm final state
SELECT name, floor, location FROM halls ORDER BY name;
