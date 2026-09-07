# Proof of Testing — Sprint 9

> Ovaj dokument predstavlja objedinjeni dokaz testiranja za Sprint 9 i obuhvata:
>
> - integracione testove API endpointa za selekciju kandidata,
> - integracione testove za odobravanje i odbijanje prakse,
> - integracione testove za zatvaranje oglasa,
> - integracione testove za arhiviranje oglasa,
> - integracione testove za pregled statistike prijava,
> - integracione testove za audit log (historija aktivnosti),
> - integracione testove za ograničenje broja prijava po studentu,
> - integracione testove za notifikacije o statusu prakse,
> - integracione testove za podešavanje tipova notifikacija,
> - integracione testove za pregled zatvorenih oglasa,
> - RBAC i sigurnosne provjere,
> - ručno UI testiranje i coverage izvještaj.

---

# 1. Coverage Summary

Ukupna pokrivenost backend testovima ostvarena tokom Sprinta 9:

| Metric | Coverage |
|---|---|
| Statements | **97.51%** |
| Branches | **86.89%** |
| Functions | **95.52%** |
| Lines | **98.03%** |

---

# 2. Ukupni rezultati testiranja

| Nivo | Modul | Alat | Broj testova | Rezultat |
| --- | --- | --- | --- | --- |
| Integracijsko | Selekcija kandidata | Jest + Supertest + JWT | 8 | PASS |
| Integracijsko | Odobravanje prakse | Jest + Supertest + JWT + Sequelize | 7 | PASS |
| Integracijsko | Odbijanje prakse | Jest + Supertest + JWT + Sequelize | 7 | PASS |
| Integracijsko | Zatvaranje oglasa | Jest + Supertest + JWT + Sequelize | 9 | PASS |
| Integracijsko | Arhiviranje oglasa | Jest + Supertest + JWT + Sequelize | 8 | PASS |
| Integracijsko | Pregled statistike prijava | Jest + Supertest + JWT + Sequelize | 7 | PASS |
| Integracijsko | Audit log (Historija aktivnosti) | Jest + Supertest + JWT + Sequelize | 10 | PASS |
| Integracijsko | Ograničenje broja prijava | Jest + Supertest + JWT + Sequelize | 6 | PASS |
| Integracijsko | Notifikacije o statusu prakse | Jest + Supertest + JWT + Sequelize | 8 | PASS |
| Integracijsko | Podešavanje tipova notifikacija | Jest + Supertest + JWT + Sequelize | 6 | PASS |
| Integracijsko | Pregled zatvorenih oglasa | Jest + Supertest + JWT + Sequelize | 5 | PASS |
| Ručno UI | Ceo tok selekcije i odobravanja | Preglednik | — | PASS |
| Ručno UI | Notifikacije na frontendu | Preglednik | — | PASS |
| **Ukupno** | Sprint 9 backend integracija | Jest + Supertest + Sequelize | **88 testova** | **PASS** |

---

# 3. Testirane funkcionalnosti

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Selekcija kandidata | Integracijsko | Označavanje kandidata u užem izboru, ažuriranje statusa, notifikacije | PASS |
| Odobravanje prakse | Integracijsko | Odobravanje od strane koordinatora, ažuriranje statusa, notifikacije | PASS |
| Odbijanje prakse | Integracijsko | Odbijanje od strane koordinatora, ažuriranje statusa, notifikacije | PASS |
| Zatvaranje oglasa | Integracijsko | Zatvaranje aktivnog oglasa, zaustavljanje novih prijava, notifikacije | PASS |
| Arhiviranje oglasa | Integracijsko | Arhiviranje zatvorenih oglasa, vraćanje iz arhive | PASS |
| Pregled statistike | Integracijsko | Broj prijava po oglasu, filtriranje, RBAC zaštita | PASS |
| Audit log | Integracijsko | Bilježenje akcija, pretraživanje, filtriranje, samo admin pristup | PASS |
| Ograničenje prijava | Integracijsko | Validacija maksimalnog broja aktivnih prijava, admin config | PASS |
| Notifikacije statusa | Integracijsko | Slanje notifikacija pri promjeni statusa, bez duplikata | PASS |
| Podešavanje notifikacija | Integracijsko | Izbor tipova notifikacija, čuvanje postavki | PASS |
| Pregled zatvorenih oglasa | Integracijsko | Prikaz zatvorenih oglasa, zaustavljanje prijava, bez arhiviranih | PASS |
| RBAC zaštita | Integracijsko | Role check na svim novim endpointima, 401/403 odgovori | PASS |
| Regresijsko testiranje | Ručno UI | Nema regresija iz Sprinta 8 | PASS |

---

# 4. SB-16 — Selekcija kandidata (US-16)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti kompaniji označavanje kandidata koji prolaze u uži krug | `POST /api/applications/:id/select` — 200 | PASS |
| Kada kompanija selektuje kandidata, sistem mora ažurirati status prijave | `GET /api/applications/:id` — status = IZABRAN | PASS |
| Sistem mora obavijestiti studenta o promjeni statusa njegove prijave | Notifikacija kreirana automatski | PASS |
| Sistem ne smije dozvoliti selekciju kandidata na tuđim oglasima | 403 za kompaniju s drugačijim ID-om | PASS |
| Sistem ne smije dozvoliti selekciju neprijavljenoj kompaniji | 401 bez auth tokena | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/applications.company.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Kompanija selektuje kandidata na vlastenom oglasu | 200 | PASS |
| Kompanija pokušava selektovati na tuđem oglasu | 403 | PASS |
| Zahtjev bez tokena | 401 | PASS |
| Selekcija već izabranog kandidata (idempotentno) | 200 | PASS |

---

# 5. SB-17 — Odobravanje prakse (US-17)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti koordinatoru odobravanje studentskih prijava na praksi | `POST /api/applications/:id/approve` — 200 | PASS |
| Kada koordinator odobri praksu, sistem mora ažurirati status prijave | `GET /api/applications/:id` — status = ODOBRENA | PASS |
| Sistem mora obavijestiti studenta o promjeni statusa njegove prijave | Notifikacija kreirana automatski | PASS |
| Sistem ne smije dozvoliti odobravanje bez odgovarajuće koordinatorske role | 403 za COMPANY ili STUDENT | PASS |
| Sistem ne smije dozvoliti odobravanje već odobrene ili odbijene prijave | 409 za transicije | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/applications.coordinator.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Koordinator odobrava prijavu na praksu | 200, status ODOBRENA | PASS |
| Kompanija pokušava odobriti | 403 | PASS |
| Odobravanje već odobrene prijave | 409 | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 6. SB-18 — Odbijanje prakse (US-18)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti koordinatoru odbijanje studentskih prijava na praksi | `POST /api/applications/:id/reject` — 200 | PASS |
| Kada koordinator odbije praksu, sistem mora ažurirati status prijave | `GET /api/applications/:id` — status = ODBIJENA | PASS |
| Sistem mora obavijestiti studenta o promjeni statusa njegove prijave | Notifikacija kreirana automatski | PASS |
| Sistem ne smije dozvoliti odbijanje bez odgovarajuće koordinatorske role | 403 za COMPANY ili STUDENT | PASS |
| Sistem ne smije dozvoliti odbijanje već odobrene ili završene prijave | 409 za transicije | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/applications.coordinator.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Koordinator odbija prijavu na praksu | 200, status ODBIJENA | PASS |
| Odbijanje već odbijene prijave | 409 | PASS |
| Student pokušava odbiti | 403 | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 7. SB-31 — Zatvaranje oglasa (US-31)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti kompaniji zatvaranje aktivnog oglasa | `POST /api/listings/:id/close` — 200 | PASS |
| Na zatvoreni oglas se ne može više prijavljivati | `POST /api/applications` — 400 za zatvorene oglase | PASS |
| Zatvoreni oglas se ne pojavljuje u listi aktivnih oglasa | `GET /api/listings/active` — oglas filtriran | PASS |
| Sistem mora obavijestiti kandidate koji čekaju na odgovor o zatvaranju | Notifikacije korisnike obavještavaju | PASS |
| Sistem ne smije dozvoliti zatvaranje oglasa drugoj kompaniji | 403 za drugu kompaniju | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/listings.routes.integration.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Kompanija zatvara vlastiti oglas | 200 | PASS |
| Kompanija pokušava zatvoriti tuđi oglas | 403 | PASS |
| Prijava na zatvoreni oglas | 400 | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 8. SB-49 — Arhiviranje oglasa (US-49)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti arhiviranje zatvorenog oglasa | `POST /api/listings/:id/archive` — 200 | PASS |
| Arhivirani oglasi se ne smiju prikazivati studentima u listi aktivnih oglasa | `GET /api/listings/active` — arhivirani filtirani | PASS |
| Sistem mora omogućiti kompaniji pregled arhiviranih oglasa | `GET /api/listings/archived` — 200 | PASS |
| Sistem mora omogućiti vraćanje oglasa iz arhive | `POST /api/listings/:id/unarchive` — 200 | PASS |
| Sistem ne smije dozvoliti arhiviranje aktivnog oglasa koji nije zatvoren | 400 za aktivne oglase | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/listings.routes.integration.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Kompanija arhivira zatvoreni oglas | 200 | PASS |
| Arhiviranje aktivnog oglasa | 400 | PASS |
| Pregled arhiviranih oglasa | 200, niz | PASS |
| Vraćanje oglasa iz arhive | 200 | PASS |

---

# 9. SB-50 — Pregled statistike prijava (US-50)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora prikazati broj prijava po oglasu | `GET /api/listings/:id/statistics` — primanja.count | PASS |
| Sistem mora prikazati osnovne statistike (npr. po odsjeku, godini studija) | Agregacijski upiti po poljima | PASS |
| Sistem mora omogućiti filtriranje statistike | Query parametri za filtriranje | PASS |
| Sistem ne smije prikazivati statistiku za oglase koji ne pripadaju kompaniji | 403 za drugu kompaniju | PASS |
| Sistem ne smije dozvoliti pregled statistike neprijavljenoj kompaniji | 401 bez tokena | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/listings.statistics.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Kompanija pregleda statistiku vlastitog oglasa | 200 | PASS |
| Pokušaj pregleda tuđe statistike | 403 | PASS |
| Filtriranje po odsjeku | 200, filtrirani podaci | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 10. SB-51 — Historija aktivnosti / Audit log (US-51)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora bilježiti ključne akcije (registracije, promjene statusa, brisanje naloga, uređivanje oglasa, odustajanje) | Audit log kreiran za svaku akciju | PASS |
| Svaki zapis mora sadržavati: korisnika, vrijeme i tip akcije | AuditLog tabela s timestamp i user_id | PASS |
| Samo administrator može pregledati audit log | `GET /api/audit-log` — 403 za non-admin | PASS |
| Sistem mora omogućiti pretragu i filtriranje zapisa po tipu akcije, korisniku i vremenskom periodu | Query parametri za filter | PASS |
| Sistem ne smije dozvoliti brisanje ili izmjenu zapisa u audit logu | Nema DELETE/PUT endpointa za audit log | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/audit-log.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Administrator pregleda audit log | 200, niz zapisa | PASS |
| Kompanija pokušava pregledati audit log | 403 | PASS |
| Filtriranje po tipu akcije | 200, filtrirani zapisi | PASS |
| Filtriranje po vremenskom periodu | 200, zapisi u opsegu | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 11. SB-53 — Ograničenje broja prijava po studentu (US-53)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Administrator može definisati maksimalan broj aktivnih prijava po studentu | `POST /api/settings/max-applications` — 200 | PASS |
| Sistem ne smije dozvoliti prijavu iznad definisanog limita | `POST /api/applications` — 400 ako je limit prekoračen | PASS |
| Student mora dobiti jasnu poruku o prekoračenju limita | Error message s detaljima | PASS |
| Limit se ne smije odnositi na već odobrene, odbijene ili završene prijave | Brojanje samo PENDING/CEKA_KOMPANIJU status | PASS |
| Promjena limita od strane administratora mora biti odmah primjenjena | Settings ažurirani u realnom vremenu | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/settings.routes.test.js
backend/tests/unit/applications.routes.integration.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Administrator postavlja limit na 5 | 200 | PASS |
| Student prijavljuje aplikacije do limita | 201 za sve | PASS |
| Student pokušava prijavu kada je na limitu | 400 | PASS |
| Odobrena prijava se ne broji u limitima | Brojanje samo aktivnih | PASS |

---

# 12. SB-37 — Notifikacije o statusu prakse (US-37)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora poslati notifikaciju studentu kada kompanija promijeni status prijave | Notifikacija kreirana pri selekciji/odbijanju | PASS |
| Sistem mora poslati notifikaciju kada koordinator odobri ili odbije praksu | Notifikacija kreirana pri approve/reject | PASS |
| Sistem mora prikazati notifikacije unutar aplikacije na dashboardu studenta | Frontend tab za notifikacije | PASS |
| Student mora moći vidjeti historiju svih primljenih notifikacija | `GET /api/notifications` — kompletan niz | PASS |
| Sistem ne smije slati duplikate notifikacija za istu promjenu statusa | Dedupliciranje po akciji | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/notifications.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Student pregleda notifikacije | 200, niz | PASS |
| Notifikacija kreira se pri promjeni statusa | 201 pri akciji | PASS |
| Nema duplikata za istu akciju | Dedupliciran zapis | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 13. SB-55 — Podešavanje tipova notifikacija (US-55)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti korisniku izbor tipova notifikacija koje želi primati | `PUT /api/notification-preferences` — 200 | PASS |
| Sistem mora slati samo odabrane notifikacije | Filtriranje prema postavkama | PASS |
| Sistem mora zapamtiti korisničke postavke između sesija | Settings čuvane u bazi | PASS |
| Promjene postavki moraju biti odmah primijenjene | Cache invalidation, nova prijava odmah koristi postavke | PASS |
| Sistem mora ponuditi razumne zadane postavke za novog korisnika | Default: sve notifikacije omogućene | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/notification-preferences.routes.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Student postavlja preference | 200 | PASS |
| Notifikacija se šalje samo ako je tip omogućen | Filtrirana notifikacija | PASS |
| Zahtjev bez tokena | 401 | PASS |

---

# 14. SB-57 — Pregled zatvorenih oglasa (US-57)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti prikaz zatvorenih oglasa | `GET /api/listings/closed` — 200 | PASS |
| Zatvoreni oglasi moraju biti jasno označeni kao zatvoreni | status = 'ZATVOREN' u odgovoru | PASS |
| Sistem ne smije dozvoliti prijavu na zatvorene oglase | `POST /api/applications` — 400 | PASS |
| Sistem mora omogućiti pregled detalja zatvorenog oglasa | `GET /api/listings/:id` — kompletan zapis | PASS |
| Sistem ne smije prikazivati arhivirane oglase u listi zatvorenih oglasa | Filtriranje po archived = false | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/listings.routes.integration.test.js
```

### Primjeri testiranih scenarija

| Scenarij | HTTP Status | Rezultat |
|---|---|---|
| Student pregleda zatvorene oglase | 200, niz | PASS |
| Pregled detalja zatvorenog oglasa | 200, kompletan zapis | PASS |
| Pokušaj prijave na zatvoreni oglas | 400 | PASS |
| Arhivirani oglasi nisu u listi | Filtriranje radi | PASS |

---

# 15. Ručno UI testiranje

Pored automatizovanih testova izvršeno je i ručno testiranje korisničkog interfejsa za sve nove funkcionalnosti Sprint 9.

Ručno su provjereni:

- selekcija kandidata iz liste prijava na oglasu,
- odobravanje i odbijanje prijava od strane koordinatora,
- zatvaranje oglasa i sprečavanje novih prijava,
- arhiviranje zatvorenih oglasa,
- pregled statistike prijava na oglasu,
- pregled audit log-a od strane administratora,
- postavljanje limita broja prijava po studentu,
- prikaz notifikacija o promjenama statusa,
- podešavanje tipova notifikacija u korisničkim postavkama,
- prikaz zatvorenih oglasa sa zabranom prijave,
- regresijsko testiranje svih funkcionalnosti Sprinta 8.

Tokom ručnog testiranja nisu pronađene kritične greške koje blokiraju funkcionalnosti Sprinta 9.

---

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-101 | Selekcija kandidata | Kandidat označen kao IZABRAN | PASS |
| UI-102 | Notifikacija o selekciji | Student prima obavijest | PASS |
| UI-103 | Odobravanje od strane koordinatora | Status promijenjeno u ODOBRENA | PASS |
| UI-104 | Odbijanje od strane koordinatora | Status promijenjeno u ODBIJENA | PASS |
| UI-105 | Zatvaranje oglasa | Status ZATVOREN, nema novih prijava | PASS |
| UI-106 | Notifikacija o zatvaranju | Kandidati obavješteni | PASS |
| UI-107 | Arhiviranje oglasa | Oglas nestao iz aktivne liste | PASS |
| UI-108 | Pregled arhiva | Arhivirani oglasi dostupni | PASS |
| UI-109 | Vraćanje iz arhive | Oglas ponovo u aktivnoj listi | PASS |
| UI-110 | Statistika oglasa | Prikazani broj i razdioba prijava | PASS |
| UI-111 | Audit log pregleda | Administrator vidi sve akcije s vremenskom linijom | PASS |
| UI-112 | Filtriranje audit log-a | Filtriranje po tipu i koristniku radi | PASS |
| UI-113 | Postavljanje limita prijava | Admin postavlja limit, odmah se primjenjuje | PASS |
| UI-114 | Odbacivanje iznad limita | Student dobija poruku o prekoračenju | PASS |
| UI-115 | Notifikacije na dashboardu | Sve notifikacije vidljive na tab-u | PASS |
| UI-116 | Podešavanje notifikacija | Korisnik odabira tipove notifikacija | PASS |
| UI-117 | Pregled zatvorenih oglasa | Lista zatvorenih s zabranom prijave | PASS |
| UI-118 | Regresiono UI testiranje | Nema regresija nakon novih funkcionalnosti | PASS |

---

# 16. Pokretanje testova

## Pokretanje svih testova

```bash
npm test
```

## Coverage report

```bash
npm test -- --coverage
```

---

# 17. Zaključak

Sprint 9 backend i frontend funkcionalnosti uspješno su pokrivene kombinacijom:

- integracionih testova,
- sigurnosnih/RBAC testova,
- ručnog UI testiranja,
- regresionog testiranja.

Testirani su svi ključni korisnički tokovi:

- selekcija kandidata sa notifikacijama,
- odobravanje i odbijanje prakse od strane koordinatora,
- zatvaranje oglasa s automatskim obavijestima kandidatima,
- arhiviranje i vraćanje oglasa iz arhive,
- pregled statistike prijava po oglasu,
- bilježenje svih ključnih akcija u audit logu,
- ograničenje maksimalnog broja aktivnih prijava po studentu,
- slanje i upravljanje notifikacijama o promjenama statusa,
- podešavanje tipova notifikacija koje korisnik želi primati,
- pregled zatvorenih oglasa bez mogućnosti nove prijave.

Sistem zadovoljava acceptance kriterije definirane za Sprint 9 i održava potpunu kompatibilnost s funkcionalnostima Sprintova 7 i 8.
