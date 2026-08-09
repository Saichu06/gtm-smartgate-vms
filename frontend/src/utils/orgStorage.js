/**
 * Org-scoped helpers & formatting utilities — PostgreSQL Source of Truth.
 */

const AVAILABILITY = ['available', 'available', 'busy', 'away'];
const AVAIL_COLORS = ['#1565C0', '#2E7D32', '#ED6C02', '#6A1B9A', '#C62828', '#00838F'];

export const storageKeys = {
  visitors: (orgId) => `gtm_kiosk_visitors_${orgId}`,
  employees: (orgId) => `gtm_corp_employees_${orgId}`,
  sites: (orgId) => `gtm_corp_sites_${orgId}`,
  users: (orgId) => `gtm_corp_users_${orgId}`,
  visitorTypes: (orgId) => `gtm_corp_visitor_types_${orgId}`,
};

export const mapEmployeeForKiosk = (emp, index = 0) => ({
  id: emp.id,
  name: emp.name,
  designation: emp.designation || 'Team Member',
  department: emp.dept || emp.department || 'General',
  floor: emp.site || 'Main Office',
  availability: AVAILABILITY[index % AVAILABILITY.length],
  color: AVAIL_COLORS[index % AVAIL_COLORS.length],
  email: emp.email,
  phone: emp.phone,
});

export const formatHostName = (host) =>
  (typeof host === 'object' ? host?.name : host) || '—';

export const parseVisitorDate = (visitor, useProcessed = false) => {
  const ts = useProcessed
    ? (visitor.processedAt || visitor.timestamp || visitor.checkin)
    : (visitor.timestamp || visitor.checkin || visitor.processedAt);
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const isVisitorInDateRange = (visitor, range, customDate = null, useProcessed = false) => {
  if (range === 'all') return true;
  const d = parseVisitorDate(visitor, useProcessed);
  if (!d) return false;

  const vDay = startOfDay(d);
  const today = startOfDay(new Date());

  switch (range) {
    case 'today':
      return vDay.getTime() === today.getTime();
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      return vDay.getTime() === y.getTime();
    }
    case '7d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 6);
      return vDay >= from && vDay <= today;
    }
    case '30d': {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      return vDay >= from && vDay <= today;
    }
    case 'custom': {
      if (!customDate) return true;
      const c = startOfDay(new Date(customDate));
      return vDay.getTime() === c.getTime();
    }
    default:
      return true;
  }
};

export const formatVisitorDateTime = (visitor, useProcessed = false) => {
  const d = parseVisitorDate(visitor, useProcessed);
  if (!d) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

export const DEFAULT_VISITOR_TYPES = [
  { id: 'VT-001', name: 'Business Visitor', code: 'BUS', color: '#1565C0', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Reception', 'Meeting Rooms', 'Cafeteria'], passTemplate: 'Standard Blue' },
  { id: 'VT-002', name: 'Vendor / Supplier', code: 'VEN', color: '#2E7D32', maxHours: 12, requiresApproval: true, requiresID: true, zones: ['Loading Dock', 'Warehouse', 'Finance Dept'], passTemplate: 'Green Pass' },
  { id: 'VT-003', name: 'Contractor', code: 'CON', color: '#F57C00', maxHours: 24, requiresApproval: true, requiresID: true, zones: ['Plant Areas', 'Workshop', 'Utility Rooms'], passTemplate: 'Orange Safety' },
  { id: 'VT-004', name: 'Job Candidate', code: 'CAN', color: '#6A1B9A', maxHours: 4, requiresApproval: false, requiresID: true, zones: ['HR Wing', 'Interview Rooms'], passTemplate: 'Purple Temp' },
  { id: 'VT-005', name: 'Auditor / Inspector', code: 'AUD', color: '#C62828', maxHours: 10, requiresApproval: true, requiresID: true, zones: ['All Areas'], passTemplate: 'Red Authority' },
  { id: 'VT-006', name: 'Government Official', code: 'GOV', color: '#212121', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Executive Suite', 'Board Room', 'All Areas'], passTemplate: 'Black Protocol' },
  { id: 'VT-007', name: 'Delivery Personnel', code: 'DEL', color: '#00838F', maxHours: 2, requiresApproval: false, requiresID: false, zones: ['Reception', 'Loading Dock'], passTemplate: 'Teal Quick' },
];

export const getUniqueHosts = (visitors = []) => {
  const hosts = new Map();
  visitors.forEach((v) => {
    const name = formatHostName(v.host);
    if (name && name !== '—') {
      const id = v.hostId || name;
      hosts.set(id, name);
    }
  });
  return Array.from(hosts.entries()).map(([id, name]) => ({ id, name }));
};

export const getVisitors = () => [];
export const saveVisitors = () => {};
export const upsertVisitor = (orgId, record) => record;
export const updateVisitor = (orgId, visitId, fields) => fields;
export const getOrgEmployees = () => [];
export const getEmployeeSeeds = () => [];
export const getVisitorTypes = () => DEFAULT_VISITOR_TYPES;
export const saveVisitorTypes = () => {};
export const countActiveVisitorsByType = () => ({});
export const getPendingApprovalCount = () => 0;
