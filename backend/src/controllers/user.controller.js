const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { encodePublicId, decodePublicId } = require('../services/id.service');

function getCompanyId(req) {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return req.query.companyId || req.body.companyId ? decodePublicId(req.query.companyId || req.body.companyId) : null;
  }
  return req.user && req.user.companyId ? decodePublicId(req.user.companyId) : null;
}

exports.getAllUsers = async (req, res) => {
  try {
    const rawCompanyId = req.query.companyId || req.headers['x-company-id'];
    const companyId = getCompanyId(req) || (rawCompanyId ? decodePublicId(rawCompanyId) : null);

    let query = `
      SELECT 
        u.id, 
        u.user_code AS "userCode", 
        u.user_name AS name, 
        u.email, 
        u.mobile_no AS phone,
        u.active, 
        u.first_login AS "firstLogin",
        u.comp_id AS "companyId", 
        u.site_id AS "siteId",
        u.role_id AS "roleId",
        r.code AS "roleCode",
        r.name AS role,
        s.site_name AS site
      FROM smartgate.user_details u
      JOIN smartgate.roleinfos r ON u.role_id = r.id
      LEFT JOIN smartgate.sites s ON u.site_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (companyId) {
      query += ` AND u.comp_id = $1`;
      params.push(companyId);
    }
    query += ' ORDER BY u.id ASC';

    const result = await pool.query(query, params);
    const data = result.rows.map((r) => ({
      ...r,
      id: encodePublicId('user', r.id),
      companyId: r.companyId ? encodePublicId('company', r.companyId) : null,
      siteId: r.siteId ? encodePublicId('site', r.siteId) : null,
      status: r.active ? 'Active' : 'Inactive',
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch users' } });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, phone, roleId, roleCode, password, siteId } = req.body;
    const companyId = getCompanyId(req) || (req.body.companyId ? decodePublicId(req.body.companyId) : 1);
    const internalSiteId = siteId ? decodePublicId(siteId) : null;

    let targetRoleId = roleId;
    if (!targetRoleId && roleCode) {
      const rRes = await pool.query('SELECT id FROM smartgate.roleinfos WHERE code = $1 LIMIT 1', [roleCode]);
      if (rRes.rows.length > 0) targetRoleId = rRes.rows[0].id;
    }
    if (!targetRoleId) targetRoleId = 4; // Default to GATE USER (GU)

    const rawPassword = password || 'User@2026';
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    const userCode = `USR-${Date.now().toString().slice(-4)}`;

    const result = await pool.query(
      `INSERT INTO smartgate.user_details
        (user_code, user_name, email, mobile_no, password, role_id, active, first_login, site_id, comp_id)
       VALUES ($1, $2, $3, $4, $5, $6, true, true, $7, $8)
       RETURNING id, user_code AS "userCode", user_name AS name, email, active`,
      [userCode, name, email, phone || '', passwordHash, targetRoleId, internalSiteId, companyId]
    );

    const newUser = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        ...newUser,
        id: encodePublicId('user', newUser.id),
        status: 'Active',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CREATE_FAILED', message: 'Failed to create user' } });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid user ID' } });
    }

    const { name, email, phone, roleId, roleCode, siteId, active } = req.body;
    let targetRoleId = roleId;
    if (!targetRoleId && roleCode) {
      const rRes = await pool.query('SELECT id FROM smartgate.roleinfos WHERE code = $1 LIMIT 1', [roleCode]);
      if (rRes.rows.length > 0) targetRoleId = rRes.rows[0].id;
    }

    const internalSiteId = siteId ? decodePublicId(siteId) : null;

    const result = await pool.query(
      `UPDATE smartgate.user_details
       SET user_name = COALESCE($1, user_name),
           email = COALESCE($2, email),
           mobile_no = COALESCE($3, mobile_no),
           role_id = COALESCE($4, role_id),
           site_id = COALESCE($5, site_id),
           active = COALESCE($6, active)
       WHERE id = $7
       RETURNING id, user_code AS "userCode", user_name AS name, email, active`,
      [name, email, phone, targetRoleId, internalSiteId, active, internalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const updated = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        ...updated,
        id: encodePublicId('user', updated.id),
        status: updated.active ? 'Active' : 'Inactive',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_FAILED', message: 'Failed to update user' } });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid user ID' } });
    }

    const { active } = req.body;

    const result = await pool.query(
      `UPDATE smartgate.user_details
       SET active = $1
       WHERE id = $2
       RETURNING id, user_code AS "userCode", user_name AS name, active`,
      [active, internalId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }

    const updated = result.rows[0];
    res.status(200).json({
      success: true,
      data: {
        ...updated,
        id: encodePublicId('user', updated.id),
        status: updated.active ? 'Active' : 'Inactive',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'STATUS_UPDATE_FAILED', message: 'Failed to update status' } });
  }
};
