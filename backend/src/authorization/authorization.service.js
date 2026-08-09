const { ROLE_PERMISSIONS } = require('./permission.constants');

class AuthorizationService {
  static hasPermission(role, permission) {
    if (!role) return false;
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  static canAccessCompany(user, targetCompanyId) {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    if (!user.companyId || !targetCompanyId) return false;
    return user.companyId === targetCompanyId;
  }

  static canAccessSite(user, targetSiteId) {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'CORP_ADMIN') return true;
    if (!user.siteId || !targetSiteId) return false;
    return user.siteId === targetSiteId;
  }
}

module.exports = AuthorizationService;
