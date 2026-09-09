import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import BookingCard from '../components/BookingCard';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, hallsAPI } from '../services/api';
import { formatDate, formatTimeRange, today } from '../utils/formatters';
import supabase from '../lib/supabase';

const LiveBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shrink-0">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    Live Synced
  </span>
);

const StatCard = ({ label, value, subtext, icon }) => (
  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
        {icon}
      </div>
    </div>
    <div className="mt-3">
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</p>
      {subtext && <p className="text-[11px] text-slate-400 font-medium mt-1">{subtext}</p>}
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [halls, setHalls]       = useState([]);
  const [loading, setLoading]   = useState(true);

  // Fetch ALL staff bookings for the shared dashboard
  const fetchData = useCallback(async () => {
    try {
      const [bRes, hRes] = await Promise.all([
        bookingsAPI.getAllStaff({ sort_by: 'date', sort_order: 'asc' }),
        hallsAPI.getAll()
      ]);
      setBookings(bRes.data.bookings || []);
      setHalls(hRes.data.halls || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + Supabase Realtime
  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('dashboard-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => { fetchData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const now = new Date();
  const todayStr = today();

  const confirmed    = bookings.filter((b) => b.status === 'confirmed');
  const upcoming     = confirmed.filter((b) => new Date(`${b.date}T${b.start_time}`) > now);
  const todayBooked  = confirmed.filter((b) => b.date === todayStr);
  const availableNow = halls.filter((h) => h.current_status !== 'booked');

  const nextBookings = upcoming.slice(0, 4);
  const todaySchedule = confirmed
    .filter((b) => b.date === todayStr)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5 px-1 sm:px-0 font-sans antialiased text-slate-800">
        
        {/* ── Top Header Bar ── */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shrink-0">
              <img
                src="/vcet-logo.png"
                alt="VCET Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide uppercase" style={{ color: '#2957a4' }}>
                  Staff Portal
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                Welcome back, {user?.first_name || 'Staff Member'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus reservation schedules, hall utilization, and live status.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:brightness-110 active:scale-[0.98]"
              style={{ background: '#2957a4' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Book a Hall</span>
            </Link>
            <Link
              to="/schedule"
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Live Roadmap</span>
            </Link>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all"
            >
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Pass History</span>
            </Link>
          </div>
        </div>

        {/* ── Metric Cards Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Bookings"
            value={confirmed.length}
            subtext="Confirmed campus events"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            }
          />
          <StatCard
            label="Upcoming Events"
            value={upcoming.length}
            subtext="Across next 30 days"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Today's Schedule"
            value={todayBooked.length}
            subtext={formatDate(todayStr)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Available Halls"
            value={`${availableNow.length}/${halls.length}`}
            subtext="Currently open for booking"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* ── Main Content Grid ── */}
        <div className="grid lg:grid-cols-12 gap-5">
          
          {/* Main Left Section: Upcoming Reservations */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">Upcoming Reservations</h2>
                  <LiveBadge />
                </div>
                <Link to="/schedule" className="text-xs font-bold text-[#2957a4] hover:underline">
                  View full schedule →
                </Link>
              </div>

              {nextBookings.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-slate-600">No upcoming reservations</p>
                  <p className="text-xs text-slate-400 mt-0.5">All campus facilities are available</p>
                  <Link
                    to="/book"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-xs"
                    style={{ background: '#2957a4' }}
                  >
                    <span>Reserve a Hall</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <BookingCard booking={b} compact />
                      {b.user && (
                        <div className="flex items-center justify-between flex-wrap gap-1.5 text-xs text-slate-500 font-medium mt-2 pt-2 border-t border-slate-200/60">
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>Booked by <strong className="text-slate-800">{b.user.first_name} {b.user.last_name || ''}</strong></span>
                          </span>
                          {b.user.department && (
                            <span className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              {b.user.department}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Section: Today's Agenda & Hall Availability */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Today's Schedule Agenda */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Today's Agenda</h3>
                <span className="text-[11px] font-semibold text-slate-400">{formatDate(todayStr)}</span>
              </div>

              {todaySchedule.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                  No events scheduled for today
                </div>
              ) : (
                <div className="space-y-2">
                  {todaySchedule.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5"
                    >
                      <div className="w-1.5 h-8 rounded-full bg-[#2957a4] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{b.hall?.name}</p>
                        <p className="text-xs font-semibold text-[#2957a4] mt-0.5">
                          {formatTimeRange(b.start_time, b.end_time)}
                        </p>
                        {b.user && (
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {b.user.first_name} {b.user.last_name || ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hall Status Matrix */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Hall Facilities</h3>
                <Link to="/halls" className="text-xs font-bold text-[#2957a4] hover:underline">
                  All halls →
                </Link>
              </div>

              <div className="space-y-1.5">
                {halls.map((hall) => {
                  const isBooked = hall.current_status === 'booked';
                  return (
                    <Link
                      key={hall.id}
                      to={`/halls/${hall.id}`}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200/60 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isBooked ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#2957a4] transition-colors truncate">
                            {hall.name}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {hall.floor}{hall.capacity ? ` • ${hall.capacity} pax` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isBooked
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {isBooked ? 'Occupied' : 'Open'}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
