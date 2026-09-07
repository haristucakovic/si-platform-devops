import { apiRequest } from './api.js';

export function getCompanyProfile() {
  return apiRequest('/users/company-profile');
}

export function updateCompanyProfile(data) {
  return apiRequest('/users/company-profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}
