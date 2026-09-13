import React, { useState, useId } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

/**
 * FloatingInput Component
 * Implements the Watermelon UI / Origin UI "original" floating label input style.
 */
export const FloatingInput = ({
  label,
  type = 'text',
  name,
  value = '',
  onChange,
  error = '',
  required = false,
  isValid = false,
  className = '',
  disabled = false,
  autoComplete,
  ...props
}) => {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full space-y-1 ${className}`}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          placeholder=" "
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`peer block h-13 w-full rounded-2xl border bg-white px-4 pt-5 pb-2 text-sm text-slate-900 shadow-xs outline-none transition-all placeholder-transparent ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-[3px] focus:ring-rose-500/20'
              : isFocused
              ? 'border-blue-600 ring-[3px] ring-blue-500/20'
              : 'border-slate-200/80 hover:border-slate-300'
          } ${isPassword || isValid ? 'pr-11' : 'pr-4'}`}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-150 origin-left select-none ${
            isFloating
              ? 'top-1.5 scale-75 font-semibold text-xs ' + (isFocused ? 'text-blue-600' : 'text-slate-500')
              : 'top-3.5 scale-100 font-normal text-sm text-slate-400'
          }`}
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>

        {/* Password toggle icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
          </button>
        )}

        {/* Valid checkmark indicator (when not password) */}
        {!isPassword && isValid && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none flex items-center">
            <Check className="size-4.5 stroke-[2.5]" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] font-bold text-rose-600 px-1 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
