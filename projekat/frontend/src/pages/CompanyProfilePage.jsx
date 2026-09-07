import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getCompanyPublicProfile } from '../services/companyPublic.service';
import { formatDate } from '../data/mockPrakse';
import './ProfilePage.css';
import './CompanyProfilePage.css';
import './StudentDashboard.css';

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

function displayVal(value) {
  return value && String(value).trim() ? value : 'Nije uneseno';
}

export default function CompanyProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();
  const fromTab = location.state?.from ?? 'svi';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [company, setCompany] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setCompany(null);
    setListings([]);

    getCompanyPublicProfile(id)
      .then((data) => {
        if (!active) return;
        setCompany(data.kompanija);
        setListings(data.oglasi || []);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Profil kompanije nije dostupan.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

  function openListingDetail(oglasId) {
    navigate('/dashboard/student', { state: { openOglasId: oglasId } });
  }

  const logo = company ? deriveLogo(company.naziv) : '';
  const logoColor = company ? deriveLogoColor(company.naziv) : LOGO_COLORS[0];

  // Keep active and closed/expired listings, block only archived ones
  const nonArchivedListings = listings.filter((oglas) => oglas.status !== 'ARHIVIRAN');

  return (
    <div className={`cp-page${darkMode ? ' dark' : ''}`}>
      <nav className="cp-nav">
        <Link to="/dashboard/student" className="cp-nav-brand">PraksaHub</Link>
        <button
          type="button"
          className="sd-theme-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Svjetla tema' : 'Tamna tema'}
        >
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
      </nav>

      <main className="cp-main">
        <button
          type="button"
          className="cp-back"
          onClick={() => navigate('/dashboard/student', {
            state: fromTab === 'zatvoreni' ? { openTab: 'zatvoreni' } : {}
          })}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {fromTab === 'zatvoreni' ? 'Nazad na zatvorene oglase' : 'Nazad na oglase'}
        </button>

        {loading ? (
          <p className="cp-state">Učitavanje profila kompanije...</p>
        ) : error ? (
          <div className="pf-card">
            <p className="cp-state cp-state--error">{error}</p>
          </div>
        ) : company ? (
          <>
            <div className="pf-card cp-header-card">
              <div className="cp-logo" style={{ background: logoColor }}>{logo}</div>
              <h1 className="cp-company-name">{company.naziv}</h1>
            </div>

            <div className="pf-card">
              <h2 className="pf-section-title">Osnovne informacije</h2>
              <div className="pf-info-grid">
                <div className="pf-info-item">
                  <span className="pf-info-label">Naziv</span>
                  <span className="pf-info-value">{displayVal(company.naziv)}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Djelatnost</span>
                  <span className="pf-info-value">{displayVal(company.djelatnost)}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Adresa</span>
                  <span className="pf-info-value">{displayVal(company.adresa)}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Kontakt osoba</span>
                  <span className="pf-info-value">{displayVal(company.kontaktOsoba)}</span>
                </div>
                <div className="pf-info-item pf-info-item--full">
                  <span className="pf-info-label">Opis</span>
                  <span className="pf-info-value">{displayVal(company.opisPoslovanja)}</span>
                </div>
              </div>
            </div>

            <div className="pf-card">
              <h2 className="pf-section-title">Oglasi kompanije</h2>
              {nonArchivedListings.length === 0 ? (
                <div className="sd-empty">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  </svg>
                  <p className="sd-empty-title">Nema aktivnih ili zatvorenih oglasa</p>
                  <p className="sd-empty-sub">Ova kompanija trenutno nema objavljenih oglasa.</p>
                </div>
              ) : (
                <div className="cp-listings">
                  {nonArchivedListings.map((oglas) => {
                    const istekao = oglas.rokPrijave && new Date(oglas.rokPrijave) <= new Date();
                    const isClosed = oglas.status === 'ZATVOREN' || istekao;

                    return (
                      <article key={oglas.id} className="cp-listing-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                            <h3 className="cp-listing-title">{oglas.naziv}</h3>
                            {isClosed && (
                              <span 
                                className="cd-listing-status cd-listing-status--zatvoren" 
                                style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--color-danger-subtle, #fde8e8)', color: 'var(--color-danger, #e02424)' }}
                              >
                                {istekao && oglas.status === 'AKTIVAN' ? 'Istekao' : 'Zatvoren'}
                              </span>
                            )}
                          </div>
                          <div className="cp-listing-meta">
                            {oglas.lokacija && <span>{oglas.lokacija}</span>}
                            {oglas.rokPrijave && (
                              <span>Rok prijave: {formatDate(String(oglas.rokPrijave).slice(0, 10))}</span>
                            )}
                          </div>
                          {oglas.opis && <p className="cp-listing-opis">{oglas.opis}</p>}
                        </div>
                        <button
                          type="button"
                          className="cp-btn-detail"
                          onClick={() => openListingDetail(oglas.id)}
                        >
                          Detalji oglasa
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}