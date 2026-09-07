# UAT protokol 

> Završni protokol **User Acceptance Testing (UAT)** / testiranja prihvatljivosti aplikacije **PraksaHub**.  
> Dokument sumira provjeru ključnih korisničkih tokova iz perspektive krajnjih korisnika i stakeholdera u akademskom kontekstu projekta.  
> Detaljni koraci i screenshotovi po fazama razvoja ostaju u Proof of Testing zapisima Sprintova 7–10.

---

## Sadržaj

- [1. Svrha UAT testiranja](#1-svrha-uat-testiranja)
- [2. Obuhvaćene uloge i okruženje](#2-obuhvaćene-uloge-i-okruženje)
- [3. Metodologija i kriteriji prihvatljivosti](#3-metodologija-i-kriteriji-prihvatljivosti)
- [4. UAT scenariji — opšti tokovi (sve uloge)](#4-uat-scenariji--opšti-tokovi-sve-uloge)
- [5. UAT scenariji — Student](#5-uat-scenariji--student)
- [6. UAT scenariji — Kompanija](#6-uat-scenariji--kompanija)
- [7. UAT scenariji — Koordinator](#7-uat-scenariji--koordinator)
- [8. UAT scenariji — Administrator](#8-uat-scenariji--administrator)
- [9. UAT scenariji — realizacija prakse (ugovor, aktivnosti, evaluacije, završetak)](#9-uat-scenariji--realizacija-prakse-ugovor-aktivnosti-evaluacije-završetak)
- [10. UAT scenariji — notifikacije i promjene statusa](#10-uat-scenariji--notifikacije-i-promjene-statusa)
- [11. Napomene i ograničenja](#11-napomene-i-ograničenja)
- [12. Sažetak rezultata](#12-sažetak-rezultata)
- [13. Zaključak o prihvatljivosti sistema](#13-zaključak-o-prihvatljivosti-sistema)
- [14. Povezani dokumenti](#14-povezani-dokumenti)

---

## 1. Svrha UAT testiranja

Cilj UAT testiranja jeste potvrditi da aplikacija **PraksaHub** zadovoljava poslovne potrebe definisane kroz product backlog i korisničke priče, prije finalne isporuke.

UAT u ovom projektu:

- provjerava **end-to-end korisničke tokove** kroz web sučelje (ne samo API ili unit testove);
- simulira rad **stvarnih uloga** (student, kompanija, koordinator, administrator);
- fokusira se na **prihvatljivost** — da li korisnik može obaviti zadatak s jasnim ishodom i očekivanim statusom;
- služi kao **završni formalni zapis** prihvatljivosti u pojednostavljenom akademskom formatu.

**Važno:** UAT je proveden kroz ručnu provjeru ključnih scenarija od strane tima razvoja, uz konsultaciju sa zahtjevima iz backloga i testne strategije. Proof of Testing dokumenti iz ranijih sprintova služe kao **dodatni dokaz** inkrementalne ručne provjere.

---

## 2. Obuhvaćene uloge i okruženje

### Uloge

| Uloga | Opis u kontekstu UAT-a |
|---|---|
| **Student** | Registracija, pregled oglasa, prijava na praksu, potvrda prakse, aktivnosti, evaluacija kompanije |
| **Kompanija** | Registracija, objava oglasa, pregled prijava, selekcija, prisustvo, evaluacija studenta, izvještaji |
| **Koordinator** | Odobravanje studenata/korisnika, pregled prijava s fakulteta, odluke o prijavama, pregled praksi |
| **Administrator** | Upravljanje korisnicima, fakultetima, audit log, limit prijava, odobravanje/odbijanje naloga |
| **Neregistrovani korisnik** | Landing page, registracija, login, javni sadržaj |

### Okruženje testiranja

| Parametar | Vrijednost |
|---|---|
| **Frontend** | Deploy na Render Static Site ([DEPLOYMENT.md](./DEPLOYMENT.md)) |
| **Backend** | Deploy na Render Web Service |
| **Baza** | Supabase PostgreSQL (testna/produkcijska instanca projekta) |
| **Email** | Brevo/Resend — ovisi o `.env` konfiguraciji |
| **Period UAT-a** | Sprint 11, juni 2026 |
| **Automatizacija UAT-a** | Svi UAT scenariji potvrđeni **ručno**; E2E smoke testovi pokrivaju samo osnovno učitavanje i login formu ([QA izvještaj](./QA_IZVJESTAJ.md)) |

---

## 3. Metodologija i kriteriji prihvatljivosti

### Metodologija

1. Tim je prošao kroz scenarije po ulogama na deployanom okruženju.
2. Rezultati su usklađeni sa zapisima iz [Proof of Testing — Sprint 7–10](../sprint10/ProofOfTesting.md).
3. Automatski backend testovi (1000 testova) i E2E smoke testovi (9 testova) služe kao **tehnička podloga**, ali UAT ocjena se odnosi isključivo na **korisničku prihvatljivost** kroz UI.

### Legenda statusa

| Status | Značenje |
|---|---|
| **Prošlo** | Scenarij ručno izvršen; očekivani rezultat postignut bez blokirajućeg problema |
| **Djelimično prošlo** | Osnovna funkcionalnost radi, ali postoji ograničenje (email servis, refresh notifikacija, cold start, konfiguracija okruženja) |
| **Nije prošlo** | Scenarij nije zadovoljio kriterij prihvatljivosti |


---

## 4. UAT scenariji — opšti tokovi (sve uloge)

| ID | Scenarij | Koraci (sažeto) | Očekivani rezultat | Status | Napomena |
|---|---|---|---|---|---|
| **UAT-G01** | Registracija studenta | Popuniti formu, poslati registraciju | Nalog kreiran, status `PENDING_APPROVAL`, poruka o verifikaciji emaila | **Prošlo** | Ručna potvrda; nije automatizovano |
| **UAT-G02** | Registracija kompanije | Popuniti formu kompanije | Nalog kreiran, čeka odobrenje | **Prošlo** | Ručna potvrda |
| **UAT-G03** | Registracija koordinatora | Popuniti formu koordinatora | Nalog kreiran, čeka odobrenje | **Prošlo** | Ručna potvrda |
| **UAT-G04** | Email verifikacija | Klik na link iz emaila / ponovno slanje | `emailVerifikovan = true`; jasna poruka pri isteku tokena | **Djelimično prošlo** | Ovisi o Brevo/Resend i testnom inboxu; logika potvrđena ručno |
| **UAT-G05** | Login — uspješan | Unijeti ispravne kredencijale odobrenog korisnika | JWT sesija, redirect na dashboard po roli | **Prošlo** | Ručna potvrda |
| **UAT-G06** | Login — neuspješan | Pogrešna lozinka ili neodobren nalog | Jasna poruka greške; nema pristupa dashboardu | **Prošlo** | E2E smoke pokriva prikaz greške (mock); pun login ručno |
| **UAT-G07** | Odobravanje novog korisnika | Admin/koordinator odobri zahtjev | `APPROVED`, korisnik može login | **Prošlo** | Dokumentovano Sprint 7 PoT |
| **UAT-G08** | Odbijanje novog korisnika | Admin/koordinator odbije s razlogom | `REJECTED`, login blokiran | **Prošlo** | Dokumentovano Sprint 7 PoT |
| **UAT-G09** | Landing page i navigacija | Pregled početne, linkovi Prijavi se / Registruj se | Stranica se učitava; navigacija radi | **Prošlo** | Djelimično automatizovano (E2E smoke) |

---

## 5. UAT scenariji — Student

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-S01** | Pregled liste oglasa | Filtri, pretraga, oznaka „Novo”, detalji oglasa | **Prošlo** | Sprint 8 PoT |
| **UAT-S02** | Pregled profila kompanije s oglasa | Podaci kompanije vidljivi studentu | **Prošlo** | Sprint 8 PoT |
| **UAT-S03** | Prijava na praksu s dokumentima | Status `CEKA_KOORDINATORA`, upload CV/motivacionog | **Prošlo** | Sprint 8 PoT; limit 150 KB dokumentovan |
| **UAT-S04** | Dupla prijava na isti oglas | HTTP 409, poruka o duplikatu | **Prošlo** | Backend + ručno |
| **UAT-S05** | Pregled „Moje prijave” | Lista prijava s ispravnim statusima | **Prošlo** | Sprint 8–9 PoT |
| **UAT-S06** | Potvrda odobrene prakse | Kreiran zapis prakse, status `PRIHVACENO` | **Prošlo** | Sprint 10 PoT |
| **UAT-S07** | Odustajanje od prijave/prakse | Status `ODUSTAO`, ažuriranje u svim pregledima | **Prošlo** | Sprint 10 PoT |
| **UAT-S08** | Uređivanje profila | Podaci studenta sačuvani | **Prošlo** | Sprint 7 PoT |
| **UAT-S09** | Pregled limita prijava na dashboardu | Prikaz preostalog broja prijava | **Djelimično prošlo** | BUG-01: limit se ne prikazuje studentu ([KNOWN_ISSUES.md](./KNOWN_ISSUES.md)) |

---

## 6. UAT scenariji — Kompanija

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-K01** | Kreiranje i uređivanje oglasa | Oglas vidljiv studentima, filtri rade | **Prošlo** | Sprint 8 PoT |
| **UAT-K02** | Zatvaranje/arhiviranje oglasa | Oglas više nije aktivan za nove prijave | **Prošlo** | Sprint 8 PoT |
| **UAT-K03** | Pregled prijava po oglasu | Student, dokumenti, statusi vidljivi | **Prošlo** | Sprint 9 PoT |
| **UAT-K04** | Shortlist kandidata | Status `U_RAZMATRANJU` | **Prošlo** | Sprint 9 PoT |
| **UAT-K05** | Odobrenje/odbijanje prijave | Status `ODOBRENA` / odbijeno s razlogom | **Prošlo** | Sprint 9 PoT |
| **UAT-K06** | Evidencija prisustva | Prisustvo sačuvano po datumu | **Prošlo** | Sprint 10 PoT |
| **UAT-K07** | Evaluacija studenta | Evaluacija sačuvana, student obaviješten | **Prošlo** | Sprint 10 PoT |
| **UAT-K08** | Generisanje izvještaja o praksi | Izvještaj dostupan studentu i koordinatoru | **Prošlo** | Sprint 10 PoT |
| **UAT-K09** | Upravljanje profilom kompanije | Javni profil ažuriran | **Prošlo** | Sprint 8 PoT |

---

## 7. UAT scenariji — Koordinator

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-C01** | Pregled prijava s fakulteta | Lista s filterima i paginacijom | **Prošlo** | Sprint 7–9 PoT |
| **UAT-C02** | Odobrenje prijave | Status `CEKA_KOMPANIJU`, notifikacija kompaniji | **Prošlo** | Sprint 9 PoT |
| **UAT-C03** | Odbijanje prijave | Status odbijen, razlog sačuvan | **Prošlo** | Sprint 9 PoT |
| **UAT-C04** | Odobravanje novih studenata | Student `APPROVED` nakon verifikacije | **Prošlo** | Sprint 7 PoT |
| **UAT-C05** | Pregled studenata i praksi | Koordinatorski dashboard prikazuje relevantne zapise | **Prošlo** | Sprint 7–10 PoT |
| **UAT-C06** | Postavljanje limita prijava | Limit primjenjen na nove prijave | **Prošlo** | Sprint 9 PoT; race condition rijetko (BUG-02) |

---

## 8. UAT scenariji — Administrator

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-A01** | Admin dashboard — pregled sistema | Statistike i navigacija rade | **Prošlo** | Sprint 9 PoT |
| **UAT-A02** | Upravljanje korisnicima | CRUD operacije, filtri po roli/statusu | **Prošlo** | Sprint 9 PoT |
| **UAT-A03** | Odobravanje/odbijanje naloga | Isti tok kao koordinator, admin scope | **Prošlo** | Sprint 7 PoT |
| **UAT-A04** | Upravljanje fakultetima/odsjecima | Lista i uređivanje institucija | **Prošlo** | Sprint 9 PoT |
| **UAT-A05** | Audit log | Akcije admina zabilježene | **Prošlo** | Sprint 9 PoT |
| **UAT-A06** | Limit prijava (globalno) | Admin postavlja/mijenja limit | **Prošlo** | Sprint 9 PoT |
| **UAT-A07** | Deaktivacija/brisanje naloga | Blokade za aktivnu praksu/oglase rade | **Prošlo** | Sprint 7 PoT |

---

## 9. UAT scenariji — realizacija prakse (ugovor, aktivnosti, evaluacije, završetak)

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-P01** | Generisanje ugovora o praksi | Ugovor na bosanskom, PDF preuzimanje | **Prošlo** | Sprint 10 PoT |
| **UAT-P02** | Unos aktivnosti tokom prakse | Aktivnosti vidljive kompaniji i koordinatoru | **Prošlo** | Sprint 10 PoT |
| **UAT-P03** | Evaluacija kompanije (student) | Student evaluira kompaniju nakon prakse | **Prošlo** | Sprint 10 PoT |
| **UAT-P04** | Automatsko završavanje prakse | Badge „Završena”, status ažuriran po isteku trajanja | **Prošlo** | Sprint 10 PoT; background job testiran automatski |
| **UAT-P05** | End-to-end tok: prijava → realizacija → evaluacija | Cjelokupan lifecycle bez rušenja | **Prošlo** | Ručno kroz više sprintova; nije automatizovano kao jedan E2E |

---

## 10. UAT scenariji — notifikacije i promjene statusa

| ID | Scenarij | Očekivani rezultat | Status | Dokaz / napomena |
|---|---|---|---|---|
| **UAT-N01** | In-app notifikacije | Notifikacije vidljive nakon učitavanja/refresha stranice | **Djelimično prošlo** | Nema real-time push (TL-02); refresh obavezan |
| **UAT-N02** | Email notifikacije | Email stiže na testni inbox za ključne događaje | **Djelimično prošlo** | Ovisi o vanjskom servisu i `.env` |
| **UAT-N03** | Preferencije notifikacija | Korisnik uključuje/isključuje tipove | **Prošlo** | Sprint 9 PoT |
| **UAT-N04** | Status prijave ažuriran u svim ulogama | Student, kompanija i koordinator vide isti status | **Prošlo** | Sprint 9–10 PoT |
| **UAT-N05** | Notifikacija pri odobrenju/odbijanju | Obavijest poslana relevantnim stranama | **Djelimično prošlo** | In-app da; email ovisi o servisu |

---

## 11. Napomene i ograničenja

| ID | Napomena | Uticaj na UAT |
|---|---|---|
| **UAT-NOTE-01** | Formalni potpis stakeholdera nije vođen | UAT je akademski protokol tima, ne produkcijski sign-off s potpisima |
| **UAT-NOTE-02** | UAT nije automatizovan | Svi poslovni scenariji potvrđeni ručno; E2E smoke pokriva samo javne stranice |
| **UAT-NOTE-03** | Email zavisi od Brevo/Resend | Scenariji UAT-G04, UAT-N02, UAT-N05 označeni kao djelimično prošli |
| **UAT-NOTE-04** | Nema WebSocket notifikacija | Korisnik mora osvježiti stranicu (TL-02) |
| **UAT-NOTE-05** | Render cold start | Prvi pristup nakon neaktivnosti može kasniti 30–60 s (TL-01) |
| **UAT-NOTE-06** | BUG-01, BUG-02 | Ne blokiraju UAT, ali utiču na UAT-S09 i teorijski limit prijava |
| **UAT-NOTE-07** | Proof of Testing Sprintova 7–10 | Služe kao detaljan dodatni dokaz ručne provjere po inkrementima |

---

## 12. Sažetak rezultata

| Status | Broj scenarija | Postotak |
|---|---|---|
| **Prošlo** | 45 | 90% |
| **Djelimično prošlo** | 5 | 10% |
| **Nije prošlo** | 0 | 0% |
| **Ukupno UAT scenarija** | **50** | 100% |

*Napomena: brojevi uključuju sve tabele scenarija (UAT-G, UAT-S, UAT-K, UAT-C, UAT-A, UAT-P, UAT-N). Scenariji označeni „Djelimično prošlo” imaju funkcionalnu jezgru potvrđenu ručno; ograničenja su dokumentovana i ne blokiraju akademsku isporuku.*

---

## 13. Zaključak o prihvatljivosti sistema

Na osnovu provedenog UAT testiranja, aplikacija **PraksaHub** **zadovoljava kriterije prihvatljivosti** za finalnu verziju u okviru akademskog projekta.


---

## 14. Povezani dokumenti

| Dokument | Veza |
|---|---|
| [QA_IZVJESTAJ.md](./QA_IZVJESTAJ.md) | Završni QA pregled — automatski testovi, coverage, ručno testiranje |
| [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) | Poznati bugovi i tehnička ograničenja |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deploy i testno okruženje |
| [FinalProductBacklog.md](./FinalProductBacklog.md) | Status svih backlog stavki |
| [Test_Strategy.md](../sprint3/Test_Strategy.md) | Početna testna strategija (uključuje UAT plan) |
| [ProofOfTesting.md — Sprint 7](../sprint7/ProofOfTesting.md) | Auth, approval, koordinator |
| [ProofOfTesting.md — Sprint 8](../sprint8/ProofOfTesting.md) | Oglasi, prijave, profil kompanije |
| [ProofOfTesting.md — Sprint 9](../sprint9/ProofOfTesting.md) | Selekcija, notifikacije, admin |
| [ProofOfTesting.md — Sprint 10](../sprint10/ProofOfTesting.md) | Ugovor, aktivnosti, evaluacije, završetak |

---

*Dokument kreiran: Sprint 11, juni 2026.*  

