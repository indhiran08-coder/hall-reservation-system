import React from 'react';
import { Link } from 'react-router-dom';
import Badge from './ui/Badge';

const floorColors = {
  'Ground Floor': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Second Floor':  'bg-purple-50 text-purple-700 border-purple-200',
  'Fifth Floor':   'bg-amber-50 text-amber-700 border-amber-200'
};

/**
 * Hall card displaying name, floor, location, description, and live status.
 */
const HallCard = ({ hall, showBookButton = true }) => {
  const { id, name, floor, location, description, current_status } = hall;
  const isAvailable = current_status !== 'booked';
  const floorStyle = floorColors[floor] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Color bar */}
      <div className={`h-1.5 rounded-t-xl ${isAvailable ? 'bg-green-400' : 'bg-orange-400'}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">{name}</h3>
          <Badge variant={isAvailable ? 'available' : 'booked'}>
            {isAvailable ? 'Available' : 'In Use'}
          </Badge>
        </div>

        {/* Floor badge */}
        <span className={`inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${floorStyle}`}>
          {floor}
        </span>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed flex-1 line-clamp-3">
          {description}
        </p>

        {/* Actions */}
        {showBookButton && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            <Link
              to={`/halls/${id}`}
              className="btn-secondary btn text-xs px-3 py-1.5 flex-1 text-center"
            >
              View Details
            </Link>
            <Link
              to={`/book?hall_id=${id}`}
              className="btn-primary btn text-xs px-3 py-1.5 flex-1 text-center"
            >
              Book Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HallCard;
