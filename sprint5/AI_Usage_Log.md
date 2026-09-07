# AI Usage Log — Sprint 5

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
