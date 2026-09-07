'use strict';

/**
 * application_limit.service.js
 *
 * US53 – Ograničenje broja prijava po studentu
 *
 * Putanja: backend/src/application/services/application_limit.service.js
 */

const { SystemSetting, Student, PrijavaNaPraksu } = require('../../infrastructure/database/models');
const { ACTIVE_APPLICATION_STATUSES } = require('./applicationStatus.service');

const SETTING_KEY    = 'max_active_applications';
const DEFAULT_LIMIT  = 5;

async function getApplicationLimit() {
  try {
    const setting = await SystemSetting.findOne({ where: { key: SETTING_KEY } });
    if (!setting) return DEFAULT_LIMIT;
    const parsed = parseInt(setting.value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
  } catch {
    return DEFAULT_LIMIT;
  }
}

async function setApplicationLimit(limit) {
  const parsed = parseInt(limit, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    const err = new Error('Limit mora biti pozitivan cijeli broj.');
    err.status = 400;
    throw err;
  }

  const [setting] = await SystemSetting.findOrCreate({
    where: { key: SETTING_KEY },
    defaults: { key: SETTING_KEY, value: String(parsed) },
  });

  if (setting.value !== String(parsed)) {
    setting.value = String(parsed);
    await setting.save();
  }

  return parsed;
}

/**
 * Provjerava da li student može podnijeti novu prijavu.
 * Broji prijave koje jos nisu dobile konacan ishod.
 */
async function checkStudentApplicationLimit(userId) {
  const limit = await getApplicationLimit();

  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) return { allowed: true, current: 0, limit };

  const current = await PrijavaNaPraksu.count({
    where: {
      studentID: student.id,
      status: ACTIVE_APPLICATION_STATUSES,
    },
  });

  return { allowed: current < limit, current, limit };
}

module.exports = {
  getApplicationLimit,
  setApplicationLimit,
  checkStudentApplicationLimit,
};
