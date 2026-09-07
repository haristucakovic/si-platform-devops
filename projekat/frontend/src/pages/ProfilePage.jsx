// frontend/src/pages/ProfilePage.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyProfile,
  updateStudentProfile,
  getMyDocuments,
  deleteDocument,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../services/api';
import { getCompanyProfile, updateCompanyProfile } from '../services/companyProfile.service';
import { formatDate } from '../data/mockPrakse';
import './ProfilePage.css';

const ROLE_LABELS = {
  STUDENT:     'Student',
  COMPANY:     'Kompanija',
  COORDINATOR: 'Koordinator',
  ADMIN:       'Administrator',
};

const ROLE_ROUTES = {
  STUDENT:     '/dashboard/student',
  COMPANY:     '/dashboard/company',
  COORDINATOR: '/dashboard/coordinator',
  ADMIN:       '/admin',
};

const STATUS_LABELS = {
  ACTIVE:      'Aktivan',
  PENDING:     'Na čekanju',
  DEACTIVATED: 'Deaktiviran',
};

const EMPTY_STUDENT_FORM = {
  ime: '', prezime: '', email: '',
  currentPassword: '', newPassword: '', confirmPassword: '',
};

const EMPTY_COMPANY_FORM = {
  naziv: '', opisPoslovanja: '', djelatnost: '',
  adresa: '', telefon: '', kontaktOsoba: '',
};

const COMPANY_PROFILE_UPDATED_EVENT = 'company-profile-updated';

function IconWarning() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`pf-toast pf-toast--${type}`}>{message}</div>;
}

const DOC_TYPE_LABELS = {
  CV: 'CV',
  MOTIVACIONO_PISMO: 'Motivaciono pismo',
  OSTALO: 'Ostalo',
};

function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DocIcon({ mime }) {
  const isPdf = mime?.includes('pdf');
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: isPdf ? '#dc2626' : '#1a6fd4', flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      {isPdf
        ? <text x="6" y="18" fontSize="5" fontWeight="700" stroke="none" fill="#dc2626">PDF</text>
        : <text x="5" y="18" fontSize="4.5" fontWeight="700" stroke="none" fill="#1a6fd4">DOC</text>
      }
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// DOCUMENTS SECTION
// ─────────────────────────────────────────────────────────────
function DocumentsSection() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [tipMap, setTipMap] = useState({});

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await getMyDocuments();
      setDocs(data || []);
    } catch {
      setError('Greška pri učitavanju dokumenata.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setDeleting(id);
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
    } catch {
      setError('Greška pri brisanju dokumenta.');
    } finally {
      setDeleting(null);
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const map = {};
    files.forEach(f => { map[f.name] = 'CV'; });
    setTipMap(map);
    setUploadMsg('');
  }

  async function handleUpload() {
    if (!selectedFiles.length) return;
    setUploading(true);
    setUploadMsg('');
    setUploadSuccess(false);
    try {
      const formData = new FormData();
      selectedFiles.forEach(f => {
        formData.append('files', f);
        formData.append('tip_dokumenta', tipMap[f.name] || 'CV');
      });
      const token = sessionStorage.getItem('token');
      const res = await fetch('/api/dokumenti/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Greška pri uploadu.');
      setSelectedFiles([]);
      setTipMap({});
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
      setUploadMsg('Dokumenti uspješno dodani.');
      setUploadSuccess(true);
    } catch (err) {
      setUploadMsg(err.message);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="pf-card">
      <div className="pf-docs-header">
        <h2 className="pf-section-title" style={{ margin: 0 }}>Moji dokumenti</h2>
        <button className="pf-btn pf-btn--secondary pf-docs-add-btn"
          onClick={() => { fileInputRef.current?.click(); setUploadMsg(''); setUploadSuccess(false); }} disabled={uploading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Dodaj dokument
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" multiple
        style={{ display: 'none' }} onChange={handleFileChange} />

      {selectedFiles.length > 0 && (
        <div className="pf-docs-upload-panel">
          {selectedFiles.map(f => (
            <div key={f.name} className="pf-docs-upload-row">
              <span className="pf-docs-upload-name">{f.name}</span>
              <select className="pf-docs-tip-select"
                value={tipMap[f.name] || 'CV'}
                onChange={e => setTipMap(prev => ({ ...prev, [f.name]: e.target.value }))}>
                <option value="CV">CV</option>
                <option value="MOTIVACIONO_PISMO">Motivaciono pismo</option>
                <option value="OSTALO">Ostalo</option>
              </select>
            </div>
          ))}
          {uploadMsg && !uploadSuccess && <p className="pf-docs-msg pf-docs-msg--error">{uploadMsg}</p>}
          <div className="pf-docs-upload-actions">
            <button className="pf-btn pf-btn--secondary" onClick={() => { setSelectedFiles([]); setTipMap({}); setUploadMsg(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
              Otkaži
            </button>
            <button className="pf-btn pf-btn--primary" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Upload...' : 'Potvrdi upload'}
            </button>
          </div>
        </div>
      )}

      {uploadMsg && uploadSuccess && (
        <p className="pf-docs-msg pf-docs-msg--success">{uploadMsg}</p>
      )}

      {error && <p className="pf-docs-msg pf-docs-msg--error">{error}</p>}

      {loading ? (
        <p className="pf-state-msg">Učitavanje dokumenata…</p>
      ) : docs.length === 0 ? (
        <p className="pf-state-msg">Nema uploadovanih dokumenata.</p>
      ) : (
        <ul className="pf-docs-list">
          {docs.map(doc => (
            <li key={doc.id} className="pf-doc-item">
              <DocIcon mime={doc.mime_path} />
              <div className="pf-doc-info">
                <span className="pf-doc-name">{doc.original_name}</span>
                <div className="pf-doc-meta">
                  <span className="pf-doc-type-badge">{DOC_TYPE_LABELS[doc.tip_dokumenta] || doc.tip_dokumenta}</span>
                  {doc.size && <span className="pf-doc-size">{formatSize(doc.size)}</span>}
                  {doc.created_at && (
                    <span className="pf-doc-date">
                      {formatDate(doc.created_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="pf-doc-actions">
                <button
                  className="pf-btn pf-btn--secondary pf-doc-download-btn"
                  title="Preuzmi"
                  onClick={async () => {
                    try {
                      const token = sessionStorage.getItem('token');
                      const res = await fetch(`/api/dokumenti/${doc.id}/download`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                      });
                      const data = await res.json();
                      if (data.url) window.open(data.url, '_blank');
                    } catch {}
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                </button>
                <button className="pf-btn pf-doc-delete-btn"
                  onClick={() => handleDelete(doc.id)}
                  disabled={deleting === doc.id}
                  title="Obriši">
                  {deleting === doc.id
                    ? <span className="pf-spinner" aria-hidden="true" />
                    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                  }
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  async function loadPreferences() {
    setLoading(true);
    setError('');
    try {
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch {
      setError('Greška pri učitavanju postavki notifikacija.');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(field) {
    const nextValue = !preferences[field];
    const nextPreferences = { ...preferences, [field]: nextValue };

    setPreferences(nextPreferences);
    setSavingField(field);
    setError('');

    try {
      const updated = await updateNotificationPreferences({ [field]: nextValue });
      setPreferences(updated);
    } catch {
      setPreferences(preferences);
      setError('Greška pri spremanju postavki notifikacija.');
    } finally {
      setSavingField('');
    }
  }

  if (loading) {
    return (
      <div className="pf-card">
        <h2 className="pf-section-title">Postavke notifikacija</h2>
        <p className="pf-state-msg">Učitavanje postavki…</p>
      </div>
    );
  }

  if (!preferences) {
    if (error) return (
      <div className="pf-card">
        <h2 className="pf-section-title">Postavke notifikacija</h2>
        <p className="pf-docs-msg pf-docs-msg--error">{error}</p>
      </div>
    );
    return null;
  }

  return (
    <div className="pf-card">
      <h2 className="pf-section-title">Postavke notifikacija</h2>
      <p className="pf-readonly-note">
        Odaberite koje obavijesti želite primati. Promjene se primjenjuju odmah.
      </p>

      {error && <p className="pf-docs-msg pf-docs-msg--error">{error}</p>}

      <div className="pf-info-grid">
        {[
          ['prijava_podnesena_in_app', 'Prijava podnesena — notifikacija u aplikaciji'],
          ['prijava_podnesena_email', 'Prijava podnesena — email'],
          ['prijava_odobrena_in_app', 'Prijava odobrena — notifikacija u aplikaciji'],
          ['prijava_odobrena_email', 'Prijava odobrena — email'],
          ['prijava_odbijena_in_app', 'Prijava odbijena — notifikacija u aplikaciji'],
          ['prijava_odbijena_email', 'Prijava odbijena — email'],
        ].map(([field, label]) => (
          <label key={field} className="pf-info-item" style={{ cursor: 'pointer' }}>
            <span className="pf-info-label">{label}</span>
            <input
              type="checkbox"
              checked={Boolean(preferences[field])}
              disabled={savingField === field}
              onChange={() => handleToggle(field)}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STUDENT PROFILE
// ─────────────────────────────────────────────────────────────
function StudentProfile({ profile, onProfileReload, authUser, login }) {
  const [editMode,  setEditMode]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);
  const [form,      setForm]      = useState(EMPTY_STUDENT_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setForm({
      ime:             profile.ime     || '',
      prezime:         profile.prezime || '',
      email:           profile.email   || '',
      currentPassword: '',
      newPassword:     '',
      confirmPassword: '',
    });
  }, [profile]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  }

  function handleCancelEdit() {
    setEditMode(false);
    setFormError('');
    setForm({
      ime:             profile.ime     || '',
      prezime:         profile.prezime || '',
      email:           profile.email   || '',
      currentPassword: '',
      newPassword:     '',
      confirmPassword: '',
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');

    if (!form.ime.trim() || !form.prezime.trim() || !form.email.trim()) {
      setFormError('Ime, prezime i e-mail su obavezni.');
      return;
    }

    const changingPassword = form.currentPassword || form.newPassword || form.confirmPassword;
    if (changingPassword) {
      if (!form.currentPassword) { setFormError('Unesite trenutnu lozinku da biste postavili novu.'); return; }
      if (!form.newPassword)     { setFormError('Unesite novu lozinku.'); return; }
      if (form.newPassword.length < 8) { setFormError('Nova lozinka mora imati najmanje 8 karaktera.'); return; }
      if (form.newPassword !== form.confirmPassword) { setFormError('Nove lozinke se ne podudaraju.'); return; }
    }

    setSaving(true);
    try {
      const payload = {
        ime:     form.ime.trim(),
        prezime: form.prezime.trim(),
        email:   form.email.trim(),
      };
      if (changingPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }

      const result = await updateStudentProfile(payload);
      const token = sessionStorage.getItem('token');
      login(token, { ...authUser, ...result.user });
      await onProfileReload();
      setEditMode(false);
      setToast({ message: 'Profil je uspješno ažuriran.', type: 'success' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header card */}
      <div className="pf-card pf-header-card">
        <div className="pf-avatar">
          {`${profile.ime?.[0] ?? ''}${profile.prezime?.[0] ?? ''}`.toUpperCase()}
        </div>
        <div className="pf-header-info">
          <h1 className="pf-name">{profile.ime} {profile.prezime}</h1>
          <div className="pf-header-meta">
            <span className="pf-role-badge pf-role--student">{ROLE_LABELS.STUDENT}</span>
            <span className={`pf-status-badge pf-status--${profile.status.toLowerCase()}`}>
              {STATUS_LABELS[profile.status]}
            </span>
          </div>
          <p className="pf-username">@{profile.username}</p>
        </div>
        {!editMode && (
          <button className="pf-btn pf-btn--primary pf-edit-btn" onClick={() => setEditMode(true)}>
            Uredi profil
          </button>
        )}
      </div>

      {editMode ? (
        <form className="pf-card pf-form" onSubmit={handleSave} noValidate>
          <h2 className="pf-section-title">Uredi podatke</h2>

          {formError && (
            <div className="pf-form-error" role="alert">
              <IconWarning /><span>{formError}</span>
            </div>
          )}

          <div className="pf-form-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="ime">Ime</label>
              <input id="ime" name="ime" type="text" className="pf-input"
                value={form.ime} onChange={handleChange} disabled={saving} />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="prezime">Prezime</label>
              <input id="prezime" name="prezime" type="text" className="pf-input"
                value={form.prezime} onChange={handleChange} disabled={saving} />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="email">E-mail adresa</label>
            <input id="email" name="email" type="email" className="pf-input"
              value={form.email} onChange={handleChange} disabled={saving} />
          </div>

          <div className="pf-divider" />
          <h3 className="pf-subsection-title">
            Promjena lozinke<span className="pf-optional"> — opcionalno</span>
          </h3>

          <div className="pf-field">
            <label className="pf-label" htmlFor="currentPassword">Trenutna lozinka</label>
            <input id="currentPassword" name="currentPassword" type="password"
              className="pf-input" placeholder="Unesite trenutnu lozinku"
              value={form.currentPassword} onChange={handleChange} disabled={saving}
              autoComplete="current-password" />
          </div>

          <div className="pf-form-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="newPassword">Nova lozinka</label>
              <input id="newPassword" name="newPassword" type="password"
                className="pf-input" placeholder="Min. 8 karaktera"
                value={form.newPassword} onChange={handleChange} disabled={saving}
                autoComplete="new-password" />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="confirmPassword">Potvrdi novu lozinku</label>
              <input id="confirmPassword" name="confirmPassword" type="password"
                className="pf-input" placeholder="Ponovi novu lozinku"
                value={form.confirmPassword} onChange={handleChange} disabled={saving}
                autoComplete="new-password" />
            </div>
          </div>

          <div className="pf-form-actions">
            <button type="button" className="pf-btn pf-btn--secondary"
              onClick={handleCancelEdit} disabled={saving}>Odustani</button>
            <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
              {saving && <span className="pf-spinner" aria-hidden="true" />}
              {saving ? 'Snimanje…' : 'Sačuvaj izmjene'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="pf-card">
            <h2 className="pf-section-title">Osnovni podaci</h2>
            <div className="pf-info-grid">
              <div className="pf-info-item">
                <span className="pf-info-label">Ime</span>
                <span className="pf-info-value">{profile.ime}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-label">Prezime</span>
                <span className="pf-info-value">{profile.prezime}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-label">Korisničko ime</span>
                <span className="pf-info-value">@{profile.username}</span>
              </div>
              <div className="pf-info-item">
                <span className="pf-info-label">E-mail adresa</span>
                <span className="pf-info-value">{profile.email}</span>
              </div>
              {profile.institution && (
                <div className="pf-info-item">
                  <span className="pf-info-label">Institucija</span>
                  <span className="pf-info-value">{profile.institution}</span>
                </div>
              )}
              <div className="pf-info-item">
                <span className="pf-info-label">Nalog kreiran</span>
                <span className="pf-info-value">
                  {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>

          {profile.Student && (
            <div className="pf-card">
              <h2 className="pf-section-title">Podaci o studiju</h2>
              <p className="pf-readonly-note">
                Ove podatke može mijenjati samo koordinator fakulteta.
              </p>
              <div className="pf-info-grid">
                <div className="pf-info-item">
                  <span className="pf-info-label">Broj indeksa</span>
                  <span className="pf-info-value">{profile.Student.index_number}</span>
                </div>
                <div className="pf-info-item">
                  <span className="pf-info-label">Godina studija</span>
                  <span className="pf-info-value">{profile.Student.year_of_study}. godina</span>
                </div>
                {profile.Student.Fakultet && (
                  <div className="pf-info-item">
                    <span className="pf-info-label">Fakultet</span>
                    <span className="pf-info-value">{profile.Student.Fakultet.naziv}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <NotificationPreferencesSection />

          <DocumentsSection />
        </>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPANY PROFILE
// ─────────────────────────────────────────────────────────────
function CompanyProfile({ baseProfile, authUser, login }) {
  const [companyData, setCompanyData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadError,   setLoadError]   = useState('');
  const [editMode,    setEditMode]    = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState(null);
  const [form,        setForm]        = useState(EMPTY_COMPANY_FORM);
  const [formError,   setFormError]   = useState('');

  useEffect(() => { loadCompany(); }, []);

  async function loadCompany() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getCompanyProfile();
      setCompanyData(data);
      setForm({
        naziv:          data.naziv          || '',
        opisPoslovanja: data.opisPoslovanja || '',
        djelatnost:     data.djelatnost     || '',
        adresa:         data.adresa         || '',
        telefon:        data.telefon        || '',
        kontaktOsoba:   data.kontaktOsoba   || '',
      });
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  }

  function handleCancelEdit() {
    setEditMode(false);
    setFormError('');
    setForm({
      naziv:          companyData?.naziv          || '',
      opisPoslovanja: companyData?.opisPoslovanja || '',
      djelatnost:     companyData?.djelatnost     || '',
      adresa:         companyData?.adresa         || '',
      telefon:        companyData?.telefon        || '',
      kontaktOsoba:   companyData?.kontaktOsoba   || '',
    });
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError('');

    if (!form.naziv.trim()) {
      setFormError('Naziv kompanije je obavezan.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        naziv:          form.naziv.trim()          || null,
        opisPoslovanja: form.opisPoslovanja.trim() || null,
        djelatnost:     form.djelatnost.trim()     || null,
        adresa:         form.adresa.trim()         || null,
        telefon:        form.telefon.trim()        || null,
        kontaktOsoba:   form.kontaktOsoba.trim()   || null,
      };
      const result = await updateCompanyProfile(payload);
      const responseProfile = result?.profile ?? result;
      const updatedCompany = responseProfile && typeof responseProfile === 'object'
        ? { ...(companyData || {}), ...responseProfile }
        : { ...(companyData || {}), ...payload };
      setCompanyData(updatedCompany);
      window.dispatchEvent(new CustomEvent(COMPANY_PROFILE_UPDATED_EVENT, { detail: updatedCompany }));

      const updatedName = updatedCompany?.naziv || payload.naziv;
      const token = sessionStorage.getItem('token');
      if (token && updatedName) {
        login(token, { ...authUser, ime: updatedName, institution: updatedName });
      }
      setEditMode(false);
      setToast({ message: 'Profil kompanije je uspješno ažuriran.', type: 'success' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const displayVal = v => (v && String(v).trim()) ? v : 'Nije uneseno';
  const companyInitial = (companyData?.naziv?.[0] || baseProfile?.username?.[0] || 'K').toUpperCase();

  if (loading) return <div className="pf-card"><p className="pf-state-msg">Učitavanje profila kompanije…</p></div>;
  if (loadError) return <div className="pf-card"><p className="pf-state-msg pf-state-msg--error">{loadError}</p></div>;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header card */}
      <div className="pf-card pf-header-card">
        <div className="pf-avatar pf-avatar--company">{companyInitial}</div>
        <div className="pf-header-info">
          <h1 className="pf-name">{companyData?.naziv || 'Profil kompanije'}</h1>
          <div className="pf-header-meta">
            <span className="pf-role-badge pf-role--company">{ROLE_LABELS.COMPANY}</span>
            <span className={`pf-status-badge pf-status--${(baseProfile?.status || 'active').toLowerCase()}`}>
              {STATUS_LABELS[baseProfile?.status] || 'Aktivan'}
            </span>
          </div>
          {companyData?.djelatnost && (
            <p className="pf-username">{companyData.djelatnost}</p>
          )}
        </div>
        {!editMode && (
          <button className="pf-btn pf-btn--primary pf-edit-btn" onClick={() => setEditMode(true)}>
            Uredi profil
          </button>
        )}
      </div>

      {editMode ? (
        <form className="pf-card pf-form" onSubmit={handleSave} noValidate>
          <h2 className="pf-section-title">Uredi profil kompanije</h2>

          {formError && (
            <div className="pf-form-error" role="alert">
              <IconWarning /><span>{formError}</span>
            </div>
          )}

          <div className="pf-form-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="naziv">Naziv kompanije</label>
              <input id="naziv" name="naziv" type="text" className="pf-input"
                value={form.naziv} onChange={handleChange} disabled={saving} />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="djelatnost">Djelatnost</label>
              <input id="djelatnost" name="djelatnost" type="text" className="pf-input"
                value={form.djelatnost} onChange={handleChange} disabled={saving} />
            </div>
          </div>

          <div className="pf-form-row">
            <div className="pf-field">
              <label className="pf-label" htmlFor="adresa">Adresa</label>
              <input id="adresa" name="adresa" type="text" className="pf-input"
                value={form.adresa} onChange={handleChange} disabled={saving} />
            </div>
            <div className="pf-field">
              <label className="pf-label" htmlFor="telefon">Telefon</label>
              <input id="telefon" name="telefon" type="text" className="pf-input"
                value={form.telefon} onChange={handleChange} disabled={saving} />
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="kontaktOsoba">Kontakt osoba</label>
            <input id="kontaktOsoba" name="kontaktOsoba" type="text" className="pf-input"
              value={form.kontaktOsoba} onChange={handleChange} disabled={saving} />
          </div>

          <div className="pf-field">
            <label className="pf-label" htmlFor="opisPoslovanja">Opis poslovanja</label>
            <textarea id="opisPoslovanja" name="opisPoslovanja" className="pf-textarea"
              rows={5} value={form.opisPoslovanja} onChange={handleChange} disabled={saving}
              placeholder="Opišite djelatnost i misiju kompanije…" />
          </div>

          <div className="pf-form-actions">
            <button type="button" className="pf-btn pf-btn--secondary"
              onClick={handleCancelEdit} disabled={saving}>Odustani</button>
            <button type="submit" className="pf-btn pf-btn--primary" disabled={saving}>
              {saving && <span className="pf-spinner" aria-hidden="true" />}
              {saving ? 'Snimanje…' : 'Sačuvaj izmjene'}
            </button>
          </div>
        </form>
      ) : (
        <div className="pf-card">
          <h2 className="pf-section-title">Podaci kompanije</h2>
          <div className="pf-info-grid">
            <div className="pf-info-item">
              <span className="pf-info-label">Naziv</span>
              <span className="pf-info-value">{displayVal(companyData?.naziv)}</span>
            </div>
            <div className="pf-info-item">
              <span className="pf-info-label">Djelatnost</span>
              <span className="pf-info-value">{displayVal(companyData?.djelatnost)}</span>
            </div>
            <div className="pf-info-item">
              <span className="pf-info-label">Adresa</span>
              <span className="pf-info-value">{displayVal(companyData?.adresa)}</span>
            </div>
            <div className="pf-info-item">
              <span className="pf-info-label">Telefon</span>
              <span className="pf-info-value">{displayVal(companyData?.telefon)}</span>
            </div>
            <div className="pf-info-item">
              <span className="pf-info-label">Kontakt osoba</span>
              <span className="pf-info-value">{displayVal(companyData?.kontaktOsoba)}</span>
            </div>
            <div className="pf-info-item pf-info-item--full">
              <span className="pf-info-label">Opis poslovanja</span>
              <span className="pf-info-value">{displayVal(companyData?.opisPoslovanja)}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// READ-ONLY FALLBACK (COORDINATOR, ADMIN)
// ─────────────────────────────────────────────────────────────
function ReadOnlyProfile({ profile }) {
  return (
    <>
      <div className="pf-card pf-header-card">
        <div className="pf-avatar">
          {`${profile.ime?.[0] ?? ''}${profile.prezime?.[0] ?? ''}`.toUpperCase()}
        </div>
        <div className="pf-header-info">
          <h1 className="pf-name">{profile.ime} {profile.prezime}</h1>
          <div className="pf-header-meta">
            <span className={`pf-role-badge pf-role--${profile.role.toLowerCase()}`}>
              {ROLE_LABELS[profile.role]}
            </span>
            <span className={`pf-status-badge pf-status--${profile.status.toLowerCase()}`}>
              {STATUS_LABELS[profile.status]}
            </span>
          </div>
          <p className="pf-username">@{profile.username}</p>
        </div>
      </div>

      <div className="pf-card">
        <h2 className="pf-section-title">Osnovni podaci</h2>
        <div className="pf-info-grid">
          <div className="pf-info-item">
            <span className="pf-info-label">Ime</span>
            <span className="pf-info-value">{profile.ime}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Prezime</span>
            <span className="pf-info-value">{profile.prezime}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">Korisničko ime</span>
            <span className="pf-info-value">@{profile.username}</span>
          </div>
          <div className="pf-info-item">
            <span className="pf-info-label">E-mail adresa</span>
            <span className="pf-info-value">{profile.email}</span>
          </div>
          {profile.institution && (
            <div className="pf-info-item">
              <span className="pf-info-label">Institucija</span>
              <span className="pf-info-value">{profile.institution}</span>
            </div>
          )}
          <div className="pf-info-item">
            <span className="pf-info-label">Nalog kreiran</span>
            <span className="pf-info-value">
              {formatDate(profile.created_at)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE ROOT
// ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const navigate = useNavigate();

  const [profile,   setProfile]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!authUser) { navigate('/auth', { replace: true }); return; }
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setPageError('');
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="pf-page">
        <p className="pf-state-msg">Učitavanje profila…</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="pf-page">
        <p className="pf-state-msg pf-state-msg--error">{pageError}</p>
      </div>
    );
  }

  const dashboardPath = ROLE_ROUTES[profile?.role] ?? '/dashboard';

  return (
    <div className="pf-page">
      <header className="pf-topbar">
        <Link to={dashboardPath} className="pf-back">
          <IconChevronLeft />
          Nazad na dashboard
        </Link>
        <span className="pf-topbar__title">Moj profil</span>
      </header>

      <main className="pf-main">
        {profile?.role === 'STUDENT' && (
          <StudentProfile
            profile={profile}
            onProfileReload={loadProfile}
            authUser={authUser}
            login={login}
          />
        )}
        {profile?.role === 'COMPANY' && (
          <CompanyProfile baseProfile={profile} authUser={authUser} login={login} />
        )}
        {(profile?.role === 'COORDINATOR' || profile?.role === 'ADMIN') && (
          <ReadOnlyProfile profile={profile} />
        )}
      </main>
    </div>
  );
}
