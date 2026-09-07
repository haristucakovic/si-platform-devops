'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const adminController = require('../../business/controllers/admin.controller');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/users', adminController.getUsers);
router.get('/audit-logs', adminController.getAuditLogs);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

router.get('/faculties', adminController.getFaculties);
router.post('/faculties', adminController.createFaculty);
router.put('/faculties/:id', adminController.updateFaculty);
router.delete('/faculties/:id', adminController.deleteFaculty);

router.get('/faculties/:id/odsjeci', adminController.getOdsjeci);
router.post('/faculties/:id/odsjeci', adminController.createOdsjek);
router.delete('/odsjeci/:id', adminController.deleteOdsjek);

module.exports = router;
