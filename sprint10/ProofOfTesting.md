# Proof of Testing — Sprint 10

> Ovaj dokument predstavlja objedinjeni dokaz testiranja za Sprint 10 i obuhvata:
>
> - integracione testove za odbijanje prakse (US-18, realizovano u Sprintu 9),
> - unit testove za potvrdu studenta i studentsku odluku o praksi (US-19),
> - unit testove za generisanje ugovora o praksi,
> - unit testove za lifecycle logiku prakse,
> - unit testove za automatsko završavanje prakse i periodički job,
> - unit testove za evidenciju aktivnosti,
> - integracione testove za notifikacije o statusu prakse (US-37, realizovano u Sprintu 9),
> - unit testove za odustajanje od prakse (US-33),
> - unit testove za evaluaciju studenta od strane kompanije (US-26),
> - unit testove za evaluaciju kompanije od strane studenta (US-27),
> - proširene unit testove za notifications service, prakse controller, applications controller i email service,
> - ispravku integracionog testa za prijave na praksu (race condition s DB konekcijom),
> - RBAC i sigurnosne provjere,
> - ručno UI testiranje i coverage izvještaj.

---

# 1. Coverage Summary

Ukupna pokrivenost backend testovima ostvarena tokom Sprinta 10 (nakon implementiranih stavki):

| Metric | Coverage |
|---|---|
| Statements | **90.94%** (2793/3071) |
| Branches | **80.49%** (1473/1830) |
| Functions | **87.93%** (350/398) |
| Lines | **91.61%** (2700/2947) |

---

# 2. Ukupni rezultati testiranja

| Nivo | Modul | Alat | Broj testova | Rezultat |
| --- | --- | --- | --- | --- |
| Unit | Potvrda/odbijanje prakse od strane studenta | Jest | 4+ | PASS |
| Unit | Generisanje ugovora | Jest | 3+ | PASS |
| Unit | Lifecycle datuma prakse | Jest | 6+ | PASS |
| Unit | Automatsko završavanje prakse | Jest | 4+ | PASS |
| Unit | Periodički job završetka | Jest | 3 | PASS |
| Unit | Email obavijesti o završetku | Jest | 14+ | PASS |
| Unit | Odustajanje od prakse | Jest | 4+ | PASS |
| Unit | Evaluacija studenta od strane kompanije (US-26) | Jest | 15+ | PASS |
| Unit | Evaluacija kompanije od strane studenta (US-27) | Jest | 12+ | PASS |
| Unit | Notifikacije (student/company/koordinator) | Jest | 26+ | PASS |
| Unit | Prakse controller (sve funkcije) | Jest | 22+ | PASS |
| Unit | Applications controller (sve funkcije) | Jest | 18+ | PASS |
| Unit | Coordinator profile service | Jest | 8+ | PASS |
| Integracijsko | Prijave na praksu (CRUD + validacije) | Supertest + Sequelize | 8 | PASS |
| Ručno UI | Potvrda prakse i pregled „Moje prakse” | Preglednik | — | PASS |
| Ručno UI | Pregled i preuzimanje ugovora | Preglednik | — | PASS |
| Ručno UI | Evidencija aktivnosti | Preglednik | — | PASS |
| Ručno UI | Automatsko završavanje i notifikacije | Preglednik | — | PASS |
| **Ukupno** | Sprint 10 (sve stavke) | Jest + Supertest + Sequelize | **964 testova** | **PASS** |

---

# 3. Testirane funkcionalnosti

| Funkcionalnost | Tip testiranja | Šta je provjereno | Rezultat |
|---|---|---|---|
| Odbijanje prakse (US-18) | Integracijsko (Sprint 9) | Odbijanje od strane koordinatora, notifikacije | PASS |
| Potvrda studenta (US-19) | Unit | Prihvatanje odobrene prijave, kreiranje prakse, idempotentnost | PASS |
| Odbijanje prakse od strane studenta | Unit | Odbijanje odobrene prijave, ažuriranje studentStatus | PASS |
| Generisanje ugovora | Unit | Kreiranje ugovora, bosanski sadržaj, bez duplikata | PASS |
| Lifecycle prakse | Unit | Nadolazeća/aktivna/završena/odustao na osnovu datuma | PASS |
| Pregled praksi po roli | Unit + Ručno UI | Filtri na student/kompanija/koordinator dashboardu | PASS |
| Evidencija aktivnosti | Unit + Ručno UI | Unos samo tokom aktivne prakse, pregled svim rolama | PASS |
| Automatsko završavanje | Unit | Detekcija isteka, idempotentne obavijesti | PASS |
| Periodički job | Unit | Poziv servisa, logiranje, graceful error handling | PASS |
| Odustajanje od prakse (US-33) | Unit | Ažuriranje statusa, audit log zapis | PASS |
| Notifikacije o statusu prakse (US-37) | Integracijsko (Sprint 9) | In-app i email notifikacije, bez duplikata | PASS |
| Evaluacija studenta — kompanija (US-26) | Unit | Submit, duplikat zaštita, notifikacija studenta | PASS |
| Evaluacija kompanije — student (US-27) | Unit | Submit, duplikat zaštita, pregled primljenih | PASS |
| RBAC zaštita | Unit | Role check na novim endpointima prakse | PASS |
| Regresijsko testiranje | Ručno UI | Nema regresija iz Sprinta 9 | PASS |

---

# 4. SB-58 — Odbijanje prakse (US-18)

> Testirano u Sprintu 9. Detalji u `sprint9/ProofOfTesting.md`, sekcija SB-18.

---

# 5. SB-59 — Potvrda studenta (US-19)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu prihvatanje učešća na odobrenoj praksi | `acceptApplicationByStudent` — OK | PASS |
| Kada student prihvati praksu, sistem mora ažurirati status prijave | `studentStatus = PRIHVACENO` | PASS |
| Sistem mora kreirati zapis prakse nakon prihvatanja | `ensurePracticeForApplication` pozvan | PASS |
| Ponovljeni accept ne kreira duplikat prakse | Idempotentno ponašanje | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/applications.studentDecision.test.js
backend/tests/unit/prakse.service.test.js
```

### Primjeri testiranih scenarija

| Scenarij | Očekivani rezultat | Status |
|---|---|---|
| Student prihvata odobrenu prijavu | Praksa kreirana, studentStatus ažuriran | PASS |
| Student ponovo prihvata istu prijavu | Bez duplikata, postojeća praksa vraćena | PASS |
| Student odbija odobrenu prijavu | studentStatus = ODBIJENO | PASS |

---

# 6. SB-60 / SB-61 — Generisanje i preuzimanje ugovora (US-22, US-23)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti generisanje ugovora o praksi | `getPracticeContract` — created=true | PASS |
| Sistem mora omogućiti studentu i kompaniji uvid u ugovor | Role-based pristup STUDENT/COMPANY | PASS |
| Ugovor sadrži podatke o studentu i kompaniji | Sadržaj sadrži ime studenta i naziv kompanije | PASS |
| Već kreiran ugovor se ne duplicira | `created=false` na drugom pozivu | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/tests/unit/prakse.controller.test.js
```

---

# 7. SB-62 — Evidencija aktivnosti (US-24)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu evidentiranje aktivnosti | `POST /api/prakse/:id/aktivnosti` | PASS |
| Sistem mora omogućiti pregled aktivnosti kompaniji i koordinatoru | `GET /api/prakse/:id/aktivnosti` | PASS |
| Aktivnosti se mogu unositi samo tokom aktivne prakse | Validacija lifecycleStatus | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/src/presentation/routes/prakse.routes.js
```

---

# 8. SB-67 — Odustajanje od prakse (US-33)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora omogućiti studentu odustajanje od prakse | `users.service` — status WITHDRAWN | PASS |
| Sistem mora ažurirati status prijave | `datumOdustajanja` postavljen | PASS |
| Sistem mora bilježiti akciju u audit log | `INTERNSHIP_WITHDRAWN` action type | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/users.service.test.js
backend/tests/unit/audit.service.test.js
```

---

# 9. SB-68 — Notifikacije o statusu prakse (US-37)

> Testirano u Sprintu 9. Detalji u `sprint9/ProofOfTesting.md`, sekcija SB-37.

---

# 10. SB-69 — Automatsko završavanje prakse (US-54)

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Sistem mora pratiti datum početka i trajanje prakse | `calculatePracticeDates`, `practiceLifecycleStatus` | PASS |
| Po isteku trajanja status prelazi u „Završena“ | `lifecycleStatus = ZAVRSENA` kada datumKraja < danas | PASS |
| Sistem mora obavijestiti studenta i kompaniju | Email + in-app notifikacija | PASS |
| Sistem ne smije višestruko slati obavijest | `datumObavijestiZavrsetka` idempotentnost | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/prakse.service.test.js
backend/tests/unit/email.service.test.js
backend/tests/unit/practiceCompletion.job.test.js
```

### Primjeri testiranih scenarija

| Scenarij | Očekivani rezultat | Status |
|---|---|---|
| Job poziva `completeExpiredPractices` | Servis pozvan jednom | PASS |
| Nema novih završetaka | Bez log poruke | PASS |
| Neočekivana greška u jobu | Hvata se bez rušenja procesa | PASS |

---

# 11. Ručno UI testiranje

Pored automatizovanih testova izvršeno je i ručno testiranje korisničkog interfejsa za sve nove funkcionalnosti Sprinta 10.

Ručno su provjereni:

- prihvatanje i odbijanje odobrene prakse od strane studenta na student dashboardu,
- pregled potvrđenih praksi po lifecycle filterima (Sve / Aktivne / Nadolazeće / Završene),
- generisanje ugovora o praksi i prikaz sadržaja na bosanskom jeziku,
- preuzimanje digitalne kopije ugovora u PDF formatu,
- unos aktivnosti tokom aktivne prakse i pregled od strane kompanije i koordinatora,
- popunjavanje evaluacijskog formulara od strane kompanije za studenta (US-26),
- popunjavanje evaluacijskog formulara od strane studenta za kompaniju (US-27),
- pregled primljenih i poslanih evaluacija za obje strane,
- odustajanje od prijave/prakse i ažuriranje statusa u svim pregledima,
- automatsko označavanje prakse završenom i prikaz badge-a „Završena”,
- prikaz in-app notifikacije i provjera da li je email obavijest poslana,
- regresijsko testiranje svih funkcionalnosti Sprinta 9.

Tokom ručnog testiranja nisu pronađene kritične greške koje blokiraju implementirane funkcionalnosti Sprinta 10.

---

## US-19 — Potvrda studenta (SB-59)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-201 | Student prihvata odobrenu praksu | Status prijave ažuriran na PRIHVACENO, praksa kreirana i vidljiva u „Moje prakse” | PASS |
| UI-202 | Student odbija odobrenu praksu | Status prijave ažuriran na ODBIJENO, praksa nije kreirana | PASS |
| UI-203 | Student pokušava prihvatiti prijavu koja nije u odobrenom statusu | Dugme za prihvatanje nije dostupno, akcija blokirana | PASS |
| UI-204 | Kompanija i koordinator primaju obavijest o odluci studenta | In-app notifikacija vidljiva na njihovim dashboardima | PASS |

## US-22 / US-23 — Generisanje i preuzimanje ugovora (SB-60, SB-61)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-205 | Student generira ugovor za potvrđenu praksu | Ugovor prikazan s podacima o studentu, kompaniji, trajanju i datumu | PASS |
| UI-206 | Sadržaj ugovora je na bosanskom jeziku | Sva polja i tekst na bosanskom, bez engleskih termina | PASS |
| UI-207 | Student preuzima PDF kopiju ugovora | PDF se preuzima uspješno, sadržaj ispravan | PASS |
| UI-208 | Kompanija pregleda ugovor za svog studenta | Ugovor dostupan i s kompanijskog prikaza | PASS |
| UI-209 | Ponovni zahtjev za generisanje ugovora ne kreira duplikat | Isti ugovor vraćen bez kreiranja novog zapisa | PASS |

## US-24 — Evidencija aktivnosti (SB-62)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-210 | Student unosi aktivnost tokom aktivne prakse | Aktivnost sačuvana i vidljiva u listi | PASS |
| UI-211 | Kompanija pregleda aktivnosti svog studenta | Sve aktivnosti vidljive s datumom i opisom | PASS |
| UI-212 | Koordinator pregleda aktivnosti studenta | Aktivnosti dostupne i koordinatoru | PASS |
| UI-213 | Student pokušava unijeti aktivnost za završenu praksu | Unos blokiran, poruka o grešci prikazana | PASS |

## US-26 — Evaluacija studenta (SB-64)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-214 | Kompanija otvara formular za evaluaciju studenta | Formular s ocjenama (1–5) za tehničke vještine, komunikaciju, radnu etiku, inicijativu i timski rad | PASS |
| UI-215 | Kompanija popunjava i šalje evaluaciju | Evaluacija sačuvana, student prima in-app notifikaciju i email | PASS |
| UI-216 | Kompanija pokušava ponovo poslati evaluaciju | Poruka da je evaluacija već poslana, ponovni unos blokiran | PASS |
| UI-217 | Student pregleda primljenu evaluaciju od kompanije | Sve ocjene i komentar vidljivi na student dashboardu | PASS |
| UI-218 | Kompanija pregleda listu poslanih evaluacija | Evaluacije prikazane s imenom studenta i ukupnom ocjenom | PASS |

## US-27 — Evaluacija kompanije (SB-65)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-219 | Student otvara formular za evaluaciju kompanije | Formular s ocjenama (1–5) za organizaciju, mentorstvo, radno okruženje, relevantnost posla i preporuku | PASS |
| UI-220 | Student popunjava i šalje evaluaciju kompanije | Evaluacija sačuvana uspješno | PASS |
| UI-221 | Student pokušava ponovo poslati evaluaciju | Poruka da je evaluacija već poslana, ponovni unos blokiran | PASS |
| UI-222 | Student pregleda svoje poslane evaluacije kompanija | Lista evaluacija s nazivom kompanije i ocjenama | PASS |
| UI-223 | Kompanija pregleda evaluacije primljene od studenata | Evaluacije vidljive s imenom studenta i detaljima | PASS |

## US-33 — Odustajanje od prakse (SB-67)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-224 | Student odustaje od prijave koja čeka odobrenje | Status prijave ažuriran na ODUSTAO, praksa nije kreirana | PASS |
| UI-225 | Student odustaje od odobrene prakse | Status ažuriran, kompanija i koordinator primaju obavijest | PASS |
| UI-226 | Student pokušava odustati od već završene prakse | Akcija blokirana, odgovarajuća poruka prikazana | PASS |
| UI-227 | Odustajanje vidljivo u pregledima kompanije i koordinatora | Status prikazan kao ODUSTAO u svim pregledima | PASS |

## US-54 — Automatsko završavanje prakse (SB-69)

| ID | Scenarij | Očekivani rezultat | Status |
|---|---|---|---|
| UI-228 | Praksa čiji je datum kraja prošao prikazuje badge „Završena” | Badge ispravno prikazan na student i company dashboardu | PASS |
| UI-229 | Student prima obavijest o završetku prakse | In-app notifikacija vidljiva, email primljen | PASS |
| UI-230 | Kompanija prima obavijest o završetku prakse | In-app notifikacija vidljiva, email primljen | PASS |
| UI-231 | Završena praksa ne dozvoljava unos novih aktivnosti | Dugme za unos aktivnosti onemogućeno | PASS |
| UI-232 | Regresijsko UI testiranje | Sve funkcionalnosti iz Sprinta 9 rade ispravno, nema regresija | PASS |

---

# 12. Pokretanje testova

## Pokretanje svih testova

```bash
npm test
```

## Pokretanje testova za Sprint 10 module

```bash
npm test -- --testPathPattern="prakse.service|prakse.controller|applications.studentDecision|practiceCompletion.job|email.service"
```

## Coverage report

```bash
npm run test:coverage
```

---

# 12b. US-26 — Evaluacija studenta od strane kompanije

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Kompanija može pregledati čekajuće evaluacije završenih praksi | `getPendingStudentEvaluations` — filtriranje po evaluated set | PASS |
| Kompanija može poslati evaluaciju studenta | `submitStudentEvaluation` — kreiranje EvaluacijaStudenta | PASS |
| Duple evaluacije za isti prijavaID su spriječene | 409 na ponovljeni submit | PASS |
| Evaluacija moguća samo nakon završene prakse | 400 kada praksa nije završena | PASS |
| Kompanija može pregledati poslane evaluacije | `getSubmittedStudentEvaluations` — mapiranje podataka | PASS |
| Student prima in-app notifikaciju i email o evaluaciji | `createNotification` + `sendEvaluacijaStudentaEmail` pozvani | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/evaluation.service.test.js
backend/tests/unit/evaluation.controller.test.js
```

---

# 12c. US-27 — Evaluacija kompanije od strane studenta

## Pokriveni acceptance criteria

| AC | Test koji pokriva | Status |
|---|---|---|
| Student može pregledati čekajuće evaluacije kompanija | `getPendingCompanyEvaluations` — filtriranje po evaluated set | PASS |
| Student može poslati evaluaciju kompanije | `submitCompanyEvaluation` — kreiranje EvaluacijaKompanije | PASS |
| Duple evaluacije spriječene | 409 na ponovljeni submit | PASS |
| Evaluacija moguća samo nakon završene prakse | 400 kada praksa nije završena | PASS |
| Student može pregledati poslane i primljene evaluacije | `getStudentSubmittedCompanyEvaluations`, `getStudentReceivedEvaluations` | PASS |
| Kompanija može pregledati primljene evaluacije od studenata | `getCompanyReceivedEvaluations` | PASS |

## Relevantni test fajlovi

```text
backend/tests/unit/evaluation.service.test.js
backend/tests/unit/evaluation.controller.test.js
```

---

# 13. Zaključak

Sprint 10 backend i frontend funkcionalnosti (implementirane stavke) uspješno su pokrivene kombinacijom:

- unit testova,
- sigurnosnih/RBAC provjera,
- ručnog UI testiranja,
- regresionog testiranja.

Testirani su ključni korisnički tokovi planirani za Sprint 10:

- odbijanje prakse od strane koordinatora (US-18, Sprint 9),
- potvrda studenta i kreiranje prakse (US-19),
- generisanje i preuzimanje ugovora o praksi,
- lifecycle pregled praksi po datumu,
- evidencija aktivnosti tokom aktivne prakse,
- automatsko završavanje prakse s obavijestima,
- odustajanje od prakse s audit log zapisom (US-33),
- notifikacije o promjenama statusa prijave (US-37, Sprint 9).

US-26 (evaluacija studenta od strane kompanije) i US-27 (evaluacija kompanije od strane studenta) su implementirani i u potpunosti pokriveni unit testovima u `evaluation.service.test.js` i `evaluation.controller.test.js`. Preostale stavke (US-25 praćenje prisustva, US-28 izvještaji) planirane su za narednu fazu.

Sistem zadovoljava acceptance kriterije definirane za implementirane stavke Sprinta 10 i održava kompatibilnost s funkcionalnostima Sprintova 8 i 9.
