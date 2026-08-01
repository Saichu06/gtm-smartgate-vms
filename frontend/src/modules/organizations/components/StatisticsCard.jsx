/**
 * StatisticsCard — Key metric display card for organization overview.
 * Supports icon, label, value, subtext, and trend indicator.
 */
import React from 'react';

const StatisticsCard = ({
  icon: Icon,
  iconColor = 'var(--color-primary)',
  iconBg = 'var(--color-primary-subtle)',
  label,
  value,
  subtext,
  trend,
  trendUp,
}) => {
  return (
    <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="stat-label">{label}</span>
        {Icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              background: iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={16} color={iconColor} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtext">
        {trend && (
          <span
            style={{
              color: trendUp ? 'var(--color-success)' : 'var(--color-danger)',
              fontWeight: 'var(--font-semibold)',
              marginRight: 4,
            }}
          >
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
        {subtext}
      </div>
    </div>
  );
};

export default StatisticsCard;
