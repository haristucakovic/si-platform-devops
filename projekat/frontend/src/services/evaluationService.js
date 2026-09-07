import { apiRequest } from './api';

// ── Kompanija evaluira studenta 

export async function getApplicationsForEvaluation() {
  return apiRequest('/evaluations/company/pending');
}

export async function submitStudentEvaluation(applicationId, data) {
  return apiRequest(`/evaluations/company/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompanySubmittedEvaluations() {
  return apiRequest('/evaluations/company/submitted');
}

// ── Student evaluira kompaniju 

export async function getApplicationsForCompanyEvaluation() {
  return apiRequest('/evaluations/student/pending');
}

export async function submitCompanyEvaluation(applicationId, data) {
  return apiRequest(`/evaluations/student/${applicationId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyStudentEvaluations() {
  return apiRequest('/evaluations/student/mine');
}

export async function getCompanyReceivedEvaluations() {
  return apiRequest('/evaluations/company/received');
}

export async function getMyReceivedEvaluations() {
  return apiRequest('/evaluations/student/received');
}