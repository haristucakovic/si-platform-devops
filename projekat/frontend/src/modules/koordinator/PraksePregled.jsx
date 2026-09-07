import { useEffect, useState } from 'react';
import {
  getCoordinatorPractices,
  getPracticeActivities,
  getPracticeReport,
  downloadPracticeContract,
} from '../../services/prakseService';
import { formatDate } from '../../data/mockPrakse';
import {
  PRACTICE_FILTERS,
  practiceLifecycleLabel,
  practiceLifecycleTone,
} from '../../utils/practiceLifecycle';

const STATUS_CLASS = {
  active: 'kd-status--aktivna',
  pending: 'kd-status--cekanje',
  finished: 'kd-status--zavrsena',
  withdrawn: 'kd-status--odbijena',
};

function lifecycleBadge(status) {
  const tone = practiceLifecycleTone(status);
  return (
    <span className={`kd-status ${STATUS_CLASS[tone] || 'kd-status--default'}`}>
      {practiceLifecycleLabel(status)}
    </span>
  );
}

export default function PraksePregled() {
  const [prakse, setPrakse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [activitiesModal, setActivitiesModal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [reportModal, setReportModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getCoordinatorPractices(filter)
      .then((result) => {
        if (mounted) setPrakse(result.prakse || []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Greška pri učitavanju praksi.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filter]);

  async function openActivities(praksa) {
    setActivitiesModal(praksa);
    setActivitiesLoading(true);
    try {
      const data = await getPracticeActivities(praksa.id);
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }

  async function openReport(praksa) {
    setReportModal(praksa);
    setReportData(null);
    setReportLoading(true);
    try {
      const data = await getPracticeReport(praksa.id);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setReportLoading(false);
    }
  }

  return (
    <div>
      <div className="kd-module-header">
        <div>
          <h2 className="kd-module-title">Prakse</h2>
          <p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>
            Potvrđene prakse studenata sa vašeg fakulteta.
          </p>
        </div>
        <select className="kd-select" value={filter} onChange={(event) => setFilter(event.target.value)}>
          {PRACTICE_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {loading && <div className="kd-loading">Učitavanje praksi...</div>}
      {error && (
        <div className="kd-empty">
          <IconWarning />
          <p className="kd-empty-text">{error}</p>
        </div>
      )}

      {!loading && !error && prakse.length === 0 && (
        <div className="kd-empty">
          <IconEmpty />
          <p className="kd-empty-text">Nema praksi za prikaz.</p>
        </div>
      )}

      {!loading && !error && prakse.length > 0 && (
        <div className="kd-table-wrap">
          <table className="kd-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Fakultet / Odsjek</th>
                <th>Praksa / Kompanija</th>
                <th>Datum početka</th>
                <th>Datum završetka</th>
                <th>Status</th>
                <th>Aktivnosti</th>
                <th>Izvještaj</th>
              </tr>
            </thead>
            <tbody>
              {prakse.map((praksa) => (
                <tr key={praksa.id}>
                  <td>
                    <strong>{praksa.student?.ime} {praksa.student?.prezime}</strong>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                      {praksa.student?.index_number || '-'}
                    </div>
                  </td>
                  <td>
                    <div>{praksa.student?.fakultet || '-'}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                      {praksa.student?.odsjek || '-'}
                    </div>
                  </td>
                  <td>
                    <div>{praksa.oglas?.naziv || '-'}</div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-muted)' }}>
                      {praksa.kompanija?.naziv || '-'}
                    </div>
                  </td>
                  <td>{formatDate(praksa.datumPocetka)}</td>
                  <td>{formatDate(praksa.datumKraja)}</td>
                  <td>{lifecycleBadge(praksa.lifecycleStatus)}</td>
                  <td>
                    <button type="button" className="kd-select" onClick={() => openActivities(praksa)}>
                      Aktivnosti
                    </button>
                  </td>
                  <td>
                    <button type="button" className="kd-select" onClick={() => openReport(praksa)}>
                      Izvještaj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activitiesModal && (
        <div className="cd-modal-overlay" onClick={() => setActivitiesModal(null)}>
          <div className="cd-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>Aktivnosti studenta</h2>

            {activitiesLoading ? (
              <p>Učitavanje aktivnosti...</p>
            ) : activities.length === 0 ? (
              <p>Nema evidentiranih aktivnosti.</p>
            ) : (
              activities.map((a) => (
                <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #ddd' }}>
                  <strong>{new Date(a.datum).toLocaleDateString()}</strong>
                  <p>{a.opis}</p>
                </div>
              ))
            )}

            <button className="kd-select" onClick={() => setActivitiesModal(null)}>
              Zatvori
            </button>
          </div>
        </div>
      )}

      {reportModal && (
        <div className="cd-modal-overlay" role="dialog" aria-modal="true" onClick={() => setReportModal(null)}>
          <div className="cd-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cd-modal-close" onClick={() => setReportModal(null)} aria-label="Zatvori">
              &times;
            </button>
            <h2 className="cd-contract-title">
              Izvještaj — {reportModal.student?.ime} {reportModal.student?.prezime}
            </h2>

            {reportLoading ? (
              <p>Učitavanje...</p>
            ) : !reportData ? (
              <p>Greška pri učitavanju podataka.</p>
            ) : (
              <>
                {reportData.evaluacijaStudenta ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <p className="cd-form-label" style={{ marginBottom: '0.5rem' }}>Evaluacija studenta</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 1.5rem', fontSize: '0.875rem' }}>
                      <span>Tehničke vještine</span><span><strong>{reportData.evaluacijaStudenta.tehnickeVjestine}/5</strong></span>
                      <span>Komunikacija</span><span><strong>{reportData.evaluacijaStudenta.komunikacija}/5</strong></span>
                      <span>Radna etika</span><span><strong>{reportData.evaluacijaStudenta.radnaEtika}/5</strong></span>
                      <span>Inicijativa</span><span><strong>{reportData.evaluacijaStudenta.inicijativa}/5</strong></span>
                      <span>Timski rad</span><span><strong>{reportData.evaluacijaStudenta.timskiRad}/5</strong></span>
                      <span>Ukupna ocjena</span><span><strong>{reportData.evaluacijaStudenta.ukupnaOcjena}/5</strong></span>
                    </div>
                    {reportData.evaluacijaStudenta.komentar && (
                      <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        {reportData.evaluacijaStudenta.komentar}
                      </p>
                    )}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Kompanija još nije evaluirala studenta.</p>
                )}

                {reportData.prisustvo && reportData.prisustvo.ukupnoEvidentirano > 0 && (
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    <p className="cd-form-label" style={{ marginBottom: '0.25rem' }}>Prisustvo</p>
                    <span>Prisutnih dana: <strong>{reportData.prisustvo.prisutanDana} / {reportData.prisustvo.ukupnoEvidentirano}</strong></span>
                    {reportData.prisustvo.ukupnoSati > 0 && (
                      <span style={{ marginLeft: '1rem' }}>Sati: <strong>{reportData.prisustvo.ukupnoSati}h</strong></span>
                    )}
                  </div>
                )}

                {reportData.sadrzaj ? (
                  <>
                    <p className="cd-form-label" style={{ marginBottom: '0.5rem' }}>Generisani izvještaj</p>
                    <pre className="cd-contract-content">{reportData.sadrzaj}</pre>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button
                        type="button"
                        className="cd-btn cd-btn--secondary"
                        onClick={() => downloadPracticeContract({
                          sadrzaj: reportData.sadrzaj,
                          ugovor: { broj: `izvjestaj-${reportModal?.id}` }
                        })}
                      >
                        Preuzmi izvještaj (PDF)
                      </button>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-muted, #888)' }}>Izvještaj još nije generisan od strane kompanije.</p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function IconEmpty() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-faint)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
