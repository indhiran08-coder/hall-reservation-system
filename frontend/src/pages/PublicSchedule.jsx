import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';

// Format "HH:MM:SS" → "h:mm A"
const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// Format date object → "YYYY-MM-DD" using LOCAL timezone
const toDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Shift date by N days
const shiftDate = (dateStr, days) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return toDateStr(date);
};

const timeToMins = (t) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Calculate event live status relative to now
const getEventStatus = (dateStr, startTimeStr, endTimeStr) => {
  const todayStr = toDateStr(new Date());
  if (dateStr < todayStr) return 'completed';
  if (dateStr > todayStr) return 'upcoming';

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const startMins = timeToMins(startTimeStr);
  const endMins = timeToMins(endTimeStr);

  if (currentMins >= startMins && currentMins <= endMins) return 'ongoing';
  if (currentMins < startMins) return 'upcoming';
  return 'completed';
};

const PublicSchedule = () => {
  const [date, setDate]           = useState(toDateStr(new Date()));
  const [halls, setHalls]         = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedHall, setSelectedHall] = useState('ALL');

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

  // Filter bookings by selected hall
  const filteredBookings = selectedHall === 'ALL'
    ? bookings
    : bookings.filter(b => String(b.hall_id) === String(selectedHall));

  // Sort bookings chronologically by start_time
  const sortedRoadmapBookings = [...filteredBookings].sort((a, b) => a.start_time.localeCompare(b.start_time));

  const bookingsByHall = {};
  halls.forEach(h => { bookingsByHall[h.id] = []; });
  bookings.forEach(b => {
    if (bookingsByHall[b.hall_id]) bookingsByHall[b.hall_id].push(b);
  });

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const isToday = date === toDateStr(new Date());
  const isPast = date < toDateStr(new Date());

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-[#2957a4] selection:text-white flex flex-col font-sans antialiased text-slate-800">
      
      {/* ── Official Institutional Top Bar ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <Link
            to="/login"
            className="flex items-center gap-3 cursor-pointer group"
            title="VCET Hall Reservation"
          >
            <img
              src="/vcet-banner.png"
              alt="Velalar College of Engineering and Technology"
              className="h-9 sm:h-12 w-auto object-contain transition-opacity group-hover:opacity-90"
            />
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Schedule Matrix
            </span>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#2957a4' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              <span>Portal Sign In</span>
            </Link>
          </div>
        </div>

        {/* Sub-header Brand Strip */}
        <div
          className="text-white text-center py-1 px-4 text-[11px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-xs"
          style={{ background: '#2957a4' }}
        >
          <span>VCET Hall Reservation System</span>
          <span className="opacity-50">•</span>
          <span className="opacity-90">Campus Schedule Roadmap</span>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 flex-1">
        
        {/* ── Date Navigator & Status Bar ── */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {displayDate}
              </h1>
              {isToday && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Today
                </span>
              )}
              {isPast && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  Archived Date
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {filteredBookings.length === 0
                ? 'No reservations scheduled for this day'
                : `${filteredBookings.length} scheduled event${filteredBookings.length > 1 ? 's' : ''} across halls`}
            </p>
          </div>

          {/* Date Selector Segmented Controls */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setDate(d => shiftDate(d, -1))}
              aria-label="Previous day"
              title="Previous Day"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Prev</span>
            </button>

            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#2957a4] cursor-pointer"
            />

            <button
              onClick={() => setDate(d => shiftDate(d, +1))}
              aria-label="Next day"
              title="Next Day"
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {!isToday && (
              <button
                onClick={() => setDate(toDateStr(new Date()))}
                className="ml-1 px-3 py-1 rounded-lg text-xs font-bold text-white transition-all shadow-2xs cursor-pointer"
                style={{ background: '#2957a4' }}
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* ── Hall Filter Segmented Tabs ── */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedHall('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedHall === 'ALL'
                ? 'text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
            style={selectedHall === 'ALL' ? { background: '#2957a4' } : {}}
          >
            All Halls ({bookings.length})
          </button>
          
          {halls.map((h) => {
            const isSelected = String(selectedHall) === String(h.id);
            const count = (bookingsByHall[h.id] || []).length;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHall(h.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isSelected
                    ? 'text-white border-transparent shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={isSelected ? { background: '#2957a4' } : {}}
              >
                <span>{h.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Schedule Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <div
              className="w-8 h-8 border-3 border-slate-200 border-t-[#2957a4] rounded-full animate-spin mb-3"
            />
            <p className="text-xs font-semibold text-slate-500">Retrieving schedule roadmap…</p>
          </div>
        ) : sortedRoadmapBookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3.5">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isPast ? 'No Events Recorded' : 'All Halls Available'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {isPast
                ? 'No reservation records were logged for this date.'
                : 'There are no conflicting events scheduled on this day. Halls are open for booking.'}
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs hover:brightness-110"
              style={{ background: '#2957a4' }}
            >
              <span>Book a Hall</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        ) : (
          /* ════════════════════════════════════════════════════════════════
             CLEAN AGENDA TIMELINE (MODERN BESPOKE LAYOUT)
          ════════════════════════════════════════════════════════════════ */
          <div className="space-y-4">
            
            {/* Schedule Session Header */}
            <div className="flex items-center justify-between px-1 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Timeline Schedule</span>
              <span>09:00 AM – 10:00 PM</span>
            </div>

            {/* Agenda Entries List */}
            <div className="space-y-3">
              {sortedRoadmapBookings.map((b, idx) => {
                const status = getEventStatus(date, b.start_time, b.end_time);
                const startMins = timeToMins(b.start_time);
                const endMins = timeToMins(b.end_time);
                const durMins = endMins - startMins;
                const durLabel = durMins >= 60
                  ? `${Math.floor(durMins / 60)} hr${durMins % 60 > 0 ? ` ${durMins % 60} min` : ''}`
                  : `${durMins} min`;

                const bookerName = b.user
                  ? [b.user.first_name, b.user.last_name].filter(Boolean).join(' ')
                  : null;

                return (
                  <div
                    key={b.id || idx}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Left Column: Time Anchor & Status Indicator */}
                    <div className="md:w-52 bg-slate-50/70 border-b md:border-b-0 md:border-r border-slate-100 p-4 sm:p-5 flex flex-row md:flex-col justify-between items-center md:items-start shrink-0">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {fmtTime(b.start_time)}
                        </div>
                        <div className="text-xs font-semibold text-slate-400 mt-0.5">
                          to {fmtTime(b.end_time)}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500 mt-2 hidden md:block">
                          Duration: <span className="font-bold text-slate-700">{durLabel}</span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div className="mt-0 md:mt-4">
                        {status === 'ongoing' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Ongoing Now
                          </span>
                        )}
                        {status === 'upcoming' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-[#2957a4] border border-blue-100">
                            Upcoming
                          </span>
                        )}
                        {status === 'completed' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Event Information */}
                    <div className="flex-1 p-5 sm:p-6 space-y-3.5">
                      
                      {/* Hall Details Row */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-extrabold text-sm tracking-tight"
                            style={{ color: '#2957a4' }}
                          >
                            {b.hall?.name || 'Hall Facility'}
                          </span>
                          {b.hall?.floor && (
                            <span className="text-xs text-slate-400">
                              • {b.hall.floor}{b.hall.location ? `, ${b.hall.location}` : ''}
                            </span>
                          )}
                        </div>

                        {b.is_multiday && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Multi-Day • Day {b.current_day_index} of {b.total_days}
                          </span>
                        )}
                      </div>

                      {/* Event Title */}
                      <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                        {b.purpose}
                      </h2>

                      {/* Multi-Day Strip (if applicable) */}
                      {b.is_multiday && (
                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
                          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600">
                            <span className="font-semibold text-slate-700">
                              Event Duration: {new Date(b.start_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} – {new Date(b.end_date + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-100">
                              {b.total_days} Consecutive Days
                            </span>
                          </div>

                          {/* Day progress indicator */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {b.all_dates?.map((d, dIdx) => {
                              const isThisDay = d === b.date;
                              const shortDate = new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                              return (
                                <span
                                  key={d}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold select-none ${
                                    isThisDay
                                      ? 'bg-[#2957a4] text-white shadow-2xs'
                                      : 'bg-white text-slate-600 border border-slate-200'
                                  }`}
                                >
                                  Day {dIdx + 1} ({shortDate})
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Event Metadata (Capacity, Pax, Booker) */}
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-3 border-t border-slate-100 text-xs text-slate-600">
                        {/* Attendance */}
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span>Expected: <strong className="text-slate-800">{b.participants ? `${b.participants} pax` : 'Open'}</strong></span>
                        </div>

                        {/* Hall Capacity */}
                        {b.hall?.capacity && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span>Hall Capacity: <strong className="text-slate-800">{b.hall.capacity} pax</strong></span>
                          </div>
                        )}

                        {/* Booker / Department */}
                        {(bookerName || b.user?.department) && (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>
                              Booked by: <strong className="text-slate-800">{bookerName || 'Staff Member'}</strong>
                              {b.user?.department && <span className="text-slate-500"> ({b.user.department})</span>}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ── Footer ── */}
        <div className="text-center text-xs text-slate-400 pt-3 pb-6 border-t border-slate-200">
          VCET Hall Reservation System • For queries, contact campus hall administration.{' '}
          <Link to="/login" className="font-bold hover:underline" style={{ color: '#2957a4' }}>
            Sign In
          </Link>
        </div>

      </main>
    </div>
  );
};

export default PublicSchedule;
