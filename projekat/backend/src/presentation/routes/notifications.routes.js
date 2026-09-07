'use strict';

const router = require('express').Router();
const { authenticate } = require('../../middleware/auth.middleware');
const notifService = require('../../business/services/notifications.service');

// GET /api/notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const notifikacije = await notifService.getMyNotifications(req.user.id);
    return res.json(notifikacije);
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri dohvatanju notifikacija.' });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await notifService.markAllAsRead(req.user.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri označavanju notifikacija.' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await notifService.markAsRead(req.params.id, req.user.id);
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Greška pri označavanju notifikacije.' });
  }
});

module.exports = router;
