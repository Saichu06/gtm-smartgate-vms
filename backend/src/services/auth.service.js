const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserRepository = require('../repositories/user.repository');
const jwtService = require('../services/jwt.service');
const { encodePublicId, decodePublicId } = require('../services/id.service');

class AuthService {
  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }

    const userPublicId = encodePublicId('user', user.id);
    const companyPublicId = user.comp_id ? encodePublicId('company', user.comp_id) : null;
    const sitePublicId = user.site_id ? encodePublicId('site', user.site_id) : null;

    const userContext = {
      id: userPublicId,
      role: user.role_code,
      companyId: companyPublicId,
      siteId: sitePublicId,
      firstLoginRequired: user.first_login,
    };

    const accessToken = jwtService.generateAccessToken(userContext);
    const refreshToken = jwtService.generateRefreshToken(userContext);

    // Save hashed refresh token to DB
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await UserRepository.storeRefreshToken(user.id, tokenHash, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: userPublicId,
        name: user.user_name,
        email: user.email,
        role: user.role_code,
        companyId: companyPublicId,
        siteId: sitePublicId,
        firstLoginRequired: user.first_login,
      },
    };
  }

  static async refresh(refreshToken) {
    let decoded;
    try {
      decoded = jwtService.verifyRefreshToken(refreshToken);
    } catch (err) {
      throw { status: 401, code: 'UNAUTHENTICATED', message: 'Invalid or expired refresh token' };
    }

    const internalUserId = decodePublicId(decoded.sub);
    const tokenHash = this.hashToken(refreshToken);

    const storedToken = await UserRepository.findRefreshToken(internalUserId, tokenHash);
    if (!storedToken) {
      throw { status: 401, code: 'UNAUTHENTICATED', message: 'Refresh token revoked or expired' };
    }

    const user = await UserRepository.findById(internalUserId);
    if (!user) {
      throw { status: 401, code: 'UNAUTHENTICATED', message: 'User no longer exists' };
    }

    // Revoke old refresh token (Token Rotation)
    await UserRepository.revokeRefreshToken(internalUserId, tokenHash);

    const userPublicId = encodePublicId('user', user.id);
    const companyPublicId = user.comp_id ? encodePublicId('company', user.comp_id) : null;
    const sitePublicId = user.site_id ? encodePublicId('site', user.site_id) : null;

    const userContext = {
      id: userPublicId,
      role: user.role_code,
      companyId: companyPublicId,
      siteId: sitePublicId,
      firstLoginRequired: user.first_login,
    };

    const newAccessToken = jwtService.generateAccessToken(userContext);
    const newRefreshToken = jwtService.generateRefreshToken(userContext);

    const newTokenHash = this.hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await UserRepository.storeRefreshToken(user.id, newTokenHash, expiresAt);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async logout(userPublicId, refreshToken) {
    if (refreshToken) {
      const internalUserId = decodePublicId(userPublicId);
      const tokenHash = this.hashToken(refreshToken);
      await UserRepository.revokeRefreshToken(internalUserId, tokenHash);
    }
    return true;
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const internalId = decodePublicId(userId) || userId;
    const user = await UserRepository.findById(internalId);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'User not found' };
    }

    if (oldPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw { status: 400, code: 'INVALID_PASSWORD', message: 'Current password is incorrect' };
      }
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await UserRepository.updatePassword(user.id, newHash);
    await UserRepository.revokeAllUserTokens(user.id);
    return true;
  }


  static async getMe(userPublicId) {
    const internalUserId = decodePublicId(userPublicId);
    const user = await UserRepository.findById(internalUserId);
    if (!user) {
      throw { status: 404, code: 'USER_NOT_FOUND', message: 'User not found' };
    }

    return {
      id: userPublicId,
      name: user.user_name,
      email: user.email,
      mobile: user.mobile_no,
      role: user.role_code,
      companyId: user.comp_id ? encodePublicId('company', user.comp_id) : null,
      siteId: user.site_id ? encodePublicId('site', user.site_id) : null,
      firstLoginRequired: user.first_login,
      status: user.active ? 'Active' : 'Inactive',
    };
  }

  static async generateKioskToken(companyPublicId) {
    return jwtService.generateKioskToken(companyPublicId);
  }
}

module.exports = AuthService;
