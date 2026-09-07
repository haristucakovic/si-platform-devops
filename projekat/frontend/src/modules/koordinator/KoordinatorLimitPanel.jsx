/**
 * KoordinatorLimitPanel.jsx
 *
 * US53 – Ograničenje broja prijava po studentu
 *
 * Putanja: frontend/src/modules/koordinator/KoordinatorLimitPanel.jsx
 *
 * Panel koji koordinator koristi da postavi maksimalan broj
 * aktivnih prijava po studentu.
 */

import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

export default function KoordinatorLimitPanel() {
  const [limit, setLimit]     = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    apiRequest('/koordinator/application-limit')
      .then(data => { setLimit(String(data.limit)); })
      .catch(() => { setLimit('5'); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    const parsed = parseInt(limit, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setError('Limit mora biti pozitivan cijeli broj (minimum 1).');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiRequest('/koordinator/application-limit', {
        method: 'PUT',
        body: JSON.stringify({ limit: parsed }),
      });
      setSuccess(data.message || 'Limit uspješno sačuvan.');
      setLimit(String(data.limit));
    } catch (err) {
      setError(err.message || 'Greška pri čuvanju limita.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="kd-limit-panel">
      <div className="kd-limit-header">
        <div className="kd-limit-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div className="kd-limit-header-text">
          <h2 className="kd-limit-title">Limit prijava po studentu</h2>
          <p className="kd-limit-desc">
            Postavite maksimalan broj aktivnih prijava koje student može imati
            istovremeno. Aktivne prijave su one koje čekaju koordinatora, čekaju
            odgovor kompanije ili su označene za uži krug. Student neće moći podnijeti novu prijavu dok ne
            padne ispod ovog limita.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="kd-limit-loading">Učitavanje trenutnog limita...</p>
      ) : (
        <form className="kd-limit-form" onSubmit={handleSave}>
          <div className="kd-limit-current">
            <span className="kd-limit-current-label">Trenutni limit:</span>
            <span className="kd-limit-current-value">{limit}</span>
            <span className="kd-limit-current-unit">prijava po studentu</span>
          </div>

          <div className="kd-limit-field">
            <label className="kd-limit-label" htmlFor="kd-limit-input">
              Novi limit
            </label>
            <div className="kd-limit-input-row">
              <input
                id="kd-limit-input"
                className="kd-limit-input"
                type="number"
                min="1"
                max="99"
                step="1"
                value={limit}
                onChange={e => { setLimit(e.target.value); setError(''); setSuccess(''); }}
                disabled={saving}
              />
              <button className="kd-limit-btn" type="submit" disabled={saving}>
                {saving ? 'Čuvanje...' : 'Sačuvaj'}
              </button>
            </div>
            <p className="kd-limit-hint">
              Preporučena vrijednost: 3–5 prijava. Promjena stupa na snagu odmah.
            </p>
          </div>

          {error && (
            <div className="kd-limit-message kd-limit-message--error" role="alert">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="kd-limit-message kd-limit-message--success" role="status">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {success}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
