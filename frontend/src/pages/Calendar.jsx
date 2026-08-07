import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import { bookingsAPI } from '../services/api';
import { formatDate, formatTimeRange, getBookingTimeLabel } from '../utils/formatters';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const Calendar = () => {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null); // selected date (YYYY-MM-DD)

  useEffect(() => {
    bookingsAPI.getAll({ sort_by: 'date', sort_order: 'asc' })
      .then(({ data }) => setBookings(data.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return cells;
  }, [year, month]);

  // Group bookings by date string YYYY-MM-DD
  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  const pad = (n) => String(n).padStart(2, '0');
  const dateStr = (d) => `${year}-${pad(month + 1)}-${pad(d)}`;
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const prevMonth = () => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
    setSelected(null);
  };

  // Bookings for selected day
  const selectedBookings = selected ? (bookingsByDate[selected] || []) : [];

  const getDotColor = (date) => {
    const dayBookings = bookingsByDate[date];
    if (!dayBookings || dayBookings.length === 0) return null;
    const confirmed = dayBookings.filter((b) => b.status === 'confirmed');
    if (confirmed.length === 0) return 'bg-red-300';
    if (date < todayStr) return 'bg-gray-400';
    if (date === todayStr) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">View your bookings by month</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Calendar */}
          <div className="lg:col-span-2 card">
            {/* Month navigation */}
            <div className="card-header flex items-center justify-between">
              <button onClick={prevMonth} className="btn-ghost btn p-2" aria-label="Previous month">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-gray-900">
                {MONTHS[month]} {year}
              </h2>
              <button onClick={nextMonth} className="btn-ghost btn p-2" aria-label="Next month">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day cells */}
              {loading ? (
                <div className="flex items-center justify-center h-48"><Spinner /></div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} />;
                    const ds = dateStr(day);
                    const isToday   = ds === todayStr;
                    const isSelected = ds === selected;
                    const isPast     = ds < todayStr;
                    const dot        = getDotColor(ds);
                    const count      = bookingsByDate[ds]?.filter(b => b.status === 'confirmed').length || 0;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelected(ds === selected ? null : ds)}
                        className={`
                          relative flex flex-col items-center justify-center py-2 rounded-lg text-sm transition-all
                          ${isSelected ? 'bg-blue-600 text-white shadow-md' :
                            isToday    ? 'bg-blue-50 text-blue-700 border border-blue-300 font-semibold' :
                            isPast     ? 'text-gray-400 hover:bg-gray-50' :
                                         'text-gray-700 hover:bg-gray-100'}
                        `}
                      >
                        <span className={`font-medium ${isSelected ? 'text-white' : ''}`}>{day}</span>
                        {dot && (
                          <div className="flex gap-0.5 mt-0.5">
                            {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                              <div key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : dot}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Upcoming</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" />Today</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400" />Past</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-300" />Cancelled</span>
              </div>
            </div>
          </div>

          {/* Selected day bookings */}
          <div className="card">
            <div className="card-header">
              <h3 className="font-semibold text-gray-900">
                {selected ? formatDate(selected) : 'Select a date'}
              </h3>
              {selected && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <div className="card-body">
              {!selected ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Click a date on the calendar to see bookings
                </p>
              ) : selectedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">No bookings on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBookings.map((b) => {
                    const tl = getBookingTimeLabel(b.date, b.start_time, b.end_time);
                    const variant = b.status === 'cancelled' ? 'cancelled'
                      : tl === 'past' ? 'past' : tl === 'ongoing' ? 'ongoing' : 'upcoming';

                    return (
                      <div key={b.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900">{b.hall?.name}</p>
                          <Badge variant={variant} className="flex-shrink-0">
                            {b.status === 'cancelled' ? 'Cancelled' :
                             tl === 'past' ? 'Past' : tl === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{formatTimeRange(b.start_time, b.end_time)}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{b.purpose}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
