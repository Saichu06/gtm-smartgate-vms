import axios from 'axios';
import { MASTER_URL, MASTER_ENDPOINTS } from '@constants/api';

const masterClient = axios.create({
  baseURL: MASTER_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

masterClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[MASTER API ERROR]', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error);
  }
);

export const masterApiService = {
  // Test Endpoint (GET)
  testMaster: () => masterClient.get('/test'),

  // Company Reports & Auto-Prefix (GET)
  getCompanyReport: () => masterClient.get(MASTER_ENDPOINTS.GET_COMPANY_REPORT),
  getCompanyCode: () => masterClient.get(MASTER_ENDPOINTS.GET_COMPANY_CODE),
  getAutoPrefixReport: () => masterClient.get('/getAutoPrefixReport'),
  getCompanyList: () => masterClient.get(MASTER_ENDPOINTS.GET_COMPANY_LIST),

  // Site / Store Reports (GET)
  getSiteReport: () => masterClient.get(MASTER_ENDPOINTS.GET_SITE_REPORT),
  getAdminSiteReport: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_ADMIN_SITE_REPORT, payload),

  // Employee Reports (POST)
  getEmployeeReport: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_EMPLOYEE_REPORT, payload),

  // Users & Admin Reports (GET / POST)
  getUserReport: () => masterClient.get(MASTER_ENDPOINTS.GET_USER_REPORT),
  getAdminUserReport: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_ADMIN_USER_REPORT, payload),

  // Roles (GET)
  getRoleList: () => masterClient.get(MASTER_ENDPOINTS.GET_ROLE_LIST),

  // Gate Passes & Categories (GET / POST)
  getGatePassReport: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_GATE_PASS_REPORT, payload),
  getPassCategory: () => masterClient.get(MASTER_ENDPOINTS.GET_PASS_CATEGORY),
  getPassDetails: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_PASS_DETAILS, payload),

  // Gate Privileges (GET)
  getGatePrivileges: () => masterClient.get(MASTER_ENDPOINTS.GET_GATE_PRIVILEGES),

  // Visitor Master & Details (POST)
  getVisitorMasterList: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_VISITOR_MASTER_LIST, payload),
  getVisitorDetails: (payload) => masterClient.post(MASTER_ENDPOINTS.VISITOR_DETAILS, payload),

  // Authentication & Privileges (POST)
  getLoginInfo: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_LOGIN_INFO, payload),
  getLoginPrivileges: (payload) => masterClient.post(MASTER_ENDPOINTS.GET_LOGIN_PRIVILEGES, payload),
};

export default masterApiService;
