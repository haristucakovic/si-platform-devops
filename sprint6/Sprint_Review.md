# Sprint Review Summary

## Sprint broj
Sprint 6

## Planirani sprint goal
Implementacija autentifikacije i upravljanja korisničkim računima: registracija svih korisničkih rola, prijava s preusmjeravanjem prema roli, verifikacija email adrese, obnavljanje lozinke i sistem odobravanja korisničkih računa od strane administratora i koordinatora.

## Šta je završeno
- SB-01 - Registracija studenta
- SB-02  Registracija koordinatora fakulteta
- SB-03 - Registracija kompanije
- SB-04 - Prijava studenata
- SB-05 - Prijava koordinatora
- SB-06 - Prijava kompanija
- SB-28 - Obnavljanje lozinke
- SB-32 - Verifikacija email adrese
- SB-58 - Odobravanje korisničkog računa

## Šta nije završeno
Sve planirane stavke su završene. Nema prenesenih stavki u naredni sprint.

## Demonstrirane funkcionalnosti ili artefakti
- Registracija korisnika svih rola (student, koordinator, kompanija) sa validacijom obaveznih polja i provjером duplikata
- Jedinstvena login stranica s preusmjeravanjem na odgovarajući dashboard prema roli korisnika
- Verifikacija email adrese putem linka koji se šalje nakon registracije; korisnik ne može pristupiti sistemu dok email nije verifikovan
- Obnavljanje lozinke putem email linka s vremenski ograničenim tokenom
- Workflow odobravanja korisničkih računa: admin odobrava koordinatore i kompanije, koordinator odobrava studente s istog fakulteta; korisnik prima email obavijest o ishodu
- JWT autentifikacija i RBAC middleware koji osiguravaju pristup prema roli
- Privremeni (dummy) dashboardi za koordinatora, studenta i kompaniju kao placeholderi za Sprint 7

## Glavni problemi i blokeri
- Povremeni problemi s SMTP konfiguracijom i isporukom verifikacionih emailova tokom razvoja
- Verifikacija email adrese funkcionisala ispravno lokalno, ali ne na deployovanoj verziji (Render)
- Merge konflikti pri integraciji auth i admin funkcionalnosti koje su razvijali različiti članovi tima

## Ključne odluke donesene u sprintu
- Tok registracije: korisnik se registruje → verifikuje email → čeka odobrenje → tek tada može se prijaviti

## Povratna informacija Product Ownera
Product Owner je prihvatio sve demonstrirane funkcionalnosti. Ukazano je na organizacijski propust - AI Usage Log i Decision Log nalaze se u root direktoriju repozitorija umjesto u folderu odgovarajućeg sprinta. Tim je to evidentirao i obavezao se ispraviti organizaciju fajlova od narednog sprinta.

## Zaključak za naredni sprint
Tim ulazi u Sprint 7 sa kompletnom autentifikacijskom infrastrukturom. Fokus narednog sprinta je razvoj dashboarda i funkcionalnosti za studente, koordinatore i kompanije: uređivanje profila, kreiranje i pregled oglasa, navigacija i upravljanje korisničkim računima.