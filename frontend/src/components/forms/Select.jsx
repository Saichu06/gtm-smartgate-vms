/**
 * Select Component
 * Enterprise dropdown select field.
 */
import React from 'react';

const Select = React.forwardRef(({
  label,
  helper,
  error,
  required = false,
  options = [],
  placeholder = 'Select an option',
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && <span className="required"> *</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`form-control ${error ? 'error' : ''} ${className}`.trim()}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helper && !error && <p className="form-helper">{helper}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
