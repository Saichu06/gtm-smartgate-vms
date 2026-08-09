const pool = require('../config/database');
const { encodePublicId, decodePublicId } = require('../services/id.service');

function getEffectiveCompanyId(req) {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return req.query.companyId ? decodePublicId(req.query.companyId) : null;
  }
  return req.user && req.user.companyId ? decodePublicId(req.user.companyId) : null;
}

function getDateRangeCondition(range, colName = 'checkin_date') {
  if (!range) return '';
  const now = new Date();
  let startDate = new Date();

  switch (range.toLowerCase()) {
    case 'today':
      startDate.setHours(0, 0, 0, 0);
      break;
    case '7d':
    case '7days':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
    case '30days':
      startDate.setDate(now.getDate() - 30);
      break;
    case '3m':
    case '3months':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '1y':
    case '1year':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return '';
  }

  return ` AND ${colName} >= '${startDate.toISOString()}'`;
}

exports.getMetrics = async (req, res) => {
  try {
    const companyId = getEffectiveCompanyId(req);
    const range = req.query.range || 'today';
    const dateCond = getDateRangeCondition(range, 'v.checkin_date');

    const params = [];
    let compCond = '';
    if (companyId) {
      compCond = ' AND v.comp_id = $1';
      params.push(companyId);
    }

    // 1. Overall Status Counts
    const statusCounts = await pool.query(
      `SELECT 
        COUNT(*) AS "totalVisitors",
        COUNT(CASE WHEN v.status = 'Checked In' THEN 1 END) AS "currentlyInside",
        COUNT(CASE WHEN v.status = 'Checked Out' THEN 1 END) AS "checkedOut",
        COUNT(CASE WHEN v.status = 'Awaiting Approval' THEN 1 END) AS "pending",
        COUNT(CASE WHEN v.status = 'Rejected' THEN 1 END) AS "rejected"
       FROM smartgate.visitor_details v
       WHERE 1=1 ${compCond} ${dateCond}`,
      params
    );

    // 2. Visitor Type Distribution
    const typeCounts = await pool.query(
      `SELECT visitors_type AS type, COUNT(*) AS count
       FROM smartgate.visitor_details v
       WHERE 1=1 ${compCond} ${dateCond}
       GROUP BY visitors_type`,
      params
    );

    // 3. Top Hosts (person_to_meet)
    const topHosts = await pool.query(
      `SELECT person_to_meet AS host, COUNT(*) AS count
       FROM smartgate.visitor_details v
       WHERE 1=1 ${compCond} ${dateCond}
       GROUP BY person_to_meet
       ORDER BY count DESC
       LIMIT 5`,
      params
    );

    // 4. Gate Traffic
    const gateTraffic = await pool.query(
      `SELECT p.pass_code AS gate, COUNT(v.id) AS count
       FROM smartgate.visitor_details v
       JOIN smartgate.pass_details p ON v.pass_id = p.id
       WHERE 1=1 ${compCond} ${dateCond}
       GROUP BY p.pass_code
       ORDER BY count DESC`,
      params
    );

    // 5. Site Traffic
    const siteTraffic = await pool.query(
      `SELECT s.site_name AS site, COUNT(v.id) AS count
       FROM smartgate.visitor_details v
       JOIN smartgate.sites s ON v.site_id = s.id
       WHERE 1=1 ${compCond} ${dateCond}
       GROUP BY s.site_name
       ORDER BY count DESC`,
      params
    );

    const summary = statusCounts.rows[0] || { totalVisitors: 0, currentlyInside: 0, checkedOut: 0, pending: 0, rejected: 0 };

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVisitors: parseInt(summary.totalVisitors || 0),
          currentlyInside: parseInt(summary.currentlyInside || 0),
          checkedOut: parseInt(summary.checkedOut || 0),
          pending: parseInt(summary.pending || 0),
          rejected: parseInt(summary.rejected || 0),
        },
        typeDistribution: typeCounts.rows.map(r => ({ type: r.type || 'General', count: parseInt(r.count) })),
        topHosts: topHosts.rows.map(r => ({ host: r.host || 'Reception', count: parseInt(r.count) })),
        gateTraffic: gateTraffic.rows.map(r => ({ gate: r.gate, count: parseInt(r.count) })),
        siteTraffic: siteTraffic.rows.map(r => ({ site: r.site, count: parseInt(r.count) })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'METRICS_FAILED', message: 'Failed to aggregate report metrics' } });
  }
};

exports.getSuperAdminMetrics = async (req, res) => {
  try {
    const orgsRes = await pool.query(`SELECT COUNT(*) FROM smartgate.company_details WHERE is_deleted = false`);
    const sitesRes = await pool.query(`SELECT COUNT(*) FROM smartgate.sites WHERE is_deleted = false`);
    const usersRes = await pool.query(`SELECT COUNT(*) FROM smartgate.user_details WHERE active = true`);
    const visitorsRes = await pool.query(`SELECT COUNT(*) FROM smartgate.visitor_details`);

    res.status(200).json({
      success: true,
      data: {
        activeOrganizations: parseInt(orgsRes.rows[0].count),
        totalSites: parseInt(sitesRes.rows[0].count),
        platformUsers: parseInt(usersRes.rows[0].count),
        totalVisitorsRecorded: parseInt(visitorsRes.rows[0].count),
        systemHealth: '100% Operational (PostgreSQL Connected)',
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'METRICS_FAILED', message: 'Failed to aggregate superadmin metrics' } });
  }
};
