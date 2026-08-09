const jwt = require('jsonwebtoken');

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'gtm_access_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'gtm_refresh_secret_key_2026';
const JWT_KIOSK_SECRET = process.env.JWT_KIOSK_SECRET || 'gtm_kiosk_secret_key_2026';

const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const JWT_KIOSK_EXPIRES_IN = process.env.JWT_KIOSK_EXPIRES_IN || '12h';

exports.generateAccessToken = (user) => {
  const payload = {
    sub: user.id, // Opaque Public User ID
    role: user.role,
    companyId: user.companyId || null,
    siteId: user.siteId || null,
    firstLoginRequired: user.firstLoginRequired || false,
  };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN });
};

exports.generateRefreshToken = (user) => {
  const payload = {
    sub: user.id,
    type: 'REFRESH',
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

exports.generateKioskToken = (companyPublicId) => {
  const payload = {
    sub: companyPublicId,
    role: 'KIOSK',
    companyId: companyPublicId,
  };
  return jwt.sign(payload, JWT_KIOSK_SECRET, { expiresIn: JWT_KIOSK_EXPIRES_IN });
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_ACCESS_SECRET);
};

exports.verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

exports.verifyKioskToken = (token) => {
  return jwt.verify(token, JWT_KIOSK_SECRET);
};
