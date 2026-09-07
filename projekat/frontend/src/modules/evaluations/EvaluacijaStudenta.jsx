// src/components/evaluations/EvaluacijaStudenta.jsx
// Kompanija evaluira studenta (US 26)

import { useState, useEffect, useMemo } from 'react';
import {
    getApplicationsForEvaluation,
    submitStudentEvaluation,
    getCompanySubmittedEvaluations,
} from '../../services/evaluationService';
import './Evaluacija.css';

// ── Konstante ─────────────────────────────────────────────────────────────

const CRITERIA = [
    { key: 'tehnickeVjestine', label: 'Tehničke vještine' },
    { key: 'komunikacija', label: 'Komunikacija' },
    { key: 'radnaEtika', label: 'Radna etika' },
    { key: 'inicijativa', label: 'Inicijativa' },
    { key: 'timskiRad', label: 'Timski rad' },
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

// ── EvaluacijaStudenta ────────────────────────────────────────────────────

export default function EvaluacijaStudenta() {
    const [tab, setTab] = useState('pending'); // 'pending' | 'submitted'

    // Pending (čekaju evaluaciju)
    const [pending, setPending] = useState([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [pendingError, setPendingError] = useState('');

    // Submitted (već ocijenjeni)
    const [submitted, setSubmitted] = useState([]);
    const [submittedLoading, setSubmittedLoading] = useState(false);
    const [submittedLoaded, setSubmittedLoaded] = useState(false);

    // Forma
    const [selectedApplicationId, setSelectedApplicationId] = useState('');
    const [scores, setScores] = useState(EMPTY_SCORES);
    // Dodaj ovaj useMemo nakon scores state-a:
    const ukupnaOcjena = useMemo(() => {
        const vals = Object.values(scores).filter(v => v > 0);
        if (vals.length === 0) return 0;
        return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
    }, [scores]);
    const [komentar, setKomentar] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    // Load pending na mount
    useEffect(() => {
        let active = true;
        setPendingLoading(true);
        setPendingError('');
        getApplicationsForEvaluation()
            .then(data => { if (active) setPending(data || []); })
            .catch(err => { if (active) setPendingError(err.message || 'Greška pri učitavanju.'); })
            .finally(() => { if (active) setPendingLoading(false); });
        return () => { active = false; };
    }, []);

    // Postavi default odabir kad se pending učita
    useEffect(() => {
        if (pending.length > 0 && !selectedApplicationId) {
            setSelectedApplicationId(String(pending[0].id));
        }
    }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load submitted samo kad se tab prebaci
    useEffect(() => {
        if (tab !== 'submitted' || submittedLoaded) return;
        let active = true;
        setSubmittedLoading(true);
        getCompanySubmittedEvaluations()
            .then(data => { if (active) { setSubmitted(data || []); setSubmittedLoaded(true); } })
            .catch(() => { if (active) setSubmittedLoaded(true); })
            .finally(() => { if (active) setSubmittedLoading(false); });
        return () => { active = false; };
    }, [tab, submittedLoaded]);

    function resetForm() {
        setScores(EMPTY_SCORES);
        setKomentar('');
        setFormError('');
    }

    function handleApplicationChange(id) {
        setSelectedApplicationId(id);
        resetForm();
        setFormSuccess('');
    }

    function setScore(key, val) {
        setScores(prev => ({ ...prev, [key]: val }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validacija — sva polja moraju biti popunjena
        const allCriteriaFilled = CRITERIA.every(c => scores[c.key] > 0);
        if (!allCriteriaFilled) {
            setFormError('Molimo ocjenite sve kriterije evaluacije.');
            return;
        }
        if (!selectedApplicationId) {
            setFormError('Odaberite prijavu za evaluaciju.');
            return;
        }

        setSubmitting(true);
        try {
            await submitStudentEvaluation(Number(selectedApplicationId), {
                ...scores,
                ukupnaOcjena,
                komentar: komentar.trim(),
            });

            // Ukloni iz pending liste
            const evaluated = pending.find(a => String(a.id) === selectedApplicationId);
            setPending(prev => prev.filter(a => String(a.id) !== selectedApplicationId));
            setFormSuccess(`Evaluacija za ${evaluated?.studentIme || 'studenta'} je uspješno poslana.`);
            setSubmittedLoaded(false); // invalidate submitted cache
            resetForm();

            // Odaberi sljedeću ako postoji
            const remaining = pending.filter(a => String(a.id) !== selectedApplicationId);
            setSelectedApplicationId(remaining.length > 0 ? String(remaining[0].id) : '');
        } catch (err) {
            setFormError(err.message || 'Greška pri slanju evaluacije.');
        } finally {
            setSubmitting(false);
        }
    }

    const selectedApplication = pending.find(a => String(a.id) === selectedApplicationId);

    return (
        <div className="ev-wrap">
            <div className="ev-header">
                <h2 className="ev-title">Evaluacija studenta</h2>
                <p className="ev-subtitle">
                    Evaluirajte studente koji su završili praksu kroz predefinisani formular.
                </p>
            </div>

            {/* ── Tabs ── */}
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
                    Poslane evaluacije
                </button>
            </div>

            {/* ── Tab: Na čekanju ── */}
            {tab === 'pending' && (
                <>
                    {pendingLoading && <p className="ev-loading">Učitavanje...</p>}
                    {!pendingLoading && pendingError && (
                        <div className="ev-message ev-message--error">{pendingError}</div>
                    )}
                    {!pendingLoading && !pendingError && pending.length === 0 && (
                        <div className="ev-empty">
                            <svg className="ev-empty-icon" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            <p className="ev-empty-title">Nema studenata za evaluaciju</p>
                            <p className="ev-empty-sub">
                                Ovdje će se pojaviti studenti čija je praksa završena, a evaluacija još nije popunjena.
                            </p>
                        </div>
                    )}

                    {!pendingLoading && !pendingError && pending.length > 0 && (
                        <>
                            {formSuccess && <div className="ev-message ev-message--success">{formSuccess}</div>}

                            {/* Selector */}
                            <label className="ev-select-label">
                                Odaberi studenta / prijavu
                                <select
                                    className="ev-select"
                                    value={selectedApplicationId}
                                    onChange={e => handleApplicationChange(e.target.value)}
                                >
                                    {pending.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.studentIme} {a.studentPrezime}{a.oglasNaziv ? ` - ${a.oglasNaziv}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {selectedApplication && (
                                <form className="ev-form-card" onSubmit={handleSubmit}>
                                    {/* Subject header */}
                                    <div className="ev-form-subject">
                                        <div className="ev-form-subject-avatar">
                                            {(selectedApplication.studentIme?.[0] || 'S').toUpperCase()}
                                        </div>
                                        <div className="ev-form-subject-info">
                                            <span className="ev-form-subject-name">
                                                {selectedApplication.studentIme} {selectedApplication.studentPrezime}
                                            </span>
                                            <span className="ev-form-subject-meta">
                                                {selectedApplication.oglasNaziv}
                                                {selectedApplication.odsjek ? ` · ${selectedApplication.odsjek}` : ''}
                                            </span>
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

                                        {/* Ukupna ocjena */}
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
                                            placeholder="Napišite komentar o radu studenta, specifičnim postignućima ili oblastima za napredak..."
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
                                            className="cd-btn cd-btn--secondary"
                                            onClick={resetForm}
                                            disabled={submitting}
                                        >
                                            Poništi
                                        </button>
                                        <button
                                            type="submit"
                                            className="cd-btn cd-btn--primary"
                                            disabled={submitting}
                                        >
                                            {submitting ? 'Slanje...' : 'Pošalji evaluaciju'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    )}
                </>
            )}

            {/* ── Tab: Poslane evaluacije ── */}
            {tab === 'submitted' && (
                <>
                    {submittedLoading && <p className="ev-loading">Učitavanje poslanih evaluacija...</p>}
                    {!submittedLoading && submitted.length === 0 && (
                        <div className="ev-empty">
                            <svg className="ev-empty-icon" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <polyline points="9 15 11 17 15 13" />
                            </svg>
                            <p className="ev-empty-title">Nema poslanih evaluacija</p>
                            <p className="ev-empty-sub">Evaluacije koje pošaljete pojavit će se ovdje.</p>
                        </div>
                    )}
                    {!submittedLoading && submitted.length > 0 && (
                        <div className="ev-submitted-list">
                            {submitted.map(ev => (
                                <div key={ev.id} className="ev-submitted-card">
                                    <div className="ev-submitted-card-header">
                                        <div>
                                            <div className="ev-submitted-card-name">
                                                {ev.studentIme} {ev.studentPrezime}
                                            </div>
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