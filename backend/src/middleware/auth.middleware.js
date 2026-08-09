const jwtService = require('../services/jwt.service');

/**
 * Authentication Middleware
 * Reads Authorization header (Bearer token), verifies JWT, and attaches req.user
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Authentication token is required.',
      },
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    let decoded;
    // Check if it's a kiosk token or regular access token
    try {
      decoded = jwtService.verifyAccessToken(token);
    } catch (err) {
      // Fallback to checking kiosk token
      try {
        decoded = jwtService.verifyKioskToken(token);
      } catch (kioskErr) {
        throw err;
      }
    }

    req.user = {
      id: decoded.sub,
      role: decoded.role,
      companyId: decoded.companyId || null,
      siteId: decoded.siteId || null,
      firstLoginRequired: decoded.firstLoginRequired || false,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHENTICATED',
        message: 'Invalid or expired authentication token.',
      },
    });
  }
};
