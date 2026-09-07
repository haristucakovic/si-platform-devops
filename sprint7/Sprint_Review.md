# Sprint Review Summary

## Sprint broj  
Sprint 7  

## Planirani sprint goal  
Implementacija osnovnih funkcionalnosti dashboarda za studente, kompanije i koordinatore, uključujući uređivanje i pregled profila, kreiranje i pregled oglasa za praksu, navigaciju prilagođenu roli korisnika, te upravljanje korisničkim računima.

---

## Šta je završeno  

- PB39 – Uređivanje profila studenta  
- PB5 – Pristup koordinatora  
- PB6 – Kreiranje oglasa  
- PB7 – Pregled oglasa  
- PB33 – Deaktivacija/brisanje korisničkog računa  
- PB35 – Navigacija  
- PB36 – Pregled korisničkog profila  
- PB39 – Uređivanje profila kompanije  
- PB8 – Pregled detalja oglasa (preuzet iz Sprinta 8)  
- PB30 – Filtriranje oglasa (preuzet iz Sprinta 8)  

Sve planirane stavke Sprinta 7 su realizovane, zajedno sa dva unaprijed implementirana user storija iz Sprinta 8.

---

## Šta nije završeno  

Sve planirane funkcionalnosti su završene. Nema prenesenih stavki u naredni sprint.

---

## Demonstrirane funkcionalnosti ili artefakti  

### Uređivanje profila studenta  
Student može izmijeniti lične podatke (ime, prezime, indeks, godina studija, odsjek), kao i dodatne informacije poput opisa, vještina, hobija i interesovanja. Nakon uspješne izmjene sistem prikazuje potvrdu o ažuriranju.

### Pregled i uređivanje profila kompanije  
Kompanija može pregledati i ažurirati svoje podatke putem profilne stranice. Onemogućeno je uređivanje bez aktivne prijave.

### Pristup koordinatora  
Implementiran poseban interfejs za koordinatora sa pregledom prijava studenata na prakse, uključujući osnovne informacije o studentima i status svake prijave. Pristup je zaštićen rolnom autorizacijom.

### Kreiranje oglasa  
Odobrena i prijavljena kompanija može kreirati oglas unosom naziva, opisa, trajanja, broja mjesta i uslova. Sistem validira obavezna polja i onemogućava kreiranje oglasa neodobrenim kompanijama.

### Pregled oglasa  
Student može pregledati sve aktivne oglase sa osnovnim informacijama (naziv, kompanija, trajanje, broj mjesta).

### Pregled detalja oglasa  
Student ima pristup detaljnom prikazu oglasa uključujući opis, trajanje, broj mjesta, uslove, kontakt informacije i rok za prijavu. Neaktivni oglasi nisu dostupni.

### Filtriranje oglasa  
Omogućeno filtriranje po oblasti zanimanja, vrsti plaćanja (plaćena/neplaćena praksa), datumu objave i trajanju. Lista oglasa se ažurira dinamički pri promjeni filtera, uz opciju resetovanja filtera.

### Deaktivacija/brisanje korisničkog računa  
Korisnik može deaktivirati ili obrisati nalog uz obaveznu potvrdu. Deaktivirani nalozi se ne mogu koristiti za prijavu. Administrator ima mogućnost reaktivacije naloga.

### Navigacija prilagođena roli  
Implementirana dinamička navigacija za studenta, kompaniju, koordinatora i administratora. Navigacija sadrži brze linkove ka ključnim funkcionalnostima i opciju za odjavu. Sistem ne prikazuje nedozvoljene stavke prema roli.

---

## Glavni problemi i blokeri  
 
- Implementacija filtriranja oglasa zahtijevala je optimizaciju upita prema bazi podataka radi boljih performansi.  
- Potrebno dodatno testiranje edge case scenarija kod brisanja korisničkih naloga sa aktivnim prijavama.  

---

## Ključne odluke donesene u sprintu  

- Filtriranje oglasa implementirano je na backend strani kako bi se osigurala skalabilnost i konzistentnost podataka.   
- Navigacija je centralizovana u zajedničkoj komponenti radi lakšeg održavanja i proširivanja funkcionalnosti u narednim sprintovima.  

---

## Povratna informacija Product Ownera  

Product Owner je zadovoljan napretkom i činjenicom da su implementirani i pojedini funkcionalni zahtjevi planirani za Sprint 8.   

Predloženo je da se izmijeni trenutni format datuma mm/dd/yyyy i da se umjesto njega koristi dd/mm/yyyy format.

---

## Zaključak za naredni sprint  

Sprint 7 je uspješno realizovan sa svim planiranim funkcionalnostima i dodatnim unaprijed završenim stavkama. Sistem sada posjeduje funkcionalne dashboarde za sve ključne role i osnovni tok interakcije između studenata i kompanija.  

Fokus narednog sprinta biće implementacija prijave na praksu, upravljanje prijavama, statusi prijava, kao i dodatno unapređenje korisničkog iskustva i validacije poslovnih pravila.
