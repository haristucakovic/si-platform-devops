# Sprint Backlog

| ID | Naziv zadatka | Odgovorna osoba | Status |
|----|--------------|-----------------|--------|
| SB-58 | Odbijanje prakse | Amna Glamoč | Done |
| SB-59 | Potvrda studenta | Haris Husić | Done |
| SB-60 | Generisanje ugovora | Haris Tucaković | Done |
| SB-61 | Preuzimanje ugovora | Haris Tucaković | Done |
| SB-62 | Evidencija aktivnosti | Irma Lemeš | Done |
| SB-63 | Praćenje prisustva | Zerina Pandža | Done |
| SB-64 | Evaluacija studenta | Amina Lukovac | Done |
| SB-65 | Evaluacija kompanije | Amina Lukovac | Done |
| SB-66 | Izvještaji | Irma Lemeš | Done |
| SB-67 | Odustajanje od prakse | Haris Husić | Done |
| SB-68 | Notifikacije o statusu prakse | Haris Husić | Done |
| SB-69 | Automatsko završavanje prakse | Amna Glamoč | Done |

---

## SB-58 – Odbijanje prakse

### US-18 - Kao koordinator, želim da odbijem studentsku prijavu za praksu

> **Napomena:** Ova stavka je realizovana u Sprintu 9 (preuzeta iz originalnog plana Sprinta 10).

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti koordinatoru odbijanje studentskih prijava na praksi
- Kada koordinator odbije praksu, sistem mora ažurirati status prijave
- Sistem mora obavijestiti studenta o promjeni statusa njegove prijave
- Sistem ne smije dozvoliti odbijanje bez odgovarajuće koordinatorske role
- Sistem ne smije dozvoliti odbijanje već odobrene ili završene prijave

---

## SB-59 – Potvrda studenta

### US-19 - Kao student, želim da potvrdim učešće na odobrenoj praksi

**Prioritet:** High

**Acceptance criteria:**
- Sistem mora omogućiti studentu prihvatanje učešća na odobrenoj praksi
- Kada student prihvati praksu, sistem mora ažurirati status prijave
- Sistem mora obavijestiti kompaniju i koordinatora o promjeni statusa prijave
- Sistem mora kreirati zapis prakse nakon prihvatanja studenta
- Sistem ne smije dozvoliti potvrdu prijave koja nije u odobrenom statusu

---

## SB-60 – Generisanje ugovora

### US-22 - Kao sistem, želim automatski generisati ugovor o praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti generisanje ugovora o praksi za potvrđenu praksu
- Sistem mora omogućiti studentu i kompaniji uvid u ugovor
- Ugovor mora sadržavati podatke o studentu, kompaniji, trajanju i datumu prakse
- Sistem ne smije generisati ugovor za praksu koja nije potvrđena

---

## SB-61 – Preuzimanje ugovora

### US-23 - Kao student, želim preuzeti digitalni primjerak ugovora o praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu i kompaniji uvid u ugovor
- Sistem mora omogućiti preuzimanje digitalne kopije ugovora
- Preuzeti dokument mora biti na bosanskom jeziku
- Sistem ne smije dozvoliti pristup ugovoru korisnicima bez odgovarajuće uloge

---

## SB-62 – Evidencija aktivnosti

### US-24 - Kao student, želim unositi dnevne ili sedmične aktivnosti na praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu evidentiranje aktivnosti na praksi
- Sistem mora omogućiti pregled evidentiranih aktivnosti kompaniji i koordinatoru
- Aktivnosti se mogu unositi samo tokom aktivne prakse
- Sistem ne smije dozvoliti unos aktivnosti za tuđu praksu

---

## SB-63 – Praćenje prisustva

### US-25 - Kao kompanija, želim evidentirati prisustvo studenta na praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti evidentiranje prisustva studenta
- Sistem mora omogućiti studentu i kompaniji uvid u prisustvo
- Evidencija prisustva dostupna je samo tokom aktivne prakse
- Sistem ne smije dozvoliti evidenciju prisustva za tuđu praksu

---

## SB-64 – Evaluacija studenta

### US-26 - Kao kompanija, želim evaluirati rad studenta na praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti evaluaciju studenta kroz predefinisani formular
- Sistem mora omogućiti studentu pregled evaluacije
- Evaluacija je dostupna nakon završetka ili tokom završne faze prakse
- Sistem ne smije dozvoliti evaluaciju studenta bez aktivne ili završene prakse

---

## SB-65 – Evaluacija kompanije

### US-27 - Kao student, želim evaluirati kompaniju u kojoj sam radio praksu

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu evaluaciju kompanije kroz predefinisani formular
- Sistem mora omogućiti kompaniji pregled evaluacije
- Evaluacija je dostupna nakon završetka prakse
- Sistem ne smije dozvoliti evaluaciju prije završetka prakse

---

## SB-66 – Izvještaji

### US-28 - Kao kompanija, želim generisati izvještaj o praksi

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti generisanje izvještaja o praksi
- Izvještaj mora sadržavati ključne podatke o trajanju, aktivnostima i prisustvu studenta
- Student mora moći pregledati izvještaj kao dokaz o pohađanju prakse
- Sistem ne smije generisati izvještaj za praksu koja nije završena

---

## SB-67 – Odustajanje od prakse

### US-33 - Kao student, želim odustati od prijavljene ili odobrene prakse

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora omogućiti studentu odustajanje od prakse u statusu na čekanju ili odobrena
- Kada student odustane, sistem mora ažurirati status prijave
- Sistem mora obavijestiti kompaniju i koordinatora o odustajanju studenta
- Sistem ne smije dozvoliti odustajanje od prakse koja je već završena

---

## SB-68 – Notifikacije o statusu prakse

### US-37 - Kao student, želim primati notifikacije o promjeni statusa moje prijave na praksu

> **Napomena:** Ova stavka je realizovana u Sprintu 9 (preuzeta iz originalnog plana Sprinta 10).

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora poslati notifikaciju studentu kada kompanija promijeni status prijave (odobri, odbije, uvrsti u uži izbor)
- Sistem mora poslati notifikaciju kada koordinator odobri ili odbije praksu
- Sistem mora prikazati notifikacije unutar aplikacije na dashboardu studenta
- Student mora moći vidjeti historiju svih primljenih notifikacija
- Sistem ne smije slati duplikate notifikacija za istu promjenu statusa

---

## SB-69 – Automatsko završavanje prakse

### US-54 - Kao sistem, želim automatski označiti praksu završenom nakon isteka trajanja

**Prioritet:** Medium

**Acceptance criteria:**
- Sistem mora pratiti datum početka i trajanje prakse
- Po isteku trajanja status prakse prelazi u „Završena“
- Sistem mora obavijestiti studenta i kompaniju o završetku prakse
- Sistem ne smije višestruko slati obavijest za istu praksu
