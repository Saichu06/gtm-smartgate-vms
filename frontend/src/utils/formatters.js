/**
 * Date/Time Formatters Utility
 * Consistent formatting helpers for the enterprise admin UI.
 */

/**
 * Format an ISO date string for table display.
 * @example formatDate('2025-01-12') → '12 Jan 2025'
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Format a timestamp for audit logs.
 * @example formatTimestamp('2026-07-31 09:42:15') → '31 Jul 2026, 09:42 AM'
 */
export const formatTimestamp = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/**
 * Format large numbers with locale-specific separators.
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Number(num).toLocaleString('en-IN');
};

/**
 * Generate two-letter initials from a full name string.
 */
export const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
