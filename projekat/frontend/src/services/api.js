const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const error = new Error(body.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function getMyProfile() {
  return apiRequest('/users/me');
}
 
export async function updateStudentProfile(data) {
  return apiRequest('/users/student/update', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getMyDocuments() {
  return apiRequest('/dokumenti/mine');
}

export async function deleteDocument(id) {
  return apiRequest(`/dokumenti/${id}`, { method: 'DELETE' });
}

export async function attachDocumentsToOglas(oglasId, dokumentIds) {
  return apiRequest('/dokumenti/attach', {
    method: 'POST',
    body: JSON.stringify({ oglas_id: oglasId, dokument_ids: dokumentIds }),
  });
}

export async function getNotifications() {
  return apiRequest('/notifications');
}

export async function markNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return apiRequest('/notifications/read-all', { method: 'PATCH' });
}
 

export async function getNotificationPreferences() {
  return apiRequest('/notification-preferences');
}

export async function updateNotificationPreferences(data) {
  return apiRequest('/notification-preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}