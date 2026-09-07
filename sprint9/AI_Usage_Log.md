# AI Usage Log — Sprint 5, 6, 7, 8

---

## Unos 1 — Inicijalna implementacija Admin Dashboard (US-9)

| Polje | Sadržaj |
|---|---|
| **Datum** | 26.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Implementacija US-9 — admin dashboard |

**Kratak opis upita:**

# Implementacija US-9 — Admin Dashboard


Implementiraj Admin dashboard
Stack: React (frontend) + Node.js/Express (backend) + PostgreSQL (`pg`).  
Autentifikacija i JWT se **ne implementiraju** u ovom koraku.

---

## Baza podataka

Kreirati tabelu `users` sa sljedećim poljima:

| Polje | Tip | Napomena |
|---|---|---|
| `id` | SERIAL PRIMARY KEY | |
| `name` | VARCHAR(100) | NOT NULL |
| `email` | VARCHAR(150) | NOT NULL UNIQUE |
| `role` | ENUM | STUDENT, COMPANY, COORDINATOR, ADMIN |
| `status` | ENUM | PENDING, ACTIVE, DEACTIVATED |
| `institution` | VARCHAR(150) | nullable |
| `created_at` | TIMESTAMP | DEFAULT NOW() |

Dodati seed podatke koji pokrivaju sve kombinacije rola i statusa.

---

## Backend

### Rute

**`GET /api/admin/users`**  
Vraća sve korisnike. Podržava opcionalni query param `?status=pending` za filtriranje.

**`PATCH /api/admin/users/:id/role`**  
Mijenja role korisnika. Body: `{ "role": "COORDINATOR" }`. Validira da je proslijeđeni role jedna od dozvoljenih enum vrijednosti.

**`PATCH PATCH /api/admin/users/:id/status`**
Promijeni status korisnika `(ACTIVE / DEACTIVATED)`

---

## Frontend

Kreirati `AdminDashboard.jsx` i `AdminDashboard.css` sa sljedećim elementima:

- **Sidebar navigacija** sa stavkama: Pregled, Korisnici, Odobravanje, Audit log, Statistike
- **Tablica korisnika** — kolone: ime, email, role, status, institucija, datum registracije, dropdown za promjenu role
- **Filter** — dropdown za filtriranje tablice po statusu (svi / pending / active / deactivated)
- **Pending odobravanje** — lista korisnika sa statusom PENDING, dugmad Odobri / Odbij po redu
- **Audit log** — statični mock podaci, funkcionalna logika dolazi u Sprint 9 (US #51)
- **Dodjela admin pristupa** — forma s poljem za email i dugmetom za dodjelu ADMIN role
- Toast notifikacija nakon svake akcije (uspjeh / greška)
- Loading state dok se podaci učitavaju
**Šta je AI predložio ili generisao:**
- Backend: `admin.controller.js`, `admin.service.js`, `admin.routes.js`, `User.js` model, konekcija na bazu
- Frontend: kompletni `AdminDashboard.jsx` (464 linije) i `AdminDashboard.css` (528 linija) sa sidebar navigacijom, tablicom korisnika, pending odobravanjem, audit logom i mock podacima

**Šta je tim prihvatio:**
Prihvaćeni su dizajn layouta, karitca i sidebara

**Šta je tim izmijenio:**
Raspored kartica (zauzimaju sav slobodan prstor) i usklađen css sa već posotjećim (nijanse i boje)

**Šta je tim odbacio:**


**Rizici, problemi ili greške:**
privremeno se koriste mock podaci pošto je audit log odvojeni US


---

## Unos 2 — Popravka admin dashboard logike

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Ispravka grešaka u toku odobravanja admin korisnika |

**Kratak opis upita:**

> Admin korisnici koji imaju PENDING status pojavljuju se u listi koordinatora na čekanju. Forma za dodjelu admin role šalje samo toast poruku bez pozivanja API-ja, pa korisnik ostaje PENDING. Traži se uklanjanje admina iz pending liste i funkcionalna forma za dodjelu role.

**Šta je AI predložio ili generisao:**
- Filtriranje `role !== 'ADMIN'` pri učitavanju pending korisnika (`AdminDashboard.jsx`, linija 92)
- Novu funkciju `handleAssignAdmin(email)` koja dohvata sve korisnike, pronalazi korisnika po emailu, poziva `updateUserRole(id, 'ADMIN')` i `updateUserStatus(id, 'ACTIVE')`, te uklanja korisnika iz pending liste
- Inicijalno je predložio i brisanje sekcije "Dodjela admin pristupa" iz UI-ja

**Šta je tim prihvatio:**
- Filtriranje ADMIN korisnika iz pending liste
- Funkcionalnu `handleAssignAdmin` funkciju koja stvarno poziva API

**Šta je tim izmijenio:**
- Ništa — logika prihvaćena kako je generisana

**Šta je tim odbacio:**
- Brisanje sekcije "Dodjela admin pristupa" (forme za unos emaila) — tim želi zadržati UI element za dodjelu admin role

**Rizici, problemi ili greške:**
- AI je inicijalno pogrešno interpretirao zahtjev i uklonio formu koju korisnik želi zadržati — korekcija zahtijevala dodatni krug komunikacije
- `handleAssignAdmin` dohvata sve korisnike kako bi pronašao korisnika po emailu — efikasnije bi bilo imati dedicated backend endpoint koji prima email direktno (tehnički dug)

---

## Unos 3 — Implementacija pravne dokumentacije (Privacy Policy, Terms & Conditions, Cookie Policy)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | ChatGPT (GPT‑5, OpenAI) |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Generisanje i strukturisanje pravne dokumentacije za aplikaciju |

**Kratak opis upita:**

> Potrebno je generisati inicijalne verzije dokumenata Privacy Policy, Terms & Conditions i Cookie Policy za web aplikaciju. Dokumenti trebaju sadržavati standardne pravne sekcije (obrada podataka, prava korisnika, odgovornosti, ograničenje odgovornosti, kolačići, izmjene uslova itd.) i biti povezani sa landing page-om.

---

**Šta je AI predložio ili generisao:**
- Kompletan nacrt Privacy Policy dokumenta sa standardnim sekcijama (prikupljanje podataka, svrha obrade, prava korisnika, sigurnost podataka)
- Kompletan nacrt Terms & Conditions dokumenta (prava i obaveze korisnika, ograničenje odgovornosti, izmjene uslova)
- Kompletan nacrt Cookie Policy dokumenta (tipovi kolačića, svrha korištenja, upravljanje kolačićima)
- Prijedlog strukture stranica i način povezivanja dokumenata sa landing page-om
- Inicijalni frontend prikaz dokumenata

---

**Šta je tim prihvatio:**
- Tekstualni sadržaj i strukturu svih dokumenata
- Organizaciju sekcija i pravni stil pisanja
- Način povezivanja dokumenata sa landing page-om

---

**Šta je tim izmijenio:**
- Prilagodio specifične informacije vezane za projekat (naziv aplikacije, tip podataka koji se prikupljaju, kontakt podaci)
- Poboljšao frontend izgled jer predloženi dizajn nije bio estetski usklađen sa ostatkom aplikacije
- Uskladio CSS (boje, nijanse, spacing, raspored sekcija) sa postojećim vizuelnim identitetom sistema

---

**Šta je tim odbacio:**
- Originalni vizuelni prijedlog prikaza dokumenata koji se nije uklapao u postojeći UI dizajn
- Generičke formulacije koje nisu bile relevantne za stvarne funkcionalnosti aplikacije

---

**Rizici, problemi ili greške:**
- Potencijalna generičnost pravnih formulacija
- Rizik od pravno nedovoljno preciznih izraza — svi dokumenti su ručno pregledani i prilagođeni prije implementacije
- AI dizajn prijedlog nije bio u skladu sa postojećim frontend stilom, što je zahtijevalo dodatno ručno prilagođavanje

---

## Unos 4 — Inicijalna implementacija Landing page (US-41)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-41 — početna stranica (Landing page) |

**Kratak opis upita:**

> Implementirati landing page za sistem za upravljanje studentskim praksama. Stack: React frontend sa React Router DOM. Stranica treba biti edukativnog karaktera, s plavo-bijelom temom. Navigacijska traka treba sadržavati logo, navigacijske linkove, ikonicu za tamni režim te dugmad za prijavu i registraciju. Sekcije: hero, kako funkcioniše, za studente, za kompanije, pregled uloga (student, kompanija, koordinator, administrator) i footer. Sve ikone trebaju biti outline/stroke stil.

---

**Šta je AI predložio ili generisao:**
- Kompletan `LandingPage.jsx` s inline stilovima (bez zasebnog CSS fajla)
- Fiksni navbar s blur efektom pri scrollovanju, smooth scroll na sekcije, placeholder dugme za tamni režim i search bar
- Hero sekcija s gradijentnim naslovom, dva CTA dugmeta i karticom desno 
- Sekcija "Kako funkcioniše" s 4 koraka (01–04)
- Sekcija "Za studente" s listom funkcionalnosti i 4 feature kartice
- Sekcija "Za kompanije" s 4 value prop kartice
- Sekcija "Ko koristi platformu" s karticama po ulogama (Student, Kompanija, Koordinator, Administrator)
- CTA sekcija i footer s kolonama linkova
- Sve SVG ikone kao inline React komponente (outline stil)

---

**Šta je tim prihvatio:**
- Cjelokupnu strukturu i raspored sekcija
- Dizajn navbara, footer i sekcija
- Inline SVG ikone outline stila
- Plavo-bijelu temu s ljubičastim akcentima

---

**Šta je tim izmijenio:**
- Dodan vlastiti logo umjesto generiranog logotipa
- Promijenjeni pojedini tekstovi i opisi sekcija
- Sitne korekcije boja i razmaka
- Stavljena fiksna boja navbar-a

---

**Šta je tim odbacio:**
- Prva verzija kartice u hero sekciji prikazivala je konkretan mock oglas ("Frontend Developer Praksa, TechCorp") - odbačeno jer oglasi još nisu implementirani
- Footer je inicijalno sadržavao FAQ i Kontakt linkove - odbačeno jer te stranice nisu planirane u user storyjima

---

**Rizici, problemi ili greške:**
- Browser defaultni `margin: 8px` na `<body>` uzrokovao bijeli prostor oko rubova - riješeno dodavanjem CSS reseta u `index.html`
- Potrebno je dodati `box-sizing: border-box` i `overflow-x: hidden` globalno

---

## Unos 5 — Iterativne izmjene Landing page dizajna

| Polje | Sadržaj |
|---|---|
| **Datum** | 27.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Poboljšanje i korekcija landing page komponenti |

**Kratak opis upita:**

> Niz iterativnih izmjena na landing pageu: ukloniti konkretni mock oglas iz hero kartice, ukloniti search bar iz navbara, zamijeniti sve emoji ikone s outline SVG ikonama, ukloniti mock dashboard kompanije, popraviti navigacijske linkove da koriste smooth scroll, zamijeniti `<a href>` s `<Link>` iz react-router-dom, promijeniti hero karticu u areas carousel.

---

**Šta je AI predložio ili generisao:**
- Uklanjanje search bara iz navbara, predloženo stavljane na ListingsPage
- Redesign hero kartice: areas carousel s 6 oblasti
- Areas carousel komponenta (`AreasCarousel`) s auto-advance svakih 3s, fade/slide animacijom, dot indikatorima i prev/next strelicama
- Oblasti: Programiranje & IT, Medicina, Biznis & Marketing, Inženjering, Dizajn & Kreativa, Pravo & Uprava - svaka s ikonom, bojom i primjerima pozicija
- Zamjena svih `<a href>` linkova s `<Link to>` iz react-router-dom
- Fluid width: `maxWidth: "min(1320px, 92vw)"` umjesto fiksnog `1100px`
- Administrator kartica bez CTA dugmeta ("Interno kreiranje naloga")

---

**Šta je tim prihvatio:**
- Areas carousel kao finalno rješenje za hero karticu
- Fluid width za sve sekcije
- `<Link>` umjesto `<a href>` za sve interne rute
- Administrator kartica bez dugmeta za registraciju

---

**Šta je tim izmijenio:**
- Rute promijenjene iz `/oglasi` u `/listings` radi usklađivanja s postojećim `App.jsx` rutama

---

**Šta je tim odbacio:**
- Status tracker mock (zamijenjen carousel-om)
- "Zašto PraksaHub?" lista u hero kartici

---

**Rizici, problemi ili greške:**
- `maxWidth: 1100` ostavljao previše bijelog prostora na velikim monitorima - riješeno fluid width pristupom

---

## Unos 6 — Korekcije footera i navbara

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Usklađivanje redosljeda navigacije i footer linkova |

**Kratak opis upita:**

> Uskladiti redosljed linkova u navbaru s redoslijedom sekcija na stranici. Footer linkove koji vode na sekcije pretvoriti u scroll dugmad umjesto `<Link>` komponenti. Pravno sekcija treba voditi na `/terms`, `/privacy`, `/cookies`.

---

**Šta je AI predložio ili generisao:**
- Novi redosljed `NAV_LINKS`: Kako funkcioniše → Za studente → Za kompanije → O platformi
- Footer refaktor: novi format linkova s `type: "scroll"` i `type: "route"` distinkcijom
- Scroll linkovi rendiraju se kao `<button onClick={() => scrollToSection(target)}>` 
- Route linkovi rendiraju se kao `<Link to={target}>`

---

**Šta je tim prihvatio:**
- Novi redosljed navbara
- Distinkcija scroll vs route linkova u footeru

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**
- Miješanje starog formata `[label, to]` i novog formata `{ label, type, target }` u footer `.map()` uzrokovalo `TypeError: object is not iterable` - riješeno kompletnom zamjenom bloka koda

---

## Unos 7 — Responzivnost landing pagea za mobilne uređaje

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Prilagodba landing pagea za mobilne i tablet uređaje |

**Kratak opis upita:**

> Implementirati responzivnost landing pagea za manje uređaje. Navbar treba imati hamburger meni koji otvara/zatvara navigacijski drawer. Sve sekcije trebaju biti raspoređene vertikalno (jedno ispod drugog) umjesto grid layouta. Sekcija "Za kompanije" na landing page-u treba imati "invisible badge" koji je vidljiv samo u mobilnoj verziji na vrhu kartice. Carousel oblasti treba ispravno funkcionirati na touch uređajima.

---

**Šta je AI predložio ili generisao:**
- Hamburger ikonica u navbaru koja se prikazuje na manjim ekranima, zamjenjuje desktop navigacijske linkove
- Mobile drawer navigacija s overlay-om koji se zatvara klikom izvan menija
- CSS media queries (ili inline `window.innerWidth` provjere) za prelaz iz grid u flex/column layout
- Sve sekcije (hero, za studente, za kompanije, uloge) prelaze na jednu kolonu na mobilnom
- "Invisible badge" za kompaniju - vidljiv samo na mobilnoj verziji iznad kartice Za kompanije sekcije
- Prilagodba paddinga za manje ekrane

---

**Šta je tim prihvatio:**
- Hamburger meni i mobile drawer navigacija
- Vertikalni raspored svih sekcija na mobilnom
- Mobile badge za kompaniju

---

**Šta je tim izmijenio:**
- Vizuelne korekcije drawer menija

---

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 8 — Dark mode za AdminDashboard i pravne stranice; ikonica za tamni režim

| Polje | Sadržaj |
|---|---|
| **Datum** | 29.04.2026 |
| **Sprint broj** | 5 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Proširenje dark mode podrške na AdminDashboard i pravne stranice; zamjena placeholder dugmeta za tamni režim ikonom sunca/mjeseca |

**Kratak opis upita:**

> Implementirati dark mode na `AdminDashboard` stranici koji se sinkronizira s landing pageom putem `ThemeContext` - promjena teme na jednoj stranici treba biti vidljiva i na drugoj, a stanje se čuva u `localStorage`. Pored toga, uskladiti CSS dizajn pravnih stranica (`PrivacyPolicy`, `TermsAndConditions`, `CookiesPolicy`) s dizajnom landing pagea (font, boje, razmaci). Pored ikonice mjeseca (tamni režim) dodati i ikonicu sunca (svijetli režim).

---

**Šta je AI predložio ili generisao:**
- Upute za import `useTheme` hooka iz `ThemeContext` u `AdminDashboard.jsx`
- Dodavanje `darkMode` varijable i primjena `dark` CSS klase na root `div` element dashboarda
- Kompletne dark mode CSS varijable za `AdminDashboard.css` - sidebar, navbar, kartice, tabele, dugmad, badge-ovi, audit log, inputi, filteri
- Konzistentni dizajn tamne teme s landing pageom (iste boje)
- Inline SVG ikona sunca za svjetli režim u navbaru landing pagea

---

**Šta je tim prihvatio:**
- Sinkronizaciju teme između stranica putem `ThemeContext` i `localStorage`
- Dark mode CSS varijable za AdminDashboard
- SVG ikonice sunca/mjeseca u navbaru

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**
- `useState` nije bio importan u `AdminDashboard.jsx` nakon dodavanja `sidebarOpen` stanja - uzrokovalo `ReferenceError: useState is not defined` i bijeli ekran; riješeno dodavanjem `useState` u import iz Reacta

---

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
- Moguć dupli poziv verifikacije, što može dati poruku "neispravan token" iako je prvi poziv uspio

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

## Unos 17 — Implementacija koordinatorskog dashboarda (US-08)

| Polje | Sadržaj |
|---|---|
| **Datum** | 09.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija kompletnog koordinatorskog dashboarda - frontend i backend |

**Kratak opis upita:**

> Implementirati pristup koordinatora. Koordinator treba imati detaljan uvid u cijeli tok i napredak prakse kod studenta. Na dashboardu trebaju biti sve potrebne funkcionalnosti. CSS stil treba biti usklađen s dosadašnjim. Ispoštovati sve što se tiče user storija.

**Šta je AI predložio ili generisao:**

- `KoordinatorDashboard.jsx` - dashboard s tab navigacijom (Prijave na čekanju, Sve prijave, Aktivne prakse, Studenti, Odobravanje naloga), statistikama u karticama, tamnim režimom i navbarom s logom
- `KoordinatorDashboard.css` - kompletni stilovi usklađeni s postojećim CSS varijablama i design tokenima projekta, uključujući dark mode override-e, responsive grid za statistike, tab navigaciju, tabele, modalne prozore i toast notifikacije
- `PrijavePregled.jsx` - modul za pregled prijava s filterom po statusu, paginacijom i modalnim prozorom za odobravanje/odbijanje s unosom razloga
- `PraksePregled.jsx` - modul za pregled aktivnih i završenih praksi
- `StudentListaPregled.jsx` - modul za pregled studenata s istog fakulteta s pretragom po imenu, bočnim panelom s detaljima studenta i prikazom historije prijava
- `OdobravanjePregled.jsx` - modul za odobravanje/odbijanje studentskih naloga koji čekaju odobrenje
- `koordinatorService.js` - frontend servis s API pozivima za sve koordinatorske endpointe
- Backend: `koordinator.service.js`, `koordinator.controller.js`, `koordinator.routes.js` - servis, kontroler i rute za sve koordinatorske endpointe (`/dashboard`, `/prijave`, `/prijave/:id`, `/studenti`, `/prakse`, `/zahtjevi`, `/studenti/:id/odobri`, `/studenti/:id/odbij`)
- `approval.service.js` dopuna - funkcija `getStudentApprovalRequestsForKoordinator` koja filtrira zahtjeve po `fakultetID` koordinatora
- Responsive CSS pravila za tablet i mobilne uređaje

**Šta je tim prihvatio:**
- Kompletnu arhitekturu koordinatorskog dashboarda (frontend + backend)
- Filtriranje podataka po fakultetu koordinatora na svim endpointima (prijave, studenti, prakse, zahtjevi)
- Workflow odobravanja/odbijanja studentskih naloga s email obavijestima
- Tab navigaciju i statističke kartice
- Responsive dizajn

**Šta je tim izmijenio:**
- Uklonjen filter po smjeru (odsjeku) - koordinator vidi sve studente s istog fakulteta bez obzira na smjer
- Stilizacija nekih UI elemenata (ikonice, chip za rolu) usklađena s postojećim dizajnom
- Redoslijed i nazivi tabova prilagođeni zahtjevima
- `approvalStatus` pri registraciji promijenjen iz `'APPROVED'` u `'PENDING_APPROVAL'` kako bi korisnici ispravno čekali odobrenje

**Šta je tim odbacio:**
- Prijedlog automatskog odobravanja studenata odmah pri verifikaciji emaila

**Rizici, problemi ili greške:**
- Inicijalno je koordinator vidio studente s drugog fakulteta - uzrok je bio pogrešan endpoint u frontend servisu koji je pozivao admin rutu umjesto koordinatorske; riješeno preusmjeravanjem na `/api/koordinator/zahtjevi`
- Filtriranje po `fakultetID` u `getPrijave`, `getPrijavaById` i `getPrakse` dodato naknadno jer inicijalno nije bilo implementirano - koordinator je vidio sve prijave bez obzira na fakultet

---

## Unos 18 — Backend testovi za koordinatorski modul

| Polje | Sadržaj |
|---|---|
| **Datum** | 11.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Pisanje unit i integracionih testova za koordinatorski modul |

**Kratak opis upita:**

> Napisati backend testove koji se tiču koordinator.service, koordinatorService, koordinator Controller, koordinator.routes. Po uzoru na postojeće testove (admin.routes.test.js, admin.routes.integration.js, approval.service.test.js).

**Šta je AI predložio ili generisao:**

- `koordinator.routes.test.js` - unit testovi za sve koordinatorske rute s mockiranim middleware-om, modelima i servisima (28 testova): dashboard statistike, lista prijava s filterom, detalji prijave, odluka o prijavi, lista studenata s pretragom, odobravanje/odbijanje studenta, lista zahtjeva, lista praksi
- `koordinator.routes.integration.test.js` - integracijski testovi s pravom bazom podataka (24 testa): kreiranje testnih korisnika u `beforeAll`, provjera filtriranja po fakultetu u stvarnim DB upitima, provjera promjena statusa u bazi nakon odobravanja/odbijanja
- `koordinator.service.test.js` - unit testovi za sve servisne funkcije (32 testa): `getDashboardStats`, `getPrijave`, `getPrijavaById`, `odluciOPrijavi`, `getStudenti`, `getPrakse`, `approveStudent`, `rejectStudent`
- Dopuna `approval.service.test.js` - 5 novih testova za `getStudentApprovalRequestsForKoordinator`

**Šta je tim prihvatio:**
- Kompletnu strukturu unit i integracionih testova po uzoru na postojeće
- Sve mock funkcije i helper funkcije (`makeMockUser`, `makeMockKoordinator`, `makeMockStudent`, `makeMockPrijava`)
- Integracijske testove koji kreiraju stvarne zapise u test bazi i provjeravaju filtriranje po fakultetu

**Šta je tim izmijenio:**
- Putanje za `require` mock-ova ispravljene (`../src/` → `../../src/`) jer je fajl smješten u `tests/unit/` podfolder
- Mock `Koordinator.findOne` dodan u sve testove koji pozivaju `getPrijave`, `getPrijavaById` i `getPrakse` - naknadno dodato jer je `koordinatorUserId` parametar dodan u te funkcije
- Identifikacija studenata u integracionim testovima promjenjena s `userID` na `User.email` jer model vraća ugniježđeni `User` objekat bez `id` polja na vrhu
- `getStudentApprovalRequestsForKoordinator` describe blok izvučen iz `rejectUserRequest` bloka - bio pogrešno ugniježđen

**Šta je tim odbacio:**
- Redundantni test slučajevi koji su pokrivali iste scenarije različitim formulacijama

**Rizici, problemi ili greške:**
- Unit test za pretragu studenata jednom riječju (`Op.or` filter) koristio `expect.any(Symbol)` s `toHaveProperty` što nije podržano - riješeno s `Object.getOwnPropertySymbols()`

## Unos 19 — Implementacija pregleda praksi za studente (US-11,12,32,36)

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | Haris Husić |
| **Svrha korištenja** | Implementacija stranice za pregled dostupnih praksi za studente |

**Kratak opis upita:**

> Implementirati stranicu za pregled praksi za studente na ruti `student/dashboard`. Stranica treba prikazivati objavljene oglase za prakse u obliku kartica sa mock podacima (8-10 oglasa), filterima po datumu, tehnologiji i trajanju, dark mode podrškom i auth guardom. Kartice trebaju imati hover efekat s blagim podizanjem i animiranom svjetlećom ivicom koja putuje u smjeru kazaljke na satu od gornjeg lijevog ugla, collapsing sidebar sa search opcijom koja ce takodje imati animaciju kao kartice, filterima sa svg dziajnom tokom collapsanog izgleda, plus opisom kada je sidebar otvoren koji ce pulsirati tokom hovera.

**Šta je AI predložio ili generisao:**

- `StudentDashboard.jsx` - glavna komponenta s prikazom kartica, filter barom, dark mode toggleom i auth guardom
- `StudentDashboard.css` - kompletni stilovi uključujući animaciju svjetleće ivice (`conic-gradient`), hover efekte, CSS varijable za light/dark mode, grid layout i responsive pravila
- Mock podaci — 8-10 realističnih oglasa za prakse s poljima: naziv pozicije, kompanija, tehnološki stack (tagovi), trajanje, broj mjesta, lokacija, datum objave, rok prijave i kratak opis
- Logika filtriranja na klijentskoj strani po datumu objave, tehnologiji i trajanju
- Auth guard koji provjerava prijavu korisnika i preusmjerava na login stranicu ako sesija nije aktivna

**Šta je tim prihvatio:**
- Raspored i dizajn

**Šta je tim izmijenio:**
- Odabran novi izgled za sidebar koji je collapsing uz dodatne promjene za interaktivniji UI

**Šta je tim odbacio:**
- Pocetnu poziciju search i filtera

**Rizici, problemi ili greške:**
- Pocetni dizajn kartice imao previse upadljivu animaciju koja je naknadno korigovana

---

## Unos 20 — Implementacija role-based navigacije i dashboard shell-a (SB-42)

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Codex / ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Haris Tucaković |
| **Svrha korištenja** | Usklađivanje navigacije i dashboard interfejsa prema korisničkim rolama |

**Kratak opis upita:**

> Dopuniti navigaciju na dashboardima tako da korisnici imaju jasne linkove prema funkcionalnostima svoje role. Posebno uskladiti kompanijski dashboard sa postojećim vizuelnim sistemom, bočni meni, profil meni, odjavu, dark mode podršku i responzivno ponašanje.

**Šta je AI predložio ili generisao:**

- `KompanijaDashboard.jsx` — top navbar s logom, nazivom kompanije i role chip-om, hover-expand sidebar, linkove za pregled dashboarda, oglase, kreiranje oglasa, profil i odjavu
- `KompanijaDashboard.css` — dashboard shell usklađen s `AdminDashboard` vizuelnim sistemom, stilovi za sidebar, navbar, profilni meni, dark mode i mobilne prikaze
- Dopune u `StudentDashboard.jsx`, `KoordinatorDashboard.jsx` i `AdminDashboard.jsx` radi konzistentnijeg izgleda navigacije među rolama
- Usklađivanje auth stranica i dashboard navigacije sa zajedničkim ikonama i postojećim CSS tokenima
- Dodavanje `lucide-react` dependency-ja u `package.json` i `package-lock.json` jer su dashboard ikonice zavisile od te biblioteke

**Šta je tim prihvatio:**
- Role-based navigaciju sa jasno odvojenim stavkama po tipu korisnika
- Sidebar koji se širi na hover i ostavlja više prostora glavnom sadržaju
- Profilni meni sa brzim pristupom profilu i odjavi
- Korištenje `useNavigate` i postojećih ruta umjesto ručnog mijenjanja URL-a
- Dark mode i responsive pravila u istom CSS sistemu kao ostatak aplikacije

**Šta je tim izmijenio:**
- Nazivi i redoslijed stavki u navigaciji prilagođeni su backlog zadacima i postojećim rutama
- Stil kompanijskog dashboarda dodatno je usklađen s admin dashboardom da se izbjegne različit vizuelni jezik među rolama

**Šta je tim odbacio:**
- Posebnu navigacijsku komponentu za svaku stranicu bez zajedničkog vizuelnog obrasca

**Rizici, problemi ili greške:**
- `lucide-react` nije bio upisan u dependency listu i mogao je uzrokovati grešku pri pokretanju frontenda; riješeno dodavanjem dependency-ja
- Dio CSS-a za sidebar zahtijevao je dodatna responsive pravila da hover ponašanje ne remeti mobilni prikaz

---

## Unos 21 — Pregled i uređivanje profila kompanije (SB-45)

| Polje | Sadržaj |
|---|---|
| **Datum** | 13.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Codex / ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Haris Tucaković |
| **Svrha korištenja** | Izmjena profila kompanije kroz postojeću profilnu stranicu |

**Kratak opis upita:**

> Doraditi pregled i uređivanje profila kompanije. Kompanija treba vidjeti svoje podatke, moći urediti naziv, djelatnost, adresu, telefon, kontakt osobu i opis poslovanja, dobiti poruku o uspješnom ažuriranju, a promjena naziva treba biti vidljiva i u kompanijskom dashboardu.

**Šta je AI predložio ili generisao:**

- `ProfilePage.jsx` — poseban prikaz za korisnike role `COMPANY` unutar postojeće profilne stranice
- Učitavanje podataka kompanije preko `getCompanyProfile` i spremanje izmjena preko `updateCompanyProfile`
- Formu za uređivanje polja `naziv`, `djelatnost`, `adresa`, `telefon`, `kontaktOsoba` i `opisPoslovanja`
- Validaciju obaveznog naziva kompanije i prikaz lokalizovanih error/success poruka
- Ažuriranje lokalnog auth korisnika nakon promjene naziva kompanije
- `company-profile-updated` browser event kako bi `KompanijaDashboard` mogao osvježiti prikaz naziva bez ručnog reload-a

**Šta je tim prihvatio:**
- Zadržavanje jedinstvene `ProfilePage.jsx` stranice uz role-specific rendering
- Korištenje postojećeg service sloja za API pozive umjesto direktnih fetch poziva iz komponente
- Uređivanje samo poslovnih podataka kompanije, bez izmjene sistemskih polja kao što su rola i status
- Toast poruku nakon uspješnog ažuriranja profila
- Povratak na odgovarajući dashboard prema roli korisnika

**Šta je tim izmijenio:**
- Payload za update usklađen je sa stvarnim nazivima polja u backend modelu kompanije
- Prikaz praznih vrijednosti prilagođen je tako da profil ostane čitljiv i kada nisu uneseni svi podaci
- Sinhronizacija naziva kompanije između profila, auth state-a i dashboarda dodana je nakon testiranja korisničkog toka

**Šta je tim odbacio:**
- Uređivanje statusa naloga, role i drugih sistemskih atributa kroz profilnu stranicu

**Rizici, problemi ili greške:**
- Bez event sinhronizacije dashboard je mogao prikazivati stari naziv kompanije do reload-a stranice
- Postojala je mogućnost neusklađenosti između auth korisnika i profila kompanije nakon update-a; riješeno osvježavanjem lokalnog auth state-a

## Unos 22 — Implementacija deaktivacije računa

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija funkcionalnosti deaktivacije korisničkog računa za sve role |

**Kratak opis upita:**

> Implementirati mogućnost deaktivacije računa za studenta, kompaniju i koordinatora putem settings panela na dashboardu. Admin treba moći deaktivirati bilo kojeg korisnika. Uključiti potvrdu akcije i prikaz grešaka.

**Šta je AI predložio ili generisao:**

- `admin.service.js` — funkcija `updateUserStatus` za promjenu statusa korisnika (ACTIVE/DEACTIVATED)
- `admin.controller.js` — controller za deaktivaciju korisnika od strane admina
- `admin.routes.js` — ruta `PATCH /api/admin/users/:id/status`
- `users.service.js` — logika deaktivacije za studenta (zatvara aktivne prijave), kompaniju (zatvara oglase) i koordinatora
- `users.controller.js` — controlleri za deaktivaciju po roli
- `users.routes.js` — rute za deaktivaciju po roli
- `StudentDashboard.jsx/css` — danger zona s potvrdom deaktivacije u settings panelu
- `KompanijaDashboard.jsx/css` — settings panel s danger zonom za deaktivaciju
- `KoordinatorDashboard.jsx/css` — settings panel s danger zonom za deaktivaciju
- `AdminDashboard.jsx` — "Deaktiviraj" dugme uz svaki aktivni korisnički nalog

**Šta je tim prihvatio:**
- Kompletnu arhitekturu deaktivacije za sve role
- Potvrdu akcije putem modalnog prozora s unosom provjere

**Šta je tim izmijenio:**
- Vizuelni stil settings panela usklađen između svih dashboarda

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 23 — Implementacija brisanja računa

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija funkcionalnosti trajnog brisanja korisničkog računa za sve role |

**Kratak opis upita:**

> Implementirati trajno brisanje računa za studenta, kompaniju i koordinatora iz settings panela. Admin treba moći obrisati bilo kojeg korisnika. Brisanje treba biti unutar transakcije i ukloniti sve povezane podatke (prijave, prakse, oglasi, aktivnosti, evaluacije, ugovori, izvještaji).

**Šta je AI predložio ili generisao:**

- `users.service.js` — funkcije `deleteMyAccount`, `deleteCompanyAccount`, `deleteCoordinatorAccount` sa Sequelize transakcijama koje brišu sve povezane zapise
- `admin.service.js` — funkcija `deleteUser` za admin brisanje po roli
- `users.controller.js` — controlleri `deleteMyAccountController`, `deleteCompanyAccountController`, `deleteCoordinatorAccountController`
- `admin.controller.js` — controller `deleteUser`
- `users.routes.js` — rute `DELETE /api/users/delete`, `/company-delete`, `/coordinator-delete`
- `admin.routes.js` — ruta `DELETE /api/admin/users/:id`
- `StudentDashboard.jsx/css` — sekcija "Brisanje računa" s labelom izvan crvene kutije i modalnim prozorom za potvrdu
- `KompanijaDashboard.jsx/css` — ista sekcija za brisanje u settings overlaju
- `KoordinatorDashboard.jsx/css` — ista sekcija za brisanje u settings panelu
- `AdminDashboard.jsx/css` — "Obriši" dugme (crveni outline) uz svaki korisnički nalog za sve statuse
- `userService.js` — frontend API funkcije za delete endpointe
- Testovi: 12 novih unit testova u `users.controller.test.js`, 12 u `users.service.test.js`, 6 u `admin.service.test.js`, 3 u `admin.routes.test.js`

**Šta je tim prihvatio:**
- Kompletnu logiku brisanja s transakcijama za sve role
- Jedinstveni tekst modalnog prozora za potvrdu brisanja
- Danger zone s labelama izvan crvenih kutija

**Šta je tim izmijenio:**
- Vizuelni prikaz settings panela unificiran između Student, Kompanija i Koordinator dashboarda

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

--- 

## Unos 24 — Implementacija stranice profila (pregled i uređivanje)

| Polje | Sadržaj |
|---|---|
| **Datum** | 13.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija korisničkih priča 44 (Pregled profila) i 39 (Uređivanje profila studenta) — backend rute, servisna logika, kontroleri i frontend stranica profila s podrškom za sve uloge |

**Kratak opis upita:**

> Implementirati `GET /users/me` i `PUT /users/student/update` backend rute s autentifikacijom. U servisu dohvatiti podatke korisnika uz Sequelize `include` za `Student` i `Fakultet` modele, te implementirati logiku ažuriranja (ime, prezime, email, lozinka uz verifikaciju trenutne). Na frontendu kreirati `ProfilePage.jsx` s prikazom podataka za sve uloge — studenti dobivaju edit mode za osnovne podatke, kompanije dobivaju edit mode za kompanijske podatke (`naziv`, `opisPoslovanje`, `djelatnost`, `adresa`, `telefon`, `kontaktOsoba`), a koordinatori i admini dobivaju read-only prikaz. Ukloniti `ProfileShell` i `EditProfileShell` iz `KompanijaDashboard.jsx` i prebaciti tu funkcionalnost na `/profile` rutu.

---

**Šta je AI predložio ili generisao:**

- Dodaci u `backend/src/business/services/users.service.js` — dvije nove funkcije: `getMyProfile` (dohvat korisnika s `include` za `Student` i `Fakultet`) i `updateStudentProfile` (validacija, provjera jedinstvenosti emaila, bcrypt verifikacija trenutne lozinke, hashovanje nove)
- Dodaci u `backend/src/business/controllers/users.controller.js` — `getMyProfileController` i `updateStudentProfileController`
- Dodaci u `backend/src/presentation/routes/users.routes.js` — `GET /me` i `PUT /student/update` rute zaštićene `authenticate` middlewareom
- Dodaci u `frontend/src/services/api.js` — `getMyProfile()` i `updateStudentProfile()` funkcije
- `frontend/src/pages/ProfilePage.jsx` — stranica s tri odvojene grane: `StudentProfile` (edit mode za ime, prezime, email, lozinka), `CompanyProfile` (poziva `getCompanyProfile()` i `updateCompanyProfile()`, edit mode za svih 6 kompanijskih polja), `ReadOnlyProfile` (koordinatori i admini)
- `frontend/src/pages/ProfilePage.css` — ko-locirani stylesheet koji koristi `variables.css` tokene, s podrškom za dark mode i responzivni layout
- Izmjene u `frontend/src/pages/KompanijaDashboard.jsx` — uklanjanje `ProfileShell`, `EditProfileShell`, `VIEWS.PROFILE`, `VIEWS.EDIT_PROFILE`, `profileLoading`, `profileError` stanja i `handleSaveCompanyProfile` funkcije; `Profil` nav dugme preusmjereno na `/profile` rutu
- Dodavanje `Profil` opcije u profile menije u `StudentDashboard.jsx`, `KoordinatorDashboard.jsx` i `AdminDashboard.jsx` sidebar-ima
- CSS dodaci u `AdminDashboard.css` za footer sidebar sekciju s avatarem, imenom i profile menijem

---

**Šta je tim prihvatio:**

- Kompletnu backend implementaciju s bcrypt verifikacijom lozinke i čuvanjem jedinstvenosti emaila
- Trojnu granu u `ProfilePage.jsx` po ulogama
- Ko-locirani `ProfilePage.css` koji koristi `variables.css` design tokene
- Uklanjanje duplirane logike profila iz `KompanijaDashboard.jsx`
- Navigaciju na `/profile` iz svih dashboard sidebar-a i navbar-a

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**

- Bijeli ekran u `AdminDashboard.jsx` uzrokovan nedostajućim importima `useRef` i `useNavigate` — riješeno dodavanjem u postojeće import linije

---

## Unos 25 — Implementacija upload-a dokumentacije za prijavu na praksu (SB-14)

| Polje | Sadržaj |
|---|---|
| **Datum** | 19.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Irma Lemes |
| **Svrha korištenja** | Implementacija upload-a dokumentacije prilikom prijave na praksu |

**Kratak opis upita:**

> Implementirati mogućnost upload-a dokumentacije prilikom prijave na praksu. Student treba moći priložiti CV i dodatne dokumente uz validaciju formata i veličine fajla. Potrebno je povezati upload sa prijavom na praksu i prikazati korisniku poruku o uspješnom upload-u ili grešci.

**Šta je AI predložio ili generisao:**

- Backend logiku za upload dokumentacije povezane sa prijavom na praksu
- Validaciju dozvoljenih formata fajlova (PDF, DOCX i slično)
- Validaciju maksimalne veličine fajla prije pohrane
- Frontend formu za upload dokumenata unutar procesa prijave na praksu
- Prikaz success i error poruka nakon upload-a
- Povezivanje upload-anih dokumenata sa prijavom studenta

**Šta je tim prihvatio:**
- Validaciju tipa i veličine fajlova prije upload-a
- Povezivanje dokumentacije sa konkretnom prijavom na praksu
- Prikaz korisničkih poruka nakon uspješnog ili neuspješnog upload-a
- Ograničavanje upload-a samo na prijavljene studente

**Šta je tim izmijenio:**
- Prilagođen vizuelni izgled upload forme postojećem dizajnu aplikacije
- Nazivi i tekstovi poruka usklađeni sa ostatkom sistema

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- Potrebno dodatno testirati ponašanje sistema pri upload-u velikih fajlova i prekidu internet konekcije tokom slanja dokumentacije

---

## Unos 26 — Implementacija "Moje prijave" taba i upravljanja dokumentima na profilu

| Polje | Sadržaj |
|---|---|
| **Datum** | 20.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Implementacija prikaza studentovih prijava na dashboardu i sekcije za upravljanje dokumentima na stranici profila |

**Kratak opis upita:**

> Implementirati `MyApplicationsPanel` komponentu unutar `StudentDashboard.jsx` koja prikazuje listu studentovih prijava dohvaćenih s `GET /api/applications/mine`, s prikazom naziva oglasa, kompanije i statusa svake prijave. Na `ProfilePage.jsx` dodati `DocumentsSection` s mogućnošću uploada novih dokumenata i pregledom već uploadovanih, s automatskim osvježenjem liste nakon uspješnog uploada.

**Šta je AI predložio ili generisao:**

- `MyApplicationsPanel` komponentu s dohvatom prijava i prikazom statusa
- `DocumentsSection` s upload formom, odabirom tipa dokumenta i listom postojećih dokumenata
- Ispravku `created_at` polja u `Dokument.create()` pozivima (backend) — polje nije imalo default vrijednost, pa je ostajalo NULL i uzrokovalo pogrešno sortiranje
- Dvostepeni upload tok: student uploaduje dokument bez `oglas_id` (standalone) → frontend automatski poziva `/api/dokumenti/attach` koji kreira kopiju s `oglas_id` vezanu uz prijavu

**Šta je tim prihvatio:**
- `MyApplicationsPanel` s dohvatom s pravog API endpointa
- Automatsko osvježenje liste dokumenata nakon uploada bez potrebe za reload-om stranice
- Ispravku `created_at: new Date()` u oba `Dokument.create()` poziva
- Dvostepeni upload tok koji osigurava da se dokumenti pojavljuju i u "Moji dokumenti" i uz prijavu

**Šta je tim izmijenio:**
- Uklonjen filter `standaloneDocs` koji je greškom skrivao dokumente s postavljenim `oglas_id`

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- `created_at` bez default vrijednosti uzrokovao NULL u bazi i pogrešno sortiranje po datumu
- Upload direktno s `oglas_id` sprječavao prikaz dokumenata u generalnoj listi na profilu — riješeno dvostepenim tokom

---

## Unos 27 — Implementacija favoriziranja oglasa 

| Polje | Sadržaj |
|---|---|
| **Datum** | 20.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija US-48 — mogućnost označavanja oglasa kao omiljenog |

**Kratak opis upita:**

> Implementirati funkcionalnost favoriziranja oglasa za studente. Svaka kartica oglasa treba imati dugme u obliku srca u gornjem desnom uglu koje se oboji crveno kada se oglas označi kao omiljeni. Omiljeni oglasi trebaju biti dostupni u zasebnom tabu "Omiljeni oglasi" u sidebaru. Stanje omiljenih oglasa treba biti trajno (ne smije nestati pri promjeni stranice) i vezano za korisnički nalog, a ne za uređaj.

**Šta je AI predložio ili generisao:**

- `OmiljeniOglas.js` — novi Sequelize model, tabela `omiljeni_oglasi` s poljima `studentID` i `oglasID`
- Ažuriranje `index.js` — registracija modela i asocijacije (`Student→OmiljeniOglas`, `Oglas→OmiljeniOglas`)
- `favourites.service.js` — servisne funkcije `addFavourite`, `removeFavourite`, `getFavourites` (scoped po studentskom profilu)
- `favourites.controller.js` — kontroleri za sva tri endpointa
- `favourites.routes.js` — rute `GET /`, `POST /:oglasId`, `DELETE /:oglasId` zaštićene sa `authenticate` + `authorize('STUDENT')`
- Ažuriranje `app.js` — registracija rute na `/api/favourites`
- `favouritesService.js` (frontend) — API wrapper funkcije
- Izmjene u `StudentDashboard.jsx` — dugme srca na svakoj kartici, optimistično ažuriranje UI-a s rollback logikom pri grešci, tab "Omiljeni" u sidebaru s brojevnim badge-om, posebna empty state poruka za omiljene
- Izmjene u `StudentDashboard.css` — stilovi za dugme srca, sidebar tabove, dark mode varijante

**Šta je tim prihvatio:**
- Kompletnu backend arhitekturu s tabelom `omiljeni_oglasi`
- Tab navigaciju u sidebaru s odvojenim prikazom omiljenih oglasa

**Šta je tim izmijenio:**
- Inicijalni prijedlog je koristio `localStorage` za čuvanje omiljenih — tim je zatražio backend rješenje radi ispravnog ispunjavanja kriterija US-48 (tuđi omiljeni ne smiju biti vidljivi drugom korisniku ni na dijeljenom uređaju)

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 28 — Implementacija oznake "Novo" na oglasima (US-56)

| Polje | Sadržaj |
|---|---|
| **Datum** | 20.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija US-56 — vizuelna oznaka "Novo" za nedavno objavljene oglase |

**Kratak opis upita:**

> Dodati oznaku "Novo" na kartice oglasa koji su objavljeni u poslijednjih 3 dana. Oznaka treba biti vidljiva u listi svih oglasa i u listi omiljenih oglasa, a treba se automatski ukloniti nakon isteka perioda bez ikakve intervencije.

**Šta je AI predložio ili generisao:**

- Funkciju `isNovo(datumObjave)` koja izračunava da li je oglas objavljen unutar 3 dana (`Date.now() - new Date(datumObjave) < 3 * 24 * 60 * 60 * 1000`)
- Oznaku `<span className="sd-novo-badge">Novo</span>` kao prvi element unutar `sd-card-head` u komponenti `PraksaCard`
- CSS stilove za `.sd-novo-badge` — zeleni gradijent, pill oblik, uppercase tekst, shadow efekt, dark mode varijanta

**Šta je tim prihvatio:**
- Čisto frontend rješenje bez ikakvih promjena na backendu ili bazi podataka — `datumObjave` je već dostupan u podacima koje vraća postojeći endpoint
- Pozicioniranje oznake kao prvog inline elementa u `sd-card-head` (prirodno poravnanje s ostatkom sadržaja kartice)

**Šta je tim izmijenio:**
- Pozicija oznake iterativno podešavana (apsolutno pozicioniranje → inline u `sd-card-head`) radi boljeg vizuelnog rezultata

**Šta je tim odbacio:**
- Čuvanje `isNovo` stanja u bazi podataka — odbačeno jer je to redundantna informacija koja se može uvijek izračunati iz postojećeg `datumObjave` polja

**Rizici, problemi ili greške:**

---

## Unos 29 — Uređivanje oglasa (US-57)

| Polje | Sadržaj |
|---|---|
| **Datum** | 20.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | ChatGPT (GPT-4.1) |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Implementacija funkcionalnosti uređivanja postojećeg oglasa |

**Kratak opis upita:**

> Potrebno je omogućiti kompaniji da uređuje već kreirani oglas (naziv, opis, trajanje, broj mjesta, uslovi). Kako najbolje organizovati validaciju i ograničenja izmjena ako već postoje prijave na oglas?

**Šta je AI predložio ili generisao:**

- Korištenje postojećeg modela oglasa bez kreiranja nove entitetske strukture  
- Backend validaciju obaveznih polja prilikom izmjene  
- Ograničavanje izmjene određenih polja (npr. broj mjesta) ukoliko već postoje aktivne prijave  
- Vraćanje jasnih HTTP odgovora i poruka o greškama pri neuspjeloj validaciji  
- Frontend formu za uređivanje sa već popunjenim postojećim podacima  

**Šta je tim prihvatio:**

- Centralizovanu backend validaciju kao primarni mehanizam kontrole  
- Pre-popunjavanje forme postojećim podacima oglasa  
- Provjeru da broj mjesta ne može biti manji od broja već prihvaćenih prijava  

**Šta je tim izmijenio:**

- Umjesto potpunog zaključavanja oglasa kada postoje prijave, dozvoljene su izmjene teksta (opis, uslovi), ali ne i kritičnih numeričkih parametara  

**Šta je tim odbacio:**

- Kreiranje verzionisanja oglasa (historija izmjena) — odbačeno za ovu fazu projekta  
- Zaključavanje cijelog oglasa čim postoji barem jedna prijava  

**Rizici, problemi ili greške:**

- Potencijalna nekonzistentnost podataka ako se paralelno izvrše izmjene i nove prijave  
- Potreba za dodatnim testiranjem scenarija izmjene broja mjesta  


---

## Unos 30 — Upravljanje rokovima prijave (US-58)

| Polje | Sadržaj |
|---|---|
| **Datum** | 20.05.2026 |
| **Sprint broj** | 8 |
| **Alat** | ChatGPT (GPT-4.1) |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Implementacija funkcionalnosti postavljanja, izmjene i isteka roka prijave za oglas |

**Kratak opis upita:**

> Potrebno je omogućiti kompaniji da postavi i izmijeni rok prijave na oglas te osigurati da oglas automatski postane nevidljiv studentima nakon isteka roka.

**Šta je AI predložio ili generisao:**

- Dodavanje polja za unos datuma kada je oglas aktivan   

**Šta je tim prihvatio:**
 
- Automatsko tretiranje oglasa kao zatvorenog na osnovu isteka datuma  

**Šta je tim izmijenio:**

- Nije uvedeno dodatno boolean polje (`isClosed`) jer je status izveden iz datuma   

**Šta je tim odbacio:**

- Cron job za periodično zatvaranje oglasa — odbačeno jer se status može izračunavati u realnom vremenu  
- Ručno zatvaranje oglasa od strane administratora  

**Rizici, problemi ili greške:**

- Mogući problemi s vremenskim zonama (server vs. klijent)  
- Potreba za testiranjem scenarija kada rok ističe u tačno određeno vrijeme (npr. 23:59)  

---


# AI Usage Log — Sprint 9

---

## Unos 1 — Ispravka dokumenta prijave, migracija na Supabase Storage i notifikacije (US-37)

| Polje | Sadržaj |
|---|---|
| **Datum** | 21.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhusic1 |
| **Svrha korištenja** | Dijagnoza i ispravka null vrijednosti dokumenta u prijavi, migracija upload-a dokumenata na Supabase Storage, implementacija US-37 — notifikacije o statusu prijave na praksu |

**Kratak opis upita:**

> Dokumenti priloženi uz prijavu na praksu (CV, motivaciono pismo) su null u `prijave_na_praksu` tabeli. Na `/profile` stranici se prikazuju samo nazivi dokumenata bez mogućnosti preuzimanja. Zatražena je dijagnoza problema, ispravka arhitekturalne nekonzistentnosti između `dokumenti` tabele i `cv`/`motivacionoPismo` kolona, migracija uploada sa lokalnog diska na Supabase Storage s limitom od 150KB, te implementacija notifikacija o statusu prakse: email obavijesti pri prijavi/odobravanju/odbijanju i in-app zvono ikonica na student dashboardu.

**Šta je AI predložio ili generisao:**

- Dijagnoza: `dokumenti.prijava_id` polje nikad nije bilo postavljano; `cv` i `motivacionoPismo` u `prijave_na_praksu` nikad nisu popunjavani — dva paralelna sistema nikad spojena
- Ispravka `applications.service.js` — nakon `PrijavaNaPraksu.create()` automatski ažurira `dokumenti` zapise s `prijava_id`, te popunjava `cv` i `motivacionoPismo` kolone putanjama pronađenih dokumenata
- Ispravka `dokument.routes.js` (`/attach` endpoint) — prihvata opcioni `prijava_id` parametar
- Migracija `upload.middleware.js` — zamjena `multer.diskStorage` s `multer.memoryStorage()`, limit smanjen na 150 KB
- Kreiranje `backend/src/infrastructure/supabase.js` — inicijalizacija Supabase klijenta (`createClient`)
- Izmjena `dokument.routes.js` — upload buffer-a u Supabase Storage bucket `dokumenti` (putanja: `{student_id}/{timestamp}{ext}`), brisanje iz bucketa pri DELETE, novi `GET /:id/download` endpoint koji generiše signed URL
- Izmjena `ProfilePage.jsx` — dugme za preuzimanje poziva `/api/dokumenti/:id/download` s JWT tokenom u headeru umjesto direktne `/uploads/` putanje
- Ispravka destructuriranja `{ student, user }` u `createApplication` (bio samo `{ student }`, uzrokovalo 500 grešku)
- `Notifikacija.js` model — tabela `notifikacije` (student_id, prijava_id, tip, naslov, poruka, procitana, created_at)
- Ažuriranje `models/index.js` — registracija modela i asocijacije
- `notifications.service.js` — funkcije `createNotification` (s dedup-om po `student_id + prijava_id + tip`), `getMyNotifications`, `markAsRead`, `markAllAsRead`
- `notifications.routes.js` — `GET /`, `PATCH /:id/read`, `PATCH /read-all`
- Dvije nove email funkcije u `email.service.js`: `sendPrijavaPodnesenaEmail` i `sendPrijavaStatusEmail` (HTML template usklađen s postojećim)
- `applications.service.js` — šalje in-app notifikaciju i email studentu pri podnesnoj prijavi
- `koordinator.service.js` (`odluciOPrijavi`) — šalje in-app notifikaciju i email studentu pri odobravanju/odbijanju, dohvata Student/User/Oglas/Kompanija u jednom upitu
- `api.js` (frontend) — `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`
- `StudentDashboard.jsx` — zvono ikonica u navbaru s crvenim badge-om za nepročitane, dropdown panel s listom notifikacija, klik označava pročitanom, "Označi sve" dugme, useEffect za dohvat pri mount-u, zatvaranje klikom van
- `StudentDashboard.css` — kompletni stilovi za `.sd-notif-wrap`, `.sd-notif-btn`, `.sd-notif-badge`, `.sd-notif-dropdown`, `.sd-notif-item`, dark mode varijante

**Šta je tim prihvatio:**
- Dijagnozu arhitekturalne nekonzistentnosti i pristup rješavanja putem `prijava_id`
- Migraciju na Supabase Storage s 150 KB limitom
- Potpunu implementaciju in-app notifikacija i email obavijesti za US-37
- Zvono ikonicu u navbaru s badge-om i dropdown panelom

**Šta je tim izmijenio:**
- Ništa strukturalno — implementacija prihvaćena kako je generisana

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- `user` nije bio destructuriran iz `resolveStudentFromUser` u `createApplication` — uzrokovalo 500 grešku pri prvoj prijavi; otkriveno i ispravljeno odmah
- Supabase Storage bucket `dokumenti` i tabela `notifikacije` moraju biti kreirani ručno u Supabase dashboardu (SQL Editor) — nije automatizirano
- Download link kao `<a href>` nije slao JWT token — zamijenjeno s programskim `fetch` + `window.open`

---

## Unos 2 — Implementacija pregleda zatvorenih oglasa (US-57)

| Polje | Sadržaj |
|---|---|
| **Datum** | 22.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-57 - pregled zatvorenih oglasa za studente i kompanije |

**Kratak opis upita:**

> Implementirati pregled zatvorenih (isteklih) oglasa za studenta u novom tabu "Zatvoreni" unutar StudentDashboard-a. Svaki zatvoreni oglas treba biti klikabilan i otvarati modal s detaljima, ali bez mogućnosti prijave. Klikom na ime firme otvoriti profil kompanije, s mogućnošću povratka na zatvorene oglase (ne na sve oglase). Kompanija treba imati isti pregled za vlastite zatvorene oglase.

**Šta je AI predložio ili generisao:**

- `getClosedListings` i `getClosedListingsByCompany` funkcije u `listings.service.js` - Sequelize query s `Op.or` koji hvata oglase s `status !== 'AKTIVAN'` ili `rokPrijave <= new Date()`
- `getClosedListings` i `getClosedListingsByCompany` handlere u `listings.controller.js`
- Dvije nove rute u `listings.routes.js`: `GET /closed` (za studente) i `GET /company/closed` (za kompanije, zaštićeno `authorize('COMPANY')`)
- `getClosedListings` i `getCompanyClosedListings` u frontend `listingsService.js`
- `ClosedListingsPanel` komponentu u `StudentDashboard.jsx` - lista zatvorenih oglasa s `sd-card-wrap--closed` klasom za hover animaciju identičnu aktivnim oglasima
- `ClosedOglasModal` komponentu u `StudentDashboard.jsx` - modal s detaljima zatvorenog oglasa, obavijesti da je oglas zatvoren, klikom na ime firme proslijeđuje `state={{ from: 'zatvoreni' }}`
- Novi tab "Zatvoreni oglasi" u sidebaru `StudentDashboard.jsx` sa stilom identičnim tabu "Moje prijave"
- `ClosedListingsShell` komponentu u `KompanijaDashboard.jsx` - prikaz kompanijin zatvorenih oglasa, nova navigacijska stavka "Zatvoreni oglasi"
- `CompanyProfilePage.jsx` izmjena - `useLocation` za čitanje `state.from`, dugme "Nazad" navigira na odgovarajući tab (`zatvoreni` ili default), tekst se mijenja ovisno o porijeklu
- `StudentDashboard.jsx` izmjena `useEffect` za `location.state` - obrađuje novi `openTab` parametar za povratak na zatvoreni tab
- Ispravka `getCompanyPublicProfile` servisa - dodavanje `rokPrijave: { [Op.gt]: new Date() }` filtera da aktivni oglasi na profilu kompanije ne uključuju istekle
- Prikaz statusa oglasa u `KompanijaDashboard.jsx` - frontend logika koja prikazuje "ISTEKAO" umjesto "AKTIVAN" za oglase kojima je istekao rok
- Ispravka brojača "Aktivni oglasi" u `DashboardShell` - filtrira po roku prijave, ne samo po statusu
- CSS za `sd-card-wrap--closed` i `ClosedOglasModal` dodat na kraj `StudentDashboard.css`

**Šta je tim prihvatio:**
- Kompletnu backend arhitekturu za pregled zatvorenih oglasa
- Lazy loading zatvorenih oglasa (učitavaju se tek pri prvom kliknu na tab)
- Frontend-only rješenje za prikaz isteklih oglasa kao "ISTEKAO" u kompanijinom dashboardu (bez cron joba)
- Animaciju hover efekta na zatvorenim karticama identičnu aktivnim oglasima (`sd-card-wrap--closed`)
- Navigacijsku logiku povratka s profila kompanije na odgovarajući tab

**Šta je tim izmijenio:**
- Import u `KompanijaDashboard.jsx` je greškom ostao `getClosedListings` umjesto `getCompanyClosedListings` - ispravljeno

**Šta je tim odbacio:**
- Ništa

**Rizici, problemi ili greške:**
- `getCompanyPublicProfile` nije filtrirao po `rokPrijave` - ispravljeno tek kad je primijećeno da istekli oglasi prikazuju kao aktivni na profilu kompanije

---

## Unos 3 — Implementacija ograničenja broja prijava po studentu (US-53)

| Polje | Sadržaj |
|---|---|
| **Datum** | 22.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija US-53 - ograničenje broja aktivnih prijava po studentu koje postavlja koordinator |

**Kratak opis upita:**

> Implementirati ograničenje broja aktivnih prijava po studentu koje koordinator može podesiti putem KoordinatorDashboard-a. Kada student dostigne limit, dugme "Prijavi se" treba biti onemogućeno s porukom objašnjenja.

**Šta je AI predložio ili generisao:**

- `SystemSetting.js` - novi Sequelize model za pohranu globalnih podešavanja sistema (key/value tabela `system_settings`)
- `application_limit.service.js` - funkcije `getApplicationLimit`, `setApplicationLimit`, `checkStudentApplicationLimit` s podrazumijevanim limitom od 5
- `application_limit.controller.js` - `getLimitController` i `setLimitController`
- Dvije nove rute u `koordinator.routes.js`: `GET /application-limit` i `PUT /application-limit`
- `useApplicationLimit.js` - React hook koji dohvata limit s backenda i računa `isAtLimit` flag na osnovu broja aktivnih prijava studenta
- `KoordinatorLimitPanel.jsx` - panel za koordinatora s prikazom trenutnog limita i formom za promjenu; integrisan u `KoordinatorDashboard.jsx` kao nova stavka navigacije "Limit prijava"
- CSS za `KoordinatorLimitPanel` dodat na kraj `KoordinatorDashboard.css`
- Limit bar u sidebaru `StudentDashboard.jsx` - prikazuje se samo ako je limit postavljen, mijenja boju u crvenu pri dostizanju limita
- `PraksaModal` izmjena - dugme "Prijavi se" onemogućeno kad student dostigne limit, s porukom objašnjenja

**Šta je tim prihvatio:**
- Kompletnu backend arhitekturu za ograničenje prijava
- `SystemSetting` model s `findOrCreate` pristupom (bez zasebne migracije, oslanjanje na `sync({ alter: true })`)
- Prikaz progres bara u sidebaru s promjenom boje pri dostizanju limita

**Šta je tim izmijenio:**
- Inicijalno je `AdminApplicationLimitPanel` bio kreiran za admin dashboard - tim je ispravno uočio da limit postavlja koordinator (fakultet), ne administrator, pa je panel preseljen u `KoordinatorDashboard`

**Šta je tim odbacio:**
- `AdminApplicationLimitPanel.jsx` i `AdminApplicationLimitPanel.css` - zamijenjeni s `KoordinatorLimitPanel.jsx` zbog pogrešno identificirane uloge

**Rizici, problemi ili greške:**
- Vrijednost limita nema gornju granicu validacije - koordinator može unijeti npr. 99, što je funkcionalno ali možda nepraktično
- AI je inicijalno pogrešno identificirao administratora kao korisnika koji postavlja limit, umjesto koordinatora - korekcija zahtijevala dodatni krug komunikacije

---

## Unos 4 — Implementacija javne stranice za pregled praksi (US-11)

| Polje | Sadržaj |
|---|---|
| **Datum** | 23.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Osposobljavanje dugmeta "Pregledaj prakse" na landing page-u - javna stranica za pregled aktivnih oglasa bez prijave |

**Kratak opis upita:**

> Osposobiti dugme "Pregledaj prakse" na landing page-u tako da vodi na novu javnu stranicu gdje neprijavljeni korisnici mogu pregledati sve aktivne prakse i filtrirati ih, ali se ne mogu prijaviti. Svako dugme "Prijavi se" na kartici oglasa otvara modal koji poziva korisnika na registraciju ili prijavu.

**Šta je AI predložio ili generisao:**

- Uklanjanje `authenticate` middlewarea s `GET /listings/active` rute u `listings.router.js` - ruta postaje javno dostupna bez JWT tokena; sve ostale rute ostaju zaštićene
- `PublicListingsPage.jsx` - nova stranica s fiksnim sidebarom (Oblast, Tip prakse, Naknada filteri s radio buttons), search inputom, prikazom kartica oglasa i bottom CTA stripom; koristi `apiRequest` iz postojećeg `services/api.js` umjesto direktnog `fetch` poziva
- `PublicListingsPage.css` - CSS koji koristi iste `sd-*` CSS varijable i klase kao ostatak aplikacije, sa zasebnim `pl-*` prefiksima za nove komponente; sadrži responzivne breakpointe za 900px, 768px i 480px
- `LoginPromptModal` komponentu unutar `PublicListingsPage.jsx` - modal koji se prikazuje pri kliknu na "Prijavi se" dugme, nudi linkove na `/auth` i `/register`
- Novu rutu `/listings/public` u `routes_index.jsx`
- Izmjenu linka "Pregledaj prakse" na `LandingPage.jsx` - `to="/listings/public"` umjesto `to="/listings"`
- `useEffect` koji automatski preusmjerava već prijavljenog korisnika na `/listings`

**Šta je tim prihvatio:**
- Uklanjanje `authenticate` s `/active` rute kao ispravno rješenje - ruta vraća samo javne podatke oglasa, bez osjetljivih informacija
- Korištenje `apiRequest` iz `services/api.js` umjesto direktnog `fetch` - konzistentno s ostatkom aplikacije i koristi Vite proxy konfiguraciju
- Dizajn s fiksnim sidebarom i karticama koje nasljeđuju `sd-card-wrap` stilove
- Modal za neprijavljene korisnike umjesto direktnog blokiranja pregleda

**Šta je tim izmijenio:**
- Inicijalna implementacija koristila je direktan `fetch` s `import.meta.env.VITE_API_URL` - zamijenjena s `apiRequest` nakon što se pokazalo da `VITE_API_URL` nije postavljen u frontend `.env` fajlu, pa je fetch odlazio na Vite dev server umjesto na backend

**Šta je tim odbacio:**
- Ništa

**Rizici, problemi ili greške:**
- `GET /listings/active` je sada javna ruta - ako endpoint u budućnosti počne vraćati osjetljive podatke (npr. podaci o prijavama), treba ponovo dodati `authenticate`
- Inicijalni `fetch` poziv vraćao je HTML umjesto JSON-a jer `VITE_API_URL` nije bio definisan u frontend okruženju - riješeno prelaskom na `apiRequest` koji koristi Vite proxy (`/api` fallback)
- React StrictMode u development modu poziva `useEffect` dvaput, što je uzrokovalo dvostruke API pozive - nije kritičan problem u produkciji

---
## Unos 5 — Implementacija podešavanja tipova notifikacija (US-55)

| Polje | Sadržaj |
|---|---|
| **Datum** | 23.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | ChatGPT (GPT-5.5) |
| **Ko je koristio** | Irma Lemeš |
| **Svrha korištenja** | Implementacija US-55 — podešavanje tipova notifikacija za studente |

**Kratak opis upita:**

> Implementirati mogućnost da student bira koje vrste notifikacija želi primati (email i in-app) za podnesenu, odobrenu i odbijenu prijavu na praksu.

**Šta je AI predložio ili generisao:**

- `notification_preferences` tabelu i `NotificationPreference.js` Sequelize model
- `notificationPreferences.service.js` i `notificationPreferences.routes.js`
- API rute:
  - `GET /api/notification-preferences`
  - `PUT /api/notification-preferences`
- Helper funkcije:
  - `canSendInApp`
  - `canSendEmail`
- Integraciju preferenci u:
  - `applications.service.js`
  - `koordinator.service.js`
- Frontend API funkcije:
  - `getNotificationPreferences`
  - `updateNotificationPreferences`
- `NotificationPreferencesSection` komponentu unutar `ProfilePage.jsx`
- Checkbox UI za uključivanje/isključivanje email i in-app notifikacija

**Šta je tim prihvatio:**
- Kompletnu backend i frontend implementaciju
- Razdvajanje email i in-app preferenci
- Immediate apply logiku bez potrebe za reloginom

**Šta je tim izmijenio:**
- `canSendInApp` i `canSendEmail` helperi su premješteni iz routes fajla u service sloj

**Šta je tim odbacio:**
- JSON kolonu za preference — korištene su eksplicitne boolean kolone

**Rizici, problemi ili greške:**
- `401 Unauthorized` pri testiranju zbog isteklog JWT tokena — riješeno novim loginom

---

## Unos 6 — Dvostepeno odobravanje prijave na praksu

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Codex (GPT-5) |
| **Ko je koristio** | haristucakovic |
| **Svrha korištenja** | Refaktorisanje toka prijave tako da koordinator prvo proslijedi prijavu kompaniji, a konačno odobrenje daje kompanija |

**Kratak opis upita:**

> Potrebno je razdvojiti odluku koordinatora od konačne odluke kompanije, sakriti prijave od kompanije dok ih koordinator ne odobri i jasno prikazati fazu prijave studentu.

**Šta je AI predložio ili generisao:**

- Dodani su statusi koordinatora i kompanije uz zadržavanje postojećeg ukupnog statusa prijave
- Prilagođene su akcije koordinatora, kompanije i filtriranje vidljivih prijava
- Dodane su company akcije za uži krug, odobravanje i odbijanje kandidata
- Ažurirani su statusi i prikaz faza na student dashboardu te detalji prijave za koordinatora
- Usklađene su notifikacije i pristup dokumentima sa novim tokom odobravanja

**Šta je tim prihvatio:**
- Dvostepeni tok odobravanja i jasne Bosnian statusne poruke u interfejsu

**Šta je tim izmijenio:**
- Uklonjeni su interni tekstovi o sprintovima iz korisničkog interfejsa i stabilizovan je raspored filter kartica u pregledu prijava

**Šta je tim odbacio:**
- Nije dodavana nova funkcionalnost izvan toka prijave i potrebnih UI korekcija

**Rizici, problemi ili greške:**
- Postojeće prijave zahtijevaju backfill statusa pri pokretanju aplikacije kako bi se pravilno uklopile u novi tok

---

## Unos 7 — Implementacija logike zatvaranja i arhiviranja oglasa i pripadajućih UI komponenti

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Gemini (gemini-pro) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija i povezivanje akcija za ručno/automatsko zatvaranje oglasa, arhiviranje zatvorenih oglasa, te rješavanje kaskadnih validacija na backendu i frontend UI konzistentnosti. |

**Kratak opis problema i zahtjeva**
Unutar upravljačke ploče za kompanije (`KompanijaDashboard.jsx`), bilo je potrebno omogućiti kompanijama puni životni ciklus oglasa za prakse kroz dvije ključne akcije:
1. Zatvaranje oglasa: Prekidanje aktivnog oglasa (bilo ručno, bilo automatski prepoznavanjem isteklog roka prijave) čime oglas prestaje biti aplicirljiv za studente.
2. Arhiviranje oglasa: Sklanjanje već zatvorenog oglasa iz primarnih tabova u historijsku arhivu. 

Glavni izazov bio je rigidni uslov na backendu: oglas se **ne može** direktno arhivirati ako je u bazi podataka još uvijek u stanju `AKTIVAN`, čak i ako je njegov `rokPrijave` hronološki prošao. Pokušaj arhiviranja takvog oglasa bacao je sistemsku grešku. Takođe, bilo je potrebno osigurati sigurne potvrde akcija od strane korisnika bez korištenja ružnih nativnih browser prozora.

---

**Šta je predloženo i implementirano**

A. Ulančana logika "Zatvori pa arhiviraj" (Chain-Action Workflow)
Kako bi se izbjegao prekid u radu i padanje backend validacije za oglase kojima je istekao rok, a vode se kao aktivni, na frontendu je implementiran pametni asinhroni lanac akcija:
- Kada korisnik klikne na **"Arhiviraj"**, sistem prvo provjerava trenutno stanje i rok oglasa.
- Ako je oglas istekli `AKTIVAN`, aplikacija pod haubom automatski prvo šalje tihi zahtjev na API endpoint za zatvaranje oglasa (`closeListing`).
- Tek nakon što stigne uspješan odgovor (`200 OK`) i status u bazi pređe u `ZATVOREN`, skripta u istom koraku automatski šalje drugi zahtjev za arhiviranje (`archiveListing`).
- Na ovaj način korisnik završava kompletan posao jednim klikom, a backend pravila su u potpunosti ispoštovana.

B. Integracija `CustomConfirmModal` komponente
Za eliminaciju nativnog `window.confirm()` dijaloga, implementiran je prilagođeni modalni prozor integrisan u React stanje dashboarda:
- Prije izvršavanja funkcije `handleCloseListing` ili `handleArchiveListing`, aktivira se modal koji prima tekstualno upozorenje prilagođeno specifičnoj akciji (npr. *"Jeste li sigurni da želite zatvoriti ovaj oglas? Ova akcija je nepovratna."*).
- Modal koristi `danger` stilske klase za destruktivne akcije (zatvaranje) i `warning` klase za premještanje podataka (arhiviranje), prateći cjelokupni vizuelni identitet i tamnu temu (dark mode) aplikacije.

C. Unifikacija CSS-a za akciona dugmad (`.cd-listing-actions-wrapper`)
Uklonjeni su svi nekonzistentni inline stilovi sa dugmadi unutar kartica oglasa. 
- U `KompanijaDashboard.css` kreirana je nova klasa `.cd-listing-actions-wrapper`.
- Ova klasa postavlja standardizovani flexbox raspored sa predefinisanim razmacima (`gap`) i fiksnom visinom elemenata (38px).
- Time je osigurano da dugmad "Zatvori oglas", "Arhiviraj" i "Vrati iz arhive" imaju identične dimenzije, poravnanje i efekte prelaza (`transition`), bez obzira na to u kojem se tabu kartica oglas nalazi.

**Prihvaćena rješenja i ishodi**
- **Potpuno prihvaćeno:** Automatsko ulančavanje API poziva koje sprječava greške pri arhiviranju isteklih oglasa.
- **Poboljšan UX:** Zamjena nativnih pop-up prozora elegantnim i sigurnim modalima.
- **Čistiji kod:** Izbacivanje inline stilova iz JSX-a i centralizacija CSS pravila za upravljačke elemente oglasa.

**Rizici i napomene za stabilnost**
- **Rizik od prekida mrežnog lanca:** Ako prvi API poziv (zatvaranje) uspije, a drugi (arhiviranje) padne uslijed mrežne greške, oglas će ostati u stanju `ZATVOREN` ali neće biti arhiviran. UI je osiguran tako da u tom slučaju ispravno osvježi stanje i ostavi oglas u tabu za zatvorene oglase, odakle ga korisnik može ponovo ručno arhivirati.

---

## Unos 8 — Pregled statistike prijava (US-50)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija pregleda statistike prijava za kompaniju (US-50) — grafički prikaz po oglasima, godini studija i fakultetu, s filterima po statusu i oglasu |

**Kratak opis upita:**

> Kompanija treba imati pregled statistike prijava na vlastite oglase u formi grafikona. Traženo je: tab-based navigacija između prikaza po oglasima, po godini studija i po fakultetu; filter po statusu prijave (PODNESENA, U_RAZMATRANJU, ODOBRENA, ODBIJENA, ODUSTAO); filter po konkretnom oglasu (vidljiv samo kada nije aktivan tab "Po oglasima"). Backend treba da podržava sve kombinacije filtera.

**Šta je AI predložio ili generisao:**

- `StatistikaShell` komponenta unutar `KompanijaDashboard.jsx` — tab navigacija s tabovima: Po oglasima, Po godini studija, Po fakultetu
- Recharts `BarChart` s `ResponsiveContainer`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Cell` za svaki tab; odvojena logika za tab "Po odsjeku" (jedan chart po fakultetu)
- `chartConfig` mapa koja za svaki tab definiše `data`, `nameKey`, `color` i `emptyMsg`
- `statusFilter` i `oglasFilter` state varijable; `handleTabChange` koji resetira `oglasFilter` pri prelasku na tab "Po oglasima"
- Filter traka stilizovana kao pill-shaped toolbar: klase `cd-stat-filter-group`, `cd-stat-filter-divider`, `cd-stat-filter-label` u `KompanijaDashboard.css`; oglas `<select>` prikazuje se samo kad `activeTab !== 'prijave'`
- Backend `getApplicationStatistics(userId, { fakultetID, odsjekID, godina, status, oglasID })` — `status` dodan u WHERE klauzulu; lista svih kompanijnih oglasa (`oglasi`) vraćena u odgovoru za populaciju dropdown-a
- `GET /applications/statistics` ruta s query parametrima `status` i `oglasID`

**Šta je tim prihvatio:**
- Kompletnu backend i frontend implementaciju statistike s filterima
- `chartConfig` pristup za tab-based renderovanje jednim blokom JSX-a
- Pill-shaped filter traku s grupiranim labelama i vertikalnim razdjelnikom između filtera
- Oglas dropdown koji se dinamički popunjava listom kompanijnih oglasa s backenda

**Šta je tim izmijenio:**
- `current` varijabla (`chartConfig[activeTab]`) inicijalno je bila uklonjena tokom refaktorisanja — vraćena nakon što je uzrokovala runtime grešku

**Šta je tim odbacio:**
- Ništa

**Rizici, problemi ili greške:**
- `chartConfig` je bio obrisan tokom ranijeg refaktorisanja što je uzrokovalo `undefined` grešku za `current` — otkriveno i ispravljeno odmah

---

## Unos 9 — Historija aktivnosti (Audit log) (US-51)

| Polje | Sadržaj |
|---|---|
| **Datum** | 25.05.2026 |
| **Sprint broj** | 9 |
| **Alat** | Claude Code (claude-sonnet-4-6) |
| **Ko je koristio** | zpandza1 |
| **Svrha korištenja** | Implementacija US-51 — historija svih ključnih akcija u sistemu dostupna administratoru |

**Kratak opis upita:**

> Administrator treba imati uvid u historiju svih ključnih akcija u sistemu: registracije korisnika, promjene statusa prijava, brisanje naloga, uređivanje oglasa i odustajanje od prakse. Svaki zapis treba sadržavati korisnika, vrijeme i tip akcije. Pregled je dostupan samo administratoru.

**Šta je AI predložio ili generisao:**

- `AuditLog.js` Sequelize model — tabela `audit_logs` s kolonama: `userID`, `userName`, `userEmail`, `userRole`, `actionType` (STRING 80), `details` (JSONB), `createdAt`; bez Sequelize `timestamps`, s `constraints: false` asocijacijom prema `User`
- `audit.service.js` — centralizovana servisna komponenta s: konstantama `ACTION_TYPES` (USER_REGISTERED, APPLICATION_STATUS_CHANGED, USER_DELETED, LISTING_UPDATED, INTERNSHIP_WITHDRAWN), `resolveUserSnapshot` koji dohvata ime/email/ulogu korisnika po ID-u, `logAudit` s try/catch koji ne prekida tok akcije ako bilježenje ne uspije, `getAuditLogs` s limitom (max 500, default 100)
- Integracija `logAudit` poziva u: `auth.service.js` (registracija studenata, kompanija, koordinatora), `admin.service.js` (brisanje naloga, promjena statusa prijave, odustajanje od prakse), `approval.service.js` (odobravanje i odbijanje prijave od strane koordinatora), `listings.service.js` (uređivanje oglasa), `koordinator.service.js` (odluka o prijavi), `users.service.js` (odustajanje od prakse)
- `GET /admin/audit-logs` ruta zaštićena `authorize('ADMIN')` middlewareom; query parametri `actionType` i `limit`
- `getAuditLogs` funkcija u frontend `adminService.js`
- `AuditLogView` komponenta unutar `AdminDashboard.jsx` — tabela s kolonama: korisnik, email, uloga, tip akcije (color-coded badge), opis akcije, datum/vrijeme; lazy loading (dohvat tek pri prvom kliknu na tab); `getAuditSummary` helper za čitljiv opis po tipu akcije; `getAuditTypeClass` za CSS klasu badge-a
- Navigacijska stavka "Historija aktivnosti" u admin sidebaru

**Šta je tim prihvatio:**
- Centralizovani `audit.service.js` koji pozivaju svi moduli — konzistentno bilježenje bez dupliciranja logike
- `resolveUserSnapshot` s fallback mehanizmom koji prima prethodno dohvaćene podatke ili sam dohvaća po `userID`
- `try/catch` u `logAudit` koji osigurava da neuspjeh bilježenja ne prekida korisničku akciju
- Color-coded badge za tip akcije i čitljiv opis putem `getAuditSummary`
- Lazy loading audit logova u admin dashboardu

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**
- Tabela `audit_logs` mora biti kreirana u Supabase dashboardu — nije automatizirano migracijom
- `logAudit` tiho guta greške (catch vraća `null`) — neuspješna bilježenja nisu vidljiva u logovima servera osim ako se greška ne pojavi u aplikacijskom logu