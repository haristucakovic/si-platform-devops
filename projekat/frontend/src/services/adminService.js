import { apiRequest } from './api.js';

export function getUsers(status) {
  const query = status ? `?status=${status}` : '';
  return apiRequest(`/admin/users${query}`);
}

export function updateUserRole(id, role) {
  return apiRequest(`/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function updateUserStatus(id, status) {
  return apiRequest(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function getFaculties() {
  return apiRequest('/admin/faculties');
}

export function createFaculty(data) {
  return apiRequest('/admin/faculties', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateFaculty(id, data) {
  return apiRequest(`/admin/faculties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteFaculty(id) {
  return apiRequest(`/admin/faculties/${id}`, { method: 'DELETE' });
}

export function getOdsjeci(fakultetID) {
  return apiRequest(`/admin/faculties/${fakultetID}/odsjeci`);
}

export function createOdsjek(fakultetID, naziv) {
  return apiRequest(`/admin/faculties/${fakultetID}/odsjeci`, {
    method: 'POST',
    body: JSON.stringify({ naziv }),
  });
}

export function deleteOdsjek(id) {
  return apiRequest(`/admin/odsjeci/${id}`, { method: 'DELETE' });
}

export function deleteUser(id) {
  return apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
}

export function getAuditLogs(params = {}) {
  const query = new URLSearchParams();
  if (params.actionType) query.set('actionType', params.actionType);
  if (params.limit) query.set('limit', params.limit);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return apiRequest(`/admin/audit-logs${suffix}`);
}

export function getUserApprovalRequests() {
  return apiRequest('/approval-requests/users');
}

export function getUserApprovalRequestById(id) {
  return apiRequest(`/approval-requests/users/${id}`);
}

export function approveUserRequest(id, role) {
  return apiRequest(`/approval-requests/users/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export function rejectUserRequest(id, rejectionReason) {
  return apiRequest(`/approval-requests/users/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectionReason }),
  });
}
