// KoordinatorDashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { koordinatorService } from '../services/koordinatorService';
import { checkCoordinatorDeactivation, deactivateCoordinatorAccount, deleteMyCoordinatorAccount } from '../services/userService';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import PrijavePregled from '../modules/koordinator/PrijavePregled';
import PraksePregled from '../modules/koordinator/PraksePregled';
import StudentListaPregled from '../modules/koordinator/StudentListaPregled';
import OdobravanjePregled from '../modules/koordinator/OdobravanjePregled';
import './KoordinatorDashboard.css';
import KoordinatorLimitPanel from '../modules/koordinator/KoordinatorLimitPanel';

const IconMoon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);
const IconSun = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

/* ── Nav SVGs ──────────────────────────────────────────────── */
const SvgClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const SvgList = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const SvgBriefcase = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const SvgUsers = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const SvgShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const SvgLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function KoordinatorDashboard() {
  const { user, logout }            = useAuth();
  const { darkMode, setDarkMode }   = useTheme();
  const navigate                    = useNavigate();
  const [aktivan, setAktivan]           = useState('prijave');
  const [stats, setStats]               = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [settingsTab, setSettingsTab]           = useState('account');
  const [profileMenuOpen, setProfileMenuOpen]   = useState(false);
  const [deactivateCheck, setDeactivateCheck]   = useState(null);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivating, setDeactivating]         = useState(false);
  const [deactivateError, setDeactivateError]   = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCheck, setDeleteCheck]           = useState(null);
  const [deleting, setDeleting]                 = useState(false);
  const [deleteError, setDeleteError]           = useState('');
  const profileMenuRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleClick(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [profileMenuOpen]);

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

  const ucitajStats = useCallback(() => {
    setLoadingStats(true);
    koordinatorService.getDashboardStats()
      .then(res => res.success && setStats(res.data))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => { ucitajStats(); }, [ucitajStats]);

  const handleLogout = () => { logout(); navigate('/'); };

  async function handleOpenDeactivate() {
    setDeactivateError('');
    try {
      const result = await checkCoordinatorDeactivation();
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
      await deactivateCoordinatorAccount();
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
      const result = await checkCoordinatorDeactivation();
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
      await deleteMyCoordinatorAccount();
      logout();
      navigate('/');
    } catch (err) {
      setDeleting(false);
      setDeleteError(err.message || 'Greška pri brisanju naloga.');
    }
  }

  return (
    <div className={`kd-root${darkMode ? ' kd-dark' : ''}`}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="kd-navbar">
        <Link to="/" className="kd-navbar-brand" aria-label="Idi na početnu stranicu">PraksaHub</Link>
        <div className="kd-navbar-right">
          <div className="kd-notif-wrap" ref={notifRef}>
            <button
              type="button"
              className="kd-notif-btn"
              onClick={() => setNotifOpen(o => !o)}
              title="Notifikacije"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {notifications.filter(n => !n.procitana).length > 0 && (
                <span className="kd-notif-badge">
                  {notifications.filter(n => !n.procitana).length > 9 ? '9+' : notifications.filter(n => !n.procitana).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="kd-notif-dropdown">
                <div className="kd-notif-header">
                  <span className="kd-notif-title">Notifikacije</span>
                  {notifications.some(n => !n.procitana) && (
                    <button
                      className="kd-notif-read-all"
                      onClick={async () => {
                        await markAllNotificationsRead().catch(() => { });
                        setNotifications(prev => prev.map(n => ({ ...n, procitana: true })));
                      }}
                    >
                      Označi sve
                    </button>
                  )}
                </div>
                <div className="kd-notif-list">
                  {notifications.length === 0 ? (
                    <p className="kd-notif-empty">Nema notifikacija.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`kd-notif-item${n.procitana ? '' : ' kd-notif-item--unread'}`}
                        onClick={async () => {
                          if (!n.procitana) {
                            await markNotificationRead(n.id).catch(() => { });
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, procitana: true } : x));
                          }
                        }}
                      >
                        <div className={`kd-notif-dot${n.procitana ? ' kd-notif-dot--read' : ''}`} />
                        <div className="kd-notif-body">
                          <p className="kd-notif-naslov">{n.naslov}</p>
                          <p className="kd-notif-poruka">{n.poruka}</p>
                          <span className="kd-notif-time">{new Date(n.created_at).toLocaleDateString('bs-BA')}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="kd-theme-btn" onClick={() => setDarkMode(!darkMode)} title="Promijeni temu">
            {darkMode ? <IconSun size={15} /> : <IconMoon size={15} />}
          </button>
        </div>
      </nav>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="kd-sidebar">

        {/* Collapsed icon strip */}
        <div className="kd-sidebar-tab">
          <div className="kd-sb-tab-icon" title="Prijave na čekanju" style={{ position: 'relative' }}>
            <SvgClock />
            {stats?.podnesene > 0 && <span className="kd-sb-badge">{stats.podnesene}</span>}
          </div>
          <div className="kd-sb-tab-icon" title="Sve prijave"><SvgList /></div>
          <div className="kd-sb-tab-icon" title="Aktivne prakse"><SvgBriefcase /></div>
          <div className="kd-sb-tab-icon" title="Studenti"><SvgUsers /></div>
          <div className="kd-sb-tab-icon" title="Odobravanje naloga"><SvgShield /></div>
          <div className="kd-sb-tab-footer">
            <div className="kd-sb-tab-icon">
              <div className="kd-nav-avatar">{user?.ime?.[0]?.toUpperCase() || 'K'}</div>
            </div>
            <div className="kd-sb-tab-icon" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <SvgLogout />
            </div>
          </div>
        </div>

        {/* Expanded inner */}
        <div className="kd-sidebar-inner">
          <div className="kd-sidebar-scroll">
            <div className="kd-nav-group">
              <div className="kd-nav-label">Upravljanje</div>
              <nav className="kd-nav">
                <button
                  className={`kd-nav-item${aktivan === 'prijave' ? ' active' : ''}`}
                  onClick={() => setAktivan('prijave')}
                >
                  <SvgClock />
                  Prijave na čekanju
                  {stats?.podnesene > 0 && <span className="kd-badge">{stats.podnesene}</span>}
                </button>
                <button
                  className={`kd-nav-item${aktivan === 'sve' ? ' active' : ''}`}
                  onClick={() => setAktivan('sve')}
                >
                  <SvgList />
                  Sve prijave
                </button>
                <button
                  className={`kd-nav-item${aktivan === 'prakse' ? ' active' : ''}`}
                  onClick={() => setAktivan('prakse')}
                >
                  <SvgBriefcase />
                  Aktivne prakse
                </button>
                <button
                  className={`kd-nav-item${aktivan === 'studenti' ? ' active' : ''}`}
                  onClick={() => setAktivan('studenti')}
                >
                  <SvgUsers />
                  Studenti
                </button>
                <button
                  className={`kd-nav-item${aktivan === 'odobravanje' ? ' active' : ''}`}
                  onClick={() => setAktivan('odobravanje')}
                >
                  <SvgShield />
                  Odobravanje naloga
                </button>
                <button
                  className={`kd-nav-item${aktivan === 'limit' ? ' active' : ''}`}
                  onClick={() => setAktivan('limit')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="23" y1="11" x2="17" y2="11"/>
                 </svg>
                 Limit prijava
                </button>
              </nav>
            </div>
          </div>

          <div className="kd-sidebar-footer">
            <button
              className="kd-sb-footer-row"
              ref={profileMenuRef}
              onClick={() => setSettingsOpen(true)}
            >
              <div className="kd-nav-avatar">{user?.ime?.[0]?.toUpperCase() || 'K'}</div>
              <span className="kd-sb-footer-text">{user?.ime} {user?.prezime}</span>
            </button>
            <button className="kd-sb-footer-row kd-sb-logout-row" onClick={handleLogout}>
              <SvgLogout />
              <span className="kd-sb-footer-text">Odjava</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="kd-main">
        <section className="kd-stats-strip">
          <StatCard label="Čeka koordinatora" value={stats?.podnesene} color="warning" loading={loadingStats} onClick={() => setAktivan('prijave')} clickable />
          <StatCard label="Proslijeđeno kompaniji" value={stats?.proslijedene} color="primary" loading={loadingStats} />
          <StatCard label="Praksa odobrena" value={stats?.odobrene} color="success" loading={loadingStats} />
          <StatCard label="Odbijeno"       value={stats?.odbijene}      color="danger"  loading={loadingStats} />
          <StatCard label="Aktivne prakse" value={stats?.aktivnePrakse} color="primary" loading={loadingStats} onClick={() => setAktivan('prakse')} clickable />
          <StatCard label="Završene"       value={stats?.zavrsene}      color="purple"  loading={loadingStats} />
        </section>

        <div className="kd-content">
          {aktivan === 'prijave'     && <PrijavePregled filterStatus="CEKA_KOORDINATORA" onOdluka={ucitajStats} />}
          {aktivan === 'sve'         && <PrijavePregled filterStatus="" onOdluka={ucitajStats} />}
          {aktivan === 'prakse'      && <PraksePregled />}
          {aktivan === 'studenti'    && <StudentListaPregled />}
          {aktivan === 'odobravanje' && <OdobravanjePregled />}
          {aktivan === 'limit' && <KoordinatorLimitPanel />}
        </div>
      </main>

      {/* ── Settings overlay ───────────────────────────────── */}
      {settingsOpen && (
        <div className="kd-settings-page">
          <aside className="kd-settings-sidebar">
            <div className="kd-settings-sidebar-top">
              <button className="kd-settings-back" onClick={() => setSettingsOpen(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Nazad
              </button>
              <span className="kd-settings-sidebar-title">Postavke</span>
            </div>
            <nav className="kd-settings-nav">
              <div className="kd-settings-nav-label">Opšte</div>
              <button
                className={`kd-settings-nav-item${settingsTab === 'account' ? ' active' : ''}`}
                onClick={() => setSettingsTab('account')}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Račun</span>
              </button>
            </nav>
          </aside>

          <div className="kd-settings-main">
            <div className="kd-settings-content">
              {settingsTab === 'account' && (
                <div className="kd-settings-account">
                  <h3 className="kd-settings-section-title">Račun</h3>
                  <div className="kd-settings-user-info">
                    <div className="kd-settings-avatar">
                      {(user?.ime?.[0] || 'K').toUpperCase()}
                    </div>
                    <div>
                      <div className="kd-settings-username">{user?.ime} {user?.prezime}</div>
                      <div className="kd-settings-email">{user?.email}</div>
                    </div>
                  </div>
                  <div className="kd-danger-section">
                    <h4 className="kd-danger-section-title">Deaktivacija naloga</h4>
                    <div className="kd-settings-danger-zone">
                      <div className="kd-settings-danger-desc">
                        Deaktivacijom naloga gubi se pristup platformi. Prijave koje su vam dodijeljene ostaće trenutno bez koordinatora. Administrator može ponovo aktivirati nalog.
                      </div>
                      {deactivateError && (
                        <div className="kd-settings-error" role="alert">{deactivateError}</div>
                      )}
                      <button className="kd-settings-danger-btn" onClick={handleOpenDeactivate}>
                        Deaktiviraj nalog
                      </button>
                    </div>
                  </div>
                  <div className="kd-danger-section">
                    <h4 className="kd-danger-section-title">Brisanje naloga</h4>
                    <div className="kd-settings-danger-zone">
                      <div className="kd-settings-danger-desc">
                        Brisanjem naloga trajno se uklanjaju svi vaši podaci i dodjele sa platforme. Ova akcija je nepovratna.
                      </div>
                      {deleteError && (
                        <div className="kd-settings-error" role="alert">{deleteError}</div>
                      )}
                      <button className="kd-settings-danger-btn" onClick={handleOpenDelete}>
                        Obriši nalog
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate confirm modal ────────────────────────── */}
      {showDeactivateConfirm && (
        <div className="kd-modal-overlay" role="dialog" aria-modal="true">
          <div className="kd-confirm-modal">
            {deactivateCheck?.canDeactivate === false ? (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Deaktivacija nije moguća</h3>
                <p className="kd-confirm-text">
                  Imate aktivne prakse u toku. Morate ih riješiti prije deaktivacije naloga.
                </p>
                <ul className="kd-confirm-app-list">
                  {(deactivateCheck.studenti || []).map((ime, i) => <li key={i}>{ime}</li>)}
                </ul>
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={handleCancelDeactivate}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Deaktivirajte račun</h3>
                <p className="kd-confirm-text">
                  Ova akcija je nepovratna. Nakon deaktivacije više se nećete moći prijaviti ovim nalogom.
                  Samo administrator može ponovo aktivirati vaš nalog.
                </p>
                {deactivateCheck?.pendingCount > 0 && (
                  <div className="kd-confirm-warn-box">
                    <p className="kd-confirm-warn-label">
                      {deactivateCheck.pendingCount} {deactivateCheck.pendingCount === 1 ? 'prijava' : 'prijave'} ostaće trenutno bez koordinatora.
                    </p>
                  </div>
                )}
                {deactivateError && <p className="kd-settings-error" role="alert">{deactivateError}</p>}
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={handleCancelDeactivate} disabled={deactivating}>Odustani</button>
                  <button className="kd-confirm-btn kd-confirm-btn--danger" onClick={handleConfirmDeactivate} disabled={deactivating}>
                    {deactivating ? 'Deaktivacija...' : 'Deaktiviraj nalog'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="kd-modal-overlay" role="dialog" aria-modal="true">
          <div className="kd-confirm-modal">
            {deleteCheck?.canDeactivate === false ? (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--warn">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Brisanje nije moguće</h3>
                <p className="kd-confirm-text">
                  Imate aktivne prakse u toku. Morate ih riješiti prije brisanja naloga.
                </p>
                <ul className="kd-confirm-app-list">
                  {(deleteCheck.studenti || []).map((ime, i) => <li key={i}>{ime}</li>)}
                </ul>
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteCheck(null); setDeleteError(''); }}>Zatvori</button>
                </div>
              </>
            ) : (
              <>
                <div className="kd-confirm-icon kd-confirm-icon--danger">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </div>
                <h3 className="kd-confirm-title">Obriši nalog</h3>
                <p className="kd-confirm-text">
                  Ova akcija je <strong>trajna i nepovratna</strong>. Svi vaši podaci bit će trajno obrisani sa platforme.
                </p>
                {deleteCheck?.pendingCount > 0 && (
                  <div className="kd-confirm-warn-box">
                    <p className="kd-confirm-warn-label">
                      {deleteCheck.pendingCount} {deleteCheck.pendingCount === 1 ? 'prijava' : 'prijave'} ostaće bez koordinatora nakon brisanja.
                    </p>
                  </div>
                )}
                {deleteError && <p className="kd-settings-error" role="alert">{deleteError}</p>}
                <div className="kd-confirm-actions">
                  <button className="kd-confirm-btn kd-confirm-btn--secondary" onClick={() => { setShowDeleteConfirm(false); setDeleteCheck(null); setDeleteError(''); }} disabled={deleting}>Odustani</button>
                  <button className="kd-confirm-btn kd-confirm-btn--danger" onClick={handleConfirmDelete} disabled={deleting}>
                    {deleting ? 'Brisanje...' : 'Obriši nalog'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, loading, onClick, clickable }) {
  return (
    <div
      className={`kd-stat-card kd-stat-card--${color}${clickable ? ' kd-stat-card--clickable' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <span className="kd-stat-value">
        {loading ? <span className="kd-skeleton-inline" /> : (value ?? '—')}
      </span>
      <span className="kd-stat-label">{label}</span>
    </div>
  );
}
