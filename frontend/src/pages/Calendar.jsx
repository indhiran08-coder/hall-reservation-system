import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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

  const calendarDays = useMemo(() => {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return cells;
  }, [year, month]);

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

  const selectedBookings = selected ? (bookingsByDate[selected] || []) : [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Interactive Calendar</h1>
            <p className="text-xs text-slate-500 font-medium">Monthly view of campus hall availability and reservations.</p>
          </div>
          <Link
            to="/schedule"
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>📍 Live Roadmap Schedule</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Main Month Grid */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            
            {/* Month Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={prevMonth}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                aria-label="Previous month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-extrabold text-slate-900">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={nextMonth}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all"
                aria-label="Next month"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Header Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider py-1">
              {DAYS.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>

            {/* Day Cells Grid */}
            {loading ? (
              <div className="flex items-center justify-center h-64"><Spinner /></div>
            ) : (
              <div className="grid grid-cols-7 gap-1.5">
                {calendarDays.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="h-16" />;
                  const ds = dateStr(day);
                  const isToday    = ds === todayStr;
                  const isSelected = ds === selected;
                  const dayBookings = bookingsByDate[ds] || [];
                  const confirmedCount = dayBookings.filter((b) => b.status === 'confirmed').length;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelected(ds === selected ? null : ds)}
                      className={`
                        h-16 p-1.5 rounded-2xl flex flex-col justify-between items-center transition-all relative border text-xs
                        ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300' :
                          isToday    ? 'bg-blue-50 text-blue-700 border-blue-300 font-extrabold' :
                                       'bg-slate-50/50 hover:bg-blue-50/50 border-slate-200/80 text-slate-800'}
                      `}
                    >
                      <span className="font-bold">{day}</span>
                      
                      {/* Vibrant Event Pill Dots */}
                      {confirmedCount > 0 && (
                        <div className="w-full flex items-center justify-center gap-0.5">
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {confirmedCount} {confirmedCount === 1 ? 'Event' : 'Events'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Confirmed Event</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Empty Slot</span>
            </div>

          </div>

          {/* Slide-Over Side Drawer for Selected Day */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selected ? formatDate(selected) : 'Select a Date'}
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  {selected ? `${selectedBookings.length} event(s) scheduled` : 'Click any date cell on the left'}
                </p>
              </div>
            </div>

            {!selected ? (
              <div className="text-center py-12 text-xs font-medium text-slate-400 space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  📅
                </div>
                <p>Click any date on the calendar grid to view reservations & quick actions</p>
              </div>
            ) : selectedBookings.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <p className="text-xs font-semibold text-slate-400">No hall reservations on this day</p>
                <Link
                  to={`/book?date=${selected}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all"
                >
                  Book this Date
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                {selectedBookings.map((b) => {
                  const tl = getBookingTimeLabel(b.date, b.start_time, b.end_time);
                  const variant = b.status === 'cancelled' ? 'cancelled'
                    : tl === 'past' ? 'past' : tl === 'ongoing' ? 'ongoing' : 'upcoming';

                  return (
                    <div key={b.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-extrabold text-slate-900">{b.hall?.name}</p>
                        <Badge variant={variant}>
                          {b.status === 'cancelled' ? 'Cancelled' :
                           tl === 'past' ? 'Past' : tl === 'ongoing' ? 'Ongoing' : 'Upcoming'}
                        </Badge>
                      </div>

                      <p className="text-xs font-bold text-blue-700">{formatTimeRange(b.start_time, b.end_time)}</p>
                      <p className="text-xs text-slate-600 font-medium">{b.purpose}</p>

                      {b.user && (
                        <p className="text-[11px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                          Faculty: {b.user.first_name} {b.user.last_name || ''} ({b.user.department || 'VCET'})
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Calendar;
