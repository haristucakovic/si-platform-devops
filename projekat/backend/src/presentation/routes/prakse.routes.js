'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const prakseController = require('../../business/controllers/prakse.controller');


router.get('/mine', authenticate, authorize('STUDENT'), prakseController.getMine);
router.get('/company', authenticate, authorize('COMPANY'), prakseController.getCompany);
router.get('/coordinator', authenticate, authorize('COORDINATOR'), prakseController.getCoordinator);
router.post('/:id/ugovor', authenticate, authorize('STUDENT', 'COMPANY'), prakseController.generateContract);
router.get(
  '/:id/aktivnosti',
  authenticate,
  authorize('STUDENT', 'COMPANY', 'COORDINATOR'),
  prakseController.getActivities
);
router.get(
  '/:id/prisustva',
  authenticate,
  authorize('STUDENT', 'COMPANY', 'COORDINATOR'),
  prakseController.getAttendance
);
router.get(
  '/:id/izvjestaj',
  authenticate,
  authorize('STUDENT', 'COMPANY', 'COORDINATOR'),
  prakseController.getReport
);

router.post(
  '/:id/aktivnosti',
  authenticate,
  authorize('STUDENT'),
  prakseController.createActivity
);

router.post(
  '/:id/prisustva',
  authenticate,
  authorize('COMPANY'),
  prakseController.upsertAttendance
);

router.post(
  '/:id/izvjestaj',
  authenticate,
  authorize('COMPANY'),
  prakseController.generateReport
);

module.exports = router;
