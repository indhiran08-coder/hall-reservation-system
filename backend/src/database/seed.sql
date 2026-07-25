-- =============================================================================
-- Hall Reservation System — Seed Data
-- Run this AFTER schema.sql to populate the halls table.
-- Safe to re-run (uses ON CONFLICT DO NOTHING).
-- =============================================================================

INSERT INTO halls (name, floor, location, description) VALUES
  (
    'Board Room',
    'Ground Floor',
    'Admin Block, Room G-01',
    'A formal meeting room equipped with a conference table, projector, and video conferencing system. Ideal for official meetings, faculty reviews, and administrative presentations.'
  ),
  (
    'Mini Board Room',
    'Ground Floor',
    'Admin Block, Room G-02',
    'A compact meeting room suitable for small group discussions and departmental meetings. Equipped with a whiteboard, display screen, and seating for up to 10 members.'
  ),
  (
    'SDC Hall',
    'Ground Floor',
    'Student Development Centre, Room G-10',
    'A spacious multipurpose hall in the Student Development Centre. Perfect for workshops, training sessions, seminars, and student-facing events.'
  ),
  (
    'Conference Hall',
    'Second Floor',
    'Main Block, Room S-01',
    'A large air-conditioned conference hall with modern AV equipment and podium. Suitable for faculty meetings, symposiums, guest lectures, and academic conferences.'
  ),
  (
    'Quantum Theatre',
    'Fifth Floor',
    'Innovation Block, Room F-01',
    'A state-of-the-art theatre-style hall with tiered seating, stage lighting, and high-quality sound system. Ideal for major lectures, cultural events, project showcases, and presentations.'
  )
ON CONFLICT DO NOTHING;
