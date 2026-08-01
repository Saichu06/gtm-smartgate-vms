/**
 * SubscriptionBadge — Organization Subscription Plan Badge
 * Enterprise / Professional / Trial with distinctive styling.
 */
import React from 'react';

const PLAN_CONFIG = {
  Enterprise:   { variant: 'primary',  icon: '⬡' },
  Professional: { variant: 'info',     icon: '◈' },
  Trial:        { variant: 'warning',  icon: '◉' },
  Starter:      { variant: 'neutral',  icon: '○' },
};

const SubscriptionBadge = ({ plan, className = '' }) => {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.Starter;
  return (
    <span className={`badge badge-${config.variant} ${className}`.trim()}>
      {plan || 'Unknown'}
    </span>
  );
};

export default SubscriptionBadge;
