const AuthService = require('../services/auth.service');

// POST /api/v1/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required' },
      });
    }

    const result = await AuthService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred',
      },
    });
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Refresh token is required' },
      });
    }

    const result = await AuthService.refresh(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    const status = err.status || 401;
    res.status(status).json({
      success: false,
      error: {
        code: err.code || 'UNAUTHENTICATED',
        message: err.message || 'Refresh failed',
      },
    });
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user ? req.user.id : null;
    if (userId) {
      await AuthService.logout(userId, refreshToken);
    }
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    res.status(200).json({ success: true, message: 'Logged out' });
  }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await AuthService.getMe(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: {
        code: err.code || 'USER_NOT_FOUND',
        message: err.message || 'Failed to retrieve profile',
      },
    });
  }
};

// POST /api/v1/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'New password must be at least 6 characters long' },
      });
    }

    await AuthService.changePassword(req.user.id, oldPassword, newPassword);
    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({
      success: false,
      error: {
        code: err.code || 'CHANGE_PASSWORD_FAILED',
        message: err.message || 'Failed to change password',
      },
    });
  }
};

// POST /api/v1/auth/kiosk-token
exports.getKioskToken = async (req, res) => {
  try {
    const { companyPublicId } = req.body;
    if (!companyPublicId) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Company ID required for kiosk session' },
      });
    }

    const token = await AuthService.generateKioskToken(companyPublicId);
    res.status(200).json({
      success: true,
      data: { token },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: { code: 'KIOSK_TOKEN_FAILED', message: 'Failed to generate kiosk token' },
    });
  }
};
