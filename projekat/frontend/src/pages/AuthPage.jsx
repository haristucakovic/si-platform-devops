// frontend/src/pages/AuthPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, resendVerificationEmail } from '../services/auth.service';
import './AuthPage.css';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

const ROLE_ROUTES = {
  STUDENT: '/dashboard/student',
  COMPANY: '/dashboard/company',
  COORDINATOR: '/dashboard/coordinator',
  ADMIN: '/admin',
};

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();


  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [info,       setInfo]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [resending,  setResending]  = useState(false);

  const canResendVerification = error.toLowerCase().includes('verifik');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const { token, user } = await loginUser(identifier.trim(), password);
      login(token, user);
      navigate(ROLE_ROUTES[user.role] ?? '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Prijava nije uspjela.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!identifier.trim()) {
      setError('Unesite e-mail adresu za ponovno slanje verifikacije.');
      return;
    }

    setResending(true);
    setError('');
    setInfo('');
    try {
      const result = await resendVerificationEmail(identifier.trim());
      setInfo(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className={`auth-page ${darkMode ? 'dark' : ''}`}>
      {/* ── Left panel – branding ── */}
      <aside className="auth-panel auth-panel--brand">
        <button
  className="auth-theme-toggle"
  onClick={() => setDarkMode(!darkMode)}
  aria-label="Toggle dark mode"
>
  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
</button>
        <div className="auth-brand">
          <div className="auth-brand__wordmark">PraksaHub</div>
          <h1 className="auth-brand__title">
            Vaš most prema<br />profesionalnom svijetu.
          </h1>
          <p className="auth-brand__sub">
            Platforma za upravljanje stručnom praksom koja povezuje
            studente, kompanije i koordinatore.
          </p>
        </div>
        <p className="auth-panel__footer">
          &copy; {new Date().getFullYear()} PraksaHub. Sva prava zadržana.
        </p>
      </aside>

      {/* ── Right panel – form ── */}
      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <header className="auth-card__header">
            <h2 className="auth-card__title">Prijava</h2>
            <p className="auth-card__subtitle">
              Dobrodošli nazad. Unesite vaše podatke za pristup sistemu.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleLogin} noValidate>
            {error && (
              <div className="auth-error" role="alert">
                <IconWarning />
                <span>{error}</span>
              </div>
            )}
            {info && <div className="auth-success">{info}</div>}

            <div className="auth-field">
              <label className="auth-label" htmlFor="identifier">
                Korisničko ime ili e-mail
              </label>
              <input
                id="identifier"
                type="text"
                className="auth-input"
                placeholder="korisnik@example.com"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Lozinka
              </label>
              <div className="auth-input-wrap">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-input auth-input--padded-right"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="auth-toggle-pass"
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                  tabIndex={-1}
                >
                  <IconEye crossed={showPass} />
                </button>
              </div>

              <div className="auth-form__helper">
                <Link to="/forgot-password" className="auth-link">
                  Zaboravili ste lozinku?
                </Link>
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading && <span className="auth-btn__spinner" aria-hidden="true" />}
              {loading ? 'Prijavljivanje…' : 'Prijavite se'}
            </button>
            <Link to="/" className="auth-back-home">
              Nazad na početnu stranicu
            </Link>
            {canResendVerification && (
              <button
                type="button"
                className="auth-btn auth-btn--secondary"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? 'Slanje...' : 'Pošalji ponovo verifikacioni email'}
              </button>
            )}
          </form>

          <div className="auth-roles">
            <span className="auth-roles__label">Pristup za:</span>
            <span className="auth-role-chip auth-role-chip--student">Studente</span>
            <span className="auth-role-chip auth-role-chip--company">Kompanije</span>
            <span className="auth-role-chip auth-role-chip--coordinator">Koordinatore</span>
            <span className="auth-role-chip auth-role-chip--admin">Admins</span>
          </div>
        </div>
      </main>
    </div>
  );
}

function IconWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconEye({ crossed }) {
  return crossed ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
