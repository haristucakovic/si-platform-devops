'use strict';

/**
 * application_limit.controller.js
 *
 * US53 – Ograničenje broja prijava po studentu
 *
 * Putanja: backend/src/business/controllers/application_limit.controller.js
 *
 * GET  /api/koordinator/application-limit  — svi prijavljeni korisnici mogu čitati
 * PUT  /api/koordinator/application-limit  — samo COORDINATOR
 */

const {
  getApplicationLimit,
  setApplicationLimit,
} = require('../services/application_limit.service');

async function getLimitController(req, res) {
  try {
    const limit = await getApplicationLimit();
    return res.json({ limit });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function setLimitController(req, res) {
  try {
    const { limit } = req.body;
    if (limit === undefined || limit === null) {
      return res.status(400).json({ message: 'Polje limit je obavezno.' });
    }
    const saved = await setApplicationLimit(limit);
    return res.json({
      message: `Limit je uspješno postavljen na ${saved}.`,
      limit: saved,
    });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { getLimitController, setLimitController };