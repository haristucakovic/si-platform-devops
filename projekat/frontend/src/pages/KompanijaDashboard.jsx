// frontend/src/pages/KompanijaDashboard.jsx
import { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCompanyProfile } from '../services/companyProfile.service';
import {
  downloadPracticeContract,
  generatePracticeContract,
  getCompanyPractices,
  getPracticeActivities,
  getPracticeAttendance,
  savePracticeAttendance,
  getPracticeReport,
  generatePracticeReport,
} from '../services/prakseService';
import { checkCompanyDeactivation, deactivateCompanyAccount, deleteMyCompanyAccount } from '../services/userService';
import { getCompanyReceivedEvaluations } from '../services/evaluationService';
import EvaluacijaStudenta from '../modules/evaluations/EvaluacijaStudenta';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import './KompanijaDashboard.css';
import {
  createListing,
  getCompanyListings,
  getCompanyClosedListings,
  closeListing,
  archiveListing,
  restoreFromArchive
} from '../services/listingsService';
import {
  approveApplicationByCompany,
  getApplicationStatistics,
  getCompanyApplicationDocumentDownloadUrl,
  getCompanyApplicationsForListing,
  rejectApplicationByCompany,
  shortlistApplication,
} from '../services/applicationsService';
import {
  APPLICATION_STATUS,
  applicationStatusLabel,
  studentDecisionLabel,
} from '../utils/applicationStatus';
import {
  PRACTICE_FILTERS,
  practiceLifecycleLabel,
  practiceLifecycleTone,
} from '../utils/practiceLifecycle';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import EditOglas from '../modules/listings/EditOglas';
import { formatDate } from '../data/mockPrakse';

const VIEWS = {
  DASHBOARD: 'dashboard',
  LISTINGS: 'oglasi',
  CREATE_LISTING: 'create-oglas',
  CANDIDATES: 'kandidati',
  PRACTICES: 'prakse',
  CLOSED_LISTINGS: 'zatvoreni-oglasi',
  ARCHIVED_LISTINGS: 'arhivirani-oglasi',
  STATISTICS: 'statistika',
  EVALUATIONS: 'evaluacije',
  RECEIVED_EVALUATIONS: 'primljene-evaluacije',
};

const COMPANY_PROFILE_UPDATED_EVENT = 'company-profile-updated';

function ThemeIcon({ darkMode }) {
  if (darkMode) {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
    </svg>
  );
}

// Reusable page-style confirm modal replacing browser's default alert window
function CustomConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Potvrdi", cancelText = "Odustani", type = "danger" }) {
  if (!isOpen) return null;
  return (
    <div className="cd-modal-overlay" role="dialog" aria-modal="true" onClick={onCancel}>
      <div className="cd-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`cd-confirm-icon cd-confirm-icon--${type}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="cd-confirm-title">{title}</h3>
        <p className="cd-confirm-text">{message}</p>
        <div className="cd-confirm-actions">
          <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel}>{cancelText}</button>
          <button type="button" className={`cd-btn cd-btn--${type === 'danger' ? 'danger' : 'primary'}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

export default function KompanijaDashboard() {
  const [view, setView] = useState(VIEWS.DASHBOARD);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [listingsError, setListingsError] = useState('');
  const [deactivateCheck, setDeactivateCheck] = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('account');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const { user, logout } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const [editingListing, setEditingListing] = useState(null);
  const [actionProcessingId, setActionProcessingId] = useState(null);
  const [candidateListingId, setCandidateListingId] = useState('');

  // States handling the page-style custom confirmation popups
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { }, type: 'danger' });
  const [receivedEvals, setReceivedEvals] = useState([]);

  useEffect(() => {
    if (view !== VIEWS.RECEIVED_EVALUATIONS) return;
    getCompanyReceivedEvaluations()
      .then(data => setReceivedEvals(data || []))
      .catch(() => { });
  }, [view]);

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
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notifOpen]);

  const companyName = companyProfile?.naziv || user?.institution || user?.ime || 'Kompanija';

  async function loadCompanyData() {
    setListingsLoading(true);
    setListingsError('');
    try {
      const [profile, companyListings] = await Promise.all([
        getCompanyProfile(),
        getCompanyListings(),
      ]);
      setCompanyProfile(profile);
      setListings(Array.isArray(companyListings) ? companyListings : []);
    } catch (err) {
      setListingsError(err.message || 'Greška pri učitavanju oglasa.');
    } finally {
      setListingsLoading(false);
    }
  }

  useEffect(() => {
    loadCompanyData();
  }, []);

  useEffect(() => {
    let active = true;
    const lastRefreshRef = { ts: 0 };
    async function refreshCompanyProfile() {
      const now = Date.now();
      if (now - lastRefreshRef.ts < 2000) return;
      lastRefreshRef.ts = now;
      try {
        const profile = await getCompanyProfile();
        if (active) setCompanyProfile(profile);
      } catch { }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') refreshCompanyProfile();
    }
    function handleCompanyProfileUpdated(event) {
      const updatedProfile = event.detail;
      if (updatedProfile && typeof updatedProfile === 'object') {
        setCompanyProfile((current) => ({ ...(current || {}), ...updatedProfile }));
      }
    }
    window.addEventListener('focus', refreshCompanyProfile);
    window.addEventListener('pageshow', refreshCompanyProfile);
    window.addEventListener(COMPANY_PROFILE_UPDATED_EVENT, handleCompanyProfileUpdated);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener('focus', refreshCompanyProfile);
      window.removeEventListener('pageshow', refreshCompanyProfile);
      window.removeEventListener(COMPANY_PROFILE_UPDATED_EVENT, handleCompanyProfileUpdated);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  function openView(nextView) {
    setView(nextView);
  }

  function openCandidatesForListing(listingId) {
    setCandidateListingId(String(listingId));
    setView(VIEWS.CANDIDATES);
  }

  function openProfilePage() {
    navigate('/profile');
  }

  function openSettings() {
    setProfileMenuOpen(false);
    setSettingsTab('account');
    setSettingsOpen(true);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkCompanyDeactivation();
      setDeactivateCheck(result);
      setShowDeactivateConfirm(true);
    } catch (err) {
      setDeactivateError(err.message || 'Greška pri provjeri statusa naloga.');
    }
  }

  async function handleConfirmDeactivate() {
    setDeactivating(true);
    setDeactivateError('');
    try {
      await deactivateCompanyAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeactivating(false);
      setDeactivateError(err.message || 'Greška pri deaktivaciji naloga.');
    }
  }

  function handleCancelDeactivate() {
    setShowDeactivateConfirm(false);
    setDeactivateCheck(null);
    setDeactivateError('');
  }

  async function handleOpenDelete() {
    setDeleteError('');
    try {
      const result = await checkCompanyDeactivation();
      setDeleteCheck(result);
      setShowDeleteConfirm(true);
    } catch (err) {
      setDeleteError(err.message || 'Greška pri provjeri statusa naloga.');
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteMyCompanyAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleting(false);
      setDeleteError(err.message || 'Greška pri brisanju naloga.');
    }
  }

  // Closes a listing layout safely
  async function executeCloseListing(id) {
    setActionProcessingId(id);
    try {
      await closeListing(id);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'ZATVOREN' } : l));
    } catch (err) {
      alert(err.message || 'Greška pri zatvaranju oglasa.');
    } finally {
      setActionProcessingId(null);
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  }

  function handleCloseListingAction(id) {
    setConfirmConfig({
      isOpen: true,
      title: 'Zatvori oglas',
      message: 'Jeste li sigurni da želite zatvoriti ovaj oglas? Prijave studenata na ovaj oglas više neće biti moguće.',
      type: 'danger',
      onConfirm: () => executeCloseListing(id)
    });
  }

  // Pre-checks listing state. If it is expired but database still marks it AKTIVAN, 
  // automatically invoke the close api step immediately before proceeding to archive.
  async function executeArchiveListing(listing) {
    setActionProcessingId(listing.id);
    try {
      if (listing.status === 'AKTIVAN') {
        await closeListing(listing.id);
      }
      await archiveListing(listing.id);
      setListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'ARHIVIRAN' } : l));
    } catch (err) {
      alert(err.message || 'Greška pri arhiviranju oglasa.');
    } finally {
      setActionProcessingId(null);
      setConfirmConfig(prev => ({ ...prev, isOpen: false }));
    }
  }

  function handleArchiveListingAction(listing) {
    setConfirmConfig({
      isOpen: true,
      title: 'Arhiviraj oglas',
      message: 'Želite li arhivirati ovaj oglas? Oglas se uklanja sa spiska uobičajenih istorijskih zatvorenih oglasa.',
      type: 'warn',
      onConfirm: () => executeArchiveListing(listing)
    });
  }

  async function handleRestoreListingAction(id) {
    setActionProcessingId(id);
    try {
      await restoreFromArchive(id);
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'ZATVOREN' } : l));
    } catch (err) {
      alert(err.message || 'Greška pri vraćanju oglasa iz arhive.');
    } finally {
      setActionProcessingId(null);
    }
  }

  // Dynamic grouping logic pulling expired listings seamlessly into Closed view
  const locallyDerivedClosed = listings.filter(l => {
    const passed = l.rokPrijave && new Date(l.rokPrijave) <= new Date();
    return l.status === 'ZATVOREN' || (l.status === 'AKTIVAN' && passed);
  });

  return (
    <div className={`cd-layout${darkMode ? ' dark' : ''}`}>
      <nav className="cd-navbar">
        <div className="cd-navbar-left">
          <Link to="/" className="cd-navbar-brand" aria-label="Idi na početnu stranicu">PraksaHub</Link>
          <div className="cd-navbar-divider" />
          <span className="cd-navbar-title">Dashboard kompanije</span>
        </div>
        <div className="cd-navbar-right">
          <div className="cd-notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="cd-notif-btn"
              onClick={() => setNotifOpen(o => !o)}
              title="Notifikacije"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.filter(n => !n.procitana).length > 0 && (
                <span className="cd-notif-badge">
                  {notifications.filter(n => !n.procitana).length > 9 ? '9+' : notifications.filter(n => !n.procitana).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="cd-notif-dropdown">
                <div className="cd-notif-header">
                  <span className="cd-notif-title">Notifikacije</span>
                  {notifications.some(n => !n.procitana) && (
                    <button
                      className="cd-notif-read-all"
                      onClick={async () => {
                        await markAllNotificationsRead().catch(() => { });
                        setNotifications(prev => prev.map(n => ({ ...n, procitana: true })));
                      }}
                    >
                      Označi sve
                    </button>
                  )}
                </div>
                <div className="cd-notif-list">
                  {notifications.length === 0 ? (
                    <p className="cd-notif-empty">Nema notifikacija.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`cd-notif-item${n.procitana ? '' : ' cd-notif-item--unread'}`}
                        onClick={async () => {
                          if (!n.procitana) {
                            await markNotificationRead(n.id).catch(() => { });
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, procitana: true } : x));
                          }
                        }}
                      >
                        <div className={`cd-notif-dot${n.procitana ? ' cd-notif-dot--read' : ''}`} />
                        <div className="cd-notif-body">
                          <p className="cd-notif-naslov">{n.naslov}</p>
                          <p className="cd-notif-poruka">{n.poruka}</p>
                          <span className="cd-notif-time">{new Date(n.created_at).toLocaleDateString('bs-BA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            type="button"
            className="cd-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Uključi svijetlu temu' : 'Uključi tamnu temu'}
            title={darkMode ? 'Svijetla tema' : 'Tamna tema'}
          >
            <ThemeIcon darkMode={darkMode} />
          </button>
          <div className="cd-navbar-user-area">
            <span className="cd-navbar-user">{companyName}</span>
            <span className="cd-navbar-role-chip">Kompanija</span>
          </div>
        </div>
      </nav>

      <aside className="cd-sidebar">
        <div className="cd-sidebar-tab">
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.DASHBOARD)} title="Dashboard">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.LISTINGS)} title="Oglasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.CANDIDATES)} title="Prijave kandidata">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.PRACTICES)} title="Prakse">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <path d="M2 12h20" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.CREATE_LISTING)} title="Kreiraj oglas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <line x1="12" y1="10" x2="12" y2="16" />
              <line x1="9" y1="13" x2="15" y2="13" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.CLOSED_LISTINGS)} title="Zatvoreni oglasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.ARCHIVED_LISTINGS)} title="Arhivirani oglasi">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.STATISTICS)} title="Statistika prijava">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.EVALUATIONS)} title="Evaluacije studenata">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </button>
          <button type="button" className="cd-sb-tab-icon" onClick={() => openView(VIEWS.RECEIVED_EVALUATIONS)} title="Primljene evaluacije">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <div className="cd-sb-tab-footer">
            <button type="button" className="cd-sb-tab-icon" onClick={openProfilePage} title={companyName}>
              <div className="cd-nav-avatar cd-sb-tab-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
            </button>
            <button type="button" className="cd-sb-tab-icon" onClick={handleLogout} title="Odjava">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="cd-sidebar-inner">
          <div className="cd-sidebar-scroll">
            <div className="cd-nav-group">
              <div className="cd-nav-label">Pregled</div>
              <nav className="cd-nav">
                <button type="button" className={`cd-nav-item ${view === VIEWS.DASHBOARD ? 'active' : ''}`} onClick={() => openView(VIEWS.DASHBOARD)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                  </svg>
                  Dashboard
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.LISTINGS ? 'active' : ''}`} onClick={() => openView(VIEWS.LISTINGS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                  Oglasi
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.CANDIDATES ? 'active' : ''}`} onClick={() => openView(VIEWS.CANDIDATES)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <polyline points="17 11 19 13 23 9" />
                  </svg>
                  Prijave kandidata
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.PRACTICES ? 'active' : ''}`} onClick={() => openView(VIEWS.PRACTICES)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    <path d="M2 12h20" />
                  </svg>
                  Prakse
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.CREATE_LISTING ? 'active' : ''}`} onClick={() => openView(VIEWS.CREATE_LISTING)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <line x1="12" y1="10" x2="12" y2="16" />
                    <line x1="9" y1="13" x2="15" y2="13" />
                  </svg>
                  Kreiraj oglas
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.CLOSED_LISTINGS ? 'active' : ''}`} onClick={() => openView(VIEWS.CLOSED_LISTINGS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Zatvoreni oglasi
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.ARCHIVED_LISTINGS ? 'active' : ''}`} onClick={() => openView(VIEWS.ARCHIVED_LISTINGS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  Arhivirani oglasi
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.STATISTICS ? 'active' : ''}`} onClick={() => openView(VIEWS.STATISTICS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Statistika prijava
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.EVALUATIONS ? 'active' : ''}`} onClick={() => openView(VIEWS.EVALUATIONS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Evaluacije studenata
                </button>
                <button type="button" className={`cd-nav-item ${view === VIEWS.RECEIVED_EVALUATIONS ? 'active' : ''}`} onClick={() => openView(VIEWS.RECEIVED_EVALUATIONS)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Primljene evaluacije
                </button>
              </nav>
            </div>
          </div>

          <div className="cd-sidebar-footer" ref={profileMenuRef}>
            {profileMenuOpen && (
              <div className="cd-profile-menu">
                <button className="cd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); openProfilePage(); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Moj profil</span>
                </button>
                <button className="cd-profile-menu-item" onClick={() => { setProfileMenuOpen(false); openSettings(); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Postavke</span>
                </button>
              </div>
            )}
            <button className="cd-sb-footer-row" onClick={() => setProfileMenuOpen(v => !v)}>
              <div className="cd-nav-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
              <span className="cd-sb-footer-text">{companyName}</span>
            </button>
            <button type="button" className="cd-sb-footer-row cd-sb-logout-row" onClick={handleLogout}>
              <svg className="cd-sb-footer-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="cd-sb-footer-text">Odjava</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="cd-main">
        {view === VIEWS.DASHBOARD && (
          <DashboardShell
            listings={listings}
            listingsLoading={listingsLoading}
            listingsError={listingsError}
            onOpenView={openView}
            onEdit={(l) => setEditingListing(l)}
            onCloseListing={handleCloseListingAction}
            onOpenCandidates={openCandidatesForListing}
            actionProcessingId={actionProcessingId}
          />
        )}
        {view === VIEWS.LISTINGS && (
          <ListingsShell
            listings={listings}
            loading={listingsLoading}
            error={listingsError}
            onOpenView={openView}
            onEdit={(l) => setEditingListing(l)}
            onCloseListing={handleCloseListingAction}
            onOpenCandidates={openCandidatesForListing}
            actionProcessingId={actionProcessingId}
          />
        )}
        {view === VIEWS.CREATE_LISTING && (
          <CreateListingShell
            onCancel={() => openView(VIEWS.LISTINGS)}
            onCreated={(listing) => {
              if (listing) {
                setListings((current) => [listing, ...current]);
              }
              openView(VIEWS.LISTINGS);
            }}
          />
        )}
        {view === VIEWS.CANDIDATES && (
          <CandidatesShell
            listings={listings}
            loading={listingsLoading}
            error={listingsError}
            selectedListingId={candidateListingId}
            onSelectedListingIdChange={setCandidateListingId}
          />
        )}
        {view === VIEWS.PRACTICES && <PracticesShell />}
        {view === VIEWS.STATISTICS && <StatistikaShell />}
        {view === VIEWS.EVALUATIONS && (
          <div className="cd-content">
            <section className="cd-section">
              <EvaluacijaStudenta />
            </section>
          </div>
        )}
        {view === VIEWS.CLOSED_LISTINGS && (
          <ClosedListingsShell
            listings={locallyDerivedClosed}
            loading={listingsLoading}
            error={listingsError}
            onArchiveListing={handleArchiveListingAction}
            actionProcessingId={actionProcessingId}
          />
        )}
        {view === VIEWS.ARCHIVED_LISTINGS && (
          <ArchivedListingsShell
            listings={listings.filter(l => l.status === 'ARHIVIRAN')}
            loading={listingsLoading}
            error={listingsError}
            onRestoreListing={handleRestoreListingAction}
            actionProcessingId={actionProcessingId}
          />
        )}
        {view === VIEWS.RECEIVED_EVALUATIONS && (
          <div className="cd-content">
            <header className="cd-header">
              <h1 className="cd-title">Primljene evaluacije</h1>
              <p className="cd-subtitle">Ocjene i komentari koje su studenti ostavili nakon završetka prakse.</p>
            </header>
            {receivedEvals.length === 0 ? (
              <div className="cd-empty-state" style={{
                background: 'var(--color-surface)',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                maxWidth: '540px',
              }}>
                <div className="cd-empty-title">Nema primljenih evaluacija.</div>
                <p className="cd-empty-text">
                  Evaluacije od studenata će se pojaviti ovdje nakon završetka prakse.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {receivedEvals.map(ev => (
                  <article key={ev.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                    padding: '20px 24px',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 16,
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                          {ev.studentIme} {ev.studentPrezime}
                        </span>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)' }}>
                          {ev.oglasNaziv}
                        </h3>
                        <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                          {new Date(ev.datumEvaluacije).toLocaleDateString('bs-BA')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <svg key={n} width="18" height="18" viewBox="0 0 24 24"
                            fill={n <= ev.ukupnaOcjena ? '#f59e0b' : 'none'}
                            stroke="#f59e0b" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-dark)', marginLeft: 6 }}>
                          {ev.ukupnaOcjena}/5
                        </span>
                      </div>
                    </div>

                    {/* Kriteriji */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 10 }}>
                      {[
                        { key: 'organizacija', label: 'Organizacija' },
                        { key: 'mentorstvo', label: 'Mentorstvo' },
                        { key: 'radnoOkruzenje', label: 'Radno okruženje' },
                        { key: 'relevantnoPosla', label: 'Relevantnost' },
                        { key: 'preporukaKompanija', label: 'Preporuka' },
                      ].map(({ key, label }) => (
                        <div key={key} style={{
                          display: 'flex', flexDirection: 'column', gap: 5,
                          padding: '10px 12px',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 10,
                        }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {label}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-dark)' }}>{ev[key]}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', fontWeight: 600 }}>/5</span>
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

                    {/* Komentar */}
                    {ev.komentar && (
                      <p style={{
                        margin: 0, padding: '10px 14px',
                        background: 'var(--color-bg)',
                        borderLeft: '3px solid var(--color-border)',
                        borderRadius: '0 8px 8px 0',
                        fontSize: '0.85rem', fontStyle: 'italic',
                        color: 'var(--color-muted)', lineHeight: 1.6,
                      }}>
                        "{ev.komentar}"
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {settingsOpen && (
        <div className="cd-settings-page">
          <aside className="cd-settings-sidebar">
            <div className="cd-settings-sidebar-top">
              <button className="cd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Nazad
              </button>
              <span className="cd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="cd-settings-nav">
              <div className="cd-settings-nav-label">Opšte</div>
              <button
                className={`cd-settings-nav-item${settingsTab === 'account' ? ' active' : ''}`}
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
          <div className="cd-settings-main">
            <div className="cd-settings-content">
              {settingsTab === 'account' && (
                <div className="cd-settings-account">
                  <h3 className="cd-settings-section-title">Račun</h3>
                  <div className="cd-settings-user-info">
                    <div className="cd-settings-avatar">{(companyName?.[0] || 'K').toUpperCase()}</div>
                    <div>
                      <div className="cd-settings-username">{companyName}</div>
                      <div className="cd-settings-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="cd-danger-section">
                    <h4 className="cd-danger-section-title">Deaktivacija naloga</h4>
                    <div className="cd-settings-danger-zone">
                      <div className="cd-settings-danger-content">
                        <div className="cd-settings-danger-desc">
                          Deaktivacijom naloga gubi se pristup platformi. Aktivni oglasi bez prijava biće automatski zatvoreni. Administrator može ponovo aktivirati nalog.
                        </div>
                        {deactivateError && (
                          <div className="cd-inline-message cd-inline-message--error" role="alert">{deactivateError}</div>
                        )}
                        <button type="button" className="cd-btn cd-btn--danger" onClick={handleOpenDeactivate}>Deaktiviraj nalog</button>
                      </div>
                    </div>
                  </div>
                  <div className="cd-danger-section">
                    <h4 className="cd-danger-section-title">Brisanje naloga</h4>
                    <div className="cd-settings-danger-zone">
                      <div className="cd-settings-danger-content">
                        <div className="cd-settings-danger-desc">
                          Brisanjem naloga trajno se uklanjaju svi vaši podaci, oglasi i prijave sa platforme. Ova akcija je nepovratna.
                        </div>
                        {deleteError && (
                          <div className="cd-inline-message cd-inline-message--error" role="alert">{deleteError}</div>
                        )}
                        <button type="button" className="cd-btn cd-btn--danger" onClick={handleOpenDelete}>Obriši nalog</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeactivateConfirm && (
        <DeactivateModal
          check={deactivateCheck}
          deactivating={deactivating}
          onConfirm={handleConfirmDeactivate}
          onCancel={handleCancelDeactivate}
        />
      )}

      {showDeleteConfirm && (
        <DeleteModal
          check={deleteCheck}
          deleting={deleting}
          deleteError={deleteError}
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteCheck(null); setDeleteError(''); }}
        />
      )}

      {editingListing && (
        <div className="cd-modal-overlay" role="dialog" aria-modal="true" onClick={() => setEditingListing(null)}>
          <div className="cd-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="cd-modal-close" onClick={() => setEditingListing(null)} aria-label="Zatvori">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <EditOglas
              initial={editingListing}
              onCancel={() => setEditingListing(null)}
              onUpdated={(updated) => {
                const og = updated?.oglas || updated;
                if (og) {
                  setListings((current) => current.map((l) => (l.id === og.id ? og : l)));
                }
                setEditingListing(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Web page styled custom popup replacement */}
      <CustomConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        type={confirmConfig.type}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

function DashboardShell({ listings, listingsLoading, listingsError, onOpenView, onEdit, onCloseListing, onOpenCandidates, actionProcessingId }) {
  const activeListings = listings.filter((l) =>
    l.status === 'AKTIVAN' && new Date(l.rokPrijave) > new Date()
  ).length;

  const stats = [
    {
      label: 'Aktivni oglasi',
      value: listingsLoading ? '...' : String(activeListings),
      sub: activeListings === 1 ? '1 aktivan oglas' : `${activeListings} aktivnih oglasa`,
      tone: 'blue',
    },
    {
      label: 'Ukupno oglasa',
      value: listingsLoading ? '...' : String(listings.filter(l => l.status !== 'ARHIVIRAN').length),
      sub: listings.length === 1 ? '1 kreiran oglas' : `${listings.length} kreiranih oglasa`,
      tone: 'muted',
    },
  ];

  return (
    <div className="cd-content">
      <section className="cd-stats-grid" aria-label="Sažetak kompanije">
        {stats.map((stat) => (
          <article key={stat.label} className="cd-stat-card">
            <span className="cd-stat-label">{stat.label}</span>
            <span className="cd-stat-value">{stat.value}</span>
            <span className={`cd-stat-sub cd-stat-sub--${stat.tone}`}>{stat.sub}</span>
          </article>
        ))}
      </section>

      <ListingsShell
        listings={listings}
        loading={listingsLoading}
        error={listingsError}
        onOpenView={onOpenView}
        onEdit={onEdit}
        onCloseListing={onCloseListing}
        onOpenCandidates={onOpenCandidates}
        actionProcessingId={actionProcessingId}
      />
    </div>
  );
}

function ListingsShell({ listings = [], loading = false, error = '', onOpenView, onEdit, onCloseListing, onOpenCandidates, actionProcessingId }) {
  const activeOnly = listings.filter(l => l.status === 'AKTIVAN' && !(l.rokPrijave && new Date(l.rokPrijave) <= new Date()));

  return (
    <section className="cd-section">
      <div className="cd-section-header">
        <h2 className="cd-section-title">Moji aktivni oglasi</h2>
        <button type="button" className="cd-btn cd-btn--primary cd-section-action" onClick={() => onOpenView(VIEWS.CREATE_LISTING)}>
          Kreiraj oglas
        </button>
      </div>
      {loading && <div className="cd-inline-message" role="status">Učitavanje oglasa...</div>}
      {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}
      {!loading && !error && activeOnly.length > 0 && (
        <div className="cd-listings-list">
          {activeOnly.map((listing) => (
            <article key={listing.id} className="cd-listing-card">
              <div className="cd-listing-main">
                <h3 className="cd-listing-title">{listing.naziv}</h3>
                <p className="cd-listing-desc">{listing.opis}</p>
                <div className="cd-listing-meta">
                  <span>{listing.oblast || 'Oblast nije unesena'}</span>
                  <span>{listing.trajanje || 'Trajanje nije uneseno'}</span>
                  <span>{listing.brojMjesta} {Number(listing.brojMjesta) === 1 ? 'mjesto' : 'mjesta'}</span>
                </div>
              </div>
              <div className="cd-listing-side">
                <span className="cd-listing-status cd-listing-status--aktivan">AKTIVAN</span>
                <span className="cd-listing-date">Rok: {formatDate(listing.rokPrijave)}</span>
                <span className="cd-listing-date">Objava: {formatDate(listing.datumObjave)}</span>
                <div className="cd-listing-actions-wrapper">
                  <button
                    className="cd-btn cd-btn--primary"
                    onClick={(e) => { e.stopPropagation(); onOpenCandidates?.(listing.id); }}
                    disabled={actionProcessingId === listing.id}
                  >
                    Vidi prijavljene
                  </button>
                  <button
                    className="cd-btn cd-btn--secondary"
                    onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(listing); }}
                    disabled={actionProcessingId === listing.id}
                  >
                    Uredi
                  </button>
                  <button
                    className="cd-btn cd-btn--danger"
                    onClick={(e) => { e.stopPropagation(); onCloseListing(listing.id); }}
                    disabled={actionProcessingId === listing.id}
                  >
                    {actionProcessingId === listing.id ? 'Zatvaranje...' : 'Zatvori'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {!loading && !error && activeOnly.length === 0 && (
        <div className="cd-empty-state">
          <div className="cd-empty-title">Nemate kreiranih aktivnih oglasa.</div>
          <p className="cd-empty-text">Kada oglas bude kreiran i aktivan, pojavit će se u ovom pregledu.</p>
          <button type="button" className="cd-btn cd-btn--primary" onClick={() => onOpenView(VIEWS.CREATE_LISTING)}>Kreiraj prvi oglas</button>
        </div>
      )}
    </section>
  );
}

const CANDIDATE_STATUS_LABELS = {
  CEKA_KOMPANIJU: { cls: 'cd-candidate-status--pending' },
  U_RAZMATRANJU: { cls: 'cd-candidate-status--shortlisted' },
  ODOBRENA: { cls: 'cd-candidate-status--approved' },
  ODBIJENA_KOMPANIJA: { cls: 'cd-candidate-status--rejected' },
  ODUSTAO: { cls: 'cd-candidate-status--rejected' },
};

const CANDIDATE_DOCUMENT_TYPE_LABELS = {
  CV: 'CV',
  MOTIVACIONO_PISMO: 'Motivaciono pismo',
  TRANSKRIPT: 'Transkript',
  POTVRDA: 'Potvrda',
  OSTALO: 'Ostalo',
};

function candidateStatusBadge(status) {
  const mapped = CANDIDATE_STATUS_LABELS[status] || {
    cls: 'cd-candidate-status--default',
  };

  return <span className={`cd-candidate-status ${mapped.cls}`}>{applicationStatusLabel(status)}</span>;
}

function studentDecisionBadge(status) {
  const cls = status === 'PRIHVACENO'
    ? 'cd-candidate-status--approved'
    : status === 'ODBIJENO'
      ? 'cd-candidate-status--rejected'
      : status === 'NA_CEKANJU'
        ? 'cd-candidate-status--pending'
        : 'cd-candidate-status--default';

  return <span className={`cd-candidate-status ${cls}`}>{studentDecisionLabel(status)}</span>;
}

function practiceLifecycleBadge(status) {
  const tone = practiceLifecycleTone(status);
  const cls = tone === 'active'
    ? 'cd-candidate-status--approved'
    : tone === 'pending'
      ? 'cd-candidate-status--pending'
      : tone === 'finished'
        ? 'cd-candidate-status--default'
        : 'cd-candidate-status--rejected';
  return <span className={`cd-candidate-status ${cls}`}>{practiceLifecycleLabel(status)}</span>;
}

function PracticesShell() {
  const [filter, setFilter] = useState('all');
  const [prakse, setPrakse] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);
  const [activitiesModal, setActivitiesModal] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({
    datum: new Date().toISOString().slice(0, 10),
    status: 'true',
    brojSati: '8',
    napomena: '',
  });
  const [contractError, setContractError] = useState('');
  const [openingContractId, setOpeningContractId] = useState(null);
  const [reportModal, setReportModal] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSaving, setReportSaving] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportKomentar, setReportKomentar] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getCompanyPractices(filter)
      .then((data) => {
        if (active) setPrakse(Array.isArray(data?.prakse) ? data.prakse : []);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Greška pri učitavanju praksi.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [filter]);

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
    } catch {
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

  async function submitAttendance(event) {
    event.preventDefault();
    if (!attendanceModal) return;

    setAttendanceSaving(true);
    setAttendanceError('');

    try {
      const saved = await savePracticeAttendance(attendanceModal.id, {
        datum: attendanceForm.datum,
        status: attendanceForm.status === 'true',
        brojSati: attendanceForm.brojSati,
        napomena: attendanceForm.napomena,
      });

      setAttendance((current) => [
        saved,
        ...current.filter((item) => item.id !== saved.id),
      ].sort((a, b) => new Date(b.datum) - new Date(a.datum)));
      setAttendanceForm((current) => ({ ...current, napomena: '' }));
    } catch (err) {
      setAttendanceError(err.message || 'Greška pri evidentiranju prisustva.');
    } finally {
      setAttendanceSaving(false);
    }
  }

  async function openReport(praksa) {
    setReportModal(praksa);
    setReportData(null);
    setReportError('');
    setReportKomentar('');
    setReportLoading(true);
    try {
      const data = await getPracticeReport(praksa.id);
      setReportData(data);
    } catch (err) {
      setReportError(err.message || 'Greška pri učitavanju podataka.');
    } finally {
      setReportLoading(false);
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    if (!reportModal) return;
    setReportSaving(true);
    setReportError('');
    try {
      const data = await generatePracticeReport(reportModal.id, { komentar: reportKomentar });
      setReportData(data);
    } catch (err) {
      setReportError(err.message || 'Greška pri generisanju izvještaja.');
    } finally {
      setReportSaving(false);
    }
  }

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Prakse</h1>
        <p className="cd-subtitle">Pregled potvrđenih praksi studenata na vašim oglasima.</p>
      </header>
      <section className="cd-section">
        <div className="cd-stat-tabs" aria-label="Filter praksi">
          {PRACTICE_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`cd-stat-tab${filter === item.value ? ' active' : ''}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {error && <div className="cd-inline-message cd-inline-message--error">{error}</div>}
        {contractError && <div className="cd-inline-message cd-inline-message--error">{contractError}</div>}
        {loading && <p className="cd-candidate-muted">Učitavanje praksi...</p>}
        {!loading && !error && prakse.length === 0 && (
          <div className="cd-empty-state cd-empty-state--inline">
            <div className="cd-empty-title">Nema praksi za odabrani filter.</div>
          </div>
        )}
        {!loading && !error && prakse.length > 0 && (
          <div className="cd-candidates-table-wrap">
            <table className="cd-candidates-table cd-practices-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Praksa / oglas</th>
                  <th>Datum početka</th>
                  <th>Datum završetka</th>
                  <th>Status prakse</th>
                  <th>Odluka studenta</th>
                  <th>Ugovor</th>
                  <th>Aktivnosti</th>
                  <th>Prisustvo</th>
                  <th>Izvještaj</th>
                </tr>
              </thead>
              <tbody>
                {prakse.map((praksa) => (
                  <tr key={praksa.id}>
                    <td>
                      <strong>{praksa.student?.ime} {praksa.student?.prezime}</strong>
                      {praksa.student?.index_number && (
                        <div className="cd-candidate-muted">{praksa.student.index_number}</div>
                      )}
                    </td>
                    <td>
                      <div>{praksa.oglas?.naziv || '-'}</div>
                      <div className="cd-candidate-muted">{praksa.kompanija?.naziv || '-'}</div>
                    </td>
                    <td>{formatDate(praksa.datumPocetka)}</td>
                    <td>{formatDate(praksa.datumKraja)}</td>
                    <td>{practiceLifecycleBadge(praksa.lifecycleStatus)}</td>
                    <td>{studentDecisionBadge(praksa.studentStatus)}</td>
                    <td>
                      <button
                        type="button"
                        className="cd-candidate-doc-btn"
                        disabled={openingContractId === praksa.id}
                        onClick={() => openContract(praksa)}
                      >
                        {openingContractId === praksa.id ? 'Generisanje...' : 'Ugovor'}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cd-candidate-doc-btn"
                        onClick={() => openActivities(praksa)}
                      >
                        Aktivnosti
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cd-candidate-doc-btn"
                        onClick={() => openAttendance(praksa)}
                      >
                        Prisustvo
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="cd-candidate-doc-btn"
                        onClick={() => openReport(praksa)}
                      >
                        Izvještaj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {contract && (
        <div className="cd-modal-overlay" role="dialog" aria-modal="true" onClick={() => setContract(null)}>
          <div className="cd-modal-sheet cd-contract-modal" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="cd-modal-close" onClick={() => setContract(null)} aria-label="Zatvori">
              &times;
            </button>
            <h2 className="cd-contract-title">Ugovor o praksi</h2>
            <pre className="cd-contract-content">{contract.sadrzaj}</pre>
            <div className="cd-contract-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={() => setContract(null)}>
                Zatvori
              </button>
              <button type="button" className="cd-btn cd-btn--primary" onClick={() => downloadPracticeContract(contract)}>
                Preuzmi ugovor
              </button>
            </div>
          </div>
        </div>
      )}
      {activitiesModal && (
        <div
          className="cd-modal-overlay"
          onClick={() => setActivitiesModal(null)}
        >
          <div
            className="cd-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Aktivnosti studenta</h2>

            {activitiesLoading ? (
              <p>Učitavanje...</p>
            ) : activities.length === 0 ? (
              <p>Nema evidentiranih aktivnosti.</p>
            ) : (
              activities.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: '12px 0',
                    borderBottom: '1px solid var(--border-color,#ddd)'
                  }}
                >
                  <strong>
                    {new Date(a.datum).toLocaleDateString()}
                  </strong>

                  <p style={{ marginTop: 6 }}>
                    {a.opis}
                  </p>
                </div>
              ))
            )}

            <div style={{ marginTop: 16 }}>
              <button
                className="cd-btn cd-btn--secondary"
                onClick={() => setActivitiesModal(null)}
              >
                Zatvori
              </button>
            </div>
          </div>
        </div>
      )}
      {attendanceModal && (
        <div className="cd-modal-overlay" role="dialog" aria-modal="true" onClick={() => setAttendanceModal(null)}>
          <div className="cd-modal-sheet" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="cd-modal-close" onClick={() => setAttendanceModal(null)} aria-label="Zatvori">
              &times;
            </button>
            <h2 className="cd-contract-title">Prisustvo studenta</h2>

            {attendanceError && <div className="cd-inline-message cd-inline-message--error">{attendanceError}</div>}

            <form className="cd-attendance-form" onSubmit={submitAttendance}>
              <label className="cd-form-field">
                <span className="cd-form-label">Datum</span>
                <input
                  className="cd-input"
                  type="date"
                  value={attendanceForm.datum}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, datum: event.target.value }))}
                  required
                />
              </label>
              <label className="cd-form-field">
                <span className="cd-form-label">Status</span>
                <select
                  className="cd-input"
                  value={attendanceForm.status}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, status: event.target.value }))}
                >
                  <option value="true">Prisutan</option>
                  <option value="false">Odsutan</option>
                </select>
              </label>
              <label className="cd-form-field">
                <span className="cd-form-label">Broj sati</span>
                <input
                  className="cd-input"
                  type="number"
                  min="0"
                  max="24"
                  value={attendanceForm.brojSati}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, brojSati: event.target.value }))}
                />
              </label>
              <label className="cd-form-field cd-attendance-note">
                <span className="cd-form-label">Napomena</span>
                <input
                  className="cd-input"
                  value={attendanceForm.napomena}
                  onChange={(event) => setAttendanceForm((current) => ({ ...current, napomena: event.target.value }))}
                  placeholder="Opcionalno"
                />
              </label>
              <button type="submit" className="cd-btn cd-btn--primary" disabled={attendanceSaving}>
                {attendanceSaving ? 'Spremanje...' : 'Evidentiraj'}
              </button>
            </form>

            <div className="cd-attendance-list">
              {attendanceLoading ? (
                <p>Učitavanje prisustva...</p>
              ) : attendance.length === 0 ? (
                <p>Nema evidentiranog prisustva.</p>
              ) : (
                attendance.map((item) => (
                  <div key={item.id} className="cd-attendance-row">
                    <div>
                      <strong>{new Date(item.datum).toLocaleDateString('bs-BA')}</strong>
                      {item.napomena && <p>{item.napomena}</p>}
                    </div>
                    <div className="cd-attendance-side">
                      <span className={`cd-attendance-status${item.status ? ' cd-attendance-status--present' : ' cd-attendance-status--absent'}`}>
                        {item.status ? 'Prisutan' : 'Odsutan'}
                      </span>
                      {item.brojSati !== null && item.brojSati !== undefined && (
                        <span className="cd-attendance-hours">{item.brojSati}h</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
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
            ) : (
              <>
                {reportError && (
                  <div className="cd-inline-message cd-inline-message--error">{reportError}</div>
                )}

                {reportData && !reportData.evaluacijaStudenta && (
                  <div className="cd-inline-message cd-inline-message--error" style={{ marginBottom: '1rem' }}>
                    Morate prvo evaluirati studenta prije generisanja izvještaja.
                  </div>
                )}

                {reportData?.evaluacijaStudenta && (
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
                )}

                {reportData?.prisustvo && reportData.prisustvo.ukupnoEvidentirano > 0 && (
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                    <p className="cd-form-label" style={{ marginBottom: '0.25rem' }}>Prisustvo</p>
                    <span>Prisutnih dana: <strong>{reportData.prisustvo.prisutanDana} / {reportData.prisustvo.ukupnoEvidentirano}</strong></span>
                    {reportData.prisustvo.ukupnoSati > 0 && (
                      <span style={{ marginLeft: '1rem' }}>Sati: <strong>{reportData.prisustvo.ukupnoSati}h</strong></span>
                    )}
                  </div>
                )}

                {reportData?.evaluacijaStudenta && (
                  <form onSubmit={submitReport}>
                    <label className="cd-form-field">
                      <span className="cd-form-label">Komentar kompanije</span>
                      <textarea
                        className="cd-input"
                        style={{ width: '100%', minHeight: '2.5rem', resize: 'vertical', boxSizing: 'border-box' }}
                        rows={1}
                        value={reportKomentar}
                        onChange={(e) => setReportKomentar(e.target.value)}
                        placeholder="Unesite komentar o studentu i obavljenoj praksi..."
                        required
                      />
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                      <button type="submit" className="cd-btn cd-btn--primary" disabled={reportSaving}>
                        {reportSaving ? 'Generisanje...' : reportData.izvjestaj ? 'Ažuriraj izvještaj' : 'Generiši izvještaj'}
                      </button>
                    </div>
                  </form>
                )}

                {reportData?.sadrzaj && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <p className="cd-form-label" style={{ marginBottom: '0.5rem' }}>Generisani izvještaj</p>
                    <pre className="cd-contract-content">{reportData.sadrzaj}</pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function candidateDocumentTypeLabel(tip) {
  return CANDIDATE_DOCUMENT_TYPE_LABELS[tip] || tip || 'Dokument';
}

function CandidatesShell({
  listings = [],
  loading = false,
  error = '',
  selectedListingId = '',
  onSelectedListingIdChange,
}) {
  const activeListings = useMemo(
    () => listings.filter((listing) => listing.status === 'AKTIVAN'),
    [listings]
  );
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [openingDocumentId, setOpeningDocumentId] = useState(null);
  const [activeTab, setActiveTab] = useState('all')

  const APPLICATION_TABS = [
    { key: 'all', label: 'Sve prijave' },
    { key: 'shortlisted', label: 'Uži krug' },
    { key: 'approved', label: 'Odobrene' },
    { key: 'rejected', label: 'Odbijene' },
  ];

  useEffect(() => {
    if (loading) return;

    if (activeListings.length === 0) {
      onSelectedListingIdChange?.('');
      return;
    }

    const selectedExists = activeListings.some(
      (listing) => String(listing.id) === String(selectedListingId)
    );

    if (!selectedListingId || !selectedExists) {
      onSelectedListingIdChange?.(String(activeListings[0].id));
    }
  }, [activeListings, loading, selectedListingId, onSelectedListingIdChange]);

  useEffect(() => {
    if (!selectedListingId) {
      setApplications([]);
      return;
    }

    let active = true;
    setApplicationsLoading(true);
    setApplicationsError('');
    setSuccessMessage('');

    getCompanyApplicationsForListing(selectedListingId)
      .then((data) => {
        if (!active) return;
        setApplications(Array.isArray(data?.applications) ? data.applications : []);
      })
      .catch((err) => {
        if (active) setApplicationsError(err.message || 'Greška pri učitavanju prijava kandidata.');
      })
      .finally(() => {
        if (active) setApplicationsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedListingId]);

  const filteredApplications = useMemo(() => {
    switch (activeTab) {
      case 'shortlisted': return applications.filter(a => a.status === APPLICATION_STATUS.SHORTLISTED);
      case 'approved': return applications.filter(a => a.status === APPLICATION_STATUS.APPROVED || a.status === 'ODOBRENA');
      case 'rejected': return applications.filter(a =>
        a.status === APPLICATION_STATUS.REJECTED_COMPANY ||
        a.status === 'ODBIJENA_KOMPANIJA' ||
        a.status === 'ODUSTAO'
      );
      default: return applications;
    }
  }, [applications, activeTab]);

  async function handleShortlist(applicationId) {
    setProcessingId(applicationId);
    setApplicationsError('');
    setSuccessMessage('');

    try {
      const result = await shortlistApplication(applicationId);
      const updated = result?.application;
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? { ...application, ...(updated || {}) } : application
        )
      );
      setSuccessMessage(result?.message || 'Kandidat je uspješno označen za uži krug.');
    } catch (err) {
      setApplicationsError(err.message || 'Greška pri označavanju kandidata.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCompanyDecision(applicationId, decision) {
    setProcessingId(applicationId);
    setApplicationsError('');
    setSuccessMessage('');

    try {
      const action = decision === 'approve'
        ? approveApplicationByCompany
        : rejectApplicationByCompany;
      const result = await action(applicationId);
      const updated = result?.application;
      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? { ...application, ...(updated || {}) } : application
        )
      );
      setSuccessMessage(result?.message || 'Status kandidata je ažuriran.');
    } catch (err) {
      setApplicationsError(err.message || 'Greška pri ažuriranju kandidata.');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleOpenDocument(dokument) {
    if (!dokument?.id) return;

    const pendingWindow = window.open('', '_blank');
    if (pendingWindow) {
      pendingWindow.opener = null;
    }

    setOpeningDocumentId(dokument.id);
    setApplicationsError('');

    try {
      const result = await getCompanyApplicationDocumentDownloadUrl(dokument.id);
      if (!result?.url) {
        throw new Error('Link za dokument nije dostupan.');
      }

      if (pendingWindow) {
        pendingWindow.location.href = result.url;
      } else {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      if (pendingWindow) {
        pendingWindow.close();
      }
      setApplicationsError(err.message || 'Greška pri otvaranju dokumenta.');
    } finally {
      setOpeningDocumentId(null);
    }
  }

  const selectedListing = activeListings.find(
    (listing) => String(listing.id) === String(selectedListingId)
  );

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Prijave kandidata</h1>
        <p className="cd-subtitle">Pregled kandidata po aktivnom oglasu, uži krug i konačna odluka kompanije.</p>
      </header>

      <section className="cd-section">
        <div className="cd-section-header cd-candidates-header">
          <div>
            <h2 className="cd-section-title">Kandidati po oglasu</h2>
            {selectedListing && (
              <p className="cd-candidates-selected">Odabrani oglas: {selectedListing.naziv}</p>
            )}
          </div>

          {activeListings.length > 0 && (
            <label className="cd-candidates-select-label">
              <span>Oglas</span>
              <select
                className="cd-stat-status-select cd-candidates-select"
                value={selectedListingId}
                onChange={(e) => onSelectedListingIdChange?.(e.target.value)}
              >
                {activeListings.map((listing) => (
                  <option key={listing.id} value={listing.id}>
                    {listing.naziv}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {loading && <div className="cd-inline-message" role="status">Učitavanje oglasa...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}

        {!loading && !error && activeListings.length === 0 && (
          <div className="cd-empty-state">
            <div className="cd-empty-title">Nemate aktivnih oglasa.</div>
            <p className="cd-empty-text">Kandidati se prikazuju za oglase koji su trenutno označeni kao aktivni.</p>
          </div>
        )}

        {!loading && !error && activeListings.length > 0 && (
          <>
            {successMessage && (
              <div className="cd-inline-message cd-inline-message--success" role="status">
                {successMessage}
              </div>
            )}
            {/* Tabovi — idu ovdje, između success poruke i loading indikatora */}
            {!applicationsLoading && applications.length > 0 && (
              <div className="cd-stat-tabs" style={{ marginBottom: '16px' }}>
                {APPLICATION_TABS.map(tab => {
                  const count = tab.key === 'all' ? applications.length : (() => {
                    switch (tab.key) {
                      case 'shortlisted': return applications.filter(a => a.status === APPLICATION_STATUS.SHORTLISTED).length;
                      case 'pending': return applications.filter(a => a.status === 'CEKA_KOORDINATORA').length;
                      case 'approved': return applications.filter(a => a.status === APPLICATION_STATUS.APPROVED || a.status === 'ODOBRENA').length;
                      case 'rejected': return applications.filter(a => a.status === APPLICATION_STATUS.REJECTED_COMPANY || a.status === 'ODBIJENA_KOMPANIJA' || a.status === 'ODUSTAO').length;
                      default: return 0;
                    }
                  })();
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      className={`cd-stat-tab${activeTab === tab.key ? ' active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                      {count > 0 && (
                        <span style={{
                          marginLeft: '6px',
                          background: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-border)',
                          color: activeTab === tab.key ? '#fff' : 'var(--color-muted)',
                          borderRadius: '10px',
                          padding: '1px 7px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {applicationsError && (
              <div className="cd-inline-message cd-inline-message--error" role="alert">
                {applicationsError}
              </div>
            )}
            {applicationsLoading && (
              <div className="cd-inline-message" role="status">Učitavanje prijava kandidata...</div>
            )}

            {!applicationsLoading && filteredApplications.length === 0 && !applicationsError && (
              <div className="cd-empty-state">
                <div className="cd-empty-title">
                  {activeTab === 'all'
                    ? 'Nema prijava za odabrani oglas.'
                    : 'Nema prijava u ovoj kategoriji.'}
                </div>
                <p className="cd-empty-text">Kada se studenti prijave na ovaj oglas, pojavit će se u ovom pregledu.</p>
              </div>
            )}

            {!applicationsLoading && filteredApplications.length > 0 && (
              <div className="cd-candidates-table-wrap">
                <table className="cd-candidates-table">
                  <thead>
                    <tr>
                      <th>Kandidat</th>
                      <th>Fakultet / odsjek</th>
                      <th>Godina</th>
                      <th>Datum prijave</th>
                      <th>Dokumenti</th>
                      <th>Status</th>
                      <th>Odluka studenta</th>
                      <th>Akcija</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => {
                      const student = application.student || {};
                      const fullName = [student.ime, student.prezime].filter(Boolean).join(' ') || 'Nepoznat kandidat';
                      const fakultet = student.fakultet?.naziv || 'Fakultet nije unesen';
                      const odsjek = student.odsjek?.naziv || 'Odsjek nije unesen';
                      const dokumenti = Array.isArray(application.dokumenti) ? application.dokumenti : [];
                      const canShortlist = application.status === APPLICATION_STATUS.WAITING_COMPANY;
                      const canDecide = [
                        APPLICATION_STATUS.WAITING_COMPANY,
                        APPLICATION_STATUS.SHORTLISTED,
                      ].includes(application.status);
                      const isProcessing = processingId === application.id;

                      return (
                        <tr key={application.id}>
                          <td>
                            <strong>{fullName}</strong>
                            {student.email && <div className="cd-candidate-muted">{student.email}</div>}
                          </td>
                          <td>
                            <div>{fakultet}</div>
                            <div className="cd-candidate-muted">{odsjek}</div>
                          </td>
                          <td>{student.godinaStudija ? `${student.godinaStudija}. godina` : 'Nije uneseno'}</td>
                          <td>{formatDate(application.datumPrijave)}</td>
                          <td>
                            {dokumenti.length > 0 ? (
                              <div className="cd-candidate-docs">
                                {dokumenti.map((dokument) => {
                                  const isOpening = openingDocumentId === dokument.id;
                                  return (
                                    <button
                                      key={dokument.id}
                                      type="button"
                                      className="cd-candidate-doc-btn"
                                      disabled={isOpening}
                                      onClick={() => handleOpenDocument(dokument)}
                                      title={dokument.naziv || candidateDocumentTypeLabel(dokument.tip)}
                                    >
                                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                      <span>{isOpening ? 'Otvaranje...' : (dokument.naziv || candidateDocumentTypeLabel(dokument.tip))}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="cd-candidate-muted">Nema dokumenata</span>
                            )}
                          </td>
                          <td>{candidateStatusBadge(application.status)}</td>
                          <td>{studentDecisionBadge(application.studentStatus)}</td>
                          <td>
                            {canShortlist || canDecide ? (
                              <div className="cd-candidate-actions">
                                {canShortlist && (
                                  <button
                                    type="button"
                                    className="cd-btn cd-btn--primary cd-btn--sm"
                                    disabled={isProcessing}
                                    onClick={() => handleShortlist(application.id)}
                                  >
                                    {isProcessing ? 'Označavanje...' : 'Označi za uži krug'}
                                  </button>
                                )}
                                {canDecide && (
                                  <>
                                    <button
                                      type="button"
                                      className="cd-btn cd-btn--success cd-btn--sm"
                                      disabled={isProcessing}
                                      onClick={() => handleCompanyDecision(application.id, 'approve')}
                                    >
                                      Odobri
                                    </button>
                                    <button
                                      type="button"
                                      className="cd-btn cd-btn--danger cd-btn--sm"
                                      disabled={isProcessing}
                                      onClick={() => handleCompanyDecision(application.id, 'reject')}
                                    >
                                      Odbij
                                    </button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="cd-candidate-muted">Nema dostupne akcije</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

const EMPTY_LISTING = {
  naziv: '', opis: '', brojMjesta: '', rokPrijave: '', datumPocetka: '',
  trajanje: '', oblast: '', lokacija: '', tip: 'Onsite',
  tehnologije: '', uslovi: '', placenaPraksa: false,
};

function CreateListingShell({ onCancel, onCreated }) {
  const [formData, setFormData] = useState(EMPTY_LISTING);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.naziv || !formData.opis || !formData.brojMjesta || !formData.rokPrijave) {
      setError('Naziv, opis, broj mjesta i rok prijave su obavezni.');
      return;
    }
    if (!formData.datumPocetka) {
      setError('Datum početka prakse je obavezan.');
      return;
    }
    if (!formData.trajanje) {
      setError('Trajanje prakse je obavezno.');
      return;
    }
    if (!Number.isInteger(Number(formData.trajanje)) || Number(formData.trajanje) <= 0) {
      setError('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
      return;
    }
    if (formData.rokPrijave < today) {
      setError('Rok prijave ne može biti u prošlosti.');
      return;
    }
    if (formData.datumPocetka <= formData.rokPrijave) {
      setError('Datum početka prakse mora biti nakon isteka roka prijave.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const result = await createListing({
        naziv: formData.naziv,
        opis: formData.opis,
        brojMjesta: Number(formData.brojMjesta),
        rokPrijave: formData.rokPrijave,
        datumPocetka: formData.datumPocetka,
        trajanje: formData.trajanje,
        oblast: formData.oblast || null,
        lokacija: formData.lokacija || null,
        tip: formData.tip,
        placenaPraksa: formData.placenaPraksa,
        tehnologije: formData.tehnologije.split(',').map(t => t.trim()).filter(Boolean),
        uslovi: formData.uslovi.split('\n').map(u => u.trim()).filter(Boolean),
      });
      setSuccess('Oglas je uspješno kreiran.');
      setFormData(EMPTY_LISTING);
      onCreated(result?.oglas || result);
    } catch (err) {
      setError(err.message || 'Greška pri kreiranju oglasa.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Kreiraj oglas</h1>
        <p className="cd-subtitle">Unesite podatke za novi oglas za praksu.</p>
      </header>
      <section className="cd-section">
        <form className="cd-profile-form" onSubmit={handleSubmit}>
          {error && <div className="cd-inline-message cd-inline-message--error">{error}</div>}
          {success && <div className="cd-inline-message cd-inline-message--success">{success}</div>}

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Naziv oglasa *</label>
              <input className="cd-input" type="text" value={formData.naziv} onChange={(e) => handleChange('naziv', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Broj mjesta *</label>
              <input className="cd-input" type="number" min="1" value={formData.brojMjesta} onChange={(e) => handleChange('brojMjesta', e.target.value)} />
            </div>
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Opis *</label>
            <textarea className="cd-textarea" rows={4} value={formData.opis} onChange={(e) => handleChange('opis', e.target.value)} />
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Rok prijave *</label>
              <DatePicker
                className="cd-input"
                dateFormat="dd.MM.yyyy"
                placeholderText="dd.mm.yyyy"
                minDate={new Date(today)}
                selected={formData.rokPrijave ? new Date(formData.rokPrijave) : null}
                onChange={(date) => handleChange('rokPrijave', date ? date.toISOString().slice(0, 10) : '')}
                autoComplete="off"
              />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Datum početka prakse *</label>
              <DatePicker
                className="cd-input"
                dateFormat="dd.MM.yyyy"
                placeholderText="dd.mm.yyyy"
                minDate={formData.rokPrijave ? new Date(new Date(formData.rokPrijave).getTime() + 86400000) : new Date(today)}
                selected={formData.datumPocetka ? new Date(formData.datumPocetka) : null}
                onChange={(date) => handleChange('datumPocetka', date ? date.toISOString().slice(0, 10) : '')}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Lokacija</label>
              <input className="cd-input" type="text" placeholder="npr. Sarajevo" value={formData.lokacija} onChange={(e) => handleChange('lokacija', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Tip prakse</label>
              <select className="cd-input" value={formData.tip} onChange={(e) => handleChange('tip', e.target.value)}>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          <div className="cd-form-row">
            <div className="cd-form-field">
              <label className="cd-form-label">Trajanje (u mjesecima) *</label>
              <input className="cd-input" type="number" min="1" placeholder="npr. 3" value={formData.trajanje} onChange={(e) => handleChange('trajanje', e.target.value)} />
            </div>
            <div className="cd-form-field">
              <label className="cd-form-label">Oblast</label>
              <input className="cd-input" type="text" placeholder="npr. Web razvoj" value={formData.oblast} onChange={(e) => handleChange('oblast', e.target.value)} />
            </div>
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Tehnologije / vještine (odvojene zarezom)</label>
            <input className="cd-input" type="text" placeholder="npr. React, Node.js, PostgreSQL" value={formData.tehnologije} onChange={(e) => handleChange('tehnologije', e.target.value)} />
          </div>

          <div className="cd-form-field">
            <label className="cd-form-label">Uslovi / zahtjevi (svaki u novom redu)</label>
            <textarea className="cd-textarea" rows={4} placeholder={"Osnove JavaScript-a\nPoznavanje Gita\nStudent 3. ili 4. godine"} value={formData.uslovi} onChange={(e) => handleChange('uslovi', e.target.value)} />
          </div>

          <div className="cd-form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" id="placena-praksa" checked={formData.placenaPraksa} onChange={(e) => handleChange('placenaPraksa', e.target.checked)} />
            <label className="cd-form-label" htmlFor="placena-praksa" style={{ margin: 0 }}>Plaćena praksa (stipendija)</label>
          </div>

          <div className="cd-form-actions">
            <button type="submit" className="cd-btn cd-btn--primary" disabled={saving}>
              {saving ? 'Kreiranje...' : 'Objavi oglas'}
            </button>
            <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={saving}>Nazad</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DeactivateModal({ check, deactivating, onConfirm, onCancel }) {
  const isBlocked = check && !check.canDeactivate;
  const oglasiToClose = check?.oglasiToClose || [];

  return (
    <div className="cd-modal-overlay" role="dialog" aria-modal="true">
      <div className="cd-confirm-modal">
        {isBlocked ? (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--warn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="cd-confirm-title">Deaktivacija nije moguća</h3>
            <p className="cd-confirm-text">Vaši oglasi imaju aktivne prijave. Zatvorite sve oglase sa prijavama prije deaktivacije naloga.</p>
            <ul className="cd-confirm-app-list">
              {(check.oglasi || []).map((naziv, i) => <li key={i}>{naziv}</li>)}
            </ul>
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel}>Zatvori</button>
            </div>
          </>
        ) : (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="cd-confirm-title">Deaktivirajte račun</h3>
            <p className="cd-confirm-text">Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom. Samo administrator može ponovo aktivirati vaš nalog.</p>
            {oglasiToClose.length > 0 && (
              <div className="cd-confirm-warn-box">
                <p className="cd-confirm-warn-label">Sljedeći aktivni oglasi bit će automatski zatvoreni:</p>
                <ul className="cd-confirm-app-list">
                  {oglasiToClose.map((naziv, i) => <li key={i}>{naziv}</li>)}
                </ul>
              </div>
            )}
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={deactivating}>Odustani</button>
              <button type="button" className="cd-btn cd-btn--danger" onClick={onConfirm} disabled={deactivating}>
                {deactivating ? 'Deaktivacija...' : 'Deaktiviraj nalog'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DeleteModal({ check, deleting, deleteError, onConfirm, onCancel }) {
  const isBlocked = check && !check.canDeactivate;

  return (
    <div className="cd-modal-overlay" role="dialog" aria-modal="true">
      <div className="cd-confirm-modal">
        {isBlocked ? (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--warn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3 className="cd-confirm-title">Brisanje nije moguće</h3>
            <p className="cd-confirm-text">Vaši oglasi imaju aktivne prijave. Zatvorite sve oglase sa prijavama prije brisanja naloga.</p>
            <ul className="cd-confirm-app-list">
              {(check.oglasi || []).map((naziv, i) => <li key={i}>{naziv}</li>)}
            </ul>
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel}>Zatvori</button>
            </div>
          </>
        ) : (
          <>
            <div className="cd-confirm-icon cd-confirm-icon--danger">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" /><path d="M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="cd-confirm-title">Obriši nalog</h3>
            <p className="cd-confirm-text">Ova akcija je <strong>trajna i nepovratna</strong>. Svi vaši podaci bit će trajno obrisani sa platforme.</p>
            {deleteError && <div className="cd-inline-message cd-inline-message--error" role="alert">{deleteError}</div>}
            <div className="cd-confirm-actions">
              <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={deleting}>Odustani</button>
              <button type="button" className="cd-btn cd-btn--danger" onClick={onConfirm} disabled={deleting}>
                {deleting ? 'Brisanje...' : 'Obriši nalog'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const CHART_COLORS = { blue: '#1a6fd4', purple: '#6d4ce1', green: '#0e9e6e' };

function StatChart({ data, dataKey, nameKey, color, height = 260, tickFormatter }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
        <XAxis
          dataKey={nameKey}
          tick={{ fontSize: 12, fill: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
          tickFormatter={tickFormatter}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-primary-subtle)', radius: 4 }}
          contentStyle={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-card)',
          }}
          labelStyle={{ color: 'var(--color-dark)', fontWeight: 600 }}
          itemStyle={{ color: color }}
        />
        <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={color} fillOpacity={0.85 + (i % 2) * 0.1} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

const STAT_TABS = [
  { key: 'prijave', label: 'Sve prijave' },
  { key: 'odsjek', label: 'Po odsjeku' },
  { key: 'godina', label: 'Po godini' },
  { key: 'fakultet', label: 'Po fakultetu' },
];

function StatistikaShell() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('prijave');
  const [statusFilter, setStatusFilter] = useState('');
  const [oglasFilter, setOglasFilter] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getApplicationStatistics({
      status: statusFilter || undefined,
      oglasID: oglasFilter || undefined,
    })
      .then((data) => { if (active) setStats(data); })
      .catch((err) => { if (active) setError(err.message || 'Greška pri učitavanju statistike.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [statusFilter, oglasFilter]);

  function handleTabChange(key) {
    setActiveTab(key);
    if (key === 'prijave') setOglasFilter('');
  }

  const truncate = (str, n = 18) => str?.length > n ? str.slice(0, n) + '…' : str;

  const perListingData = (stats?.perListing || []).map((l) => ({ naziv: l.naziv, 'Broj prijava': l.count }));
  const byYearData = (stats?.byYear || []).map((y) => ({ godina: `${y.year}. godina`, 'Broj prijava': y.count }));
  const byFakultetData = (stats?.byFakultet || []).map((f) => ({ fakultet: f.naziv, 'Broj prijava': f.count }));
  const byOdsjekGroups = stats?.byOdsjek || [];

  const chartConfig = {
    prijave: { data: perListingData, nameKey: 'naziv', color: CHART_COLORS.blue, tickN: 14, emptyMsg: 'Nema prijava na oglase.' },
    godina: { data: byYearData, nameKey: 'godina', color: CHART_COLORS.purple, tickN: 14, emptyMsg: 'Nema podataka o godini studija.' },
    fakultet: { data: byFakultetData, nameKey: 'fakultet', color: CHART_COLORS.green, tickN: 14, emptyMsg: 'Nema podataka o fakultetu.' },
  };
  const current = chartConfig[activeTab];

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Statistika prijava</h1>
        <p className="cd-subtitle">Pregled prijava na vaše oglase sa analizom po odsjeku, godini studija i fakultetu.</p>
      </header>

      <section className="cd-section">
        {loading && <div className="cd-inline-message" role="status">Učitavanje statistike...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}

        {!loading && !error && stats && (
          <>
            <div className="cd-stats-grid cd-stats-grid--stat" aria-label="Sažetak prijava">
              <article className="cd-stat-card">
                <span className="cd-stat-label">Ukupno prijava</span>
                <span className="cd-stat-value">{stats.summary.totalApplications}</span>
                <span className="cd-stat-sub cd-stat-sub--blue">
                  {stats.summary.totalApplications === 1 ? '1 prijava' : `${stats.summary.totalApplications} prijava`}
                </span>
              </article>
              <article className="cd-stat-card">
                <span className="cd-stat-label">Oglasi sa prijavama</span>
                <span className="cd-stat-value">{stats.summary.listingsWithApplications}</span>
                <span className="cd-stat-sub cd-stat-sub--muted">
                  {stats.summary.listingsWithApplications === 1 ? '1 oglas' : `${stats.summary.listingsWithApplications} oglasa`}
                </span>
              </article>
            </div>

            <div className="cd-stat-filter-row">
              <div className="cd-stat-filter-group">
                <span className="cd-stat-filter-label">Status</span>
                <select className="cd-stat-status-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Svi statusi</option>
                  <option value="CEKA_KOMPANIJU">Čeka odgovor kompanije</option>
                  <option value="U_RAZMATRANJU">Uži krug</option>
                  <option value="ODOBRENA">Praksa odobrena</option>
                  <option value="ODBIJENA_KOMPANIJA">Odbijeno od kompanije</option>
                  <option value="ODUSTAO">Odustao</option>
                </select>
              </div>

              {activeTab !== 'prijave' && (stats?.oglasi?.length > 0) && (
                <>
                  <div className="cd-stat-filter-divider" />
                  <div className="cd-stat-filter-group">
                    <span className="cd-stat-filter-label">Oglas</span>
                    <select className="cd-stat-status-select" value={oglasFilter} onChange={(e) => setOglasFilter(e.target.value)}>
                      <option value="">Svi oglasi</option>
                      {(stats.oglasi || []).map((o) => (
                        <option key={o.id} value={o.id}>{o.naziv}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="cd-stat-tabs">
              {STAT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`cd-stat-tab${activeTab === tab.key ? ' active' : ''}`}
                  onClick={() => handleTabChange(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'odsjek' ? (
              byOdsjekGroups.length === 0 ? (
                <div className="cd-stats-panel">
                  <h2 className="cd-stats-panel-title">Po odsjeku</h2>
                  <div className="cd-empty-state cd-empty-state--inline">
                    <div className="cd-empty-title">Nema podataka o odsjeku.</div>
                  </div>
                </div>
              ) : (
                byOdsjekGroups.map((group) => (
                  <div key={group.fakultetID} className="cd-stats-panel">
                    <h2 className="cd-stats-panel-title">{group.fakultetNaziv}</h2>
                    <StatChart
                      data={group.odsjeci.map((o) => ({ odsjek: o.naziv, 'Broj prijava': o.count }))}
                      dataKey="Broj prijava"
                      nameKey="odsjek"
                      color={CHART_COLORS.green}
                      height={260}
                      tickFormatter={(v) => truncate(v, 14)}
                    />
                  </div>
                ))
              )
            ) : (
              <div className="cd-stats-panel">
                <h2 className="cd-stats-panel-title">{STAT_TABS.find((t) => t.key === activeTab)?.label}</h2>
                {current.data.length === 0 ? (
                  <div className="cd-empty-state cd-empty-state--inline">
                    <div className="cd-empty-title">{current.emptyMsg}</div>
                  </div>
                ) : (
                  <StatChart
                    data={current.data}
                    dataKey="Broj prijava"
                    nameKey={current.nameKey}
                    color={current.color}
                    height={300}
                    tickFormatter={(v) => truncate(v, current.tickN)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function ClosedListingsShell({ listings, loading, error, onArchiveListing, actionProcessingId }) {
  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Zatvoreni oglasi</h1>
        <p className="cd-subtitle">Pregled vaših oglasa kojima je istekao rok prijave ili koji su zatvoreni ručno.</p>
      </header>
      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Zatvoreni i istekli oglasi</h2>
          {!loading && (
            <span className="cd-section-count">{listings.length} {listings.length === 1 ? 'oglas' : 'oglasa'}</span>
          )}
        </div>

        {loading && <div className="cd-inline-message" role="status">Učitavanje zatvorenih oglasa...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}

        {!loading && !error && listings.length === 0 && (
          <div className="cd-empty-state">
            <div className="cd-empty-title">Nema zatvorenih ili isteklih oglasa.</div>
            <p className="cd-empty-text">Ovdje će se prikazati oglasi kojima je istekao rok prijave ili koje zatvorite ručno.</p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="cd-listings-list">
            {listings.map((listing) => {
              const istekao = listing.rokPrijave && new Date(listing.rokPrijave) <= new Date();
              const displayStatus = istekao && listing.status === 'AKTIVAN' ? 'ISTEKAO' : 'ZATVOREN';

              return (
                <article key={listing.id} className="cd-listing-card">
                  <div className="cd-listing-main">
                    <h3 className="cd-listing-title">{listing.naziv}</h3>
                    <p className="cd-listing-desc">{listing.opis}</p>
                    <div className="cd-listing-meta">
                      {listing.oblast && <span>{listing.oblast}</span>}
                      {listing.trajanje && <span>{listing.trajanje} mj.</span>}
                      <span>{listing.brojMjesta} {Number(listing.brojMjesta) === 1 ? 'mjesto' : 'mjesta'}</span>
                      {listing.tip && <span>{listing.tip}</span>}
                    </div>
                  </div>
                  <div className="cd-listing-side">
                    <span className="cd-listing-status cd-listing-status--zatvoren">{displayStatus}</span>
                    <span className="cd-listing-date">Rok: {formatDate(listing.rokPrijave)}</span>
                    <span className="cd-listing-date">Objava: {formatDate(listing.datumObjave)}</span>

                    <div className="cd-listing-actions-wrapper">
                      <button
                        className="cd-btn cd-btn--secondary"
                        onClick={(e) => { e.stopPropagation(); onArchiveListing(listing); }}
                        disabled={actionProcessingId === listing.id}
                      >
                        {actionProcessingId === listing.id ? 'Arhiviranje...' : 'Arhiviraj'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ArchivedListingsShell({ listings, loading, error, onRestoreListing, actionProcessingId }) {
  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Arhivirani oglasi</h1>
        <p className="cd-subtitle">Pregled istorijskih oglasa koji su sklonjeni iz aktivne evidencije.</p>
      </header>
      <section className="cd-section">
        <div className="cd-section-header">
          <h2 className="cd-section-title">Arhiva oglasa</h2>
          {!loading && (
            <span className="cd-section-count">{listings.length} {listings.length === 1 ? 'oglas' : 'oglasa'}</span>
          )}
        </div>

        {loading && <div className="cd-inline-message" role="status">Učitavanje arhive...</div>}
        {!loading && error && <div className="cd-inline-message cd-inline-message--error" role="alert">{error}</div>}

        {!loading && !error && listings.length === 0 && (
          <div className="cd-empty-state">
            <div className="cd-empty-title">Nema arhiviranih oglasa.</div>
            <p className="cd-empty-text">Oglasi koje arhivirate unutar "Zatvoreni oglasi" sekcije će se pojaviti ovdje.</p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="cd-listings-list">
            {listings.map((listing) => (
              <article key={listing.id} className="cd-listing-card">
                <div className="cd-listing-main">
                  <h3 className="cd-listing-title">{listing.naziv}</h3>
                  <p className="cd-listing-desc">{listing.opis}</p>
                  <div className="cd-listing-meta">
                    {listing.oblast && <span>{listing.oblast}</span>}
                    {listing.trajanje && <span>{listing.trajanje} mj.</span>}
                    <span>{listing.brojMjesta} {Number(listing.brojMjesta) === 1 ? 'mjesto' : 'mjesta'}</span>
                  </div>
                </div>
                <div className="cd-listing-side">
                  <span className="cd-listing-status cd-listing-status--arhiviran" style={{ backgroundColor: 'var(--color-muted)', color: '#fff' }}>Arhivirano</span>
                  <span className="cd-listing-date">Rok: {formatDate(listing.rokPrijave)}</span>

                  <div className="cd-listing-actions-wrapper">
                    <button
                      className="cd-btn cd-btn--secondary"
                      onClick={(e) => { e.stopPropagation(); onRestoreListing(listing.id); }}
                      disabled={actionProcessingId === listing.id}
                    >
                      {actionProcessingId === listing.id ? 'Vraćanje...' : 'Vrati iz arhive'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
