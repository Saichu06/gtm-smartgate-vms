/**
 * Org-scoped localStorage helpers — single source of truth for tenant data.
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

const ORG_EMPLOYEE_SEEDS = {
  1: [
    { id: 'EMP-001', name: 'Arun Sharma', email: 'arun.sharma@apollotyres.com', phone: '+91 98400 11111', dept: 'Technology', designation: 'Senior Engineering Manager', site: 'Floor 3 - Tech Hub', status: 'Active', joinDate: '2021-03-15' },
    { id: 'EMP-002', name: 'Priya Nair', email: 'priya.nair@apollotyres.com', phone: '+91 98400 22222', dept: 'Human Resources', designation: 'HR Business Partner', site: 'Floor 1 - HR Wing', status: 'Active', joinDate: '2020-07-22' },
    { id: 'EMP-003', name: 'Karthik Raj', email: 'karthik.raj@apollotyres.com', phone: '+91 98400 33333', dept: 'Finance', designation: 'Finance Controller', site: 'Floor 2 - Finance', status: 'Active', joinDate: '2019-11-08' },
    { id: 'EMP-004', name: 'Deepa Menon', email: 'deepa.menon@apollotyres.com', phone: '+91 98400 44444', dept: 'Executive', designation: 'COO', site: 'Floor 5 - Executive Suite', status: 'Active', joinDate: '2018-05-01' },
    { id: 'EMP-005', name: 'Suresh Babu', email: 'suresh.babu@apollotyres.com', phone: '+91 98400 55555', dept: 'Operations', designation: 'Plant Manager', site: 'Ground - Plant', status: 'Active', joinDate: '2017-09-14' },
    { id: 'EMP-006', name: 'Meena Iyer', email: 'meena.iyer@apollotyres.com', phone: '+91 98400 66666', dept: 'Legal', designation: 'Legal Counsel', site: 'Floor 4 - Legal', status: 'Active', joinDate: '2020-01-20' },
  ],
  2: [
    { id: 'EMP-001', name: 'Srinivasan M.', email: 'srinivasan.m@tvsmotor.com', phone: '+91 98411 20033', dept: 'Administration', designation: 'Corporate Admin', site: 'Hosur HQ - Admin Block', status: 'Active', joinDate: '2016-04-12' },
    { id: 'EMP-002', name: 'Lakshmi Venkat', email: 'lakshmi.v@tvsmotor.com', phone: '+91 98411 20101', dept: 'Engineering', designation: 'R&D Head', site: 'Hosur Plant 3 - R&D', status: 'Active', joinDate: '2018-08-03' },
    { id: 'EMP-003', name: 'Ramesh Kumar', email: 'ramesh.k@tvsmotor.com', phone: '+91 98411 20202', dept: 'Production', designation: 'Assembly Line Manager', site: 'Plant 1 - Assembly', status: 'Active', joinDate: '2019-02-18' },
    { id: 'EMP-004', name: 'Anitha Reddy', email: 'anitha.r@tvsmotor.com', phone: '+91 98411 20303', dept: 'Quality', designation: 'QA Lead', site: 'Plant 2 - QC Lab', status: 'Active', joinDate: '2020-06-25' },
    { id: 'EMP-005', name: 'Vikram Malhotra', email: 'vikram.m@tvsmotor.com', phone: '+91 98411 20404', dept: 'Security', designation: 'Security Head', site: 'Main Gate - Hosur', status: 'Active', joinDate: '2017-11-10' },
  ],
  3: [
    { id: 'EMP-001', name: 'Anand R.', email: 'anand.r@infosys.com', phone: '+91 98453 30044', dept: 'Administration', designation: 'Campus Admin', site: 'EC-1 Main Campus', status: 'Active', joinDate: '2015-01-08' },
    { id: 'EMP-002', name: 'Kavitha S.', email: 'kavitha.s@infosys.com', phone: '+91 98453 30101', dept: 'Technology', designation: 'Delivery Manager', site: 'Block A - Tech Park', status: 'Active', joinDate: '2017-03-22' },
    { id: 'EMP-003', name: 'Rajesh Pillai', email: 'rajesh.p@infosys.com', phone: '+91 98453 30202', dept: 'Human Resources', designation: 'HR Director', site: 'Block B - HR Wing', status: 'Active', joinDate: '2016-09-15' },
    { id: 'EMP-004', name: 'Deepika Rao', email: 'deepika.r@infosys.com', phone: '+91 98453 30303', dept: 'Finance', designation: 'Finance VP', site: 'Block C - Finance', status: 'Active', joinDate: '2014-07-01' },
  ],
};

const DEFAULT_EMPLOYEE_SEEDS = [
  { id: 'EMP-001', name: 'Admin User', email: 'admin@company.com', phone: '+91 98400 11111', dept: 'Administration', designation: 'Corporate Admin', site: 'Main Office', status: 'Active', joinDate: '2022-01-01' },
  { id: 'EMP-002', name: 'Security Lead', email: 'security@company.com', phone: '+91 98400 22222', dept: 'Security', designation: 'Gate Security Lead', site: 'Main Gate', status: 'Active', joinDate: '2022-03-15' },
];

export const getEmployeeSeeds = (orgId) =>
  ORG_EMPLOYEE_SEEDS[parseInt(orgId, 10)] || DEFAULT_EMPLOYEE_SEEDS;

export const getOrgEmployees = (orgId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.employees(orgId)) || '[]');
    if (saved.length > 0) return saved.filter((e) => e.status === 'Active' || !e.status);
    return getEmployeeSeeds(orgId);
  } catch {
    return getEmployeeSeeds(orgId);
  }
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

export const getVisitors = (orgId) => {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.visitors(orgId)) || '[]');
  } catch {
    return [];
  }
};

export const saveVisitors = (orgId, visitors) => {
  localStorage.setItem(storageKeys.visitors(orgId), JSON.stringify(visitors));
  window.dispatchEvent(new CustomEvent('gtm-visitors-changed', { detail: { orgId: String(orgId) } }));
};

/** Upsert a visitor record by id — prevents duplicate entries. */
export const upsertVisitor = (orgId, record) => {
  const existing = getVisitors(orgId);
  const idx = existing.findIndex((v) => v.id === record.id);
  const updated = idx >= 0
    ? existing.map((v, i) => (i === idx ? { ...v, ...record } : v))
    : [record, ...existing];
  saveVisitors(orgId, updated);
  return record;
};

export const updateVisitor = (orgId, visitId, fields) => {
  const existing = getVisitors(orgId);
  const updated = existing.map((v) => (v.id === visitId ? { ...v, ...fields } : v));
  saveVisitors(orgId, updated);
  return updated.find((v) => v.id === visitId) || null;
};

export const getPendingApprovalCount = (orgId) =>
  getVisitors(orgId).filter((v) => v.status === 'Awaiting Approval').length;

export const formatHostName = (host) =>
  (typeof host === 'object' ? host?.name : host) || '—';

/** Parse the relevant date from a visitor record (submission or decision time). */
export const parseVisitorDate = (visitor, useProcessed = false) => {
  const ts = useProcessed
    ? (visitor.processedAt || visitor.timestamp)
    : (visitor.timestamp || visitor.processedAt);
  if (!ts) return null;
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** Filter visitors by date range. Pending uses submission timestamp; processed uses processedAt. */
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

export const getUniqueHosts = (visitors) => {
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

export const DEFAULT_VISITOR_TYPES = [
  { id: 'VT-001', name: 'Business Visitor', code: 'BUS', color: '#1565C0', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Reception', 'Meeting Rooms', 'Cafeteria'], passTemplate: 'Standard Blue' },
  { id: 'VT-002', name: 'Vendor / Supplier', code: 'VEN', color: '#2E7D32', maxHours: 12, requiresApproval: true, requiresID: true, zones: ['Loading Dock', 'Warehouse', 'Finance Dept'], passTemplate: 'Green Pass' },
  { id: 'VT-003', name: 'Contractor', code: 'CON', color: '#F57C00', maxHours: 24, requiresApproval: true, requiresID: true, zones: ['Plant Areas', 'Workshop', 'Utility Rooms'], passTemplate: 'Orange Safety' },
  { id: 'VT-004', name: 'Job Candidate', code: 'CAN', color: '#6A1B9A', maxHours: 4, requiresApproval: false, requiresID: true, zones: ['HR Wing', 'Interview Rooms'], passTemplate: 'Purple Temp' },
  { id: 'VT-005', name: 'Auditor / Inspector', code: 'AUD', color: '#C62828', maxHours: 10, requiresApproval: true, requiresID: true, zones: ['All Areas'], passTemplate: 'Red Authority' },
  { id: 'VT-006', name: 'Government Official', code: 'GOV', color: '#212121', maxHours: 8, requiresApproval: true, requiresID: true, zones: ['Executive Suite', 'Board Room', 'All Areas'], passTemplate: 'Black Protocol' },
  { id: 'VT-007', name: 'Delivery Personnel', code: 'DEL', color: '#00838F', maxHours: 2, requiresApproval: false, requiresID: false, zones: ['Reception', 'Loading Dock'], passTemplate: 'Teal Quick' },
];

export const getVisitorTypes = (orgId) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.visitorTypes(orgId)) || '[]');
    return saved.length > 0 ? saved : DEFAULT_VISITOR_TYPES;
  } catch {
    return DEFAULT_VISITOR_TYPES;
  }
};

export const saveVisitorTypes = (orgId, types) => {
  localStorage.setItem(storageKeys.visitorTypes(orgId), JSON.stringify(types));
};

export const countActiveVisitorsByType = (orgId) => {
  const visitors = getVisitors(orgId).filter(v => v.status === 'Checked In');
  const counts = {};
  visitors.forEach(v => {
    const t = v.type || 'Other';
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
};
