'use strict';

const express = require('express');
const router = express.Router();
const evaluationController = require('../../business/controllers/evaluation.controller');
const { authenticate } = require('../../middleware/auth.middleware');

// Sve rute zahtijevaju autentifikaciju
router.use(authenticate);

// STUDENT
router.get('/student/pending',  evaluationController.getStudentPendingEvaluations);
router.get('/student/mine',     evaluationController.getStudentSubmittedEvaluations);
router.get('/student/received', evaluationController.getStudentReceivedEvaluations);  // ← prije /:applicationId
router.post('/student/:applicationId', evaluationController.postCompanyEvaluation);

// COMPANY
router.get('/company/pending',   evaluationController.getCompanyPendingEvaluations);
router.get('/company/submitted', evaluationController.getCompanySubmittedEvaluations);
router.get('/company/received',  evaluationController.getCompanyReceivedEvaluations);  // ← prije /:applicationId
router.post('/company/:applicationId', evaluationController.postStudentEvaluation);

module.exports = router;