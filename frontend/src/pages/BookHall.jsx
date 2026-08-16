import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import { hallsAPI, bookingsAPI } from '../services/api';
import { today, formatDate, formatTimeRange } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

// ── Time picker helpers ────────────────────────────────────────────────────────
const BOOK_START = 9;   // 9 AM
const BOOK_END   = 22;  // 10 PM

const HOUR_OPTIONS = Array.from({ length: BOOK_END - BOOK_START + 1 }, (_, i) => {
  const h = BOOK_START + i;
  const period = h >= 12 ? 'PM' : 'AM';
  const label  = `${h % 12 || 12} ${period}`;
  return { value: h, label };
});

const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: i * 5,
  label: String(i * 5).padStart(2, '0'),
}));

const parseHHMM = (hhmm) => {
  if (!hhmm) return { hour: BOOK_START, minute: 0 };
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h, minute: m };
};

const toHHMM = (hour, minute) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

const TimeSelect = ({ name, value, onChange, label, error, minAfter = null, isEndTime = false, selectedDate = null }) => {
  const { hour, minute } = parseHHMM(value);

  const now = new Date();
  const todayStr = today();
  const currentHour = now.getHours();

  const fireChange = (newHour, newMinute) => {
    const clampedHour   = Math.min(Math.max(newHour, BOOK_START), BOOK_END);
    const clampedMinute = clampedHour === BOOK_END ? 0 : newMinute;
    onChange({ target: { name, value: toHHMM(clampedHour, clampedMinute) } });
  };

  const startHour   = minAfter ? parseHHMM(minAfter).hour : BOOK_START;
  const startMinute = minAfter ? parseHHMM(minAfter).minute : 0;

  const filteredHours = HOUR_OPTIONS.filter(({ value: h }) => {
    if (selectedDate === todayStr && !isEndTime && h < currentHour) return false;
    if (!isEndTime) return h < BOOK_END;
    return h > startHour || (h === startHour && startMinute < 55);
  });

  const filteredMinutes = MINUTE_OPTIONS.filter(({ value: m }) => {
    if (!isEndTime || hour !== startHour) return true;
    return m > startMinute;
  });

  return (
    <div>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          {label} <span className="text-rose-500">*</span>
        </label>
      )}
      <div className={`flex gap-1.5 ${error ? 'ring-2 ring-rose-400 rounded-xl' : ''}`}>
        <select
          value={hour}
          onChange={(e) => fireChange(Number(e.target.value), minute)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
        >
          {filteredHours.map(({ value: h, label: l }) => (
            <option key={h} value={h}>{l}</option>
          ))}
        </select>
        <select
          value={minute}
          onChange={(e) => fireChange(hour, Number(e.target.value))}
          className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          disabled={isEndTime && filteredMinutes.length === 0}
        >
          {filteredMinutes.map(({ value: m, label: l }) => (
            <option key={m} value={m}>{l}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1 text-[11px] font-bold text-rose-600">{error}</p>}
    </div>
  );
};

const BookHall = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedHallId = searchParams.get('hall_id') || '';

  const [wizardStep, setWizardStep] = useState(1); // 1, 2, 3
  const [halls, setHalls]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  const [form, setForm] = useState({
    hall_id: preselectedHallId,
    purpose: '',
    date: today(),
    start_time: '09:00',
    end_time: '10:00',
    participants: '',
    requirements: ''
  });
  const [errors, setErrors] = useState({});

  const [avail, setAvail]                 = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);

  useEffect(() => {
    hallsAPI.getAll()
      .then(({ data }) => setHalls(data.halls || []))
      .finally(() => setLoading(false));
  }, []);

  // Check availability
  useEffect(() => {
    if (!form.hall_id || !form.date || !form.start_time || !form.end_time) {
      setAvail(null);
      return;
    }
    if (form.start_time >= form.end_time) { setAvail(null); return; }

    const timer = setTimeout(async () => {
      setCheckingAvail(true);
      try {
        const { data } = await hallsAPI.getAvailability({
          hall_id: form.hall_id,
          date: form.date,
          start_time: form.start_time,
          end_time: form.end_time
        });
        setAvail(data);
      } catch {
        setAvail(null);
      } finally {
        setCheckingAvail(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form.hall_id, form.date, form.start_time, form.end_time]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setError('');
  };

  const validateStep1 = () => {
    const errs = {};
    const todayStr = today();
    const now = new Date();
    const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!form.hall_id) errs.hall_id = 'Please select a hall';
    if (!form.date)    errs.date = 'Date is required';

    if (form.date && form.date < todayStr) {
      errs.date = 'Cannot book a hall for a past date';
    }

    if (!form.start_time) errs.start_time = 'Required';
    if (!form.end_time)   errs.end_time = 'Required';

    if (form.date === todayStr && form.start_time && form.start_time < currentHHMM) {
      errs.start_time = 'Start time cannot be in the past. Select a future time slot.';
    }

    if (form.start_time && form.end_time && form.start_time >= form.end_time) {
      errs.end_time = 'End time must be after start time';
    }

    if (avail?.available === false) errs.start_time = 'Selected slot is already booked';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.purpose || form.purpose.trim().length < 5) errs.purpose = 'At least 5 characters required';
    if (!form.participants || Number(form.participants) < 1) errs.participants = 'At least 1 participant required';
    return errs;
  };

  const handleNextStep = () => {
    if (wizardStep === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      const errs = validateStep2();
      if (Object.keys(errs).length) { setErrors(errs); return; }
      setWizardStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await bookingsAPI.create(form);
      setSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHallObj = halls.find((h) => String(h.id) === String(form.hall_id));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>
      </DashboardLayout>
    );
  }

  if (success) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto mt-16 text-center bg-white rounded-3xl p-10 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Booking Confirmed!</h2>
          <p className="text-xs text-slate-500 font-medium">
            Your hall reservation is authorized. A confirmation pass has been dispatched to your email.
          </p>
          <p className="text-[11px] font-bold text-blue-600 animate-pulse">Redirecting to your active passes…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-1">
              <Link to="/halls" className="hover:text-blue-600">Halls</Link>
              <span>/</span>
              <span className="text-slate-900">Guided Wizard</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Reserve a Campus Hall</h1>
          </div>
        </div>

        {/* ── 3-Step Visual Stepper Bar ── */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs grid grid-cols-3 gap-2">
          {[
            { step: 1, title: 'Slot & Hall', icon: '📍' },
            { step: 2, title: 'Event Info', icon: '📝' },
            { step: 3, title: 'Pass Review', icon: '📄' },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                if (s.step < wizardStep) setWizardStep(s.step);
              }}
              className={`p-3 rounded-2xl flex items-center justify-center gap-2.5 transition-all text-xs font-extrabold ${
                wizardStep === s.step
                  ? 'bg-blue-600 text-white shadow-md'
                  : wizardStep > s.step
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer'
                  : 'bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">Step {s.step}: {s.title}</span>
              <span className="sm:hidden">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Main Grid: Form Wizard (Left) & Digital Pass Card Preview (Right) */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* Form Content Panel */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {/* STEP 1: Select Hall & Time */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Step 1: Choose Hall & Time Window</h2>
                  <p className="text-xs text-slate-500">Select the venue and exact date/time duration.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hall Venue <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="hall_id"
                      value={form.hall_id}
                      onChange={handleChange}
                      className={`w-full bg-slate-50 border rounded-2xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all ${
                        errors.hall_id ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Choose a hall venue…</option>
                      {halls.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} — {h.floor}
                        </option>
                      ))}
                    </select>
                    {errors.hall_id && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.hall_id}</p>}
                  </div>

                  <Input
                    label="Reservation Date" name="date" type="date" required
                    value={form.date} onChange={handleChange}
                    error={errors.date} min={today()}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <TimeSelect
                      label="Start Time" name="start_time"
                      value={form.start_time} onChange={handleChange}
                      error={errors.start_time}
                      selectedDate={form.date}
                    />
                    <TimeSelect
                      label="End Time" name="end_time"
                      value={form.end_time} onChange={handleChange}
                      error={errors.end_time}
                      isEndTime
                      minAfter={form.start_time}
                      selectedDate={form.date}
                    />
                  </div>

                  {/* Realtime Availability Feedback Badge */}
                  {form.hall_id && form.date && form.start_time && form.end_time && form.start_time < form.end_time && (
                    <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                      checkingAvail ? 'bg-slate-50 border-slate-200 text-slate-500' :
                      avail?.available === true  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                      avail?.available === false ? 'bg-rose-50 border-rose-200 text-rose-800' :
                      'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {checkingAvail ? (
                        <><Spinner size="sm" /><span>Checking live availability schedule…</span></>
                      ) : avail?.available === true ? (
                        <><span>✨ Slot is 100% Available — No Overlaps!</span></>
                      ) : avail?.available === false ? (
                        <><span>⚠️ Conflict detected with existing booking ({avail.conflict?.start_time}–{avail.conflict?.end_time})</span></>
                      ) : null}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Proceed to Event Details</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Event Details */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Step 2: Enter Event Purpose & Attendees</h2>
                  <p className="text-xs text-slate-500">Describe the function and expected attendance.</p>
                </div>

                <div className="space-y-4">
                  <Input
                    label="Event Purpose / Title" name="purpose" required
                    value={form.purpose} onChange={handleChange}
                    error={errors.purpose}
                    placeholder="e.g., Department Association Inauguration & Guest Lecture"
                  />

                  <Input
                    label="Expected Attendance (Pax)" name="participants" type="number" required
                    value={form.participants} onChange={handleChange}
                    error={errors.participants}
                    min={1} placeholder="e.g., 120"
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Special Requirements <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      name="requirements"
                      value={form.requirements}
                      onChange={handleChange}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-all resize-none"
                      placeholder="e.g., 2 wireless podium mics, projector screen enabled, central AC setup"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                  >
                    ← Back to Step 1
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Preview Official Pass</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Pass Review & Confirm */}
            {wizardStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">Step 3: Authorize & Confirm Reservation</h2>
                  <p className="text-xs text-slate-500">Review your ticket details before final dispatch.</p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-500">Hall Venue:</span>
                    <span className="font-extrabold text-slate-900">{selectedHallObj?.name || 'Selected Hall'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-500">Date & Slot:</span>
                    <span className="font-bold text-blue-700">{formatDate(form.date)} • {formatTimeRange(form.start_time, form.end_time)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-500">Purpose:</span>
                    <span className="font-bold text-slate-800">{form.purpose || 'Not specified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-500">Faculty Host:</span>
                    <span className="font-bold text-slate-900">{user?.first_name} {user?.last_name || ''} ({user?.department || 'VCET'})</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="pt-2">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
                    >
                      ← Back to Edit
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-3 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Spinner size="sm" />
                          <span>Dispatching Authorization…</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm & Dispatch Hall Pass</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Right Live Digital Pass Card Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden space-y-4">
              
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200">Official Campus Pass Preview</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">VCET-PASS</span>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-semibold">Reserved Venue</p>
                <h3 className="text-xl font-extrabold text-white mt-0.5">
                  {selectedHallObj?.name || 'Select a Hall…'}
                </h3>
                <p className="text-[11px] text-blue-300 font-medium">{selectedHallObj?.floor || 'Ground Floor'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <p className="text-[10px] text-slate-300 font-bold uppercase">Date</p>
                  <p className="text-xs font-extrabold text-white mt-0.5">{formatDate(form.date)}</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl border border-white/15">
                  <p className="text-[10px] text-slate-300 font-bold uppercase">Time Window</p>
                  <p className="text-xs font-extrabold text-emerald-300 mt-0.5">{formatTimeRange(form.start_time, form.end_time)}</p>
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <p className="text-[10px] text-slate-300 font-bold uppercase">Event Title / Purpose</p>
                <p className="text-xs font-bold text-white truncate">
                  {form.purpose || 'e.g., Faculty Meeting'}
                </p>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300">
                <span>Faculty: <strong>{user?.first_name} {user?.last_name || ''}</strong></span>
                <span className="font-mono text-emerald-400 font-bold">READY</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
};

export default BookHall;
