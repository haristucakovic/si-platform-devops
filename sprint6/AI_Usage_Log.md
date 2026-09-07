# AI Usage Log — Sprint 6

## Unos 9 — Implementacija Password Reset funkcionalnosti

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | tvoje_korisnicko_ime |
| **Svrha korištenja** | Implementacija funkcionalnosti obnavljanja lozinke |

**Kratak opis upita:**

> Potrebno je implementirati kompletan password reset flow za autentifikaciju korisnika. Funkcionalnost treba uključivati backend endpointe za zahtjev resetovanja lozinke i postavljanje nove lozinke, generisanje sigurnosnog tokena sa istekom važenja, slanje reset emaila putem Gmail SMTP servera, te frontend stranice za unos email adrese i postavljanje nove lozinke. Dizajn frontend stranica mora biti usklađen sa postojećim AuthPage izgledom i styling sistemom aplikacije.

---

**Šta je AI predložio ili generisao:**
- Backend implementaciju `forgotPasswordService` i `resetPasswordService`
- Generisanje reset tokena korištenjem `crypto.randomBytes`
- Logiku za expiry tokena (`passwordResetExpires`)
- Integraciju Gmail SMTP servera preko `nodemailer`
- `email.service.js` za slanje reset emailova
- Nove backend rute:
  - `POST /auth/forgot-password`
  - `POST /auth/reset-password`
- Frontend stranice:
  - `ForgotPasswordPage.jsx`
  - `ResetPasswordPage.jsx`

---

**Šta je tim prihvatio:**
- Kompletnu backend logiku za password reset
- Token-based reset pristup
- Gmail SMTP integraciju

---

**Šta je tim izmijenio:**
- Prilagođene poruke grešaka i validacije na bosanskom jeziku
- Usklađen frontend spacing i positioning sa postojećim `AuthPage.css`
- Refaktorisani frontend servisi da koriste postojeći `apiRequest` helper

---

**Šta je tim odbacio:**
- Direktno otkrivanje da li email postoji u sistemu (iz sigurnosnih razloga)
- Korištenje obične Gmail lozinke umjesto App Password pristupa

---

**Rizici, problemi ili greške:**
- Gmail SMTP autentifikacija inicijalno nije radila zbog potrebe za Google App Password konfiguracijom
- Merge konflikti nakon spajanja sa `develop` branchom zahtijevali ručno spajanje auth controller/service fajlova
- Potrebno ručno dodavanje novih kolona u Supabase bazu:
  - `passwordResetToken`
  - `passwordResetExpires`
- Reset token mora biti pravilno invalidiran nakon uspješne promjene lozinke

## Unos 10 — Implementacija registracije korisnika i upravljanja fakultetima

| Polje | Sadržaj |
|---|---|
| **Datum** | 06.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija registracije za studente, koordinatore i kompanije, te CRUD upravljanje fakultetima u admin panelu |

**Kratak opis upita:**

> Implementirati registraciju korisnika s tri tipa naloga: Student, Koordinator i Kompanija. Registracija treba biti u više koraka — odabir uloge, popunjavanje forme, opcionalni korak za opis kompanije. Forma treba imati validaciju, provjeru dostupnosti korisničkog imena i emaila u realnom vremenu, dropdown za odabir fakulteta, prihvatanje uslova korištenja i success korak s auto-redirectom. Backend treba kreirati korisnika i odgovarajući profil u transakciji. Admin panel treba dobiti sekciju za upravljanje fakultetima (dodaj, uredi, obriši).

**Šta je AI predložio ili generisao:**
- Kompletni `RegisterPage.jsx` — forma s komponentama `RoleSelect`, `FormStep`, `OpisStep`, `SuccessStep`; realno-vremenski `checkAvailability` s debounce od 500ms i vizuelnim indikatorima (spinner, checkmark, X); dropdown za fakultet; validacija svih polja; checkbox za uslove korištenja; auto-redirect nakon uspješne registracije
- Kompletni `RegisterPage.css` — dizajn forme, kartica uloga, polja s greškama, availability indikatora, success ekrana
- Backend `auth.service.js` — `register` funkcija koja pokriva sve tri uloge; transakcije za kreiranje `User` + `Student`/`Koordinator`/`Kompanija`; hashiranje lozinke; validacija emaila, lozinke, godine studija; provjera jedinstvenosti korisničkog imena i emaila; `checkAvailability` i `getPublicFaculties` funkcije
- Backend `auth.controller.js` i `auth.routes.js` — endpoint za registraciju, provjeru dostupnosti i dohvat fakulteta
- Frontend `auth.service.js` — `register`, `getPublicFaculties`, `checkAvailability` API pozivi
- Frontend `adminService.js` — `getFaculties`, `createFaculty`, `updateFaculty`, `deleteFaculty`
- Proširenje `AdminDashboard.jsx` — nova sekcija `FacultiesView` s formom za dodavanje fakulteta, tablicom s inline editovanjem i brisanjem
- Backend admin service/controller/routes — `getFaculties`, `createFaculty`, `updateFaculty`, `deleteFaculty` s validacijom i zaštitom od brisanja fakulteta koji ima vezane studente ili koordinatore

**Šta je tim prihvatio:**
- Cjelokupnu strukturu registracije
- Realno-vremensku provjeru dostupnosti s debounce logikom
- Transakcijsko kreiranje korisnika i profila na backendu
- Zaštitu od brisanja fakulteta koji ima vezane korisnike
- Dizajn i raspored `RegisterPage`

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 11 — Dodavanje odsjeka, kontakt osobe i upravljanja odsjecima (fix/missing-profile-fields)

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Dodavanje polja `odsjek` za studente i koordinatore, `kontaktOsoba` za kompanije, kreiranje `Odsjek` tabele i upravljanja odsjecima u admin panelu |

**Kratak opis upita:**

> Dodati polje `odsjek` (odsjek fakulteta) za studente i koordinatore, te polje `kontaktOsoba` za kompanije. Odsjek treba biti posebna tabela vezana za fakultet, a student/koordinator bira odsjek putem dropdowna pri registraciji. Dropdown se učitava dinamički nakon odabira fakulteta i nije obavezan. Admin treba moći upravljati odsjecima unutar upravljanja fakultetima. Polje `kontaktOsoba` je opcionalno tekstualno polje s italic placeholderom "Ime i prezime".

**Šta je AI predložio ili generisao:**
- Novi model `Odsjek.js` — tabela `odsjeci` s poljima `id`, `naziv`, `fakultetID`
- Dodavanje nullable kolone `odsjekID` (FK) u modele `Student` i `Koordinator`
- Dodavanje nullable kolone `kontaktOsoba` VARCHAR(150) u model `Kompanija`
- Ažuriranje `index.js` — registracija modela, 4 nove asocijacije (`Fakultet→Odsjek`, `Odsjek→Student`, `Odsjek→Koordinator`), eksport `Odsjek`
- Backend admin: `getOdsjeci`, `createOdsjek`, `deleteOdsjek` u service/controller/routes
- Backend public endpoint `GET /api/auth/faculties/:id/odsjeci` za dohvat odsjeka pri registraciji
- Ažuriranje `auth.service.js` — registracija studenta/koordinatora sada prima `odsjekID`, registracija kompanije prima `kontaktOsoba`
- Frontend `RegisterPage.jsx` — dropdown za odsjek koji se učitava nakon odabira fakulteta, poruka "Odsjeci još nisu dodani" ako fakultet nema odsjeka, polje `kontaktOsoba` s italic placeholderom
- Frontend `AdminDashboard.jsx` — `OdsjekPanel` komponenta unutar upravljanja fakultetima: expandabilni panel po redu, lista odsjeka s brisanjem, forma za dodavanje, dugme "Završi dodavanje"

**Šta je tim prihvatio:**
- Kompletnu arhitekturu `Odsjek` tabele vezane za `Fakultet`
- `odsjekID` kao nullable FK na `Student` i `Koordinator` (ne briše postojeće podatke)
- `kontaktOsoba` kao nullable polje na `Kompanija`
- Odluku da se `fakultetID` zadrži na `Student` i `Koordinator` radi kompatibilnosti s postojećim kodom
- Odsjek dropdown kao opcionalan u registraciji
- UX odluku da odsjeci budu upravljani unutar admin panela za fakultete, a ne kao zasebna sekcija

**Šta je tim izmijenio:**

**Šta je tim odbacio:**
- Inicijalni prijedlog jednostavnog VARCHAR polja za odsjek — odbačeno jer ne omogućava konzistentnost između studenata i koordinatora istog odsjeka

**Rizici, problemi ili greške:**
- `getPublicOdsjeci` funkcija dodana u `auth.service.js` ali zaboravljena u `module.exports` — uhvaćeno tokom provjere prije pokretanja, riješeno odmah
- `ECONNRESET` greška pri prvom pokretanju servera — Supabase je prekinuo konekciju tokom `sync({ alter: true })` koji izvršava više `ALTER TABLE` naredbi zaredom; riješeno ponovnim pokretanjem

## Unos 12 — Implementacija test suite-a za backend

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Pisanje unit, mock i integracijskih testova za auth i admin module |

**Kratak opis upita:**

> Napisati kompletni test suite za backend koristeći Jest i Supertest. Pokriti auth i admin module sa tri nivoa testiranja: unit testovi za middleware i service funkcije, mock testovi za route/controller sloj (bez prave baze), i integracijski testovi koji koriste pravu Supabase bazu.

npr.
PATCH /api/admin/users/:id/role (body: role)
- 200: findByPk vraća korisnika, body { role:'COORDINATOR' } → status 200, res.body.user.role='COORDINATOR', save() pozvan
- 200: body { role:'admin' } → res.body.user.role='ADMIN'
- 400: body {} → status 400, message matcha /role/i
- 400: body { role:'SUPERADMIN' } → status 400
- 400: id='abc' → status 400
- 400: id=-1 → status 400
- 404: findByPk vraća null → status 404, message matcha /not found/i


loginService(identifier, password):
- throws: findOne vraća null → 'Pogrešno korisničko ime/e-mail ili lozinka.'
- throws: user.status='DEACTIVATED' → 'Vaš nalog je deaktiviran...'
- throws: user.status='PENDING' → 'Vaš nalog još nije aktivan...'
- throws: bcrypt.compare=false → 'Pogrešno korisničko ime/e-mail ili lozinka.'
- OK: bcrypt.compare=true, jwt.sign='mocked.jwt.token' → { token, user bez passwordHash }
- OK: jwt.sign pozvan s { id:42, role:'ADMIN' } i 'test-secret'
- DEACTIVATED provjera PRIJE bcrypt → bcrypt.compare nije pozvan
- PENDING provjera PRIJE bcrypt → bcrypt.compare nije pozvan

**Šta je AI predložio ili generisao:**
- 8 test fajlova: `auth.middleware.test.js`, `rbac.middleware.test.js`, `auth.service.test.js`, `admin.service.test.js`, `auth.routes.test.js`, `admin.routes.test.js`, `auth.routes.integration.test.js`, `admin.routes.integration.test.js`
- `jest.config.js` i konfiguraciju `package.json` s dva odvojena skripta: `npm test` (bez baze) i `npm run test:integration` (s bazom)
- Ukupno 143 testa

**Šta je tim prihvatio:**
- Kompletnu strukturu testova i podjelu na mock/unit/integration
- Sve test fajlove bez izmjena

**Šta je tim izmijenio:**
- Ništa strukturalno — samo ispravke mock helpera (`emailVerifikovan`, `approvalStatus`) nakon što je tim dodao nova polja u servise

**Šta je tim odbacio:**
- Nekoliko redundantnih testova u `admin.service.test.js` koji su bili pokriveni i u route testovima

**Rizici, problemi ili greške:**
- Nakon dva git pull-a tim je dodao nove provjere (`emailVerifikovan`, `approvalStatus`) u servise, što je srušilo 6-7 testova — zahtijevalo ažuriranje mock helpera
- Integracijski testovi zahtijevaju `.env` s DB kredencijalima — ne mogu ih pokrenuti svi članovi tima

## Unos 13 — Implementacija login funkcionalnosti (frontend + backend)

| Polje | Sadržaj |
|---|---|
| **Datum** | 03.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija kompletne login funkcionalnosti za četiri korisničke uloge (STUDENT, COMPANY, COORDINATOR, ADMIN) — login stranica, validacija kredencijala, JWT autentifikacija, RBAC middleware, preusmjeravanje prema ulozi |

**Kratak opis upita:**

> Implementirati login funkcionalnost za web aplikaciju PraksaHub. Potrebno je kreirati jedinstvenu login stranicu s koje se svi korisnici prijavljuju, implementirati validaciju kredencijala koja sprječava neispravne podatke, te preusmjeriti korisnike na odgovarajuće dashboarde prema njihovoj ulozi. Dashboardi koji još nisu implementirani zamjenjuju se privremenim (dummy) stranicama. Uz to, uspostaviti dijeljeni CSS sistem tokena (design tokens) za konzistentnost dizajna, te implementirati backend autentifikaciju putem JWT tokena i RBAC middleware.

---

**Šta je AI predložio ili generisao:**

- `frontend/src/styles/variables.css` — dijeljeni CSS design tokens (boje, fontovi, razmaci, sjene, radijusi) izvučeni iz postojećeg `AdminDashboard.css` radi konzistentnosti
- `frontend/src/pages/AuthPage.jsx` — login stranica s dvopanelnim layoutom (branding panel + forma), SVG ikonama, validacijom, spinner animacijom, prikazom grešaka i role chip indikatorima
- `frontend/src/pages/AuthPage.css` — stilovi za login stranicu koji koriste CSS varijable iz `variables.css`
- `frontend/src/context/AuthContext.jsx` — proširenje konteksta s `login()` i `logout()` funkcijama, čuvanje sesije u `sessionStorage`
- `frontend/src/services/auth.service.js` — fetch wrapper za `POST /api/auth/login` s bosanskim porukama greške
- `frontend/src/routes/index.jsx` — dodavanje ruta za dashboarde po ulozi (`/dashboard/student`, `/dashboard/company`, `/dashboard/coordinator`)
- `frontend/src/pages/StudentDashboard.jsx`, `KompanijaDashboard.jsx`, `KoordinatorDashboard.jsx` — privremene dummy stranice
- `frontend/src/modules/auth/ProtectedRoute.jsx` — komponenta za zaštitu ruta prema ulozi; neautentificirani korisnici se preusmjeravaju na `/auth`, korisnici s pogrešnom ulogom na `/`
- `backend/src/business/services/auth.service.js` — poslovna logika prijave: pretraga korisnika po usernamu ili emailu, provjera statusa naloga, bcrypt verifikacija lozinke, potpisivanje JWT tokena
- `backend/src/business/controllers/auth.controller.js` — HTTP sloj: validacija tijela zahtjeva, poziv servisa, mapiranje grešaka na HTTP statuse
- `backend/src/middleware/auth.middleware.js` — `authenticate` middleware: verifikacija Bearer tokena, postavljanje `req.user`
- `backend/src/middleware/rbac.middleware.js` — `authorize(...roles)` middleware: provjera uloge prijavljenog korisnika
- `backend/src/presentation/routes/auth.routes.js` — `POST /api/auth/login` ruta
- Upute za CommonJS konverziju svih generisanih fajlova (projekat ne koristi ES Module sintaksu)
- Upute za ispravku `admin.routes.js` — destrukturiranje `{ authenticate }` i `{ authorize }` umjesto importa cijelog modula
- Izmjene u `LandingPage.jsx` — prikaz imena korisnika i dugmeta "Odjavi se" u navbaru kada postoji aktivna sesija, sa preusmjeravanjem na odgovarajući dashboard

---

**Šta je tim prihvatio:**

- Kompletnu arhitekturu login toka (frontend + backend)
- Dijeljeni `variables.css` sistem tokena
- `AuthContext` s `sessionStorage` persistencijom
- JWT autentifikaciju i RBAC middleware
- `ProtectedRoute` komponentu smještenu u `modules/auth/`
- Bosanske poruke grešaka na svim slojevima
- Prikaz korisničkog imena i dugmeta "Odjavi se" u navbaru landing pagea

---

**Šta je tim izmijenio:**

- Pozicioniranje `ROLE_ROUTES` konstante premješteno na nivo modula u `LandingPage.jsx` (bilo greškom definirano unutar `AreasCarousel` komponente što je uzrokovalo bijeli ekran)
- Stilizacija dugmeta "Odjavi se" usklađena s postojećim `btnOutline` stilom iz landing pagea

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**

- `Failed to fetch` greška u browseru uzrokovana nepokrenuti backend serverom — nije bila greška u kodu
- `DB_URL undefined` greška pri pokretanju — `dotenv.config()` nije bio pozvan prije učitavanja `db.js`; riješeno premještanjem `require('dotenv').config()` na vrh `app.js`
- `Router.use() requires a middleware function` greška u `admin.routes.js` — stari placeholder middleware exportovao je funkciju direktno, dok novi exportuje named export; riješeno destrukturiranjem `{ authenticate }` i `{ authorize }` pri importu
- `bcrypt` modul nije bio instaliran — riješeno pokretanjem `npm install bcrypt@5 jsonwebtoken` u `backend/` direktoriju
- `ROLE_ROUTES` nedostupan u scope-u `LandingPage` komponente jer je bio definisan unutar `AreasCarousel` — uzrokovalo bijeli ekran; riješeno izvlačenjem na nivo modula


---

## Unos 14 — Dopuna postojećeg backend test suite-a nedostajućim unit i route testovima

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | Codex / ChatGPT |
| **Ko je koristio** | haristucakovic |
| **Svrha korištenja** | Dopuna postojećeg backend test suite-a nedostajućim unit i route testovima |

**Kratak opis upita:**

> Potrebno je dopuniti postojeći backend test suite bez izmjene produkcijskog koda. Fokus je na dodavanju nedostajućih testova za auth rute i servise, approval workflow rute i servise, te placeholder endpoint. Testovi trebaju pokriti public odsjek endpoint, email verification, resend verification email funkcionalnost, approval tok i placeholder rutu.

**Šta je AI predložio ili generisao:**
- Dopunu `auth.routes.test.js` testovima za:
  - public odsjek endpoint
  - verify-email endpoint
  - resend-verification-email endpoint
- Dopunu `auth.service.test.js` testovima za:
  - public odsjek servisnu logiku
  - email verification servisnu logiku
  - resend verification email servisnu logiku
- Nove/dopunjene testove za approval workflow u:
  - `approval.routes.test.js`
  - `approval.service.test.js`
- Dopunu `placeholder.routes.test.js` testovima za placeholder endpoint

**Šta je tim prihvatio:**
- Dodavanje nedostajućih auth route i service testova
- Dodavanje approval workflow route i service testova
- Dodavanje placeholder endpoint testova

**Šta je tim izmijenio:**
- Ručno su dorađene poruke i očekivani rezultati u testovima radi usklađivanja sa stvarnim ponašanjem aplikacije

**Šta je tim odbacio:**
- Redundantne test slučajeve koji nisu potrebni za konkretan test slučaj

**Rizici, problemi ili greške:**
- Promjene su ograničene na testove, tako da nije bilo rizika za produkcijsku logiku.

  ---
  ## Unos 15 — Implementacija email verifikacije i odobravanja korisnika

| Polje | Sadržaj |
|---|---|
| **Datum** | 07.05.2026 |
| **Sprint broj** | 6 |
| **Alat** | ChatGPT (GPT-5, OpenAI) i Cursor|
| **Ko je koristio** | aglamoc1 |
| **Svrha korištenja** | Implementacija email verifikacije i odobravanja korisničkih računa |

### Kratak opis upita

> Potrebno je implementirati email verifikaciju nakon registracije korisnika i sistem odobravanja korisničkih računa od strane admina. Korisnik nakon registracije treba potvrditi email adresu putem verifikacijskog linka, nakon čega prelazi u PENDING status i ne može se prijaviti dok račun ne bude odobren. Admin dashboard treba sadržavati sekciju za pregled zahtjeva, detalje korisnika i approve/reject akcije sa slanjem email obavijesti.

---

### Šta je AI predložio ili generisao

- Generisanje verifikacionog tokena za email i slanje verifikacionog linka korisniku
- Backend logiku za verifikaciju email adrese i prelazak korisnika u fazu čekanja odobrenja
- Status-based autentifikaciju korisnika (blokada prijave dok email nije verifikovan i nalog nije odobren)
- Approve/reject workflow za administratore, sa evidencijom ko je i kada izvršio akciju
- Slanje email obavještenja korisniku nakon odobrenja ili odbijanja zahtjeva
- Admin dashboard funkcionalnosti za pregled i obradu zahtjeva korisnika

---

### Šta je tim prihvatio

- Kompletnu logiku verifikacije email adrese
- Workflow odobravanja/odbijanja korisnika nakon verifikacije
- Statusnu kontrolu prijave korisnika
- Email notifikacije za ključne promjene statusa naloga

---

### Šta je tim izmijenio

- Poruke grešaka i statusa lokalizovane na bosanski jezik
- UI prikaz pending i overdue korisnika u admin panelu
- Frontend API pozive refaktorisao tako da koriste postojeće servisne metode i strukturu projekta

---

### Šta je tim odbacio

- Automatsko odobravanje korisnika odmah nakon verifikacije emaila
- Mogućnost prijave korisnika dok je nalog u `PENDING` stanju

---

### Rizici, problemi ili greške

- Povremeni problemi sa SMTP konfiguracijom i isporukom verifikacionih emailova
- Merge konflikti prilikom integracije auth i admin funkcionalnosti
- Potreba za migracijama baze zbog novih polja za verifikaciju i odobravanje korisnika
- Moguć dupli poziv verifikacije, što može dati poruku “neispravan token” iako je prvi poziv uspio

---

## Unos 16 — Implementacija funkcionalnosti kreiranja oglasa za praksu

| Polje | Sadržaj |
|---|---|
| **Datum** | 12.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | ChatGPT (GPT-5, OpenAI) i Cursor |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Implementacija funkcionalnosti kreiranja oglasa za praksu od strane kompanije |

---

### Kratak opis upita

> Potrebno je implementirati funkcionalnost kreiranja oglasa za praksu unutar kompanija dashboarda. Kompanija treba moći unijeti naziv pozicije, opis, potrebne vještine, trajanje, rok prijave i maksimalan broj studenata. Backend treba validirati podatke i sačuvati oglas u bazi, dok frontend treba omogućiti formu sa validacijom i prikaz poruka o uspjehu ili grešci.

---

### Šta je AI predložio ili generisao

- Strukturu modela za oglas (naziv, opis, trajanje, rok prijave, broj mjesta, status)
- Backend rutu i kontroler za kreiranje oglasa
- Validaciju ulaznih podataka (obavezna polja, datum u budućnosti, broj mjesta > 0)
- Povezivanje oglasa sa kompanijom putem companyId
- Frontend formu sa kontrolisanim inputima (useState)
- Prikaz success/error poruka nakon kreiranja oglasa
- Predloženu organizaciju servisnog sloja za API komunikaciju

---

### Šta je tim prihvatio

- Strukturu backend rute i servisne logike
- Validaciju podataka na backendu
- Osnovnu strukturu frontend forme
- Prikaz poruka o uspješnom kreiranju oglasa

---

### Šta je tim izmijenio

- Nazive polja prilagodio postojećoj strukturi baze
- Validacione poruke lokalizovao na bosanski jezik
- Refaktorisao API pozive da prate postojeću layered arhitekturu projekta
- Prilagodio UI dizajn postojećem dashboard stilu

---

### Šta je tim odbacio

- Automatsko objavljivanje oglasa bez pregleda (dodana mogućnost statusa DRAFT)
- Generički error handler predložen od strane AI-ja, jer projekat već koristi centralizovani middleware za obradu grešaka

---

### Rizici, problemi ili greške

- Merge konflikti sa postojećim dashboard izmjenama
- Mogućnost slanja nevalidnog datuma zbog različitih timezone postavki
- Potencijalno dupliranje oglasa ako korisnik više puta klikne submit
- Neusklađenost frontend i backend validacije u početnoj fazi implementacije

---
