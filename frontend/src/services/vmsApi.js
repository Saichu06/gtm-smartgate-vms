/**
 * VMS API — Centralised Axios API methods for GTM Smart Gate frontend.
 * All data flows strictly through Express REST API → PostgreSQL.
 */
import apiService from './api.service';

export const authApi = {
  login: (email, password) => apiService.post('/auth/login', { email, password }),
  refresh: (refreshToken) => apiService.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken) => apiService.post('/auth/logout', { refreshToken }),
  getMe: () => apiService.get('/auth/me'),
  changePassword: (oldPassword, newPassword) => apiService.post('/auth/change-password', { oldPassword, newPassword }),
  getKioskToken: (companyPublicId) => apiService.post('/auth/kiosk-token', { companyPublicId }),
};

export const companyApi = {
  getCompanies: () => apiService.get('/companies'),
  getAll: () => apiService.get('/companies'),
  getCompanyById: (publicId) => apiService.get(`/companies/${publicId}`),
  getById: (publicId) => apiService.get(`/companies/${publicId}`),
  createCompany: (data) => apiService.post('/companies', data),
  create: (data) => apiService.post('/companies', data),
  updateCompany: (publicId, data) => apiService.put(`/companies/${publicId}`, data),
  update: (publicId, data) => apiService.put(`/companies/${publicId}`, data),
};

export const siteApi = {
  getSites: (companyId) => apiService.get('/sites', { params: { companyId } }),
  getAll: (companyId) => apiService.get('/sites', { params: { companyId } }),
  createSite: (data) => apiService.post('/sites', data),
  create: (data) => apiService.post('/sites', data),
};

export const userApi = {
  getUsers: (companyId) => apiService.get('/users', { params: { companyId } }),
  getAll: (companyId) => apiService.get('/users', { params: { companyId } }),
  createUser: (data) => apiService.post('/users', data),
  create: (data) => apiService.post('/users', data),
  updateUser: (publicId, data) => apiService.put(`/users/${publicId}`, data),
  update: (publicId, data) => apiService.put(`/users/${publicId}`, data),
  toggleStatus: (publicId, active) => apiService.patch(`/users/${publicId}/status`, { active }),
};

export const employeeApi = {
  getEmployees: (companyId, search) => apiService.get('/employees', { params: { companyId, search } }),
  getAll: (companyId, search) => apiService.get('/employees', { params: { companyId, search } }),
  createEmployee: (data) => apiService.post('/employees', data),
  create: (data) => apiService.post('/employees', data),
};

export const visitorTypeApi = {
  getVisitorTypes: (companyId) => apiService.get('/visitor-types', { params: { companyId } }),
  getAll: (companyId) => apiService.get('/visitor-types', { params: { companyId } }),
};

export const gatePassApi = {
  getGatePasses: (companyId, status) => apiService.get('/gate-passes', { params: { companyId, status } }),
  getAll: (companyId, status) => apiService.get('/gate-passes', { params: { companyId, status } }),
  createGatePass: (data) => apiService.post('/gate-passes', data),
  create: (data) => apiService.post('/gate-passes', data),
  updateGatePass: (publicId, data) => apiService.put(`/gate-passes/${publicId}`, data),
  update: (publicId, data) => apiService.put(`/gate-passes/${publicId}`, data),
  deleteGatePass: (publicId) => apiService.delete(`/gate-passes/${publicId}`),
  delete: (publicId) => apiService.delete(`/gate-passes/${publicId}`),
};

export const visitorApi = {
  getVisitors: (companyId, params) => apiService.get('/visitors', { params: { companyId, ...params } }),
  getAll: (companyId, params) => apiService.get('/visitors', { params: { companyId, ...params } }),
  getVisitorById: (publicId) => apiService.get(`/visitors/${publicId}`),
  getById: (publicId) => apiService.get(`/visitors/${publicId}`),
  registerVisitor: (data) => apiService.post('/visitors', data),
  create: (data) => apiService.post('/visitors', data),
  checkoutVisitor: (publicId) => apiService.post(`/visitors/${publicId}/check-out`),
  approveVisitor: (publicId) => apiService.post(`/visitors/${publicId}/approve`),
  rejectVisitor: (publicId) => apiService.post(`/visitors/${publicId}/reject`),
  validatePass: (publicId) => apiService.get(`/visitors/validate-pass/${publicId}`),
};

export const reportApi = {
  getMetrics: (companyId, range) => apiService.get('/reports/metrics', { params: { companyId, range } }),
  getSuperAdminMetrics: () => apiService.get('/reports/superadmin-metrics'),
};

export const kioskApi = {
  requestOtp: (phone) => apiService.post('/kiosk/otp', { phone }),
  verifyOtp: (phone, otp) => apiService.post('/kiosk/otp/verify', { phone, otp }),
};

export const auditApi = {
  getAuditLogs: (companyId, params) => apiService.get('/audit-logs', { params: { companyId, ...params } }),
};
