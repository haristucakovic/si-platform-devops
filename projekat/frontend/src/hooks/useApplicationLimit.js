/**
 * useApplicationLimit.js
 *
 * US53 – Ograničenje broja prijava po studentu
 *
 * Putanja: frontend/src/hooks/useApplicationLimit.js
 *
 * Hook koji dohvata trenutni limit i broj aktivnih prijava studenta.
 * Koristi se u StudentDashboard.jsx i ApplicationModal.
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { isActiveApplicationStatus } from '../utils/applicationStatus';

export function useApplicationLimit(applications) {
  const [limit, setLimit] = useState(null);

  useEffect(() => {
    apiRequest('/koordinator/application-limit')
      .then(data => setLimit(data.limit))
      .catch(() => setLimit(null));
  }, []);

  const activeCount = (applications || []).filter(
    a => isActiveApplicationStatus(a.status)
  ).length;

  const isAtLimit = limit !== null && activeCount >= limit;

  return { limit, activeCount, isAtLimit };
}
