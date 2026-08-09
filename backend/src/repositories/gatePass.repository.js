/**
 * Gate Pass Repository — Data Access Layer for pass_details
 */
const pool = require('../config/database');

exports.findAll = async ({ companyId, status }) => {
  let query = `
    SELECT 
      p.id, 
      p.pass_code AS name, 
      p.pass_desc AS description, 
      p.info1 AS gate, 
      p.active, 
      p.comp_id AS "companyId", 
      p.site_id AS "siteId",
      CASE 
        WHEN p.active = false THEN 'inactive'
        WHEN EXISTS (SELECT 1 FROM smartgate.visitor_details v WHERE v.pass_id = p.id AND v.status = 'Checked In') THEN 'assigned'
        ELSE 'available'
      END AS status,
      (SELECT v.visitor_name FROM smartgate.visitor_details v WHERE v.pass_id = p.id AND v.status = 'Checked In' ORDER BY v.id DESC LIMIT 1) AS "assignedToName",
      (SELECT v.id FROM smartgate.visitor_details v WHERE v.pass_id = p.id AND v.status = 'Checked In' ORDER BY v.id DESC LIMIT 1) AS "assignedToVisitId",
      (SELECT v.checkin_date FROM smartgate.visitor_details v WHERE v.pass_id = p.id AND v.status = 'Checked In' ORDER BY v.id DESC LIMIT 1) AS "assignedAt"
    FROM smartgate.pass_details p
    WHERE 1=1
  `;
  const params = [];
  let paramIdx = 1;

  if (companyId) {
    query += ` AND p.comp_id = $${paramIdx++}`;
    params.push(companyId);
  }

  query += ' ORDER BY p.id ASC';
  const result = await pool.query(query, params);

  let rows = result.rows;
  if (status) {
    rows = rows.filter(r => r.status === status);
  }
  return rows;
};

exports.create = async ({ name, gate, info2, passcategoryId, companyId, siteId }) => {
  const result = await pool.query(
    `INSERT INTO smartgate.pass_details (pass_code, pass_desc, passcategory_id, info1, info2, active, comp_id, site_id)
     VALUES ($1, $2, $3, $4, $5, true, $6, $7)
     RETURNING id, pass_code AS name, info1 AS gate, active`,
    [name, name, passcategoryId || 1, gate || 'Gate A', info2 || 'General Gate Pass', companyId || 1, siteId || 1]
  );
  return result.rows[0];
};

exports.update = async (id, { name, gate, active }) => {
  const result = await pool.query(
    `UPDATE smartgate.pass_details
     SET pass_code = COALESCE($1, pass_code),
         info1 = COALESCE($2, info1),
         active = COALESCE($3, active)
     WHERE id = $4
     RETURNING id, pass_code AS name, info1 AS gate, active`,
    [name, gate, active, id]
  );
  return result.rows[0] || null;
};
