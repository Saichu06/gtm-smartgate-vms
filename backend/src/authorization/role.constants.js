/**
 * Role Constants & Scope Definitions
 */
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CORP_ADMIN: 'CORP_ADMIN',
  SECURITY_DESK: 'SECURITY_DESK',
  GATE_USER: 'GATE_USER',
  KIOSK: 'KIOSK',
};

const ROLE_IDS = {
  1: ROLES.SUPER_ADMIN,
  2: ROLES.CORP_ADMIN,
  3: ROLES.SECURITY_DESK,
  4: ROLES.GATE_USER,
};

module.exports = {
  ROLES,
  ROLE_IDS,
};
