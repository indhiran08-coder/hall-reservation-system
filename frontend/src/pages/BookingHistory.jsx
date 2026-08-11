import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import BookingCard from '../components/BookingCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { bookingsAPI } from '../services/api';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const SORTS = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc',  label: 'Date (Oldest)' }
];

const BookingHistory = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [status, setStatus]       = useState('');
  const [sort, setSort]           = useState('date-desc');
  const [error, setError]         = useState('');

  // Cancel modal
  const [cancelId, setCancelId]       = useState(null);
  const [cancelling, setCancelling]   = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Delete modal
  const [deleteId, setDeleteId]       = useState(null);
  const [deleting, setDeleting]       = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [sort_by, sort_order] = sort.split('-');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await bookingsAPI.getAll({ status, sort_by, sort_order });
      setBookings(data.bookings || []);
    } catch {
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [status, sort_by, sort_order]);

  useEffect(() => { load(); }, [load]);

  // Client-side search filter
  const filtered = bookings.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.hall?.name.toLowerCase().includes(s) ||
      b.purpose.toLowerCase().includes(s)
    );
  });

  // ── Cancel handler ──────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    setCancelError('');
    try {
      await bookingsAPI.cancel(cancelId);
      setCancelId(null);
      load();
    } catch (err) {
      setCancelError(err.response?.data?.error || 'Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  // ── Delete handler ──────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await bookingsAPI.remove(deleteId);
      setDeleteId(null);
      load();
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Failed to delete booking.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="page-title">My Bookings</h1>
            <p className="page-subtitle">
              {loading ? '…' : `${filtered.length} booking${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          </div>
          <Link to="/book" className="btn-primary btn text-sm shrink-0">
            + New Booking
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="sm:col-span-1">
              <label className="label">Search</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hall or purpose…"
                  className="input-field pl-9"
                />
              </div>
            </div>
            {/* Status filter */}
            <div>
              <label className="label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* Sort */}
            <div>
              <label className="label">Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field">
                {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {/* Booking list */}
        {loading ? (
          <div className="flex items-center justify-center h-48"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">No bookings found</p>
            {!status && !search && (
              <Link to="/book" className="btn-primary btn mt-3 inline-flex text-sm">
                Book Your First Hall
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancel={(id) => { setCancelId(id); setCancelError(''); }}
                onDelete={(id) => { setDeleteId(id); setDeleteError(''); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Cancel confirmation modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to <strong>cancel</strong> this booking? The booking record will remain
            in your history with a "Cancelled" status.
          </p>
          {cancelError && <div className="alert-error">{cancelError}</div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setCancelId(null)} className="flex-1">
              Keep Booking
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel} className="flex-1">
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirmation modal ─────────────────────────────────────────── */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Booking" size="sm">
        <div className="space-y-4">
          {/* Warning icon */}
          <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-red-700">
              This action is <strong>permanent</strong>. The booking record will be completely removed
              and cannot be recovered.
            </p>
          </div>
          {deleteError && <div className="alert-error">{deleteError}</div>}
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setDeleteId(null)} className="flex-1">
              Keep It
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete} className="flex-1">
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default BookingHistory;
