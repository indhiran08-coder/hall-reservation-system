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
  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
    Live
  </span>
);

const StatCard = ({ label, value, icon, color }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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

  // Initial load + Supabase Realtime — re-fetch on any booking change
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

  // Next 3 upcoming bookings
  const nextBookings = upcoming.slice(0, 3);

  // Today's bookings
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
        {/* Welcome */}
        <div>
          <h1 className="page-title">
            Good {now.getHours() < 12 ? 'Morning' : now.getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            {user?.first_name}!
          </h1>
          <p className="page-subtitle">Here's the live reservation overview for your college.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Bookings"
            value={confirmed.length}
            color="bg-blue-50"
            icon={
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            }
          />
          <StatCard
            label="Upcoming"
            value={upcoming.length}
            color="bg-purple-50"
            icon={
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Today's Bookings"
            value={todayBooked.length}
            color="bg-orange-50"
            icon={
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            label="Halls Available"
            value={availableNow.length}
            color="bg-green-50"
            icon={
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming bookings */}
          <div className="lg:col-span-2 card">
            <div className="card-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-900">Upcoming Bookings</h2>
                <LiveBadge />
              </div>
              <Link to="/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
            </div>
            <div className="card-body">
              {nextBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">No upcoming bookings</p>
                  <Link to="/book" className="btn-primary btn text-sm mt-3 inline-flex">
                    Book a Hall
                  </Link>
                </div>
              ) : (
                <div>
                  {nextBookings.map((b) => (
                    <div key={b.id}>
                      <BookingCard booking={b} compact />
                      {b.user && (
                        <p className="text-xs text-gray-400 ml-1 -mt-1 mb-2">
                          Booked by{' '}
                          <span className="font-medium text-gray-500">
                            {b.user.first_name}{b.user.last_name ? ` ${b.user.last_name}` : ''}
                            {b.user.department ? ` — ${b.user.department}` : ''}
                          </span>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Today's schedule + quick book */}
          <div className="space-y-4">
            {/* Quick Book */}
            <div className="card bg-gradient-to-br from-blue-600 to-blue-700 border-0 text-white">
              <div className="p-5">
                <h3 className="font-semibold mb-1">Quick Book</h3>
                <p className="text-blue-100 text-sm mb-4">Reserve a hall in seconds</p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 bg-white text-blue-700 font-medium text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Book Now
                </Link>
              </div>
            </div>

            {/* Today's schedule */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Today's Schedule</h3>
                  <LiveBadge />
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{formatDate(todayStr)}</p>
              </div>
              <div className="card-body">
                {todaySchedule.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No bookings today</p>
                ) : (
                  todaySchedule.map((b) => (
                    <div key={b.id} className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className="w-1.5 h-10 bg-blue-400 rounded-full flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{b.hall?.name}</p>
                        <p className="text-xs text-gray-500">{formatTimeRange(b.start_time, b.end_time)}</p>
                        {b.user && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {b.user.first_name}{b.user.last_name ? ` ${b.user.last_name}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hall availability quick view */}
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">Hall Status — Right Now</h2>
              <LiveBadge />
            </div>
            <Link to="/halls" className="text-sm text-blue-600 hover:underline">View all halls</Link>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {halls.map((hall) => (
                <Link
                  key={hall.id}
                  to={`/halls/${hall.id}`}
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                >
                  <div className={`w-2 h-2 rounded-full mb-2 ${hall.current_status === 'booked' ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`} />
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                    {hall.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{hall.floor}</p>
                  <p className={`text-xs font-medium mt-1 ${hall.current_status === 'booked' ? 'text-orange-600' : 'text-green-600'}`}>
                    {hall.current_status === 'booked' ? 'In Use' : 'Available'}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
