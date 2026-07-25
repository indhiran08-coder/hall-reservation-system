import React, { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import HallCard from '../components/HallCard';
import Spinner from '../components/ui/Spinner';
import { hallsAPI } from '../services/api';

const FLOORS = ['All', 'Ground Floor', 'Second Floor', 'Fifth Floor'];

const Halls = () => {
  const [halls, setHalls]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [floor, setFloor]       = useState('All');
  const [error, setError]       = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await hallsAPI.getAll();
      setHalls(data.halls || []);
    } catch {
      setError('Failed to load halls. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = floor === 'All'
    ? halls
    : halls.filter((h) => h.floor === floor);

  const available = filtered.filter((h) => h.current_status !== 'booked').length;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="page-title">Halls</h1>
            <p className="page-subtitle">
              {loading ? '…' : `${available} of ${filtered.length} halls available right now`}
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="btn-secondary btn text-sm flex items-center gap-2"
            title="Refresh status"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Floor filter */}
        <div className="flex gap-2 flex-wrap">
          {FLOORS.map((f) => (
            <button
              key={f}
              onClick={() => setFloor(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                floor === f
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="alert-error">{error}</div>}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No halls found for this floor.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Halls;
