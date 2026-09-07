# Sprint Backlog

| ID | Naziv zadatka | Odgovorna osoba | Status |
|----|--------------|-----------------|--------|
| SB-07 | Uređivanje profila studenta | Harun Ibrahimagić | Done |
| SB-08 | Pristup koordinatora | Amina Lukovac | Done |
| SB-10 | Kreiranje oglasa | Zerina Pandža | Done |
| SB-11 | Pregled oglasa | Haris Husić | Done |
| SB-40 | Deaktivacija/brisanje korisničkog računa | Hana Hodžić | Done |
| SB-42 | Navigacija | Haris Tucaković | Done |
| SB-44 | Pregled korisničkog profila | Harun Ibrahimagić | Done |
| SB-45 | Uređivanje profila kompanije | Haris Tucaković | Done |

---

## SB-07 – Uređivanje profila studenta

### US-07 - Kao student, želim da unesem/uređujem lične podatke

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu izmjenu podataka kao što su ime, prezime, indeks, godina studija i odsjek
- Sistem mora omogućiti unos ili izmjenu dodatnih podataka kao što su opis, vještine, interesovanja i profilna slika
- Kada student uspješno izmijeni podatke, korisnik treba dobiti potvrdu o ažuriranju profila
- Sistem ne smije omogućiti uređivanje profila neprijavljenom korisniku
- Sistem ne smije dozvoliti studentu izmjenu sistemskih podataka kao što su rola ili status računa

---

## SB-08 – Pristup koordinatora

### US-08 - Kao koordinator, želim da pristupim posebnom interfejsu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti koordinatoru pristup posebnom koordinatorskom interfejsu
- Sistem mora omogućiti koordinatoru pregled prijava studenata na prakse
- Sistem mora omogućiti koordinatoru uvid u osnovne informacije o studentima
- Sistem mora prikazati pregledan status svake prijave
- Sistem ne smije dozvoliti pristup koordinatorskom interfejsu korisnicima bez odgovarajuće role

---

## SB-10 – Kreiranje oglasa

### US-10 - Kao kompanija, želim da kreiram i objavim oglas

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji unos podataka oglasa: naziv, opis, trajanje, broj mjesta i uslovi
- Kada kompanija uspješno kreira oglas, sistem mora objaviti oglas i učiniti ga vidljivim studentima
- Korisnik treba dobiti potvrdu o uspješnom kreiranju oglasa
- Sistem ne smije dozvoliti kreiranje oglasa bez popunjenih obaveznih polja
- Sistem ne smije dozvoliti kreiranje oglasa neodobrenoj kompaniji
- Sistem mora povezati oglas sa kompanijom koja ga je kreirala

---

## SB-11 – Pregled oglasa

### US-11 - Kao student, želim da imam mogućnost pregleda svih dostupnih praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu pregled svih aktivnih oglasa
- Sistem mora prikazati osnovne informacije o svakom oglasu: naziv, kompanija, trajanje i broj mjesta
- Sistem ne smije dozvoliti pregled oglasa bez aktivne prijave u sistem
- Sistem mora prikazivati samo oglase koji su aktivni i dostupni studentima
- Lista oglasa mora biti pregledna i dostupna kroz navigaciju sistema

---

## SB-40 – Deaktivacija/brisanje korisničkog računa

### US-40 - Kao korisnik, želim da deaktiviram ili obrišem svoj nalog u sistemu

**Prioritet:** Low

**Acceptance criteria:**
- Sistem mora tražiti potvrdu od korisnika prije deaktivacije ili brisanja naloga
- Sistem mora onemogućiti prijavu na deaktiviran nalog
- Sistem mora obavijestiti kompaniju ili koordinatora ako student sa aktivnim prijavama obriše nalog
- Administrator mora moći reaktivirati deaktiviran nalog
- Sistem mora jasno razlikovati deaktivaciju naloga od trajnog brisanja naloga
- Sistem ne smije dozvoliti deaktivaciju ili brisanje naloga bez aktivne prijave korisnika

---

## SB-42 – Navigacija

### US-42 - Kao korisnik, želim jasnu i prilagođenu navigaciju ovisno o mojoj roli

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora prikazati navigaciju prilagođenu roli korisnika: student, kompanija, koordinator ili admin
- Navigacija mora sadržavati brze linkove ka glavnim funkcionalnostima date role
- Sistem mora prikazati opciju za odjavu u navigaciji
- Navigacija mora biti vidljiva na svim stranicama nakon prijave
- Sistem ne smije prikazivati stavke navigacije koje korisnik nema pravo koristiti
- Frontend navigacija mora biti usklađena sa backend autorizacijom

---

## SB-44 – Pregled korisničkog profila

### US-44 - Kao korisnik, želim da vidim detalje o svom profilu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora prikazati osnovne informacije o korisniku: ime ili naziv, email, adresa i ostale specifične informacije
- Sistem mora prikazati podatke u skladu sa tipom korisnika
- Sistem mora omogućiti pristup profilu sa glavne stranice ili navigacije
- Sistem mora prikazati mogućnost izmjene određenih korisničkih podataka
- Sistem ne smije prikazivati profil neprijavljenom korisniku
- Sistem ne smije prikazivati podatke drugog korisnika bez odgovarajuće dozvole

---

## SB-45 – Uređivanje profila kompanije

### US-45 - Kao kompanija, želim da vidim i uredim svoje pohranjene podatke

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji pregled vlastitih podataka
- Sistem mora omogućiti izmjenu informacija na profilu kompanije
- Kompanija mora moći pristupiti uređivanju sa profilne stranice kompanije
- Sistem ne smije omogućiti uređivanje profila neprijavljenoj kompaniji
- Sistem ne smije omogućiti kompaniji izmjenu sistemskih podataka kao što su rola ili status računa
- Nakon uspješne izmjene, sistem mora prikazati potvrdu o ažuriranju profila
