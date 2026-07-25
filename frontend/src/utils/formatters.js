/**
 * Format a date string (YYYY-MM-DD) to a readable format
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Format date for display with weekday
 */
export const formatDateFull = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format time from HH:MM (24h) to 12-hour format with AM/PM
 */
export const formatTime = (time) => {
  if (!time) return '—';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

/**
 * Format a time range
 */
export const formatTimeRange = (start, end) => {
  return `${formatTime(start)} – ${formatTime(end)}`;
};

/**
 * Return today's date as YYYY-MM-DD (for default input values)
 */
export const today = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Check if a booking date is in the past
 */
export const isPast = (dateStr, endTime) => {
  const dt = new Date(`${dateStr}T${endTime}`);
  return dt < new Date();
};

/**
 * Check if a booking date is upcoming (in the future)
 */
export const isFuture = (dateStr, startTime) => {
  const dt = new Date(`${dateStr}T${startTime}`);
  return dt > new Date();
};

/**
 * Get the booking "time" label: past, ongoing, or upcoming
 */
export const getBookingTimeLabel = (dateStr, startTime, endTime) => {
  const start = new Date(`${dateStr}T${startTime}`);
  const end   = new Date(`${dateStr}T${endTime}`);
  const now   = new Date();
  if (now > end) return 'past';
  if (now >= start) return 'ongoing';
  return 'upcoming';
};

/**
 * Truncate a string to a max length
 */
export const truncate = (str, max = 60) => {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
};
