/**
 * Frontend API Constants
 * Base URL and version path for future Axios interceptor integration.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_VERSION = '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;

export const ENDPOINTS = {
  CUSTOMERS: '/customers',
  USERS: '/users',
  ROLES: '/roles',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
};
