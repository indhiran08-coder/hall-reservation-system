import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const EMPTY_FORM = { name: '', floor: '', location: 'Main Block', description: '', capacity: 50, status: 'active' };

const STATUS_BADGE = {
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
};

// Simple modal
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const AdminHalls = () => {
  const [halls, setHalls]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [modal, setModal]       = useState(null); // 'add' | 'edit'
  const [editingHall, setEditingHall] = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});

  const load = () => {
    setLoading(true);
    adminAPI.getHalls()
      .then(r => setHalls(r.data.halls || []))
      .catch(() => setError('Failed to load halls'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditingHall(null);
    setModal('add');
  };

  const openEdit = (hall) => {
    setForm({ name: hall.name, floor: hall.floor, location: hall.location, description: hall.description || '', capacity: hall.capacity || 50, status: hall.status || 'active' });
    setFormErrors({});
    setEditingHall(hall);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setEditingHall(null); };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())     errs.name     = 'Hall name is required';
    if (!form.floor.trim())    errs.floor    = 'Floor is required';
    if (!form.location.trim()) errs.location = 'Location is required';
    if (form.capacity < 1)     errs.capacity = 'Capacity must be at least 1';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'capacity' ? Number(value) : value }));
    setFormErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }

    setSaving(true);
    setError(''); setSuccess('');
    try {
      if (modal === 'add') {
        await adminAPI.createHall(form);
        setSuccess('Hall created successfully!');
      } else {
        await adminAPI.updateHall(editingHall.id, form);
        setSuccess('Hall updated successfully!');
      }
      closeModal();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save hall');
    } finally {
      setSaving(false);
    }
  };

  const HallForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input label="Hall Name" name="name" value={form.name} onChange={handleChange} error={formErrors.name} placeholder="e.g. Seminar Hall" required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Floor" name="floor" value={form.floor} onChange={handleChange} error={formErrors.floor} placeholder="e.g. Second Floor" required />
        <Input label="Capacity" name="capacity" type="number" value={form.capacity} onChange={handleChange} error={formErrors.capacity} min={1} required />
      </div>
      <Input label="Location" name="location" value={form.location} onChange={handleChange} error={formErrors.location} placeholder="e.g. Main Block" required />
      <div>
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3}
          className="input-field resize-none" placeholder="Brief description of the hall…" />
      </div>
      <div>
        <label className="label">Status</label>
        <select name="status" value={form.status} onChange={handleChange} className="input-field">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={closeModal} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" loading={saving} className="flex-1">
          {modal === 'add' ? 'Create Hall' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="page-title">Manage Halls</h1>
            <p className="page-subtitle">Add, edit and manage all available halls</p>
          </div>
          <Button variant="primary" onClick={openAdd}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Hall
          </Button>
        </div>

        {error   && <div className="alert-error">{error}</div>}
        {success && <div className="alert-success">✓ {success}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {halls.map(hall => (
              <div key={hall.id} className="card p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{hall.name}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{hall.floor} · {hall.location}</p>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${STATUS_BADGE[hall.status] || STATUS_BADGE.inactive}`}>
                    {hall.status}
                  </span>
                </div>
                {hall.description && (
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{hall.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Capacity: {hall.capacity || '—'}
                </div>
                <button
                  onClick={() => openEdit(hall)}
                  className="mt-auto w-full text-sm font-medium text-blue-600 border border-blue-200 rounded-lg py-2 hover:bg-blue-50 transition-colors"
                >
                  Edit Details
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <Modal title={modal === 'add' ? 'Add New Hall' : `Edit: ${editingHall?.name}`} onClose={closeModal}>
          <HallForm />
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminHalls;
