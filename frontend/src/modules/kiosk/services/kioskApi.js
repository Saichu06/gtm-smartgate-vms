/**
 * Kiosk API Client — Connected directly to Express REST API / PostgreSQL backend
 */
import apiService from '@services/api.service';
import { API_URL } from '@constants/api';

export const searchEmployees = async (query, orgId = '1') => {
  try {
    const queryParam = query ? `?search=${encodeURIComponent(query)}` : '';
    const res = await apiService.get(`/employees${queryParam}`);
    if (res.success && Array.isArray(res.data)) {
      return res.data.map((emp, i) => ({
        id: emp.id,
        name: emp.name,
        designation: emp.designation || 'Staff',
        department: emp.dept || 'General',
        floor: emp.site || 'Main Office',
        availability: 'available',
        color: '#1565C0',
        email: emp.email,
        phone: emp.phone,
      }));
    }
    return [];
  } catch (err) {
    console.error('Employee search API error:', err);
    throw new Error('Unable to connect to backend');
  }
};

export const searchVisitorByPhone = async (phone) => {
  try {
    const res = await apiService.get(`/visitors?mobile=${encodeURIComponent(phone)}`);
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const v = res.data[0];
      return {
        found: true,
        visitor: {
          phone: v.phone,
          firstName: v.name.split(' ')[0] || v.name,
          lastName: v.name.split(' ').slice(1).join(' ') || '',
          company: v.company,
          email: v.email || '',
          visitorType: v.type,
          isReturning: true,
        },
      };
    }
    return { found: false, visitor: null };
  } catch (err) {
    console.error('Visitor lookup error:', err);
    return { found: false, visitor: null };
  }
};

export const submitRegistration = async (visitorData, orgId = '1', options = {}) => {
  const apiPayload = {
    phone: visitorData.phone || '',
    otp: visitorData.otp || '1234',
    name: `${visitorData.firstName || ''} ${visitorData.lastName || ''}`.trim() || 'Kiosk Visitor',
    company: visitorData.company || 'Walk-in',
    personToMeet: typeof visitorData.host === 'object' ? visitorData.host?.name : (visitorData.host || 'Reception Desk'),
    visitorType: visitorData.visitorType || 'Business Visitor',
    imageType: 'BASE64',
    photoDataUrl: visitorData.photoDataUrl || null,
    imageName: `visitor_${Date.now()}.png`,
    idType: visitorData.idType || 'Aadhaar',
    idImageUrl: visitorData.idImageUrl || null,
    idproofName: `id_${Date.now()}.png`,
    laptop: visitorData.hasLaptop || false,
    laptopModel: visitorData.laptopModel || null,
    serialNo: visitorData.laptopSerial || null,
    vehicleType: visitorData.vehicleType || null,
    vehicleNo: visitorData.vehicleNumber || null,
    gatePassId: visitorData.assignedPass?.id || null,
    companyId: orgId,
    siteId: visitorData.siteId || null,
  };

  const res = await apiService.post('/visitors', apiPayload);

  if (!res.success || !res.data) {
    throw new Error('Unable to connect to backend or register visitor');
  }

  const record = res.data;
  return {
    success: true,
    visitId: record.id,
    passId: record.passId,
    displayPassNumber: record.gatePass || `Pass #${record.id}`,
    gate: visitorData.assignedPass?.gate || 'Main Gate',
    meetingLocation: visitorData.host ? `${visitorData.host.floor || visitorData.host.site || 'Lobby'}` : 'Reception Lobby',
    validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    record,
  };
};

export const finalizeApproval = async (orgId, visitId, approved) => {
  if (!approved) {
    const res = await apiService.post(`/visitors/${visitId}/reject`);
    return { approved: false, data: res.data };
  }
  const res = await apiService.post(`/visitors/${visitId}/approve`);
  return {
    approved: true,
    passId: res.data?.passId,
    visitId: res.data?.id,
    record: res.data,
  };
};

export const checkApprovalStatus = async (orgId, visitId) => {
  const res = await apiService.get(`/visitors/${visitId}`);
  if (!res.success || !res.data) return { approved: null, pending: true };

  const record = res.data;
  if (record.status === 'Checked In') {
    return {
      approved: true,
      passId: record.passId,
      visitId: record.id,
      record,
    };
  }
  if (record.status === 'Rejected') {
    return { approved: false, record };
  }

  return { approved: null, pending: true, record };
};

export const VISITOR_TYPES = [
  'Business Visitor', 'Vendor / Supplier', 'Contractor',
  'Job Candidate', 'Auditor / Inspector', 'Government Official', 'Delivery Personnel',
];

export const DURATION_OPTIONS = [
  '30 Minutes', '1 Hour', '2 Hours', '3 Hours',
  '4 Hours', 'Half Day (5h)', 'Full Day (8h)',
];

export const PURPOSE_OPTIONS = [
  'Business Meeting', 'Interview', 'Product Demo',
  'Site Inspection', 'Vendor Work', 'Delivery',
  'Audit / Compliance', 'Government Visit', 'Personal',
];

export const ID_TYPES = [
  { id: 'aadhaar',  label: 'Aadhaar Card',    icon: '🪪', color: '#1565C0', description: '12-digit UID' },
  { id: 'dl',       label: 'Driving License',  icon: '🚗', color: '#2E7D32', description: 'Valid DL' },
  { id: 'passport', label: 'Passport',          icon: '✈️', color: '#6A1B9A', description: 'International ID' },
  { id: 'empcard',  label: 'Employee Card',     icon: '👤', color: '#C62828', description: 'Corporate ID' },
  { id: 'other',    label: 'Other',             icon: '📄', color: '#64748B', description: 'Any valid ID' },
];
