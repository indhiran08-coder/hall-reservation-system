import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const fmtTime = (t) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

const STATUS = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  cancelled:  'bg-red-100 text-red-700 border-red-200',
};

const today    = () => new Date().toISOString().slice(0, 10);
const monthStart = () => new Date().toISOString().slice(0, 7) + '-01';

const AdminBookings = () => {
  const [bookings, setBookings]     = useState([]);
  const [halls, setHalls]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    date_from: monthStart(),
    date_to:   today(),
    hall_id:   '',
    status:    '',
    search:    '',
  });

  const fetchBookings = useCallback(() => {
    setLoading(true);
    setError('');
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    adminAPI.getBookings(params)
      .then(r => setBookings(r.data.bookings || []))
      .catch(() => setError('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => {
    adminAPI.getHalls().then(r => setHalls(r.data.halls || []));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? The staff will receive an email notification.')) return;
    setCancelling(id);
    setError(''); setSuccess('');
    try {
      await adminAPI.cancelBooking(id);
      setSuccess('Booking cancelled. Notification email sent to staff.');
      fetchBookings();
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(null);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setTextColor(37, 99, 235);
    doc.text('VCET Hall Reservation System', 14, 18);
    doc.setFontSize(13); doc.setTextColor(30, 30, 30);
    doc.text('Hall Booking Report', 14, 28);
    doc.setFontSize(10); doc.setTextColor(100, 100, 100);
    doc.text(`${fmtDate(filters.date_from)} – ${fmtDate(filters.date_to)}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 42);
    doc.text(`Total: ${bookings.length} bookings`, 14, 48);
    autoTable(doc, {
      startY: 56,
      head: [['#', 'Hall', 'Staff', 'Dept', 'Date', 'Time', 'Purpose', 'Pax', 'Status']],
      body: bookings.map((b, i) => [
        i + 1,
        b.hall?.name || '',
        `${b.user?.first_name || ''} ${b.user?.last_name || ''}`.trim(),
        b.user?.department || '',
        fmtDate(b.date),
        `${fmtTime(b.start_time)} – ${fmtTime(b.end_time)}`,
        b.purpose,
        b.participants,
        b.status,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 255] },
    });
    doc.save(`hall-bookings-${filters.date_from}-to-${filters.date_to}.pdf`);
  };

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="page-title">All Bookings</h1>
            <p className="page-subtitle hidden sm:block">Manage and export hall bookings across all staff</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(f => !f)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            <Button variant="primary" onClick={exportPDF} className="shrink-0">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export </span>PDF
            </Button>
          </div>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">✓ {success}</div>}

        {/* Filters — always visible on sm+, toggle on mobile */}
        <div className={`card p-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="label text-xs">From</label>
              <input type="date" name="date_from" value={filters.date_from} onChange={handleFilter} className="input-field text-sm" />
            </div>
            <div>
              <label className="label text-xs">To</label>
              <input type="date" name="date_to" value={filters.date_to} onChange={handleFilter} className="input-field text-sm" />
            </div>
            <div>
              <label className="label text-xs">Hall</label>
              <select name="hall_id" value={filters.hall_id} onChange={handleFilter} className="input-field text-sm">
                <option value="">All halls</option>
                {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-xs">Status</label>
              <select name="status" value={filters.status} onChange={handleFilter} className="input-field text-sm">
                <option value="">All</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="label text-xs">Search</label>
              <input type="text" name="search" value={filters.search} onChange={handleFilter}
                placeholder="Purpose, staff…" className="input-field text-sm" />
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500">{loading ? 'Loading…' : `${bookings.length} booking${bookings.length !== 1 ? 's' : ''} found`}</p>

        {/* Desktop table — hidden on mobile */}
        <div className="card overflow-hidden hidden md:block">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Hall', 'Staff', 'Date', 'Time', 'Purpose', 'Pax', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading bookings…</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No bookings found</td></tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{b.hall?.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-gray-900">{b.user?.first_name} {b.user?.last_name}</p>
                        <p className="text-xs text-gray-400">{b.user?.department}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{fmtDate(b.date)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600 text-xs">{fmtTime(b.start_time)} – {fmtTime(b.end_time)}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{b.purpose}</td>
                      <td className="px-4 py-3 text-gray-600 text-center">{b.participants}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.status === 'confirmed' && (
                          <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                            className="text-xs font-medium text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-md transition-colors disabled:opacity-50">
                            {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card list — visible only on mobile */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading bookings…</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No bookings found</div>
          ) : (
            bookings.map(b => (
              <div key={b.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.hall?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{b.user?.first_name} {b.user?.last_name} · {b.user?.department}</p>
                  </div>
                  <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS[b.status] || 'bg-gray-100 text-gray-600'}`}>
                    {b.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Date</p>
                    <p className="mt-0.5">{fmtDate(b.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Time</p>
                    <p className="mt-0.5">{fmtTime(b.start_time)} – {fmtTime(b.end_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Purpose</p>
                    <p className="mt-0.5 truncate">{b.purpose}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase font-medium">Participants</p>
                    <p className="mt-0.5">{b.participants}</p>
                  </div>
                </div>
                {b.status === 'confirmed' && (
                  <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                    className="w-full text-sm font-medium text-red-600 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition-colors disabled:opacity-50">
                    {cancelling === b.id ? 'Cancelling…' : '✕ Cancel Booking'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;
