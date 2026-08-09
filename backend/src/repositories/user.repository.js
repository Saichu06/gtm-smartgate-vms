const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { encodePublicId, decodePublicId } = require('../services/id.service');

class UserRepository {
  static async findByEmail(email) {
    const res = await pool.query(
      `SELECT u.*, r.code AS role_code
       FROM smartgate.user_details u
       JOIN smartgate.roleinfos r ON u.role_id = r.id
       WHERE LOWER(u.email) = LOWER($1) AND u.active = true`,
      [email]
    );
    return res.rows[0] || null;
  }

  static async findById(internalId) {
    const res = await pool.query(
      `SELECT u.*, r.code AS role_code
       FROM smartgate.user_details u
       JOIN smartgate.roleinfos r ON u.role_id = r.id
       WHERE u.id = $1 AND u.active = true`,
      [internalId]
    );
    return res.rows[0] || null;
  }

  static async updatePassword(internalId, passwordHash) {
    await pool.query(
      `UPDATE smartgate.user_details
       SET password = $1, first_login = false
       WHERE id = $2`,
      [passwordHash, internalId]
    );
  }

  static async storeRefreshToken(internalUserId, tokenHash, expiresAt) {
    await pool.query(
      `INSERT INTO smartgate.refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [internalUserId, tokenHash, expiresAt]
    );
  }

  static async findRefreshToken(internalUserId, tokenHash) {
    const res = await pool.query(
      `SELECT * FROM smartgate.refresh_tokens
       WHERE user_id = $1 AND token_hash = $2 AND revoked = false AND expires_at > NOW()`,
      [internalUserId, tokenHash]
    );
    return res.rows[0] || null;
  }

  static async revokeRefreshToken(internalUserId, tokenHash) {
    await pool.query(
      `UPDATE smartgate.refresh_tokens
       SET revoked = true
       WHERE user_id = $1 AND token_hash = $2`,
      [internalUserId, tokenHash]
    );
  }

  static async revokeAllUserTokens(internalUserId) {
    await pool.query(
      `UPDATE smartgate.refresh_tokens
       SET revoked = true
       WHERE user_id = $1`,
      [internalUserId]
    );
  }
}

module.exports = UserRepository;
