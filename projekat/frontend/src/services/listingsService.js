// frontend/src/services/listingsService.js
import { apiRequest } from './api';

export async function createListing(data) {
  return apiRequest('/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCompanyListings() {
  return apiRequest('/listings/company');
}

export async function getActiveListings() {
  return apiRequest('/listings/active');
}

export async function updateListing(id, data) {
  return apiRequest(`/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getClosedListings() {
  return apiRequest('/listings/closed');
}

export async function getCompanyClosedListings() {
  return apiRequest('/listings/company/closed');
}

// === ADD THESE THREE NEW FUNCTIONS ===

export async function closeListing(id) {
  return apiRequest(`/listings/${id}/close`, {
    method: 'PATCH',
  });
}

export async function archiveListing(id) {
  return apiRequest(`/listings/${id}/archive`, {
    method: 'PATCH',
  });
}

export async function restoreFromArchive(id) {
  return apiRequest(`/listings/${id}/restore`, {
    method: 'PATCH',
  });
}