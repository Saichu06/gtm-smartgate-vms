/**
 * Visitor Repository — Data Access Layer for visitor_details & visitor_trans
 */
const pool = require('../config/database');

exports.findAll = async ({ companyId, siteId, status, search, mobile }) => {
  let query = `
    SELECT 
      v.id,
      v.mobile_no AS phone,
      v.otp,
      v.otp_date AS "otpDate",
      v.visitor_name AS name,
      v.coming_from AS company,
      v.person_to_meet AS host,
      v.visitors_type AS type,
      v.image_type AS "imageType",
      v.image_path AS photo,
      v.image_name AS "imageName",
      v.idproof_type AS "idType",
      v.idproof_path AS "idImageUrl",
      v.idproof_name AS "idproofName",
      v.laptop,
      v.model AS "laptopModel",
      v.serial_no AS "serialNo",
      v.vehicle_type AS "vehicleType",
      v.vehicle_no AS "vehicleNo",
      v.checkin_date AS checkin,
      v.checkout_date AS checkout,
      v.checkin_date AS timestamp,
      v.status,
      v.site_id AS "siteId",
      v.comp_id AS "companyId",
      v.mulcomp_id AS "mulcompId",
      v.empbook_id AS "empbookId",
      p.id AS "gatePassId",
      p.pass_code AS "gatePass",
      s.site_name AS site
    FROM smartgate.visitor_details v
    LEFT JOIN smartgate.pass_details p ON v.pass_id = p.id
    LEFT JOIN smartgate.sites s ON v.site_id = s.id
    WHERE 1=1
  `;
  const params = [];
  let pIdx = 1;

  if (companyId) {
    query += ` AND v.comp_id = $${pIdx++}`;
    params.push(companyId);
  }
  if (siteId) {
    query += ` AND v.site_id = $${pIdx++}`;
    params.push(siteId);
  }
  if (status) {
    query += ` AND v.status = $${pIdx++}`;
    params.push(status);
  }
  if (mobile) {
    query += ` AND v.mobile_no = $${pIdx++}`;
    params.push(mobile);
  }
  if (search) {
    query += ` AND (LOWER(v.visitor_name) LIKE $${pIdx} OR LOWER(v.coming_from) LIKE $${pIdx} OR LOWER(v.person_to_meet) LIKE $${pIdx})`;
    params.push(`%${search.toLowerCase()}%`);
  }

  query += ' ORDER BY v.id DESC';
  const result = await pool.query(query, params);
  return result.rows;
};

exports.findById = async (id) => {
  const result = await pool.query(
    `SELECT 
      v.id,
      v.mobile_no AS phone,
      v.otp,
      v.otp_date AS "otpDate",
      v.visitor_name AS name,
      v.coming_from AS company,
      v.person_to_meet AS host,
      v.visitors_type AS type,
      v.image_type AS "imageType",
      v.image_path AS photo,
      v.image_name AS "imageName",
      v.idproof_type AS "idType",
      v.idproof_path AS "idImageUrl",
      v.idproof_name AS "idproofName",
      v.laptop,
      v.model AS "laptopModel",
      v.serial_no AS "serialNo",
      v.vehicle_type AS "vehicleType",
      v.vehicle_no AS "vehicleNo",
      v.checkin_date AS checkin,
      v.checkout_date AS checkout,
      v.status,
      v.site_id AS "siteId",
      v.comp_id AS "companyId",
      v.mulcomp_id AS "mulcompId",
      v.empbook_id AS "empbookId",
      p.id AS "gatePassId",
      p.pass_code AS "gatePass",
      s.site_name AS site
    FROM smartgate.visitor_details v
    LEFT JOIN smartgate.pass_details p ON v.pass_id = p.id
    LEFT JOIN smartgate.sites s ON v.site_id = s.id
    WHERE v.id = $1`,
    [id]
  );
  return result.rows[0] || null;
};
