/**
 * Timeline — Recent activity feed for organization details.
 * Displays chronological audit/activity events with color-coded type indicators.
 */
import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, Star } from 'lucide-react';

const TYPE_CONFIG = {
  info:    { Icon: Info,          color: '#0369A1', bg: '#F0F9FF' },
  success: { Icon: CheckCircle2,  color: '#2E7D32', bg: '#F0FDF4' },
  warning: { Icon: AlertTriangle, color: '#ED6C02', bg: '#FFF7ED' },
  danger:  { Icon: XCircle,       color: '#D32F2F', bg: '#FEF2F2' },
  primary: { Icon: Star,          color: '#1565C0', bg: '#EFF6FF' },
};

const Timeline = ({ events = [] }) => {
  if (!events.length) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
        <div style={{ fontSize: 'var(--text-sm)' }}>No recent activity</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {events.map((event, idx) => {
        const conf = TYPE_CONFIG[event.type] || TYPE_CONFIG.info;
        const Icon = conf.Icon;
        const isLast = idx === events.length - 1;

        return (
          <div
            key={event.id || idx}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              paddingBottom: isLast ? 0 : 'var(--space-4)',
              position: 'relative',
            }}
          >
            {/* Vertical connector */}
            {!isLast && (
              <div
                style={{
                  position: 'absolute',
                  left: 15,
                  top: 32,
                  bottom: 0,
                  width: 1,
                  background: 'var(--color-border)',
                }}
              />
            )}

            {/* Icon */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: conf.bg,
                border: `1px solid ${conf.bg}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              <Icon size={14} color={conf.color} />
            </div>

            {/* Content */}
            <div style={{ flex: 1, paddingTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {event.action}
                </span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                  {event.time}
                </span>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                By <strong>{event.actor}</strong>
                {event.target && (
                  <> — <span style={{ color: 'var(--color-primary)' }}>{event.target}</span></>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
