# 2 & 3. Deployment Procedura i CD Pipeline — PraksaHub

---

## Sadržaj

- [1. Naziv aplikacije i opis arhitekture](#1-naziv-aplikacije-i-opis-arhitekture)
- [2. Tehnologije i verzije](#2-tehnologije-i-verzije)
- [3. Potrebni alati](#3-potrebni-alati)
- [4. Environment varijable](#4-environment-varijable)
- [5. Lokalno pokretanje backenda](#5-lokalno-pokretanje-backenda)
- [6. Lokalno pokretanje frontenda](#6-lokalno-pokretanje-frontenda)
- [7. Baza podataka](#7-baza-podataka)
- [8. Migracije i seed podaci](#8-migracije-i-seed-podaci)
- [9. Pokretanje testova](#9-pokretanje-testova)
- [10. Produkcijski deployment (Render)](#10-produkcijski-deployment-render)
- [11. CD Pipeline — GitHub Actions](#11-cd-pipeline--github-actions)
- [12. Link na deployment](#12-link-na-deployment)
- [13. Poznata ograničenja deploymenta](#13-poznata-ograničenja-deploymenta)
- [14. Najčešći problemi i rješenja](#14-najčešći-problemi-i-rješenja)

---

## 1. Naziv aplikacije i opis arhitekture

**Naziv:** PraksaHub — Sistem za upravljanje studentskim praksama

**Arhitektura:** Tri odvojena sloja deployovana kao tri neovisne usluge:

```
Browser
  └── React SPA (Render Static Site)
         │ HTTPS /api/*
         ▼
    Express API (Render Web Service)
         │ SSL/TCP
         ▼
    PostgreSQL (Supabase Cloud)
```

| Komponenta | Platforma | URL |
|---|---|---|
| Frontend (React/Vite) | Render Static Site | https://si-grupa4-1-3biq.onrender.com |
| Backend (Node.js/Express) | Render Web Service | https://si-grupa4-xfx9.onrender.com |
| Baza podataka (PostgreSQL) | Supabase Cloud | aws-1-eu-central-1.pooler.supabase.com |

Frontend šalje sve API zahtjeve na backend (`VITE_API_URL`). Backend se spaja na Supabase PostgreSQL bazu putem SSL konekcije. Fajlovi (PDF dokumenti) čuvaju se u Supabase Storage. Emailovi se šalju putem Brevo REST API-ja.

---

## 2. Tehnologije i verzije

| Sloj | Tehnologija | Verzija |
|---|---|---|
| Frontend framework | React | 18.3.1 |
| Frontend bundler | Vite | 5.4.8 |
| Frontend routing | React Router DOM | 6.26.2 |
| Backend runtime | Node.js | 18+ (preporučeno 22) |
| Backend framework | Express.js | 4.21.2 |
| ORM | Sequelize | 6.37.3 |
| Baza podataka | PostgreSQL | 15 (Supabase) |
| Autentifikacija | JWT (jsonwebtoken) | 9.0.2 |
| Upload fajlova | Multer | 2.1.1 |
| File storage | Supabase Storage | @supabase/supabase-js 2 |
| Email servis | Brevo REST API | v3 |
| Testiranje | Jest + Supertest | Jest 29.7.0 |
| Package manager | npm | 9+ |

---

## 3. Potrebni alati

Za lokalno pokretanje sistema potrebno je imati instalirano:

- **Node.js** v18 ili noviji — https://nodejs.org
- **npm** v9 ili noviji (dolazi s Node.js)
- **Git** — https://git-scm.com
- Pristup Supabase projektu (connection string i service role key)
- Pristup Brevo accountu (API ključ i sender email)

#### Kreiranje Brevo accounta i dobijanje API ključa

1. Otvoriti https://app.brevo.com i registrovati se (besplatno)
2. Nakon verifikacije email adrese, prijaviti se na dashboard
3. U gornjem desnom uglu kliknuti na ime accounta → **SMTP & API**
4. Odabrati tab **API Keys** → kliknuti **Generate a new API key**
5. Unijeti naziv ključa (npr. `praksahub-local`) i kopirati generirani ključ — prikazuje se samo jednom
6. Taj ključ upisati kao `BREVO_API_KEY` u `.env`
7. Za `BREVO_SENDER_EMAIL` koristiti email adresu kojom ste se registrovali na Brevo (mora biti verifikovana)

Provjera instaliranih verzija:
```bash
node --version
npm --version
git --version
```

---

## 4. Environment varijable

### Backend (`projekat/backend/.env`)

Kreirati fajl na osnovu `projekat/.env.example`:

```env
# Server
PORT=3000
NODE_ENV=development

# Baza podataka (Supabase)
DB_URL=postgresql://postgres.[project]:[password]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres

# Autentifikacija
JWT_SECRET=your-secret-key-minimum-32-chars

# CORS — URL frontenda (lokalno ili produkcija)
FRONTEND_URL=http://localhost:5173

# Supabase Storage
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email servis (Brevo)
BREVO_API_KEY=xkeysib-...
BREVO_SENDER_EMAIL=noreply@praksahub.ba
BREVO_SENDER_NAME=PraksaHub
```

### Frontend (`projekat/frontend/.env`)

```env
# URL backend API-ja
VITE_API_URL=http://localhost:3000/api
```

> **Za produkciju:** `VITE_API_URL` mora biti postavljen na URL produkcijskog backenda, npr. `https://si-grupa4-xfx9.onrender.com/api`. Ova varijabla se ugrađuje u build u trenutku kompilacije — ne može se promijeniti nakon builda.

---

## 5. Lokalno pokretanje backenda

```bash
# 1. Klonirati repozitorij
git clone https://github.com/hibrahimag/SI-grupa4.git
cd SI-grupa4

# 2. Instalirati zavisnosti
cd projekat/backend
npm install

# 3. Kreirati .env fajl (vidjeti sekciju 4)
cp ../../.env.example .env
# Popuniti .env s pravim vrijednostima

# 4. Pokrenuti server
npm run dev       # razvoj (nodemon, hot-reload)
# ili
node src/server.js  # produkcijski start

# Server je dostupan na: http://localhost:3000
```

Uspješan start ispisuje:
```
Baza spojena
Server listening on port 3000
```

---

## 6. Lokalno pokretanje frontenda

```bash
# Iz root direktorija repozitorija
cd projekat/frontend
npm install

# Kreirati .env fajl
echo "VITE_API_URL=http://localhost:3000/api" > .env

# Pokrenuti dev server
npm run dev

# Aplikacija je dostupna na: http://localhost:5173
```

Vite automatski proxira `/api/*` zahtjeve na `http://localhost:3000` kada je `VITE_API_URL` postavljen na `http://localhost:3000/api`.

Za produkcijski build:
```bash
npm run build
# Build artefakti se nalaze u: projekat/frontend/dist/
```

---

## 7. Baza podataka

**Baza se ne pokreće lokalno.** Sistem koristi Supabase Cloud PostgreSQL koji je uvijek dostupan.

Za pristup bazi potreban je `DB_URL` iz Supabase dashboarda:
```
Supabase → Settings → Database → Connection string → URI
```

Sequelize se automatski spaja na bazu pri pokretanju servera. Ako je konekcija uspješna, server ispisuje `Baza spojena`.

Za pregled sadržaja baze može se koristiti:
- **Supabase Studio** (web interface) — https://supabase.com/dashboard
- Bilo koji PostgreSQL klijent (DBeaver, pgAdmin) s connection stringom iz `.env`

---

## 8. Migracije i seed podaci

### Migracije

Projekt **ne koristi eksplicitne migracije**. Shema baze se automatski sinkronizira pri svakom pokretanju servera putem Sequelize `sync({ alter: true })` koji dodaje nove kolone i mijenja tipove bez brisanja podataka.

> **Napomena:** `sync({ alter: true })` može biti sporiji pri prvom pokretanju jer provjerava i eventualno mijenja sve tabele.

### Seed / backfill podaci

Sistem automatski pokreće tri backfill funkcije pri startu servera (definisano u `projekat/backend/src/server.js`):

```js
backfillApplicationStatuses()  // Popravlja statusne oznake prijava
backfillStudentStatuses()       // Popravlja statuse studenata
backfillAcceptedPractices()     // Popravlja zapise o prihvaćenim praksama
```

Ove funkcije su idempotentne — mogu se pokrenuti više puta bez negativnih efekata.

**Testni korisnici** moraju se kreirati ručno kroz registracijsku formu aplikacije ili direktno u Supabase Studio.

---

## 9. Pokretanje testova

Svi testovi se pokreću iz `projekat/backend` direktorija:

```bash
cd projekat/backend

# Unit testovi (ne zahtijevaju bazu)
npm test

# Integracijski testovi (zahtijevaju aktivnu .env s DB_URL)
npm run test:integration

# Unit testovi s coverage izvještajem
npm run test:coverage

# Integracijski testovi s coverage izvještajem
npm run test:integration:coverage
```

**Rezultati (juni 2026):**
- Unit testovi: **~45 test suitova, 963+ testova prolaze**
- Integracijski testovi: **~10 test suitova, svi prolaze**

> **Važno:** Integracijski testovi se spajaju na stvarnu Supabase bazu i kreiraju/brišu test podatke s prefiksom definisanim u svakom test fajlu. Pokretanje bez ispravnog `.env` rezultira greškom konekcije.

---

## 10. Produkcijski deployment (Render)

### Ručni koraci koji su potrebni jednom (inicijalna konfiguracija)

Ovi koraci su potrebni samo pri prvom postavljanju novog Render projekta:

#### Backend Web Service

1. Prijaviti se na https://render.com
2. **New → Web Service → Connect a GitHub repo**
3. Odabrati repozitorij `hibrahimag/SI-grupa4`
4. Postaviti:
   - **Root Directory:** `projekat/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
   - **Node version:** 18+
5. Dodati sve environment varijable iz sekcije 4 u **Environment** tab
6. **Settings → Deploy Hook → Create** — kopirati URL (koristi se u CD pipeline)

#### Frontend Static Site

1. **New → Static Site → Connect a GitHub repo**
2. Odabrati isti repozitorij
3. Postaviti:
   - **Root Directory:** `projekat/frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Dodati **Build Environment Variable:**
   - `VITE_API_URL` = `https://[backend-url].onrender.com/api`
5. **Settings → Redirects/Rewrites** — dodati pravilo za SPA routing:
   - Source: `/*` → Destination: `/index.html` → Action: `Rewrite`
6. **Settings → Deploy Hook → Create** — kopirati URL

### Provjera uspješnog deploymenta

Nakon deploymenta, provjeri:
```bash
# Backend health
curl https://si-grupa4-xfx9.onrender.com/api/listings/active

# Frontend
curl -I https://si-grupa4-1.onrender.com
```

---

## 11. CD Pipeline — GitHub Actions

### Lokacija skripte

```
.github/workflows/deploy.yml
```

### Kako funkcioniše

Pipeline se automatski pokreće na svaki **push na `main` branch**:

```
Push na main
    ↓
GitHub Actions: instalacija zavisnosti + pokretanje unit testova
    ↓ (samo ako testovi prođu)
curl POST → Render Backend Deploy Hook  (Render rebuilda i deploya backend)
curl POST → Render Frontend Deploy Hook (Render rebuilda i deploya frontend)
```

### Sadržaj pipeline-a

```yaml
name: Test and Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm ci
        working-directory: projekat/backend
      - run: npm test
        working-directory: projekat/backend
        env:
          DB_URL, JWT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
          BREVO_API_KEY, BREVO_SENDER_EMAIL (iz GitHub Secrets)

  deploy:
    needs: test
    steps:
      - curl -X POST RENDER_BACKEND_DEPLOY_HOOK
      - curl -X POST RENDER_FRONTEND_DEPLOY_HOOK
```

### Preduvjeti

- Render accounti s kreiranim servisima (jednom ručno, vidjeti sekciju 10)
- GitHub Secrets konfigurisani u: **GitHub repo → Settings → Secrets and variables → Actions**

### Potrebni GitHub Secrets

| Secret | Opis |
|---|---|
| `DB_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | JWT tajni ključ (min. 32 znaka) |
| `SUPABASE_URL` | URL Supabase projekta |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `BREVO_API_KEY` | Brevo API ključ |
| `BREVO_SENDER_EMAIL` | Email adresa pošiljaoca |
| `RENDER_BACKEND_DEPLOY_HOOK` | Render deploy hook URL za backend |
| `RENDER_FRONTEND_DEPLOY_HOOK` | Render deploy hook URL za frontend |

### Šta se tačno deploya

| Korak | Šta se radi |
|---|---|
| `npm ci` | Instalacija zavisnosti iz `package-lock.json` |
| `npm test` | Pokretanje svih unit testova |
| Backend hook | Render povlači zadnji commit, pokreće `npm install && node src/server.js` |
| Frontend hook | Render povlači zadnji commit, pokreće `npm install && npm run build` |

### Gdje se provjerava rezultat

- **GitHub Actions tab** u repozitoriju — status svakog runa (✅/❌)
- **Render Dashboard → Events** — timestamp i commit SHA zadnjeg deploymenta
- **Aplikacija:** https://si-grupa4-1.onrender.com

### Kako pokrenuti pipeline ručno

```bash
git commit --allow-empty -m "trigger: ručni redeploy"
git push origin main
```

### Veza između frontend-a i backenda

Frontend se spaja na backend putem `VITE_API_URL` varijable koja je postavljena kao **Build Environment Variable** na Render Static Site servisu. Ova vrijednost je ugrađena u JavaScript bundle pri svakom buildu.

---

## 12. Link na deployment

| Servis | URL |
|---|---|
| **Aplikacija (frontend)** | https://si-grupa4-1-3biq.onrender.com/|
| **Backend API** | https://si-grupa4-xfx9.onrender.com |
| **GitHub repozitorij** | https://github.com/hibrahimag/SI-grupa4 |
| **GitHub Actions** | https://github.com/hibrahimag/SI-grupa4/actions |

---

## 13. Poznata ograničenja deploymenta

### Render Free Tier — Cold Start

Backend Web Service na besplatnom Render planu **gasi se nakon 15 minuta neaktivnosti**. Sljedeći zahtjev nakon pauze uzrokuje cold start koji traje **30–60 sekundi** — aplikacija se čini neresponsivnom dok se backend ne probudi.

*Rješenje za produkciju: nadogradnja na Render paid plan ili postavljanje cron pinga svakih 10 minuta.*

### Ephemeral Filesystem — Uploadani fajlovi

Render Web Service ima **privremeni filesystem** koji se briše pri svakom redeploymentu. Fajlovi uploadani putem Multera i pohranjeni lokalno na disku bili bi izgubljeni. 

Sistem koristi **Supabase Storage** za čuvanje dokumenata, čime se ovaj problem zaobilazi — fajlovi su trajno pohranjeni u cloudu.

### VITE_API_URL — Build-time varijabla

`VITE_API_URL` se ugrađuje u frontend bundle **u trenutku builda**, a ne pri pokretanju. Ako se URL backenda promijeni, frontend mora biti ponovo buildovan i deployan.

### Brevo — Limit emailova (Free Tier)

Brevo besplatni plan dozvoljava **300 emailova dnevno**. U slučaju većeg broja registracija ili akcija, ovaj limit može biti premašen što uzrokuje neuspješno slanje emailova (registracija, reset lozinke i sl.).

### Supabase — Free Tier Ograničenja

- Baza se **pauzira nakon 1 sedmice neaktivnosti** — pri ponovnom spajanju može proći nekoliko sekundi dok se ne aktivira
- Storage: 1 GB uključen u besplatnom planu
- Veza: connection pooler (ne direktna konekcija) — pogodno za serverless i Render

---

## 14. Najčešći problemi i rješenja

### Problem: `Baza nije spojena` / Sequelize connection error

**Uzrok:** Pogrešan ili nedostajući `DB_URL` u `.env`.

**Rješenje:**
1. Provjeriti da `.env` fajl postoji u `projekat/backend/`
2. Kopirati tačan connection string iz Supabase: **Settings → Database → Connection string → URI**
3. Uvjeriti se da URL sadrži ispravnu lozinku (Supabase generiše lozinku za pooler)

---

### Problem: Frontend ne učitava podatke (API greška)

**Uzrok:** `VITE_API_URL` nije ispravno postavljen ili frontend šalje zahtjeve na pogrešan backend.

**Rješenje:**
1. Otvoriti DevTools → Network tab
2. Provjeriti na koji URL idu API zahtjevi
3. Usporediti s URL-om backenda na Renderu
4. Ako se ne podudaraju: ažurirati `VITE_API_URL` u Render Static Site Build Environment Variables i triggerovati novi build

---

### Problem: Emailovi se ne šalju

**Uzrok:** Pogrešan `BREVO_API_KEY` ili prekoračen dnevni limit.

**Rješenje:**
1. Provjeriti Brevo dashboard: https://app.brevo.com — vidjeti statistiku slanja
2. Verifikovati `BREVO_API_KEY` u environment varijablama
3. Provjeriti `BREVO_SENDER_EMAIL` — mora biti verifikovana adresa u Brevo accountu

---

### Problem: GitHub Actions pipeline pada na testovima

**Uzrok:** Nedostajući GitHub Secrets ili promijenjen test kod.

**Rješenje:**
1. **GitHub repo → Settings → Secrets** — provjeriti da svi secrets postoje
2. Pregledati Actions log — koji tačno test pada i zašto
3. Pokrenuti testove lokalno: `cd projekat/backend && npm test`

---

### Problem: Render deploy ne pokreće se automatski

**Uzrok:** Deploy Hook URL je istekao ili nije ispravno pohranjen u GitHub Secrets.

**Rješenje:**
1. Render Dashboard → servis → Settings → Deploy Hooks — generisati novi hook
2. Ažurirati `RENDER_BACKEND_DEPLOY_HOOK` ili `RENDER_FRONTEND_DEPLOY_HOOK` u GitHub Secrets
3. Testirati hook ručno: `curl -X POST [hook-url]`

---

### Problem: SPA routing — 404 na direktnom URL-u

**Uzrok:** Render Static Site ne preusmjerava sve rute na `index.html`.

**Rješenje:**
Render Dashboard → Static Site → **Redirects/Rewrites** → dodati:
- Source: `/*`
- Destination: `/index.html`
- Type: `Rewrite`

---

### Problem: `WebSocket` greška pri pokretanju testova (Node.js 18)

**Uzrok:** `@supabase/realtime-js` zahtijeva nativni WebSocket koji nije dostupan u Node.js 18.

**Rješenje:** Koristiti Node.js 22 za pokretanje testova (CI koristi Node.js 22).

---

*Dokument kreiran: juni 2026 | Tim: SI-Grupa 4*
