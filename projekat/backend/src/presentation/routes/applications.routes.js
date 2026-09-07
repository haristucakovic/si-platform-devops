const router = require('express').Router();
const applicationsController = require('../../business/controllers/applications.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

function authorizeStudentDecision(req, res, next) {
  if (req.user?.role !== 'STUDENT') {
    return res.status(403).json({
      message: 'Samo studenti mogu odlučiti o učešću na praksi.',
    });
  }

  return next();
}

router.get(
  '/mine',
  authenticate,
  authorize('STUDENT'),
  applicationsController.getMyApplications
);

router.get(
  '/statistics',
  authenticate,
  authorize('COMPANY'),
  applicationsController.getApplicationStatistics
);

router.get(
  '/company/:oglasId',
  authenticate,
  authorize('COMPANY'),
  applicationsController.getCompanyApplicationsForListing
);

router.patch(
  '/:id/withdraw',
  authenticate,
  authorizeStudentDecision,
  applicationsController.withdrawApplication
);

router.patch(
  '/:id/accept',
  authenticate,
  authorizeStudentDecision,
  applicationsController.acceptApplicationByStudent
);

router.patch(
  '/:id/decline',
  authenticate,
  authorizeStudentDecision,
  applicationsController.declineApplicationByStudent
);

router.patch(
  '/:id/shortlist',
  authenticate,
  authorize('COMPANY'),
  applicationsController.shortlistApplication
);

router.patch(
  '/:id/approve',
  authenticate,
  authorize('COMPANY'),
  applicationsController.approveApplicationByCompany
);

router.patch(
  '/:id/reject',
  authenticate,
  authorize('COMPANY'),
  applicationsController.rejectApplicationByCompany
);

router.post(
  '/',
  authenticate,
  authorize('STUDENT'),
  applicationsController.createApplication
);

module.exports = router;
