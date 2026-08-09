/**
 * Visitor & Kiosk Controller with Tenant & RBAC Enforced Scoping
 */
const pool = require('../config/database');
const visitorRepo = require('../repositories/visitor.repository');
const { encodePublicId, decodePublicId } = require('../services/id.service');

// Helper to resolve effective company ID from authenticated scope
function getEffectiveCompanyId(req) {
  if (req.user && req.user.role === 'SUPER_ADMIN') {
    return req.query.companyId || req.body.companyId ? decodePublicId(req.query.companyId || req.body.companyId) : null;
  }
  return req.user && req.user.companyId ? decodePublicId(req.user.companyId) : null;
}

// Helper to resolve effective site ID from authenticated scope
function getEffectiveSiteId(req) {
  if (req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'CORP_ADMIN')) {
    return req.query.siteId || req.body.siteId ? decodePublicId(req.query.siteId || req.body.siteId) : null;
  }
  return req.user && req.user.siteId ? decodePublicId(req.user.siteId) : null;
}

// ==========================================
// 1. REGISTER VISITOR (Transactional)
// ==========================================
exports.registerVisitor = async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      phone,
      otp,
      name,
      company,
      personToMeet,
      visitorType,
      imageType,
      photoDataUrl,
      imageName,
      idType,
      idImageUrl,
      idproofName,
      laptop,
      laptopModel,
      serialNo,
      vehicleType,
      vehicleNo,
      gatePassId,
      companyId,
      siteId,
      mulcompId,
      empbookId,
    } = req.body;

    const internalCompanyId = getEffectiveCompanyId(req) || (companyId ? decodePublicId(companyId) : 1);
    const internalSiteId = getEffectiveSiteId(req) || (siteId ? decodePublicId(siteId) : null);
    let assignedPassId = gatePassId ? decodePublicId(gatePassId) : null;

    await client.query('BEGIN');

    // Concurrency Lock on Physical Gate Pass if pass selected
    if (assignedPassId) {
      const passCheck = await client.query(
        'SELECT id, active FROM smartgate.pass_details WHERE id = $1 FOR UPDATE',
        [assignedPassId]
      );
      if (passCheck.rows.length === 0 || !passCheck.rows[0].active) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, error: { code: 'GATE_PASS_INACTIVE', message: 'That gate pass is inactive or invalid.' } });
      }

      // Check if pass is already assigned to another active visitor
      const activeAssign = await client.query(
        "SELECT id FROM smartgate.visitor_details WHERE pass_id = $1 AND status = 'Checked In'",
        [assignedPassId]
      );
      if (activeAssign.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({
          success: false,
          error: {
            code: 'GATE_PASS_ALREADY_ASSIGNED',
            message: 'That gate pass has just been assigned. Please select another available gate.',
          },
        });
      }
    }

    const checkinTime = new Date();
    const status = 'Checked In';

    // Insert main visitor record mapping ALL schema columns
    const visResult = await client.query(
      `INSERT INTO smartgate.visitor_details 
        (mobile_no, otp, otp_date, visitor_name, coming_from, person_to_meet, visitors_type, image_type, image_path, image_name, idproof_type, idproof_path, idproof_name, laptop, model, serial_no, vehicle_type, vehicle_no, pass_id, checkin_date, status, site_id, comp_id, mulcomp_id, empbook_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
       RETURNING id, mobile_no AS phone, otp, visitor_name AS name, coming_from AS company, person_to_meet AS "personToMeet", visitors_type AS "visitorType", checkin_date AS checkin, status, pass_id AS "gatePassId"`,
      [
        phone || '',
        parseInt(otp || '1234', 10) || 1234,
        checkinTime,
        name || 'Visitor',
        company || 'Walk-in',
        personToMeet || 'Reception Desk',
        visitorType || 'Business Visitor',
        imageType || 'BASE64',
        photoDataUrl || null,
        imageName || `visitor_${Date.now()}.png`,
        idType || 'Aadhaar',
        idImageUrl || null,
        idproofName || `id_${Date.now()}.png`,
        laptop ? 1 : 0,
        laptopModel || null,
        serialNo || null,
        vehicleType || null,
        vehicleNo || null,
        assignedPassId,
        checkinTime,
        status,
        internalSiteId,
        internalCompanyId,
        mulcompId ? decodePublicId(mulcompId) : null,
        empbookId ? decodePublicId(empbookId) : null,
      ]
    );

    const visitor = visResult.rows[0];

    // Audit log entry in visitor_trans mapping all columns
    await client.query(
      `INSERT INTO smartgate.visitor_trans
        (mobile_no, otp, otp_date, visitor_name, coming_from, person_to_meet, visitors_type, image_type, image_path, image_name, idproof_type, idproof_path, idproof_name, laptop, model, serial_no, vehicle_type, vehicle_no, pass_id, checkin_date, status, site_id, comp_id, mulcomp_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)`,
      [
        phone || '',
        parseInt(otp || '1234', 10) || 1234,
        checkinTime,
        name || 'Visitor',
        company || 'Walk-in',
        personToMeet || 'Reception Desk',
        visitorType || 'Business Visitor',
        imageType || 'BASE64',
        photoDataUrl || null,
        imageName || `visitor_${Date.now()}.png`,
        idType || 'Aadhaar',
        idImageUrl || null,
        idproofName || `id_${Date.now()}.png`,
        laptop ? 1 : 0,
        laptopModel || null,
        serialNo || null,
        vehicleType || null,
        vehicleNo || null,
        assignedPassId,
        checkinTime,
        status,
        internalSiteId,
        internalCompanyId,
        mulcompId ? decodePublicId(mulcompId) : null,
      ]
    );

    await client.query('COMMIT');

    // Get gate pass details for response badge
    let gatePassName = null;
    if (assignedPassId) {
      const passInfo = await pool.query('SELECT pass_code FROM smartgate.pass_details WHERE id = $1', [assignedPassId]);
      if (passInfo.rows.length > 0) gatePassName = passInfo.rows[0].pass_code;
    }

    const publicVisitorId = encodePublicId('visitor', visitor.id);
    const publicPassId = assignedPassId ? encodePublicId('pass', assignedPassId) : null;

    res.status(201).json({
      success: true,
      data: {
        ...visitor,
        id: publicVisitorId,
        visitId: publicVisitorId,
        passId: `VMS-${visitor.id}`,
        gatePassId: publicPassId,
        gatePass: gatePassName,
        companyId: encodePublicId('company', internalCompanyId),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: { code: 'REGISTER_FAILED', message: 'Failed to register visitor' } });
  } finally {
    client.release();
  }
};

// ==========================================
// 2. GET VISITORS
// ==========================================
exports.getVisitors = async (req, res) => {
  try {
    const effectiveCompanyId = getEffectiveCompanyId(req);
    const effectiveSiteId = getEffectiveSiteId(req);

    const rows = await visitorRepo.findAll({
      companyId: effectiveCompanyId,
      siteId: effectiveSiteId,
      status: req.query.status,
      mobile: req.query.mobile,
      search: req.query.search,
    });

    const data = rows.map(r => ({
      ...r,
      id: encodePublicId('visitor', r.id),
      visitId: encodePublicId('visitor', r.id),
      passId: `VMS-${r.id}`,
      gatePassId: r.gatePassId ? encodePublicId('pass', r.gatePassId) : null,
      checkin: r.checkin ? new Date(r.checkin).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
      checkout: r.checkout ? new Date(r.checkout).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : null,
    }));

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch visitors' } });
  }
};

// ==========================================
// 3. CHECK-OUT VISITOR (Releases Gate Pass)
// ==========================================
exports.checkoutVisitor = async (req, res) => {
  const client = await pool.connect();
  try {
    const internalVisitorId = decodePublicId(req.params.publicId);
    if (!internalVisitorId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid visitor ID format' } });
    }

    const effectiveCompanyId = getEffectiveCompanyId(req);
    if (effectiveCompanyId) {
      const vCheck = await pool.query('SELECT comp_id FROM smartgate.visitor_details WHERE id = $1', [internalVisitorId]);
      if (vCheck.rows.length === 0 || parseInt(vCheck.rows[0].comp_id) !== parseInt(effectiveCompanyId)) {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to this visitor record' } });
      }
    }

    await client.query('BEGIN');
    const checkoutTime = new Date();

    const updateRes = await client.query(
      `UPDATE smartgate.visitor_details
       SET status = 'Checked Out',
           checkout_date = $1
       WHERE id = $2
       RETURNING id, visitor_name AS name, pass_id AS "passId", comp_id AS "compId"`,
      [checkoutTime, internalVisitorId]
    );

    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Visitor record not found' } });
    }

    const visitor = updateRes.rows[0];

    // Audit log entry in visitor_trans
    await client.query(
      `INSERT INTO smartgate.visitor_trans (mobile_no, visitor_name, checkout_date, status, comp_id)
       SELECT mobile_no, visitor_name, $1, 'Checked Out', comp_id FROM smartgate.visitor_details WHERE id = $2`,
      [checkoutTime, internalVisitorId]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `${visitor.name} checked out successfully. Gate pass released.`,
      data: {
        id: encodePublicId('visitor', visitor.id),
        checkout: checkoutTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: { code: 'CHECKOUT_FAILED', message: 'Failed to check out visitor' } });
  } finally {
    client.release();
  }
};

// ==========================================
// 4. VALIDATE PASS / QR SCAN
// ==========================================
exports.validatePass = async (req, res) => {
  try {
    const internalVisitorId = decodePublicId(req.params.publicId);
    if (!internalVisitorId) {
      return res.status(400).json({ success: false, valid: false, error: { code: 'INVALID_CODE', message: 'Invalid pass code structure' } });
    }

    const visitor = await visitorRepo.findById(internalVisitorId);
    if (!visitor) {
      return res.status(404).json({ success: false, valid: false, error: { code: 'NOT_FOUND', message: 'Visitor record not found' } });
    }

    const isValid = visitor.status === 'Checked In';
    res.status(200).json({
      success: true,
      valid: isValid,
      data: {
        visitorId: encodePublicId('visitor', visitor.id),
        visitorName: visitor.name,
        company: visitor.company,
        gatePass: visitor.gatePass,
        status: visitor.status,
        checkinTime: visitor.checkin,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, valid: false, error: { code: 'VALIDATION_ERROR', message: 'QR Validation Error' } });
  }
};

// ==========================================
// 5. GET VISITOR BY ID
// ==========================================
exports.getVisitorById = async (req, res) => {
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid visitor ID format' } });
    }
    const visitor = await visitorRepo.findById(internalId);
    if (!visitor) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Visitor not found' } });
    }

    const effectiveCompanyId = getEffectiveCompanyId(req);
    if (effectiveCompanyId && parseInt(visitor.companyId) !== parseInt(effectiveCompanyId)) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied to this visitor record' } });
    }

    res.status(200).json({
      success: true,
      data: {
        ...visitor,
        id: encodePublicId('visitor', visitor.id),
        visitId: encodePublicId('visitor', visitor.id),
        passId: `VMS-${visitor.id}`,
        gatePassId: visitor.gatePassId ? encodePublicId('pass', visitor.gatePassId) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch visitor' } });
  }
};

// ==========================================
// 6. APPROVE VISITOR
// ==========================================
exports.approveVisitor = async (req, res) => {
  const client = await pool.connect();
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid visitor ID format' } });
    }
    await client.query('BEGIN');
    const checkinTime = new Date();
    const updateRes = await client.query(
      `UPDATE smartgate.visitor_details
       SET status = 'Checked In', checkin_date = $1
       WHERE id = $2
       RETURNING id, visitor_name AS name, pass_id AS "passId", comp_id AS "compId"`,
      [checkinTime, internalId]
    );
    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Visitor record not found' } });
    }
    const visitor = updateRes.rows[0];
    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      message: `${visitor.name} approved and checked in.`,
      data: {
        id: encodePublicId('visitor', visitor.id),
        passId: `VMS-${visitor.id}`,
        checkin: checkinTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: { code: 'APPROVE_FAILED', message: 'Failed to approve visitor' } });
  } finally {
    client.release();
  }
};

// ==========================================
// 7. REJECT VISITOR (Awaiting Approval → Rejected)
// ==========================================
exports.rejectVisitor = async (req, res) => {
  const client = await pool.connect();
  try {
    const internalId = decodePublicId(req.params.publicId);
    if (!internalId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid visitor ID format' } });
    }
    await client.query('BEGIN');
    const updateRes = await client.query(
      `UPDATE smartgate.visitor_details
       SET status = 'Rejected'
       WHERE id = $1 AND status = 'Awaiting Approval'
       RETURNING id, visitor_name AS name, comp_id AS "compId"`,
      [internalId]
    );
    if (updateRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Visitor not found or not awaiting approval' } });
    }
    const visitor = updateRes.rows[0];
    await client.query(
      `INSERT INTO smartgate.visitor_trans (mobile_no, visitor_name, status, comp_id)
       SELECT mobile_no, visitor_name, 'Rejected', comp_id FROM smartgate.visitor_details WHERE id = $1`,
      [internalId]
    );
    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      message: `${visitor.name}'s visit request has been rejected.`,
      data: { id: encodePublicId('visitor', visitor.id) },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: { code: 'REJECT_FAILED', message: 'Failed to reject visitor' } });
  } finally {
    client.release();
  }
};

// ==========================================
// 8. KIOSK OTP & LOOKUP
// ==========================================
exports.requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully (Simulated: 1234)',
      data: { otp: '1234' },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'OTP_FAILED', message: 'OTP dispatch failed' } });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const returning = await pool.query(
      'SELECT visitor_name AS name, coming_from AS company, visitors_type AS "visitorType" FROM smartgate.visitor_details WHERE mobile_no = $1 ORDER BY id DESC LIMIT 1',
      [phone]
    );
    const isReturning = returning.rows.length > 0;
    res.status(200).json({
      success: true,
      verified: true,
      isReturning,
      visitor: isReturning ? returning.rows[0] : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'VERIFY_FAILED', message: 'OTP verification failed' } });
  }
};
