const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const {
  getCompanyProfileController,
  updateCompanyProfileController,
  deactivationCheckController,
  deactivateAccountController,
  companyDeactivationCheckController,
  companyDeactivateAccountController,
  coordinatorDeactivationCheckController,
  coordinatorDeactivateAccountController,
  deleteMyAccountController,
  deleteCompanyAccountController,
  deleteCoordinatorAccountController,
  getMyProfileController,
  updateStudentProfileController
} = require('../../business/controllers/users.controller');

router.get('/company-profile', authenticate, authorize('COMPANY'), getCompanyProfileController);
router.patch('/company-profile', authenticate, authorize('COMPANY'), updateCompanyProfileController);

router.get('/deactivation-check', authenticate, deactivationCheckController);
router.post('/deactivate', authenticate, deactivateAccountController);
router.get('/company-deactivation-check', authenticate, companyDeactivationCheckController);
router.post('/company-deactivate', authenticate, companyDeactivateAccountController);
router.get('/coordinator-deactivation-check', authenticate, coordinatorDeactivationCheckController);
router.post('/coordinator-deactivate', authenticate, coordinatorDeactivateAccountController);
router.delete('/delete', authenticate, deleteMyAccountController);
router.delete('/company-delete', authenticate, deleteCompanyAccountController);
router.delete('/coordinator-delete', authenticate, deleteCoordinatorAccountController);
router.get('/me',             authenticate, getMyProfileController);
router.put('/student/update', authenticate, updateStudentProfileController);


module.exports = router;