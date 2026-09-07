'use strict';

const evaluationService = require('../../business/services/evaluation.service');

// ─── Kompanija evaluira studenta (US 26) ─────────────────────────────────

async function getCompanyPendingEvaluations(req, res) {
  try {
    const data = await evaluationService.getPendingStudentEvaluations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function postStudentEvaluation(req, res) {
  try {
    const prijavaID = Number(req.params.applicationId);
    if (!prijavaID) {
      return res.status(400).json({ message: 'Nevažeći ID prijave.' });
    }

    const { tehnickeVjestine, komunikacija, radnaEtika, inicijativa, timskiRad, ukupnaOcjena } = req.body;
    const scores = [tehnickeVjestine, komunikacija, radnaEtika, inicijativa, timskiRad, ukupnaOcjena];
    if (scores.some(s => !s || Number(s) < 1 || Number(s) > 5)) {
      return res.status(400).json({ message: 'Sve ocjene moraju biti između 1 i 5.' });
    }

    const evaluacija = await evaluationService.submitStudentEvaluation(req.user.id, prijavaID, req.body);
    res.status(201).json({ message: 'Evaluacija studenta je uspješno poslana.', evaluacija });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function getCompanySubmittedEvaluations(req, res) {
  try {
    const data = await evaluationService.getSubmittedStudentEvaluations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

// ─── Student evaluira kompaniju (US 27) ──────────────────────────────────

async function getStudentPendingEvaluations(req, res) {
  try {
    const data = await evaluationService.getPendingCompanyEvaluations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function postCompanyEvaluation(req, res) {
  try {
    const prijavaID = Number(req.params.applicationId);
    if (!prijavaID) {
      return res.status(400).json({ message: 'Nevažeći ID prijave.' });
    }

    const { organizacija, mentorstvo, radnoOkruzenje, relevantnoPosla, preporukaKompanija, ukupnaOcjena } = req.body;
    const scores = [organizacija, mentorstvo, radnoOkruzenje, relevantnoPosla, preporukaKompanija, ukupnaOcjena];
    if (scores.some(s => !s || Number(s) < 1 || Number(s) > 5)) {
      return res.status(400).json({ message: 'Sve ocjene moraju biti između 1 i 5.' });
    }

    const evaluacija = await evaluationService.submitCompanyEvaluation(req.user.id, prijavaID, req.body);
    res.status(201).json({ message: 'Evaluacija kompanije je uspješno poslana.', evaluacija });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function getStudentSubmittedEvaluations(req, res) {
  try {
    const data = await evaluationService.getStudentSubmittedCompanyEvaluations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function getStudentReceivedEvaluations(req, res) {
  try {
    const data = await evaluationService.getStudentReceivedEvaluations(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || 'Greška na serveru.' });
  }
}

async function getCompanyReceivedEvaluations(req, res) {
    try {
        const data = await evaluationService.getCompanyReceivedEvaluations(req.user.id);
        res.json(data);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
}

module.exports = {
  getCompanyPendingEvaluations,
  postStudentEvaluation,
  getCompanySubmittedEvaluations,
  getStudentPendingEvaluations,
  postCompanyEvaluation,
  getStudentSubmittedEvaluations,
  getStudentReceivedEvaluations,
  getCompanyReceivedEvaluations,
};