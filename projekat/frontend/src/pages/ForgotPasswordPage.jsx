import { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/auth.service';
import './AuthPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Unesite e-mail adresu.');
      return;
    }

    setLoading(true);

    try {
      const result = await requestPasswordReset(email.trim());
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <aside className="auth-panel auth-panel--brand">
        <div className="auth-brand">
          <div className="auth-brand__wordmark">PraksaHub</div>
          <h1 className="auth-brand__title">Obnovite pristup<br />svom nalogu.</h1>
          <p className="auth-brand__sub">
            Unesite e-mail adresu i poslat ćemo vam link za postavljanje nove lozinke.
          </p>
        </div>
        <p className="auth-panel__footer">
          &copy; {new Date().getFullYear()} PraksaHub. Sva prava zadržana.
        </p>
      </aside>

      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <header className="auth-card__header">
            <h2 className="auth-card__title">Zaboravljena lozinka</h2>
            <p className="auth-card__subtitle">
              Link za reset lozinke važi ograničeno vrijeme.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                E-mail adresa
              </label>
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="korisnik@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Slanje…' : 'Pošalji reset link'}
            </button>
          </form>

          <Link to="/auth" className="auth-link">
            Nazad na prijavu
          </Link>
        </div>
      </main>
    </div>
  );
}