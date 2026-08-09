/**
 * Audit Log Controller — reads from visitor_trans table
 */
const pool = require('../config/database');
const { encodePublicId, decodePublicId } = require('../services/id.service');

exports.getAuditLogs = async (req, res) => {
  try {
    const internalCompanyId = req.query.companyId ? decodePublicId(req.query.companyId) : null;
    const limit = parseInt(req.query.limit || '200', 10);

    let query = `
      SELECT
        vt.id,
        vt.visitor_name  AS "visitorName",
        vt.mobile_no     AS phone,
        vt.coming_from   AS company,
        vt.person_to_meet AS host,
        vt.visitors_type AS "visitorType",
        vt.checkin_date  AS "checkinDate",
        vt.checkout_date AS "checkoutDate",
        vt.status,
        vt.comp_id       AS "companyId",
        p.pass_code      AS "gatePass"
      FROM smartgate.visitor_trans vt
      LEFT JOIN smartgate.pass_details p ON vt.pass_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let pIdx = 1;

    if (internalCompanyId) {
      query += ` AND vt.comp_id = $${pIdx++}`;
      params.push(internalCompanyId);
    }
    if (req.query.status) {
      query += ` AND vt.status = $${pIdx++}`;
      params.push(req.query.status);
    }

    query += ` ORDER BY vt.id DESC LIMIT $${pIdx}`;
    params.push(limit);

    const result = await pool.query(query, params);
    const data = result.rows.map(r => ({
      ...r,
      companyId: r.companyId ? encodePublicId('company', r.companyId) : null,
    }));

    res.status(200).json({ success: true, data, total: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs', error: err.message });
  }
};
