# 8. Architecture / Technical Overview - PraksaHub

> Dokument namijenjen osobi koja prvi put gleda projekat i želi razumjeti tehničku strukturu sistema.

---

## 1. Kratak opis sistema

**PraksaHub** je web platforma za upravljanje studentskim praksama. Sistem povezuje četiri vrste korisnika - studente, kompanije, koordinatore i administratore - kroz cjelokupan životni ciklus prakse: od oglasa i prijave, preko odobrenja i ugovora, do praćenja aktivnosti, evaluacija i izvještaja.

---

## Sadržaj
 
- [1. Kratak opis sistema](#1-kratak-opis-sistema)
- [2. Tehnološki stack](#2-tehnološki-stack)
- [3. Visokonivoska arhitektura](#3-visokonivoska-arhitektura)
- [4. Kako se komponente međusobno povezuju](#4-kako-se-komponente-međusobno-povezuju)
- [5. Frontend](#5-frontend)
  - [Lokacija koda](#lokacija-koda)
  - [Stranice i uloge](#stranice-i-uloge)
  - [Routing i zaštita ruta](#routing-i-zaštita-ruta)
  - [Komunikacija s backendom](#komunikacija-s-backendom)
- [6. Backend](#6-backend)
  - [Lokacija koda](#lokacija-koda-1)
  - [API rute (pregled)](#api-rute-pregled)
  - [Zakazani posao](#zakazani-posao)
- [7. Baza podataka](#7-baza-podataka)
  - [Konekcija](#konekcija)
  - [Modeli](#modeli-23-entiteta)
- [8. Vanjski servisi](#8-vanjski-servisi)
  - [Brevo (email)](#brevo-email)
  - [Supabase Storage](#supabase-storage)
  - [Render (deployment)](#render-deployment)
- [9. Sigurnosne odluke](#9-sigurnosne-odluke)

---

## 2. Tehnološki stack

| Sloj | Tehnologija | Verzija |
|---|---|---|
| **Frontend** | React (Vite) | React 18, Vite 5 |
| **Backend** | Node.js + Express | Express 4 |
| **Baza podataka** | PostgreSQL (Supabase) | Sequelize 6 ORM |
| **File storage** | Supabase Storage | @supabase/supabase-js 2 |
| **Email servis** | **Brevo** (REST API) | REST API v3 |
| **Autentifikacija** | JWT (jsonwebtoken) | JWT 9 |
| **Upload fajlova** | Multer (memory storage) | Multer 2 |
| **Zakazani poslovi** | Node.js `setInterval` | ugrađeno |
| **Deployment** | Render | - |
| **Testiranje** | Jest + Supertest | Jest 29 |

---

## 3. Visokonivoska arhitektura

```
┌─────────────────────────────────────────────────────────────────────┐
│                          KLIJENT (Browser)                          │
│                                                                     │
│   React SPA (Vite)                                                  │
│   ├── AuthContext  (JWT u sessionStorage)                           │
│   ├── React Router v6  (zaštićene rute po roli)                     │
│   └── fetch() → /api/*  (Bearer token u headeru)                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │  HTTPS / REST JSON
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Express.js)                          │
│                                                                     │
│  Presentation Layer                                                 │
│  └── /api/* rute (14 router fajlova)                                │
│                                                                     │
│  Middleware                                                         │
│  ├── authenticate()   - JWT verifikacija                            │
│  ├── authorize()      - RBAC provjera role                          │
│  └── uploadDocuments  - Multer (memory, max 150 KB)                 │
│                                                                     │
│  Business Layer                                                     │
│  ├── Controllers  (thin - delegiraju na servise)                    │
│  └── Services     (sva poslovna logika)                             │
│                                                                     │
│  Infrastructure Layer                                               │
│  ├── Sequelize ORM  →  PostgreSQL (Supabase)                        │
│  ├── supabase.js    →  Supabase Storage (fajlovi)                   │
│  └── email.service  →  Brevo API (transakcijski emailovi)           │
│                                                                     │
│  Jobs                                                               │
│  └── practiceCompletion.job  (interval: 24h)                        │
└──────────────┬─────────────────────────┬────────────────────────────┘
               │ SQL (SSL)               │ HTTPS
               ▼                         ▼
   ┌───────────────────┐      ┌──────────────────────┐
   │  Supabase         │      │  Brevo               │
   │  PostgreSQL DB    │      │  Email API           │
   │  + File Storage   │      │  (transakcijski      │
   │                   │      │   emailovi)          │
   └───────────────────┘      └──────────────────────┘

  Backend i frontend deployani na: Render
```

---

## 4. Kako se komponente međusobno povezuju

```
Browser
  └─ fetch('/api/...')  +  Authorization: Bearer <jwt>
        │
        ▼
Express app.js
  └─ authenticate()  →  dekodira JWT, stavlja {id, role} u req.user
  └─ authorize()     →  provjerava role, vraća 403 ako ne odgovara
  └─ Controller      →  validira input, poziva Service
        │
        ▼
Service
  ├─ Sequelize model  →  SQL upit prema Supabase PostgreSQL
  ├─ supabase.js      →  upload/download fajlova iz Supabase Storage
  └─ email.service    →  POST https://api.brevo.com/v3/smtp/email
        │
        ▼
Response JSON  →  Browser (React state update)
```

---

## 5. Frontend

### Lokacija koda
```
projekat/frontend/src/
├── main.jsx                  # Entry point, mountuje App + providere
├── index.css                 # Globalni bazni stilovi
├── App.jsx                   # Wraps AuthProvider + ThemeProvider + Router
├── routes/
│   └── routes_index.jsx      # Sve rute aplikacije, ProtectedRoute guard
├── context/
│   ├── AuthContext.jsx        # Globalni auth state (token + user objekt)
│   └── ThemeContext.jsx       # Light/dark theme
├── pages/                    # Jedna stranica = jedan ekran
│   ├── LandingPage.jsx
│   ├── AuthPage.jsx + .css
│   ├── RegisterPage.jsx + .css
│   ├── ForgotPasswordPage.jsx
│   ├── ResetPasswordPage.jsx
│   ├── VerifyEmailPage.jsx
│   ├── StudentDashboard.jsx + .css
│   ├── KompanijaDashboard.jsx + .css
│   ├── KoordinatorDashboard.jsx + .css
│   ├── AdminDashboard.jsx + .css
│   ├── ProfilePage.jsx + .css
│   ├── CompanyProfilePage.jsx + .css
│   ├── PublicListingsPage.jsx + .css
│   ├── ListingsPage.jsx
│   ├── ApplicationsPage.jsx
│   ├── DashboardPage.jsx
│   ├── PrijavniVodic.jsx + .css
│   ├── PrivacyPolicy.jsx
│   ├── TermsAndConditions.jsx
│   ├── CookiesPolicy.jsx
│   └── NotFoundPage.jsx
├── modules/                  # Feature moduli grupovani po domenima
│   ├── auth/
│   │   └── ProtectedRoute.jsx
│   ├── evaluations/
│   │   ├── EvaluacijaStudenta.jsx
│   │   ├── EvaluacijaKompanije.jsx
│   │   └── Evaluacija.css
│   ├── koordinator/
│   │   ├── KoordinatorLimitPanel.jsx
│   │   ├── OdobravanjePregled.jsx
│   │   ├── PraksePregled.jsx
│   │   ├── PrijavaDetalji.jsx
│   │   ├── PrijavePregled.jsx
│   │   └── StudentListaPregled.jsx
│   ├── listings/
│   │   └── EditOglas.jsx
│   ├── applications/         # (placeholder, .gitkeep)
│   ├── dashboard/            # (placeholder, .gitkeep)
│   └── profile/              # (placeholder, .gitkeep)
├── services/                 # Svi API pozivi prema backendu
│   ├── api.js                # Bazna fetch funkcija s JWT headerom
│   ├── auth.service.js
│   ├── adminService.js
│   ├── applicationsService.js
│   ├── evaluationService.js
│   ├── favouritesService.js
│   ├── koordinatorService.js
│   ├── listingsService.js
│   ├── prakseService.js
│   ├── userService.js
│   ├── companyProfile.service.js
│   └── companyPublic.service.js
├── hooks/
│   └── useApplicationLimit.js
├── utils/
│   ├── applicationStatus.js  # Statusne oznake i boje prijava
│   └── practiceLifecycle.js  # Labele i tonovi za status prakse
├── data/
│   └── mockPrakse.js         # Mock podaci za razvoj
└── styles/
    ├── variables.css          # CSS custom properties (boje, fontovi)
    └── responsive.css         # Media query breakpointi
```

### Stranice i uloge

| Stranica | Pristup |
|---|---|
| `LandingPage` | Javna |
| `AuthPage`, `RegisterPage` | Javna |
| `ForgotPasswordPage`, `ResetPasswordPage`, `VerifyEmailPage` | Javna |
| `PublicListingsPage` | Javna |
| `PrivacyPolicy`, `TermsAndConditions`, `CookiesPolicy` | Javna |
| `PrijavniVodic` | Javna (vodič za prijavu) |
| `StudentDashboard` | `STUDENT` |
| `KompanijaDashboard` | `COMPANY` |
| `KoordinatorDashboard` | `COORDINATOR` |
| `AdminDashboard` | `ADMIN` |
| `ProfilePage` | Zaštićeno (svi prijavljeni) |
| `CompanyProfilePage` | `STUDENT` |
| `ListingsPage`, `ApplicationsPage`, `DashboardPage` | Zaštićeno (generičke) |
| `NotFoundPage` | - (fallback ruta `*`) |

### Routing i zaštita ruta

Rute zaštićene komponentom `ProtectedRoute` koja čita `AuthContext` i provjera da li korisnikova rola odgovara `allowedRoles`. Neautorizirani korisnici se preusmjeravaju na login.

```jsx
<Route path="/dashboard/student" element={
  <ProtectedRoute allowedRoles={['STUDENT']}>
    <StudentDashboard />
  </ProtectedRoute>
} />
```

### Komunikacija s backendom

Svi API pozivi idu kroz `services/api.js`. JWT token se čuva u `sessionStorage` (nestaje zatvaranjem taba) i šalje u svakom zahtjevu:

```js
headers: {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
}
```

---

## 6. Backend

### Lokacija koda
```
projekat/backend/src/
├── server.js                      # Startup: sync DB, backfill, pokretanje servera
├── app.js                         # Express app: CORS, JSON parser, registracija ruta
├── presentation/routes/           # 14 router fajlova (po domenskom entitetu)
├── business/
│   ├── controllers/               # Thin kontroleri - čitaju req, pozivaju service, pišu res
│   └── services/                  # Sva poslovna logika i upiti prema bazi
├── infrastructure/
│   ├── database/
│   │   ├── db.js                  # Sequelize instanca (PostgreSQL, SSL)
│   │   ├── models/                # 23 Sequelize modela + index.js s relacijama
│   │   └── migrations/            # Sequelize migracije
│   └── supabase.js                # Supabase Storage klijent
├── middleware/
│   ├── auth.middleware.js         # JWT verifikacija → req.user
│   ├── rbac.middleware.js         # Role-based access control
│   └── upload.middleware.js       # Multer (PDF/DOC, max 150 KB)
└── jobs/
    └── practiceCompletion.job.js  # Automatsko završavanje isteklih praksi (24h)
```

### API rute (pregled)

| Prefiks | Opis |
|---|---|
| `/api/auth` | Registracija, login, verifikacija emaila, reset lozinke |
| `/api/users` | Profil korisnika, update studenta/kompanije |
| `/api/listings` | Oglasi za praksu (CRUD za kompanije) |
| `/api/applications` | Prijave studenata na oglase |
| `/api/prakse` | Aktivne prakse, aktivnosti, prisustvo |
| `/api/koordinator` | Pregled i upravljanje praksama od strane koordinatora |
| `/api/approval-requests` | Zahtjevi za odobrenje |
| `/api/evaluations` | Evaluacije studenata i kompanija |
| `/api/notifications` | In-app notifikacije |
| `/api/notification-preferences` | Postavke notifikacija |
| `/api/admin` | Admin panel - upravljanje korisnicima i sistemom |
| `/api/companies` | Javni profili kompanija |
| `/api/dokumenti` | Upload i upravljanje dokumentima |
| `/api/favourites` | Omiljeni oglasi |

### Zakazani posao

`practiceCompletion.job.js` se pokreće 60 sekundi nakon starta servera, a zatim svakih 24 sata. Automatski zatvara prakse kojima je istekao datum i okida notifikacije/emailove.

---

## 7. Baza podataka

### Konekcija

PostgreSQL baza hostovana na **Supabase**. Konekcija ide preko connection poolera (`pooler.supabase.com:5432`) sa SSL-om.

Sequelize ORM se koristi za sve upite. Baza se sinkronizira pri startu (`sequelize.sync({ alter: true })`).

### Modeli (23 entiteta)

```
User                    - baza za sve korisnike (email, passwordHash, role, isVerified)
├── Student             - proširuje User (ime, indeks, fakultetID, odsjekID)
├── Kompanija           - proširuje User (naziv, djelatnost, opis)
└── Koordinator         - proširuje User (fakultetID, odsjekID)

Fakultet → Odsjek
Oglas                   - oglas za praksu (kompanijaID, pozicija, opis, rok)
PrijavaNaPraksu         - studentova prijava (studentID, oglasID, status, koordinatorID)
Praksa                  - aktivna praksa nastala iz prijave (prijavaID, datumi, status)
├── Aktivnost           - dnevnik aktivnosti na praksi
├── Prisustvo           - evidencija prisustva
├── EvaluacijaStudenta  - evaluacija studenta od kompanije
├── EvaluacijaKompanije - evaluacija kompanije od studenta
├── Ugovor              - ugovor o praksi
└── Izvjestaj           - koordinatorov izvještaj

Dokument                - uploadovani fajlovi (student_id, oglas_id, prijava_id)
OmiljeniOglas           - omiljeni oglasi studenata
Notifikacija            - in-app notifikacije
NotificationPreference  - postavke email/in-app notifikacija po studentu
SystemSetting           - konfigurabilne sistemske postavke (npr. limit prijava)
AuditLog                - log akcija
```

---

## 8. Vanjski servisi

### Brevo (email)

Svi transakcijski emailovi šalju se direktno putem Brevo REST API-ja (`https://api.brevo.com/v3/smtp/email`). Implementacija se nalazi u `backend/src/business/services/email.service.js`.

Emailovi koji se šalju:

| Okidač | Email |
|---|---|
| Registracija | Verifikacija email adrese |
| Zaboravljena lozinka | Link za reset lozinke |
| Promjena statusa prijave | Obavještenje studentu |
| Odobrenje/odbijanje prakse | Obavještenje studentu i kompaniji |
| Završetak prakse | Obavještenje svim stranama |
| Admin akcije | Sistemska obavještenja |

Konfiguracija u `.env`:
```
BREVO_API_KEY=...
BREVO_SENDER_EMAIL=...
BREVO_SENDER_NAME=...
```

HTML u emailovima se ručno konstruiše u `email.service.js` uz `escapeHtml()` sanitizaciju korisničkih podataka.

### Supabase Storage

Dokument fajlovi (PDF, DOC, DOCX) uploaduju se u Supabase Storage bucket putem `supabase.js` klijenta. Multer prima fajl u memoriju (`memoryStorage`), a servis ga prosljeđuje Supabase-u. Limit veličine fajla je **150 KB**.

### Render (deployment)

I backend i frontend deployani su na **Render** platformi. Backend se pokreće kao Web Service (`node src/server.js`), a frontend kao Static Site (Vite build). Environment varijable konfigurišu se kroz Render dashboard.

---

## 9. Sigurnosne odluke

### Autentifikacija (JWT)

- Backend izdaje JWT pri loginu koji sadrži `{ id, role }`.
- Token se verifikuje u `auth.middleware.js` na svakom zaštićenom endpointu.
- Frontend čuva token u **`sessionStorage`** (ne `localStorage`) - token se automatski briše zatvaranjem taba/prozora, čime se smanjuje rizik od XSS krađe sesije.

### Autorizacija (RBAC)

`rbac.middleware.js` pruža `authorize(...roles)` middleware koji se primjenjuje na sve osjetljive rute. Uloge su: `STUDENT`, `COMPANY`, `COORDINATOR`, `ADMIN`.

Primjer:
```js
router.get('/admin/users', authenticate, authorize('ADMIN'), controller)
```

### Upload fajlova

- Multer filtrira MIME tipove - prihvataju se isključivo `application/pdf`, `application/msword` i `.docx`.
- Limit veličine je 150 KB - sprječava upload velikih fajlova.
- Fajlovi se ne čuvaju na disku servera nego direktno prosljeđuju Supabase Storage-u.

### Email sigurnost

- Svi korisnički podaci koji se ugrađuju u HTML emailove prolaze kroz `escapeHtml()` funkciju, čime se sprečava HTML injection u email sadržaju.

### Baza podataka

- Konekcija prema Supabase koristi SSL (`require: true`), čime je enkriptovan saobraćaj prema bazi.
- Lozinke se hashuju bcryptom (`bcrypt` dependency) prije pohrane u `User` modelu.

### Audit log

`AuditLog` model bilježi administrativne akcije s referencom na korisnika (`userID`), što omogućava naknadnu analizu i odgovornost.

---

