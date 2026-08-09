/**
 * Site Repository — Data Access Layer for sites
 */
const pool = require('../config/database');

exports.findAll = async (companyId) => {
  let query = 'SELECT id, site_code AS code, site_name AS name, city, state, comp_id AS "companyId" FROM smartgate.sites WHERE is_deleted = false';
  const params = [];
  if (companyId) {
    query += ' AND comp_id = $1';
    params.push(companyId);
  }
  query += ' ORDER BY id ASC';
  const result = await pool.query(query, params);
  return result.rows;
};

exports.findById = async (id) => {
  const result = await pool.query(
    'SELECT id, site_code AS code, site_name AS name, city, state, comp_id AS "companyId" FROM smartgate.sites WHERE id = $1 AND is_deleted = false',
    [id]
  );
  return result.rows[0] || null;
};

exports.create = async ({ code, name, address, city, state, pincode, companyId }) => {
  const result = await pool.query(
    `INSERT INTO smartgate.sites (site_code, site_name, address1, city, state, pincode, comp_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, site_code AS code, site_name AS name, comp_id AS "companyId"`,
    [code || 'GATE-A', name, address || '', city || '', state || '', pincode || 0, companyId || 1]
  );
  return result.rows[0];
};
