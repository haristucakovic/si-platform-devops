// StudentListaPregled.jsx
import { useState, useEffect, useCallback } from 'react';
import { koordinatorService } from '../../services/koordinatorService';
import { formatDate } from '../../data/mockPrakse';

const STATUS_MAP = {
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

const AKTIVNI_STATUSI = ['CEKA_KOORDINATORA', 'CEKA_KOMPANIJU', 'U_RAZMATRANJU', 'ODOBRENA', 'PODNESENA'];
const ZAVRSENI_STATUSI = ['ODUSTAO', 'ODBIJENA', 'ODBIJENA_KOORDINATOR', 'ODBIJENA_KOMPANIJA'];

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'kd-status--default' };
  return <span className={`kd-status ${s.cls}`}>{s.label}</span>;
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconEmpty() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function IconWarning() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

export default function StudentListaPregled() {
  const [studenti, setStudenti]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [inputVal, setInputVal]     = useState('');
  const [pretraga, setPretraga]     = useState('');
  const [odabraniId, setOdabraniId] = useState(null);

  const ucitaj = useCallback((p) => {
    setLoading(true); setError('');
    koordinatorService.getStudenti(p)
      .then(res => {
        if (res.success) setStudenti(res.data);
        else setError('Greška pri učitavanju.');
      })
      .catch(() => setError('Greška pri učitavanju.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { ucitaj(pretraga); }, [ucitaj, pretraga]);

  const odabrani = studenti.find(s => s.id === odabraniId);

  // Helper: get name from nested User object
  const ime = (s) => s?.User?.ime || s?.user?.ime || '';
  const prezime = (s) => s?.User?.prezime || s?.user?.prezime || '';
  const email = (s) => s?.User?.email || s?.user?.email || '';
  const odsjekNaziv = (s) => s?.Odsjek?.naziv || s?.odsjek?.naziv || '—';
  const prijave = (s) => s?.PrijavaNaPraksus || s?.prijave || [];

  return (
    <div>
      <div className="kd-module-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <h2 className="kd-module-title">Studenti ({studenti.length})</h2>
          <div className="kd-stu-search-wrap">
            <div className="kd-stu-search-inner">
              <span className="kd-stu-search-icon"><IconSearch /></span>
              <input
                className="kd-stu-search-input"
                placeholder="Pretraži studente..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') setPretraga(inputVal); }}
              />
              {(inputVal || pretraga) && (
                <button
                  type="button"
                  className="kd-stu-search-clear"
                  onClick={() => { setPretraga(''); setInputVal(''); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="kd-loading">Učitavanje studenata…</div>}

      {error && (
        <div className="kd-empty">
          <IconWarning />
          <p className="kd-empty-text">{error}</p>
        </div>
      )}

      {!loading && !error && studenti.length === 0 && (
        <div className="kd-empty">
          <IconEmpty />
          <p className="kd-empty-text">Nema studenata za prikaz.</p>
        </div>
      )}

      {!loading && !error && studenti.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: odabraniId ? '1fr 420px' : '1fr',
          gap: 'var(--space-5)',
          alignItems: 'start',
        }}>
          {/* ── Table ── */}
          <div className="kd-table-wrap">
            <table className="kd-table">
              <thead>
                <tr>
                  <th>Ime i prezime</th>
                  <th>Indeks</th>
                  <th>Odsjek</th>
                  <th>God.</th>
                  <th>Aktivna prijava</th>
                  <th>Ukupno</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {studenti.map(s => {
                  const p = prijave(s);
                  const aktivna = p.find(x => AKTIVNI_STATUSI.includes(x.status));
                  return (
                    <tr key={s.id} className={odabraniId === s.id ? 'kd-row--selected' : ''}>
                      <td>
                        <strong>{ime(s)} {prezime(s)}</strong>
                        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                          {email(s)}
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-muted)' }}>
                        {s.index_number || '—'}
                      </td>
                      <td>{odsjekNaziv(s)}</td>
                      <td style={{ textAlign: 'center' }}>{s.year_of_study || '—'}</td>
                      <td>
                        {aktivna
                          ? <StatusBadge status={aktivna.status} />
                          : <span style={{ color: 'var(--color-faint)', fontSize: 'var(--font-size-xs)' }}>Nema</span>}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {p.length}
                      </td>
                      <td>
                        <button
                          className="kd-btn kd-btn--ghost kd-btn--sm"
                          onClick={() => {
                            const noviId = odabraniId === s.id ? null : s.id;
                            setOdabraniId(noviId);
                            if (noviId) window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          {odabraniId === s.id ? 'Zatvori' : 'Detalji'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Side panel ── */}
          {odabraniId && odabrani && (
            <StudentProfilPanel
              student={odabrani}
              helpers={{ ime, prezime, email, odsjekNaziv, prijave }}
              onClose={() => setOdabraniId(null)}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Student detail side panel ────────────────────────────────────────────────
function StudentProfilPanel({ student: s, helpers, onClose }) {
  const [aktivniTab, setAktivniTab] = useState('profil');
  const p = helpers.prijave(s);

  const aktivne  = p.filter(x => AKTIVNI_STATUSI.includes(x.status));
  const zavrsene = p.filter(x => ZAVRSENI_STATUSI.includes(x.status));

  const TABS = [
    { id: 'profil', label: 'Profil' },
    { id: 'prakse', label: `Prakse (${p.length})` },
  ];

  return (
    <div className="kd-side-panel">
      <div className="kd-side-panel-header">
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-dark)' }}>
            {helpers.ime(s)} {helpers.prezime(s)}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginTop: 2 }}>
            {s.index_number}
          </div>
        </div>
        <button className="kd-modal-close" onClick={onClose}>✕</button>
      </div>

      {/* Inner tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', padding: '0 var(--space-4)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`kd-tab-btn${aktivniTab === t.id ? ' kd-tab-btn--active' : ''}`}
            style={{ fontSize: 'var(--font-size-sm)', padding: 'var(--space-2) var(--space-3)' }}
            onClick={() => setAktivniTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="kd-side-panel-body">
        {/* ── Profil tab ── */}
        {aktivniTab === 'profil' && (
          <>
            <div className="kd-detail-grid" style={{ marginBottom: 'var(--space-4)' }}>
              <div className="kd-detail-field">
                <label>Email</label>
                <span style={{ fontSize: 'var(--font-size-sm)', wordBreak: 'break-all' }}>{helpers.email(s)}</span>
              </div>
              <div className="kd-detail-field">
                <label>Indeks</label>
                <span style={{ fontFamily: 'monospace' }}>{s.index_number || '—'}</span>
              </div>
              <div className="kd-detail-field">
                <label>Odsjek</label>
                <span>{helpers.odsjekNaziv(s)}</span>
              </div>
              <div className="kd-detail-field">
                <label>Godina studija</label>
                <span>{s.year_of_study || '—'}</span>
              </div>
            </div>

            <div className="kd-divider" />
            <p className="kd-detail-section-title">Pregled prijava</p>
            <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
              {[
                { val: p.length, label: 'Ukupno', color: 'var(--color-primary)' },
                { val: p.filter(x => x.status === 'ODOBRENA').length, label: 'Praksa odobrena', color: 'var(--color-success)' },
                { val: p.filter(x => x.status === 'CEKA_KOORDINATORA' || x.status === 'PODNESENA').length, label: 'Čeka koordinatora', color: 'var(--color-warning)' },
              ].map(({ val, label, color }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Prakse tab ── */}
        {aktivniTab === 'prakse' && (
          <div>
            {p.length === 0 ? (
              <div className="kd-empty" style={{ padding: 'var(--space-8) 0' }}>
                <IconEmpty />
                <p className="kd-empty-text">Student nema prijava.</p>
              </div>
            ) : (
              <>
                {aktivne.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <p className="kd-detail-section-title">Trenutna / aktivna</p>
                    {aktivne.map(x => <PrijavaKartica key={x.id} prijava={x} highlight />)}
                  </div>
                )}
                {zavrsene.length > 0 && (
                  <div>
                    <p className="kd-detail-section-title">Historija</p>
                    {zavrsene.map(x => <PrijavaKartica key={x.id} prijava={x} />)}
                  </div>
                )}
                <div className="kd-info-banner" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--font-size-xs)' }}>
                  Detaljan tok prakse bit će dostupan nakon konačnog odobrenja.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PrijavaKartica({ prijava, highlight }) {
  const s = STATUS_MAP[prijava.status] || { label: (prijava.status || '').replace(/_/g, ' '), cls: 'kd-status--default' };

  const oglasNaziv = prijava?.Ogla?.naziv || prijava?.Oglas?.naziv || prijava?.oglas?.naziv || '—';
  const kompNaziv  = prijava?.Ogla?.Kompanija?.naziv || prijava?.Oglas?.Kompanija?.naziv || prijava?.oglas?.kompanija?.naziv || '';

  return (
    <div style={{
      background: highlight ? 'var(--color-primary-subtle)' : 'var(--color-surface-alt)',
      border: `1px solid ${highlight ? 'var(--color-border-mid)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-4)',
      marginBottom: 'var(--space-2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-dark)' }}>
          {oglasNaziv}
        </span>
        <span className={`kd-status ${s.cls}`} style={{ fontSize: 'var(--font-size-xs)' }}>
          {s.label}
        </span>
      </div>
      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
        {kompNaziv && <span>{kompNaziv} · </span>}
        {prijava.datumPrijave && formatDate(prijava.datumPrijave)}
      </div>
    </div>
  );
}
