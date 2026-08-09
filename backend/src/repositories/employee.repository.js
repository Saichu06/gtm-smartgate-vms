/**
 * Employee Repository — Data Access Layer for employee_details
 */
const pool = require('../config/database');

exports.findAll = async ({ companyId, siteId, search }) => {
  let query = `
    SELECT 
      e.id, 
      e.employee_code AS "employeeCode", 
      e.employee_name AS name, 
      e.email, 
      e.mobile_no AS phone, 
      e.designation, 
      e.department AS dept, 
      e.status, 
      e.comp_id AS "companyId", 
      e.site_id AS "siteId",
      s.site_name AS site
    FROM smartgate.employee_details e
    LEFT JOIN smartgate.sites s ON e.site_id = s.id
    WHERE e.active = true
  `;
  const params = [];
  let paramIndex = 1;

  if (companyId) {
    query += ` AND e.comp_id = $${paramIndex++}`;
    params.push(companyId);
  }
  if (siteId) {
    query += ` AND e.site_id = $${paramIndex++}`;
    params.push(siteId);
  }
  if (search) {
    query += ` AND (LOWER(e.employee_name) LIKE $${paramIndex} OR LOWER(e.department) LIKE $${paramIndex} OR LOWER(e.designation) LIKE $${paramIndex} OR LOWER(e.email) LIKE $${paramIndex})`;
    params.push(`%${search.toLowerCase()}%`);
  }

  query += ' ORDER BY e.id ASC';
  const result = await pool.query(query, params);
  return result.rows;
};

exports.create = async ({ code, name, email, phone, designation, department, companyId, siteId }) => {
  const result = await pool.query(
    `INSERT INTO smartgate.employee_details 
      (employee_code, employee_name, email, mobile_no, designation, department, comp_id, site_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, employee_code AS "employeeCode", employee_name AS name, email, department AS dept`,
    [code || `EMP-${Date.now()}`, name, email, phone, designation || 'Staff', department || 'General', companyId || 1, siteId || 1]
  );
  return result.rows[0];
};
