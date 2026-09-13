import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  RotateCcw
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

/**
 * Format a Date object to 'YYYY-MM-DD'
 */
const toDateStr = (d) => {
  if (!d) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Parse 'YYYY-MM-DD' into local Date object
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
 * DateRangePicker Component
 * Replicates Watermelon UI / DatePicker6 style with rounded-2xl trigger,
 * popover calendar, and smooth pill range styling.
 */
export const DateRangePicker = ({
  startDate = '',
  endDate = '',
  onChange,
  minDate = '',
  label = 'Multi-Day Date Range',
  error = '',
  required = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initial reference month based on startDate or minDate or today
  const initialDate = useMemo(() => {
    return parseDateStr(startDate) || parseDateStr(minDate) || new Date();
  }, [startDate, minDate]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Selecting state: true when start is picked and awaiting end click
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [hoverDate, setHoverDate] = useState(null);

  // Sync with prop changes when popover is closed
  useEffect(() => {
    if (!isOpen) {
      setTempStart(startDate);
      setSelectingEnd(false);
      setHoverDate(null);
      if (startDate) {
        const d = parseDateStr(startDate);
        if (d) {
          setViewYear(d.getFullYear());
          setViewMonth(d.getMonth());
        }
      }
    }
  }, [startDate, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSelectingEnd(false);
        setHoverDate(null);
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

  // Calendar grid calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const days = [];
    // Leading empty padding
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `pad-${i}`, colIndex: i });
    }
    // Days in month with column position
    for (let day = 1; day <= daysInMonth; day++) {
      const colIndex = (firstDayIndex + day - 1) % 7;
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr, key: dateStr, colIndex });
    }
    return days;
  }, [viewYear, viewMonth]);

  // Current effective start & end
  const activeStart = selectingEnd ? tempStart : startDate;
  const activeEnd = selectingEnd
    ? hoverDate && hoverDate >= tempStart
      ? hoverDate
      : tempStart
    : endDate;

  // Total days calculation
  const totalConsecutiveDays = useMemo(() => {
    if (!activeStart || !activeEnd) return 0;
    const s = parseDateStr(activeStart);
    const e = parseDateStr(activeEnd);
    if (!s || !e || e < s) return 0;
    return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }, [activeStart, activeEnd]);

  // Handle day click
  const handleDayClick = (dateStr) => {
    if (!selectingEnd) {
      // Pick Start date
      setTempStart(dateStr);
      setSelectingEnd(true);
      setHoverDate(null);
      onChange?.({ startDate: dateStr, endDate: dateStr });
    } else {
      // Pick End date
      if (dateStr < tempStart) {
        // If clicked date is before start date, make it the new start date
        setTempStart(dateStr);
        setHoverDate(null);
        onChange?.({ startDate: dateStr, endDate: dateStr });
      } else {
        // Valid end date selected!
        setSelectingEnd(false);
        setHoverDate(null);
        onChange?.({ startDate: tempStart, endDate: dateStr });
        setIsOpen(false);
      }
    }
  };

  // Quick Presets
  const applyPreset = (daysCount) => {
    const base = parseDateStr(startDate) || parseDateStr(minDate) || new Date();
    const end = new Date(base);
    end.setDate(base.getDate() + (daysCount - 1));

    const sStr = toDateStr(base);
    const eStr = toDateStr(end);
    setTempStart(sStr);
    setSelectingEnd(false);
    setHoverDate(null);
    onChange?.({ startDate: sStr, endDate: eStr });
  };

  // Reset to today
  const handleReset = () => {
    const todayStr = minDate || toDateStr(new Date());
    setTempStart(todayStr);
    setSelectingEnd(false);
    setHoverDate(null);
    onChange?.({ startDate: todayStr, endDate: todayStr });
  };

  // Trigger text label
  const triggerLabel = useMemo(() => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return `${formatDate(startDate)} (1 Day)`;
      }
      return `${formatDate(startDate)} – ${formatDate(endDate)} (${totalConsecutiveDays} Days)`;
    }
    if (startDate) {
      return `${formatDate(startDate)} – Pick End Date`;
    }
    return 'Pick a date range';
  }, [startDate, endDate, totalConsecutiveDays]);

  const todayStr = toDateStr(new Date());

  return (
    <div className={`w-full space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          {startDate && endDate && (
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {totalConsecutiveDays} {totalConsecutiveDays === 1 ? 'Day' : 'Consecutive Days'}
            </span>
          )}
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
          <div className="flex items-center gap-2.5 truncate">
            <CalendarIcon className={`size-4 shrink-0 ${startDate ? 'text-blue-600' : 'text-slate-400'}`} />
            <span className={startDate ? 'text-slate-900 font-medium truncate' : 'text-slate-400 font-normal'}>
              {triggerLabel}
            </span>
          </div>
          <ChevronDown
            className={`size-4 text-slate-400/80 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </button>

        {/* Popover Content */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 z-50 w-full sm:w-[350px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-lg ring-1 ring-black/5">
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
              {calendarDays.map(({ day, dateStr, key, colIndex }) => {
                if (!day) {
                  return <div key={key} className="h-9 w-full" />;
                }

                const isDisabled = minDate && dateStr < minDate;
                const isStart = dateStr === activeStart;
                const isEnd = dateStr === activeEnd;
                const hasRange = activeStart && activeEnd && activeEnd > activeStart;
                const isMiddle = hasRange && dateStr > activeStart && dateStr < activeEnd;
                const isToday = dateStr === todayStr;

                const isRowStart = colIndex === 0;
                const isRowEnd = colIndex === 6;

                return (
                  <div
                    key={key}
                    onMouseEnter={() => {
                      if (selectingEnd && !isDisabled) {
                        setHoverDate(dateStr);
                      }
                    }}
                    className="relative flex items-center justify-center h-9 w-full"
                  >
                    {/* Continuous pill range background connector (Watermelon UI DatePicker6) */}
                    {isStart && hasRange && (
                      <div className="absolute inset-y-0.5 left-1/2 right-0 bg-slate-900/10" />
                    )}
                    {isEnd && hasRange && (
                      <div className="absolute inset-y-0.5 left-0 right-1/2 bg-slate-900/10" />
                    )}
                    {isMiddle && (
                      <div
                        className={`absolute inset-y-0.5 inset-x-0 bg-slate-900/10 ${
                          isRowStart ? 'rounded-l-full' : ''
                        } ${isRowEnd ? 'rounded-r-full' : ''}`}
                      />
                    )}

                    {/* Day Button */}
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(dateStr)}
                      className={`relative z-10 flex size-8.5 items-center justify-center text-xs transition-all ${
                        isDisabled
                          ? 'text-slate-300 cursor-not-allowed'
                          : isStart || isEnd
                          ? 'rounded-full bg-slate-900 text-white font-bold shadow-xs scale-105'
                          : isMiddle
                          ? 'rounded-none text-slate-900 font-medium'
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

            {/* Quick Presets & Status Footer */}
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Select
                </span>
                {selectingEnd && (
                  <span className="text-[11px] font-medium text-blue-600 animate-pulse">
                    Click end date to finish
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: '2 Days', days: 2 },
                  { label: '3 Days', days: 3 },
                  { label: '5 Days', days: 5 },
                  { label: '1 Week', days: 7 }
                ].map(({ label: pLabel, days }) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => applyPreset(days)}
                    className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                  >
                    {pLabel}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="size-3" />
                  Reset
                </button>
              </div>

              {/* Range Confirmation Strip */}
              {startDate && endDate && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="text-slate-700 truncate font-medium">
                    <span>{formatDate(startDate)}</span>
                    <span className="mx-1 text-slate-400">→</span>
                    <span>{formatDate(endDate)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="ml-2 flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs shadow-xs transition-colors shrink-0"
                  >
                    <Check className="size-3.5" />
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[11px] font-bold text-rose-600 px-1">{error}</p>}
    </div>
  );
};

export default DateRangePicker;
