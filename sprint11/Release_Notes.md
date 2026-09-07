# Release Notes — PraksaHub v1.0

Ovaj dokument opisuje stanje sistema PraksaHub u trenutku finalne isporuke. Dokument jasno razlikuje ono što je stvarno isporučeno od onoga što je planirano ili razmatrano, ali nije ušlo u finalnu verziju. Uključuje i pregled poznatih ograničenja i bugova.

---

## 1. Šta je uključeno u finalnu verziju

PraksaHub v1.0 je kompletna web platforma za upravljanje studentskim praksama. Sistem pokriva cjelokupan životni ciklus prakse — od objave oglasa i prijave studenta, preko odobrenja, potpisivanja ugovora i praćenja realizacije, do evaluacije i završnog izvještavanja.

Razvoj je realizovan kroz šest sprintova (Sprint 5–10). Svih 53 stavki Product Backlog-a je implementirano i isporučeno.

### Pregled po release-ima

| Release | Fokus | Status |
|---------|-------|--------|
| Release 1 | Registracija, prijava, verifikacija, odobravanje naloga, oglasi, landing page | Isporučeno |
| Release 2 | Prijave na prakse, selekcija, koordinatorsko odobravanje, dashboard, notifikacije, favoriziranje, audit log | Isporučeno |
| Release 3 | Ugovor, evidencija aktivnosti, praćenje prisustva, evaluacije, izvještaji, automatsko završavanje prakse | Isporučeno |

---

## 2. Najvažnije funkcionalnosti

### Upravljanje korisnicima

- **Registracija i prijava** za četiri korisničke uloge: Student, Kompanija, Koordinator, Administrator
- **Verifikacija email adrese** — korisnik ne može pristupiti sistemu dok ne potvrdi email
- **Obnavljanje lozinke** putem email linka 
- **Odobravanje novih naloga** — koordinator odobrava studentske naloge, administrator odobrava kompanije i koordinatore
- **Uređivanje profila** za sve uloge
- **Deaktivacija i brisanje korisničkog računa**
- **Role-based pristup (RBAC)** — svaka uloga vidi isključivo sadržaj koji joj pripada

### Oglasi za praksu

- **Kreiranje, uređivanje i zatvaranje oglasa** od strane kompanije
- **Pregled javnih oglasa** dostupan bez prijave
- **Pretraga i filtriranje** po ključnoj riječi, lokaciji i tipu prakse
- **Upravljanje rokovima prijave** — oglas se automatski zatvara po isteku roka
- **Oznaka "Novo"** na svježe objavljenim oglasima
- **Favoriziranje oglasa** — student može sačuvati oglase od interesa
- **Arhiviranje zatvorenih oglasa** — pregled historije
- **Statistika prijava** po oglasu (broj prijava, raspodjela po odsjeku i godini studija)

### Tok prijave i selekcije

- **Prijava na praksu** s uploadom CV-a i motivacionog pisma (PDF, max 150 KB)
- **Ograničenje aktivnih prijava** po studentu 
- **Pregled i selekcija kandidata** od strane kompanije (statusi: na čekanju → u selekciji → odobrena/odbijena)
- **Potvrda prihvatanja prakse** od strane studenta
- **Odustajanje od prakse** — student može povući prijavu uz obavještenje svih strana
- **Student dashboard** — centralizovani pregled svih prijava i njihovih statusa

### Realizacija prakse

- **Automatsko generisanje ugovora** o praksi nakon potvrde studenta
- **Preuzimanje ugovora** u PDF formatu za studenta i kompaniju
- **Evidencija aktivnosti** — student unosi dnevne ili sedmične aktivnosti
- **Praćenje prisustva** — kompanija evidentira prisustvo studenta
- **Automatsko završavanje prakse** po isteku datuma 

### Evaluacije i izvještaji

- **Evaluacija studenta** od strane kompanije prema standardizovanom obrascu
- **Evaluacija kompanije** od strane studenta
- **Generisanje završnih izvještaja** — generiše se izvještaj o realizovanoj praksi

### Notifikacije i komunikacija

- **In-app notifikacije** o promjenama statusa prijave i prakse
- **Email notifikacije** putem Brevo servisa za ključne događaje: verifikacija, reset lozinke, promjena statusa prijave, završetak prakse

### Administrativne funkcionalnosti

- **Admin dashboard** za upravljanje svim korisničkim nalozima
- **Aktivacija i deaktivacija naloga** od strane administratora
- **Audit log** — evidencija svih ključnih administrativnih akcija u sistemu

### Korisničko iskustvo

- **Tamni režim (Dark Mode)**
- **Responsive dizajn** s podrškom za mobilne uređaje
- **Landing page** s prijavnim vodičem
- **Privacy Policy, Terms & Conditions i Cookies Policy** stranice

---

## 3. Tehnički stack

| Sloj | Tehnologija | Verzija |
|------|-------------|---------|
| Frontend | React (Vite) | React 18.3.1, Vite 5.4.8 |
| Backend | Node.js + Express | Express 4.21.2 |
| Baza podataka | PostgreSQL (Supabase Cloud) | Sequelize 6.37.3 ORM |
| Autentifikacija | JWT | jsonwebtoken 9.0.2 |
| File storage | Supabase Storage | @supabase/supabase-js 2 |
| Email servis | Brevo REST API | v3 |
| Upload fajlova | Multer | 2.1.1 |
| Testiranje | Jest + Supertest | Jest 29.7.0 |
| Deployment | Render (backend + frontend) | — |

**Broj testova:** ~963 unit testova i ~10 integracijskih test suitova, svi prolaze.

**CD Pipeline:** GitHub Actions — automatski pokreće testove i deploya na Render pri svakom pushu na `main` branch.

---

## 4. Poznata ograničenja

### Infrastrukturna ograničenja 

| ID | Ograničenje | Uticaj |
|----|-------------|--------|
| TL-01 | **Render cold start** — backend se gasi nakon 15 min. neaktivnosti; prvi zahtjev traje 30–60 s | Vidljivo kašnjenje pri prvom pristupu u danu |
| TL-02 | **Brevo email limit** — 500 emailova dnevno na besplatnom planu | Emailovi se ne šalju dok se limit ne resetuje (ponoć) ako je premašen |
| TL-03 | **Supabase Free Tier** — baza se pauzira nakon 1 sedmice neaktivnosti; storage limit 1 GB | Kratko kašnjenje pri reaktivaciji baze |


### Sigurnosna ograničenja

| ID | Ograničenje |
|----|-------------|
| SL-01 | JWT token čuvan u `sessionStorage` — ranjiv na XSS (mitigacija: `escapeHtml()` sanitizacija) |
| SL-02 | CORS nije ograničen na konkretne origine (prihvatljivo za razvoj, ne za produkciju) |
| SL-03 | Nema rate limitinga na API endpointima — moguć brute-force na login |
| SL-04 | Password reset link istječe za 30 minuta — korisnik koji kasno provjeri email mora tražiti novi link |


## 5. Poznati bugovi

### BUG-01 — Poruka uspjeha pri upravljanju kandidatima ne nestaje automatski

**Komponenta:** `KompanijaDashboard.jsx` — sekcija za pregled prijava  
**Opis:** Kada kompanija označi kandidata za uži krug ili donese odluku o prijavi (odobri/odbije), prikazuje se zelena poruka uspjeha (npr. "Kandidat je uspješno označen za uži krug."). Ta poruka ostaje vidljiva na ekranu sve dok kompanija ne poduzme novu akciju koja je briše. Ostatak aplikacije koristi `setTimeout` od 3 sekunde za automatsko nestajanje istovrsnih poruka.  
**Uticaj:** Poruka zauzima prostor u interfejsu i postoji nekonzistentnost sa ostatkom aplikacije.  
**Status:** Identificiran, nije popravljen.

---

### BUG-02 — Datum aktivnosti studenta prikazuje se u formatu ovisnom o browseru

**Komponenta:** `KompanijaDashboard.jsx` — modalni prozor "Aktivnosti studenta"  
**Opis:** Datumi evidentiranih aktivnosti u modalnom prozoru koji kompanija otvara za pregled aktivnosti studenta formatiraju se pozivom `toLocaleDateString()` bez eksplicitnog navođenja lokala. Cijela ostala aplikacija koristi `toLocaleDateString('bs-BA')`. Na browseru s engleskim ili drugim regionalnim postavkama datum se prikazuje u lokalnom formatu (npr. `6/9/2026` umjesto `9. 6. 2026`).  
**Uticaj:** Vizuelna nekonzistentnost — format datuma ovisi o postavkama korisnikovog browsera, a ne o postavkama aplikacije. Podaci su tačni, samo format varira.  
**Status:** Identificiran, nije popravljen.

---

### BUG-03 — Broj nepročitanih notifikacija se ne ažurira odmah nakon otvaranja panela

**Komponenta:** Navbar — ikona notifikacija  
**Opis:** Badge koji prikazuje broj nepročitanih notifikacija ne smanjuje se odmah nakon što korisnik otvori panel notifikacija i pregleda ih. Stranica se mora ručno osvježiti kako bi se prikazala ispravna vrijednost (0 ili ažurirani broj).  
**Uticaj:** Korisnik može misliti da postoje nepročitane notifikacije čak i nakon što ih je pregledao. Nikakvi podaci nisu ugroženi.  
**Status:** Identificiran, nije popravljen.

---

### BUG-04 — Tekst u polju za pretragu oglasa ostaje nakon resetiranja filtera

**Komponenta:** `ListingsPage.jsx` — traka za pretragu i filtriranje  
**Opis:** Kada korisnik unese tekst u polje za pretragu, a zatim klikne na dugme za reset/brisanje filtera, ostali filteri (lokacija, tip prakse) se resetuju na zadane vrijednosti, ali tekst u polju za pretragu ostaje vidljiv. Rezultati pretrage se ispravno osvježavaju, ali vizuelni prikaz polja nije konzistentan s primijenjenim filterima.  
**Uticaj:** Vizuelna nekonzistentnost — polje za pretragu izgleda kao da je filter još uvijek aktivan iako nije. Funkcionalni rezultati su ispravni.  
**Status:** Identificiran, nije popravljen.

---

## 6. Šta nije dio finalne isporuke

Sljedeće stavke su razmatrane ili djelimično postoje u kodu, ali **nisu isporučene** kao funkcionalne u finalnoj verziji:

### Funkcionalnosti koje nisu implementirane

| Stavka | Napomena |
|--------|----------|
| **Multi-jezik podrška** | Sistem je dostupan isključivo na bosanskom jeziku.|
| **Napredne statistike i grafikoni za koordinatora** | Osnovna statistika prijava po oglasu postoji; kompleksni grafikoni po trendovima nisu implementirani. |
| **Real-time chat** | Komunikacija između učesnika odvija se izvan sistema (email, telefon). |
| **Elektronski potpis ugovora** | Ugovor se generiše digitalno ali zahtijeva ručno printanje i potpisivanje. |
| **Refresh token mehanizam** | Sesija se ne obnavlja automatski; korisnik se mora ponovo prijaviti po isteku tokena. |
| **Rate limiting na API-ju** | Nema zaštite od brute-force napada na login endpoint. |
| **Antivirusna provjera uploadovanih fajlova** | PDF fajlovi se validiraju samo po MIME tipu, bez skeniranja sadržaja. |
| **Monitoring i error tracking** (Sentry, Datadog) | Greške su vidljive samo u Render konzoli. |

### Dijelovi koji postoje u kodu ali nisu potpuno završeni

| Stavka | Stanje |
|--------|--------|
| **Javni prikaz ocjene kompanije** | `EvaluacijaKompanije` model i servis su implementirani. Student može ostaviti ocjenu, ali agregatna ocjena kompanije **nije vidljiva** na listi oglasa niti na profilu kompanije. |
| **PDF format izvještaja** | Dugme "Preuzmi izvještaj (PDF)" postoji u koordinatorovom interfejsu, ali preuzeti fajl koristi isti mehanizam kao ugovor i prikazuje se kao plain text, nije formatiran kao izvještaj. |

