import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import { hallsAPI } from '../services/api';
import { formatDate, formatTimeRange } from '../utils/formatters';
import { today } from '../utils/formatters';

const HallDetail = () => {
  const { id } = useParams();

  const [hall, setHall]           = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [checkDate, setCheckDate] = useState(today());
  const [checking, setChecking]   = useState(false);
  const [error, setError]         = useState('');

  // Load hall details
  useEffect(() => {
    hallsAPI.getAll()
      .then(({ data }) => {
        const found = data.halls.find((h) => h.id === id);
        setHall(found || null);
      })
      .catch(() => setError('Failed to load hall details'))
      .finally(() => setLoading(false));
  }, [id]);

  // Load availability for selected date
  useEffect(() => {
    if (!id || !checkDate) return;
    setChecking(true);
    hallsAPI.getAvailability({ hall_id: id, date: checkDate })
      .then(({ data }) => setBookings(data.bookings || []))
      .catch(() => setBookings([]))
      .finally(() => setChecking(false));
  }, [id, checkDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (!hall) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Hall not found.</p>
          <Link to="/halls" className="btn-primary btn mt-4 inline-flex">Back to Halls</Link>
        </div>
      </DashboardLayout>
    );
  }

  const isAvailable = hall.current_status !== 'booked';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/halls" className="hover:text-blue-600">Halls</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{hall.name}</span>
        </nav>

        {/* Hall header */}
        <div className="card">
          <div className={`h-2 rounded-t-xl ${isAvailable ? 'bg-green-400' : 'bg-orange-400'}`} />
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{hall.name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {hall.floor}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {hall.location}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant={isAvailable ? 'available' : 'booked'}>
                  {isAvailable ? '● Available Now' : '● In Use Now'}
                </Badge>
                <Link
                  to={`/book?hall_id=${hall.id}`}
                  className="btn-primary btn"
                >
                  Book This Hall
                </Link>
              </div>
            </div>

            <p className="mt-4 text-gray-600 text-sm leading-relaxed">{hall.description}</p>
          </div>
        </div>

        {/* Availability checker */}
        <div className="card">
          <div className="card-header flex items-center justify-between gap-4 flex-wrap">
            <h2 className="font-semibold text-gray-900">Check Availability</h2>
            <input
              type="date"
              value={checkDate}
              min={today()}
              onChange={(e) => setCheckDate(e.target.value)}
              className="input-field w-auto text-sm"
            />
          </div>
          <div className="card-body">
            {checking ? (
              <div className="flex items-center justify-center py-8"><Spinner /></div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-green-700">Fully available on {formatDate(checkDate)}</p>
                <p className="text-xs text-gray-500 mt-1">No bookings scheduled for this date</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{bookings.length}</span> booking{bookings.length > 1 ? 's' : ''} on {formatDate(checkDate)}:
                </p>
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{formatTimeRange(b.start_time, b.end_time)}</span>
                        <span className="text-gray-500 ml-2">— {b.purpose}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                  You can book slots not listed above. The system will automatically detect conflicts.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HallDetail;
