import { apiRequest } from './api';

export function getCompanyPublicProfile(companyId) {
  return apiRequest(`/companies/${companyId}`);
}
