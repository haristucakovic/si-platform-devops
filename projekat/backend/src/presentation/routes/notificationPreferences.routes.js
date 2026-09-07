'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const preferencesService = require('../../business/services/notificationPreferences.service');

// GET /api/notification-preferences
router.get('/', authenticate, async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const preferences = await preferencesService.getOrCreatePreferences(req.user.id);

    if (!preferences) {
      return res.status(404).json({ message: 'Student nije pronađen.' });
    }

    return res.json(preferences);
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri dohvatanju postavki notifikacija.' });
  }
});

// PUT /api/notification-preferences
router.put('/', authenticate, async (req, res) => {
  try {
    const preferences = await preferencesService.updatePreferences(req.user.id, req.body);

    if (!preferences) {
      return res.status(404).json({ message: 'Student nije pronađen.' });
    }

    return res.json(preferences);
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri čuvanju postavki notifikacija.' });
  }
});

module.exports = router;