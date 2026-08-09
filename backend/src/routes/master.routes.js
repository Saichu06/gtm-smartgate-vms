const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const { authorize } = require('../middleware/authorize.middleware');

const protectedGuard = [authMiddleware, tenantMiddleware];

// 1. Companies / Organizations
router.get('/companies', protectedGuard, authorize({ permissions: ['ORGANIZATION_READ'] }), masterController.getAllCompanies);
router.get('/companies/:publicId', protectedGuard, authorize({ permissions: ['ORGANIZATION_READ'] }), masterController.getCompanyById);
router.post('/companies', protectedGuard, authorize({ roles: ['SUPER_ADMIN'], permissions: ['ORGANIZATION_CREATE'] }), masterController.createCompany);
router.put('/companies/:publicId', protectedGuard, authorize({ permissions: ['ORGANIZATION_UPDATE'] }), masterController.updateCompany);

// 2. Sites
router.get('/sites', protectedGuard, authorize({ permissions: ['SITE_READ'] }), masterController.getSites);
router.post('/sites', protectedGuard, authorize({ permissions: ['SITE_CREATE'] }), masterController.createSite);

// 3. Employees
router.get('/employees', protectedGuard, authorize({ permissions: ['EMPLOYEE_READ'] }), masterController.getEmployees);
router.post('/employees', protectedGuard, authorize({ permissions: ['EMPLOYEE_CREATE'] }), masterController.createEmployee);

// 4. Visitor Types
router.get('/visitor-types', masterController.getVisitorTypes);

// 5. Gate Passes
router.get('/gate-passes', protectedGuard, authorize({ permissions: ['GATE_PASS_READ'] }), masterController.getGatePasses);
router.post('/gate-passes', protectedGuard, authorize({ permissions: ['GATE_PASS_CREATE'] }), masterController.createGatePass);
router.put('/gate-passes/:publicId', protectedGuard, authorize({ permissions: ['GATE_PASS_UPDATE'] }), masterController.updateGatePass);
router.delete('/gate-passes/:publicId', protectedGuard, authorize({ permissions: ['GATE_PASS_DELETE'] }), masterController.deleteGatePass);

module.exports = router;
