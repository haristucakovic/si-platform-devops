# Sprint Retrospective Summary

## Sprint broj
Sprint 7

## Šta je išlo dobro

- Sve planirane funkcionalnosti za Sprint 7 su uspješno implementirane
- Implementirani su korisnički profili za studente i kompanije
- Uspješno je implementirana role-based navigacija za sve korisničke role
- Implementiran je koordinatorski dashboard sa pregledom prijava i studenata
- Kompanije sada mogu kreirati i objavljivati oglase za praksu
- Studentima je omogućen pregled dostupnih oglasa za praksu
- Implementirane su funkcionalnosti deaktivacije i brisanja korisničkog računa
- Tim je uspješno povezao frontend i backend dio funkcionalnosti vezanih za profile, oglase i dashboarde
- Dodatne funkcionalnosti pregleda detalja oglasa, pretrage i filtriranja uspješno su završene unutar sprinta

## Šta nije išlo dobro

- Integracija dashboard funkcionalnosti između različitih korisničkih rola zahtijevala je više vremena nego što je planirano
- Navigacija i usklađivanje UI komponenti između dashboarda uzrokovali su dodatne izmjene tokom implementacije
- Dio funkcionalnosti je završen kasnije zbog dodatnih izmjena vezanih za autorizaciju i prikaz podataka po rolama
- Testiranje povezanosti frontend i backend dijela trajalo je duže zbog većeg broja međusobno zavisnih funkcionalnosti

## Šta treba promijeniti

- Potrebno je ranije planirati zavisnosti između funkcionalnosti oglasa, dashboarda i korisničkih profila
- Više vremena treba ostaviti za integraciono testiranje između frontend i backend dijela sistema
- Dashboard i navigaciju treba ranije uskladiti između svih korisničkih rola kako bi se izbjegle naknadne izmjene UI-a
- Funkcionalnosti koje čine isti korisnički tok treba planirati unutar istog sprinta

## Koje konkretne akcije tim uvodi u narednom sprintu

- Tim će prije početka implementacije definisati kompletan korisnički tok za funkcionalnosti oglasa i prijava
- Planirane stavke će se pokušati završiti ranije kako bi ostalo dovoljno vremena za zajedničko testiranje i ispravke
- Prije merge-a funkcionalnosti frontend i backend članovi tima će zajedno provjeriti integraciju i autorizaciju po rolama
- Posebna pažnja će se posvetiti validaciji prijava, upload-u dokumentacije i dashboard prikazima