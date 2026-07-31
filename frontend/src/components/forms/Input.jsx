/**
 * Input Component
 * Enterprise form input field with label, helper, error states.
 */
import React from 'react';

const Input = React.forwardRef(({
  label,
  helper,
  error,
  required = false,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`form-control ${error ? 'error' : ''} ${className}`.trim()}
        {...props}
      />
      {helper && !error && <p className="form-helper">{helper}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
