# Sprint Backlog

| ID | Naziv zadatka | Odgovorna osoba | Status |
|----|--------------|-----------------|--------|
| SB-13 | Prijava na praksu | Haris Tucaković | Done |
| SB-14 | Upload dokumentacije | Irma Lemes | Done |
| SB-15 | Pregled prijava na praksu | Haris Husić | Done |
| SB-32 | Uređivanje oglasa | Zerina Pandža | Done |
| SB-43 | Pregled profila kompanije | Amna Glamoč | Done |
| SB-48 | Favoriziranje oglasa | Hana Hodžić | Done |
| SB-52 | Upravljanje rokovima prijave | Zerina Pandža | Done |
| SB-56 | Oznaka „Novo“ na oglasima | Hana Hodžić | Done |

---

## SB-13 – Prijava na praksu

### US-13 - Kao student, želim da se prijavim na praksu

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti studentu prijavu na aktivan oglas za praksu
- Sistem mora evidentirati datum i vrijeme prijave
- Student treba dobiti potvrdu nakon uspješne prijave
- Sistem ne smije dozvoliti prijavu na oglas kojem je istekao rok
- Sistem ne smije dozvoliti višestruke prijave na isti oglas od strane istog studenta
- Sistem ne smije dozvoliti prijavu neprijavljenom korisniku

---

## SB-14 – Upload dokumentacije

### US-14 - Kao student, želim da priložim dokumentaciju prilikom prijave na praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti upload dokumentacije kao što su CV i motivaciono pismo
- Sistem mora podržavati definisane formate fajlova (PDF, DOCX i slično)
- Sistem mora ograničiti maksimalnu veličinu fajla
- Student treba dobiti potvrdu nakon uspješnog upload-a dokumentacije
- Sistem ne smije dozvoliti upload nepodržanih formata
- Sistem ne smije dozvoliti upload dokumentacije bez aktivne prijave na praksu

---

## SB-15 - Pregled prijava na praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji pregled svih prijavljenih studenata po oglasu
- Sistem mora prikazati osnovne informacije o svakom kandidatu: ime, prezime, odsjek, godina studija
- Sistem mora omogućiti pregled uploadovanih dokumenata svakog kandidata
- Sistem ne smije dozvoliti pregled prijava na tuđe oglase

---

## SB-32 – Uređivanje oglasa

### US-32 - Kao kompanija, želim da uredim postojeći oglas za praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji izmjenu podataka oglasa
- Kompanija mora moći izmijeniti naziv, opis, trajanje, broj mjesta i uslove oglasa
- Sistem mora sačuvati izmjene i prikazati ažurirane podatke studentima
- Kompanija treba dobiti potvrdu nakon uspješnog uređivanja oglasa
- Sistem ne smije dozvoliti uređivanje oglasa drugim kompanijama
- Sistem ne smije dozvoliti uređivanje oglasa neprijavljenom korisniku

---

## SB-43 – Pregled profila kompanije

### US-43 - Kao student, želim da pregledam profil kompanije

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti pregled osnovnih informacija o kompaniji
- Sistem mora prikazati naziv, opis, lokaciju i kontakt informacije kompanije
- Student mora moći otvoriti profil kompanije sa stranice oglasa
- Sistem ne smije prikazivati neaktivne kompanije
- Sistem ne smije dozvoliti pregled profila neprijavljenom korisniku

---

## SB-48 – Favoriziranje oglasa

### US-48 - Kao student, želim da označim oglase kao omiljene

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu dodavanje oglasa u favorite
- Student mora moći ukloniti oglas iz favorita
- Sistem mora prikazivati listu favoriziranih oglasa na dashboardu
- Favorizirani oglasi moraju ostati sačuvani nakon ponovne prijave korisnika
- Sistem ne smije dozvoliti favoriziranje oglasa neprijavljenom korisniku
- Sistem ne smije dozvoliti dupliranje istog oglasa u favoritima

---

## SB-52 – Upravljanje rokovima prijave

### US-52 - Kao kompanija, želim da definišem rok prijave za praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji postavljanje roka prijave za oglas
- Kompanija mora moći izmijeniti postojeći rok prijave
- Sistem mora automatski zatvoriti prijave nakon isteka roka
- Sistem mora prikazivati rok prijave studentima
- Sistem ne smije dozvoliti unos roka u prošlosti
- Sistem ne smije dozvoliti upravljanje rokovima neprijavljenoj kompaniji

---

## SB-56 – Oznaka „Novo“ na oglasima

### US-56 - Kao student, želim da vidim koji su oglasi novi

**Prioritet:** Low

**Acceptance criteria:**
- Sistem mora prikazati oznaku „Novo“ na novoobjavljenim oglasima
- Oznaka mora biti jasno vidljiva u listi oglasa
- Sistem mora automatski ukloniti oznaku nakon definisanog vremenskog perioda
- Student mora moći razlikovati nove oglase od starijih
- Sistem ne smije prikazivati oznaku na starim oglasima
- Oznaka mora biti konzistentno prikazana na svim prikazima oglasa