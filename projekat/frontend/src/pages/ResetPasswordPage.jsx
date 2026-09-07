import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../services/auth.service';
import './AuthPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!token) {
      setError('Reset token nije pronađen.');
      return;
    }

    if (password.length < 8) {
      setError('Lozinka mora imati najmanje 8 karaktera.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);
      setMessage(result.message);
      setPassword('');
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
          <h1 className="auth-brand__title">Postavite novu<br />lozinku.</h1>
          <p className="auth-brand__sub">
            Nakon uspješne promjene možete se prijaviti novom lozinkom.
          </p>
        </div>
        <p className="auth-panel__footer">
          &copy; {new Date().getFullYear()} PraksaHub. Sva prava zadržana.
        </p>
      </aside>

      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <header className="auth-card__header">
            <h2 className="auth-card__title">Nova lozinka</h2>
            <p className="auth-card__subtitle">
              Unesite novu lozinku za vaš nalog.
            </p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {error && <div className="auth-error">{error}</div>}
            {message && <div className="auth-success">{message}</div>}

            <div className="auth-field">
              <label className="auth-label" htmlFor="password">
                Nova lozinka
              </label>
              <input
                id="password"
                type="password"
                className="auth-input"
                placeholder="Najmanje 8 karaktera"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Spremanje…' : 'Promijeni lozinku'}
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