/**
 * gatePassApi.js — Authoritative Gate Pass API Client
 * Binds directly to Express REST API /api/v1/gate-passes backed by smartgate.pass_details
 */
import apiService from '@services/api.service';

export const fetchGatePassesAsync = async (orgId) => {
  const query = orgId ? `?companyId=${orgId}` : '';
  const res = await apiService.get(`/gate-passes${query}`);
  return res.data || [];
};

export const getGatePasses = async (orgId) => {
  return await fetchGatePassesAsync(orgId);
};

export const createGatePassAsync = async (orgId, { name, gate }) => {
  const res = await apiService.post('/gate-passes', {
    name,
    gate,
    companyId: orgId,
  });
  return res.data;
};

export const createGatePass = createGatePassAsync;

export const updateGatePassAsync = async (passPublicId, updates) => {
  const res = await apiService.put(`/gate-passes/${passPublicId}`, updates);
  return res.data;
};

export const updateGatePass = updateGatePassAsync;

export const deleteGatePassAsync = async (passPublicId) => {
  const res = await apiService.delete(`/gate-passes/${passPublicId}`);
  return res;
};

export const deleteGatePass = deleteGatePassAsync;

export const getAvailablePassesAsync = async (orgId) => {
  const passes = await fetchGatePassesAsync(orgId);
  return passes.filter(p => p.status === 'available');
};

export const getAvailablePasses = getAvailablePassesAsync;
export const assignGatePass = async () => true;
export const releaseGatePass = async () => true;
