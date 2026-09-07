// OdobravanjePregled.jsx
// Coordinator can approve/reject pending STUDENT accounts only.

import { useState, useEffect, useCallback } from 'react';
import { koordinatorService } from '../../services/koordinatorService';
import { formatDate } from '../../data/mockPrakse';

export default function OdobravanjePregled() {
  const [zahtjevi, setZahtjevi] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [toast, setToast]       = useState(null);
  const [aktivniId, setAktivniId] = useState(null);
  const [razlog, setRazlog]     = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ucitaj = useCallback(() => {
    setLoading(true); setError('');
    koordinatorService.getApprovalRequests()
      .then(res => {
        const svi = Array.isArray(res) ? res : (res.data || []);
        // Koordinator smije odobravati samo studente
        const samoStudenti = svi.filter(z =>
          (z.role || z.requestedRole || '').toUpperCase() === 'STUDENT'
        );
        setZahtjevi(samoStudenti);
      })
      .catch(() => setError('Greška pri učitavanju zahtjeva.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { ucitaj(); }, [ucitaj]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOdobri = async (id, role) => {
    setSubmitting(true);
    try {
      const res = await koordinatorService.approveUser(id, role);
      if (res.message) { showToast(res.message); ucitaj(); setAktivniId(null); }
      else showToast('Greška.', 'danger');
    } catch { showToast('Greška pri odobravanju.', 'danger'); }
    finally { setSubmitting(false); }
  };

  const handleOdbij = async (id) => {
    if (!razlog.trim()) return;
    setSubmitting(true);
    try {
      const res = await koordinatorService.rejectUser(id, razlog);
      if (res.message) { showToast(res.message); ucitaj(); setAktivniId(null); setRazlog(''); }
      else showToast('Greška.', 'danger');
    } catch { showToast('Greška pri odbijanju.', 'danger'); }
    finally { setSubmitting(false); }
  };

  const aktivni = zahtjevi.find(z => z.id === aktivniId);

  return (
    <div>
      <div className="kd-module-header">
        <h2 className="kd-module-title">Zahtjevi za odobravanje ({zahtjevi.length})</h2>
        <button className="kd-btn kd-btn--ghost kd-btn--sm" onClick={ucitaj}>
          <IconRefresh /> Osvježi
        </button>
      </div>

      <div className="kd-info-banner">
        <IconInfo /> Prikazuju se studenti koji su verificirali email i čekaju odobrenje naloga.
      </div>

      {loading && <div className="kd-loading">Učitavanje zahtjeva…</div>}
      {error   && (
        <div className="kd-empty">
          <IconWarning size={40} />
          <p className="kd-empty-text">{error}</p>
        </div>
      )}

      {!loading && !error && zahtjevi.length === 0 && (
        <div className="kd-empty">
          <IconCheck size={40} color="var(--color-success)" />
          <p className="kd-empty-text">Nema zahtjeva na čekanju.</p>
        </div>
      )}

      {!loading && !error && zahtjevi.length > 0 && (
        <div className="kd-table-wrap">
          <table className="kd-table">
            <thead>
              <tr>
                <th>Korisnik</th>
                <th>Email</th>
                <th>Rola</th>
                <th>Datum zahtjeva</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zahtjevi.map(z => (
                <tr key={z.id} className={aktivniId === z.id ? 'kd-row--selected' : ''}>
                  <td>
                    <strong>{z.ime} {z.prezime}</strong>
                    {z.username && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                        @{z.username}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                    {z.email}
                  </td>
                  <td>
                    <span className="kd-status kd-status--aktivna" style={{ fontSize: 'var(--font-size-xs)' }}>
                      {z.role || z.requestedRole || '—'}
                    </span>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                    {z.created_at || z.createdAt
                      ? formatDate(z.created_at || z.createdAt)
                      : '—'}
                  </td>
                  <td>
                    <button
                      className="kd-btn kd-btn--ghost kd-btn--sm"
                      onClick={() => setAktivniId(aktivniId === z.id ? null : z.id)}
                    >
                      {aktivniId === z.id ? 'Zatvori' : 'Pregled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Decision modal ── */}
      {aktivniId && aktivni && (
        <div className="kd-modal-overlay" onClick={e => e.target === e.currentTarget && setAktivniId(null)}>
          <div className="kd-modal">
            <div className="kd-modal-header">
              <h3 className="kd-modal-title">Zahtjev za odobravanje</h3>
              <button className="kd-modal-close" onClick={() => setAktivniId(null)}>✕</button>
            </div>
            <div className="kd-modal-body">
              <div className="kd-detail-grid" style={{ marginBottom: 'var(--space-5)' }}>
                <div className="kd-detail-field">
                  <label>Ime i prezime</label>
                  <span>{aktivni.ime} {aktivni.prezime}</span>
                </div>
                <div className="kd-detail-field">
                  <label>Email</label>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{aktivni.email}</span>
                </div>
                <div className="kd-detail-field">
                  <label>Rola</label>
                  <span>{aktivni.role || aktivni.requestedRole}</span>
                </div>
                {aktivni.username && (
                  <div className="kd-detail-field">
                    <label>Korisničko ime</label>
                    <span>@{aktivni.username}</span>
                  </div>
                )}
                {aktivni.institution && (
                  <div className="kd-detail-field">
                    <label>Institucija</label>
                    <span>{aktivni.institution}</span>
                  </div>
                )}
              </div>

              <div className="kd-divider" />
              <p className="kd-detail-section-title">Razlog odbijanja (obavezno za odbijanje)</p>
              <textarea
                className="kd-textarea"
                placeholder="Unesite razlog odbijanja…"
                value={razlog}
                onChange={e => setRazlog(e.target.value)}
              />
            </div>
            <div className="kd-modal-footer">
              <button
                className="kd-btn kd-btn--danger"
                onClick={() => handleOdbij(aktivni.id)}
                disabled={submitting || !razlog.trim()}
              >
                {submitting ? 'Slanje…' : 'Odbij'}
              </button>
              <button
                className="kd-btn kd-btn--success"
                onClick={() => handleOdobri(aktivni.id, aktivni.role || aktivni.requestedRole)}
                disabled={submitting}
              >
                {submitting ? 'Slanje…' : 'Odobri nalog'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`kd-toast kd-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15"/>
    </svg>
  );
}
function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
function IconCheck({ size = 24, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconWarning({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}