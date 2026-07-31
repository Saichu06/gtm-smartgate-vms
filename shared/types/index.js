/**
 * Shared Frontend & Backend Type Definitions Placeholder
 * To be converted to TypeScript types/interfaces by engineering team.
 */

/**
 * @typedef {Object} Customer
 * @property {string}  id
 * @property {string}  name
 * @property {string}  code
 * @property {string}  email
 * @property {string}  phone
 * @property {string}  subdomain
 * @property {'Starter'|'Professional'|'Enterprise'} planTier
 * @property {'Active'|'Trial'|'Suspended'|'Expired'}  status
 * @property {string}  createdAt
 */

/**
 * @typedef {Object} PlatformUser
 * @property {string}  id
 * @property {string}  fullName
 * @property {string}  email
 * @property {string}  roleId
 * @property {'Active'|'Inactive'} status
 * @property {string}  createdAt
 */

/**
 * @typedef {Object} AuditLog
 * @property {string}  id
 * @property {string}  timestamp
 * @property {string}  actor
 * @property {string}  action
 * @property {string}  target
 * @property {'Info'|'Warning'|'Critical'} severity
 * @property {string}  ipAddress
 */

module.exports = {};
