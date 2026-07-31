/**
 * GTM Smart Gate — Frontend Route Constants
 * Centralised URL path definitions to prevent hardcoded strings in components.
 */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  CUSTOMERS: '/customers',
  CUSTOMERS_CREATE: '/customers/create',
  CUSTOMERS_DETAILS: (id) => `/customers/${id}`,
  SUBSCRIPTIONS: '/subscriptions',
  PLATFORM_USERS: '/platform-users',
  ROLES: '/roles',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
};

export default ROUTES;
