/**
 * Application Constants
 * Centralised environment and runtime configuration values.
 */
module.exports = {
  APP_NAME: 'GTM Smart Gate Enterprise Platform',
  APP_VERSION: '2.4.0',

  PLAN_TIERS: ['Starter', 'Professional', 'Enterprise'],
  CUSTOMER_STATUSES: ['Active', 'Trial', 'Suspended', 'Expired'],
  PLATFORM_ROLES: ['Super Admin', 'Support Lead', 'Security Auditor', 'Billing Manager'],

  JWT_ACCESS_TOKEN_EXPIRY: '8h',
  JWT_REFRESH_TOKEN_EXPIRY: '30d',

  PAGINATION_DEFAULT_LIMIT: 20,
  PAGINATION_MAX_LIMIT: 100,
};
