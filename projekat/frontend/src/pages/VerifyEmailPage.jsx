import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmailToken } from '../services/auth.service';
import './AuthPage.css';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Provjeravamo verifikacioni link...');
  const hasVerifiedRef = useRef(false);

  useEffect(() => {
    if (hasVerifiedRef.current) {
      return;
    }
    hasVerifiedRef.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Nedostaje verifikacioni token.');
      return;
    }

    async function verify() {
      try {
        await verifyEmailToken(token);
        setStatus('success');
        setMessage('Email adresa je uspješno verifikovana. Vaš račun čeka odobrenje.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verifikacija nije uspjela.');
      }
    }

    verify();
  }, [searchParams]);

  return (
    <div className="auth-page">
      <main className="auth-panel auth-panel--form">
        <div className="auth-card">
          <header className="auth-card__header">
            <h2 className="auth-card__title">Verifikacija email adrese</h2>
          </header>
          {status === 'error' ? (
            <div className="auth-error" role="alert">
              <span>{message}</span>
            </div>
          ) : (
            <div className="auth-success" role="status">
              <span>{message}</span>
            </div>
          )}
          <div className="auth-form__helper" style={{ marginTop: '18px', justifyContent: 'center' }}>
            <Link to="/auth" className="auth-link">Nazad na prijavu</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
