// PrijavaDetaljiModal.jsx
// Full detail modal for a single application.
// Shows student info, oglas info, documents, internship progress (if started).
// Allows coordinator to approve or reject while the application is pending.

import { useState, useEffect } from 'react';
import { koordinatorService } from '../../services/koordinatorService';
import { formatDate } from '../../data/mockPrakse';

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

export default function PrijavaDetaljiModal({ prijavaId, onClose, onOdluka, initialReject = false }) {
  const [prijava, setPrijava]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [pokaziOdbij, setPokazOdbij]= useState(initialReject);
  const [razlog, setRazlog]         = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aktivniTab, setAktivniTab] = useState('info');

  useEffect(() => {
    setPokazOdbij(initialReject);
    setRazlog('');
  }, [prijavaId, initialReject]);

  useEffect(() => {
    setLoading(true);
    koordinatorService.getPrijavaDetalji(prijavaId)
      .then(res => {
        if (res.success) setPrijava(res.data);
        else setError('Greška pri učitavanju detalja.');
      })
      .catch(() => setError('Greška pri učitavanju detalja.'))
      .finally(() => setLoading(false));
  }, [prijavaId]);

  const mozeOdluciti = prijava?.status === 'CEKA_KOORDINATORA' || prijava?.status === 'PODNESENA';

  const handleOdobri = async () => {
    setSubmitting(true);
    await onOdluka(prijavaId, 'odobrena', '');
    setSubmitting(false);
  };

  const handleOdbij = async () => {
    if (!razlog.trim()) return;
    setSubmitting(true);
    await onOdluka(prijavaId, 'odbijena', razlog);
    setSubmitting(false);
  };

  const statusBadge = (status) => {
    const s = STATUS_LABELS[status] || { label: status, cls: 'kd-status--default' };
    return <span className={`kd-status ${s.cls}`}>{s.label}</span>;
  };

  const oglas = prijava?.Oglas || prijava?.Ogla || prijava?.oglas || {};
  const kompanija = oglas?.Kompanija || oglas?.kompanija || {};
  const kompanijaUser = kompanija?.User || kompanija?.user || {};
  const prikazi = (value) => value || '-';

  // Progress data from the associated praksa.
  const praksa      = prijava?.praksa;
  const aktivnosti  = praksa?.aktivnosti  || [];
  const prisustvo   = praksa?.prisustvo   || [];
  const evaluacija  = praksa?.evaluacija;
  const ugovor      = praksa?.ugovor;

  const prisutanBroj  = prisustvo.filter(p => p.prisutan).length;
  const prisustvoPost = prisustvo.length > 0 ? Math.round((prisutanBroj / prisustvo.length) * 100) : 0;

  const TABS = [
    { id: 'info',      label: 'Informacije' },
    { id: 'dokumenti', label: 'Dokumenti'   },
    { id: 'tok',       label: 'Tok prakse'  },
  ];

  return (
    <div className="kd-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="kd-modal">
        <div className="kd-modal-header">
          <h3 className="kd-modal-title">Detalji prijave</h3>
          <button className="kd-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* ── Inner tab nav ── */}
        <div style={{ padding: '0 var(--space-6)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: 'var(--space-2)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`kd-tab-btn${aktivniTab === t.id ? ' kd-tab-btn--active' : ''}`}
              style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-sm)' }}
              onClick={() => setAktivniTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="kd-modal-body">
          {loading && <div className="kd-loading">Učitavanje…</div>}
          {error   && <div style={{ color: 'var(--color-danger)' }}>{error}</div>}

          {!loading && !error && prijava && (
            <>
              {/* ── TAB: INFORMACIJE ── */}
              {aktivniTab === 'info' && (
                <>
                  <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>Status:</span>
                    {statusBadge(prijava.status)}
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-faint)', marginLeft: 'auto' }}>
                      Prijavljeno: {formatDate(prijava.datumPrijave)}
                    </span>
                  </div>

                  {/* Student */}
                  <div className="kd-detail-section">
                    <p className="kd-detail-section-title">Student</p>
                    <div className="kd-detail-grid">
                      <div className="kd-detail-field"><label>Ime i prezime</label><span>{prijava.Student?.User?.ime} {prijava.Student?.User?.prezime}</span></div>
                      <div className="kd-detail-field"><label>Email</label><span>{prijava.Student?.User?.email}</span></div>
                      <div className="kd-detail-field"><label>Indeks</label><span style={{ fontFamily: 'monospace' }}>{prijava.Student?.index_number}</span></div>
                      <div className="kd-detail-field"><label>Godina studija</label><span>{prijava.Student?.year_of_study}</span></div>
                      <div className="kd-detail-field"><label>Odsjek</label><span>{prijava.Student?.Odsjek?.naziv}</span></div>
                    </div>
                    {prijava.student?.bio && (
                      <div style={{ marginTop: 'var(--space-3)' }}>
                        <div className="kd-detail-field"><label>O studentu</label><span style={{ display: 'block', marginTop: 2, lineHeight: 1.6 }}>{prijava.student.bio}</span></div>
                      </div>
                    )}
                    {prijava.student?.vjestine && (
                      <div style={{ marginTop: 'var(--space-2)' }}>
                        <div className="kd-detail-field"><label>Vještine</label><span>{prijava.student.vjestine}</span></div>
                      </div>
                    )}
                  </div>

                  <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-4) 0' }} />

                  {/* Oglas / Kompanija */}
                  <div className="kd-detail-section">
                    <p className="kd-detail-section-title">Oglas i kompanija</p>
                    <div className="kd-detail-grid">
                      <div className="kd-detail-field"><label>Naziv oglasa</label><span>{prikazi(oglas.naziv)}</span></div>
                      <div className="kd-detail-field"><label>Kompanija</label><span>{prikazi(kompanija.naziv)}</span></div>
                      <div className="kd-detail-field"><label>Kontakt osoba</label><span>{prikazi(kompanija.kontaktOsoba || kompanijaUser.ime)}</span></div>
                      <div className="kd-detail-field"><label>Kontakt email</label><span>{prikazi(kompanijaUser.email)}</span></div>
                      <div className="kd-detail-field"><label>Telefon</label><span>{prikazi(kompanija.telefon)}</span></div>
                      <div className="kd-detail-field"><label>Adresa</label><span>{prikazi(kompanija.adresa)}</span></div>
                      <div className="kd-detail-field"><label>Djelatnost</label><span>{prikazi(kompanija.djelatnost)}</span></div>
                      <div className="kd-detail-field"><label>Lokacija</label><span>{prikazi(oglas.lokacija)}</span></div>
                      <div className="kd-detail-field"><label>Tip rada</label><span>{prikazi(oglas.tip)}</span></div>
                      <div className="kd-detail-field"><label>Broj mjesta</label><span>{prikazi(oglas.brojMjesta)}</span></div>
                      <div className="kd-detail-field"><label>Trajanje</label><span>{oglas.trajanje ? `${oglas.trajanje} ${Number(oglas.trajanje) === 1 ? 'mjesec' : 'mjeseci'}` : '-'}</span></div>
                      <div className="kd-detail-field"><label>Rok prijave</label><span>{oglas.rokPrijave ? formatDate(oglas.rokPrijave) : '-'}</span></div>
                      <div className="kd-detail-field"><label>Početak prakse</label><span>{oglas.datumPocetka ? formatDate(oglas.datumPocetka) : '-'}</span></div>
                      <div className="kd-detail-field"><label>Oblast</label><span>{prikazi(oglas.oblast)}</span></div>
                      {kompanija.opisPoslovanja && (
                        <div className="kd-detail-field" style={{ gridColumn: '1 / -1' }}><label>Opis kompanije</label><span>{kompanija.opisPoslovanja}</span></div>
                      )}
                      {oglas.opis && (
                        <div className="kd-detail-field" style={{ gridColumn: '1 / -1' }}><label>Opis oglasa</label><span>{oglas.opis}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Coordinator's previous comment if rejected */}
                  {prijava.razlogOdbijanja && (
                    <>
                      <div style={{ height: 1, background: 'var(--color-border)', margin: 'var(--space-4) 0' }} />
                      <div className="kd-detail-section">
                        <p className="kd-detail-section-title">Razlog odbijanja</p>
                        <div style={{
                          background: 'var(--color-danger-subtle)',
                          border: '1px solid var(--color-danger)',
                          borderRadius: 'var(--radius-md)',
                          padding: 'var(--space-3)',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-danger)',
                        }}>
                          {prijava.razlogOdbijanja}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ── TAB: DOKUMENTI ── */}
              {aktivniTab === 'dokumenti' && (
  <div>
    {(!prijava.Dokuments || prijava.Dokuments.length === 0) ? (
      <div className="kd-empty">
        <p className="kd-empty-text">Student nije uploadovao dokumente uz ovu prijavu.</p>
      </div>
    ) : (
      <div className="kd-table-wrap">
        <table className="kd-table">
          <thead>
            <tr><th>Dokument</th><th>Tip</th><th>Datum uploada</th></tr>
          </thead>
          <tbody>
            {prijava.Dokuments.map(d => (
              <tr key={d.id}>
                <td>{d.original_name}</td>
                <td>{d.tip_dokumenta}</td>
                <td>{formatDate(d.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

              {/* ── TAB: TOK PRAKSE ── */}
              {aktivniTab === 'tok' && (
                <div>
                  {!praksa ? (
                    <div className="kd-info-banner">
                      <IconInfo /> Praksa još nije počela. Tok prakse bit će vidljiv nakon konačnog odobrenja.
                    </div>
                  ) : (
                    <>
                      {/* Ugovor */}
                      <div className="kd-detail-section">
                        <p className="kd-detail-section-title">Ugovor</p>
                        {ugovor ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <span className="kd-status kd-status--odobrena">Generisan</span>
                            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-muted)' }}>
                              {formatDate(ugovor.createdAt)}
                            </span>
                          </div>
                        ) : (
                          <div className="kd-info-banner"><IconInfo /> Ugovor još nije generisan.</div>
                        )}
                      </div>

                      {/* Prisustvo */}
                      <div className="kd-detail-section">
                        <p className="kd-detail-section-title">Prisustvo</p>
                        {prisustvo.length === 0 ? (
                          <div className="kd-info-banner"><IconInfo /> Evidencija prisustva još nije dostupna.</div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
                              <div className="kd-progress-bar-wrap" style={{ flex: 1 }}>
                                <div className="kd-progress-bar" style={{ width: `${prisustvoPost}%` }} />
                              </div>
                              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-dark)', minWidth: 45 }}>
                                {prisustvoPost}%
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                                ({prisutanBroj}/{prisustvo.length} dana)
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Aktivnosti */}
                      <div className="kd-detail-section">
                        <p className="kd-detail-section-title">Evidencija aktivnosti ({aktivnosti.length})</p>
                        {aktivnosti.length === 0 ? (
                          <div className="kd-info-banner"><IconInfo /> Student još nije unio aktivnosti.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                            {aktivnosti.map(a => (
                              <div key={a.id} style={{
                                background: 'var(--color-surface-alt)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                padding: 'var(--space-3) var(--space-4)',
                              }}>
                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)', marginBottom: 4 }}>
                                  {formatDate(a.createdAt)}
                                </div>
                                <div style={{ fontSize: 'var(--font-size-base)' }}>{a.opis || '—'}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Evaluacija */}
                      <div className="kd-detail-section">
                        <p className="kd-detail-section-title">Evaluacija</p>
                        {evaluacija ? (
                          <div style={{ display: 'flex', gap: 'var(--space-6)' }}>
                            {evaluacija.ocjena && (
                              <div className="kd-detail-field">
                                <label>Ocjena</label>
                                <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
                                  {evaluacija.ocjena}/5
                                </span>
                              </div>
                            )}
                            {evaluacija.komentar && (
                              <div className="kd-detail-field" style={{ flex: 1 }}>
                                <label>Komentar kompanije</label>
                                <span style={{ display: 'block', marginTop: 2, lineHeight: 1.6 }}>{evaluacija.komentar}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="kd-info-banner"><IconInfo /> Evaluacija još nije popunjena.</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* ── Approve / Reject actions ── */}
              {mozeOdluciti && (
                <>
                  {pokaziOdbij && (
                    <div style={{
                      marginTop: 'var(--space-4)',
                      background: 'var(--color-danger-subtle)',
                      border: '1px solid var(--color-danger)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                    }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-danger)' }}>
                        Razlog odbijanja (obavezno)
                      </label>
                      <textarea
                        className="kd-textarea"
                        placeholder="Unesite razlog odbijanja prijave…"
                        value={razlog}
                        onChange={e => setRazlog(e.target.value)}
                        style={{ borderColor: 'var(--color-danger)' }}
                      />
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Footer ── */}
        {!loading && !error && prijava && mozeOdluciti && (
          <div className="kd-modal-footer">
            {!pokaziOdbij ? (
              <>
                <button className="kd-btn kd-btn--danger" onClick={() => setPokazOdbij(true)} disabled={submitting}>
                  ✕ Odbij prijavu
                </button>
                <button className="kd-btn kd-btn--success" onClick={handleOdobri} disabled={submitting}>
                  {submitting ? 'Slanje…' : '✓ Proslijedi kompaniji'}
                </button>
              </>
            ) : (
              <>
                <button className="kd-btn kd-btn--ghost" onClick={() => { setPokazOdbij(false); setRazlog(''); }} disabled={submitting}>
                  Odustani
                </button>
                <button
                  className="kd-btn kd-btn--danger"
                  onClick={handleOdbij}
                  disabled={submitting || !razlog.trim()}
                  style={!razlog.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {submitting ? 'Slanje…' : 'Potvrdi odbijanje'}
                </button>
              </>
            )}
          </div>
        )}

        {!loading && !error && prijava && !mozeOdluciti && (
          <div className="kd-modal-footer">
            <button className="kd-btn kd-btn--ghost" onClick={onClose}>Zatvori</button>
          </div>
        )}
      </div>
    </div>
  );
}
function IconInfo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
}
