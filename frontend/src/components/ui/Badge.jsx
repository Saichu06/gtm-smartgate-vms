/**
 * Badge Component
 * Status and label indicator.
 *
 * @param {string}    variant - 'success' | 'warning' | 'danger' | 'primary' | 'neutral' | 'info'
 * @param {ReactNode} children
 */

import React from 'react';

const Badge = ({ variant = 'neutral', className = '', children, ...props }) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
};

export default Badge;
