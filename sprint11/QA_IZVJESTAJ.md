# Test Summary / QA izvještaj — Sprint 11

> Završni izvještaj o kvaliteti aplikacije **PraksaHub**.  
> Ovaj dokument objedinjuje finalno stanje automatskog i ručnog testiranja backend i frontend komponenti sistema.  
> Detaljni inkrementalni zapisi po sprintovima ostaju u odvojenim Proof of Testing dokumentima.

---

## Sadržaj

- [1. Vrste testova](#1-vrste-testova)
- [2. Pokretanje testova](#2-pokretanje-testova)
- [3. Rezultati automatskog testiranja](#3-rezultati-automatskog-testiranja)
- [4. Coverage izvještaj](#4-coverage-izvještaj)
- [5. Ručno testirano](#5-ručno-testirano)
- [6. Ključni korisnički tokovi](#6-ključni-korisnički-tokovi)
- [UAT testiranje](#uat-testiranje)
- [NFR testiranje: performanse i sigurnost](#nfr-testiranje-performanse-i-sigurnost)
- [7. Poznati testni propusti i ograničenja](#7-poznati-testni-propusti-i-ograničenja)
- [8. Dokaz rezultata testiranja](#8-dokaz-rezultata-testiranja)
- [9. Proof of Testing po sprintovima](#9-proof-of-testing-po-sprintovima)
- [10. Zaključak](#10-zaključak)

---

## 1. Vrste testova

Backend testovi se nalaze u `projekat/backend/tests/` i pokrivaju ključnu poslovnu logiku aplikacije. U projektu su implementirane sljedeće vrste testova:

| Vrsta | Opis | Primjeri u repozitoriju |
|---|---|---|
| **Unit testovi — servisi** | Izolovana poslovna logika s mockovanim modelima i vanjskim servisima | `applications.service.test.js`, `prakse.service.test.js`, `auth.service.test.js`, `koordinator.service.test.js`, `evaluation.service.test.js` |
| **Unit testovi — kontroleri** | HTTP handleri, mapiranje statusa i error odgovora | `applications.controller.test.js`, `prakse.controller.test.js`, `users.controller.test.js`, `evaluation.controller.test.js` |
| **Unit testovi — middleware** | Autentifikacija i autorizacija po rolama | `auth.middleware.test.js`, `rbac.middleware.test.js`, `upload.middleware.test.js` |
| **Route testovi (mockirani)** | API rute s mock servisima — validacije i RBAC na nivou rute | `auth.routes.test.js`, `approval.routes.test.js`, `applications.routes.test.js`, `dokument.routes.test.js` |
| **Integracijski testovi ruta/API-ja** | Supertest + stvarna baza (Sequelize), JWT autentifikacija, end-to-end API tokovi | `auth.routes.integration.test.js`, `applications.routes.integration.test.js`, `koordinator.routes.integration.test.js`, `admin.routes.integration.test.js` |
| **Testovi validacija i error grana** | 400/401/403/404/409 odgovori, edge-case scenariji | `applications.service.extended.test.js`, `applications.withdraw.test.js`, `application_limit.service.test.js` |
| **Testovi autorizacije i rola** | STUDENT / COMPANY / COORDINATOR / ADMIN pristup | `rbac.middleware.test.js`, integracijski testovi po rutama |
| **Testovi notifikacija i email logike** | Mock slanja in-app i email obavijesti | `notifications.service.test.js`, `email.service.test.js`, `notificationPreferences.service.test.js` |
| **Testovi background jobova** | Periodički job završetka prakse | `practiceCompletion.job.test.js` |
| **Ručno UI testiranje** | Preglednik, korisnički tokovi po ulogama | Dokumentovano u Proof of Testing zapisima Sprintova 7–10 i u ovom izvještaju |
| **E2E smoke testovi (frontend)** | Playwright — učitavanje aplikacije, login forma, osnovna navigacija, validacija prijave (mock API) | `projekat/frontend/e2e/smoke.spec.js` |

**Napomena o frontendu:** React frontend (`projekat/frontend`) ima **minimalne automatske E2E smoke testove** (Playwright). Pokrivaju javne stranice i validaciju login forme bez ovisnosti o bazi ili email servisu. Kompleksni poslovni UI tokovi (login testnog korisnika, dashboard po roli, oglasi, profil) i dalje su provjereni **ručno** kroz preglednik i Proof of Testing dokumente.

**Ukupan broj test fajlova:** 56 (`47` unit/route + `8` integracijskih + `1` E2E smoke).

---

## 2. Pokretanje testova

Testovi se pokreću iz backend foldera. Potrebni su environment varijable iz `.env` (posebno `DB_URL`, `JWT_SECRET`) — integracijski testovi koriste stvarnu testnu bazu.

### Svi testovi

```bash
cd projekat/backend
npm test
```

### Coverage (svi testovi)

```bash
cd projekat/backend
npm run test:coverage
```

Nakon pokretanja, HTML coverage izvještaj se generiše u:

- `projekat/backend/coverage/index.html` — puni coverage

### Samo integracijski testovi

```bash
cd projekat/backend
npm run test:integration
```

### Integracijski coverage 

```bash
cd projekat/backend
npm run test:integration:coverage
```

Generiše: `projekat/backend/coverage-integration/index.html`


### CI/CD

Na push na `main` granu GitHub Actions workflow (`.github/workflows/deploy.yml`) automatski pokreće `npm test` prije deploya na Render.

### Frontend E2E smoke testovi (Playwright)

Testovi se pokreću iz frontend foldera. Playwright automatski pokreće Vite dev server (`webServer` u `playwright.config.js`). **Backend nije potreban** — testovi validacije prijave mockiraju `/api/auth/login`.

**Pokretanje smoke testova:**

```bash
cd projekat/frontend
npm run test:e2e
```

Opcionalno interaktivni mod: `npm run test:e2e:ui`

---

## 3. Rezultati automatskog testiranja

Finalno pokretanje (Sprint 11, `npm test` / `npm run test:coverage` / `npm run test:e2e`):

| Metrika | Vrijednost |
|---|---|
| **Test Suites (backend)** | **55 passed**, 55 total |
| **Tests (backend)** | **1000 passed**, 1000 total |
| **E2E smoke testovi (frontend)** | **9 passed**, 9 total |
| **Snapshots** | 0 total |
| **Vrijeme izvršavanja** | backend ~16–20 s; E2E ~25 s  |
| **Rezultat** | **PASS** |

### Raspodjela po tipu (pregled)

| Kategorija | Broj test fajlova | Broj testova (aproks.) | Rezultat |
|---|---|---|---|
| Unit + route (mock) | 47 | ~895 | PASS |
| Integracijski (API + DB) | 8 | 105 | PASS |
| E2E smoke (frontend, Playwright) | 1 | 9 | PASS |
| **Ukupno (backend + E2E)** | **56** | **1009** | **PASS** |

### Integracijski moduli (8 suiteova)

| Test fajl | Šta pokriva |
|---|---|
| `auth.routes.integration.test.js` | Registracija, login, verifikacija, reset lozinke |
| `applications.routes.integration.test.js` | Prijave studenta, duplikati, withdraw |
| `listings.routes.integration.test.js` | Oglasi, filtri, CRUD |
| `companies.routes.integration.test.js` | Profil kompanije |
| `favourites.routes.integration.test.js` | Favoriti oglasa |
| `users.routes.integration.test.js` | Profil, deaktivacija, brisanje |
| `koordinator.routes.integration.test.js` | Koordinatorski workflow prijava |
| `admin.routes.integration.test.js` | Admin upravljanje korisnicima i fakultetima |

### Šta je dodatno pokriveno u Sprintu 11

U okviru finalnog QA ciklusa dopunjeni su automatski testovi za:

- `prakse.service.js` — koordinatorski/company tokovi, aktivnosti, prisustvo, izvještaji, backfill
- `withdrawApplication` — servisni i route testovi (403/404/400 grane)
- `applications.routes` — `authorizeStudentDecision` (403 za COMPANY)
- `practiceCompletion.job.js` — `startPracticeCompletionJob` s fake timerima
- **Frontend E2E smoke testovi** (Playwright) — učitavanje landing/login/registracije stranica, osnovna navigacija, prikaz grešaka na login formi (mock `/api/auth/login`)

---

## 4. Coverage izvještaj

Finalni coverage (`npm run test:coverage`, svi testovi):

| Metrika | Coverage | Pokriveno / Ukupno |
|---|---|---|
| **Statements** | **94.21%** | 2932 / 3112 |
| **Branches** | **84.10%** | 1572 / 1869 |
| **Functions** | **91.35%** | 370 / 405 |
| **Lines** | **95.00%** | 2836 / 2985 |


### Oblasti s najvećim prostorom za poboljšanje (branch coverage)

| Modul / oblast | Napomena |
|---|---|
| `prakse.service.js` | Značajan dio pokriven u Sprintu 11; i dalje ima kompleksne grane oko izvještaja i notifikacija |
| `applications.service.js` | Većina glavnih tokova pokrivena; neke kombinacije filtera statistike manje pokrivene |
| `src/presentation/routes` (agregat) | Branch coverage ~71% — neke inline validacije na rutama pokrivene samo kroz integraciju |
| Frontend | Nema automatiziranog coveragea; E2E smoke testovi bez coverage metrike |


---

## 5. Ručno testirano

Pored 1000 backend automatskih testova i 9 frontend E2E smoke testova, ključni korisnički tokovi provjereni su ručno na deployanom/testnom okruženju (Render + frontend). Ručno testiranje obuhvata funkcionalnosti koje nisu u potpunosti pokrivene frontend automatizacijom (dashboard po roli, poslovni workflow, email, upload dokumenata).

| Oblast | Šta je ručno provjereno | Rezultat |
|---|---|---|
| **Registracija** | Student, kompanija, koordinator — validacija polja, jedinstvenost emaila | PASS |
| **Email verifikacija** | Link iz emaila, istek tokena, ponovno slanje | PASS |
| **Login** | Uspješan login, pogrešna lozinka, blokada PENDING/REJECTED korisnika | PASS |
| **Odobravanje/odbijanje naloga** | Admin i koordinator odobravaju/odbijaju nove korisnike | PASS |
| **Korisnički profil** | Pregled i uređivanje profila po roli | PASS |
| **Oglasi za praksu** | Pregled, filtri, detalji, favoriti, zatvaranje/arhiviranje | PASS |
| **Profil kompanije** | Student pregleda profil kompanije s oglasa | PASS |
| **Prijava na praksu** | Upload CV/motivacionog, podnošenje prijave, limit prijava | PASS |
| **Pregled prijava** | Student „Moje prijave”, kompanija po oglasu, statistika | PASS |
| **Koordinatorske funkcije** | Pregled i odluka o prijavama, odobravanje studenata | PASS |
| **Selekcija i odluka kompanije** | Shortlist, approve/reject prijave | PASS |
| **Potvrda studenta** | Prihvatanje/odbijanje odobrene prakse | PASS |
| **Ugovor o praksi** | Generisanje, prikaz na bosanskom, PDF preuzimanje | PASS |
| **Aktivnosti i prisustvo** | Unos aktivnosti, evidencija prisustva kompanije | PASS |
| **Evaluacije** | Kompanija evaluira studenta, student evaluira kompaniju | PASS |
| **Izvještaji** | Generisanje i pregled izvještaja o praksi | PASS |
| **Odustajanje od prakse/prijave** | Student withdraw, ažuriranje statusa u svim pregledima | PASS |
| **Automatsko završavanje prakse** | Badge „Završena”, notifikacije studentu i kompaniji | PASS |
| **Notifikacije** | In-app prikaz, email obavijesti (testni inbox) | PASS |
| **Preferencije notifikacija** | Uključivanje/isključivanje tipova | PASS |
| **Admin** | Upravljanje korisnicima, fakultetima, audit log, limit prijava | PASS |
| **Deaktivacija/brisanje naloga** | Provjera blokada (aktivna praksa, aktivni oglasi) | PASS |
| **Frontend navigacija** | Landing page, role-based navigacija, dark mode | PASS |
| **Regresija** | Funkcionalnosti iz Sprintova 7–10 bez regresija | PASS |

Detaljni UI scenariji po sprintovima dokumentovani su u [Proof of Testing — Sprint 10](../sprint10/ProofOfTesting.md) (sekcija ručnog UI testiranja).

---

## 6. Ključni korisnički tokovi

### Tok 1: Registracija → verifikacija → odobrenje → login

| Korak | Akcija | Očekivani rezultat | Status |
|---|---|---|---|
| 1 | Korisnik se registruje (student/kompanija/koordinator) | Nalog kreiran, status PENDING_APPROVAL | PASS |
| 2 | Korisnik klikne link za email verifikaciju | `emailVerifikovan = true` | PASS |
| 3 | Admin/koordinator pregleda zahtjev za odobrenje | Zahtjev vidljiv na odgovarajućem dashboardu | PASS |
| 4a | Admin/koordinator **odobri** nalog | `approvalStatus = APPROVED`, email obavijest | PASS |
| 4b | Admin/koordinator **odbije** nalog | `approvalStatus = REJECTED`, razlog sačuvan | PASS |
| 5 | Odobreni korisnik se prijavi | JWT token, pristup dashboardu po roli | PASS |
| 6 | Neodobreni korisnik pokuša login | Login blokiran s jasnom porukom | PASS |

### Tok 2: Student → oglas → kompanija → prijava

| Korak | Akcija | Očekivani rezultat | Status |
|---|---|---|---|
| 1 | Student pregleda listu oglasa | Filtri i pretraga rade, „Novo” oznaka vidljiva | PASS |
| 2 | Student otvara detalje oglasa | Prikazani opis, rok, kompanija | PASS |
| 3 | Student pregleda profil kompanije | Podaci kompanije dostupni | PASS |
| 4 | Student podnosi prijavu s dokumentima | Status `CEKA_KOORDINATORA`, notifikacije poslane | PASS |
| 5 | Student pokuša duplu prijavu | HTTP 409, poruka o duplikatu | PASS |
| 6 | Student pregleda „Moje prijave” | Prijava vidljiva s ispravnim statusom | PASS |

### Tok 3: Koordinator i kompanija obrađuju prijavu

| Korak | Akcija | Očekivani rezultat | Status |
|---|---|---|---|
| 1 | Koordinator pregleda prijave sa svog fakulteta | Lista s filterima i paginacijom | PASS |
| 2 | Koordinator **odobri** prijavu | Status `CEKA_KOMPANIJU`, notifikacija kompaniji | PASS |
| 3 | Kompanija pregleda prijave za oglas | Student, dokumenti i statusi vidljivi | PASS |
| 4 | Kompanija stavi kandidata u uži krug | Status `U_RAZMATRANJU` | PASS |
| 5 | Kompanija **odobri** prijavu | Status `ODOBRENA`, student obaviješten | PASS |
| 6 | Koordinator **odbije** prijavu (alternativni tok) | Status odbijen, razlog sačuvan | PASS |

### Tok 4: Realizacija prakse → završetak → evaluacija

| Korak | Akcija | Očekivani rezultat | Status |
|---|---|---|---|
| 1 | Student **prihvati** odobrenu praksu | Kreiran `Praksa` zapis, status `PRIHVACENO` | PASS |
| 2 | Student/kompanija generišu ugovor | Ugovor na bosanskom, bez duplikata | PASS |
| 3 | Student unosi aktivnosti tokom aktivne prakse | Aktivnosti vidljive kompaniji i koordinatoru | PASS |
| 4 | Kompanija evidentira prisustvo | Prisustvo sačuvano po datumu | PASS |
| 5 | Po isteku trajanja — automatsko završavanje | Status „Završena”, notifikacije studentu i kompaniji | PASS |
| 6 | Kompanija evaluira studenta | Evaluacija sačuvana, student obaviješten | PASS |
| 7 | Student evaluira kompaniju | Evaluacija sačuvana, kompanija može pregledati | PASS |
| 8 | Kompanija generiše izvještaj | Izvještaj dostupan studentu i koordinatoru | PASS |
| 9 | Student **odustane** od prijave (alternativni tok) | Status `ODUSTAO`, obavijesti poslane | PASS |

---

## UAT testiranje

UAT testiranje je dokumentovano u [UAT protokolu](./UAT_PROTOKOL.md). Dokument sumira scenarije prihvatljivosti za glavne korisničke uloge i povezuje se sa ručnim Proof of Testing zapisima iz ranijih sprintova.

---

## NFR testiranje: performanse i sigurnost

U Sprintu 11 izvedena je osnovna NFR (non-functional requirements) provjera **performansi** i **sigurnosti** u smoke obimu, bez izmjena produkcijskog koda i bez automatskog popravljanja dependency-ja.

| Oblast | Metoda provjere | Rezultat | Status | Napomena |
|---|---|---|---|---|
| **Performanse** | Osnovni `autocannon` smoke test (`-d 20 -c 10`) na javnoj GET ruti | oko 129 req/s prosjek; latency avg 77 ms, p50 75 ms, p99 103 ms; oko 3000 zahtjeva u 20 s; 0 prijavljenih grešaka | **Izvedeno** | Ruta: `GET http://localhost:3000/api/auth/faculties` (javna, bez tokena). Lokalni backend (`npm start`, port 3000). Nije puni stress/load test produkcije. |
| **Sigurnost dependency-ja (backend)** | `npm audit` u `projekat/backend` | **2 moderate** ranjivosti (`uuid` preko `sequelize`); exit code 1 | **Izvedeno** |  |
| **Sigurnost dependency-ja (frontend)** | `npm audit` u `projekat/frontend` | **4 moderate** ranjivosti (`esbuild`/`vite`, `react-router`/`react-router-dom`); exit code 1 | **Izvedeno** |  |
| **Autentifikacija / autorizacija** | Postojeći backend testovi (`auth.middleware`, `rbac.middleware`, route i integracijski testovi) | JWT provjera, RBAC po rolama, 401/403 za neautorizovan pristup, blokada neodobrenih korisnika | **Djelimično pokriveno** | Nema formalnog penetration testa niti OWASP skeniranja |
| **Validacija unosa** | Postojeći backend testovi (kontroleri, servisi, route testovi) | 400/404/409 grane, validacija body parametara na auth/applications/listings rutama | **Pokriveno** | UI validacija djelimično ručno/E2E smoke |

### Komande (Sprint 11)

**Sigurnost — backend:**

```bash
cd projekat/backend
npm audit
```

**Sigurnost — frontend:**

```bash
cd projekat/frontend
npm audit
```

**Performanse — smoke test** (backend mora biti pokrenut lokalno):

```bash
cd projekat/backend
npm start
# u drugom terminalu:
npx autocannon -d 20 -c 10 http://localhost:3000/api/auth/faculties
```

### Sažetak NFR provjere

- NFR testiranje je izvedeno u **osnovnom/smoke obimu**.
- Performance test **nije** puni stress/load test produkcionog sistema (Render cold start, mreža i baza nisu simulirani pod produkcijskim opterećenjem).
- Sigurnosna provjera ograničena je na **`npm audit`** dependency pregled; **nije** rađen formalni penetration test, vulnerability scanning izvan npm-a niti security audit treće strane.


**Napomena o sigurnosnim testovima u kodu:** autentifikacija, autorizacija, middleware, role-based access control, validacija zahtjeva, neautorizovan pristup, zabrana pristupa po rolama i neodobreni korisnici pokriveni su postojećim automatskim backend testovima.

---

## 7. Poznati testni propusti i ograničenja

| ID | Ograničenje | Uticaj | Status |
|---|---|---|---|
| **QA-L01** | Frontend ima samo **E2E smoke** testove (Playwright); nema komponentnih testova ni punih poslovnih E2E tokova | Kompleksni UI tokovi (login testnog korisnika, dashboard, oglasi, profil) oslanjaju se na ručno testiranje | Prihvaćeno za finalnu verziju |
| **QA-L02** | Email funkcionalnosti zavise od vanjskog servisa (Brevo/Resend) i `.env` konfiguracije | Automatski testovi mockiraju slanje; stvarni inbox provjeren ručno | Dokumentovano |
| **QA-L03** | Jest upozorenje: `worker process failed to exit gracefully` / `Force exiting Jest` | Svi testovi prolaze; upozorenje ukazuje na otvoreni async resurs (DB konekcija/tajmer) u testnom okruženju | Poznato, ne blokira CI |
| **QA-L04** | Branch coverage (84.10%) niži od line/statements coveragea | Nisu sve alternativne/error grane pokrivene — posebno u `prakse.service.js` i inline route validacijama | Evidentirano |
| **QA-L05** | Integracijski coverage izolirano ~35% | Očekivano — samo 8 integracijskih suiteova pokriva API sloj nad cijelim `src/**` | Informativno |
| **QA-L06** | BUG-01: Student dashboard poziva koordinator endpoint za limit prijava | Student vidi `null` umjesto limita; ne ruši aplikaciju | Vidi [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) |
| **QA-L07** | BUG-02: Race condition pri simultanim prijavama | Teoretski moguće zaobići limit prijava dvoklikom | Vidi [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) |
| **QA-L08** | Nema real-time notifikacija (WebSocket) | Korisnik mora osvježiti stranicu | Vidi [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) |

---

## 8. Dokaz rezultata testiranja

### Terminal output (automatski testovi — backend)

```
Test Suites: 55 passed, 55 total
Tests:       1000 passed, 1000 total
Snapshots:   0 total
Time:        ~16–20 s
```

### Terminal output (E2E smoke testovi — frontend)

```
Running 9 tests using N workers
  9 passed (~25 s)
```

Pokretanje: `cd projekat/frontend && npm run test:e2e`

### Terminal output (NFR — performanse, autocannon)

```
Running 20s test @ http://localhost:3000/api/auth/faculties
10 connections

Latency avg: 77.32 ms | p50: 75 ms | p99: 103 ms
Req/Sec avg: 128.81
3k requests in 20.14s, 1.06 MB read
```

Komanda: `npx autocannon -d 20 -c 10 http://localhost:3000/api/auth/faculties` (backend lokalno, port 3000)

### Terminal output (NFR — sigurnost, npm audit backend)

```
2 moderate severity vulnerabilities
  uuid <11.1.1 (via sequelize)
```

Komanda: `cd projekat/backend && npm audit`

### Terminal output (NFR — sigurnost, npm audit frontend)

```
4 moderate severity vulnerabilities
  esbuild <=0.24.2 (via vite)
  react-router 6.7.0 - 6.30.3 (via react-router-dom)
```

Komanda: `cd projekat/frontend && npm audit`

### Coverage summary (automatski testovi)

```
Statements   : 94.21% ( 2932/3112 )
Branches     : 84.10% ( 1572/1869 )
Functions    : 91.35% ( 370/405 )
Lines        : 95.00% ( 2836/2985 )
```

### Screenshotovi 

**Coverage izvještaj — backend (HTML report)**

![Coverage izvještaj](slike_report/Screenshot%202026-06-09%20130809.png)

**Integracijski testovi — terminal output**

![Integracijski testovi](slike_report/Screenshot%202026-06-09%20130930.png)

**E2E smoke testovi — Playwright HTML report**

![E2E smoke testovi](slike_report/Screenshot%202026-06-09%20131933.png)

---

## 9. Proof of Testing po sprintovima

Tokom razvoja vođeni su odvojeni Proof of Testing zapisi po sprintovima. Ti dokumenti služe kao detaljan dokaz inkrementalnog testiranja, dok ovaj završni QA izvještaj objedinjuje finalno stanje testiranja aplikacije.

| Sprint | Dokument | Kratak opis |
|---|---|---|
| Sprint 3 | [Test_Strategy.md](../sprint3/Test_Strategy.md) | Početna testna strategija — nivoi testiranja, alati, odgovornosti |
| Sprint 7 | [ProofOfTesting.md](../sprint7/ProofOfTesting.md) | Auth, approval, koordinator workflow, middleware, profil i deaktivacija |
| Sprint 8 | [ProofOfTesting.md](../sprint8/ProofOfTesting.md) | Oglasi, favoriti, prijava na praksu, upload dokumentacije, profil kompanije |
| Sprint 9 | [ProofOfTesting.md](../sprint9/ProofOfTesting.md) | Selekcija, odobravanje/odbijanje, audit log, limit prijava, notifikacije |
| Sprint 10 | [ProofOfTesting.md](../sprint10/ProofOfTesting.md) | Potvrda studenta, ugovor, aktivnosti, evaluacije, završetak prakse, odustajanje |

**Napomena:** Za Sprintove 1–6 nisu napisani zasebni `ProofOfTesting.md` fajlovi u repozitoriju. Testiranje tih faza pokriveno je kroz kasnije sprint zapise i finalni backlog ([FinalProductBacklog.md](./FinalProductBacklog.md)).

### Povezani Sprint 11 dokumenti

| Dokument | Svrha |
|---|---|
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Poznati bugovi i tehnička ograničenja finalne verzije |
| [UAT_PROTOKOL.md](./UAT_PROTOKOL.md) | Završni UAT protokol — prihvatljivost po korisničkim ulogama |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy i testno okruženje |
| [FinalProductBacklog.md](./FinalProductBacklog.md) | Završni status svih 53 backlog stavki |

---

## 10. Zaključak

Aplikacija **PraksaHub** u finalnoj verziji zadovoljava kriterije kvalitete definirane kroz razvojne sprintove:

- **1000 backend automatskih testova** prolazi bez greške (55 test suiteova); dodatno **9 frontend E2E smoke testova** (Playwright) prolazi bez greške.
- Backend **coverage** iznosi **94.21%** statements i **95.00%** lines; branch coverage je **84.10%**.
- Dodani su automatski E2E smoke testovi za osnovno učitavanje aplikacije, login formu i osnovnu navigaciju. Kompleksni poslovni E2E tokovi su dodatno provjereni ručno kroz Proof of Testing dokumente.
- Ključni korisnički tokovi — od registracije i odobrenja naloga, preko prijave i koordinacije, do realizacije prakse, evaluacije i završetka — provjereni su kombinacijom automatskih, E2E smoke i ručnih testova.
- Osnovna **NFR provjera** (performanse smoke test, `npm audit`) dokumentovana je u [NFR sekciji](#nfr-testiranje-performanse-i-sigurnost); nije rađen formalni penetration test niti produkcijski load test.
- Poznata ograničenja (frontend bez punih poslovnih E2E tokova, email ovisnost o vanjskom servisu, dependency ranjivosti, Jest force-exit upozorenje, pojedinačni bugovi) su **evidentirana** i ne blokiraju isporuku finalne verzije.

Ovaj dokument predstavlja završni QA pregled. Za detalje po fazama razvoja koristiti Proof of Testing zapise Sprintova 7–10 i testnu strategiju iz Sprinta 3.

---

*Dokument kreiran: juni 2026.*  

