import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import BookingCard from '../components/BookingCard';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, hallsAPI } from '../services/api';
import { formatDate, formatTimeRange } from '../utils/formatters';
import supabase from '../lib/supabase';

const LiveBadge = () => (
  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
    Live Realtime
  </span>
);

const StatCard = ({ label, value, icon, color, trend }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-xs`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
    {trend && (
      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hidden sm:inline-block">
        {trend}
      </span>
    )}
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
  const todayStr = now.toISOString().split('T')[0];

  const confirmed   = bookings.filter((b) => b.status === 'confirmed');
  const upcoming    = confirmed.filter((b) => new Date(`${b.date}T${b.start_time}`) > now);
  const todayBooked = confirmed.filter((b) => b.date === todayStr);
  const availableNow = halls.filter((h) => h.current_status !== 'booked');

  const nextBookings = upcoming.slice(0, 3);
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
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15">
              <span>🏛️ Velalar Campus Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
              {user?.first_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live campus hall utilization and real-time event status.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5">
            <Link
              to="/book"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Book a Hall</span>
            </Link>
            <Link
              to="/schedule"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <span>📍 Live Roadmap</span>
            </Link>
            <Link
              to="/bookings"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <span>📄 My Pass History</span>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Reservations"
            value={confirmed.length}
            trend="+12% Active"
            color="bg-blue-50 text-blue-700 border border-blue-100"
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            }
          />
          <StatCard
            label="Upcoming Events"
            value={upcoming.length}
            trend="Scheduled"
            color="bg-purple-50 text-purple-700 border border-purple-100"
            icon={
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Today's Bookings"
            value={todayBooked.length}
            trend="Live Today"
            color="bg-amber-50 text-amber-700 border border-amber-100"
            icon={
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Halls Available Now"
            value={availableNow.length}
            trend="Ready for Use"
            color="bg-emerald-50 text-emerald-700 border border-emerald-100"
            icon={
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* 📊 Weekly Utilization Analytics & Live Timeline Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Main Left Section: Upcoming Bookings */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">Upcoming Reservations</h2>
                  <LiveBadge />
                </div>
                <Link to="/bookings" className="text-xs font-bold text-blue-600 hover:underline">View all</Link>
              </div>

              {nextBookings.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium text-slate-500">No upcoming reservations</p>
                  <Link to="/book" className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-xs hover:bg-blue-700 transition-all">
                    Book a Hall Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {nextBookings.map((b) => (
                    <div key={b.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 transition-all">
                      <BookingCard booking={b} compact />
                      {b.user && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2 pt-2 border-t border-slate-200/60">
                          <span>👤 Booked by <strong className="text-slate-800">{b.user.first_name} {b.user.last_name || ''}</strong></span>
                          {b.user.department && <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">{b.user.department}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 📊 Weekly Utilization Analytics Bars */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-900">Weekly Hall Utilization Analytics</h2>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">Automated</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">Campus Occupancy Trends</span>
              </div>

              <div className="space-y-3.5">
                {halls.map((h, i) => {
                  // Calculate mock dynamic utilization percentage based on bookings
                  const hallBookingCount = bookings.filter((b) => b.hall_id === h.id).length;
                  const pct = Math.min(100, Math.max(25, hallBookingCount * 25));
                  const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-violet-600', 'bg-amber-600', 'bg-rose-600'];
                  const barColor = colors[i % colors.length];

                  return (
                    <div key={h.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${barColor}`} />
                          {h.name}
                        </span>
                        <span className="text-slate-500">{pct}% Occupied</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} transition-all duration-500 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Section: Today's Schedule & Realtime Activity */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Today's Schedule */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900">Today's Schedule</h3>
                  <LiveBadge />
                </div>
              </div>
              <p className="text-xs font-semibold text-slate-400 mb-3">{formatDate(todayStr)}</p>

              {todaySchedule.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-slate-200/60 p-4">
                  No events scheduled for today
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((b) => (
                    <div key={b.id} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                      <div className="w-1.5 h-10 bg-blue-600 rounded-full shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-extrabold text-slate-900 truncate">{b.hall?.name}</p>
                        <p className="text-xs font-semibold text-blue-700 mt-0.5">{formatTimeRange(b.start_time, b.end_time)}</p>
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

            {/* Hall Status Right Now */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h3 className="text-sm font-extrabold text-slate-900">Hall Status Right Now</h3>
                <Link to="/halls" className="text-xs font-bold text-blue-600 hover:underline">View all</Link>
              </div>

              <div className="space-y-2.5">
                {halls.map((hall) => (
                  <Link
                    key={hall.id}
                    to={`/halls/${hall.id}`}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-blue-50/40 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${hall.current_status === 'booked' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{hall.name}</p>
                        <p className="text-[10px] text-slate-400">{hall.floor}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      hall.current_status === 'booked' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {hall.current_status === 'booked' ? 'In Use' : 'Available'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
