import React, { forwardRef } from 'react';

/**
 * Reusable form input with label, error state, and helper text.
 */
const Input = forwardRef(({
  label,
  error,
  helper,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '_');

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''}`}
        aria-describedby={error ? `${inputId}-error` : undefined}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
