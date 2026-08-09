const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/metrics', authorize({ permissions: ['REPORT_READ', 'VISITOR_READ'] }), reportController.getMetrics);
router.get('/superadmin-metrics', authorize({ roles: ['SUPER_ADMIN'] }), reportController.getSuperAdminMetrics);

module.exports = router;
