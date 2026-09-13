import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronsUpDown, Check, Search, Building2 } from 'lucide-react';

/**
 * HallCombobox Component
 * Implements Watermelon UI / Combobox1 style with search input,
 * popover dropdown, and checkmark selection.
 */
export const HallCombobox = ({
  halls = [],
  value = '',
  onChange,
  label = 'Hall Venue',
  error = '',
  required = false,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  const selectedHall = useMemo(() => {
    return halls.find((h) => String(h.id) === String(value));
  }, [halls, value]);

  // Filter halls by search query
  const filteredHalls = useMemo(() => {
    if (!search.trim()) return halls;
    const q = search.toLowerCase().trim();
    return halls.filter(
      (h) =>
        (h.name && h.name.toLowerCase().includes(q)) ||
        (h.floor && h.floor.toLowerCase().includes(q)) ||
        (h.location && h.location.toLowerCase().includes(q))
    );
  }, [halls, search]);

  // Focus search input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [open]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSelect = (hallId) => {
    if (String(hallId) === String(value)) {
      onChange?.('');
    } else {
      onChange?.(hallId);
    }
    setOpen(false);
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
      )}

      {/* Popover Trigger */}
      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className={`flex h-11 w-full items-center justify-between rounded-2xl border bg-white px-3.5 text-sm font-normal shadow-xs outline-none transition-colors hover:bg-slate-50/70 focus-visible:ring-[3px] focus-visible:ring-blue-500/20 ${
            open
              ? 'border-blue-600 ring-[3px] ring-blue-500/20'
              : error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-[3px] focus:ring-rose-500/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
          aria-label="Hall venue combobox"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Building2 className={`size-4 shrink-0 ${selectedHall ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className={selectedHall ? 'text-slate-900 font-medium truncate' : 'text-slate-400 font-normal'}>
              {selectedHall ? (
                <>
                  <span className="font-semibold text-slate-900">{selectedHall.name}</span>
                  <span className="text-xs text-slate-500 ml-1.5">
                    — {selectedHall.floor}{selectedHall.capacity ? ` · ${selectedHall.capacity} pax` : ''}
                  </span>
                </>
              ) : (
                'Choose a hall venue…'
              )}
            </span>
          </div>
          <ChevronsUpDown className="size-4 opacity-50 shrink-0 text-slate-500" />
        </button>

        {/* Popover Content */}
        {open && (
          <div className="absolute left-0 top-full mt-2 z-50 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Command Search Bar */}
            <div className="flex items-center px-3 py-2 border-b border-slate-100">
              <Search className="size-3.5 shrink-0 text-slate-400 mr-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search hall name, floor, or building..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>

            {/* Command List */}
            <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
              {filteredHalls.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium">
                  No hall venue found.
                </div>
              ) : (
                filteredHalls.map((hall) => {
                  const isSelected = String(hall.id) === String(value);
                  return (
                    <button
                      key={hall.id}
                      type="button"
                      onClick={() => handleSelect(hall.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        isSelected
                          ? 'bg-slate-100/90 text-slate-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="flex size-4 shrink-0 items-center justify-center">
                          {isSelected && <Check className="size-3.5 text-slate-900" />}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">{hall.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {hall.floor} — {hall.location}
                            {hall.capacity ? ` • Capacity: ${hall.capacity}` : ''}
                          </p>
                        </div>
                      </div>

                      {hall.capacity && (
                        <span className="shrink-0 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md ml-2">
                          {hall.capacity} pax
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-rose-600 px-1">{error}</p>}
    </div>
  );
};

export default HallCombobox;
