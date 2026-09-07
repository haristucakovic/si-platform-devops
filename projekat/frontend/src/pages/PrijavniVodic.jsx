import { useState } from 'react';
import './PrijavniVodic.css';

const steps = [
  {
    label: 'Profil',
    iconPath: (
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    ),
    iconExtra: <circle cx="12" cy="7" r="4" />,
    iconBg: '#e6f7f1',
    iconColor: '#0e9e6e',
    title: 'Pripremi profil',
    desc: 'Prije nego što se možeš prijaviti na praksu, profil mora biti popunjen. Kompanije gledaju ove podatke pri selekciji.',
    details: [
      { icon: 'badge', text: <><strong>Lični podaci</strong> - provjeri da su ime, prezime, indeks, godina studija i odsjek tačni.</> },
      { icon: 'file', text: <><strong>CV i motivaciono pismo</strong> - pripremi ih unaprijed u <strong>PDF formatu</strong> i uploaduj na stranici profila.</> },
      { icon: 'check', text: <><strong>Verifikacija emaila</strong> - nalog mora biti aktivan i potvrđen prije prve prijave.</> },
    ],
    tip: { bg: '#e6f7f1', color: '#0a6e4a', icon: 'bulb', label: 'Gdje pronaći', text: 'Sidebar → ikonica profila → "Profil". Popunjenost profila povećava šanse za selekciju.' },
  },
  {
    label: 'Pretraga',
    iconPath: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    iconBg: '#e8f1fc',
    iconColor: '#1a6fd4',
    title: 'Pronađi pravo radno mjesto',
    desc: 'Na stranici Oglasi možeš pregledati, pretraživati i filtrirati sve dostupne prakse.',
    details: [
      { icon: 'filter', text: <><strong>Filtriranje</strong> - suzit rezultate po oblasti, trajanju i tipu plaćanja pomoću filtera u lijevom sidebaru.</> },
      { icon: 'star', text: <><strong>Favoriti</strong> - označi oglase srcem da ih sačuvaš za kasniju usporedbu pod tabom "Omiljeni".</> },
      { icon: 'bell', text: <><strong>Oznaka "Novo"</strong> - svježe objavljeni oglasi imaju zelenu oznaku da ih lakše primijetiš.</> },
    ],
    tip: { bg: '#e8f1fc', color: '#1a5aa8', icon: 'pin', label: 'Gdje pronaći', text: 'Sidebar → tab "Svi oglasi". Na vrhu je polje za pretragu, s lijeve strane su filteri.' },
  },
  {
    label: 'Prijava',
    iconPath: <><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></>,
    iconBg: '#f0eeff',
    iconColor: '#6d4ce1',
    title: 'Pošalji prijavu',
    desc: 'Kada pronađeš oglas koji ti odgovara, otvori detalje klikom i zatim klikni "Prijavi se na praksu". Svaki student može imati ograničen broj aktivnih prijava.',
    details: [
      { icon: 'upload', text: <><strong>Upload dokumenta</strong> - pri prijavi priloži CV i motivaciono pismo u PDF formatu (možeš odabrati ranije uploadovane).</> },
      { icon: 'clock', text: <><strong>Status "Na čekanju"</strong> - odmah nakon slanja prijava dobija ovaj status dok je prvo koordinator ne pregleda.</> },
      { icon: 'ban', text: <><strong>Ograničenja</strong> - nije moguće prijaviti se dva puta na isti oglas, niti na zatvoreni oglas.</> },
    ],
    tip: { bg: '#f0eeff', color: '#4e36b0', icon: 'pin', label: 'Gdje pronaći', text: 'Sidebar → "Moje prijave" - pregled svih prijava i njihovih statusa u realnom vremenu.' },
  },
  {
    label: 'Selekcija',
    iconPath: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    iconBg: '#fff6e8',
    iconColor: '#c97a10',
    title: 'Koordinator pregledava prijave',
    desc: 'Koordinator pregleda sve prijave i prosljeđuje ih kompaniji ili ih odbija. Kompanija pregledava proslijeđene prijave i bira kandidate koji ulaze u uži krug. Tvoj CV i motivaciono pismo igraju ključnu ulogu.',
    details: [
      { icon: 'bell', text: <><strong>Notifikacija</strong> - primit ćeš obavijest čim koordinator promijeni status tvoje prijave.</> },
      { icon: 'check', text: <><strong>Uži krug</strong> - nakon odobrenja koordinatora, kompanija te može staviti u uži krug, status se mijenja i kompanija dalje pregleda prijavu.</> },
      { icon: 'x', text: <><strong>Odbijanje</strong> - prikazuje se na dashboardu, a ti se možeš prijaviti na druge oglase.</> },
    ],
    tip: { bg: '#fff6e8', color: '#9a5d08', icon: 'info', label: 'Napomena', text: 'Ova faza može trajati nekoliko dana dok kompanija pregleda sve pristigle prijave.' },
  },
  {
    label: 'Odobravanje',
    iconPath: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    iconBg: '#eaf4e0',
    iconColor: '#3a8c25',
    title: 'Kompanija odobrava praksu',
    desc: 'Nakon što te kompanija odabere za uži krug, ona odobrava ili odbija praksu. Ovo je administrativni korak koji formalizira proces.',
    details: [
      { icon: 'check', text: <><strong>Odobreno</strong> - kompanija potvrđuje praksu. Sada je na tebi da potvrdiš učešće.</> },
      { icon: 'clock', text: <><strong>Rok za potvrdu</strong> - imat ćeš određeni period da prihvatiš - ne propusti rok.</> },
      { icon: 'bell', text: <><strong>Notifikacija</strong> - dobit ćeš obavijest čim kompanija donese odluku.</> },
    ],
    tip: { bg: '#eaf4e0', color: '#2a6a18', icon: 'bulb', label: 'Savjet', text: 'Provjeri redovno dashboard i email kako ne bi propustio/la rok za potvrdu.' },
  },
  {
    label: 'Potvrda',
    iconPath: <><polyline points="20 6 9 17 4 12" /></>,
    iconBg: '#e6f7f1',
    iconColor: '#0e9e6e',
    title: 'Potvrdi učešće i preuzmi ugovor',
    desc: 'Potvrđuješ da prihvataš praksu. Sistem zatim automatski generiše ugovor o praksi koji možeš preuzeti.',
    details: [
      { icon: 'check', text: <><strong>Potvrda učešća</strong> - klikni "Prihvati praksu" u sekciji "Moje prijave" na dashboardu.</> },
      { icon: 'download', text: <><strong>Ugovor o praksi</strong> - sistem generiše PDF ugovor koji možeš preuzeti iz sekcije "Moje prakse" → dugme "Ugovor".</> },
      { icon: 'edit', text: <><strong>Tokom prakse</strong> - unosi dnevne aktivnosti klikom na "Aktivnosti", a kompanija vodi evidenciju prisustva.</> },
    ],
    tip: { bg: '#e6f7f1', color: '#0a6e4a', icon: 'pin', label: 'Gdje pronaći', text: 'Sidebar → "Moje prakse" → kartica prakse → dugmad "Ugovor" i "Aktivnosti".' },
  },
  {
    label: 'Evaluacija',
    iconPath: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
    iconBg: '#fff6e8',
    iconColor: '#c97a10',
    title: 'Ocijeni kompaniju nakon prakse',
    desc: 'Kada praksa završi, pored svake završene prakse u sekciji "Moje prakse" pojavljuje se dugme za evaluaciju kompanije.',
    details: [
      { icon: 'star', text: <><strong>Dugme "Evaluiraj kompaniju"</strong> - pojavljuje se samo kod praksi sa statusom "Završena". Nalazi se direktno na kartici prakse.</> },
      { icon: 'form', text: <><strong>Predefinisani formular</strong> - ocjenjuješ aspekte poput organizacije, mentorstva, radnog okruženja i preporuke drugima.</> },
      { icon: 'building', text: <><strong>Vidljivost</strong> - kompanija vidi tvoju evaluaciju. Pomažeš budućim studentima da donesu bolju odluku.</> },
    ],
    tip: { bg: '#fff6e8', color: '#9a5d08', icon: 'pin', label: 'Gdje pronaći', text: 'Sidebar → "Moje prakse" → pronađi završenu praksu → klikni "Evaluiraj kompaniju".' },
    mockupType: 'evaluate',
  },
  {
    label: 'Ocjene',
    iconPath: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></>,
    iconBg: '#f0eeff',
    iconColor: '#6d4ce1',
    title: 'Pogledaj evaluacije koje si dobio/la',
    desc: 'U sidebaru pod tabom "Primljene evaluacije" možeš vidjeti šta su kompanije napisale o tvom radu nakon završetka prakse.',
    details: [
      { icon: 'eye', text: <><strong>Tab "Primljene evaluacije"</strong> - u lijevom sidebaru dashboarda, ispod taba "Zatvoreni oglasi".</> },
      { icon: 'chart', text: <><strong>Ocjene po kriterijima</strong> - svaka evaluacija prikazuje ukupnu ocjenu, ocjene po kategorijama i opcionalni komentar mentora.</> },
      { icon: 'lock', text: <><strong>Privatnost</strong> - evaluacije vidiš samo ti i koordinator fakulteta.</> },
    ],
    tip: { bg: '#f0eeff', color: '#4e36b0', icon: 'pin', label: 'Gdje pronaći', text: 'Sidebar → tab "Primljene evaluacije" (ispod taba "Moje prakse").' },
    mockupType: 'received',
  },
];

function StepIcon({ path, extra, color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path}
      {extra}
    </svg>
  );
}

function DetailIcon({ type }) {
  const icons = {
    badge: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    filter: <><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    upload: <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    x: <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>,
    info: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>,
    download: <><polyline points="8 17 12 21 16 17" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" /></>,
    edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>,
    form: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
    building: <><rect x="3" y="9" width="18" height="12" /><polyline points="8 21 8 13 16 13 16 21" /><polyline points="3 9 12 3 21 9" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    chart: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    bulb: <><line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /></>,
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {icons[type] || icons.check}
    </svg>
  );
}

function EvaluateMockup() {
  return (
    <div className="pv-mockup">
      <div className="pv-mockup-tabs">
        <span className="pv-mockup-tab pv-mockup-tab--active">Završene</span>
        <span className="pv-mockup-tab">Aktivne</span>
        <span className="pv-mockup-tab">Primljene evaluacije</span>
      </div>
      <div className="pv-mockup-list">
        <div className="pv-mockup-row">
          <div className="pv-mockup-row-info">
            <span className="pv-mockup-company">TechCo d.o.o.</span>
            <span className="pv-mockup-title">Frontend developer praksa</span>
            <span className="pv-mockup-date">Jun – Aug 2025 · 3 mj.</span>
          </div>
          <div className="pv-mockup-actions">
            <span className="pv-mockup-badge pv-mockup-badge--done">Završena</span>
            <button className="pv-eval-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Evaluiraj kompaniju
            </button>
          </div>
        </div>
        <div className="pv-mockup-row pv-mockup-row--muted">
          <div className="pv-mockup-row-info">
            <span className="pv-mockup-company">Analytics Firm</span>
            <span className="pv-mockup-title">Data analyst praksa</span>
            <span className="pv-mockup-date">Feb – Apr 2025 · 2 mj.</span>
          </div>
          <div className="pv-mockup-actions">
            <span className="pv-mockup-badge pv-mockup-badge--done">Završena</span>
            <span className="pv-eval-sent">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Evaluacija poslana
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReceivedMockup() {
  return (
    <div className="pv-mockup">
      <div className="pv-mockup-tabs">
        <span className="pv-mockup-tab">Završene</span>
        <span className="pv-mockup-tab">Aktivne</span>
        <span className="pv-mockup-tab pv-mockup-tab--active">Primljene evaluacije</span>
      </div>
      <div className="pv-eval-card">
        <div className="pv-eval-card-header">
          <div>
            <span className="pv-mockup-company">TechCo d.o.o. - Frontend praksa</span>
            <div className="pv-eval-stars">
              {[1,2,3,4,5].map(n => (
                <svg key={n} width="14" height="14" viewBox="0 0 24 24"
                  fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
              <span className="pv-eval-score">5/5</span>
            </div>
          </div>
          <span className="pv-eval-date">Sep 2025</span>
        </div>
        <p className="pv-eval-comment">"Student je pokazao izuzetnu inicijativu i brzo usvajanje novih tehnologija."</p>
        <div className="pv-eval-tags">
          <span className="pv-eval-tag">Inicijativnost</span>
          <span className="pv-eval-tag">Timski rad</span>
          <span className="pv-eval-tag">Komunikacija</span>
        </div>
      </div>
    </div>
  );
}

export default function PrijavniVodic() {
  const [current, setCurrent] = useState(0);
  const step = steps[current];
  const total = steps.length;

  return (
    <div className="pv-wrap">
      <div className="pv-header">
        <div>
          <h2 className="pv-title">Kako se prijaviti na praksu?</h2>
          <p className="pv-subtitle">Vodič kroz cijeli proces - od prijave do evaluacije</p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="pv-progress" role="tablist" aria-label="Koraci vodiča">
        {steps.map((s, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Korak ${i + 1}: ${s.label}`}
            className={`pv-dot-wrap${i === current ? ' active' : ''}${i < current ? ' done' : ''}`}
            onClick={() => setCurrent(i)}
          >
            <div className="pv-dot">
              {i < current ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>
            <span className="pv-dot-label">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step card */}
      <div className="pv-card">
        <div className="pv-card-header">
          <div className="pv-icon" style={{ background: step.iconBg }}>
            <StepIcon path={step.iconPath} extra={step.iconExtra} color={step.iconColor} />
          </div>
          <div>
            <h3 className="pv-card-title">{step.title}</h3>
            <p className="pv-card-desc">{step.desc}</p>
          </div>
        </div>

        <div className="pv-details">
          {step.details.map((d, i) => (
            <div key={i} className="pv-detail-row">
              <span className="pv-detail-icon">
                <DetailIcon type={d.icon} />
              </span>
              <span className="pv-detail-text">{d.text}</span>
            </div>
          ))}
        </div>

        {step.tip && (
          <div className="pv-tip" style={{ background: step.tip.bg }}>
            <span className="pv-tip-icon" style={{ color: step.tip.color }}>
              <DetailIcon type={step.tip.icon} />
            </span>
            <div>
              <span className="pv-tip-label" style={{ color: step.tip.color }}>{step.tip.label}</span>
              <p className="pv-tip-text">{step.tip.text}</p>
            </div>
          </div>
        )}

        {step.mockupType === 'evaluate' && <EvaluateMockup />}
        {step.mockupType === 'received' && <ReceivedMockup />}
      </div>

      {/* Nav */}
      <div className="pv-nav">
        <button
          className="pv-btn pv-btn--secondary"
          onClick={() => setCurrent(c => c - 1)}
          disabled={current === 0}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Prethodni
        </button>

        <span className="pv-counter">Korak {current + 1} od {total}</span>

        {current < total - 1 ? (
          <button className="pv-btn pv-btn--primary" onClick={() => setCurrent(c => c + 1)}>
            Sljedeći
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        ) : (
          <button className="pv-btn pv-btn--primary" onClick={() => setCurrent(0)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4" />
            </svg>
            Počni ponovo
          </button>
        )}
      </div>
    </div>
  );
}