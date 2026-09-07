# Decision Log

## Sprint 10

### DL-S10-01
- **Datum:** 26.05.2026
- **Naziv odluke:** Odvajanje studentske odluke od statusa odobrenja prijave
- **Opis problema:** Nakon dvostepenog odobravanja prijave (koordinator → kompanija), student treba zasebno potvrditi učešće na praksi. Postojala je dilema da li prihvatanje studenta mijenja glavni status prijave `ODOBRENA` ili se čuva kao zasebno polje.
- **Razmatrane opcije:**
  - **Opcija A:** Promijeniti `PrijavaNaPraksu.status` u novi status (npr. `POTVRDJENA`) pri prihvatanju studenta.
  - **Opcija B:** Uvesti zasebna polja `studentStatus` i `studentOdlucioAt`, zadržavajući `status = ODOBRENA`.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Odobrenje prijave i studentska odluka su dvije različite faze poslovnog toka. Zadržavanje `ODOBRENA` omogućava konzistentan pregled odobrenih prijava, dok zasebna polja jasno bilježe da li je student prihvatio ili odbio praksu.
- **Posljedice odluke:**
  - Dodana su polja `studentStatus` i `studentOdlucioAt` uz backfill postojećih prijava
  - Kreiranje `Praksa` zapisa dešava se tek nakon prihvatanja studenta
  - Student može potvrditi već odobrenu prijavu i kada je oglas zatvoren ili arhiviran
- **Status:** Aktivna

---

### DL-S10-02
- **Datum:** 26.05.2026
- **Naziv odluke:** Generisanje ugovora na bosanskom jeziku s PDF preuzimanjem
- **Opis problema:** Ugovor o praksi treba biti dostupan studentu i kompaniji u čitljivom formatu. Postojala je dilema između tekstualnog preuzimanja, serverskog PDF generisanja i klijentskog PDF exporta.
- **Razmatrane opcije:**
  - **Opcija A:** Preuzimanje ugovora kao `.txt` fajl.
  - **Opcija B:** Serversko generisanje PDF-a putem backend biblioteke.
  - **Opcija C:** Prikaz ugovora u UI-ju s klijentskim PDF exportom iz prikazanog sadržaja.
- **Odabrana opcija:** Opcija C
- **Razlog izbora:** Minimalan diff u odnosu na postojeću arhitekturu — ugovor se već renderuje kao HTML/sadržaj na backendu, a PDF se generiše na klijentu bez uvođenja nove serverske dependency biblioteke.
- **Posljedice odluke:**
  - Naziv sistema u tekstu ugovora usklađen je na `PraksaHub`
  - Tekstualno preuzimanje zamijenjeno je PDF dokumentom
  - Buduća složenija formatiranja mogu zahtijevati dodatnu PDF biblioteku
- **Status:** Aktivna

---

### DL-S10-03
- **Datum:** 30.05.2026
- **Naziv odluke:** Date-based lifecycle status prakse umjesto persistiranog statusa u bazi
- **Opis problema:** User story US-54 zahtijeva automatsko završavanje prakse nakon isteka trajanja. Model `Praksa` nema kolonu `status` — lifecycle se već izračunava iz `datumPocetka`, `datumKraja` i `datumOdustajanja`.
- **Razmatrane opcije:**
  - **Opcija A:** Dodati kolonu `status` u tabelu `prakse` i ažurirati je periodičkim jobom.
  - **Opcija B:** Zadržati postojeću date-based logiku u `practiceLifecycleStatus()` i koristiti periodički job samo za slanje obavijesti.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Status `ZAVRSENA` se pouzdano izračunava iz postojećih datuma bez rizika desinhronizacije između kolone i datuma. Job postaje odgovoran za obavijestivanje, a ne za promjenu stanja koje frontend već prikazuje ispravno.
- **Posljedice odluke:**
  - Dodato je polje `datumObavijestiZavrsetka` radi idempotentnosti obavijesti
  - Frontend nije zahtijevao izmjene jer badge „Završena praksa“ već postoji
  - Testovi koji očekuju persistirani status moraju koristiti datumsku lifecycle logiku
- **Status:** Aktivna

---

### DL-S10-04
- **Datum:** 30.05.2026
- **Naziv odluke:** Periodički job sa `setInterval` umjesto `node-cron`
- **Opis problema:** Automatsko završavanje prakse zahtijeva periodičku provjeru isteklih praksi. U projektu do tada nije postojao scheduler ni background job infrastruktura.
- **Razmatrane opcije:**
  - **Opcija A:** Uvesti `node-cron` biblioteku za dnevno pokretanje joba.
  - **Opcija B:** Implementirati lightweight job sa `setTimeout` + `setInterval` unutar `practiceCompletion.job.js`.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Minimalan diff — jedan job, jednostavna logika, bez nove dependency. Prvi run ~1 min nakon starta servera omogućava brzo testiranje; zatim interval od 24 sata pokriva produkcijski slučaj.
- **Posljedice odluke:**
  - Job se pokreće u `server.js` nakon `sequelize.sync`
  - Greške u jobu se logiraju bez rušenja server procesa
  - Za složenije rasporede u budućnosti može biti potreban prelazak na dedicated scheduler
- **Status:** Aktivna
