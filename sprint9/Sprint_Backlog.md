# Sprint Backlog

| ID | Naziv zadatka | Odgovorna osoba | Status |
|----|--------------|-----------------|--------|
| SB-16 | Selekcija kandidata | Haris Tucaković | Done |
| SB-17 | Odobravanje prakse | Amna Glamoč | Done |
| SB-18 | Odbijanje prakse | Amna Glamoč | Done |
| SB-31 | Zatvaranje oglasa | Harun | Done |
| SB-37 | Notifikacije o statusu prakse | Haris Husić | Done |
| SB-49 | Arhiviranje oglasa | Harun | Done |
| SB-50 | Pregled statistike prijava | Hana Hodžić | Done |
| SB-51 | Historija aktivnosti (Audit log) | Zerina Pandža | Done |
| SB-53 | Ograničenje broja prijava po studentu | Amina | Done |
| SB-55 | Podešavanje tipova notifikacija | Irma Lemes | Done |
| SB-57 | Pregled zatvorenih oglasa | Amina | Done |

---

## SB-16 – Selekcija kandidata

### US-16 - Kao kompanija, želim da evidentiram uži krug kandidata

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji označavanje kandidata koji prolaze u uži krug
- Kada kompanija selektuje kandidata, sistem mora ažurirati status prijave
- Sistem mora obavijestiti studenta o promjeni statusa njegove prijave
- Sistem ne smije dozvoliti selekciju kandidata na tuđim oglasima
- Sistem ne smije dozvoliti selekciju neprijavljenoj kompaniji

---

## SB-17 – Odobravanje prakse

### US-17 - Kao koordinator, želim da odobrim studentsku prijavu za praksu

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti koordinatoru odobravanje studentskih prijava na praksi
- Kada koordinator odobri praksu, sistem mora ažurirati status prijave
- Sistem mora obavijestiti studenta o promjeni statusa njegove prijave
- Sistem ne smije dozvoliti odobravanje bez odgovarajuće koordinatorske role
- Sistem ne smije dozvoliti odobravanje već odobrene ili odbijene prijave

---

## SB-18 – Odbijanje prakse

### US-18 - Kao koordinator, želim da odbijem studentsku prijavu za praksu

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti koordinatoru odbijanje studentskih prijava na praksi
- Kada koordinator odbije praksu, sistem mora ažurirati status prijave
- Sistem mora obavijestiti studenta o promjeni statusa njegove prijave
- Sistem ne smije dozvoliti odbijanje bez odgovarajuće koordinatorske role
- Sistem ne smije dozvoliti odbijanje već odobrene ili završene prijave

---

## SB-31 – Zatvaranje oglasa

### US-31 - Kao kompanija, želim da zatvorim oglas za praksu koji sam prethodno objavila

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti kompaniji zatvaranje aktivnog oglasa
- Na zatvoreni oglas se ne može više prijavljivati
- Zatvoreni oglas se ne pojavljuje u listi aktivnih oglasa
- Sistem mora obavijestiti kandidate koji čekaju na odgovor o zatvaranju oglasa
- Sistem ne smije dozvoliti zatvaranje oglasa drugoj kompaniji

---

## SB-35 – Student dashboard

### US-35 - Kao student, želim da imam centralizovani pregled svih svojih prijava na prakse

> **Napomena:** Ova stavka je realizovana u Sprintu 8 kao dio kompletiranja toka prijave studenta na praksu.

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora prikazati listu svih praksi na koje je student prijavljen
- Sistem mora prikazati trenutni status svake prijave (na čekanju, odobrena, odbijena, potvrđena)
- Sistem mora omogućiti studentu brzi pristup detaljima svake prijave
- Sistem mora prikazati obavještenja o nedavnim promjenama statusa
- Sistem ne smije prikazivati prijave koje ne pripadaju prijavljenom studentu

---

## SB-37 – Notifikacije o statusu prakse

### US-37 - Kao student, želim da primam notifikacije o svakoj promjeni statusa moje prijave na praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora poslati notifikaciju studentu kada kompanija promijeni status prijave (odobri, odbije, uvrsti u uži izbor)
- Sistem mora poslati notifikaciju kada koordinator odobri ili odbije praksu
- Sistem mora prikazati notifikacije unutar aplikacije na dashboardu studenta
- Student mora moći vidjeti historiju svih primljenih notifikacija
- Sistem ne smije slati duplikate notifikacija za istu promjenu statusa

---

## SB-49 – Arhiviranje oglasa

### US-49 - Kao kompanija, želim da arhiviram stare oglase kako bih zadržala evidenciju bez prikazivanja studentima

**Prioritet:** Low

**Acceptance criteria:**
- Sistem mora omogućiti arhiviranje zatvorenog oglasa
- Arhivirani oglasi se ne smiju prikazivati studentima u listi aktivnih oglasa
- Sistem mora omogućiti kompaniji pregled arhiviranih oglasa
- Sistem mora omogućiti vraćanje oglasa iz arhive
- Sistem ne smije dozvoliti arhiviranje aktivnog oglasa koji nije zatvoren

---

## SB-50 – Pregled statistike prijava

### US-50 - Kao kompanija, želim da vidim statistiku prijava na oglas kako bih bolje razumjela interes studenata

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora prikazati broj prijava po oglasu
- Sistem mora prikazati osnovne statistike (npr. po odsjeku, godini studija)
- Sistem mora omogućiti filtriranje statistike
- Sistem ne smije prikazivati statistiku za oglase koji ne pripadaju kompaniji
- Sistem ne smije dozvoliti pregled statistike neprijavljenoj kompaniji

---

## SB-51 – Historija aktivnosti (Audit log)

### US-51 - Kao administrator, želim imati uvid u historiju svih ključnih akcija u sistemu

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora bilježiti: registracije, promjene statusa prijava, brisanje naloga, uređivanje oglasa, odustajanje od prakse
- Svaki zapis mora sadržavati: korisnika, vrijeme i tip akcije
- Samo administrator može pregledati audit log
- Sistem mora omogućiti pretragu i filtriranje zapisa po tipu akcije, korisniku i vremenskom periodu
- Sistem ne smije dozvoliti brisanje ili izmjenu zapisa u audit logu

---

## SB-53 – Ograničenje broja prijava po studentu

### US-53 - Kao fakultet, želim ograničiti broj aktivnih prijava po studentu

**Prioritet:** Medium

**Acceptance criteria:**
- Administrator može definisati maksimalan broj aktivnih prijava po studentu
- Sistem ne smije dozvoliti prijavu iznad definisanog limita
- Student mora dobiti jasnu poruku o prekoračenju limita
- Limit se ne smije odnositi na već odobrene, odbijene ili završene prijave
- Promjena limita od strane administratora mora biti odmah primjenjena

---

## SB-55 – Podešavanje tipova notifikacija

### US-55 - Kao korisnik, želim da odaberem koje vrste notifikacija primam kako bih primao samo relevantne obavijesti

**Prioritet:** Low

**Acceptance criteria:**
- Sistem mora omogućiti korisniku izbor tipova notifikacija koje želi primati
- Sistem mora slati samo odabrane notifikacije
- Sistem mora zapamtiti korisničke postavke između sesija
- Promjene postavki moraju biti odmah primijenjene
- Sistem mora ponuditi razumne zadane postavke za novog korisnika

---

## SB-57 – Pregled zatvorenih oglasa

### US-57 - Kao student, želim da vidim zatvorene oglase kako bih razumio zahtjeve kompanija i bolje se pripremio za buduće prijave

**Prioritet:** Low

**Acceptance criteria:**
- Sistem mora omogućiti prikaz zatvorenih oglasa
- Zatvoreni oglasi moraju biti jasno označeni kao zatvoreni
- Sistem ne smije dozvoliti prijavu na zatvorene oglase
- Sistem mora omogućiti pregled detalja zatvorenog oglasa
- Sistem ne smije prikazivati arhivirane oglase u listi zatvorenih oglasa
