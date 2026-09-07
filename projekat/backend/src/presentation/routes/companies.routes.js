'use strict';

const express = require('express');
const router = express.Router();

const companiesController = require('../../business/controllers/companies.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get(
  '/:id',
  authenticate,
  authorize('STUDENT'),
  companiesController.getCompanyProfile,
);

module.exports = router;
