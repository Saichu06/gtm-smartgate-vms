/**
 * StatusBadge — Organization Lifecycle Status Badge
 * Displays the organization's lifecycle state with appropriate color coding.
 * Lifecycle: Draft → Created → Corporate Admin Assigned → Subscription Active → Operational → Suspended → Archived
 */
import React from 'react';

const LIFECYCLE_CONFIG = {
  Draft:                    { variant: 'neutral',  dot: '#94A3B8' },
  Created:                  { variant: 'info',     dot: '#0369A1' },
  'Corporate Admin Assigned': { variant: 'primary', dot: '#1565C0' },
  'Subscription Active':    { variant: 'warning',  dot: '#ED6C02' },
  Operational:              { variant: 'success',  dot: '#2E7D32' },
  Suspended:                { variant: 'danger',   dot: '#D32F2F' },
  Archived:                 { variant: 'neutral',  dot: '#64748B' },
};

// Fallback for simple status strings
const STATUS_CONFIG = {
  Active:   { variant: 'success' },
  Trial:    { variant: 'warning' },
  Suspended:{ variant: 'danger' },
  Inactive: { variant: 'neutral' },
  Pending:  { variant: 'info' },
};

const StatusBadge = ({ status, lifecycle, showDot = true, className = '' }) => {
  const label = lifecycle || status || 'Unknown';
  const config = LIFECYCLE_CONFIG[label] || STATUS_CONFIG[label] || { variant: 'neutral', dot: '#94A3B8' };

  return (
    <span className={`badge badge-${config.variant} ${className}`.trim()}>
      {showDot && config.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: config.dot,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {label}
    </span>
  );
};

export default StatusBadge;
