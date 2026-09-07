// koordinatorService.js
// All API calls for the coordinator role.

import { apiRequest } from './api';

const BASE = '/koordinator';

export const koordinatorService = {

  // Dashboard summary stats
  getDashboardStats: () =>
    apiRequest(`${BASE}/dashboard`),

  // Applications list — optional ?status=CEKA_KOORDINATORA&stranica=1
  getPrijave: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`${BASE}/prijave${qs ? `?${qs}` : ''}`);
  },

  // Single application full detail
  getPrijavaDetalji: (id) =>
    apiRequest(`${BASE}/prijave/${id}`),

  // Approve or reject an application
  odluciPrijava: (id, odluka, razlog = '') =>
    apiRequest(`${BASE}/prijave/${id}/odluka`, {
      method: 'PATCH',
      body: JSON.stringify({ odluka, razlog }),
    }),

  // All students filtered by coordinator's faculty (backend handles filtering)
  getStudenti: (pretraga = '') =>
    apiRequest(`${BASE}/studenti${pretraga ? `?pretraga=${encodeURIComponent(pretraga)}` : ''}`),

  // All internships
  getPrakse: (filter = 'all') =>
    apiRequest(`${BASE}/prakse?filter=${encodeURIComponent(filter)}`),

  // ── Approval requests (uses existing /api/approval-requests endpoint) ──────
  getApprovalRequests: () =>
    apiRequest(`${BASE}/zahtjevi`),

approveUser: (id) =>
    apiRequest(`${BASE}/studenti/${id}/odobri`, {
      method: 'PATCH',
    }),

rejectUser: (id, razlog) =>
    apiRequest(`${BASE}/studenti/${id}/odbij`, {
      method: 'PATCH',
      body: JSON.stringify({ razlog }),
    }),
};
