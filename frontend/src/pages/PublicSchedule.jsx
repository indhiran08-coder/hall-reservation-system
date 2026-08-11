import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';

// Format "HH:MM:SS" → "H:MM AM/PM"
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// Format date object → "YYYY-MM-DD" using LOCAL timezone (not UTC)
// Using toISOString() causes off-by-one errors in UTC+5:30 (IST)
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Go forward or backward N days from a YYYY-MM-DD string
const shiftDate = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d); // local midnight — no timezone issues
  date.setDate(date.getDate() + days);
  return toDateStr(date);
};

// Palette per hall index
const COLORS = [
  { bg: 'bg-blue-100',   text: 'text-blue-800',   bar: 'bg-blue-500',   border: 'border-blue-200'  },
  { bg: 'bg-emerald-100',text: 'text-emerald-800', bar: 'bg-emerald-500',border: 'border-emerald-200'},
  { bg: 'bg-violet-100', text: 'text-violet-800',  bar: 'bg-violet-500', border: 'border-violet-200' },
  { bg: 'bg-amber-100',  text: 'text-amber-800',   bar: 'bg-amber-500',  border: 'border-amber-200'  },
  { bg: 'bg-rose-100',   text: 'text-rose-800',    bar: 'bg-rose-500',   border: 'border-rose-200'   },
];

// Timeline hours: 9 AM – 10 PM
const TIMELINE_START = 9;
const TIMELINE_END   = 22;
const TOTAL_MINS     = (TIMELINE_END - TIMELINE_START) * 60;

const timeToMins = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

const PublicSchedule = () => {
  const [date, setDate]     = useState(toDateStr(new Date()));
  const [halls, setHalls]   = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([publicAPI.getHalls(), publicAPI.getSchedule(date)])
      .then(([hallsRes, schedRes]) => {
        setHalls(hallsRes.data.halls || []);
        setBookings(schedRes.data.bookings || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  const hallColorMap = {};
  halls.forEach((h, i) => { hallColorMap[h.id] = COLORS[i % COLORS.length]; });

  const bookingsByHall = {};
  halls.forEach(h => { bookingsByHall[h.id] = []; });
  bookings.forEach(b => {
    if (bookingsByHall[b.hall_id]) bookingsByHall[b.hall_id].push(b);
  });

  // Hour labels for timeline axis
  const hourLabels = [];
  for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
    hourLabels.push({ h, label: `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}` });
  }

  const totalBookings = bookings.length;
  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* VCET Hall Logo */}
            <div className="w-9 h-9 relative flex items-end justify-center rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 shadow-md shadow-blue-500/25 shrink-0">
              <svg className="w-5 h-5 text-white mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="20" width="20" height="2" rx="1" fill="white" opacity="0.9" />
                <rect x="4" y="10" width="2.5" height="10" rx="0.5" fill="white" />
                <rect x="8.75" y="10" width="2.5" height="10" rx="0.5" fill="white" />
                <rect x="13.5" y="10" width="2.5" height="10" rx="0.5" fill="white" />
                <rect x="18" y="10" width="2" height="10" rx="0.5" fill="white" />
                <path d="M1 10 L12 3 L23 10 Z" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div className="leading-tight">
              <h1 className="text-base font-bold text-gray-900 tracking-tight">VCET Hall</h1>
              <p className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Reservation</p>
            </div>
          </div>
          <Link to="/login"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
            </svg>
            Sign In
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Date picker + summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{displayDate}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {totalBookings === 0 ? 'No bookings today' : `${totalBookings} booking${totalBookings > 1 ? 's' : ''} scheduled`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDate(d => shiftDate(d, -1))}
              aria-label="Previous day"
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => setDate(d => shiftDate(d, +1))}
              aria-label="Next day"
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setDate(toDateStr(new Date()))}
              aria-label="Go to today"
              className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Hall legend */}
        <div className="flex flex-wrap gap-2">
          {halls.map((h, i) => {
            const c = COLORS[i % COLORS.length];
            return (
              <span key={h.id} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
                <span className={`w-2 h-2 rounded-full ${c.bar}`} />
                {h.name}
              </span>
            );
          })}
        </div>

        {/* Timeline — desktop md+ */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── Desktop Gantt (md+) ──────────────────────────────── */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Hour axis */}
              <div className="border-b border-gray-100 overflow-x-auto">
                <div className="flex min-w-max">
                  <div className="w-32 shrink-0 border-r border-gray-100" />
                  {hourLabels.map(({ h, label }) => (
                    <div key={h} className="w-16 shrink-0 text-center text-xs text-gray-400 py-2 border-r border-gray-50 last:border-0">
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              {halls.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">No halls available</div>
              ) : (
                halls.map((hall, hi) => {
                  const c = COLORS[hi % COLORS.length];
                  const hallBookings = bookingsByHall[hall.id] || [];
                  return (
                    <div key={hall.id} className="border-b border-gray-100 last:border-0">
                      <div className="flex min-w-max">
                        <div className="w-32 shrink-0 border-r border-gray-100 px-3 py-4 flex flex-col justify-center">
                          <p className="text-xs font-semibold text-gray-800 leading-tight">{hall.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{hall.floor}</p>
                        </div>
                        <div className="relative flex-1 h-16 bg-gray-50">
                          {hourLabels.map(({ h }) => (
                            <div key={h} className="absolute top-0 bottom-0 border-l border-gray-100"
                              style={{ left: `${((h - TIMELINE_START) / (TIMELINE_END - TIMELINE_START)) * 100}%` }} />
                          ))}
                          {hallBookings.map(b => {
                            const startMins = timeToMins(b.start_time) - TIMELINE_START * 60;
                            const endMins   = timeToMins(b.end_time)   - TIMELINE_START * 60;
                            const leftPct   = Math.max(0, (startMins / TOTAL_MINS) * 100);
                            const widthPct  = Math.min(100 - leftPct, ((endMins - startMins) / TOTAL_MINS) * 100);
                            return (
                              <div key={b.id}
                                title={`${b.purpose}\n${fmtTime(b.start_time)} – ${fmtTime(b.end_time)}`}
                                className={`absolute top-2 bottom-2 rounded-md ${c.bar} opacity-85 hover:opacity-100 transition-opacity cursor-pointer flex items-center px-2 overflow-hidden shadow-sm`}
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                                <span className="text-white text-xs font-medium truncate">
                                  {fmtTime(b.start_time)} {b.purpose}
                                </span>
                              </div>
                            );
                          })}
                          {hallBookings.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs text-gray-300">Available all day</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Mobile: Hall cards with booking list ─────────────── */}
            <div className="md:hidden space-y-3">
              {halls.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">No halls available</div>
              ) : (
                halls.map((hall, hi) => {
                  const c = COLORS[hi % COLORS.length];
                  const hallBookings = bookingsByHall[hall.id] || [];
                  return (
                    <div key={hall.id} className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.bar}`} />
                        <p className={`font-semibold text-sm ${c.text}`}>{hall.name}</p>
                        <span className="ml-auto text-xs text-gray-400">{hall.floor}</span>
                      </div>
                      {hallBookings.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-2">Available all day ✓</p>
                      ) : (
                        <div className="space-y-2">
                          {hallBookings.map(b => (
                            <div key={b.id} className="bg-white/70 rounded-xl px-3 py-2.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-medium text-gray-900 leading-tight">{b.purpose}</p>
                                <span className="shrink-0 text-xs text-gray-500 whitespace-nowrap">{b.participants} pax</span>
                              </div>
                              <p className={`text-xs font-medium ${c.text} mt-0.5`}>
                                {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* Booking cards below */}
        {!loading && bookings.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">All Bookings</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {bookings.map(b => {
                const c = hallColorMap[b.hall_id] || COLORS[0];
                return (
                  <div key={b.id} className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-xs font-semibold ${c.text}`}>{b.hall?.name}</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">{b.purpose}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium ${c.text} ${c.bg} border ${c.border} rounded-full px-2 py-0.5`}>
                        {b.participants} pax
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 pb-6">
          Schedule is public and updates in real time.{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link> to make a booking.
        </p>
      </div>
    </div>
  );
};

export default PublicSchedule;
