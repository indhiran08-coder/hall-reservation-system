import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

/**
 * Format Date to 'YYYY-MM-DD'
 */
const toDateStr = (d) => {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse 'YYYY-MM-DD' to Date
 */
const parseDateStr = (str) => {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * SingleDatePicker Component
 * Replicates Watermelon UI / DatePicker3 style with rounded-2xl trigger,
 * popover calendar, and rounded-full slate-900 day buttons.
 */
export const SingleDatePicker = ({
  value = '',
  onChange,
  minDate = '',
  label = 'Reservation Date',
  error = '',
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parsedValue = useMemo(() => parseDateStr(value), [value]);

  const [viewYear, setViewYear] = useState(() => {
    return parsedValue ? parsedValue.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    return parsedValue ? parsedValue.getMonth() : new Date().getMonth();
  });

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = parseDateStr(value);
      if (d) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `pad-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr, key: dateStr });
    }
    return days;
  }, [viewYear, viewMonth]);

  const handleSelectDate = (dateStr) => {
    onChange?.(dateStr);
    setIsOpen(false);
  };

  const todayStr = toDateStr(new Date());

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
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-11 w-full items-center justify-between rounded-2xl border bg-white px-3.5 text-sm font-normal shadow-xs outline-none transition-colors hover:bg-slate-50/70 focus-visible:ring-[3px] focus-visible:ring-blue-500/20 ${
            isOpen
              ? 'border-blue-600 ring-[3px] ring-blue-500/20'
              : error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-[3px] focus:ring-rose-500/20'
              : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <span
            className={`flex items-center gap-2 truncate ${
              value ? 'text-slate-900 font-medium' : 'text-slate-400 font-normal'
            }`}
          >
            <CalendarIcon className={`size-4 shrink-0 ${value ? 'text-blue-600' : 'text-slate-400'}`} />
            {value ? formatDate(value) : 'Pick a date'}
          </span>
          <ChevronDown
            className={`size-4 text-slate-400/80 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {/* Popover Content */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 z-50 w-full sm:w-[320px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-lg ring-1 ring-black/5 animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Header: Month & Year Navigator */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={prevMonth}
                className="flex size-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                aria-label="Previous Month"
              >
                <ChevronLeft className="size-4" />
              </button>

              <div className="text-sm font-semibold text-slate-900 tracking-tight">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </div>

              <button
                type="button"
                onClick={nextMonth}
                className="flex size-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none"
                aria-label="Next Month"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 text-center mb-1">
              {WEEKDAYS.map((wd) => (
                <div key={wd} className="text-[11px] font-medium text-slate-400 py-1">
                  {wd}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-y-1">
              {calendarDays.map(({ day, dateStr, key }) => {
                if (!day) {
                  return <div key={key} className="h-8.5 w-full" />;
                }

                const isDisabled = minDate && dateStr < minDate;
                const isSelected = dateStr === value;
                const isToday = dateStr === todayStr;

                return (
                  <div key={key} className="flex items-center justify-center h-8.5 w-full">
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleSelectDate(dateStr)}
                      className={`flex size-8.5 items-center justify-center text-xs transition-all ${
                        isDisabled
                          ? 'text-slate-300 cursor-not-allowed'
                          : isSelected
                          ? 'rounded-full bg-slate-900 text-white font-bold shadow-xs scale-105'
                          : isToday
                          ? 'rounded-full bg-slate-100 font-bold text-slate-900 hover:bg-slate-200'
                          : 'rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-normal'
                      }`}
                    >
                      {day}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick shortcuts */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectDate(todayStr)}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tmrw = new Date();
                    tmrw.setDate(tmrw.getDate() + 1);
                    handleSelectDate(toDateStr(tmrw));
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  Tomorrow
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleSelectDate(todayStr)}
                className="text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-rose-600 px-1">{error}</p>}
    </div>
  );
};

export default SingleDatePicker;
