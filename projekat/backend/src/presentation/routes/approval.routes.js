'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const approvalController = require('../../business/controllers/approval.controller');

router.use(authenticate);
router.use(authorize('ADMIN', 'COORDINATOR'));

router.get('/users', approvalController.getUserApprovalRequests);
router.get('/users/:id', approvalController.getUserApprovalRequestById);
router.patch('/users/:id/approve', approvalController.approveUserRequest);
router.patch('/users/:id/reject', approvalController.rejectUserRequest);

module.exports = router;
