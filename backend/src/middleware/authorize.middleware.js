const AuthorizationService = require('../authorization/authorization.service');

/**
 * Authorization Guard Middleware
 * Usage:
 * authorize({ permissions: ['VISITOR_READ'] })
 * authorize({ roles: ['CORP_ADMIN', 'SUPER_ADMIN'] })
 */
exports.authorize = ({ roles = [], permissions = [] } = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHENTICATED', message: 'Authentication required' },
      });
    }

    const { role } = req.user;

    // Check Role match
    if (roles.length > 0 && !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action',
        },
      });
    }

    // Check Permission match
    if (permissions.length > 0) {
      const hasAll = permissions.every((p) => AuthorizationService.hasPermission(role, p));
      if (!hasAll) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to perform this action',
          },
        });
      }
    }

    next();
  };
};
