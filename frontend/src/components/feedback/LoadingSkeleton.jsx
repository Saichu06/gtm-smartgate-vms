/**
 * LoadingSkeleton Component
 * Animated content placeholder while data loads.
 */
import React from 'react';

export const SkeletonBlock = ({ width = '100%', height = 16, borderRadius = 'var(--radius-md)', style = {} }) => (
  <div
    className="skeleton"
    style={{ width, height, borderRadius, ...style }}
  />
);

export const SkeletonRow = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
    <SkeletonBlock width="60%" height={14} />
    <SkeletonBlock width="40%" height={12} />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="table-wrapper">
    <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
      <SkeletonBlock width="200px" height={30} />
    </div>
    {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
  </div>
);

export const SkeletonStatCard = () => (
  <div className="stat-card">
    <SkeletonBlock width="60%" height={11} style={{ marginBottom: '10px' }} />
    <SkeletonBlock width="40%" height={22} style={{ marginBottom: '8px' }} />
    <SkeletonBlock width="70%" height={11} />
  </div>
);

const LoadingSkeleton = ({ type = 'block', ...props }) => {
  switch (type) {
    case 'table': return <SkeletonTable {...props} />;
    case 'stat':  return <SkeletonStatCard />;
    case 'row':   return <SkeletonRow />;
    default:      return <SkeletonBlock {...props} />;
  }
};

export default LoadingSkeleton;
