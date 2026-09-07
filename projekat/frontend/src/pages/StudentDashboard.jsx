import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Upload } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { checkDeactivation, deactivateAccount, deleteMyAccount } from '../services/userService';
import { getActiveListings, getClosedListings } from '../services/listingsService';
import {
  acceptApplicationByStudent,
  createApplication,
  declineApplicationByStudent,
  getMyApplications,
  withdrawApplication,
} from '../services/applicationsService';
import { getMyDocuments, attachDocumentsToOglas, getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { getFavourites, addFavourite, removeFavourite } from '../services/favouritesService';
import {
  downloadPracticeContract,
  generatePracticeContract,
  getMyPractices,
  getPracticeActivities,
  getPracticeAttendance,
  createPracticeActivity,
  getPracticeReport,
} from '../services/prakseService';
import {
  formatDate, relativeDate, trajanjeLabel, mjestLabel, deadlineInfo,
} from '../data/mockPrakse';
import {
  APPLICATION_STATUS,
  applicationStageSteps,
  isStudentDecisionPending,
  studentApplicationStatusLabel,
  studentApplicationStatusTone,
} from '../utils/applicationStatus';
import PrijavniVodic from './PrijavniVodic';

const WITHDRAWABLE_STATUSES = new Set([
  APPLICATION_STATUS.WAITING_COORDINATOR,
  APPLICATION_STATUS.WAITING_COMPANY,
  APPLICATION_STATUS.SHORTLISTED,
  APPLICATION_STATUS.APPROVED,
  APPLICATION_STATUS.LEGACY_SUBMITTED,
]);

function canWithdraw(app) {
  return WITHDRAWABLE_STATUSES.has(app?.status);
}
import {
  PRACTICE_FILTERS,
  practiceLifecycleLabel,
  practiceLifecycleTone,
} from '../utils/practiceLifecycle';
import './StudentDashboard.css';
import { useApplicationLimit } from '../hooks/useApplicationLimit';
import { EvaluacijaKompanijeModal } from '../modules/evaluations/EvaluacijaKompanije';
import { getMyStudentEvaluations, getMyReceivedEvaluations } from '../services/evaluationService';

const LOGO_COLORS = ['#1a6fd4', '#0e9e6e', '#6d4ce1', '#e07b1a', '#0891b2', '#be185d', '#7c3aed', '#c0392b'];
function deriveLogoColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return LOGO_COLORS[Math.abs(h) % LOGO_COLORS.length];
}
function deriveLogo(naziv) {
  const parts = (naziv || '').split(/\s+/).filter(w => w.length > 2);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (naziv || '??').slice(0, 2).toUpperCase();
}
function mapOglas(oglas) {
  const kompNaziv = oglas.Kompanija?.naziv || 'Kompanija';
  return {
    id: oglas.id,
    naziv: oglas.naziv,
    kompanija: kompNaziv,
    kompanijaID: oglas.kompanijaID || oglas.Kompanija?.id || null,
    logo: deriveLogo(kompNaziv),
    logoColor: deriveLogoColor(kompNaziv),
    opis: oglas.opis || '',
    tehnologije: oglas.tehnologije || [],
    trajanje: oglas.trajanje ? Number(oglas.trajanje) : null,
    brojMjesta: oglas.brojMjesta,
    lokacija: oglas.lokacija || '',
    tip: oglas.tip || 'Onsite',
    datumObjave: oglas.datumObjave ? oglas.datumObjave.slice(0, 10) : null,
    datumPocetka: oglas.datumPocetka ? oglas.datumPocetka.slice(0, 10) : null,
    stipendija: oglas.placenaPraksa,
    rokPrijave: oglas.rokPrijave ? oglas.rokPrijave.slice(0, 10) : null,
    aktivan: oglas.status === 'AKTIVAN',
    uslovi: oglas.uslovi || [],
    kontakt: {
      osoba: oglas.Kompanija?.kontaktOsoba || '',
      email: oglas.Kompanija?.User?.email || '',
    },
  };
}

function isNovo(datumObjave) {
  if (!datumObjave) return false;
  return Date.now() - new Date(datumObjave).getTime() < 3 * 24 * 60 * 60 * 1000;
}

function applicationOglasId(application) {
  return Number(application?.oglasID);
}

function ApplicationStageIndicator({ application }) {
  const steps = applicationStageSteps(application);
  return (
    <div className="sd-application-stage" aria-label="Tok prijave">
      {steps.map((step) => (
        <div key={step.label} className={`sd-application-stage-step sd-application-stage-step--${step.state}`}>
          <span className="sd-application-stage-dot" />
          <span className="sd-application-stage-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── PraksaCard ─────────────────────────────────────────────────────────────
function PraksaCard({ praksa, onSelect, isFavourite, onToggleFavourite, application }) {
  const inactive = !praksa.aktivan;
  return (
    <div
      className={`sd-card-wrap${inactive ? ' sd-card-wrap--inactive' : ''}`}
      onClick={() => onSelect(praksa)}
    >
      <article className="sd-card" tabIndex={0} role="button" aria-label={`${praksa.naziv} — ${praksa.kompanija}`}>
        <button
          className={`sd-heart-btn${isFavourite ? ' sd-heart-btn--active' : ''}`}
          onClick={e => { e.stopPropagation(); onToggleFavourite(praksa.id); }}
          aria-label={isFavourite ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
          title={isFavourite ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={isFavourite ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div className="sd-card-head">
          {isNovo(praksa.datumObjave) && (
            <span className="sd-novo-badge">Novo</span>
          )}
          <div className="sd-company-row">
            <div className="sd-logo" style={{ background: praksa.logoColor }}>
              {praksa.logo}
            </div>
            <div className="sd-company-info">
              <span className="sd-company-name">{praksa.kompanija}</span>
              {praksa.lokacija && (
                <span className="sd-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {praksa.lokacija}
                </span>
              )}
            </div>
            <div className="sd-head-badges">
              {inactive && <span className="sd-inactive-badge">Istekao</span>}
              {application && (
                <span className={`sd-application-card-badge sd-application-card-badge--${studentApplicationStatusTone(application)}`}>
                  {studentApplicationStatusLabel(application)}
                </span>
              )}
              <span className={`sd-tip-badge sd-tip--${praksa.tip.toLowerCase()}`}>
                {!praksa.lokacija && (
                  <svg style={{ marginRight: '4px' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                )}
                {praksa.tip}
              </span>
              {praksa.stipendija && <span className="sd-stip-badge">Stipendija</span>}
            </div>
          </div>
          <h2 className="sd-card-title">{praksa.naziv}</h2>
          <p className="sd-card-opis">{praksa.opis}</p>
        </div>

        <div className="sd-tech-row">
          {praksa.tehnologije.map(t => (
            <span key={t} className="sd-tech-tag">{t}</span>
          ))}
        </div>

        <div className="sd-card-foot">
          <div className="sd-meta-row">
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {trajanjeLabel(praksa.trajanje)}
            </span>
            <span className="sd-meta-dot" />
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {mjestLabel(praksa.brojMjesta)}
            </span>
            {praksa.datumPocetka && <>
              <span className="sd-meta-dot" />
              <span className="sd-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Počinje {formatDate(praksa.datumPocetka)}
              </span>
            </>}
          </div>
          <div className="sd-foot-right">
            <span className="sd-published">{relativeDate(praksa.datumObjave)}</span>
            <button
              className="sd-btn-detail"
              onClick={e => { e.stopPropagation(); onSelect(praksa); }}
              tabIndex={-1}
            >
              {inactive ? 'Pogledaj detalje' : 'Saznaj više'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

// ── PraksaModal ────────────────────────────────────────────────────────────
function PraksaModal({
  praksa,
  onClose,
  existingApplication,
  onStartApplication,
  isAtLimit,
  limitInfo,
}) {
  const dl = deadlineInfo(praksa.rokPrijave);
  const inactive = !praksa.aktivan;
  const alreadyApplied = Boolean(existingApplication);
  const statusMessage = inactive
    ? 'Nije moguće prijaviti se na neaktivan oglas.'
    : alreadyApplied
      ? `Već ste se prijavili na ovaj oglas. Status prijave: ${studentApplicationStatusLabel(existingApplication)}.`
      : isAtLimit && limitInfo
        ? `Dostigli ste maksimalan broj aktivnih prijava (${limitInfo.current}/${limitInfo.max}). Pričekajte da neka prijava bude riješena prije nego se prijavite ponovo.`
        : '';
  const statusTone = inactive ? 'error' : alreadyApplied ? studentApplicationStatusTone(existingApplication) : isAtLimit ? 'error' : 'info';

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="sd-modal-header">
          <div className="sd-company-row">
            <div className="sd-logo" style={{ background: praksa.logoColor }}>{praksa.logo}</div>
            <div className="sd-company-info">
              {praksa.kompanijaID ? (
                <Link
                  to={`/company/${praksa.kompanijaID}`}
                  state={{ from: 'svi' }}
                  className="sd-company-profile-link"
                  onClick={e => e.stopPropagation()}
                >
                  {praksa.kompanija}
                </Link>
              ) : (
                <span className="sd-company-name">{praksa.kompanija}</span>
              )}
              {praksa.lokacija && (
                <span className="sd-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {praksa.lokacija}
                </span>
              )}
              <div className="sd-head-badges">
                <span className={`sd-tip-badge sd-tip--${praksa.tip.toLowerCase()}`}>
                  {!praksa.lokacija && (
                    <svg style={{ marginRight: '4px' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                  )}
                  {praksa.tip}
                </span>
                {praksa.stipendija && <span className="sd-stip-badge">Stipendija</span>}
              </div>
            </div>
          </div>
          <h2 className="sd-modal-title">{praksa.naziv}</h2>
          <button className="sd-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="sd-modal-body">

          {/* Meta chips */}
          <div className="sd-modal-meta">
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {trajanjeLabel(praksa.trajanje)}
            </span>
            <span className="sd-meta-dot" />
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {mjestLabel(praksa.brojMjesta)}
            </span>
            {praksa.datumPocetka && <>
              <span className="sd-meta-dot" />
              <span className="sd-meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Počinje {formatDate(praksa.datumPocetka)}
              </span>
            </>}
          </div>

          {/* Deadline */}
          <div className={`sd-modal-deadline sd-modal-deadline--${dl.cls}`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <div className="sd-modal-deadline-text">
              <span className="sd-modal-deadline-label">Rok za prijavu</span>
              <span className="sd-modal-deadline-date">{formatDate(praksa.rokPrijave)}</span>
            </div>
            <span className={`sd-modal-deadline-badge sd-modal-deadline-badge--${dl.cls}`}>{dl.label}</span>
          </div>

          {/* Opis */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Opis prakse</p>
            <p className="sd-modal-text">{praksa.opis}</p>
          </div>

          {/* Uslovi */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Uslovi i zahtjevi</p>
            <ul className="sd-modal-list">
              {praksa.uslovi.map((u, i) => (
                <li key={i} className="sd-modal-list-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>{u}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tehnologije */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Tehnologije</p>
            <div className="sd-tech-row">
              {praksa.tehnologije.map(t => (
                <span key={t} className="sd-tech-tag">{t}</span>
              ))}
            </div>
          </div>

          {/* Kontakt */}
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Kontakt</p>
            <div className="sd-modal-contact">
              <div className="sd-modal-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span>{praksa.kontakt.osoba}</span>
              </div>
              <div className="sd-modal-contact-row">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a href={`mailto:${praksa.kontakt.email}`} className="sd-modal-email">{praksa.kontakt.email}</a>
              </div>
            </div>
            {praksa.kompanijaID && (
              <Link
                to={`/company/${praksa.kompanijaID}`}
                className="sd-company-profile-link"
                onClick={e => e.stopPropagation()}
              >
                Pogledajte profil kompanije
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            )}
          </div>

          {/* CTA */}
          {statusMessage && (
            <div className="sd-application-messages">
              <p className={`sd-application-message sd-application-message--${statusTone}`}>
                {statusMessage}
              </p>
            </div>
          )}

          <div className="sd-modal-cta">
            <button
              className="sd-btn-apply"
              type="button"
              onClick={() => onStartApplication(praksa)}
              disabled={inactive || (!alreadyApplied && isAtLimit)}
            >
              {inactive ? 'Oglas nije aktivan' : alreadyApplied ? 'Pregled prijave' : isAtLimit ? 'Limit prijava dostignut' : 'Prijavi se na praksu'}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="sd-btn-modal-cancel" onClick={onClose}>Zatvori</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DOC_TYPE_LABELS_SD = { CV: 'CV', MOTIVACIONO_PISMO: 'Mot. pismo', OSTALO: 'Ostalo' };

function ApplicationModal({
  praksa,
  onClose,
  onCancel,
  existingApplication,
  onSubmit,
  submitting,
  submitError,
  submitSuccess,
}) {
  const [existingDocs, setExistingDocs] = useState([]);
  const [selectedExistingIds, setSelectedExistingIds] = useState(new Set());
  const [attachingExisting, setAttachingExisting] = useState(false);
  const [attachMsg, setAttachMsg] = useState('');

  const [showNewUpload, setShowNewUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  const inactive = !praksa.aktivan;
  const hasApplication = Boolean(existingApplication);
  const alreadyApplied = hasApplication && !submitSuccess;
  const currentStatusApplication = existingApplication || (submitSuccess ? { status: APPLICATION_STATUS.WAITING_COORDINATOR } : null);
  const currentStatus = currentStatusApplication
    ? studentApplicationStatusLabel(currentStatusApplication)
    : 'Nije podnesena';
  const canSubmit = !hasApplication && !inactive && !submitSuccess;
  const docsDisabled = hasApplication || inactive || submitting || submitSuccess;

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let active = true;
    getMyDocuments()
      .then(data => { if (active) setExistingDocs(data || []); })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  // Unique docs by file_name (keep most recent upload per file)
  const uniqueDocs = useMemo(() => {
    const seen = new Map();
    for (const d of existingDocs) {
      const existing = seen.get(d.file_name);
      if (!existing || new Date(d.created_at) > new Date(existing.created_at)) {
        seen.set(d.file_name, d);
      }
    }
    return [...seen.values()];
  }, [existingDocs]);

  // file_names already attached to this specific oglas
  const attachedFileNames = useMemo(() =>
    new Set(existingDocs
      .filter(d => Number(d.oglas_id) === Number(praksa.id))
      .map(d => d.file_name)
    ), [existingDocs, praksa.id]);

  function toggleExistingDoc(id, fileName) {
    if (attachedFileNames.has(fileName)) return;
    setSelectedExistingIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setAttachMsg('');
  }

  async function handleAttachExisting() {
    if (!selectedExistingIds.size) return;
    setAttachingExisting(true);
    setAttachMsg('');
    try {
      await attachDocumentsToOglas(praksa.id, [...selectedExistingIds]);
      const fresh = await getMyDocuments();
      setExistingDocs(fresh || []);
      setSelectedExistingIds(new Set());
      setAttachMsg('success:Dokumenti uspješno priloženi.');
    } catch (err) {
      setAttachMsg('error:' + (err.message || 'Greška pri prilaganju.'));
    } finally {
      setAttachingExisting(false);
    }
  }

  async function handleUpload() {
    if (!selectedFiles.length) {
      setUploadMessage('Odaberite barem jedan dokument.');
      return;
    }
    setUploading(true);
    setUploadMessage('');
    try {
      const formData = new FormData();
      selectedFiles.forEach(item => {
        formData.append('files', item.file);
        formData.append('tip_dokumenta', item.tip);
      });
      const token = sessionStorage.getItem('token');
      const response = await fetch('/api/dokumenti/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Greška pri uploadu.');
      const uploadedIds = (data.data || []).map(d => d.id);
      if (uploadedIds.length > 0) {
        await attachDocumentsToOglas(praksa.id, uploadedIds);
      }
      const fresh = await getMyDocuments();
      setExistingDocs(fresh || []);
      setUploadMessage('Dokumenti uspješno uploadovani i priloženi uz prijavu!');
      setSelectedFiles([]);
    } catch (err) {
      setUploadMessage(err.message || 'Greška pri uploadu.');
    } finally {
      setUploading(false);
    }
  }

  const [attachOk, attachErr] = attachMsg.startsWith('success:')
    ? [attachMsg.slice(8), '']
    : attachMsg.startsWith('error:')
      ? ['', attachMsg.slice(6)]
      : ['', ''];

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal sd-application-modal" onClick={e => e.stopPropagation()}>
        <div className="sd-modal-header">
          <button className="sd-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <p className="sd-modal-section-title">Prijava na praksu</p>
          <h2 className="sd-modal-title">{praksa.naziv}</h2>
          <p className="sd-application-company">{praksa.kompanija}</p>
        </div>

        <div className="sd-modal-body">
          {(inactive || alreadyApplied || submitError || submitSuccess) && (
            <div className="sd-application-messages">
              {inactive && <p className="sd-application-message sd-application-message--error">Nije moguće prijaviti se na neaktivan oglas.</p>}
              {alreadyApplied && <p className="sd-application-message sd-application-message--info">Već ste se prijavili na ovaj oglas.</p>}
              {submitError && <p className="sd-application-message sd-application-message--error">{submitError}</p>}
              {submitSuccess && <p className="sd-application-message sd-application-message--success">{submitSuccess}</p>}
            </div>
          )}

          <section className="sd-application-flow" aria-label="Prijava na praksu">
            <div className="sd-application-flow-head">
              <div>
                <p className="sd-modal-section-title">Status prijave</p>
                <h3 className="sd-application-title">{praksa.naziv}</h3>
                <p className="sd-application-company">{praksa.kompanija}</p>
              </div>
              <span className={`sd-application-status sd-application-status--${studentApplicationStatusTone(currentStatusApplication)}`}>
                {currentStatus}
              </span>
            </div>

            {/* ── Dokumentacija ── */}
            <div className="sd-application-docs">
              <p className="sd-application-subtitle">Dokumentacija</p>

              {/* Existing docs */}
              {uniqueDocs.length > 0 && (
                <div className="sd-existing-docs">
                  <p className="sd-existing-docs-label">Odaberi iz postojećih dokumenata</p>
                  <ul className="sd-existing-docs-list">
                    {uniqueDocs.map(doc => {
                      const alreadyAttached = attachedFileNames.has(doc.file_name);
                      const isSelected = selectedExistingIds.has(doc.id);
                      return (
                        <li
                          key={doc.id}
                          className={`sd-existing-doc-item${alreadyAttached ? ' sd-existing-doc-item--attached' : ''}${isSelected ? ' sd-existing-doc-item--selected' : ''}`}
                          onClick={() => !docsDisabled && !alreadyAttached && toggleExistingDoc(doc.id, doc.file_name)}
                        >
                          <span className="sd-existing-doc-check">
                            {alreadyAttached
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                              : <span className={`sd-existing-doc-checkbox${isSelected ? ' sd-existing-doc-checkbox--checked' : ''}`} />
                            }
                          </span>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: doc.mime_path?.includes('pdf') ? '#dc2626' : '#1a6fd4', flexShrink: 0 }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="sd-existing-doc-name">{doc.original_name}</span>
                          <span className="sd-existing-doc-type">{DOC_TYPE_LABELS_SD[doc.tip_dokumenta] || doc.tip_dokumenta}</span>
                          {alreadyAttached && <span className="sd-existing-doc-attached-label">Priloženo</span>}
                        </li>
                      );
                    })}
                  </ul>

                  {attachOk && <p className="sd-upload-message sd-upload-message--success">{attachOk}</p>}
                  {attachErr && <p className="sd-upload-message sd-upload-message--error">{attachErr}</p>}

                  {selectedExistingIds.size > 0 && !docsDisabled && (
                    <button className="sd-btn-docs" type="button" onClick={handleAttachExisting} disabled={attachingExisting}>
                      {attachingExisting ? 'Prilaganje...' : `Priloži odabrane (${selectedExistingIds.size})`}
                    </button>
                  )}
                </div>
              )}

              {/* New file upload */}
              <div className="sd-document-hook" style={{ marginTop: uniqueDocs.length > 0 ? '12px' : 0 }}>
                <div className="sd-document-hook-text">
                  <Upload size={20} strokeWidth={2.4} />
                  <div>
                    <span>Dodaj novi dokument</span>
                    <small>PDF, DOC ili DOCX, max 5 MB</small>
                  </div>
                </div>
                <button className="sd-btn-docs" type="button"
                  onClick={() => { setUploadMessage(''); setShowNewUpload(v => !v); }}
                  disabled={docsDisabled}>
                  {showNewUpload ? 'Zatvori' : 'Odaberi fajl'}
                </button>
              </div>

              {showNewUpload && (
                <div className="sd-new-upload-panel">
                  <input type="file" accept=".pdf,.doc,.docx" multiple
                    onChange={e => {
                      setSelectedFiles(Array.from(e.target.files).map(file => ({ file, tip: 'CV' })));
                      setUploadMessage('');
                    }}
                  />
                  {selectedFiles.map((item, index) => (
                    <div key={`${item.file.name}-${index}`} className="sd-file-row">
                      <span>{item.file.name}</span>
                      <select value={item.tip} onChange={e => {
                        const updated = [...selectedFiles];
                        updated[index] = { ...updated[index], tip: e.target.value };
                        setSelectedFiles(updated);
                      }}>
                        <option value="CV">CV</option>
                        <option value="MOTIVACIONO_PISMO">Motivaciono pismo</option>
                        <option value="OSTALO">Ostalo</option>
                      </select>
                    </div>
                  ))}
                  {uploadMessage && <p className="sd-upload-message">{uploadMessage}</p>}
                  {selectedFiles.length > 0 && (
                    <div className="sd-upload-actions">
                      <button className="sd-btn-modal-cancel" type="button" onClick={() => setSelectedFiles([])}>Poništi</button>
                      <button className="sd-btn-apply" type="button" onClick={handleUpload} disabled={uploading}>
                        {uploading ? 'Upload...' : 'Pošalji dokumente'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="sd-application-actions">
              <button className="sd-btn-modal-cancel" type="button" onClick={onCancel} disabled={submitting}>
                Odustani
              </button>
              {canSubmit && (
                <button className="sd-btn-apply" type="button" onClick={() => onSubmit(praksa)} disabled={submitting}>
                  {submitting ? 'Slanje prijave...' : 'Podnesi prijavu'}
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function MyApplicationsPanel({
  applications,
  prakse,
  myPractices = [],
  onViewOglas,
  evaluatedAppIds = new Set(),
  onEvaluate,
  receivedEvaluations = [],
  onStudentDecision,
  decisionProcessingId,
  decisionSuccess,
  finishedPracticeAppIds = new Set(),
  onWithdraw,
  withdrawProcessingId,
}) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [decisionModal, setDecisionModal] = useState(null);
  const [decisionError, setDecisionError] = useState('');
  const [withdrawModal, setWithdrawModal] = useState(null);
  const [withdrawError, setWithdrawError] = useState('');

  const praksaById = useMemo(() => {
    const m = new Map();
    prakse.forEach(p => m.set(Number(p.id), p));
    return m;
  }, [prakse]);

  const total = applications.length;
  const waitingCoordinator = applications.filter(a =>
    a.status === APPLICATION_STATUS.WAITING_COORDINATOR ||
    a.status === APPLICATION_STATUS.LEGACY_SUBMITTED
  ).length;
  const waitingCompany = applications.filter(a => a.status === APPLICATION_STATUS.WAITING_COMPANY).length;
  const shortlisted = applications.filter(a => a.status === APPLICATION_STATUS.SHORTLISTED).length;
  const approved = applications.filter(a => a.status === APPLICATION_STATUS.APPROVED).length;
  const rejected = applications.filter(a =>
    a.status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
    a.status === APPLICATION_STATUS.REJECTED_COMPANY ||
    a.status === APPLICATION_STATUS.LEGACY_REJECTED ||
    a.status === APPLICATION_STATUS.WITHDRAWN
  ).length;

  function toggleFilter(filter) {
    setActiveFilter(prev => prev === filter ? null : filter);
  }

  const visibleApplications = activeFilter === 'coordinator'
    ? applications.filter(a =>
      a.status === APPLICATION_STATUS.WAITING_COORDINATOR ||
      a.status === APPLICATION_STATUS.LEGACY_SUBMITTED
    )
    : activeFilter === 'company'
      ? applications.filter(a => a.status === APPLICATION_STATUS.WAITING_COMPANY)
      : activeFilter === 'shortlist'
        ? applications.filter(a => a.status === APPLICATION_STATUS.SHORTLISTED)
        : activeFilter === 'approved'
          ? applications.filter(a => a.status === APPLICATION_STATUS.APPROVED)
          : activeFilter === 'rejected'
            ? applications.filter(a =>
              a.status === APPLICATION_STATUS.REJECTED_COORDINATOR ||
              a.status === APPLICATION_STATUS.REJECTED_COMPANY ||
              a.status === APPLICATION_STATUS.LEGACY_REJECTED ||
              a.status === APPLICATION_STATUS.WITHDRAWN
            )
            : applications;

  function isRecentChange(app) {
    if (!app.updatedAt || app.status === APPLICATION_STATUS.WAITING_COORDINATOR) return false;
    return Date.now() - new Date(app.updatedAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  }

  function openDecisionModal(application, decision) {
    setDecisionError('');
    setDecisionModal({ application, decision });
  }

  async function confirmDecision() {
    if (!decisionModal) return;
    const result = await onStudentDecision(decisionModal.application.id, decisionModal.decision);
    if (result.ok) {
      setDecisionModal(null);
      setDecisionError('');
      return;
    }
    setDecisionError(result.message);
  }

  if (total === 0) {
    return (
      <div className="sd-empty">
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <p className="sd-empty-title">Nema prijava</p>
        <p className="sd-empty-sub">Prijavite se na praksu da vidite status ovdje.</p>
      </div>
    );
  }

  return (
    <div className="sd-apps-panel">
      <div className="sd-apps-filter-top">
        <button
          type="button"
          className={`sd-apps-total-btn${activeFilter === null ? ' active' : ''}`}
          onClick={() => setActiveFilter(null)}
        >
          <span>Ukupno</span>
          <strong>{total}</strong>
        </button>
      </div>

      <div className="sd-apps-stats">
        <div
          className={`sd-apps-stat sd-apps-stat--clickable${activeFilter === 'coordinator' ? ' sd-apps-stat--active-info' : ''}`}
          onClick={() => toggleFilter('coordinator')}
          role="button" tabIndex={0}
        >
          <span className="sd-apps-stat-value sd-apps-stat-value--info">{waitingCoordinator}</span>
          <span className="sd-apps-stat-label">Čeka koordinatora</span>
        </div>
        <div
          className={`sd-apps-stat sd-apps-stat--clickable${activeFilter === 'company' ? ' sd-apps-stat--active-info' : ''}`}
          onClick={() => toggleFilter('company')}
          role="button" tabIndex={0}
        >
          <span className="sd-apps-stat-value sd-apps-stat-value--info">{waitingCompany}</span>
          <span className="sd-apps-stat-label">Čeka kompaniju</span>
        </div>
        <div
          className={`sd-apps-stat sd-apps-stat--clickable${activeFilter === 'shortlist' ? ' sd-apps-stat--active-info' : ''}`}
          onClick={() => toggleFilter('shortlist')}
          role="button" tabIndex={0}
        >
          <span className="sd-apps-stat-value sd-apps-stat-value--info">{shortlisted}</span>
          <span className="sd-apps-stat-label">Uži krug</span>
        </div>
        <div
          className={`sd-apps-stat sd-apps-stat--clickable${activeFilter === 'approved' ? ' sd-apps-stat--active-success' : ''}`}
          onClick={() => toggleFilter('approved')}
          role="button" tabIndex={0}
        >
          <span className="sd-apps-stat-value sd-apps-stat-value--success">{approved}</span>
          <span className="sd-apps-stat-label">Praksa odobrena</span>
        </div>
        <div
          className={`sd-apps-stat sd-apps-stat--clickable${activeFilter === 'rejected' ? ' sd-apps-stat--active-error' : ''}`}
          onClick={() => toggleFilter('rejected')}
          role="button" tabIndex={0}
        >
          <span className="sd-apps-stat-value sd-apps-stat-value--error">{rejected}</span>
          <span className="sd-apps-stat-label">Odbijeno</span>
        </div>
      </div>

      {decisionSuccess && (
        <p className="sd-student-decision-feedback sd-student-decision-feedback--success" role="status">
          {decisionSuccess}
        </p>
      )}

      {visibleApplications.length === 0 ? (
        <div className="sd-apps-filter-empty">
          <p>Nema prijava za odabrani status.</p>
        </div>
      ) : (
        <div className="sd-list">
          {visibleApplications.map(app => {
            const oglas = praksaById.get(Number(app.oglasID));
            const applicationOglas = app.Oglas || app.Ogla;
            const kompNaziv = oglas?.kompanija || applicationOglas?.Kompanija?.naziv || 'Kompanija';
            const oglasNaziv = oglas?.naziv || applicationOglas?.naziv || 'Nepoznat oglas';
            const logoColor = deriveLogoColor(kompNaziv);
            const logo = deriveLogo(kompNaziv);
            const recent = isRecentChange(app);
            const inactive = !oglas;
            const canDecide = isStudentDecisionPending(app);

            return (
              <div
                key={app.id}
                className={`sd-card-wrap${inactive ? ' sd-card-wrap--inactive' : ''}`}
                onClick={() => oglas && onViewOglas(oglas)}
              >
                <article className="sd-card" tabIndex={inactive ? -1 : 0} role="button" aria-label={`${oglasNaziv} — ${kompNaziv}`}>

                  {/* HEAD */}
                  <div className="sd-card-head">
                    {recent && <span className="sd-novo-badge sd-novo-badge--update">Promjena statusa</span>}
                    <div className="sd-company-row">
                      <div className="sd-logo" style={{ background: logoColor }}>{logo}</div>
                      <div className="sd-company-info">
                        <span className="sd-company-name">{kompNaziv}</span>
                        {oglas?.lokacija && (
                          <span className="sd-location">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {oglas.lokacija}
                          </span>
                        )}
                      </div>
                      <div className="sd-head-badges">
                        {inactive && <span className="sd-inactive-badge">Istekao</span>}
                        <span className={`sd-application-card-badge sd-application-card-badge--${studentApplicationStatusTone(app)}`}>
                          {studentApplicationStatusLabel(app)}
                        </span>
                        {oglas?.tip && (
                          <span className={`sd-tip-badge sd-tip--${oglas.tip.toLowerCase()}`}>
                            {!oglas.lokacija && (
                              <svg style={{ marginRight: '4px' }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                            )}
                            {oglas.tip}
                          </span>
                        )}
                        {oglas?.stipendija && <span className="sd-stip-badge">Stipendija</span>}
                      </div>
                    </div>
                  </div>

                  {/* BODY */}
                  <h2 className="sd-card-title">{oglasNaziv}</h2>
                  {oglas?.opis && <p className="sd-card-opis">{oglas.opis}</p>}

                  {oglas?.tehnologije?.length > 0 && (
                    <div className="sd-tech-row">
                      {oglas.tehnologije.map(t => (
                        <span key={t} className="sd-tech-tag">{t}</span>
                      ))}
                    </div>
                  )}

                  <ApplicationStageIndicator application={app} />

                  {/* Student decision buttons */}
                  {(canDecide || canWithdraw(app)) && (
                    <div className="sd-student-decision-actions" onClick={e => e.stopPropagation()}>
                      {canDecide && (
                        <button type="button" className="sd-btn-apply sd-student-decision-btn"
                          disabled={decisionProcessingId === app.id}
                          onClick={() => openDecisionModal(app, 'accept')}>
                          Prihvati praksu
                        </button>
                      )}
                      {canDecide && (
                        <button type="button" className="sd-btn-danger sd-student-decision-btn"
                          disabled={decisionProcessingId === app.id}
                          onClick={() => openDecisionModal(app, 'decline')}>
                          Odbij praksu
                        </button>
                      )}
                      {canWithdraw(app) && (
                        <button type="button" className="sd-btn-neutral sd-student-decision-btn"
                          disabled={withdrawProcessingId === app.id}
                          onClick={() => { setWithdrawError(''); setWithdrawModal(app); }}>
                          Odustani od prijave
                        </button>
                      )}
                    </div>
                  )}

                  {/* FOOTER */}
                  <div className="sd-card-foot">
                    <div className="sd-meta-row">
                      {oglas?.trajanje && (
                        <>
                          <span className="sd-meta-item">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            {trajanjeLabel(oglas.trajanje)}
                          </span>
                          <span className="sd-meta-dot" />
                        </>
                      )}
                      <span className="sd-meta-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Prijavljeno {formatDate(app.datumPrijave?.slice(0, 10))}
                      </span>
                    </div>
                    <div className="sd-foot-right">
                      <button
                        className="sd-btn-detail"
                        disabled={inactive}
                        onClick={e => { e.stopPropagation(); if (oglas) onViewOglas(oglas); }}
                        tabIndex={-1}
                      >
                        {inactive ? 'Oglas istekao' : 'Pogledaj oglas'}
                        {!inactive && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                </article>
              </div>
            );
          })}
        </div>
      )}

      {decisionModal && (
        <div className="sd-modal-overlay sd-modal-overlay--top" onClick={() => {
          if (decisionProcessingId !== decisionModal.application.id) setDecisionModal(null);
        }}>
          <div className="sd-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className={`sd-confirm-icon sd-confirm-icon--${decisionModal.decision === 'accept' ? 'success' : 'danger'}`}>
              {decisionModal.decision === 'accept' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>
            <h3 className="sd-confirm-title">
              {decisionModal.decision === 'accept' ? 'Potvrda učešća' : 'Odbijanje prakse'}
            </h3>
            <p className="sd-confirm-text">
              {decisionModal.decision === 'accept'
                ? 'Da li želite prihvatiti učešće na ovoj praksi?'
                : 'Da li želite odbiti učešće na ovoj praksi?'}
            </p>
            {decisionError && (
              <p className="sd-student-decision-feedback sd-student-decision-feedback--error" role="alert">
                {decisionError}
              </p>
            )}
            <div className="sd-confirm-actions">
              <button
                type="button"
                className="sd-btn-secondary"
                disabled={decisionProcessingId === decisionModal.application.id}
                onClick={() => setDecisionModal(null)}
              >
                Odustani
              </button>
              <button
                type="button"
                className={decisionModal.decision === 'accept' ? 'sd-btn-apply sd-student-confirm-btn' : 'sd-btn-danger'}
                disabled={decisionProcessingId === decisionModal.application.id}
                onClick={confirmDecision}
              >
                {decisionProcessingId === decisionModal.application.id
                  ? 'Spremanje...'
                  : decisionModal.decision === 'accept' ? 'Prihvati praksu' : 'Odbij praksu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {withdrawModal && (
        <div className="sd-modal-overlay sd-modal-overlay--top" onClick={() => {
          if (withdrawProcessingId !== withdrawModal.id) setWithdrawModal(null);
        }}>
          <div className="sd-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="sd-confirm-icon sd-confirm-icon--danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <h3 className="sd-confirm-title">Odustajanje od prijave</h3>
            <p className="sd-confirm-text">
              Da li ste sigurni da želite odustati od ove prijave? Ova akcija se ne može poništiti.
            </p>
            {withdrawError && (
              <p className="sd-student-decision-feedback sd-student-decision-feedback--error" role="alert">
                {withdrawError}
              </p>
            )}
            <div className="sd-confirm-actions">
              <button
                type="button"
                className="sd-btn-secondary"
                disabled={withdrawProcessingId === withdrawModal.id}
                onClick={() => setWithdrawModal(null)}
              >
                Odustani
              </button>
              <button
                type="button"
                className="sd-btn-danger"
                disabled={withdrawProcessingId === withdrawModal.id}
                onClick={async () => {
                  const result = await onWithdraw(withdrawModal.id);
                  if (result.ok) {
                    setWithdrawModal(null);
                    setWithdrawError('');
                  } else {
                    setWithdrawError(result.message);
                  }
                }}
              >
                {withdrawProcessingId === withdrawModal.id ? 'Odustajanje...' : 'Potvrdi odustajanje'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyPracticesPanel({ practices, loading, error, filter, onFilterChange, evaluatedAppIds, onEvaluate }) {
  const [contract, setContract] = useState(null);
  const [contractError, setContractError] = useState('');
  const [openingContractId, setOpeningContractId] = useState(null);
  const [activitiesModal, setActivitiesModal] = useState(null);
  const [activityText, setActivityText] = useState('');
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [reportModal, setReportModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  async function openContract(praksa) {
    setOpeningContractId(praksa.id);
    setContractError('');
    try {
      const generated = await generatePracticeContract(praksa.id);
      setContract(generated);
    } catch (err) {
      setContractError(err.message || 'Greška pri generisanju ugovora.');
    } finally {
      setOpeningContractId(null);
    }
  }

  async function openActivities(praksa) {
    setActivitiesModal(praksa);
    setActivitiesLoading(true);

    try {
      const data = await getPracticeActivities(praksa.id);
      setActivities(data);
    } catch (err) {
      console.error(err);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }

  async function openAttendance(praksa) {
    setAttendanceModal(praksa);
    setAttendanceLoading(true);
    setAttendanceError('');

    try {
      const data = await getPracticeAttendance(praksa.id);
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      setAttendance([]);
      setAttendanceError(err.message || 'Greška pri učitavanju prisustva.');
    } finally {
      setAttendanceLoading(false);
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

  async function submitActivity() {
    if (!activitiesModal || !activityText.trim()) return;

    try {
      const created = await createPracticeActivity(
        activitiesModal.id,
        activityText.trim()
      );

      setActivities(prev => [created, ...prev]);
      setActivityText('');
    } catch (err) {
      setActivitiesError(
        err.message || 'Greška pri dodavanju aktivnosti.'
      );
    }
  }

  return (
    <div className="sd-apps-panel">
      <div className="sd-practices-header">
        <div>
          <h2 className="sd-practices-title">Moje prakse</h2>
          <p className="sd-practices-subtitle">Potvrđene prakse prikazane prema periodu realizacije.</p>
        </div>
        <div className="sd-practice-tabs" aria-label="Filter praksi">
          {PRACTICE_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`sd-practice-tab${filter === item.value ? ' active' : ''}`}
              onClick={() => onFilterChange(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="sd-results-info">Učitavanje praksi...</p>}
      {error && <p className="sd-results-info" style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {contractError && <p className="sd-results-info" style={{ color: 'var(--color-danger)' }}>{contractError}</p>}
      {!loading && !error && practices.length === 0 && (
        <div className="sd-apps-filter-empty"><p>Nema praksi za odabrani filter.</p></div>
      )}
      {!loading && !error && practices.length > 0 && (
        <div className="sd-apps-list">
          {practices.map((praksa) => (
            <article key={praksa.id} className="sd-confirmed-practice-card">
              <div className="sd-confirmed-practice-card-row">
                <div>
                  <p className="sd-app-card-company">{praksa.kompanija?.naziv || 'Kompanija'}</p>
                  <h3 className="sd-app-card-naziv">{praksa.oglas?.naziv || 'Praksa'}</h3>
                  <p className="sd-app-card-date">
                    {formatDate(praksa.datumPocetka)} - {formatDate(praksa.datumKraja)}
                  </p>
                </div>
                <div className="sd-practice-actions">
                  <span className={`sd-practice-badge sd-practice-badge--${practiceLifecycleTone(praksa.lifecycleStatus)}`}>
                    {practiceLifecycleLabel(praksa.lifecycleStatus)}
                  </span>
                  <button
                    type="button"
                    className="sd-btn-detail sd-practice-contract-btn"
                    disabled={openingContractId === praksa.id}
                    onClick={() => openContract(praksa)}
                  >
                    {openingContractId === praksa.id ? 'Generisanje...' : 'Ugovor'}
                  </button>
                  <button
                    type="button"
                    className="sd-btn-detail sd-practice-contract-btn"
                    onClick={() => openActivities(praksa)}
                  >
                    Aktivnosti
                  </button>
                  <button
                    type="button"
                    className="sd-btn-detail sd-practice-contract-btn"
                    onClick={() => openAttendance(praksa)}
                  >
                    Prisustvo
                  </button>
                  <button
                    type="button"
                    className="sd-btn-detail sd-practice-contract-btn"
                    onClick={() => openReport(praksa)}
                  >
                    Izvještaj
                  </button>
                </div>
              </div>
              {(praksa.lifecycleStatus === 'ZAVRSENA' || new Date(praksa.datumKraja) < new Date()) && (
                <div className="sd-eval-section" style={{ marginTop: 0 }}>
                  {evaluatedAppIds.has(praksa.prijavaID) ? (
                    <span className="sd-eval-done-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Evaluacija poslana
                    </span>
                  ) : (
                    <button
                      className="sd-eval-btn"
                      type="button"
                      onClick={() => onEvaluate(praksa)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      Evaluiraj kompaniju
                    </button>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {contract && (
        <div className="sd-modal-overlay" onClick={() => setContract(null)}>
          <div className="sd-modal sd-contract-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="sd-modal-header">
              <h2 className="sd-modal-title">Ugovor o praksi</h2>
              <button type="button" className="sd-modal-close" onClick={() => setContract(null)} aria-label="Zatvori">
                &times;
              </button>
            </div>
            <div className="sd-modal-body">
              <pre className="sd-contract-content">{contract.sadrzaj}</pre>
              <div className="sd-contract-actions">
                <button type="button" className="sd-btn-modal-cancel" onClick={() => setContract(null)}>
                  Zatvori
                </button>
                <button type="button" className="sd-btn-apply" onClick={() => downloadPracticeContract(contract)}>
                  Preuzmi ugovor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activitiesModal && (
        <div
          className="sd-modal-overlay"
          onClick={() => setActivitiesModal(null)}
        >
          <div
            className="sd-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sd-modal-header">
              <h2 className="sd-modal-title">
                Aktivnosti na praksi
              </h2>

              <button
                type="button"
                className="sd-modal-close"
                onClick={() => setActivitiesModal(null)}
              >
                &times;
              </button>
            </div>

            <div className="sd-modal-body">

              {activitiesError && (
                <div className="sd-error-banner">
                  {activitiesError}
                </div>
              )}

              <textarea
                className="sd-activity-textarea"
                value={activityText}
                onChange={(e) => setActivityText(e.target.value)}
                placeholder="Opišite aktivnosti koje ste obavljali tokom prakse..."
                rows={5}
              />

              <button
                type="button"
                className="sd-btn-apply"
                onClick={submitActivity}
              >
                Dodaj aktivnost
              </button>

              <hr style={{ margin: '1rem 0' }} />

              {activitiesLoading ? (
                <p>Učitavanje aktivnosti...</p>
              ) : activities.length === 0 ? (
                <p>Nema evidentiranih aktivnosti.</p>
              ) : (
                activities.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      marginBottom: '1rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid #ddd',
                    }}
                  >
                    <strong>
                      {new Date(a.datum).toLocaleDateString()}
                    </strong>

                    <p>{a.opis}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {attendanceModal && (
        <div className="sd-modal-overlay" onClick={() => setAttendanceModal(null)}>
          <div className="sd-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="sd-modal-header">
              <h2 className="sd-modal-title">Prisustvo na praksi</h2>
              <button type="button" className="sd-modal-close" onClick={() => setAttendanceModal(null)}>
                &times;
              </button>
            </div>

            <div className="sd-modal-body">
              {attendanceError && <div className="sd-error-banner">{attendanceError}</div>}
              {attendanceLoading ? (
                <p>Učitavanje prisustva...</p>
              ) : attendance.length === 0 ? (
                <p>Nema evidentiranog prisustva.</p>
              ) : (
                <div className="sd-attendance-list">
                  {attendance.map((item) => (
                    <div key={item.id} className="sd-attendance-row">
                      <div>
                        <strong>{new Date(item.datum).toLocaleDateString('bs-BA')}</strong>
                        {item.napomena && <p>{item.napomena}</p>}
                      </div>
                      <div className="sd-attendance-side">
                        <span className={`sd-attendance-status${item.status ? ' sd-attendance-status--present' : ' sd-attendance-status--absent'}`}>
                          {item.status ? 'Prisutan' : 'Odsutan'}
                        </span>
                        {item.brojSati !== null && item.brojSati !== undefined && (
                          <span className="sd-attendance-hours">{item.brojSati}h</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {reportModal && (
        <div className="sd-modal-overlay" onClick={() => setReportModal(null)}>
          <div className="sd-modal sd-contract-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="sd-modal-header">
              <h2 className="sd-modal-title">Izvještaj o praksi</h2>
              <button type="button" className="sd-modal-close" onClick={() => setReportModal(null)}>
                &times;
              </button>
            </div>
            <div className="sd-modal-body">
              {reportLoading ? (
                <p>Učitavanje izvještaja...</p>
              ) : !reportData ? (
                <p>Greška pri učitavanju podataka.</p>
              ) : (
                <>
                  {reportData.evaluacijaStudenta ? (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Evaluacija kompanije</p>
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
                    <p style={{ fontSize: '0.875rem', marginBottom: '1rem' }}>Kompanija još nije evaluirala vašu praksu.</p>
                  )}

                  {reportData.prisustvo && reportData.prisustvo.ukupnoEvidentirano > 0 && (
                    <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Prisustvo</p>
                      <span>Prisutnih dana: <strong>{reportData.prisustvo.prisutanDana} / {reportData.prisustvo.ukupnoEvidentirano}</strong></span>
                      {reportData.prisustvo.ukupnoSati > 0 && (
                        <span style={{ marginLeft: '1rem' }}>Ukupno sati: <strong>{reportData.prisustvo.ukupnoSati}h</strong></span>
                      )}
                    </div>
                  )}

                  {reportData.sadrzaj ? (
                    <>
                      <p style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Generisani izvještaj</p>
                      <pre className="sd-contract-content">{reportData.sadrzaj}</pre>
                    </>
                  ) : (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted, #888)' }}>Izvještaj još nije generisan od strane kompanije.</p>
                  )}
                </>
              )}
              <div className="sd-contract-actions">
                <button type="button" className="sd-btn-modal-cancel" onClick={() => setReportModal(null)}>
                  Zatvori
                </button>
                {reportData?.sadrzaj && (
                  <button
                    type="button"
                    className="sd-btn-apply"
                    onClick={() => downloadPracticeContract({
                      sadrzaj: reportData.sadrzaj,
                      ugovor: { broj: `izvjestaj-${reportModal?.id}` }
                    })}
                  >
                    Preuzmi izvještaj (PDF)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


// ── ClosedListingsPanel ───────────────────────────────────────────────────
function ClosedListingsPanel({ oglasi, loading, error, hasFilters, onResetFilters, search, onSearchChange }) {
  const [selectedOglas, setSelectedOglas] = useState(null);

  if (loading) return <p className="sd-results-info">Učitavanje zatvorenih oglasa...</p>;
  if (error) return <p className="sd-results-info" style={{ color: 'var(--color-danger)' }}>{error}</p>;

  return (
    <div className="sd-closed-panel" style={{ width: '100%', minHeight: '400px' }}>
      <div className="sd-main-search-wrap">
        <div className="sd-main-search-inner">
          <svg className="sd-main-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="sd-main-search-input"
            type="text"
            placeholder="Pretraži zatvorene oglase..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
          />
          {search && (
            <button className="sd-main-search-clear" onClick={() => onSearchChange('')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="sd-closed-header">
        <div className="sd-closed-header-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <div>
          <h2 className="sd-closed-title">Zatvoreni oglasi</h2>
          <p className="sd-closed-sub">
            Pregled isteklih oglasa radi uvida u zahtjeve kompanija.
            Prijava na zatvorene oglase nije moguća.
          </p>
        </div>
      </div>

      <p className="sd-results-info">
        {oglasi.length === 0 ? 'Nema zatvorenih oglasa.' : (
          <><strong>{oglasi.length}</strong> zatvorenih oglasa</>
        )}
      </p>

      {oglasi.length === 0 ? (
        <div className="sd-empty">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <p className="sd-empty-title">Nema zatvorenih oglasa</p>
          <p className="sd-empty-sub">
            {hasFilters ? 'Pokušaj s drugim filterima.' : 'Trenutno nema oglasa s isteklim rokom prijave.'}
          </p>
          {hasFilters && (
            <button className="sd-empty-link" onClick={onResetFilters}>Resetuj filtere</button>
          )}
        </div>
      ) : (
        <div className="sd-list">
          {oglasi.map(oglas => (
            <div
              key={oglas.id}
              className="sd-card-wrap sd-card-wrap--closed"
              onClick={() => setSelectedOglas(oglas)}
            >
              <article className="sd-card" tabIndex={0} role="button"
                aria-label={`${oglas.naziv} — ${oglas.kompanija} (zatvoreno)`}>
                <div className="sd-card-head">
                  <div className="sd-company-row">
                    <div className="sd-logo" style={{ background: oglas.logoColor }}>{oglas.logo}</div>
                    <div className="sd-company-info">
                      <span className="sd-company-name">{oglas.kompanija}</span>
                      {oglas.lokacija && (
                        <span className="sd-location">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {oglas.lokacija}
                        </span>
                      )}
                    </div>
                    <div className="sd-head-badges">
                      <span className="sd-inactive-badge">Zatvoreno</span>
                      <span className={`sd-tip-badge sd-tip--${oglas.tip.toLowerCase()}`}>{oglas.tip}</span>
                      {oglas.stipendija && <span className="sd-stip-badge">Stipendija</span>}
                    </div>
                  </div>
                  <h2 className="sd-card-title">{oglas.naziv}</h2>
                  <p className="sd-card-opis">{oglas.opis}</p>
                </div>
                {oglas.tehnologije.length > 0 && (
                  <div className="sd-tech-row">
                    {oglas.tehnologije.map(t => <span key={t} className="sd-tech-tag">{t}</span>)}
                  </div>
                )}
                <div className="sd-card-foot">
                  <div className="sd-meta-row">
                    <span className="sd-meta-item">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      Rok: {formatDate(oglas.rokPrijave)}
                    </span>
                    {oglas.trajanje && (
                      <>
                        <span className="sd-meta-dot" />
                        <span className="sd-meta-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                          {trajanjeLabel(oglas.trajanje)}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="sd-foot-right">
                    <button
                      className="sd-btn-detail sd-btn-detail--closed"
                      onClick={e => { e.stopPropagation(); setSelectedOglas(oglas); }}
                      tabIndex={-1}
                    >
                      Pogledaj detalje
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      )}

      {selectedOglas && (
        <ClosedOglasModal oglas={selectedOglas} onClose={() => setSelectedOglas(null)} />
      )}
    </div>
  );
}

// ── ClosedOglasModal ──────────────────────────────────────────────────────
function ClosedOglasModal({ oglas, onClose }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal" onClick={e => e.stopPropagation()}>
        <div className="sd-modal-header">
          <div className="sd-company-row">
            <div className="sd-logo" style={{ background: oglas.logoColor }}>{oglas.logo}</div>
            <div className="sd-company-info">
              {oglas.kompanijaID ? (
                <Link
                  to={`/company/${oglas.kompanijaID}`}
                  state={{ from: 'zatvoreni' }}
                  className="sd-company-name sd-company-name--link"
                  onClick={e => e.stopPropagation()}
                >
                  {oglas.kompanija}
                </Link>
              ) : (
                <span className="sd-company-name">{oglas.kompanija}</span>
              )}
              {oglas.lokacija && (
                <span className="sd-location">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {oglas.lokacija}
                </span>
              )}
              <div className="sd-head-badges">
                <span className="sd-inactive-badge">Zatvoreno</span>
                <span className={`sd-tip-badge sd-tip--${oglas.tip.toLowerCase()}`}>{oglas.tip}</span>
                {oglas.stipendija && <span className="sd-stip-badge">Stipendija</span>}
              </div>
            </div>
          </div>
          <h2 className="sd-modal-title">{oglas.naziv}</h2>
          <button className="sd-modal-close" onClick={onClose} aria-label="Zatvori">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="sd-modal-body">
          <div className="sd-closed-modal-notice">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Oglas je zatvoren — rok za prijavu je istekao {formatDate(oglas.rokPrijave)}. Prijava nije moguća.</span>
          </div>
          <div className="sd-modal-meta">
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {trajanjeLabel(oglas.trajanje)}
            </span>
            <span className="sd-meta-dot" />
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {mjestLabel(oglas.brojMjesta)}
            </span>
          </div>
          <div className="sd-modal-section">
            <p className="sd-modal-section-title">Opis prakse</p>
            <p className="sd-modal-text">{oglas.opis}</p>
          </div>
          {oglas.uslovi.length > 0 && (
            <div className="sd-modal-section">
              <p className="sd-modal-section-title">Uslovi i zahtjevi</p>
              <ul className="sd-modal-list">
                {oglas.uslovi.map((u, i) => (
                  <li key={i} className="sd-modal-list-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {oglas.tehnologije.length > 0 && (
            <div className="sd-modal-section">
              <p className="sd-modal-section-title">Tehnologije</p>
              <div className="sd-tech-row">
                {oglas.tehnologije.map(t => <span key={t} className="sd-tech-tag">{t}</span>)}
              </div>
            </div>
          )}
          {oglas.kontakt.osoba && (
            <div className="sd-modal-section">
              <p className="sd-modal-section-title">Kontakt</p>
              <div className="sd-modal-contact">
                <div className="sd-modal-contact-row">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>{oglas.kontakt.osoba}</span>
                </div>
              </div>
            </div>
          )}
          <div className="sd-modal-cta">
            <button className="sd-btn-modal-cancel" onClick={onClose}>Zatvori</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── StudentDashboard ───────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { darkMode, setDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [prakse, setPrakse] = useState([]);
  const [praksaLoading, setPraksaLoading] = useState(true);
  const [praksaError, setPraksaError] = useState('');

  const [zatvoreniOglasi, setZatvoreniOglasi] = useState([]);
  const [zatvoreniLoading, setZatvoreniLoading] = useState(false);
  const [zatvoreniError, setZatvoreniError] = useState('');
  const [zatvoreniLoaded, setZatvoreniLoaded] = useState(false);

  const [selectedPraksa, setSelectedPraksa] = useState(null);
  const [applicationPraksa, setApplicationPraksa] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterTehs, setFilterTehs] = useState([]);
  const [filterTips, setFilterTips] = useState([]);
  const [filterTrajanja, setFilterTrajanja] = useState([]);
  const [sortBy, setSortBy] = useState('najnovije');
  const [sectionsOpen, setSectionsOpen] = useState({ tech: false, duration: false, type: false, sort: false });

  const [activeTab, setActiveTab] = useState('svi');
  const [favourites, setFavourites] = useState(new Set());
  const [favouriteListings, setFavouriteListings] = useState([]);
  const [omiljeniShowAll, setOmiljeniShowAll] = useState(false);
  const [applications, setApplications] = useState([]);
  const { limit: applicationLimit, activeCount: activeApplicationCount, isAtLimit } = useApplicationLimit(applications);
  const [decisionProcessingId, setDecisionProcessingId] = useState(null);
  const [decisionSuccess, setDecisionSuccess] = useState('');
  const [withdrawProcessingId, setWithdrawProcessingId] = useState(null);
  const [myPractices, setMyPractices] = useState([]);
  const [myPracticesLoading, setMyPracticesLoading] = useState(false);
  const [myPracticesError, setMyPracticesError] = useState('');
  const [myPracticesFilter, setMyPracticesFilter] = useState('all');
  const vidljiviOmiljeni = useMemo(
    () => prakse.filter(p => favourites.has(p.id)),
    [prakse, favourites]
  );
  const [applyLoadingId, setApplyLoadingId] = useState(null);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  const [evalModalApp, setEvalModalApp] = useState(null);
  const [evaluatedAppIds, setEvaluatedAppIds] = useState(new Set());
  const [receivedEvaluations, setReceivedEvaluations] = useState([]);
  const finishedPracticeAppIds = useMemo(() => {
    return new Set(myPractices
      .filter(p => p.lifecycleStatus === 'ZAVRSENA' || new Date(p.datumKraja) < new Date())
      .map(p => p.prijavaID)
    );
  }, [myPractices]);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let active = true;
    setPraksaLoading(true);
    getActiveListings()
      .then(data => { if (active) setPrakse((data || []).map(mapOglas)); })
      .catch(err => { if (active) setPraksaError(err.message || 'Greška pri učitavanju oglasa.'); })
      .finally(() => { if (active) setPraksaLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const openId = location.state?.openOglasId;
    const openTab = location.state?.openTab;

    if (openTab) {
      setActiveTab(openTab);
      navigate('/dashboard/student', { replace: true, state: {} });
      return;
    }

    if (!openId || prakse.length === 0) return;
    const found = prakse.find(p => Number(p.id) === Number(openId));
    if (found) setSelectedPraksa(found);
    navigate('/dashboard/student', { replace: true, state: {} });
  }, [location.state, prakse]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  useEffect(() => {
    let active = true;
    getFavourites()
      .then(({ ids, listings }) => {
        if (active) {
          setFavourites(new Set(ids));
          setFavouriteListings(listings.map(mapOglas));
        }
      })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getMyApplications()
      .then(data => { if (active) setApplications(data || []); })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (activeTab !== 'zatvoreni' || zatvoreniLoaded) return;
    let active = true;
    setZatvoreniLoading(true);
    setZatvoreniError('');
    getClosedListings()
      .then(data => {
        if (active) {
          setZatvoreniOglasi((data || []).map(mapOglas));
          setZatvoreniLoaded(true);
        }
      })
      .catch(err => { if (active) setZatvoreniError(err.message || 'Greška pri učitavanju zatvorenih oglasa.'); })
      .finally(() => { if (active) setZatvoreniLoading(false); });
    return () => { active = false; };
  }, [activeTab, zatvoreniLoaded]);

  useEffect(() => {
    let active = true;
    setMyPracticesLoading(true);
    setMyPracticesError('');
    getMyPractices(myPracticesFilter)
      .then((data) => {
        if (active) setMyPractices(Array.isArray(data?.prakse) ? data.prakse : []);
      })
      .catch((err) => {
        if (active) setMyPracticesError(err.message || 'Greška pri učitavanju praksi.');
      })
      .finally(() => {
        if (active) setMyPracticesLoading(false);
      });
    return () => { active = false; };
  }, [myPracticesFilter]);

  useEffect(() => {
    let active = true;
    getNotifications()
      .then(data => { if (active) setNotifications(data || []); })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!notifOpen) return;
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  useEffect(() => {
    setApplyError('');
    setApplySuccess('');
  }, [selectedPraksa?.id, applicationPraksa?.id]);

  useEffect(() => {
    let active = true;
    getMyStudentEvaluations()
      .then(data => {
        if (active && Array.isArray(data)) {
          setEvaluatedAppIds(new Set(data.map(ev => ev.applicationId)));
        }
      })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    getMyReceivedEvaluations()
      .then(data => { if (active) setReceivedEvaluations(data || []); })
      .catch(() => { });
    return () => { active = false; };
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkDeactivation();
      setDeactivateCheck(result);
      setShowDeactivateConfirm(true);
    } catch {
      setDeactivateError('Greška pri provjeri statusa prijava. Pokušajte ponovo.');
    }
  }

  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError('');
    try {
      await deactivateAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeactivateError(err.message || 'Greška pri deaktivaciji naloga.');
      setDeactivating(false);
    }
  }

  async function handleOpenDelete() {
    setDeleteError('');
    try {
      const result = await checkDeactivation();
      setDeleteCheck(result);
      setShowDeleteConfirm(true);
    } catch {
      setDeleteError('Greška pri provjeri statusa prijava. Pokušajte ponovo.');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMyAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleteError(err.message || 'Greška pri brisanju naloga.');
      setDeleting(false);
    }
  }

  const sveTehnologije = useMemo(
    () => [...new Set(prakse.flatMap(p => p.tehnologije || []))].sort(),
    [prakse]
  );

  const activeFavouritesCount = favourites.size;

  const filteredPrakse = useMemo(() => {
    let r;
    if (activeTab === 'omiljeni') {
      const aktivniOmiljeni = prakse.filter(p => favourites.has(p.id));
      if (omiljeniShowAll) {
        const aktivniIds = new Set(prakse.map(p => p.id));
        r = [...aktivniOmiljeni, ...favouriteListings.filter(p => !aktivniIds.has(p.id))];
      } else {
        r = aktivniOmiljeni;
      }
    } else {
      r = [...prakse];
    }
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.trim().toLowerCase();
      r = r.filter(p =>
        p.naziv.toLowerCase().includes(s) ||
        p.kompanija.toLowerCase().includes(s) ||
        p.tehnologije.some(t => t.toLowerCase().includes(s))
      );
    }
    if (filterTehs.length) r = r.filter(p => filterTehs.some(t => p.tehnologije.includes(t)));
    if (filterTips.length) r = r.filter(p => filterTips.includes(p.tip));
    if (filterTrajanja.length) r = r.filter(p =>
      filterTrajanja.some(range => {
        if (range === '1-2') return p.trajanje <= 2;
        if (range === '3') return p.trajanje === 3;
        if (range === '4-5') return p.trajanje >= 4 && p.trajanje <= 5;
        if (range === '6+') return p.trajanje >= 6;
        return false;
      })
    );
    if (sortBy === 'najnovije') r.sort((a, b) => new Date(b.datumObjave) - new Date(a.datumObjave));
    else if (sortBy === 'najstarije') r.sort((a, b) => new Date(a.datumObjave) - new Date(b.datumObjave));
    else if (sortBy === 'trajanje-asc') r.sort((a, b) => a.trajanje - b.trajanje);
    else if (sortBy === 'trajanje-desc') r.sort((a, b) => b.trajanje - a.trajanje);
    return r;
  }, [prakse, debouncedSearch, filterTehs, filterTips, filterTrajanja, sortBy, activeTab, favourites, omiljeniShowAll, favouriteListings]);

  const filteredZatvoreni = useMemo(() => {
    let r = [...zatvoreniOglasi];
    if (debouncedSearch.trim()) {
      const s = debouncedSearch.trim().toLowerCase();
      r = r.filter(p =>
        p.naziv.toLowerCase().includes(s) ||
        p.kompanija.toLowerCase().includes(s) ||
        p.tehnologije.some(t => t.toLowerCase().includes(s))
      );
    }
    if (filterTehs.length) r = r.filter(p => filterTehs.some(t => p.tehnologije.includes(t)));
    if (filterTips.length) r = r.filter(p => filterTips.includes(p.tip));
    if (filterTrajanja.length) r = r.filter(p =>
      filterTrajanja.some(range => {
        if (range === '1-2') return p.trajanje <= 2;
        if (range === '3') return p.trajanje === 3;
        if (range === '4-5') return p.trajanje >= 4 && p.trajanje <= 5;
        if (range === '6+') return p.trajanje >= 6;
        return false;
      })
    );
    return r;
  }, [zatvoreniOglasi, debouncedSearch, filterTehs, filterTips, filterTrajanja]);
  const hasFilters = !!(search || filterTehs.length || filterTips.length || filterTrajanja.length);

  function toggleSection(key) {
    setSectionsOpen(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleArr(setter, value) {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  }

  function resetFilters() {
    setSearch(''); setFilterTehs([]); setFilterTips([]); setFilterTrajanja([]);
  }

  async function toggleFavourite(oglasId) {
    const isFav = favourites.has(oglasId);
    setFavourites(prev => {
      const next = new Set(prev);
      if (isFav) next.delete(oglasId);
      else next.add(oglasId);
      return next;
    });
    try {
      if (isFav) await removeFavourite(oglasId);
      else await addFavourite(oglasId);
    } catch {
      setFavourites(prev => {
        const next = new Set(prev);
        if (isFav) next.add(oglasId);
        else next.delete(oglasId);
        return next;
      });
    }
  }

  function findApplicationForOglas(oglasId) {
    return applications.find(app => applicationOglasId(app) === Number(oglasId));
  }

  function handleStartApplication(praksa) {
    setApplyError('');
    setApplySuccess('');
    setSelectedPraksa(null);
    setApplicationPraksa(praksa);
  }

  function handleReturnToDetailsFromApplication() {
    const praksa = applicationPraksa;
    setApplicationPraksa(null);
    if (praksa) setSelectedPraksa(praksa);
  }

  async function handleApplyToPraksa(praksa) {
    if (!praksa?.aktivan) {
      setApplyError('Nije moguće prijaviti se na neaktivan oglas.');
      setApplySuccess('');
      return;
    }

    if (findApplicationForOglas(praksa.id)) {
      setApplyError('Već ste se prijavili na ovaj oglas.');
      setApplySuccess('');
      return;
    }

    setApplyLoadingId(praksa.id);
    setApplyError('');
    setApplySuccess('');

    try {
      const result = await createApplication(praksa.id);
      if (result.application) {
        setApplications(prev => [result.application, ...prev]);
      }
      setApplySuccess(result.message || 'Prijava je uspješno podnesena.');
    } catch (err) {
      setApplyError(err.message || 'Greška pri podnošenju prijave.');
    } finally {
      setApplyLoadingId(null);
    }
  }

  async function handleWithdrawApplication(applicationId) {
    setWithdrawProcessingId(applicationId);
    try {
      const result = await withdrawApplication(applicationId);
      setApplications(current =>
        current.map(app =>
          app.id === applicationId
            ? {
              ...app,
              ...(result.application || {}),
              status: 'ODUSTAO',
              datumOdustajanja: result.application?.datumOdustajanja || new Date().toISOString(),
            }
            : app
        )
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.message || 'Greška pri odustajanju od prijave.' };
    } finally {
      setWithdrawProcessingId(null);
    }
  }

  async function handleStudentDecision(applicationId, decision) {
    setDecisionProcessingId(applicationId);
    setDecisionSuccess('');

    try {
      const action = decision === 'accept'
        ? acceptApplicationByStudent
        : declineApplicationByStudent;
      const result = await action(applicationId);

      if (result.application) {
        setApplications(current =>
          current.map(application =>
            application.id === applicationId
              ? { ...application, ...result.application }
              : application
          )
        );
      }

      if (result.practice) {
        setMyPractices(current => [
          result.practice,
          ...current.filter(practice => practice.id !== result.practice.id),
        ]);
      }

      setDecisionSuccess(result.message || 'Odluka je uspješno evidentirana.');
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: err.message || 'Greška pri evidentiranju odluke.',
      };
    } finally {
      setDecisionProcessingId(null);
    }
  }

  return (
    <div className={`sd-page${darkMode ? ' dark' : ''}`}>
      {/* Navbar */}
      <nav className="sd-nav">
        <Link to="/" className="sd-nav-brand" aria-label="Idi na početnu stranicu">PraksaHub</Link>
        <div className="sd-nav-right">
          {/* Notification bell */}
          <div className="sd-notif-wrap" ref={notifRef}>
            <button
              className="sd-notif-btn"
              onClick={() => setNotifOpen(o => !o)}
              title="Notifikacije"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.filter(n => !n.procitana).length > 0 && (
                <span className="sd-notif-badge">
                  {notifications.filter(n => !n.procitana).length > 9 ? '9+' : notifications.filter(n => !n.procitana).length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="sd-notif-dropdown">
                <div className="sd-notif-header">
                  <span className="sd-notif-title">Notifikacije</span>
                  {notifications.some(n => !n.procitana) && (
                    <button
                      className="sd-notif-read-all"
                      onClick={async () => {
                        await markAllNotificationsRead().catch(() => { });
                        setNotifications(prev => prev.map(n => ({ ...n, procitana: true })));
                      }}
                    >
                      Označi sve
                    </button>
                  )}
                </div>
                <div className="sd-notif-list">
                  {notifications.length === 0 ? (
                    <p className="sd-notif-empty">Nema notifikacija.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`sd-notif-item${n.procitana ? '' : ' sd-notif-item--unread'}`}
                        onClick={async () => {
                          if (!n.procitana) {
                            await markNotificationRead(n.id).catch(() => { });
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, procitana: true } : x));
                          }
                        }}
                      >
                        <div className={`sd-notif-dot${n.procitana ? ' sd-notif-dot--read' : ''}`} />
                        <div className="sd-notif-body">
                          <p className="sd-notif-naslov">{n.naslov}</p>
                          <p className="sd-notif-poruka">{n.poruka}</p>
                          <span className="sd-notif-time">{new Date(n.created_at).toLocaleDateString('bs-BA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="sd-theme-btn" onClick={() => setDarkMode(!darkMode)} title={darkMode ? 'Svjetla tema' : 'Tamna tema'}>
            {darkMode ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* ── Collapsing filter sidebar ───────────────────────────────────── */}
      <aside className="sd-sidebar">
        {/* Collapsed icon strip */}
        <div className="sd-sidebar-tab">
          <div className={`sd-sb-tab-icon${activeTab === 'omiljeni' ? ' sd-sb-tab-icon--heart' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={activeTab === 'omiljeni' ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {activeFavouritesCount > 0 && <span className="sd-sb-badge">{activeFavouritesCount}</span>}
          </div>
          <div className={`sd-sb-tab-icon${activeTab === 'prijave' ? ' sd-sb-tab-icon--apps' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            {applications.length > 0 && <span className="sd-sb-badge">{applications.length}</span>}
          </div>
          <div className={`sd-sb-tab-icon${activeTab === 'moje-prakse' ? ' sd-sb-tab-icon--apps' : ''}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <path d="M2 12h20" />
            </svg>
            {myPractices.length > 0 && <span className="sd-sb-badge">{myPractices.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
            </svg>
            {filterTehs.length > 0 && <span className="sd-sb-badge">{filterTehs.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {filterTrajanja.length > 0 && <span className="sd-sb-badge">{filterTrajanja.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {filterTips.length > 0 && <span className="sd-sb-badge">{filterTips.length}</span>}
          </div>
          <div className="sd-sb-tab-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4" /><polyline points="3 8 7 4 11 8" />
              <path d="M17 8v12" /><polyline points="21 16 17 20 13 16" />
            </svg>
          </div>
          {/* Footer icons — avatar + exit */}
          <div className="sd-sb-tab-footer">
            <div className="sd-sb-tab-icon">
              <div className="sd-nav-avatar sd-sb-tab-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
            </div>
            <div className="sd-sb-tab-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        <div className="sd-sidebar-inner">
          <div className="sd-sidebar-content">
            {/* View tabs */}
            {applicationLimit !== null && (
              <div className="sd-limit-bar">
                <div className="sd-limit-bar-label">
                  <span>Prijave</span>
                  <span className={`sd-limit-bar-count${isAtLimit ? ' sd-limit-bar-count--warn' : ''}`}>
                    {activeApplicationCount}/{applicationLimit}
                  </span>
                </div>
                <div className="sd-limit-bar-track">
                  <div
                    className={`sd-limit-bar-fill${isAtLimit ? ' sd-limit-bar-fill--warn' : ''}`}
                    style={{ width: `${Math.min(100, (activeApplicationCount / applicationLimit) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            <div className="sd-sidebar-tabs">
              <div className="sd-sb-tabs">
                <button
                  className={`sd-sb-tab-btn${activeTab === 'svi' ? ' active' : ''}`}
                  onClick={() => setActiveTab('svi')}
                >
                  Svi oglasi
                </button>
                <button
                  className={`sd-sb-tab-btn${activeTab === 'omiljeni' ? ' active' : ''}`}
                  onClick={() => setActiveTab('omiljeni')}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24"
                    fill={activeTab === 'omiljeni' ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                  Omiljeni
                  {activeFavouritesCount > 0 && <span className="sd-sb-count">{activeFavouritesCount}</span>}
                </button>
              </div>
              <button
                className={`sd-sb-tab-btn sd-sb-tab-btn--prijave${activeTab === 'prijave' ? ' active' : ''}`}
                onClick={() => setActiveTab('prijave')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                Moje prijave
                {applications.length > 0 && <span className="sd-sb-count">{applications.length}</span>}
              </button>
              <button
                className={`sd-sb-tab-btn sd-sb-tab-btn--prijave${activeTab === 'moje-prakse' ? ' active' : ''}`}
                onClick={() => setActiveTab('moje-prakse')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <path d="M2 12h20" />
                </svg>
                Moje prakse
                {myPractices.length > 0 && <span className="sd-sb-count">{myPractices.length}</span>}
              </button>
              <button
                className={`sd-sb-tab-btn sd-sb-tab-btn--zatvoreni${activeTab === 'zatvoreni' ? ' active' : ''}`}
                onClick={() => setActiveTab('zatvoreni')}
              >
                <svg style={{ marginRight: '4px' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Zatvoreni oglasi
              </button>
              <button
                className={`sd-sb-tab-btn sd-sb-tab-btn--prijave${activeTab === 'moje-evaluacije' ? ' active' : ''}`}
                onClick={() => setActiveTab('moje-evaluacije')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                Primljene evaluacije
                {receivedEvaluations.length > 0 && (
                  <span className="sd-sb-count">{receivedEvaluations.length}</span>
                )}
              </button>
              <button
                className={`sd-sb-tab-btn sd-sb-tab-btn--prijave${activeTab === 'vodic' ? ' active' : ''}`}
                onClick={() => setActiveTab('vodic')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Kako se prijaviti?
              </button>
            </div>

            {activeTab !== 'prijave' && activeTab !== 'moje-prakse' && (<>
              {/* VS Code-style collapsible sections */}
              <div className="sd-sidebar-filters">

                {/* Tehnologija — multi-select checkboxes */}
                <div className="sd-sb-section">
                  <button className="sd-sb-section-header" onClick={() => toggleSection('tech')}>
                    <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span className="sd-sb-section-title">Tehnologija</span>
                    {filterTehs.length > 0 && <span className="sd-sb-count">{filterTehs.length}</span>}
                    <svg className={`sd-sb-chevron${sectionsOpen.tech ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.tech && (
                    <div className="sd-sb-section-body">
                      {sveTehnologije.map(t => (
                        <label key={t} className="sd-sb-checkbox-row">
                          <input type="checkbox" checked={filterTehs.includes(t)} onChange={() => toggleArr(setFilterTehs, t)} />
                          <span>{t}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Trajanje — multi-select checkboxes */}
                <div className="sd-sb-section">
                  <button className="sd-sb-section-header" onClick={() => toggleSection('duration')}>
                    <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="sd-sb-section-title">Trajanje</span>
                    {filterTrajanja.length > 0 && <span className="sd-sb-count">{filterTrajanja.length}</span>}
                    <svg className={`sd-sb-chevron${sectionsOpen.duration ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.duration && (
                    <div className="sd-sb-section-body">
                      {[['1-2', '1–2 mj.'], ['3', '3 mj.'], ['4-5', '4–5 mj.'], ['6+', '6+ mj.']].map(([val, lbl]) => (
                        <label key={val} className="sd-sb-checkbox-row">
                          <input type="checkbox" checked={filterTrajanja.includes(val)} onChange={() => toggleArr(setFilterTrajanja, val)} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tip prakse — multi-select checkboxes */}
                <div className="sd-sb-section">
                  <button className="sd-sb-section-header" onClick={() => toggleSection('type')}>
                    <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="sd-sb-section-title">Tip prakse</span>
                    {filterTips.length > 0 && <span className="sd-sb-count">{filterTips.length}</span>}
                    <svg className={`sd-sb-chevron${sectionsOpen.type ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.type && (
                    <div className="sd-sb-section-body">
                      {['Remote', 'Hybrid', 'Onsite'].map(tip => (
                        <label key={tip} className="sd-sb-checkbox-row">
                          <input type="checkbox" checked={filterTips.includes(tip)} onChange={() => toggleArr(setFilterTips, tip)} />
                          <span>{tip}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sortiranje — single radio selection */}
                <div className="sd-sb-section">
                  <button className="sd-sb-section-header" onClick={() => toggleSection('sort')}>
                    <svg className="sd-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 16V4" /><polyline points="3 8 7 4 11 8" />
                      <path d="M17 8v12" /><polyline points="21 16 17 20 13 16" />
                    </svg>
                    <span className="sd-sb-section-title">Sortiraj po</span>
                    <svg className={`sd-sb-chevron${sectionsOpen.sort ? ' open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.sort && (
                    <div className="sd-sb-section-body">
                      {[['najnovije', 'Najnovije'], ['najstarije', 'Najstarije'], ['trajanje-asc', 'Trajanje ↑'], ['trajanje-desc', 'Trajanje ↓']].map(([val, lbl]) => (
                        <label key={val} className="sd-sb-radio-row">
                          <input type="radio" name="sortBy" value={val} checked={sortBy === val} onChange={() => setSortBy(val)} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {hasFilters && (
                  <button className="sd-reset-btn sd-sb-reset" onClick={resetFilters}>Resetuj filtere</button>
                )}
              </div>
            </>)}
          </div>{/* end sd-sidebar-content */}

          {/* Sticky footer — user + logout */}
          <div className="sd-sidebar-footer" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="sd-profile-menu">
                <button className="sd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); navigate('/profile'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Profil</span>
                </button>

                <button className="sd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); setSettingsOpen(true); setSettingsTab('account'); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Postavke</span>
                </button>
              </div>
            )}
            <button className="sd-sb-footer-row" onClick={() => setProfileMenuOpen(v => !v)}>
              <div className="sd-nav-avatar sd-sb-footer-avatar">
                {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
              </div>
              <span className="sd-sb-footer-text">{user?.username || 'Student'}</span>
            </button>
            <button className="sd-sb-footer-row sd-sb-logout-row" onClick={handleLogout}>
              <svg className="sd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="sd-sb-footer-text">Odjava</span>
            </button>
          </div>
        </div>{/* end sd-sidebar-inner */}
      </aside>

      {settingsOpen ? (
        <div className="sd-settings-page">
          <aside className="sd-settings-sidebar">
            <div className="sd-settings-sidebar-top">
              <button className="sd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Nazad
              </button>
              <span className="sd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="sd-settings-nav">
              <div className="sd-settings-nav-label">Opšte</div>
              <button
                className={`sd-settings-nav-item${settingsTab === 'account' ? ' active' : ''}`}
                onClick={() => setSettingsTab('account')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>Račun</span>
              </button>
            </nav>
          </aside>

          <div className="sd-settings-main">
            <div className="sd-settings-content">
              {settingsTab === 'account' && (
                <div className="sd-settings-account">
                  <h3 className="sd-settings-section-title">Račun</h3>
                  <div className="sd-settings-user-info">
                    <div className="sd-settings-avatar">
                      {(user?.ime?.[0] || user?.username?.[0] || 'S').toUpperCase()}
                    </div>
                    <div>
                      <div className="sd-settings-username">{user?.username || 'Student'}</div>
                      <div className="sd-settings-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="sd-danger-section">
                    <h4 className="sd-danger-section-title">Deaktivacija računa</h4>
                    <div className="sd-settings-danger-zone">
                      <p className="sd-settings-danger-desc">
                        Deaktivacijom naloga više nećete moći pristupiti platformi. Vaše prijave na prakse bit će automatski povučene.
                      </p>
                      {deactivateError && <p className="sd-settings-error">{deactivateError}</p>}
                      <button className="sd-btn-deactivate" onClick={handleOpenDeactivate}>
                        Deaktiviraj račun
                      </button>
                    </div>
                  </div>
                  <div className="sd-danger-section">
                    <h4 className="sd-danger-section-title">Brisanje računa</h4>
                    <div className="sd-settings-danger-zone">
                      <p className="sd-settings-danger-desc">
                        Brisanjem naloga trajno se uklanjaju svi vaši podaci iz sistema. Ova akcija je nepovratna.
                      </p>
                      {deleteError && <p className="sd-settings-error">{deleteError}</p>}
                      <button className="sd-btn-deactivate" onClick={handleOpenDelete}>
                        Obriši račun
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="sd-container">
          {activeTab === 'prijave' ? (
            <MyApplicationsPanel
              applications={applications}
              prakse={prakse}
              myPractices={myPractices}
              onViewOglas={sel => setSelectedPraksa(sel)}
              onStudentDecision={handleStudentDecision}
              decisionProcessingId={decisionProcessingId}
              decisionSuccess={decisionSuccess}
              onWithdraw={handleWithdrawApplication}
              withdrawProcessingId={withdrawProcessingId}
            />

          ) : activeTab === 'moje-prakse' ? (
            <MyPracticesPanel
              practices={myPractices}
              loading={myPracticesLoading}
              error={myPracticesError}
              filter={myPracticesFilter}
              onFilterChange={setMyPracticesFilter}
              evaluatedAppIds={evaluatedAppIds}
              onEvaluate={praksa => {
                setEvalModalApp({
                  id: praksa.prijavaID,
                  kompanijaNaziv: praksa.kompanija?.naziv || 'Kompanija',
                  oglasNaziv: praksa.oglas?.naziv || 'Oglas',
                });
              }}
            />

          ) : activeTab === 'zatvoreni' ? (
            <ClosedListingsPanel
              oglasi={filteredZatvoreni}
              loading={zatvoreniLoading}
              error={zatvoreniError}
              hasFilters={hasFilters}
              onResetFilters={resetFilters}
              search={search}
              onSearchChange={setSearch}
            />
          ) : activeTab === 'moje-evaluacije' ? (
            <MojeEvaluacijePanel evaluacije={receivedEvaluations} />
          ) : activeTab === 'vodic' ? (
            <PrijavniVodic />
          ) : praksaLoading ? (
            <p className="sd-results-info">Učitavanje oglasa...</p>
          ) : praksaError ? (
            <p className="sd-results-info" style={{ color: 'var(--color-danger, #c0392b)' }}>{praksaError}</p>
          ) : (
            <>
              <div className="sd-main-search-wrap">
                <div className="sd-main-search-inner">
                  <svg className="sd-main-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    className="sd-main-search-input"
                    type="text"
                    placeholder="Pretraži prakse, kompanije, tehnologije..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="sd-main-search-clear" onClick={() => setSearch('')}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {activeTab === 'omiljeni' && (
                <div className="sd-omiljeni-toggle">
                  <button
                    className={`sd-omiljeni-toggle-btn${!omiljeniShowAll ? ' active' : ''}`}
                    onClick={() => setOmiljeniShowAll(false)}
                  >
                    Aktivni
                  </button>
                  <button
                    className={`sd-omiljeni-toggle-btn${omiljeniShowAll ? ' active' : ''}`}
                    onClick={() => setOmiljeniShowAll(true)}
                  >
                    Svi
                  </button>
                </div>
              )}

              <p className="sd-results-info">
                {filteredPrakse.length === 0
                  ? 'Nema rezultata'
                  : <><strong>{filteredPrakse.length}</strong> {filteredPrakse.length === 1 ? 'oglas' : 'oglasa'} pronađeno{hasFilters ? ' · filtrirano' : ''}</>
                }
              </p>

              <div className="sd-list">
                {filteredPrakse.length === 0 ? (
                  <div className="sd-empty">
                    {activeTab === 'omiljeni' ? (
                      <>
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <p className="sd-empty-title">Nema omiljenih oglasa</p>
                        <p className="sd-empty-sub">
                          Klikni na srce na oglasu da ga dodaš ovdje.
                        </p>
                      </>
                    ) : (
                      <>
                        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        <p className="sd-empty-title">Nema pronađenih oglasa</p>
                        <p className="sd-empty-sub">
                          Pokušaj sa drugačijim filterima ili{' '}
                          <button className="sd-empty-link" onClick={resetFilters}>resetuj pretragu</button>.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredPrakse.map(p => (
                    <PraksaCard
                      key={p.id}
                      praksa={p}
                      onSelect={sel => setSelectedPraksa(sel)}
                      isFavourite={favourites.has(p.id)}
                      onToggleFavourite={toggleFavourite}
                      application={findApplicationForOglas(p.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}

      {selectedPraksa && (
        <PraksaModal
          praksa={selectedPraksa}
          onClose={() => setSelectedPraksa(null)}
          existingApplication={findApplicationForOglas(selectedPraksa.id)}
          onStartApplication={handleStartApplication}
          isAtLimit={isAtLimit}
          limitInfo={{ current: activeApplicationCount, max: applicationLimit }}
        />
      )}

      {applicationPraksa && (
        <ApplicationModal
          praksa={applicationPraksa}
          onClose={() => setApplicationPraksa(null)}
          onCancel={handleReturnToDetailsFromApplication}
          existingApplication={findApplicationForOglas(applicationPraksa.id)}
          onSubmit={handleApplyToPraksa}
          submitting={applyLoadingId === applicationPraksa.id}
          submitError={applyError}
          submitSuccess={applySuccess}
        />
      )}

      {showDeactivateConfirm && (
        <div className="sd-modal-overlay sd-modal-overlay--top">
          <div className="sd-confirm-modal">
            {deactivateCheck?.canDeactivate === false ? (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Deaktivacija nije moguća</h3>
                <p className="sd-confirm-text">
                  Imate odobrenu praksu kod: <strong>{deactivateCheck.companies.join(', ')}</strong>.
                  Morate se najprije odjaviti s prakse prije deaktivacije naloga.
                </p>
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => setShowDeactivateConfirm(false)}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Deaktivirajte račun</h3>
                <p className="sd-confirm-text">
                  Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom.
                  Samo administrator može ponovo aktivirati vaš nalog.
                </p>
                {deactivateCheck?.pendingApplications?.length > 0 && (
                  <div className="sd-confirm-warn-box">
                    <p className="sd-confirm-warn-label">Sljedeće prijave će biti automatski povučene:</p>
                    <ul className="sd-confirm-app-list">
                      {deactivateCheck.pendingApplications.map((a, i) => (
                        <li key={i}><strong>{a.oglasNaziv}</strong> — {a.kompanijaNaziv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {deactivateError && <p className="sd-settings-error">{deactivateError}</p>}
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => { setShowDeactivateConfirm(false); setDeactivateError(''); }} disabled={deactivating}>
                    Odustani
                  </button>
                  <button className="sd-btn-danger" onClick={handleConfirmDeactivate} disabled={deactivating}>
                    {deactivating ? 'Deaktivacija...' : 'Potvrdi deaktivaciju'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="sd-modal-overlay sd-modal-overlay--top">
          <div className="sd-confirm-modal">
            {deleteCheck?.canDeactivate === false ? (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Brisanje nije moguće</h3>
                <p className="sd-confirm-text">
                  Imate odobrenu praksu kod: <strong>{deleteCheck.companies.join(', ')}</strong>.
                  Morate se najprije odjaviti s prakse prije brisanja naloga.
                </p>
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="sd-confirm-icon sd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </div>
                <h3 className="sd-confirm-title">Obriši nalog</h3>
                <p className="sd-confirm-text">
                  Ova akcija je <strong>trajna i nepovratna</strong>. Svi vaši podaci bit će trajno obrisani sa platforme.
                </p>
                {deleteCheck?.pendingApplications?.length > 0 && (
                  <div className="sd-confirm-warn-box">
                    <p className="sd-confirm-warn-label">Sljedeće prijave će biti automatski povučene:</p>
                    <ul className="sd-confirm-app-list">
                      {deleteCheck.pendingApplications.map((a, i) => (
                        <li key={i}><strong>{a.oglasNaziv}</strong> — {a.kompanijaNaziv}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {deleteError && <p className="sd-settings-error">{deleteError}</p>}
                <div className="sd-confirm-actions">
                  <button className="sd-btn-secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }} disabled={deleting}>
                    Odustani
                  </button>
                  <button className="sd-btn-danger" onClick={handleConfirmDelete} disabled={deleting}>
                    {deleting ? 'Brisanje...' : 'Obriši nalog'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {evalModalApp && (
        <EvaluacijaKompanijeModal
          application={evalModalApp}
          onClose={() => setEvalModalApp(null)}
          onSubmitted={app => {
            setEvaluatedAppIds(prev => new Set([...prev, app.id]));
            setEvalModalApp(null);
          }}
        />
      )}
    </div>
  );
}

function EvalCard({ ev, kriteriji }) {
  return (
    <article className="sd-eval-card">
      <div className="sd-eval-card-header">
        <div className="sd-eval-card-meta">
          <span className="sd-eval-card-company">{ev.kompanijaNaziv}</span>
          <h3 className="sd-eval-card-oglas">{ev.oglasNaziv}</h3>
          <span className="sd-eval-card-date">
            {new Date(ev.datumEvaluacije).toLocaleDateString('bs-BA')}
          </span>
        </div>
        <div className="sd-eval-stars">
          {[1, 2, 3, 4, 5].map(n => (
            <svg key={n} width="18" height="18" viewBox="0 0 24 24"
              fill={n <= ev.ukupnaOcjena ? '#f59e0b' : 'none'}
              stroke="#f59e0b" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ))}
          <span className="sd-eval-stars-score">{ev.ukupnaOcjena}/5</span>
        </div>
      </div>

      <div className="sd-eval-criteria" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {kriteriji.map(({ key, label }) => (
          <div key={key} className="sd-eval-criteria-item">
            <span className="sd-eval-criteria-label">{label}</span>
            <div className="sd-eval-criteria-value">
              <span className="sd-eval-criteria-num">{ev[key]}</span>
              <span className="sd-eval-criteria-max">/5</span>
              {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} width="11" height="11" viewBox="0 0 24 24"
                  fill={n <= ev[key] ? '#f59e0b' : 'none'}
                  stroke="#f59e0b" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>

      {ev.komentar && (
        <p className="sd-eval-comment">"{ev.komentar}"</p>
      )}
    </article>
  );
}

const STUDENT_EVAL_KRITERIJI = [
  { key: 'tehnickeVjestine', label: 'Tehničke vještine' },
  { key: 'komunikacija', label: 'Komunikacija' },
  { key: 'radnaEtika', label: 'Radna etika' },
  { key: 'inicijativa', label: 'Inicijativa' },
  { key: 'timskiRad', label: 'Timski rad' },
];

function MojeEvaluacijePanel({ evaluacije }) {
  if (evaluacije.length === 0) {
    return (
      <div className="sd-empty">
        <p className="sd-empty-title">Nemate primljenih evaluacija.</p>
        <p className="sd-empty-sub">
          Evaluacije od kompanija će se pojaviti ovdje nakon završetka prakse.
        </p>
      </div>
    );
  }

  return (
    <div className="sd-apps-panel">
      <h2 style={{ margin: '0 0 4px', fontSize: '1.28rem', color: 'var(--color-text)' }}>
        Evaluacije kompanija za mene
      </h2>
      <p style={{ margin: '0 0 20px', fontSize: '0.84rem', color: 'var(--color-muted)' }}>
        Ocjene i komentari koje su kompanije ostavile nakon završetka prakse.
      </p>
      <div className="sd-apps-list">
        {evaluacije.map(ev => (
          <EvalCard key={ev.id} ev={ev} kriteriji={STUDENT_EVAL_KRITERIJI} />
        ))}
      </div>
    </div>
  );
}
