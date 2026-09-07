'use strict';

const companiesService = require('../services/companies.service');

async function getCompanyProfile(req, res) {
  try {
    const kompanijaId = Number(req.params.id);
    if (!Number.isInteger(kompanijaId) || kompanijaId <= 0) {
      return res.status(400).json({ message: 'Neispravan ID kompanije.' });
    }

    const data = await companiesService.getCompanyProfileForStudent(kompanijaId);
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
}

module.exports = {
  getCompanyProfile,
};
