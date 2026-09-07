# Sprint Backlog

| ID | Naziv zadatka | Odgovorna osoba | Status |
|----|--------------|-----------------|--------|
| SB-01 | Registracija korisnika | Hana Hodžić| Done |
| SB-02 | Prijava korisnika | Harun Ibrahimagić | Done |
| SB-16 | Implementacija autentifikacije | Hana Hodžić, Harun Ibrahimagić| Done |
| SB-28 | Obnavljanje lozinke | Irma Lemeš | Done |
| SB-32 | Verifikacija email adrese | Amna Glamoč | Done |
| SB-05 | Odobravanje korisničkog računa | Amna Glamoč | Done |

---

## SB-01 – Registracija korisnika

### US-01 - Kao student, želim da se registrujem u sistem kako bih kreirao svoj profil

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti unos podataka: ime, prezime, email, lozinka, indeks, godina studija, odsjek
- Kada student uspješno unese sve podatke, korisnik treba dobiti potvrdu o registraciji na ekranu
- Sistem ne smije dozvoliti registraciju s već postojećim emailom
- Sistem ne smije odobriti profil prije verifikacije od strane fakulteta
- Sistem ne smije dozvoliti završetak registracije bez popunjenih obaveznih polja

### US-02 - Kao koordinator, želim da se registrujem u sistem s odgovarajućim privilegijama

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti unos podataka: ime, prezime, email, lozinka, institucija, odsjek
- Kada koordinator unese podatke, sistem mora kreirati profil i dodijeliti mu rolu koordinatora
- Korisnik treba dobiti obavještenje da je registracija na čekanju adminovog odobravanja
- Sistem ne smije dozvoliti pristup privilegijama dok admin ne odobri account
- Sistem ne smije dozvoliti registraciju s već postojećim emailom

### US-03 - Kao kompanija, želim da se registrujem u sistem radi objavljivanja oglasa

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti unos podataka: naziv kompanije, email, lozinka, adresa, kontakt osoba
- Kada kompanija unese podatke, sistem mora poslati zahtjev adminu za odobravanje
- Korisnik treba dobiti obavještenje da je registracija na čekanju odobravanja
- Sistem ne smije dozvoliti registraciju s već postojećim emailom

---

## SB-02 – Prijava korisnika

### US-04 - Kao student, želim da se prijavim u sistem

**Prioritet:** High

**Acceptance criteria:**
- Kada student uspješno unese kredencijale, sistem ga mora preusmjeriti na dashboard
- Korisnik treba dobiti poruku greške u slučaju pogrešnih kredencijala
- Sistem ne smije dozvoliti pristup bez verifikovanog accounta
- Sistem ne smije dozvoliti prijavu s nepostojećim emailom

### US-05 - Kao koordinator, želim da se prijavim u sistem

**Prioritet:** High

**Acceptance criteria:**
- Kada koordinator uspješno unese kredencijale, sistem ga mora preusmjeriti na koordinatorski dashboard
- Sistem mora omogućiti pristup samo odobrenim koordinatorskim accountima
- Korisnik treba dobiti poruku greške u slučaju pogrešnih kredencijala
- Sistem ne smije dozvoliti pristup neodobrenom koordinatoru

### US-06 - Kao kompanija, želim da se prijavim u sistem

**Prioritet:** High

**Acceptance criteria:**
- Kada kompanija uspješno unese kredencijale, sistem mora preusmjeriti je na dashboard kompanije
- Sistem mora omogućiti pristup samo odobrenim kompanijskim accountima
- Korisnik treba dobiti poruku greške u slučaju pogrešnih kredencijala
- Sistem ne smije dozvoliti pristup neodobrenoj kompaniji

---

## SB-16 – Implementacija autentifikacije

Tehnički zadatak: implementacija JWT autentifikacije, RBAC middlewarea, bcrypt hashovanja lozinki i zaštite ruta po rolama.

**Prioritet:** High

**Acceptance criteria:**
- JWT token se generiše pri uspješnoj prijavi i nosi informaciju o roli korisnika
- Svi zaštićeni endpointi provjeravaju valjanost tokena pri svakom zahtjevu
- Lozinke se čuvaju isključivo u hashovanom obliku (bcrypt)
- RBAC middleware odbija zahtjeve korisnika bez odgovarajuće role

---

## SB-28 – Obnavljanje lozinke

### US-34 - Kao korisnik, želim da obnovim lozinku u slučaju zaboravljanja

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti unos email adrese za slanje linka za resetovanje lozinke
- Sistem mora poslati email sa reset linkom na registrovanu adresu
- Reset link mora isteći nakon određenog vremenskog perioda (npr. 30 minuta)
- Kada korisnik uspješno postavi novu lozinku, sistem ga mora preusmjeriti na stranicu za prijavu
- Sistem ne smije otkriti da li email postoji u bazi u slučaju nepostojećeg emaila (sigurnost)

---

## SB-32 – Verifikacija email adrese

### US-38 - Kao novi korisnik, želim da primim email za verifikaciju računa

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora automatski poslati verifikacioni email odmah nakon registracije
- Verifikacioni link mora isteći nakon određenog perioda (npr. 24 sata)
- Kada korisnik klikne validni link, sistem mora aktivirati nalog i preusmjeriti ga na prijavu
- Sistem mora onemogućiti prijavu na nalog koji nije verifikovan
- Sistem mora omogućiti korisniku ponovno slanje verifikacionog emaila

---

## SB-05 – Odobravanje korisničkog računa

### US-58 - Kao administrator, želim pregledati zahtjev za registraciju i dodijeliti korisniku odgovarajuću rolu

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora obavijestiti koordinatora/administratora o novom zahtjevu nakon verifikacije emaila
- Koordinator/administrator mora moći pregledati podatke korisnika i verificirati identitet
- Sistem mora dodijeliti odgovarajuću rolu korisniku tek nakon odobrenja
- U slučaju odbijanja, sistem mora tražiti unos razloga odbijanja
- Sistem mora obavijestiti korisnika o ishodu zahtjeva (odobreno/odbijeno) i dodijeljenoj roli
- Sistem ne smije dozvoliti prijavu korisniku čiji račun nije odobren
- Sistem mora automatski podsjetiti koordinatora/administratora ako zahtjev čeka odobrenje duže od definisanog perioda