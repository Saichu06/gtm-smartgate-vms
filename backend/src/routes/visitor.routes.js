const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitor.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { otpLimiter } = require('../middleware/rateLimit.middleware');

// Public Kiosk OTP Routes (Rate limited)
router.post('/kiosk/otp', otpLimiter, visitorController.requestOtp);
router.post('/kiosk/otp/verify', otpLimiter, visitorController.verifyOtp);

// Public / Token Authenticated Pass Validation (QR scan)
router.get('/visitors/validate-pass/:publicId', visitorController.validatePass);

// Protected Visitor Lifecycle Endpoints
router.get('/visitors', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_READ'] }), visitorController.getVisitors);
router.get('/visitors/:publicId', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_READ'] }), visitorController.getVisitorById);
router.post('/visitors', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_CREATE'] }), visitorController.registerVisitor);
router.post('/visitors/:publicId/check-out', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_CHECKOUT'] }), visitorController.checkoutVisitor);
router.post('/visitors/:publicId/approve', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_APPROVE'] }), visitorController.approveVisitor);
router.post('/visitors/:publicId/reject', authMiddleware, tenantMiddleware, authorize({ permissions: ['VISITOR_REJECT'] }), visitorController.rejectVisitor);

module.exports = router;
