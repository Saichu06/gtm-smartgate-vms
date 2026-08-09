/**
 * Tenant Isolation & Scope Middleware
 * Enforces company and site restrictions based on the authenticated identity.
 * Does NOT trust raw req.body.companyId or req.query.companyId.
 */
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
    });
  }

  const { role, companyId, siteId } = req.user;

  // Super Admin has global scope
  if (role === 'SUPER_ADMIN') {
    req.tenant = {
      companyId: req.query.companyId || req.body.companyId || null,
      siteId: req.query.siteId || req.body.siteId || null,
      isGlobal: true,
    };
    return next();
  }

  // Kiosk mode token scope
  if (role === 'KIOSK') {
    req.tenant = {
      companyId: companyId,
      siteId: null,
      isKiosk: true,
    };
    return next();
  }

  // Corporate Admin scope — restricted to their assigned company
  if (role === 'CORP_ADMIN') {
    req.tenant = {
      companyId: companyId,
      siteId: req.query.siteId || req.body.siteId || null,
      isCompanyScoped: true,
    };
    return next();
  }

  // Security Desk / Gate User — restricted to company AND assigned site
  if (role === 'SECURITY_DESK' || role === 'GATE_USER') {
    req.tenant = {
      companyId: companyId,
      siteId: siteId,
      isSiteScoped: true,
    };
    return next();
  }

  next();
};
