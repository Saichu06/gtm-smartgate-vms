/**
 * gatePassApi.js — Gate Pass Inventory Service Layer
 *
 * Manages physical gate passes per organization.
 * All data is stored in localStorage keyed by orgId so every
 * organization maintains its own independent pass pool.
 *
 * Architecture is REST-API-compatible:
 *  - Replace localStorage calls with fetch() calls when backend is ready.
 *  - UI consumers never change.
 *
 * Pass Statuses:
 *   'available'   — Ready to be issued to a visitor
 *   'assigned'    — Currently held by an active visitor
 *   'maintenance' — Under maintenance / not usable
 *   'lost'        — Reported lost
 *   'inactive'    — Permanently disabled
 */

const STORAGE_KEY = (orgId) => `gtm_gate_passes_${orgId}`;

// ─── Default seed passes for demo orgs ──────────────────────────────────────
const SEED_PASSES = (orgId) => [
  { id: `gp-${orgId}-1`, name: 'Gate Pass 1', gate: 'Gate A', status: 'available' },
  { id: `gp-${orgId}-2`, name: 'Gate Pass 2', gate: 'Gate A', status: 'available' },
  { id: `gp-${orgId}-3`, name: 'Gate Pass 3', gate: 'Gate B', status: 'available' },
  { id: `gp-${orgId}-4`, name: 'Gate Pass 4', gate: 'Gate B', status: 'assigned' },
  { id: `gp-${orgId}-5`, name: 'Gate Pass 5', gate: 'Gate C', status: 'available' },
];

// ─── Read all passes for an org ─────────────────────────────────────────────
export const getGatePasses = (orgId) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY(orgId));
    if (raw) return JSON.parse(raw);
    // Seed defaults on first access
    const defaults = SEED_PASSES(orgId);
    localStorage.setItem(STORAGE_KEY(orgId), JSON.stringify(defaults));
    return defaults;
  } catch {
    return SEED_PASSES(orgId);
  }
};

// ─── Save entire pass list ───────────────────────────────────────────────────
const savePasses = (orgId, passes) => {
  localStorage.setItem(STORAGE_KEY(orgId), JSON.stringify(passes));
  // Fire event so Corporate Portal dashboards can react live
  window.dispatchEvent(new CustomEvent('gtm-gate-passes-changed', { detail: { orgId } }));
  return passes;
};

// ─── Create a new pass ──────────────────────────────────────────────────────
export const createGatePass = (orgId, { name, gate }) => {
  const passes = getGatePasses(orgId);
  const newPass = {
    id: `gp-${orgId}-${Date.now()}`,
    name: name.trim(),
    gate: gate?.trim() || 'Gate A',
    status: 'available',
  };
  return savePasses(orgId, [...passes, newPass]);
};

// ─── Update a pass (name, gate, status) ─────────────────────────────────────
export const updateGatePass = (orgId, passId, updates) => {
  const passes = getGatePasses(orgId).map(p =>
    p.id === passId ? { ...p, ...updates } : p
  );
  return savePasses(orgId, passes);
};

// ─── Delete a pass ──────────────────────────────────────────────────────────
export const deleteGatePass = (orgId, passId) => {
  const passes = getGatePasses(orgId).filter(p => p.id !== passId);
  return savePasses(orgId, passes);
};

// ─── Get only available passes ─────────────────────────────────────────────
export const getAvailablePasses = (orgId) =>
  getGatePasses(orgId).filter(p => p.status === 'available');

// ─── Assign a pass to a visitor ──────────────────────────────────────────────
export const assignGatePass = (orgId, passId, visitorId) => {
  const passes = getGatePasses(orgId).map(p =>
    p.id === passId
      ? { ...p, status: 'assigned', assignedTo: visitorId, assignedAt: new Date().toISOString() }
      : p
  );
  return savePasses(orgId, passes);
};

// ─── Release a pass back to available ──────────────────────────────────────
export const releaseGatePass = (orgId, passId) => {
  const passes = getGatePasses(orgId).map(p =>
    p.id === passId
      ? { ...p, status: 'available', assignedTo: null, assignedAt: null }
      : p
  );
  return savePasses(orgId, passes);
};
