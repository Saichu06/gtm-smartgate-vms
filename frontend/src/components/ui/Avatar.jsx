/**
 * Avatar Component
 * User avatar — shows image or initials fallback.
 *
 * @param {string} name  - Full name (used for initials)
 * @param {string} src   - Optional image URL
 * @param {string} size  - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} color - Optional override background color
 */

import React from 'react';

const getInitials = (name = '') => {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({ name = '', src, size = 'md', className = '', ...props }) => {
  return (
    <div className={`avatar avatar-${size} ${className}`.trim()} title={name} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
