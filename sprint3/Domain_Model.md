# Domenski model

## Glavni entiteti


- **User** - centralni entitet koji sadrži autentifikacijske podatke za sve korisnike sistema
- **Role** - uloga korisnika u sistemu (ROLE_STUDENT, ROLE_KOMPANIJA, ROLE_KOORDINATOR, ROLE_ADMIN)
- **Student** - korisnik sistema koji pretražuje, prijavljuje se i učestvuje na praksama
- **Kompanija** - korisnik sistema koji nudi oglase za praksu, pregleda prijave, bira studente i prati njihov progres
- **Koordinator** - korisnik sistema koji odobrava prijave na praksu i prati progres studenata za vrijeme trajanja prakse
- **Fakultet** - institucija kojoj pripadaju studenti i koordinatori
- **Oglas** - oglas za praksu koji objavljuje kompanija
- **PrijavaNaPraksu** - prijava studenta na određeni oglas za praksu
- **Praksa** - aktivna praksa koja nastaje nakon odobrenja prijave studenta na praksu
- **Ugovor** - dokument koji formalizuje početak prakse
- **Izvještaj** - dokument koji formalizuje završetak prakse
- **Prisustvo** - evidencija prisustva studenta tokom prakse
- **Aktivnost** - evidencija o aktivnostima studenta tokom prakse
- **EvaluacijaKompanije** - ocjena i komentar studenta o kompaniji za koju je radio praksu
- **EvaluacijaStudenta** - ocjena i komentar kompanije o studentu koji je radio praksu


## Ključni atributi


### User
`ime`  
`prezime`  
`email`  
`lozinka`  
`username`  
`email verifikovan (da/ne)`  
`aktivan (da/ne)`

### Role
`naziv`

### Student
`indeks`  
`godina studija`  
`odsjek`

### Koordinator
`fakultet`

### Kompanija
`naziv`  
`opis poslovanja`  
`adresa`  
`telefon`

### Fakultet
`naziv`  
`email`  
`adresa`

### Oglas
`naziv`  
`opis`  
`broj mjesta`  
`datum objave`  
`rok prijave`  
`trajanje`  
`oblast`  
`plaćena praksa (da/ne)`  
`status (AKTIVAN | ZATVOREN | ARHIVIRAN)`

### PrijavaNaPraksu
`status (NA_CEKANJU | ODOBRENA | ODBIJENA | POVUCENA)`  
`datum prijave`  
`CV`  
`motivaciono pismo`  
`datum odustajanja`  
`razlog odbijanja`

### Praksa
`datum početka`  
`datum kraja`  
`datum odustajanja`  
`razlog odustajanja`

### Ugovor
`datum početka`  
`datum završetka`  
`opis`

### Izvještaj
`datum`  
`opis`  
`preporuka`

### EvaluacijaStudenta
`ocjena`  
`komentar`  
`datum`

### EvaluacijaKompanije
`ocjena`  
`komentar`  
`datum`

### Prisustvo
`datum`  
`status`

### Aktivnost
`datum`  
`opis`


## Veza između entiteta


**User i Role**
- svaki korisnik ima tačno jednu ulogu
- jedna uloga može biti dodijeljena više korisnika

**User i Student/Kompanija/Koordinator**
- svaki od ovih entiteta predstavlja profilne podatke specifične za određenu ulogu
- svaki profil je vezan za tačno jedan User entitet 
- autentifikacijski podaci (email, lozinka, username) čuvaju se isključivo u User entitetu

**Student i Fakultet**
- student pripada jednom fakultetu, dok fakultet ima više studenata

**Koordinator i Fakultet**
- koordinator pripada jednom fakultetu, dok fakultet može imati više koordinatora

**Kompanija i Oglas**
- ista kompanija može objaviti više oglasa za praksu
- jedan oglas objavljuje tačno jedna kompanija

**Oglas i PrijavaNaPraksu**
- jedan oglas može imati više prijava od strane različitih studenata
- jedna prijava se odnosi samo na jedan oglas

**Student i PrijavaNaPraksu**
- student može podnijeti više prijava za praksu, ali samo jednu po oglasu

**PrijavaNaPraksu i Koordinator**
- koordinator odobrava prijave na praksu
- jednu prijavu na praksu odobrava jedan koordinator

**PrijavaNaPraksu i Praksa**
- nakon koordinatorovog odobrenja, prijava rezultira tačno jednom praksom 
- prijava može postojati bez prakse (odbijena ili prijava na čekanju)

**Praksa i EvaluacijaKompanije**
- student evaluira kompaniju u okviru prakse koju je student radio za tu kompaniju

**Praksa i EvaluacijaStudenta**
- kompanija evaluira studenta u okviru prakse koju je student radio za kompaniju 

**Praksa i Aktivnost**
- jedna praksa ima više aktivnosti koje pokrivaju sve što student radi tokom prakse

**Praksa i Prisustvo**
- za jednu praksu postoji više zapisa o prisustvu za svaki dan trajanja prakse

**Praksa i Ugovor**
- praksa ima tačno jedan ugovor koji formalizuje početak prakse

**Praksa i Izvještaj**
- praksa ima tačno jedan izvještaj koji formalizuje kraj prakse


## Poslovna pravila važna za model


### Pravila vezana za studenta
- Student se može prijaviti na isti oglas tačno jednom (unique constraint: studentID + oglasID)
- Student se može prijaviti na više različitih oglasa
- Student ne može imati dvije aktivne prakse u isto vrijeme
- Student može obaviti više praksi tokom školovanja
- Student mora biti odobren od strane koordinatora kako bi koristio sistem
- Email studenta mora biti verifikovan kako bi koristio sistem
- Promjena fakulteta tretira se kao kreiranje novog profila

### Pravila vezana za kompaniju
- Email kompanije mora biti verifikovan kako bi koristila sistem
- Kompanija mora biti odobrena od strane admina prije korištenja sistema
- Kompanija može vidjeti samo prijave na svoje oglase

### Pravila vezana za koordinatora
- Email koordinatora mora biti verifikovan kako bi koristio sistem
- Koordinator mora biti odobren od strane admina prije korištenja sistema
- Koordinator može odobriti prijave studenata samo sa svog fakulteta
- Koordinator može pratiti samo prakse studenata sa svog fakulteta
- Koordinator ne može odobriti prijavu studentu koji već ima aktivnu praksu
- Koordinator može odbiti prijavu studenta uz navođenje razloga

### Pravila vezana za admina
- Samo admin može dodavati fakultete u sistem
- Sistem može posjedovati više admina (korisnika sa ROLE_ADMIN ulogom)

### Pravila vezana za prijavu na praksu
- Student može povući prijavu bez navođenja razloga
- Student ne može povući prijavu koja je već odobrena ili odbijena
- Nakon povlačenja prijave student se može ponovo prijaviti na isti oglas
- Prijava na praksu se može podnijeti samo na oglas koji je aktivan

### Pravila vezana za praksu
- Student može odustati od aktivne prakse uz navođenje razloga
- Student ne može odustati od prakse koja je već završena
- Praksa nastaje isključivo kada koordinator odobri prijavu na praksu
- Datum početka ugovora mora se podudarati sa datumom početka prakse
- Datum završetka ugovora mora se podudarati sa datumom kraja prakse
- Prisustvo se može evidentirati samo za dane unutar trajanja prakse
- Ne može postojati više od jednog zapisa prisustva po danu (unique constraint: praksaID + datum)
- Izvještaj se može kreirati tek nakon što praksa završi

### Pravila vezana za evaluaciju
- Evaluacija je moguća samo nakon završetka prakse i odnosi se isključivo na praksu u kojoj su obje strane učestvovale
- Evaluacija se ne može mijenjati nakon što je predana

### Pravila vezana za oglas
- Oglas može imati status: AKTIVAN, ZATVOREN ili ARHIVIRAN
- Oglas mora imati rok prijave koji je u budućnosti kako bi imao status AKTIVAN
- Oglas mora imati najmanje jedno mjesto za praksu
- Arhivirani oglas nije vidljiv studentima
- Kompanija ne može uređivati oglas koji je zatvoren ili arhiviran
