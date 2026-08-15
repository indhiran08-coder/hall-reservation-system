import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';

// Format "HH:MM:SS" → "H:MM AM/PM"
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

// Palette per hall index
const COLORS = [
  { bg: 'bg-blue-50',   text: 'text-blue-700',   bar: 'bg-blue-600',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-800' },
  { bg: 'bg-emerald-50',text: 'text-emerald-700', bar: 'bg-emerald-600',border: 'border-emerald-200',badge: 'bg-emerald-100 text-emerald-800' },
  { bg: 'bg-violet-50', text: 'text-violet-700',  bar: 'bg-violet-600', border: 'border-violet-200', badge: 'bg-violet-100 text-violet-800' },
  { bg: 'bg-amber-50',  text: 'text-amber-700',   bar: 'bg-amber-600',  border: 'border-amber-200',  badge: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-rose-50',   text: 'text-rose-700',    bar: 'bg-rose-600',   border: 'border-rose-200',   badge: 'bg-rose-100 text-rose-800' },
];

const TIMELINE_START = 9;
const TIMELINE_END   = 22;
const TOTAL_MINS     = (TIMELINE_END - TIMELINE_START) * 60;

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
  const [selectedHall, setSelectedHall] = useState('ALL'); // 'ALL' or hall_id
  const [viewMode, setViewMode]   = useState('roadmap'); // 'roadmap' or 'matrix'

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

  const hourLabels = [];
  for (let h = TIMELINE_START; h <= TIMELINE_END; h++) {
    hourLabels.push({ h, label: `${h % 12 || 12}${h < 12 ? 'AM' : 'PM'}` });
  }

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
      {/* ── Official VCET Banner Header ── */}
      <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <img
            src="/vcet-banner.png"
            alt="Velalar College of Engineering and Technology"
            className="w-full sm:w-auto h-auto object-contain"
            style={{ maxHeight: '56px' }}
          />
          <Link
            to="/login"
            className="self-center sm:self-auto shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
            </svg>
            Sign In
          </Link>
        </div>
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 text-white text-center py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase shadow-inner">
          Hall Reservation System — Live Schedule
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 flex-1">
        
        {/* Date Selector & Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{displayDate}</h2>
              {date === toDateStr(new Date()) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {filteredBookings.length === 0
                ? 'No bookings scheduled'
                : `${filteredBookings.length} booking${filteredBookings.length > 1 ? 's' : ''} in roadmap`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => setViewMode('roadmap')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'roadmap'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Vertical Roadmap
              </button>
              <button
                onClick={() => setViewMode('matrix')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'matrix'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Matrix Grid
              </button>
            </div>

            {/* Date Nav Controls */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-0">
              <button
                onClick={() => setDate(d => shiftDate(d, -1))}
                aria-label="Previous day"
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setDate(d => shiftDate(d, +1))}
                aria-label="Next day"
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setDate(toDateStr(new Date()))}
                className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Hall Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedHall('ALL')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              selectedHall === 'ALL'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Halls ({bookings.length})
          </button>
          {halls.map((h, i) => {
            const c = COLORS[i % COLORS.length];
            const isSelected = String(selectedHall) === String(h.id);
            const count = (bookingsByHall[h.id] || []).length;
            return (
              <button
                key={h.id}
                onClick={() => setSelectedHall(h.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isSelected
                    ? `${c.bar} text-white border-transparent shadow-sm`
                    : `${c.bg} ${c.text} ${c.border} hover:opacity-90`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : c.bar}`} />
                <span>{h.name}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-white/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">Loading schedule roadmap…</p>
          </div>
        ) : (
          <>
            {/* ════════════════════════════════════════════════════════════════
               VERTICAL ROADMAP VIEW (DEFAULT)
            ════════════════════════════════════════════════════════════════ */}
            {viewMode === 'roadmap' && (
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Daily Event Roadmap</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">9:00 AM – 10:00 PM</span>
                </div>

                {sortedRoadmapBookings.length === 0 ? (
                  /* Clean Roadmap Empty State */
                  <div className="relative py-12 px-4 max-w-lg mx-auto text-center">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">All Halls Available</h4>
                      <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                        No bookings are scheduled for this date. All campus halls are open for reservation.
                      </p>
                      <Link
                        to="/login"
                        className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        <span>Reserve a Hall Now</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ) : (
                  /* Vertical Roadmap Timeline Trunk */
                  <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-1 before:bg-gradient-to-b before:from-blue-600 before:via-indigo-500 before:to-purple-600 before:rounded-full">
                    
                    {/* Top Start Milestone */}
                    <div className="relative flex items-center gap-3">
                      <div className="absolute -left-6 sm:-left-10 w-7 h-7 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                        9A
                      </div>
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        09:00 AM — Day Schedule Begins
                      </span>
                    </div>

                    {/* Roadmap Event Cards */}
                    {sortedRoadmapBookings.map((b, idx) => {
                      const hallIndex = halls.findIndex(h => h.id === b.hall_id);
                      const c = COLORS[hallIndex >= 0 ? hallIndex % COLORS.length : 0];
                      const status = getEventStatus(date, b.start_time, b.end_time);

                      return (
                        <div key={b.id || idx} className="relative group">
                          
                          {/* Timeline Node Pin */}
                          <div
                            className={`absolute -left-6 sm:-left-10 top-5 w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-transform group-hover:scale-110 ${
                              status === 'ongoing'
                                ? 'bg-emerald-500 ring-4 ring-emerald-400/30 animate-pulse'
                                : status === 'upcoming'
                                ? 'bg-blue-600'
                                : 'bg-slate-400'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-white" />
                          </div>

                          {/* Roadmap Node Card */}
                          <div
                            className={`rounded-2xl border ${c.border} ${c.bg} p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                              
                              {/* Left Content */}
                              <div className="space-y-2 flex-1">
                                
                                {/* Hall Badge & Status Indicator */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.badge} border ${c.border}`}>
                                    🏛️ {b.hall?.name || 'Hall'}
                                  </span>

                                  {b.hall?.floor && (
                                    <span className="text-xs text-slate-500 font-medium">
                                      {b.hall.floor} — {b.hall.location}
                                    </span>
                                  )}

                                  {/* Live Status Pill */}
                                  {status === 'ongoing' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                      ONGOING NOW
                                    </span>
                                  )}
                                  {status === 'upcoming' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                                      UPCOMING
                                    </span>
                                  )}
                                  {status === 'completed' && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 text-slate-600">
                                      COMPLETED
                                    </span>
                                  )}
                                </div>

                                {/* Event Purpose */}
                                <h4 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                                  {b.purpose}
                                </h4>

                                {/* User & Department Info */}
                                {b.user && (
                                  <div className="flex items-center gap-2 text-xs text-slate-600 font-medium pt-1">
                                    <span className="font-bold text-slate-800">
                                      👤 {[b.user.first_name, b.user.last_name].filter(Boolean).join(' ') || 'Faculty'}
                                    </span>
                                    {b.user.department && (
                                      <>
                                        <span>•</span>
                                        <span>{b.user.department}</span>
                                      </>
                                    )}
                                  </div>
                                )}

                              </div>

                              {/* Right Time Column */}
                              <div className="shrink-0 bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-slate-200/80 text-left sm:text-right min-w-[150px]">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Time Slot</div>
                                <div className="text-sm font-extrabold text-blue-700 mt-0.5">
                                  {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                                </div>
                                <div className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center sm:justify-end gap-1">
                                  <span>👥 {b.participants ?? 'N/A'} Participants</span>
                                </div>
                              </div>

                            </div>
                          </div>

                        </div>
                      );
                    })}

                    {/* Bottom End Milestone */}
                    <div className="relative flex items-center gap-3 pt-2">
                      <div className="absolute -left-6 sm:-left-10 w-7 h-7 rounded-full bg-purple-600 border-4 border-white shadow-md flex items-center justify-center text-white text-[10px] font-bold">
                        10P
                      </div>
                      <span className="text-xs font-bold text-purple-900 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        10:00 PM — Day Schedule Ends
                      </span>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════════
               MATRIX GRID VIEW (ALTERNATIVE GANTT)
            ════════════════════════════════════════════════════════════════ */}
            {viewMode === 'matrix' && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
                <div className="hidden md:block overflow-x-auto">
                  <div className="flex min-w-max border-b border-slate-200 pb-2">
                    <div className="w-36 shrink-0 font-bold text-xs text-slate-500" />
                    {hourLabels.map(({ h, label }) => (
                      <div key={h} className="w-16 shrink-0 text-center text-xs font-bold text-slate-400">
                        {label}
                      </div>
                    ))}
                  </div>
                  {halls.map((hall, hi) => {
                    const c = COLORS[hi % COLORS.length];
                    const hallBookings = bookingsByHall[hall.id] || [];
                    return (
                      <div key={hall.id} className="border-b border-slate-100 py-3 last:border-0">
                        <div className="flex min-w-max items-center">
                          <div className="w-36 shrink-0 pr-3">
                            <p className="text-xs font-extrabold text-slate-900">{hall.name}</p>
                            <p className="text-[11px] text-slate-400">{hall.floor}</p>
                          </div>
                          <div className="relative flex-1 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                            {hourLabels.map(({ h }) => (
                              <div key={h} className="absolute top-0 bottom-0 border-l border-slate-200/50"
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
                                  className={`absolute top-2 bottom-2 rounded-lg ${c.bar} text-white px-2 py-1 flex items-center shadow-xs truncate text-xs font-bold`}
                                  style={{ left: `${leftPct}%`, width: `${widthPct}%` }}>
                                  <span className="truncate">{fmtTime(b.start_time)} {b.purpose}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 pt-2 pb-4">
          Live Schedule Roadmap • Updates automatically.{' '}
          <Link to="/login" className="text-blue-600 font-bold hover:underline">
            Sign in to reserve a hall
          </Link>
        </p>

      </main>
    </div>
  );
};

export default PublicSchedule;
