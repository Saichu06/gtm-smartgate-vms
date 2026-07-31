/**
 * Button Component
 * Reusable enterprise button with multiple variants and sizes.
 *
 * @param {string}    variant  - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string}    size     - 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean}   loading  - Shows a spinner when true
 * @param {boolean}   disabled
 * @param {ReactNode} children
 */

import React from 'react';
import Spinner from '@components/feedback/Spinner';

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  const sizeClass = {
    xs: 'btn-xs',
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size] || '';

  return (
    <button
      className={`btn btn-${variant} ${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size={14} />}
      {children}
    </button>
  );
};

export default Button;
