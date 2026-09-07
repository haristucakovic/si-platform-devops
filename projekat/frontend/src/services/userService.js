import { apiRequest } from './api.js';

export function checkDeactivation() {
  return apiRequest('/users/deactivation-check');
}

export function deactivateAccount() {
  return apiRequest('/users/deactivate', { method: 'POST' });
}

export function checkCompanyDeactivation() {
  return apiRequest('/users/company-deactivation-check');
}

export function deactivateCompanyAccount() {
  return apiRequest('/users/company-deactivate', { method: 'POST' });
}

export function checkCoordinatorDeactivation() {
  return apiRequest('/users/coordinator-deactivation-check');
}

export function deactivateCoordinatorAccount() {
  return apiRequest('/users/coordinator-deactivate', { method: 'POST' });
}

export function deleteMyAccount() {
  return apiRequest('/users/delete', { method: 'DELETE' });
}

export function deleteMyCompanyAccount() {
  return apiRequest('/users/company-delete', { method: 'DELETE' });
}

export function deleteMyCoordinatorAccount() {
  return apiRequest('/users/coordinator-delete', { method: 'DELETE' });
}
