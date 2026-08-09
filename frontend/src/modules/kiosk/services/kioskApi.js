/**
 * Kiosk API — org-scoped mock backend with localStorage persistence.
 */
import {
  getOrgEmployees,
  mapEmployeeForKiosk,
  upsertVisitor,
  updateVisitor,
  getVisitors,
} from '@utils/orgStorage';

const delay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

export const searchEmployees = async (query, orgId = '1') => {
  await delay(400);
  const employees = getOrgEmployees(orgId)
    .filter((e) => e.status !== 'Inactive' && e.status !== 'On Leave')
    .map((emp, i) => mapEmployeeForKiosk(emp, i));

  if (!query.trim()) return employees;

  const q = query.toLowerCase();
  return employees.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q)
  );
};

export const searchVisitorByPhone = async (phone) => {
  await delay(600);
  if (phone === '9876543210' || phone === '9999999999') {
    return {
      found: true,
      visitor: {
        phone: '9876543210',
        firstName: 'Rajesh',
        lastName: 'Patel',
        company: 'Partner Corp',
        email: 'rajesh.patel@partner.com',
        purpose: 'Business Meeting',
        vehicleNumber: 'TN 01 AB 1234',
        visitorType: 'Business Visitor',
        expectedDuration: '2 Hours',
        isReturning: true,
      },
    };
  }
  return { found: false, visitor: null };
};

/**
 * Helper to request next pass number centrally configured by Corporate Admin
 */
export const requestNextPassNumber = (orgId = '1', orgCode = 'APL') => {
  const key = `gtm_pass_config_${orgId}`;
  let passConfig = null;
  try {
    passConfig = JSON.parse(localStorage.getItem(key) || 'null');
  } catch (e) {
    passConfig = null;
  }

  const prefix = passConfig?.prefix || `${orgCode}-GP`;
  const currentNum = parseInt(passConfig?.currentNum || '42', 10);
  const nextNum = currentNum + 1;
  const numStr = String(nextNum).padStart(4, '0');
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const internalPassNumber = `${prefix}-${dateStr}-${numStr}`;
  const displayGatePassNumber = `Gate Pass #${numStr}`;

  // Update current counter in localStorage
  if (passConfig) {
    passConfig.currentNum = numStr;
    localStorage.setItem(key, JSON.stringify(passConfig));
  }

  return {
    passNumber: internalPassNumber,
    displayPassNumber: displayGatePassNumber,
    counter: numStr,
  };
};

/**
 * Create or update a pending visitor registration (called once from ReviewPage).
 */
export const submitRegistration = async (visitorData, orgId = '1', options = {}) => {
  await delay(600);

  const visitId = visitorData.visitId || `VIS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const approvalRequired = options.approvalRequired !== false;
  const status = approvalRequired ? 'Awaiting Approval' : 'Checked In';
  const checkinTime =
    status === 'Checked In'
      ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      : null;

  const hostName = visitorData.host?.name || null;
  const passInfo = requestNextPassNumber(orgId, options.orgCode || 'APL');
  const passId = status === 'Checked In' ? passInfo.passNumber : null;
  const displayPassNumber = status === 'Checked In' ? passInfo.displayPassNumber : null;

  const record = {
    id: visitId,
    passId,
    displayPassNumber,
    // Physical gate pass assigned by the kiosk on Screen 4
    gatePass: visitorData.assignedPass?.name || null,
    gatePassId: visitorData.assignedPass?.id || null,
    gatePassGate: visitorData.assignedPass?.gate || null,
    name: `${visitorData.firstName || ''} ${visitorData.lastName || ''}`.trim() || 'Kiosk Visitor',
    company: visitorData.company || 'Walk-in',
    host: visitorData.host || hostName || 'Reception Desk',
    hostId: visitorData.host?.id || null,
    site: options.siteName || visitorData.assignedPass?.gate || 'Gate A — Self-Service Kiosk',
    purpose: visitorData.purpose || 'Business Visit',
    expectedDuration: visitorData.expectedDuration || '',
    checkin: checkinTime,
    checkout: null,
    status,
    type: visitorData.visitorType || 'Business Visitor',
    email: visitorData.email || '',
    phone: visitorData.phone || '',
    vehicle: visitorData.vehicleNumber || '',
    photo: visitorData.photoDataUrl || null,
    idType: visitorData.idType || 'Aadhaar',
    idImageUrl: visitorData.idImageUrl || null,
    registeredVia: 'Self-Service Kiosk',
    priority: 'Normal',
    timestamp: new Date().toISOString(),
  };

  upsertVisitor(orgId, record);

  return {
    success: true,
    visitId,
    passId,
    displayPassNumber,
    gate: record.site,
    meetingLocation: visitorData.host ? `${visitorData.host.floor || visitorData.host.site}` : 'Reception Lobby',
    validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    record,
  };
};

/**
 * Finalize approval — updates existing record, never creates a duplicate.
 */
export const finalizeApproval = async (orgId, visitId, approved) => {
  await delay(800);

  if (!approved) {
    updateVisitor(orgId, visitId, { status: 'Rejected' });
    return { approved: false };
  }

  const passId = `VMS-${Date.now().toString(36).toUpperCase()}`;
  const checkin = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const updated = updateVisitor(orgId, visitId, { status: 'Checked In', passId, checkin });

  return {
    approved: true,
    passId,
    visitId,
    gate: updated?.site || 'Gate A — Self-Service Kiosk',
    validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    record: updated,
  };
};

export const checkApprovalStatus = async (orgId, visitId) => {
  await delay(400);

  const record = getVisitors(orgId).find((v) => v.id === visitId);
  if (!record) return { approved: null, pending: true };

  if (record.status === 'Checked In') {
    return {
      approved: true,
      passId: record.passId,
      visitId: record.id,
      gate: record.site,
      validUntil: new Date(Date.now() + 8 * 60 * 60 * 1000).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      record,
    };
  }

  if (record.status === 'Rejected') {
    return { approved: false, record };
  }

  // Still awaiting — portal admin must approve/reject
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
