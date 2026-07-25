import React from 'react';

/**
 * Status/label badge component.
 * @param {'confirmed'|'cancelled'|'available'|'booked'|'upcoming'|'past'|'ongoing'} variant
 */
const Badge = ({ children, variant = 'available', className = '' }) => {
  const variants = {
    confirmed: 'badge-confirmed',
    cancelled:  'badge-cancelled',
    available:  'badge-available',
    booked:     'badge-booked',
    upcoming:   'badge-upcoming',
    past:       'badge-past',
    ongoing:    'badge badge-booked'
  };

  return (
    <span className={`${variants[variant] || 'badge'} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
