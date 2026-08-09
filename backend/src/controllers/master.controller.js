/**
 * Master Data Controller with Tenant & RBAC Enforced Scoping
 */
const companyRepo = require('../repositories/company.repository');
const siteRepo = require('../repositories/site.repository');
const employeeRepo = require('../repositories/employee.repository');
const gatePassRepo = require('../repositories/gatePass.repository');
const pool = require('../config/database');
const { encodePublicId, decodePublicId } = require('../services/id.service');

// Helper to resolve effective company ID from authenticated scope
function getEffectiveCompanyId(req) {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return req.query.companyId ? decodePublicId(req.query.companyId) : null;
  }
  return req.user && req.user.companyId ? decodePublicId(req.user.companyId) : null;
}

// Helper to resolve effective site ID from authenticated scope
function getEffectiveSiteId(req) {
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'CORP_ADMIN')) {
    return req.query.siteId ? decodePublicId(req.query.siteId) : null;
  }
  return req.user && req.user.siteId ? decodePublicId(req.user.siteId) : null;
}

// ==========================================
// 1. COMPANIES / ORGANIZATIONS
// ==========================================
exports.getAllCompanies = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    let rows;
    if (effectiveCompanyId) {
      const comp = await companyRepo.findById(effectiveCompanyId);
      rows = comp ? [comp] : [];
    } else {
      rows = await companyRepo.findAll();
    }

    const data = rows.map((r) => ({
      ...r,
      id: encodePublicId('company', r.id),
      internalId: r.id,
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch companies' } });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid company ID format' } });
    }

    // Tenant check
    const effectiveCompanyId = getEffectiveCompanyId(req);
    if (effectiveCompanyId && effectiveCompanyId !== internalId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access to this company is denied' } });
    }

    const company = await companyRepo.findById(internalId);
    if (!company) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } });
    }

    const data = {
      ...company,
      id: encodePublicId('company', company.id),
      internalId: company.id,
    };
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch company' } });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = await companyRepo.create(req.body);
    const data = {
      ...company,
      id: encodePublicId('company', company.id),
    };
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create company' } });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid company ID format' } });
    }

    // Tenant check
    const effectiveCompanyId = getEffectiveCompanyId(req);
    if (effectiveCompanyId && effectiveCompanyId !== internalId) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access to this company is denied' } });
    }

    const company = await companyRepo.update(internalId, req.body);
    if (!company) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Company not found' } });
    }

    const data = {
      ...company,
      id: encodePublicId('company', company.id),
    };
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update company' } });
  }
};

// ==========================================
// 2. SITES
// ==========================================
exports.getSites = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    const rows = await siteRepo.findAll(effectiveCompanyId);
    const data = rows.map((r) => ({
      ...r,
      id: encodePublicId('site', r.id),
      companyId: encodePublicId('company', r.companyId),
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch sites' } });
  }
};

exports.createSite = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req) || (req.body.companyId ? decodePublicId(req.body.companyId) : 1);
    const site = await siteRepo.create({ ...req.body, companyId: effectiveCompanyId });
    const data = {
      ...site,
      id: encodePublicId('site', site.id),
      companyId: encodePublicId('company', site.companyId),
    };
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('CREATE SITE ERROR:', err);
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create site', details: err.message } });
  }
};

// ==========================================
// 3. EMPLOYEES
// ==========================================
exports.getEmployees = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    const effectiveSiteId = getEffectiveSiteId(req);

    const rows = await employeeRepo.findAll({
      companyId: effectiveCompanyId,
      siteId: effectiveSiteId,
      search: req.query.search,
    });

    const data = rows.map((r) => ({
      ...r,
      id: encodePublicId('employee', r.id),
      companyId: encodePublicId('company', r.companyId),
      siteId: encodePublicId('site', r.siteId),
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch employees' } });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req) || (req.body.companyId ? decodePublicId(req.body.companyId) : 1);
    const internalSiteId = req.body.siteId ? decodePublicId(req.body.siteId) : 1;
    const emp = await employeeRepo.create({ ...req.body, companyId: effectiveCompanyId, siteId: internalSiteId });
    const data = {
      ...emp,
      id: encodePublicId('employee', emp.id),
    };
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create employee' } });
  }
};

// ==========================================
// 4. VISITOR TYPES (visitor_masters)
// ==========================================
exports.getVisitorTypes = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    let query = 'SELECT id, visitor_code AS code, visitor_desc AS label, active FROM smartgate.visitor_masters WHERE active = true';
    const params = [];
    if (effectiveCompanyId) {
      query += ' AND comp_id = $1';
      params.push(effectiveCompanyId);
    }
    query += ' ORDER BY id ASC';
    const result = await pool.query(query, params);
    const data = result.rows.map((r) => ({
      ...r,
      id: encodePublicId('ptype', r.id),
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch visitor types' } });
  }
};

// ==========================================
// 5. GATE PASSES (pass_details)
// ==========================================
exports.getGatePasses = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    const rows = await gatePassRepo.findAll({
      companyId: effectiveCompanyId,
      status: req.query.status,
    });

    const data = rows.map((r) => ({
      ...r,
      id: encodePublicId('pass', r.id),
      companyId: encodePublicId('company', r.companyId),
      siteId: encodePublicId('site', r.siteId),
      assignedToVisitId: r.assignedToVisitId ? encodePublicId('visitor', r.assignedToVisitId) : null,
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch gate passes' } });
  }
};

exports.createGatePass = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req) || (req.body.companyId ? decodePublicId(req.body.companyId) : 1);
    const internalSiteId = req.body.siteId ? decodePublicId(req.body.siteId) : 1;
    const pass = await gatePassRepo.create({ ...req.body, companyId: effectiveCompanyId, siteId: internalSiteId });
    const data = {
      ...pass,
      id: encodePublicId('pass', pass.id),
    };
    res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('CREATE GATE PASS ERROR:', err);
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create gate pass', details: err.message } });
  }
};

exports.updateGatePass = async (req, res) => {
  try {
    const internalPassId = decodePublicId(req.params.publicId);
    if (!internalPassId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid gate pass ID' } });
    }

    const pass = await gatePassRepo.update(internalPassId, req.body);
    if (!pass) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Gate pass not found' } });
    }

    const data = {
      ...pass,
      id: encodePublicId('pass', pass.id),
    };
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update gate pass' } });
  }
};

exports.deleteGatePass = async (req, res) => {
  try {
    const internalPassId = decodePublicId(req.params.publicId);
    if (!internalPassId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid gate pass ID' } });
    }
    const assignedCheck = await pool.query(
      `SELECT id FROM smartgate.visitor_details WHERE pass_id = $1 AND status = 'Checked In' LIMIT 1`,
      [internalPassId]
    );
    if (assignedCheck.rows.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Cannot delete a gate pass currently assigned to a checked-in visitor.' } });
    }
    await pool.query('DELETE FROM smartgate.pass_details WHERE id = $1', [internalPassId]);
    res.status(200).json({ success: true, message: 'Gate pass deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_FAILED', message: 'Failed to delete gate pass' } });
  }
};
