import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { getPublicFaculties, getPublicOdsjeci, register, checkAvailability } from '../services/auth.service';
import { useTheme } from '../context/ThemeContext';
import './RegisterPage.css';
import { Moon, Sun } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:\d{9,10}|\+387[1-9]\d{7,8})$/;
const PHONE_VALIDATION_MESSAGE = 'Broj telefona mora sadržavati 9 ili 10 cifara ili biti u formatu +387.';

const REQUIRED = {
  student: ['ime', 'prezime', 'username', 'email', 'password', 'confirmPassword', 'fakultetID', 'year_of_study', 'index_number'],
  koordinator: ['ime', 'prezime', 'username', 'email', 'password', 'confirmPassword', 'fakultetID'],
  kompanija: ['username', 'email', 'password', 'confirmPassword', 'naziv'],
};

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  const urlRole = searchParams.get('role');
  const initialRole = ['student', 'koordinator', 'kompanija'].includes(urlRole) ? urlRole : null;

  const [step, setStep] = useState(initialRole ? 'form' : 'role-select');
  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [facultyLoadError, setFacultyLoadError] = useState(false);
  const [odsjeci, setOdsjeci] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availability, setAvailability] = useState({ username: null, email: null });
  const availabilityTimers = useRef({});

  useEffect(() => {
    getPublicFaculties().then(setFaculties).catch(() => setFacultyLoadError(true));
  }, []);

  function scheduleAvailabilityCheck(field, value) {
    clearTimeout(availabilityTimers.current[field]);
    if (!value.trim()) {
      setAvailability(a => ({ ...a, [field]: null }));
      return;
    }
    if (field === 'email' && !EMAIL_RE.test(value.trim())) {
      setAvailability(a => ({ ...a, [field]: 'invalid' }));
      return;
    }
    setAvailability(a => ({ ...a, [field]: 'loading' }));
    availabilityTimers.current[field] = setTimeout(async () => {
      try {
        const { available } = await checkAvailability(field, value.trim());
        setAvailability(a => ({ ...a, [field]: available }));
      } catch {
        setAvailability(a => ({ ...a, [field]: null }));
      }
    }, 500);
  }

  function handleChange(field, value) {
    setFormData(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: false }));
    if (field === 'username' || field === 'email') {
      scheduleAvailabilityCheck(field, value);
    }
    if (field === 'fakultetID' && value) {
      setOdsjeci([]);
      setFormData(p => ({ ...p, fakultetID: value, odsjekID: '' }));
      getPublicOdsjeci(value).then(setOdsjeci).catch(() => setOdsjeci([]));
    }
  }

  function validate() {
    const required = REQUIRED[role] || [];
    const newErrors = {};
    let valid = true;
    let msg = '';

    for (const f of required) {
      if (!formData[f] || !String(formData[f]).trim()) {
        newErrors[f] = true;
        valid = false;
      }
    }

    if (!valid) {
      msg = role === 'kompanija'
        ? 'Morate popuniti sva polja kako bi nastavili registraciju!'
        : 'Morate popuniti sva polja kako bi se registrovali!';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = true;
      valid = false;
      if (!msg) msg = 'Lozinka mora imati najmanje 8 karaktera.';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = true;
      valid = false;
      if (!msg) msg = 'Lozinke se ne podudaraju.';
    }

    if (isProvidedPhone(formData.telefon) && !PHONE_RE.test(String(formData.telefon))) {
      newErrors.telefon = true;
      valid = false;
      if (!msg) msg = PHONE_VALIDATION_MESSAGE;
    }

    if (availability.username === false) {
      newErrors.username = true;
      valid = false;
    }
    if (availability.email === false || availability.email === 'invalid') {
      newErrors.email = true;
      valid = false;
    }

    setErrors(newErrors);
    setErrorMsg(msg);
    return valid;
  }

  function handleBack() {
    setStep('role-select');
    setErrors({});
    setErrorMsg('');
    setAvailability({ username: null, email: null });
  }

  async function handleFormSubmit() {
    if (availability.username === 'loading' || availability.email === 'loading') {
      setErrorMsg('Molimo sačekajte provjeru dostupnosti.');
      return;
    }
    if (!validate()) return;
    if (role === 'kompanija') { setStep('opisPoslovanja'); return; }
    await doRegister(null);
  }

  async function doRegister(opisPoslovanja) {
    setLoading(true);
    setErrorMsg('');
    try {
      const roleMap = { student: 'STUDENT', koordinator: 'COORDINATOR', kompanija: 'COMPANY' };
      await register({ role: roleMap[role], ...formData, opisPoslovanja });
      setStep('success');
    } catch (err) {
      setErrorMsg(err.message || 'Greška pri registraciji.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`reg-page${darkMode ? ' dark' : ''}`}>
      <div className="reg-layout">
        <main className="reg-panel reg-panel--form">
          <div className="reg-card">
            {step === 'role-select' && (
              <RoleSelect
                onSelect={r => { setErrors({}); setErrorMsg(''); setRole(r); setStep('form'); }}
                onBack={() => navigate('/')}
              />
            )}

            {step === 'form' && (
              <FormStep
                role={role}
                formData={formData}
                errors={errors}
                errorMsg={errorMsg}
                faculties={faculties}
                facultyLoadError={facultyLoadError}
                odsjeci={odsjeci}
                loading={loading}
                availability={availability}
                onChange={handleChange}
                onSubmit={handleFormSubmit}
                showBack={!initialRole}
                onBack={handleBack}
              />
            )}

            {step === 'opisPoslovanja' && (
              <OpisStep
                errorMsg={errorMsg}
                loading={loading}
                onSkip={() => doRegister(null)}
                onFinish={v => doRegister(v || null)}
              />
            )}

            {step === 'success' && (
              <SuccessStep role={role} />
            )}
          </div>
        </main>

              <aside className="reg-panel reg-panel--brand">
      <button
        type="button"
        className="reg-theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <BrandPanel role={role} step={step} />
    </aside>
      </div>
    </div>
  );
}

function RoleSelect({ onSelect, onBack }) {
  return (
    <div>
      <div className="reg-header">
        <h2 className="reg-title">Registruj se kao...</h2>
        <p className="reg-subtitle">Odaberite tip vašeg naloga</p>
      </div>
      <div className="reg-role-cards">
        <button className="reg-role-card" onClick={() => onSelect('student')}>
          <div className="reg-role-card-icon" style={{ background: '#ddeeff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a6fd4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="reg-role-card-label">Student</span>
        </button>

        <button className="reg-role-card" onClick={() => onSelect('kompanija')}>
          <div className="reg-role-card-icon" style={{ background: '#ede8ff' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6d4ce1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
          </div>
          <span className="reg-role-card-label">Kompanija</span>
        </button>

        <button className="reg-role-card" onClick={() => onSelect('koordinator')}>
          <div className="reg-role-card-icon" style={{ background: '#e0f7ef' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0e9e6e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
            </svg>
          </div>
          <span className="reg-role-card-label">Koordinator</span>
        </button>
      </div>
      <div style={{ textAlign: 'center', padding: '0 36px 28px' }}>
        <button className="reg-btn reg-btn--secondary" onClick={onBack} style={{ fontSize: '0.82rem' }}>
          ← Nazad na početnu
        </button>
      </div>
    </div>
  );
}

function Field({ label, field, type = 'text', placeholder, formData, errors, onChange, italicPlaceholder }) {
  return (
    <div className="reg-field">
      <label className="reg-label">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`reg-input${errors[field] ? ' error' : ''}${italicPlaceholder ? ' reg-input--italic-placeholder' : ''}`}
        value={formData[field] || ''}
        onChange={e => onChange(field, e.target.value)}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
      />
    </div>
  );
}

function AvailabilityField({ label, field, type = 'text', formData, errors, onChange, availability }) {
  const status = availability[field];

  let inputClass = 'reg-input';
  if (status === true) inputClass += ' success';
  else if (status === false) inputClass += ' taken';
  else if (status === 'invalid' || errors[field]) inputClass += ' error';

  return (
    <div className="reg-field">
      <label className="reg-label">{label}</label>
      <div className="reg-avail-wrapper">
        <input
          type={type}
          className={inputClass}
          value={formData[field] || ''}
          onChange={e => onChange(field, e.target.value)}
          autoComplete="off"
        />
        {status === 'loading' && (
          <span className="reg-avail-icon reg-avail-spin">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" strokeOpacity="0.25" />
              <path d="M12 3a9 9 0 0 1 9 9" />
            </svg>
          </span>
        )}
        {status === true && (
          <span className="reg-avail-icon reg-avail-ok">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </span>
        )}
        {(status === false || status === 'invalid') && (
          <span className={`reg-avail-icon ${status === 'invalid' ? 'reg-avail-err' : 'reg-avail-taken-icon'}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </span>
        )}
      </div>
      {status === false && (
        <span className="reg-avail-msg reg-avail-msg--taken">
          {field === 'username' ? 'Postoji korisnik sa istim korisničkim imenom.' : 'Postoji korisnik sa istom email adresom.'}
        </span>
      )}
      {status === 'invalid' && (
        <span className="reg-avail-msg">Neispravan format email adrese.</span>
      )}
    </div>
  );
}

function FormStep({ role, formData, errors, errorMsg, faculties, facultyLoadError, odsjeci, loading, availability, onChange, onSubmit, showBack, onBack }) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);

  function handleSubmit() {
    if (!termsAccepted) { setTermsError(true); return; }
    onSubmit();
  }

  const titles = {
    student: 'Registracija studenta',
    koordinator: 'Registracija koordinatora',
    kompanija: 'Registracija kompanije',
  };

  return (
    <div>
      <div className="reg-header">
        <h2 className="reg-title">{titles[role]}</h2>
        <p className="reg-subtitle">Popunite podatke za kreiranje naloga</p>
      </div>
      <div className="reg-form">
        {errorMsg && <div className="reg-error-msg">{errorMsg}</div>}

        {(role === 'student' || role === 'koordinator') && (
          <div className="reg-form-row">
            <Field label="Ime" field="ime" formData={formData} errors={errors} onChange={onChange} />
            <Field label="Prezime" field="prezime" formData={formData} errors={errors} onChange={onChange} />
          </div>
        )}

        {role === 'kompanija' && (
          <Field label="Naziv kompanije" field="naziv" formData={formData} errors={errors} onChange={onChange} />
        )}

        <AvailabilityField label="Korisničko ime" field="username" formData={formData} errors={errors} onChange={onChange} availability={availability} />
        <AvailabilityField label="Email" field="email" type="email" formData={formData} errors={errors} onChange={onChange} availability={availability} />
        <div className="reg-form-row">
          <Field label="Lozinka" field="password" type="password" formData={formData} errors={errors} onChange={onChange} />
          <Field label="Potvrda lozinke" field="confirmPassword" type="password" formData={formData} errors={errors} onChange={onChange} />
        </div>

        {role === 'kompanija' && (
          <div className="reg-form-row">
            <Field label="Adresa (opcionalno)" field="adresa" formData={formData} errors={errors} onChange={onChange} />
            <Field label="Telefon (opcionalno)" field="telefon" placeholder="061123456 ili +38761123456" formData={formData} errors={errors} onChange={onChange} />
          </div>
        )}

        {role === 'kompanija' && (
          <Field label="Kontakt osoba (opcionalno)" field="kontaktOsoba" placeholder="Ime i prezime" formData={formData} errors={errors} onChange={onChange} italicPlaceholder />
        )}

        {(role === 'student' || role === 'koordinator') && (
          <div className="reg-field">
            <label className="reg-label">Fakultet</label>
            <select
              className={`reg-select${errors.fakultetID ? ' error' : ''}`}
              value={formData.fakultetID || ''}
              onChange={e => onChange('fakultetID', e.target.value)}
            >
              <option value="">-- Odaberite fakultet --</option>
              {faculties.map(f => (
                <option key={f.id} value={f.id}>{f.naziv}</option>
              ))}
            </select>
            {facultyLoadError && (
              <span style={{ fontSize: '0.78rem', color: '#c0392b' }}>Greška pri učitavanju fakulteta. Molimo osvježite stranicu.</span>
            )}
          </div>
        )}

        {(role === 'student' || role === 'koordinator') && formData.fakultetID && (
          <div className="reg-field">
            <label className="reg-label">Odsjek (opcionalno)</label>
            <select
              className="reg-select"
              value={formData.odsjekID || ''}
              onChange={e => onChange('odsjekID', e.target.value)}
            >
              <option value="">-- Odaberite odsjek --</option>
              {odsjeci.length === 0 && (
                <option disabled value="">Odsjeci još nisu dodani za ovaj fakultet</option>
              )}
              {odsjeci.map(o => (
                <option key={o.id} value={o.id}>{o.naziv}</option>
              ))}
            </select>
          </div>
        )}

        {role === 'student' && (
          <div className="reg-form-row">
            <div className="reg-field">
              <label className="reg-label">Godina studija</label>
              <input
                type="number"
                min="1"
                step="1"
                className={`reg-input${errors.year_of_study ? ' error' : ''}`}
                value={formData.year_of_study || ''}
                onChange={e => onChange('year_of_study', e.target.value)}
                autoComplete="off"
              />
            </div>
            <Field label="Broj indeksa" field="index_number" formData={formData} errors={errors} onChange={onChange} />
          </div>
        )}

        <label className={`reg-terms${termsError ? ' reg-terms--error' : ''}`}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => { setTermsAccepted(e.target.checked); setTermsError(false); }}
          />
          <span>
            Slažem se sa{' '}
            <Link to="/terms" target="_blank" rel="noopener noreferrer">Uslovima korištenja</Link>
          </span>
        </label>
        {termsError && (
          <span className="reg-terms-msg">Morate prihvatiti uslove korištenja kako biste nastavili.</span>
        )}

        <div className="reg-footer">
          {showBack && (
            <button className="reg-btn reg-btn--secondary" onClick={onBack}>Nazad</button>
          )}
          <button className="reg-btn reg-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Učitavanje...' : role === 'kompanija' ? 'Dalje' : 'Registruj se'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OpisStep({ errorMsg, loading, onSkip, onFinish }) {
  const [value, setValue] = useState('');

  return (
    <div>
      <div className="reg-header">
        <h2 className="reg-title">Skoro gotovo!</h2>
      </div>
      <div className="reg-form">
        {errorMsg && <div className="reg-error-msg">{errorMsg}</div>}
        <p className="reg-textarea-label">Recite nam nešto o Vašoj kompaniji (opcionalno)</p>
        <textarea
          className="reg-textarea"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Opišite djelatnost, kulturu i vrijednosti vaše kompanije..."
        />
        <div className="reg-opisbtn-group">
          <button className="reg-btn reg-btn--primary" onClick={() => onFinish(value.trim() || null)} disabled={loading}>
            {loading ? 'Učitavanje...' : 'Završi registraciju'}
          </button>
          <button className="reg-btn reg-btn--secondary" style={{ alignSelf: 'center', fontSize: '0.82rem' }} onClick={onSkip} disabled={loading}>
            Preskoči
          </button>
        </div>
      </div>
    </div>
  );
}

const BRAND_CONTENT = {
  student: {
    heading: 'Kreiraj svoj račun',
    text: 'Pronađi praksu koja gradi tvoju karijeru. Poveži se s vodećim kompanijama i stekni iskustvo koje otvara vrata.',
    points: [
      'Prijavi se na oglase brzo i jednostavno',
      'Prati status prijave u realnom vremenu',
      'Dobij potvrdu prakse direktno na platformi',
    ],
  },
  koordinator: {
    heading: 'Upravljajte stručnom praksom',
    text: 'Pomozite studentima vašeg fakulteta da pronađu pravu praksu i pratite njihov napredak na jednom mjestu.',
    points: [
      'Pregledajte i odobravajte prijave studenata',
      'Sarađujte s kompanijama direktno',
      'Pratite tok i evaluaciju svake prakse',
    ],
  },
  kompanija: {
    heading: 'Pronađite talente budućnosti',
    text: 'Objavite oglase i povežite se s talentovanim studentima. Investirajte u buduće profesionalce koji će graditi vaš tim.',
    points: [
      'Objavite oglase za stručnu praksu',
      'Birajte kandidate koji odgovaraju vašim potrebama',
      'Pratite tok prakse u realnom vremenu',
    ],
  },
  default: {
    heading: 'Vaš most prema profesionalnom svijetu',
    text: 'Platforma koja spaja studente, kompanije i koordinatore kroz jedinstveni sistem upravljanja stručnom praksom.',
    points: [
      'Za studente — pronađi svoju prvu praksu',
      'Za kompanije — pronađi talente budućnosti',
      'Za koordinatore — upravljaj cijelim procesom',
    ],
  },
};

function BrandPanel({ role, step }) {
  const content = (role && step === 'form') || step === 'opisPoslovanja'
    ? (BRAND_CONTENT[role] ?? BRAND_CONTENT.default)
    : BRAND_CONTENT.default;

  return (
    <div className="reg-brand">
      <Link to="/" className="reg-brand__wordmark">PraksaHub</Link>
      <div className="reg-brand__body">
        <h2 className="reg-brand__heading">{content.heading}</h2>
        <p className="reg-brand__text">{content.text}</p>
        <ul className="reg-brand__points">
          {content.points.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
      <p className="reg-brand__footer">&copy; {new Date().getFullYear()} PraksaHub. Sva prava zadržana.</p>
    </div>
  );
}

function isProvidedPhone(value) {
  return value !== undefined && value !== null && value !== '';
}

function SuccessStep({ role }) {
  const approver = role === 'student' ? 'koordinatora vašeg fakulteta' : 'admina';

  return (
    <div className="reg-success">
      <div className="reg-success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e9e6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <h2 className="reg-success-title">Registracija uspješna!</h2>
      <p className="reg-success-msg">
        Poslali smo verifikacioni email na vašu adresu. Kliknite na link u emailu da aktivirate nalog, zatim čekamo {approver} da odobri Vaš profil.
      </p>
      <Link to="/auth" className="reg-success-link" style={{ marginTop: '16px', display: 'inline-block' }}>
        Idi na prijavu
      </Link>
    </div>
  );
}
