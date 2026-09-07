import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateListing } from '../../services/listingsService';

export default function EditOglas({ initial, onCancel, onUpdated }) {
  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState({
    naziv: initial.naziv || '',
    opis: initial.opis || '',
    brojMjesta: initial.brojMjesta || '',
    rokPrijave: initial.rokPrijave ? initial.rokPrijave.slice(0, 10) : '',
    datumPocetka: initial.datumPocetka ? initial.datumPocetka.slice(0, 10) : '',
    trajanje: initial.trajanje || '',
    oblast: initial.oblast || '',
    lokacija: initial.lokacija || '',
    tip: initial.tip || 'Onsite',
    tehnologije: (initial.tehnologije || []).join(', '),
    uslovi: (initial.uslovi || []).join('\n'),
    placenaPraksa: !!initial.placenaPraksa,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.naziv || !formData.opis || !formData.brojMjesta || !formData.rokPrijave) {
      setError('Naziv, opis, broj mjesta i rok prijave su obavezni.');
      return;
    }
    if (!formData.datumPocetka) {
      setError('Datum početka prakse je obavezan.');
      return;
    }
    if (!formData.trajanje) {
      setError('Trajanje prakse je obavezno.');
      return;
    }
    if (!Number.isInteger(Number(formData.trajanje)) || Number(formData.trajanje) <= 0) {
      setError('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
      return;
    }
    const broj = Number(formData.brojMjesta);
    if (!Number.isInteger(broj) || broj <= 0) {
      setError('Broj mjesta mora biti pozitivan cijeli broj.');
      return;
    }
    if (formData.rokPrijave < today) {
      setError('Rok prijave ne može biti u prošlosti.');
      return;
    }
    if (formData.datumPocetka <= formData.rokPrijave) {
      setError('Datum početka prakse mora biti nakon isteka roka prijave.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        naziv: formData.naziv,
        opis: formData.opis,
        brojMjesta: broj,
        rokPrijave: formData.rokPrijave,
        datumPocetka: formData.datumPocetka,
        trajanje: formData.trajanje,
        oblast: formData.oblast || null,
        lokacija: formData.lokacija || null,
        tip: formData.tip,
        placenaPraksa: formData.placenaPraksa,
        tehnologije: formData.tehnologije.split(',').map(t => t.trim()).filter(Boolean),
        uslovi: formData.uslovi.split('\n').map(u => u.trim()).filter(Boolean),
      };

      const result = await updateListing(initial.id, payload);
      setSuccess(result.message || 'Oglas je uspješno ažuriran.');
      if (onUpdated) onUpdated(result.oglas || result);
    } catch (err) {
      setError(err.message || 'Greška pri ažuriranju oglasa.');
    } finally {
      setSaving(false);
    }
  }

  const isActive = typeof initial.aktivan !== 'undefined' ? initial.aktivan : (initial.status === 'AKTIVAN');

  if (!isActive) {
    return (
      <div>
        <div className="cd-inline-message cd-inline-message--error">Ne možete uređivati zatvoreni oglas.</div>
        <button className="cd-btn" onClick={onCancel}>Nazad</button>
      </div>
    );
  }

  return (
    <div className="cd-content">
      <header className="cd-header">
        <h1 className="cd-title">Uredi oglas</h1>
        <p className="cd-subtitle">Ažurirajte podatke oglasa.</p>
      </header>

      <form className="cd-profile-form" onSubmit={handleSubmit}>
        {error && <div className="cd-inline-message cd-inline-message--error">{error}</div>}
        {success && <div className="cd-inline-message cd-inline-message--success">{success}</div>}

        <div className="cd-form-row">
          <div className="cd-form-field">
            <label className="cd-form-label">Naziv oglasa *</label>
            <input className="cd-input" type="text" value={formData.naziv} onChange={(e) => handleChange('naziv', e.target.value)} />
          </div>
          <div className="cd-form-field">
            <label className="cd-form-label">Broj mjesta *</label>
            <input className="cd-input" type="number" min="1" value={formData.brojMjesta} onChange={(e) => handleChange('brojMjesta', e.target.value)} />
          </div>
        </div>

        <div className="cd-form-field">
          <label className="cd-form-label">Opis *</label>
          <textarea className="cd-textarea" rows={4} value={formData.opis} onChange={(e) => handleChange('opis', e.target.value)} />
        </div>

        <div className="cd-form-row">
          <div className="cd-form-field">
            <label className="cd-form-label">Rok prijave *</label>
            <DatePicker
              className="cd-input"
              dateFormat="dd.MM.yyyy"
              placeholderText="dd.mm.yyyy"
              minDate={new Date(today)}
              selected={formData.rokPrijave ? new Date(formData.rokPrijave) : null}
              onChange={(date) => handleChange('rokPrijave', date ? date.toISOString().slice(0, 10) : '')}
              autoComplete="off"
            />
          </div>
          <div className="cd-form-field">
            <label className="cd-form-label">Datum početka prakse *</label>
            <DatePicker
              className="cd-input"
              dateFormat="dd.MM.yyyy"
              placeholderText="dd.mm.yyyy"
              minDate={formData.rokPrijave ? new Date(new Date(formData.rokPrijave).getTime() + 86400000) : new Date(today)}
              selected={formData.datumPocetka ? new Date(formData.datumPocetka) : null}
              onChange={(date) => handleChange('datumPocetka', date ? date.toISOString().slice(0, 10) : '')}
              autoComplete="off"
            />
          </div>
        </div>

        <div className="cd-form-row">
          <div className="cd-form-field">
            <label className="cd-form-label">Lokacija</label>
            <input className="cd-input" type="text" placeholder="npr. Sarajevo" value={formData.lokacija} onChange={(e) => handleChange('lokacija', e.target.value)} />
          </div>
          <div className="cd-form-field">
            <label className="cd-form-label">Tip prakse</label>
            <select className="cd-input" value={formData.tip} onChange={(e) => handleChange('tip', e.target.value)}>
              <option value="Onsite">Onsite</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
        </div>

        <div className="cd-form-row">
          <div className="cd-form-field">
            <label className="cd-form-label">Trajanje (u mjesecima) *</label>
            <input className="cd-input" type="number" min="1" placeholder="npr. 3" value={formData.trajanje} onChange={(e) => handleChange('trajanje', e.target.value)} />
          </div>
          <div className="cd-form-field">
            <label className="cd-form-label">Oblast</label>
            <input className="cd-input" type="text" placeholder="npr. Web razvoj" value={formData.oblast} onChange={(e) => handleChange('oblast', e.target.value)} />
          </div>
        </div>

        <div className="cd-form-field">
          <label className="cd-form-label">Tehnologije / vještine (odvojene zarezom)</label>
          <input className="cd-input" type="text" placeholder="npr. React, Node.js, PostgreSQL" value={formData.tehnologije} onChange={(e) => handleChange('tehnologije', e.target.value)} />
        </div>

        <div className="cd-form-field">
          <label className="cd-form-label">Uslovi / zahtjevi (svaki u novom redu)</label>
          <textarea className="cd-textarea" rows={4} placeholder={"Osnove JavaScript-a\nPoznavanje Gita\nStudent 3. ili 4. godine"} value={formData.uslovi} onChange={(e) => handleChange('uslovi', e.target.value)} />
        </div>

        <div className="cd-form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="placena-praksa-edit" checked={formData.placenaPraksa} onChange={(e) => handleChange('placenaPraksa', e.target.checked)} />
          <label className="cd-form-label" htmlFor="placena-praksa-edit" style={{ margin: 0 }}>Plaćena praksa (stipendija)</label>
        </div>

        <div className="cd-form-actions">
          <button type="submit" className="cd-btn cd-btn--primary" disabled={saving}>{saving ? 'Spremanje...' : 'Sačuvaj promjene'}</button>
          <button type="button" className="cd-btn cd-btn--secondary" onClick={onCancel} disabled={saving}>Nazad</button>
        </div>
      </form>
    </div>
  );
}
