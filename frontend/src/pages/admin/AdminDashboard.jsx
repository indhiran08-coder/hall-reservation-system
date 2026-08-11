import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend
} from 'recharts';

const StatCard = ({ label, value, sub, color }) => (
  <div className={`card p-4 border-l-4 ${color}`}>
    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout>
      <div className="alert-error">{error}</div>
    </DashboardLayout>
  );

  const { summary, per_hall, per_month, per_day } = data;

  // Bar chart data — bookings per hall
  const hallData = Object.entries(per_hall || {}).map(([name, count]) => ({ name, Bookings: count }));

  // Line chart data — last 30 days
  const dayData = Object.entries(per_day || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      Bookings: count
    }));

  // Month chart data
  const monthData = Object.entries(per_month || {})
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month: month.slice(5), Bookings: count }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Overview of all hall bookings and usage analytics</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
          <Link to="/admin/bookings" className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Bookings
          </Link>
          <Link to="/admin/halls" className="flex items-center justify-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Halls
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total"     value={summary.total}      color="border-blue-500"   sub="All time" />
          <StatCard label="Confirmed" value={summary.confirmed}  color="border-emerald-500" sub="Active" />
          <StatCard label="Cancelled" value={summary.cancelled}  color="border-red-400"    sub="By staff/admin" />
          <StatCard label="Cancel %"  value={`${summary.cancellation_rate}%`} color="border-amber-400" sub="Of all bookings" />
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Bookings per Hall */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Bookings per Hall</h2>
            {hallData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={hallData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Monthly trend */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Monthly Trend (last 6 months)</h2>
            {monthData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={monthData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Bookings" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily trend (last 30 days) */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Daily Bookings — Last 30 Days</h2>
          {dayData.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No bookings in the last 30 days</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dayData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Bookings" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
