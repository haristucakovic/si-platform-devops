# 10. Known Issues / Limitations — PraksaHub

> Iskrena lista poznatih problema i ograničenja sistema u finalnoj verziji (juni 2026).  
> Ova lista ne umanjuje vrijednost isporučenog sistema — svaki sistem ima ograničenja. Problem bi bio prikrivati ih.

---

## Sadržaj

- [1. Poznati bugovi](#1-poznati-bugovi)
- [2. Tehnička ograničenja](#2-tehnička-ograničenja)
- [3. Sigurnosna ograničenja](#3-sigurnosna-ograničenja)
- [4. Nedovršene funkcionalnosti](#4-nedovršene-funkcionalnosti)
- [5. Pretpostavke koje sistem pravi](#5-pretpostavke-koje-sistem-pravi)
- [6. Dijelovi sistema koji nisu potpuno završeni](#6-dijelovi-sistema-koji-nisu-potpuno-završeni)

---

## 1. Poznati bugovi

### BUG-01: Student dashboard poziva koordinator endpoint

**Opis:** `StudentDashboard.jsx` importuje `useApplicationLimit` hook koji poziva `/api/koordinator/application-limit`. Taj endpoint zahtijeva rolu `COORDINATOR`, pa studentski zahtjev uvijek dobiva `403 Forbidden`.

**Uticaj:** Greška je pohvatana u `catch` bloku hooka (`.catch(() => setLimit(null))`), pa ne ruši komponentu. Limit prijava za studente se prikazuje kao `null` umjesto stvarne vrijednosti, što znači da UI ne prikazuje upozorenje kada student dostigne maksimalni broj aktivnih prijava.

**Status:** Identificiran, nije popravljen u zadnjem sprintu.

**Workaround:** Admin može vidjeti i postaviti limit; student ga samo ne može vidjeti u svom dashboardu.

---

### BUG-02: Race condition pri provjeri limita prijava

**Opis:** Provjera maksimalnog broja aktivnih prijava studenta nije atomska operacija. Ako student pošalje dvije prijave istovremeno (npr. dvoklikom), obje mogu proći provjeru (pronašle su 0 aktivnih prijava) i kreirati dvije prijave.

**Uticaj:** Rijedak scenarij u normalnoj upotrebi, ali teoretski moguć.

**Status:** Nije popravljen. Zahtijeva database-level unique constraint ili pessimistic locking.

---

## 2. Tehnička ograničenja

### TL-01: Render Free Tier — Cold Start

Backend servis na Render besplatnom planu gasi se nakon 15 minuta neaktivnosti. Sljedeći zahtjev traje 30–60 sekundi dok se servis ne pokrene. Korisnici koji pristupaju aplikaciji nakon duže pauze doživljavaju vidljivo kašnjenje.

**Uticaj:** Loše korisničko iskustvo pri prvom pristupu u danu ili nakon perioda neaktivnosti.

---

### TL-02: Nema real-time notifikacija

In-app notifikacije se učitavaju samo pri učitavanju stranice ili ručnom refreshu. Ne postoji WebSocket implementacija za instant obavještavanje. Korisnik mora sam osvježiti stranicu da vidi novu notifikaciju.

**Uticaj:** Korisnici mogu propustiti vremenski osjetljive notifikacije (odobrenje prijave, poruke koordinatora).

---

### TL-03: JWT token se ne može invalidovati prije isteka

JWT tokeni su stateless — server ih ne može poništiti prije isteka (8 sati). Ako korisnik odjavi nalog, ali neko drugi ima kopiju tokena, može nastaviti slati zahtjeve do isteka tokena.

**Uticaj:** Sigurnosni rizik u slučaju kompromitovanog tokena. Nije implementiran blacklist mehanizam.

---

### TL-04: Nema refresh tokena

Korisnik mora ponovo unijeti kredencijale čim JWT token istekne (8 sati). Ne postoji automatsko obnavljanje sesije u pozadini.

**Uticaj:** Korisnici koji rade duže sesije mogu biti iznenada odjavljeni usred rada.

---

### TL-05: Upload fajlova ograničen na 150 KB

Multer middleware odbacuje fajlove veće od 150 KB. Ovo može biti previše restriktivno za neke PDF dokumente (životopisi s fotografijama).

**Uticaj:** Studenti s detaljnijim PDF dokumentima ne mogu ih uploadovati.

---

### TL-06: Nema paginacije na listama

Oglasi, prijave i liste studenata/kompanija se učitavaju bez paginacije. Ako broj stavki poraste, učitavanje može biti sporo i korisničko sučelje pretrpano.

**Uticaj:** Performansni problem pri većem broju korisnika. Nije kritičan za trenutnu veličinu baze.

---

### TL-07: Sequelize sync umjesto migracija

Shema baze se upravlja putem `sync({ alter: true })` pri svakom pokretanju. Ovo nije preporučena praksa za produkciju jer može dovesti do neočekivanih izmjena sheme bez kontrole verzija.

**Uticaj:** Nema revizijske historije promjena sheme. U produkcijskom okruženju preporučljivo je koristiti Sequelize CLI migracije.

---

### TL-08: Background job koristi setInterval, ne job queue

Automatsko završavanje isteklih praksi implementirano je putem `setInterval` koji se pokreće svakih 24 sata. Ovo nije pouzdano u distribuiranim ili multi-instance okruženjima.

**Uticaj:** Ako server pada i ponovo se pokreće u kratkim intervalima, job može biti preskočen ili izvršen više puta.

---

### TL-09: Nema monitoring i error tracking

Sistem nema integraciju s alatima poput Sentry (greške), Datadog ili Grafana (performanse), niti centralizovano logovanje. Greške se loguju samo u konzolu Render servisa.

**Uticaj:** Teško je dijagnosticirati probleme u produkciji bez pristupa Render logovima.

---

### TL-10: Brevo email — limit od 500 emailova dnevno

Brevo besplatni plan dozvoljava **500 emailova dnevno**. Svaka registracija, reset lozinke, promjena statusa prijave i završetak prakse generišu email. U slučaju većeg broja korisnika ili masovnih akcija, limit može biti premašen što rezultira neuspješnim slanjem emailova.

**Uticaj:** Korisnici ne primaju verifikacijske ili notifikacijske emailove dok se limit ne resetuje (ponoć).

---

## 3. Sigurnosna ograničenja

### SL-01: JWT u sessionStorage

Token se čuva u `sessionStorage` umjesto `httpOnly` cookie-ja. Iako `sessionStorage` ima kraći životni vijek od `localStorage`, i dalje je ranjiv na XSS napade ako postoji ranjivost u JavaScript kodu.

**Mitigacija:** Svi korisnički podaci u HTML emailovima prolaze kroz `escapeHtml()` sanitizaciju. Frontend ne koristi `dangerouslySetInnerHTML`.

---

### SL-02: CORS dozvoljava sve origine u razvoju

Backend koristi `app.use(cors())` bez eksplicitne liste dozvoljenih origina. Ovo je prihvatljivo za razvoj, ali u produkciji bi trebalo ograničiti na poznate URL-ove frontenda.

---

### SL-03: Nema rate limitinga na API endpointima

Ne postoji ograničenje broja zahtjeva po korisniku ili IP adresi. Napadač može slati neograničeni broj zahtjeva na login endpoint (brute force) ili na endpoint za slanje emailova.

---

### SL-04: Password reset link istječe za 30 minuta

Ovo je namjerno ograničenje, ali korisnici koji kasno provjere email (npr. spam folder) mogu dobiti istekli link i morati ponovo zahtijevati reset.

---

## 4. Nedovršene funkcionalnosti

Sve planirane funkcionalnosti su implementirane.
---

## 5. Pretpostavke koje sistem pravi

Sistem je dizajniran uz sljedeće pretpostavke koje mogu biti netačne u određenim kontekstima:

**PT-01:** Svaki student pripada tačno jednom fakultetu i jednom odsjeku. Studenti koji studiraju na više odsjeka ili mijenjaju odsjek nisu podržani bez ručne izmjene profila.

**PT-02:** Svaki koordinator nadgleda studente s jednog fakulteta. Koordinatori s inter-institucionalnom ulogom nisu podržani.

**PT-03:** Kompanija ima jedan kontakt profil. Kompanije s više poslovnih jedinica ili HR timova dijele jedan account.

**PT-04:** Oglas za praksu je namijenjen jednoj vrsti prakse. Oglas ne podržava različite pozicije s različitim zahtjevima u istom oglasu.

**PT-05:** Email adresa je jedinstveni identifikator korisnika. Korisnik koji promijeni email adresu ne može koristiti stari account bez administratorske intervencije.

**PT-06:** Akademska godina i semestri nisu eksplicitno modelovani. Sistem ne vrši automatsko resetovanje ili arhiviranje po akademskim ciklusima.

---

## 6. Dijelovi sistema koji nisu potpuno završeni

Sljedeći dijelovi sistema postoje u kodu ali nisu u potpunosti testirani ili polirarani za produkcijsku upotrebu:

### Evaluacija kompanije od strane studenta

Implementirana je `EvaluacijaKompanije` model i servis, ali UI za prikaz agregatnih ocjena kompanija (vidljiv studentima pri pregledu oglasa) nije implementiran. Studenti mogu ostaviti ocjenu, ali ta ocjena nije vidljiva javno.

### Preuzimanje izvještaja kao PDF

Koordinator ima dugme "Preuzmi izvještaj (PDF)" u modalnom prozoru izvještaja, ali ova funkcionalnost koristi isti mehanizam kao preuzimanje ugovora (`downloadPracticeContract`). Vizuelni format preuzetog PDF-a nije prilagođen za izvještaj — prikazuje se kao plain text.

### Admin panel — ograničene akcije

Admin može pregledati korisnike, aktivirati/deaktivirati accounte i pristupiti audit logu, ali sljedeće admin funkcionalnosti nisu implementirane:
- Brisanje oglasa direktno iz admin panela
- Pregled i uređivanje sistemskih postavki kroz UI (moguće samo kroz direktan DB pristup)
- Izvoz audit loga

---

*Dokument kreiran: juni 2026 | Tim: SI-Grupa 4*  
*Sve navedeno u ovom dokumentu odražava stvarno stanje sistema, ne željeno stanje.*
