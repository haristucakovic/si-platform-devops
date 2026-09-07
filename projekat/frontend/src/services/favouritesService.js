import { apiRequest } from './api';

export async function getFavourites() {
  return apiRequest('/favourites');
}

export async function addFavourite(oglasId) {
  return apiRequest(`/favourites/${oglasId}`, { method: 'POST' });
}

export async function removeFavourite(oglasId) {
  return apiRequest(`/favourites/${oglasId}`, { method: 'DELETE' });
}
