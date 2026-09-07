'use strict';

const express = require('express');
const router = express.Router();
const favouritesController = require('../../business/controllers/favourites.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get('/', authenticate, authorize('STUDENT'), favouritesController.getFavourites);
router.post('/:oglasId', authenticate, authorize('STUDENT'), favouritesController.addFavourite);
router.delete('/:oglasId', authenticate, authorize('STUDENT'), favouritesController.removeFavourite);

module.exports = router;
