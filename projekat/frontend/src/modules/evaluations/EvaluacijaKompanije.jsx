// src/components/evaluations/EvaluacijaKompanije.jsx
// Student evaluira kompaniju (US 27)
// Exportuje i modal varijantu za korištenje unutar StudentDashboard-a.

import { useState, useEffect, useMemo } from 'react';
import {
    getApplicationsForCompanyEvaluation,
    submitCompanyEvaluation,
    getMyStudentEvaluations,
} from '../../services/evaluationService';
import './Evaluacija.css';

// ── Konstante ─────────────────────────────────────────────────────────────

const CRITERIA = [
    { key: 'organizacija', label: 'Organizacija prakse' },
    { key: 'mentorstvo', label: 'Mentorstvo i podrška' },
    { key: 'radnoOkruzenje', label: 'Radno okruženje' },
    { key: 'relevantnoPosla', label: 'Relevantnost zadataka' },
    { key: 'preporukaKompanija', label: 'Preporuka kompanije' },
];

const EMPTY_SCORES = Object.fromEntries(CRITERIA.map(c => [c.key, 0]));

// ── StarRating ─────────────────────────────────────────────────────────────

function StarRating({ value, onChange, disabled, size = 22 }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="ev-stars" onMouseLeave={() => setHovered(0)}>
            {[1, 2, 3, 4, 5].map(n => (
                <button
                    key={n}
                    type="button"
                    className={`ev-star-btn${(hovered || value) >= n ? ' filled' : ''}`}
                    onMouseEnter={() => !disabled && setHovered(n)}
                    onClick={() => !disabled && onChange(n)}
                    disabled={disabled}
                    aria-label={`Ocjena ${n}`}
                    title={`${n} / 5`}
                >
                    <svg width={size} height={size} viewBox="0 0 24 24"
                        fill={(hovered || value) >= n ? 'currentColor' : 'none'}
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </button>
            ))}
        </div>
    );
}

// ── ReadOnlyStars ──────────────────────────────────────────────────────────

function ReadOnlyStars({ value, size = 14 }) {
    return (
        <span className="ev-submitted-stars">
            {[1, 2, 3, 4, 5].map(n => (
                <svg key={n} width={size} height={size} viewBox="0 0 24 24"
                    className={n <= value ? '' : 'empty'}
                    fill={n <= value ? 'currentColor' : 'none'}
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ))}
        </span>
    );
}

// ── EvaluationForm (zajednička forma za oba konteksta) ─────────────────────

function EvaluationForm({ application, onSuccess, onCancel, isModal = false }) {
    const [scores, setScores] = useState(EMPTY_SCORES);
    // Dodaj ovaj useMemo nakon scores state-a:
    const ukupnaOcjena = useMemo(() => {
        const vals = Object.values(scores).filter(v => v > 0);
        if (vals.length === 0) return 0;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }, [scores]);
    const [komentar, setKomentar] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    function setScore(key, val) {
        setScores(prev => ({ ...prev, [key]: val }));
    }

    function resetForm() {
        setScores(EMPTY_SCORES);
        setKomentar('');
        setFormError('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');

        const allFilled = CRITERIA.every(c => scores[c.key] > 0);
        if (!allFilled) {
            setFormError('Molimo ocjenite sve kriterije evaluacije.');
            return;
        }

        setSubmitting(true);
        try {
            await submitCompanyEvaluation(application.id, {
                ...scores,
                ukupnaOcjena,
                komentar: komentar.trim(),
            });
            onSuccess(application);
        } catch (err) {
            setFormError(err.message || 'Greška pri slanju evaluacije.');
        } finally {
            setSubmitting(false);
        }
    }

    // Logo letters from company name
    const companyInitials = (application.kompanijaNaziv || 'K')
        .split(/\s+/)
        .filter(w => w.length > 1)
        .slice(0, 2)
        .map(w => w[0].toUpperCase())
        .join('') || (application.kompanijaNaziv?.[0] || 'K').toUpperCase();

    return (
        <form className="ev-form-card" onSubmit={handleSubmit} style={isModal ? { boxShadow: 'none', border: 'none', padding: 0 } : {}}>
            {/* Subject header */}
            <div className="ev-form-subject">
                <div className="ev-form-subject-avatar" style={{ background: '#0e9e6e', borderRadius: '10px' }}>
                    {companyInitials}
                </div>
                <div className="ev-form-subject-info">
                    <span className="ev-form-subject-name">{application.kompanijaNaziv}</span>
                    <span className="ev-form-subject-meta">{application.oglasNaziv}</span>
                </div>
            </div>

            {/* Criteria */}
            <div className="ev-criteria-list">
                {CRITERIA.map(c => (
                    <div key={c.key} className="ev-criterion">
                        <span className="ev-criterion-label">
                            {c.label}
                            {scores[c.key] > 0 && (
                                <span className="ev-criterion-score">{scores[c.key]} / 5</span>
                            )}
                        </span>
                        <StarRating
                            value={scores[c.key]}
                            onChange={val => setScore(c.key, val)}
                            disabled={submitting}
                        />
                    </div>
                ))}

                {/* Umjesto StarRating za ukupnu ocjenu: */}
                <div className="ev-overall-row">
                    <span className="ev-criterion-label">
                        Ukupna ocjena (prosjek)
                        <span className="ev-criterion-score">
                            {ukupnaOcjena > 0 ? `${ukupnaOcjena} / 5` : 'Popunite sve kriterije'}
                        </span>
                    </span>
                </div>
            </div>

            {/* Komentar */}
            <div className="ev-comment-field">
                <label className="ev-comment-label">
                    Komentar <span style={{ fontWeight: 400, color: 'var(--color-muted,#6b7fa3)' }}>(opcionalno)</span>
                </label>
                <textarea
                    className="ev-textarea"
                    placeholder="Opišite vaše iskustvo u ovoj kompaniji, mentorstvo, radnu atmosferu..."
                    value={komentar}
                    onChange={e => setKomentar(e.target.value)}
                    disabled={submitting}
                    maxLength={1000}
                />
            </div>

            {formError && <div className="ev-message ev-message--error">{formError}</div>}

            <div className="ev-form-actions">
                <button
                    type="button"
                    className={isModal ? 'sd-btn-modal-cancel' : 'cd-btn cd-btn--secondary'}
                    onClick={() => { resetForm(); onCancel?.(); }}
                    disabled={submitting}
                >
                    {isModal ? 'Odustani' : 'Poništi'}
                </button>
                <button
                    type="submit"
                    className={isModal ? 'sd-btn-apply' : 'cd-btn cd-btn--primary'}
                    disabled={submitting}
                >
                    {submitting ? 'Slanje...' : 'Pošalji evaluaciju'}
                </button>
            </div>
        </form>
    );
}

// ── EvaluacijaKompanijeModal (za StudentDashboard) ─────────────────────────
// Otvara se kao overlay modal direktno iz "Moje prijave" taba.

export function EvaluacijaKompanijeModal({ application, onClose, onSubmitted }) {
    function handleSuccess(app) {
        onSubmitted?.(app);
        onClose();
    }

    return (
        <div className="sd-modal-overlay" onClick={onClose}>
            <div className="ev-modal" onClick={e => e.stopPropagation()}>
                <button
                    className="ev-modal-close"
                    onClick={onClose}
                    aria-label="Zatvori"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
                <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em', color: 'var(--color-dark,#0d1f3c)' }}>
                        Evaluacija kompanije
                    </h3>
                    <p style={{ fontSize: '0.83rem', color: 'var(--color-muted,#6b7fa3)', margin: 0 }}>
                        Podijelite vaše iskustvo prakse kroz predefinisani formular.
                    </p>
                </div>
                <EvaluationForm
                    application={application}
                    onSuccess={handleSuccess}
                    onCancel={onClose}
                    isModal
                />
            </div>
        </div>
    );
}

// ── EvaluacijaKompanije (full-page view za potencijalni standalone prikaz) ──

export default function EvaluacijaKompanije() {
    const [tab, setTab] = useState('pending');

    const [pending, setPending] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [pendingError, setPendingError] = useState('');

    const [submitted, setSubmitted] = useState([]);
    const [submittedLoading, setSubmittedLoading] = useState(false);
    const [submittedLoaded, setSubmittedLoaded] = useState(false);

    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    useEffect(() => {
        let active = true;
        setPendingLoading(true);
        setPendingError('');
        getApplicationsForCompanyEvaluation()
            .then(data => { if (active) setPending(data || []); })
            .catch(err => { if (active) setPendingError(err.message || 'Greška pri učitavanju.'); })
            .finally(() => { if (active) setPendingLoading(false); });
        return () => { active = false; };
    }, []);

    useEffect(() => {
        if (pending.length > 0 && !selectedApplicationId) {
            setSelectedApplicationId(String(pending[0].id));
        }
    }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (tab !== 'submitted' || submittedLoaded) return;
        let active = true;
        setSubmittedLoading(true);
        getMyStudentEvaluations()
            .then(data => { if (active) { setSubmitted(data || []); setSubmittedLoaded(true); } })
            .catch(() => { if (active) setSubmittedLoaded(true); })
            .finally(() => { if (active) setSubmittedLoading(false); });
        return () => { active = false; };
    }, [tab, submittedLoaded]);

    function handleSuccess(app) {
        setFormSuccess(`Evaluacija za kompaniju ${app.kompanijaNaziv} je uspješno poslana.`);
        setPending(prev => prev.filter(a => String(a.id) !== String(app.id)));
        setSubmittedLoaded(false);
        const remaining = pending.filter(a => String(a.id) !== String(app.id));
        setSelectedApplicationId(remaining.length > 0 ? String(remaining[0].id) : '');
    }

    const selectedApplication = pending.find(a => String(a.id) === selectedApplicationId);

    return (
        <div className="ev-wrap">
            <div className="ev-header">
                <h2 className="ev-title">Evaluacija kompanije</h2>
                <p className="ev-subtitle">
                    Ocijenite kompanije u kojima ste odradili praksu i pomozite budućim studentima.
                </p>
            </div>

            <div className="ev-tabs">
                <button
                    className={`ev-tab-btn${tab === 'pending' ? ' active' : ''}`}
                    onClick={() => setTab('pending')}
                >
                    Na čekanju
                    {pending.length > 0 && (
                        <span style={{ marginLeft: 6, background: 'var(--color-primary,#1a6fd4)', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {pending.length}
                        </span>
                    )}
                </button>
                <button
                    className={`ev-tab-btn${tab === 'submitted' ? ' active' : ''}`}
                    onClick={() => setTab('submitted')}
                >
                    Moje evaluacije
                </button>
            </div>

            {tab === 'pending' && (
                <>
                    {pendingLoading && <p className="ev-loading">Učitavanje...</p>}
                    {!pendingLoading && pendingError && (
                        <div className="ev-message ev-message--error">{pendingError}</div>
                    )}
                    {!pendingLoading && !pendingError && pending.length === 0 && (
                        <div className="ev-empty">
                            <svg className="ev-empty-icon" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                            </svg>
                            <p className="ev-empty-title">Nema kompanija za evaluaciju</p>
                            <p className="ev-empty-sub">
                                Kada završite praksu, ovdje ćete moći ocijeniti kompaniju.
                            </p>
                        </div>
                    )}

                    {!pendingLoading && !pendingError && pending.length > 0 && (
                        <>
                            {formSuccess && <div className="ev-message ev-message--success">{formSuccess}</div>}
                            <label className="ev-select-label">
                                Odaberi praksu / kompaniju
                                <select
                                    className="ev-select"
                                    value={selectedApplicationId}
                                    onChange={e => setSelectedApplicationId(e.target.value)}
                                >
                                    {pending.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.kompanijaNaziv} — {a.oglasNaziv}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            {selectedApplication && (
                                <EvaluationForm
                                    application={selectedApplication}
                                    onSuccess={handleSuccess}
                                />
                            )}
                        </>
                    )}
                </>
            )}

            {tab === 'submitted' && (
                <>
                    {submittedLoading && <p className="ev-loading">Učitavanje evaluacija...</p>}
                    {!submittedLoading && submitted.length === 0 && (
                        <div className="ev-empty">
                            <svg className="ev-empty-icon" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <polyline points="9 15 11 17 15 13" />
                            </svg>
                            <p className="ev-empty-title">Nema poslanih evaluacija</p>
                            <p className="ev-empty-sub">Evaluacije kompanija koje pošaljete pojavit će se ovdje.</p>
                        </div>
                    )}
                    {!submittedLoading && submitted.length > 0 && (
                        <div className="ev-submitted-list">
                            {submitted.map(ev => (
                                <div key={ev.id} className="ev-submitted-card">
                                    <div className="ev-submitted-card-header">
                                        <div>
                                            <div className="ev-submitted-card-name">{ev.kompanijaNaziv}</div>
                                            <div className="ev-submitted-card-meta">{ev.oglasNaziv}</div>
                                        </div>
                                        <div className="ev-submitted-card-date">
                                            {ev.datumEvaluacije
                                                ? new Date(ev.datumEvaluacije).toLocaleDateString('bs-BA')
                                                : ''}
                                        </div>
                                    </div>
                                    <div className="ev-submitted-scores">
                                        {CRITERIA.map(c => (
                                            <div key={c.key} className="ev-submitted-score-item">
                                                <span className="ev-submitted-score-label">{c.label}:</span>
                                                <ReadOnlyStars value={ev[c.key] || 0} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="ev-submitted-score-item" style={{ marginBottom: 8 }}>
                                        <span className="ev-submitted-score-label">Ukupna ocjena:</span>
                                        <ReadOnlyStars value={ev.ukupnaOcjena || 0} size={16} />
                                        <span className="ev-submitted-overall">{ev.ukupnaOcjena}/5</span>
                                    </div>
                                    {ev.komentar && (
                                        <div className="ev-submitted-comment">"{ev.komentar}"</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}