import { apiRequest } from './api';

export async function getMyApplications() {
  return apiRequest('/applications/mine');
}

export async function createApplication(oglasID) {
  return apiRequest('/applications', {
    method: 'POST',
    body: JSON.stringify({ oglasID }),
  });
}

export async function acceptApplicationByStudent(id) {
  return apiRequest(`/applications/${id}/accept`, {
    method: 'PATCH',
  });
}

export async function declineApplicationByStudent(id) {
  return apiRequest(`/applications/${id}/decline`, {
    method: 'PATCH',
  });
}

export async function getApplicationStatistics({ fakultetID, odsjekID, godina, status, oglasID } = {}) {
  const params = new URLSearchParams();
  if (fakultetID) params.set('fakultetID', fakultetID);
  if (odsjekID) params.set('odsjekID', odsjekID);
  if (godina) params.set('godina', godina);
  if (status) params.set('status', status);
  if (oglasID) params.set('oglasID', oglasID);
  const query = params.toString();
  return apiRequest(`/applications/statistics${query ? `?${query}` : ''}`);
}

export async function getCompanyApplicationsForListing(oglasId) {
  return apiRequest(`/applications/company/${oglasId}`);
}

export async function shortlistApplication(id) {
  return apiRequest(`/applications/${id}/shortlist`, {
    method: 'PATCH',
  });
}

export async function approveApplicationByCompany(id) {
  return apiRequest(`/applications/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectApplicationByCompany(id) {
  return apiRequest(`/applications/${id}/reject`, {
    method: 'PATCH',
  });
}

export async function withdrawApplication(id) {
  return apiRequest(`/applications/${id}/withdraw`, {
    method: 'PATCH',
  });
}

export async function getCompanyApplicationDocumentDownloadUrl(id) {
  return apiRequest(`/dokumenti/${id}/company-download`);
}
