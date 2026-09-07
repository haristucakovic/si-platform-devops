const applicationsService = require('../services/applications.service');

function handleApplicationError(res, err) {
  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Došlo je do greške na serveru.' });
}

async function createApplication(req, res) {
  try {
    const application = await applicationsService.createApplication(req.user.id, req.body);
    return res.status(201).json({
      message: 'Prijava je uspješno podnesena.',
      application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function getMyApplications(req, res) {
  try {
    const applications = await applicationsService.getMyApplications(req.user.id);
    return res.json(applications);
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function getApplicationStatistics(req, res) {
  try {
    const { fakultetID, odsjekID, godina, status, oglasID } = req.query;
    const stats = await applicationsService.getApplicationStatistics(req.user.id, { fakultetID, odsjekID, godina, status, oglasID });
    return res.json(stats);
  } catch (err) {
    console.error('[getApplicationStatistics]', err);
    return handleApplicationError(res, err);
  }
}

async function getCompanyApplicationsForListing(req, res) {
  try {
    const data = await applicationsService.getCompanyApplicationsForListing(
      req.user.id,
      req.params.oglasId
    );
    return res.json(data);
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function shortlistApplication(req, res) {
  try {
    const application = await applicationsService.shortlistApplication(
      req.user.id,
      req.params.id
    );
    return res.json({
      message: 'Kandidat je uspješno označen za uži krug.',
      application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function approveApplicationByCompany(req, res) {
  try {
    const application = await applicationsService.approveApplicationByCompany(
      req.user.id,
      req.params.id
    );
    return res.json({
      message: 'Kandidat je uspjesno odobren.',
      application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function rejectApplicationByCompany(req, res) {
  try {
    const application = await applicationsService.rejectApplicationByCompany(
      req.user.id,
      req.params.id
    );
    return res.json({
      message: 'Kandidat je uspjesno odbijen.',
      application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

function sendStudentDecisionResponse(res, result) {
  const application = result.application;
  return res.json({
    message: result.message,
    application,
    status: application.status,
    koordinatorStatus: application.koordinatorStatus,
    kompanijaStatus: application.kompanijaStatus,
    studentStatus: application.studentStatus,
    studentOdlucioAt: application.studentOdlucioAt,
    practice: result.practice || null,
  });
}

async function acceptApplicationByStudent(req, res) {
  try {
    const result = await applicationsService.acceptApplicationByStudent(req.user.id, req.params.id);
    return sendStudentDecisionResponse(res, result);
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function declineApplicationByStudent(req, res) {
  try {
    const result = await applicationsService.declineApplicationByStudent(req.user.id, req.params.id);
    return sendStudentDecisionResponse(res, result);
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

async function withdrawApplication(req, res) {
  try {
    const result = await applicationsService.withdrawApplication(req.user.id, req.params.id);
    return res.json({
      message: result.message,
      application: result.application,
    });
  } catch (err) {
    return handleApplicationError(res, err);
  }
}

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationStatistics,
  getCompanyApplicationsForListing,
  shortlistApplication,
  approveApplicationByCompany,
  rejectApplicationByCompany,
  acceptApplicationByStudent,
  declineApplicationByStudent,
  withdrawApplication,
};
