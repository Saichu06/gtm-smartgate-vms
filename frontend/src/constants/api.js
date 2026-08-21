/**
 * Frontend API Constants
 * Base URL and version path for future Axios interceptor integration.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_VERSION = import.meta.env.VITE_API_VERSION || '/api/v1';
export const API_URL = `${API_BASE_URL}${API_VERSION}`;
export const MASTER_URL = `${API_BASE_URL}/master`;

export const ENDPOINTS = {
  CUSTOMERS: '/customers',
  USERS: '/users',
  ROLES: '/roles',
  AUDIT_LOGS: '/audit-logs',
  SETTINGS: '/settings',
};

export const MASTER_ENDPOINTS = {
  GET_COMPANY_REPORT: '/getCompanyReport',
  GET_COMPANY_CODE: '/getCompanyCode',
  GET_COMPANY_LIST: '/getCompanyList',
  GET_SITE_REPORT: '/getSiteReport',
  GET_ADMIN_SITE_REPORT: '/getAdminSiteReport',
  GET_EMPLOYEE_REPORT: '/getEmployeeReport',
  GET_USER_REPORT: '/getUserReport',
  GET_ADMIN_USER_REPORT: '/getAdminUserReport',
  GET_ROLE_LIST: '/getRoleList',
  GET_GATE_PASS_REPORT: '/getGatePassReport',
  GET_PASS_CATEGORY: '/getPassCategory',
  GET_GATE_PRIVILEGES: '/getGatePreviliges',
  GET_VISITOR_MASTER_LIST: '/getVisitorMasterList',
  VISITOR_DETAILS: '/visitordetails',
  GET_PASS_DETAILS: '/getpassdetails',
  GET_LOGIN_INFO: '/getLoginInfo',
  GET_LOGIN_PRIVILEGES: '/getLoginPreviliges',
};
