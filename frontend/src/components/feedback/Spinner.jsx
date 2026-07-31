/**
 * Spinner Component
 * Lightweight loading indicator.
 */
import React from 'react';

const Spinner = ({ size = 16, color = 'currentColor' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: 'spin 0.7s linear infinite', display: 'block', flexShrink: 0 }}
      aria-label="Loading"
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
};

export default Spinner;
