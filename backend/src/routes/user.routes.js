const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tenantMiddleware = require('../middleware/tenant.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', authorize({ permissions: ['USER_READ'] }), userController.getAllUsers);
router.post('/', authorize({ permissions: ['USER_CREATE'] }), userController.createUser);
router.put('/:publicId', authorize({ permissions: ['USER_UPDATE'] }), userController.updateUser);
router.patch('/:publicId/status', authorize({ permissions: ['USER_DEACTIVATE'] }), userController.toggleUserStatus);

module.exports = router;
