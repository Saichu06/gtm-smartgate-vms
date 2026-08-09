/**
 * Public Opaque ID Service using Sqids
 * Converts internal numeric DB IDs to entity-prefixed public strings and back.
 *
 * Entity Prefixes:
 * - cmp_  : company_details
 * - site_ : sites
 * - emp_  : employee_details
 * - vis_  : visitor_details
 * - pass_ : pass_details
 * - usr_  : user_details
 * - role_ : roleinfos
 * - ptype_: visitor_masters
 */

const Sqids = require('sqids').default;

const sqids = new Sqids({
  minLength: 8,
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
});

const PREFIXES = {
  company: 'cmp',
  site: 'site',
  employee: 'emp',
  visitor: 'vis',
  pass: 'pass',
  user: 'usr',
  role: 'role',
  ptype: 'ptype',
};

/**
 * Encode internal numeric ID into an entity-prefixed public ID string.
 * Supports passing plain numbers or numeric strings.
 */
function encodePublicId(entityType, internalId) {
  if (internalId === null || internalId === undefined) return null;
  const numId = parseInt(internalId, 10);
  if (isNaN(numId)) return String(internalId);

  const prefix = PREFIXES[entityType] || 'id';
  const encoded = sqids.encode([numId]);
  return `${prefix}_${encoded}`;
}

/**
 * Decode a public entity-prefixed ID back into an internal numeric DB ID.
 * Accepts public string ('cmp_X8d92LmP') or raw numeric string/number for backward compatibility.
 */
function decodePublicId(publicId) {
  if (publicId === null || publicId === undefined) return null;
  const strId = String(publicId).trim();

  // If numeric string or number
  if (/^\d+$/.test(strId)) {
    return parseInt(strId, 10);
  }

  const parts = strId.split('_');
  const lastPart = parts[parts.length - 1];

  // If last part is numeric (e.g. cmp_company_1 -> 1)
  if (/^\d+$/.test(lastPart)) {
    return parseInt(lastPart, 10);
  }

  // Attempt sqid decoding on last part or first non-prefix part
  for (let i = parts.length - 1; i >= 0; i--) {
    try {
      const decoded = sqids.decode(parts[i]);
      if (decoded && decoded.length > 0) return decoded[0];
    } catch (err) {}
  }

  return null;
}

module.exports = {
  encodePublicId,
  decodePublicId,
};
