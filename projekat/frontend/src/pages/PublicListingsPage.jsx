import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./PublicListingsPage.css";
import { apiRequest } from "../services/api";

/* ─── Helpers ───────────────────────────────────────────────────────── */
function daysUntil(dateStr) {
  return Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("bs-BA", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function deadlineInfo(dateStr) {
  if (!dateStr) return { label: "Bez roka", cls: "ok" };
  const days = daysUntil(dateStr);
  if (days < 0) return { label: "Istekao", cls: "expired" };
  if (days === 0) return { label: "Ističe danas!", cls: "urgent" };
  if (days <= 3) return { label: `${days}d`, cls: "urgent" };
  if (days <= 7) return { label: `${days}d`, cls: "soon" };
  return { label: formatDate(dateStr), cls: "ok" };
}

const LOGO_COLORS = ["#1a6fd4", "#6d4ce1", "#0e9e6e", "#e07b1a", "#c0392b", "#2980b9"];
function logoColor(name = "") {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % LOGO_COLORS.length;
  return LOGO_COLORS[idx];
}
function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
}

/* ─── ListingCard ───────────────────────────────────────────────────── */
function ListingCard({ oglas, onLoginPrompt }) {
  const dl = deadlineInfo(oglas.rokPrijave);

  return (
    <div className="sd-card-wrap" tabIndex="0">
      <article className="sd-card">
        <div className="sd-card-head">
          <div className="sd-company-row">
            <div className="sd-logo" style={{ background: logoColor(oglas.Kompanija?.naziv) }}>
              {initials(oglas.Kompanija?.naziv)}
            </div>
            <div className="sd-company-info">
              <span className="sd-company-name">{oglas.Kompanija?.naziv ?? "—"}</span>
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
              {oglas.tip && (
                <span className={`sd-tip-badge sd-tip--${oglas.tip.toLowerCase()}`}>{oglas.tip}</span>
              )}
              {oglas.placenaPraksa && <span className="sd-stip-badge">Plaćena</span>}
            </div>
          </div>

          <h2 className="sd-card-title">{oglas.naziv}</h2>
          <p className="sd-card-opis">{oglas.opis}</p>
        </div>

        {oglas.tehnologije?.length > 0 && (
          <div className="sd-tech-row">
            {oglas.tehnologije.slice(0, 5).map(t => (
              <span key={t} className="sd-tech-tag">{t}</span>
            ))}
            {oglas.tehnologije.length > 5 && (
              <span className="sd-tech-tag" style={{ opacity: 0.6 }}>+{oglas.tehnologije.length - 5}</span>
            )}
          </div>
        )}

        <div className="sd-card-foot">
          <div className="sd-meta-row">
            <span className="sd-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {oglas.brojMjesta} {oglas.brojMjesta === 1 ? "mjesto" : "mjesta"}
            </span>
            {oglas.trajanje && (
              <>
                <span className="sd-meta-dot" />
                <span className="sd-meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  {oglas.trajanje}
                </span>
              </>
            )}
            <span className="sd-meta-dot" />
            <span className={`pl-deadline-inline pl-deadline--${dl.cls}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dl.cls === "expired" ? "Istekao" : `Rok: ${formatirajDatum(dl.label)}`}
            </span>
          </div>

          <div className="sd-foot-right">
            {oglas.oblast && <span className="pl-oblast-tag">{oglas.oblast}</span>}
            <button className="sd-btn-detail pl-btn-lock" onClick={onLoginPrompt}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Prijavi se
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ─── Login prompt modal ────────────────────────────────────────────── */
function LoginPromptModal({ onClose }) {
  useEffect(() => {
    const fn = e => e.key === "Escape" && onClose();
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal pl-login-modal" onClick={e => e.stopPropagation()}>
        <div className="pl-modal-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1a6fd4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 className="pl-modal-title">Prijava je potrebna</h3>
        <p className="pl-modal-text">
          Da bi se prijavio na praksu, moraš imati korisnički nalog.
          Registracija je besplatna i traje samo par minuta.
        </p>
        <div className="pl-modal-actions">
          <Link to="/auth" className="pl-btn-outline">Prijavi se</Link>
          <Link to="/register" className="pl-btn-primary">Registruj se</Link>
        </div>
        <button className="pl-modal-dismiss" onClick={onClose}>Zatvori</button>
      </div>
    </div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function PublicListingsPage() {
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();

  const [oglasi, setOglasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [tip, setTip] = useState([]);
  const [filterTehs, setFilterTehs] = useState([]);
  const [filterTrajanja, setFilterTrajanja] = useState([]);
  const [sortBy, setSortBy] = useState("najnovije");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [sectionsOpen, setSectionsOpen] = useState({ tip: false, tech: false, duration: false, sort: false });

  useEffect(() => {
    if (user) { navigate("/listings", { replace: true }); return; }
    fetchOglasi();
  }, [user]); // eslint-disable-line

  async function fetchOglasi() {
    try {
      setLoading(true); setError(null);
      const data = await apiRequest('/listings/active');
      setOglasi(data);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const allTehs = [...new Set(oglasi.flatMap(o => o.tehnologije || []))].sort();
  const filtered = oglasi.filter(o => {
    const q = search.toLowerCase();
    if (search && !o.naziv?.toLowerCase().includes(q) && !o.opis?.toLowerCase().includes(q)
      && !o.Kompanija?.naziv?.toLowerCase().includes(q)) return false;
    if (tip.length && !tip.includes(o.tip)) return false;
    if (filterTehs.length && !filterTehs.some(t => (o.tehnologije || []).includes(t))) return false;
    if (filterTrajanja.length && !filterTrajanja.some(range => {
      const t = o.trajanje ? Number(o.trajanje) : null;
      if (!t) return false;
      if (range === '1-2') return t <= 2;
      if (range === '3') return t === 3;
      if (range === '4-5') return t >= 4 && t <= 5;
      if (range === '6+') return t >= 6;
      return false;
    })) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'najnovije') return new Date(b.datumObjave) - new Date(a.datumObjave);
    if (sortBy === 'najstarije') return new Date(a.datumObjave) - new Date(b.datumObjave);
    if (sortBy === 'trajanje-asc') return (a.trajanje || 0) - (b.trajanje || 0);
    if (sortBy === 'trajanje-desc') return (b.trajanje || 0) - (a.trajanje || 0);
    return 0;
  });

  const hasFilters = !!(search || tip.length || filterTehs.length || filterTrajanja.length || sortBy !== 'najnovije');
  const clear = () => { setSearch(""); setTip([]); setFilterTehs([]); setFilterTrajanja([]); setSortBy("najnovije"); };
  const toggle = key => setSectionsOpen(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className={`pl-page${darkMode ? " dark" : ""}`}>

      {showModal && <LoginPromptModal onClose={() => setShowModal(false)} />}

      {/* ── Fixed Navbar ── */}
      <nav className="pl-nav">
        <div className="pl-nav-inner">
          <Link to="/" className="pl-nav-back">
            <img src="/logo2.png" alt="PraksaHub" className="pl-nav-logo" />
          </Link>
          <div className="pl-nav-right">
            <button className="sd-theme-btn" onClick={() => setDarkMode(!darkMode)} title="Promijeni temu">
              {darkMode ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <Link to="/auth" className="pl-nav-btn-outline">Prijavi se</Link>
            <Link to="/register" className="pl-nav-btn-primary">Registruj se</Link>
          </div>
        </div>
      </nav>

      {/* ── Layout ── */}
      <div className="pl-layout">

        {/* ── Always-visible Sidebar ── */}
        <aside className={`pl-sidebar${mobileFiltersOpen ? " mobile-open" : ""}`}>
          <div className="pl-sidebar-inner">
            <button className="pl-mobile-filter-close" onClick={() => setMobileFiltersOpen(false)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Zatvori filtere
            </button>
            <div className="pl-sidebar-content">

              {/* Count */}
              <div className="pl-sb-hero">
                <p className="pl-sb-hero-count">
                  Filtriraj oglase
                </p>
              </div>

              {/* Search */}
              <div className="pl-search-wrap">
                <svg className="pl-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="pl-search-input"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Pretraži naziv, kompaniju..."
                />
                {search && (
                  <button className="pl-search-clear" onClick={() => setSearch("")}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="pl-sidebar-filters">

                {/* Tehnologije */}
                {allTehs.length > 0 && (
                  <div className="pl-sb-section">
                    <button className="pl-sb-section-header" onClick={() => toggle('tech')}>
                      <svg className="pl-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                      </svg>
                      <span className="pl-sb-section-title">Tehnologije</span>
                      {filterTehs.length > 0 && <span className="pl-sb-count">{filterTehs.length}</span>}
                      <svg className={`pl-sb-chevron${sectionsOpen.tech ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    {sectionsOpen.tech && (
                      <div className="pl-sb-section-body">
                        {allTehs.map(t => (
                          <label key={t} className="pl-sb-radio-row">
                            <input type="checkbox" checked={filterTehs.includes(t)}
                              onChange={() => setFilterTehs(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} />
                            <span>{t}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Trajanje */}
                <div className="pl-sb-section">
                  <button className="pl-sb-section-header" onClick={() => toggle('duration')}>
                    <svg className="pl-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="pl-sb-section-title">Trajanje</span>
                    {filterTrajanja.length > 0 && <span className="pl-sb-count">{filterTrajanja.length}</span>}
                    <svg className={`pl-sb-chevron${sectionsOpen.duration ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.duration && (
                    <div className="pl-sb-section-body">
                      {[['1-2', '1–2 mjeseca'], ['3', '3 mjeseca'], ['4-5', '4–5 mjeseci'], ['6+', '6+ mjeseci']].map(([val, lbl]) => (
                        <label key={val} className="pl-sb-radio-row">
                          <input type="checkbox" checked={filterTrajanja.includes(val)}
                            onChange={() => setFilterTrajanja(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val])} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tip prakse */}
                <div className="pl-sb-section">
                  <button className="pl-sb-section-header" onClick={() => toggle('tip')}>
                    <svg className="pl-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" />
                      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                    </svg>
                    <span className="pl-sb-section-title">Tip prakse</span>
                    {tip.length > 0 && <span className="pl-sb-count">{tip.length}</span>}
                    <svg className={`pl-sb-chevron${sectionsOpen.tip ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.tip && (
                    <div className="pl-sb-section-body">
                      {["Onsite", "Remote", "Hybrid"].map(v => (
                        <label key={v} className="pl-sb-radio-row">
                          <input
                            type="checkbox"
                            checked={tip.includes(v)}
                            onChange={() => setTip(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])}
                          />
                          <span>{v}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sortiraj po */}
                <div className="pl-sb-section">
                  <button className="pl-sb-section-header" onClick={() => toggle('sort')}>
                    <svg className="pl-sb-section-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    <span className="pl-sb-section-title">Sortiraj po</span>
                    <svg className={`pl-sb-chevron${sectionsOpen.sort ? " open" : ""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {sectionsOpen.sort && (
                    <div className="pl-sb-section-body">
                      {[['najnovije', 'Najnovije'], ['najstarije', 'Najstarije'], ['trajanje-asc', 'Trajanje ↑'], ['trajanje-desc', 'Trajanje ↓']].map(([val, lbl]) => (
                        <label key={val} className="pl-sb-radio-row">
                          <input type="radio" name="sortBy" checked={sortBy === val} onChange={() => setSortBy(val)} />
                          <span>{lbl}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {hasFilters && (

                  <button className="pl-reset-btn" onClick={clear}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Resetuj filtere
                  </button>
                )}
              </div>

            </div>{/* end pl-sidebar-content */}

            {/* Footer */}
            <div className="pl-sb-footer">
              <Link to="/register" className="pl-btn-primary pl-sb-register-btn">
                Registruj se besplatno
              </Link>
              <Link to="/auth" className="pl-sb-login-link">Već imam nalog</Link>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="pl-main">

          {/* Result count */}
          {!loading && !error && (
            <div className="pl-results-row">
              <p className="sd-results-info">
                {hasFilters
                  ? <><strong>{filtered.length}</strong> rezultata za primijenjene filtere</>
                  : <><strong>{filtered.length}</strong> aktivnih oglasa</>}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {hasFilters && filtered.length !== oglasi.length && (
                  <button className="pl-show-all" onClick={clear}>Prikaži sve</button>
                )}
                <button className="pl-mobile-filter-btn" onClick={() => setMobileFiltersOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
                  </svg>
                  Filteri
                  {hasFilters && <span className="pl-mobile-filter-btn-badge">{[tip, filterTehs, filterTrajanja].flat().length + (sortBy !== 'najnovije' ? 1 : 0)}</span>}
                </button>
              </div>
            </div>
          )}

          {loading && (
            <div className="pl-state-center">
              <div className="pl-spinner" />
              <p>Učitavam oglase...</p>
            </div>
          )}

          {error && (
            <div className="pl-state-error">
              <p className="pl-state-error-msg">{error}</p>
              <button className="pl-btn-retry" onClick={fetchOglasi}>Pokušaj ponovo</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="sd-empty">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="sd-empty-title">Nema rezultata</p>
              <p className="sd-empty-sub">
                {hasFilters ? "Pokušaj s drugim filterima." : "Trenutno nema aktivnih oglasa."}
              </p>
              {hasFilters && <button className="sd-empty-link" onClick={clear}>Resetuj filtere</button>}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="sd-list">
              {filtered.map(o => (
                <ListingCard key={o.id} oglas={o} onLoginPrompt={() => setShowModal(true)} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
const formatirajDatum = (datumString) => {
  if (!datumString) return "";

  // Čisti string ako ima slovo 'M' (npr. "2026 M06 01" -> "2026 06 01")
  const cistiString = datumString.replace('M', '');

  const date = new Date(cistiString);

  // Provjera da li je datum validan
  if (isNaN(date.getTime())) return datumString;

  const dan = String(date.getDate()).padStart(2, '0');
  const mjesec = String(date.getMonth() + 1).padStart(2, '0'); // Mjeseci kreću od 0
  const godina = date.getFullYear();

  return `${dan}/${mjesec}/${godina}`;
};