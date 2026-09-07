# Sprint broj
Sprint 6

# Sprint cilj
Cilj sprinta je implementacija kompletnog sistema autentifikacije i upravljanja korisnicima. 
To obuhvata cijeli tok od registracije korisnika, verifikacije email adrese, prijave u sistem, 
obnavljanja lozinke, pa sve do odobravanja korisničkog računa od strane administratora — 
i to za sve tri korisničke role: student, koordinator i kompanija.

# Ključne stavke koje tim želi završiti

## Registracija
- Registracija studenta — unos ličnih podataka, odabir fakulteta, godine studija i broja indeksa
- Registracija koordinatora fakulteta — unos podataka i odabir fakulteta kojim koordinira
- Registracija kompanije — unos naziva, adrese, telefona i opisa poslovanja

## Autentifikacija
- Prijava studenta — putem email adrese ili korisničkog imena i lozinke
- Prijava koordinatora — isti mehanizam, pristup ruti ograničen na COORDINATOR rolu
- Prijava kompanije — isti mehanizam, pristup ruti ograničen na COMPANY rolu
- Obnavljanje lozinke — slanje reset linka na email, validacija tokena i postavljanje nove lozinke

## Verifikacija i odobravanje
- Verifikacija email adrese — slanje verifikacionog linka nakon registracije, potvrda putem tokena
- Odobravanje korisničkog računa — administrator ili koordinator odobrava ili odbija zahtjev, 
  korisnik dobiva obavijest putem emaila

## Kvalitet i dokumentacija
- Testirati sve gore navedene funkcionalnosti u skladu s Definition of Done kriterijima 
  (unit testovi, mock testovi, integracijski testovi)
- Ažurirati AI Usage Log s opisom svih korištenja AI alata tokom sprinta
- Ažurirati Decision Log s ključnim tehničkim odlukama donesenima tokom implementacije

# Rizici i zavisnosti
- **Gmail SMTP konfiguracija** — postavljanje Gmail SMTP servera za slanje verifikacionih i 
  reset emailova može uzrokovati kašnjenje ako dođe do problema s App Password postavkama 
  ili Google sigurnosnim pravilima
- **RBAC middleware** — middleware za kontrolu pristupa po rolama mora biti ispravno 
  implementiran i testiran prije nego što se može testirati pristup zaštićenim rutama
- **Zavisnost registracija → verifikacija → odobravanje** — tok odobravanja računa direktno 
  zavisi od ispravno završene registracije i verifikacije emaila; greška u bilo kojoj fazi 
  blokira ostatak toka
- **Sigurnosni aspekti** — JWT potpisivanje, bcrypt hashovanje lozinki, expiry tokena za 
  reset i verifikaciju zahtijevaju pažljivu implementaciju kako bi se izbjegle sigurnosne 
  ranjivosti i osiguralo ispravno ponašanje u edge case-ovima
