'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize }    = require('../../middleware/rbac.middleware');
const koordinatorController = require('../../business/controllers/koordinator.controller');
const { getLimitController, setLimitController } = require('../../business/controllers/application_limit.controller');

router.use(authenticate);
router.use(authorize('COORDINATOR'));

// Limit prijava
router.get('/application-limit', authenticate, getLimitController);
router.put('/application-limit', authenticate, authorize('COORDINATOR'), setLimitController);

// Dashboard summary stats
router.get('/dashboard', koordinatorController.getDashboardStats);

// Applications
router.get('/prijave',              koordinatorController.getPrijave);
router.get('/prijave/:id',          koordinatorController.getPrijavaDetalji);
router.patch('/prijave/:id/odluka', koordinatorController.odluciPrijava);

// Students list
router.get('/studenti', koordinatorController.getStudenti);

// Internships overview
router.get('/prakse', koordinatorController.getPrakse);

router.patch('/studenti/:id/odobri', koordinatorController.approveStudent);
router.patch('/studenti/:id/odbij',  koordinatorController.rejectStudent);
router.get('/zahtjevi', koordinatorController.getZahtjevi);

module.exports = router;