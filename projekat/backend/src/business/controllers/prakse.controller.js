'use strict';

const prakseService = require('../services/prakse.service');

function handleError(res, error) {
  if (!error.status || error.status >= 500) {
    console.error('[PRAKSE ERROR]', error);
  }

  if (error.message === 'KOORDINATOR_NOT_FOUND') {
    return res.status(404).json({ message: 'Koordinatorski profil nije pronađen.' });
  }

  return res.status(error.status || 500).json({
    message: error.status ? error.message : 'Došlo je do greške na serveru.',
    detail: error.message,
  });
}

async function getMine(req, res) {
  try {
    return res.json(await prakseService.getStudentPractices(req.user.id, req.query.filter));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getCompany(req, res) {
  try {
    return res.json(await prakseService.getCompanyPractices(req.user.id, req.query.filter));
  } catch (error) {
    return handleError(res, error);
  }
}

async function getCoordinator(req, res) {
  try {
    return res.json(await prakseService.getCoordinatorPractices(req.user.id, req.query.filter));
  } catch (error) {
    return handleError(res, error);
  }
}

async function generateContract(req, res) {
  try {
    const result = await prakseService.getPracticeContract(req.user.id, req.user.role, req.params.id);
    return res.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}


async function createActivity(req, res) {
  try {
    const aktivnost = await prakseService.createActivity(
      req.user.id,
      req.params.id,
      req.body.opis
    );

    return res.status(201).json(aktivnost);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getActivities(req, res) {
  try {
    const aktivnosti = await prakseService.getPracticeActivities(
      req.user.id,
      req.user.role,
      req.params.id
    );

    return res.json(aktivnosti);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getAttendance(req, res) {
  try {
    const prisustva = await prakseService.getPracticeAttendance(
      req.user.id,
      req.user.role,
      req.params.id
    );

    return res.json(prisustva);
  } catch (error) {
    return handleError(res, error);
  }
}

async function upsertAttendance(req, res) {
  try {
    const result = await prakseService.upsertPracticeAttendance(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(result.created ? 201 : 200).json(result.prisustvo);
  } catch (error) {
    return handleError(res, error);
  }
}

async function generateReport(req, res) {
  try {
    const result = await prakseService.generatePracticeReport(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
}

async function getReport(req, res) {
  try {
    const result = await prakseService.getPracticeReport(
      req.user.id,
      req.user.role,
      req.params.id
    );

    return res.json(result);
  } catch (error) {
    return handleError(res, error);
  }
}


module.exports = {
  getMine,
  getCompany,
  getCoordinator,
  generateContract,
  createActivity,
  getActivities,
  getAttendance,
  upsertAttendance,
  generateReport,
  getReport,
};
