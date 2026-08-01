/**
 * InfoCard — Labeled key-value information display card.
 * Used in the Overview tab to show org information in a structured grid.
 */
import React from 'react';

const InfoRow = ({ label, value, valueElement }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border)',
      gap: 'var(--space-4)',
    }}
  >
    <div
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-semibold)',
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        minWidth: 140,
        flexShrink: 0,
        paddingTop: 1,
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', flex: 1, wordBreak: 'break-word' }}>
      {valueElement || value || <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
    </div>
  </div>
);

const InfoCard = ({ title, rows = [], actions, children }) => (
  <div className="card">
    {title && (
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {actions && <div>{actions}</div>}
      </div>
    )}
    <div className="card-body" style={{ padding: '0 var(--space-5)' }}>
      {rows.map((row, i) => (
        <InfoRow
          key={i}
          label={row.label}
          value={row.value}
          valueElement={row.element}
        />
      ))}
      {children}
    </div>
  </div>
);

export { InfoRow };
export default InfoCard;
