// PrijavePregled.jsx
// Lists applications with filtering, search, and decision modal

import { useState, useEffect, useCallback } from 'react';
import { koordinatorService } from '../../services/koordinatorService';
import PrijavaDetalji from './PrijavaDetalji';
import { formatDate } from '../../data/mockPrakse';
import { studentDecisionLabel } from '../../utils/applicationStatus';

const STATUS_LABELS = {
  CEKA_KOORDINATORA: { label: 'Čeka koordinatora', cls: 'kd-status--cekanje' },
  CEKA_KOMPANIJU: { label: 'Proslijeđeno kompaniji', cls: 'kd-status--razmatranje' },
  U_RAZMATRANJU: { label: 'Uži krug', cls: 'kd-status--razmatranje' },
  ODOBRENA: { label: 'Praksa odobrena', cls: 'kd-status--odobrena' },
  ODBIJENA_KOORDINATOR: { label: 'Odbijeno od koordinatora', cls: 'kd-status--odbijena' },
  ODBIJENA_KOMPANIJA: { label: 'Odbijeno od kompanije', cls: 'kd-status--odbijena' },
  PODNESENA: { label: 'Čeka koordinatora', cls: 'kd-status--cekanje' },
  ODBIJENA: { label: 'Odbijeno', cls: 'kd-status--odbijena' },
  ODUSTAO: { label: 'Odustao', cls: 'kd-status--odbijena' },
};

function statusBadge(status) {
  const s = STATUS_LABELS[status] || { label: status, cls: 'kd-status--default' };
  return <span className={`kd-status ${s.cls}`}>{s.label}</span>;
}

function studentDecisionBadge(status) {
  const cls = status === 'PRIHVACENO'
    ? 'kd-status--odobrena'
    : status === 'ODBIJENO'
      ? 'kd-status--odbijena'
      : status === 'NA_CEKANJU'
        ? 'kd-status--cekanje'
        : 'kd-status--default';

  return <span className={`kd-status ${cls}`}>{studentDecisionLabel(status)}</span>;
}

export default function PrijavePregled({ filterStatus = 'CEKA_KOORDINATORA', onOdluka }) {
  const [prijave, setPrijave]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [stranica, setStranica]       = useState(1);
  const [ukupnoStr, setUkupnoStr]     = useState(1);
  const [ukupno, setUkupno]           = useState(0);
  const [aktivnaId, setAktivnaId]     = useState(null);
  const [odbijMod, setOdbijMod]       = useState(false);
  const [toast, setToast]             = useState(null);

  const ucitaj = useCallback((str = 1) => {
    setLoading(true);
    setError('');
    const params = { stranica: str, limit: 15 };
    if (filterStatus) params.status = filterStatus;
    koordinatorService.getPrijave(params)
      .then(res => {
        if (res.success) {
          setPrijave(res.data.prijave);
          setUkupnoStr(res.data.stranice);
          setUkupno(res.data.ukupno);
          setStranica(str);
        } else {
          setError('Greška pri učitavanju prijava.');
        }
      })
      .catch(() => setError('Greška pri učitavanju prijava.'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { ucitaj(1); }, [ucitaj]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOdluka = async (id, odluka, razlog) => {
    try {
      const res = await koordinatorService.odluciPrijava(id, odluka, razlog);
      if (res.success) {
        showToast(res.message, 'success');
        setAktivnaId(null);
        setOdbijMod(false);
        ucitaj(stranica);
        onOdluka?.();
      } else {
        showToast(res.message || 'Greška pri odluci.', 'danger');
      }
    } catch {
      showToast('Greška pri odluci.', 'danger');
    }
  };

  return (
    <div>
      <div className="kd-module-header">
        <h2 className="kd-module-title">
          {filterStatus === 'CEKA_KOORDINATORA'
            ? 'Prijave koje čekaju koordinatora'
            : 'Sve prijave'}
          {ukupno > 0 && <span style={{ marginLeft: 8, fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)', fontWeight: 500 }}>({ukupno})</span>}
        </h2>
      </div>

      {loading && <div className="kd-loading">Učitavanje prijava…</div>}
      {error   && <div className="kd-empty"><IconWarning /><p className="kd-empty-text">{error}</p></div>}

      {!loading && !error && prijave.length === 0 && (
        <div className="kd-empty">
          <IconCheck />
          <p className="kd-empty-text">Nema prijava u ovoj kategoriji.</p>
        </div>
      )}

      {!loading && !error && prijave.length > 0 && (
        <>
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Indeks</th>
                  <th>Oglas / Kompanija</th>
                  <th>Datum prijave</th>
                  <th>Status</th>
                  <th>Odluka studenta</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {prijave.map(p => {
                  const student = p.Student;
                  const user    = student?.User;
                  const oglas   = p.Ogla;
                  const komp    = oglas?.Kompanija;
                  const mozeOdluciti = p.status === 'CEKA_KOORDINATORA' || p.status === 'PODNESENA';
                  return (
                    <tr key={p.id}>
                      <td>
                        <strong>{user?.ime} {user?.prezime}</strong>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{user?.email}</div>
                      </td>
                      <td style={{ color: 'var(--color-muted)', fontFamily: 'monospace' }}>{student?.index_number}</td>
                      <td>
                        <div>{oglas?.naziv || '—'}</div>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{komp?.naziv || ''}</div>
                      </td>
                      <td style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
                        {formatDate(p.datumPrijave)}
                      </td>
                      <td>{statusBadge(p.status)}</td>
                      <td>{studentDecisionBadge(p.studentStatus)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button
                            className="kd-btn kd-btn--ghost kd-btn--sm"
                            onClick={() => { setAktivnaId(p.id); setOdbijMod(false); }}
                          >
                            Detalji
                          </button>
                          {mozeOdluciti && (
                            <>
                              <button
                                className="kd-btn kd-btn--success kd-btn--sm"
                                onClick={() => handleOdluka(p.id, 'odobrena', '')}
                              >
                                Proslijedi kompaniji
                              </button>
                              <button
                                className="kd-btn kd-btn--danger kd-btn--sm"
                                onClick={() => { setAktivnaId(p.id); setOdbijMod(true); }}
                              >
                                Odbij
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {ukupnoStr > 1 && (
            <div className="kd-pagination">
              <button
                className="kd-btn kd-btn--ghost kd-btn--sm"
                disabled={stranica === 1}
                onClick={() => ucitaj(stranica - 1)}
              >← Prethodna</button>
              <span className="kd-pagination-info">Stranica {stranica} / {ukupnoStr}</span>
              <button
                className="kd-btn kd-btn--ghost kd-btn--sm"
                disabled={stranica === ukupnoStr}
                onClick={() => ucitaj(stranica + 1)}
              >Sljedeća →</button>
            </div>
          )}
        </>
      )}

      {aktivnaId && (
        <PrijavaDetalji
          prijavaId={aktivnaId}
          initialReject={odbijMod}
          onClose={() => { setAktivnaId(null); setOdbijMod(false); }}
          onOdluka={handleOdluka}
        />
      )}

      {toast && (
        <div className={`kd-toast kd-toast--${toast.type}`}>{toast.msg}</div>
      )}
    </div>
  );
}
function IconCheck() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}
function IconEmpty() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}
