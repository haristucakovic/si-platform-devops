'use strict';

const express = require('express');
const router = express.Router();

const listingsController = require('../../business/controllers/listings.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get(
  '/active',
  listingsController.getActiveListings
);

router.get(
  '/closed',
  authenticate,
  listingsController.getClosedListings
);

// Kreiranje oglasa
router.post(
  '/',
  authenticate,
  authorize('COMPANY'),
  listingsController.createListing
);

router.get(
  '/company',
  authenticate,
  authorize('COMPANY'),
  listingsController.getCompanyListings
);

router.get(
  '/company/closed',
  authenticate,
  authorize('COMPANY'),
  listingsController.getClosedListingsByCompany
);

// Ažuriranje oglasa
router.put(
  '/:id',
  authenticate,
  authorize('COMPANY'),
  listingsController.updateListing
);

// === NOVE SAKRIVENE / AKCIJSKE RUTE ZA PROMJENU STATUSA ===

router.patch(
  '/:id/close',
  authenticate,
  authorize('COMPANY'),
  listingsController.closeListing
);

router.patch(
  '/:id/archive',
  authenticate,
  authorize('COMPANY'),
  listingsController.archiveListing
);

router.patch(
  '/:id/restore',
  authenticate,
  authorize('COMPANY'),
  listingsController.restoreFromArchive
);

module.exports = router;