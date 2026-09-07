# Sprint Review Summary

## Sprint broj  
Sprint 8  

## Planirani sprint goal  
Unaprijediti funkcionalnosti oglasa za praksu kroz mogućnost uređivanja, upravljanja rokovima prijave i označavanja novih oglasa, te omogućiti studentima lakše praćenje i prijavu na prakse putem favoriziranja oglasa, upload-a dokumentacije i studentskog dashboarda.

---

## Šta je završeno  

- SB-13 – Prijava na praksu (preuzeto iz Sprinta 9)  
- SB-14 – Upload dokumentacije (preuzeto iz Sprinta 9)  
- SB-15 – Pregled prijava na praksu  
- SB-32 – Uređivanje oglasa  
- SB-43 – Pregled profila kompanije  
- SB-48 – Favoriziranje oglasa  
- SB-52 – Upravljanje rokovima prijave  
- SB-56 – Oznaka „Novo" na oglasima  

Sve planirane stavke Sprinta 8 su realizovane, zajedno sa dvije funkcionalnosti preuzete iz Sprinta 9 radi kompletiranja toka prijave studenta na praksu.

---

## Šta nije završeno  

Sve planirane funkcionalnosti su završene. Nema prenesenih stavki u naredni sprint.

---

## Demonstrirane funkcionalnosti ili artefakti  

### Prijava na praksu  
Student može poslati prijavu na aktivan oglas. Sistem bilježi datum i vrijeme prijave, onemogućava višestruke prijave na isti oglas te blokira prijavu ako je rok istekao ili oglas nije aktivan. Nakon uspješne prijave student dobija potvrdu.

### Upload dokumentacije  
Student može priložiti dokumentaciju (CV, motivaciono pismo) u podržanim formatima (PDF, DOCX). Sistem ograničava maksimalnu veličinu fajla i odbija nepodržane formate. Upload je moguć samo uz aktivnu prijavu na praksu.

### Pregled prijava na praksu  
Kompanija ima uvid u sve prijavljene studente po oglasu, s prikazom osnovnih informacija (ime, prezime, odsjek, godina studija) i mogućnošću pregleda priloženih dokumenata. Onemogućen je pristup prijavama na tuđe oglase.

### Uređivanje oglasa  
Kompanija može izmijeniti podatke postojećeg oglasa (naziv, opis, trajanje, broj mjesta, uslovi). Izmjene su odmah vidljive studentima, a sistem onemogućava uređivanje od strane drugih kompanija ili neprijavljenih korisnika.

### Pregled profila kompanije  
Student može otvoriti profil kompanije direktno sa stranice oglasa i pregledati naziv, opis, lokaciju i kontakt informacije. Neaktivne kompanije nisu vidljive, a pregled zahtijeva prijavu.

### Favoriziranje oglasa  
Student može dodati oglas u favorite ili ga ukloniti jednim klikom. Lista favorita prikazana je na dashboardu i zadržava se između sesija. Sistem onemogućava dupliciranje i favoriziranje bez prijave.

### Upravljanje rokovima prijave  
Kompanija može postaviti ili izmijeniti rok prijave za oglas. Sistem automatski zatvara prijave po isteku roka, prikazuje rok prijave studentima i ne dopušta unos datuma u prošlosti.

### Oznaka „Novo" na oglasima  
Novoobjavljeni oglasi nose vidljivu oznaku „Novo" u listi oglasa. Oznaka se automatski uklanja nakon definisanog vremenskog perioda i prikazana je konzistentno na svim prikazima oglasa.

---

## Glavni problemi i blokeri  

- Validacija upload-a dokumentacije zahtijevala je dodatnu provjeru podržanih formata i ograničenja veličine fajla radi sigurnosti i performansi.  
- End-to-end testiranje kompletnog toka prijave (pregled oglasa → favoriziranje → prijava → upload dokumentacije) tražilo je koordinaciju između frontend i backend članova tima.  

---

## Ključne odluke donesene u sprintu  

- Funkcionalnosti prijave na praksu i upload-a dokumentacije preuzete su iz Sprinta 9 kako bi studentima bio dostupan kompletan tok prijave unutar jednog sprinta, bez privremenih rješenja.  
- Funkcionalnosti oglasa i prijava grupisane su u isti sprint radi lakšeg end-to-end testiranja i smanjenja potrebe za naknadnim izmjenama korisničkog interfejsa.  

---

## Povratna informacija Product Ownera  

Product Owner je zadovoljan napretkom. Implementiran je kompletan tok prijave studenta na praksu, što predstavlja ključni isporučeni vrijednost ovog sprinta. Nije bilo dodatnih zahtjeva niti prijedloga za izmjene.

---

## Zaključak za naredni sprint  

Sprint 8 je uspješno realizovan sa svim planiranim funkcionalnostima i dodatnim stavkama preuzetim iz Sprinta 9. Sistem sada podržava kompletan korisnički tok od pregleda oglasa do prijave sa dokumentacijom, uz upravljanje favoritima i rokovima prijave.  

Fokus narednog sprinta biće napredne funkcionalnosti sistema: upravljanje statusima prijava, komunikacija između kompanije i studenta, te dodatna unapređenja koordinatorskog pregleda i administracije.
