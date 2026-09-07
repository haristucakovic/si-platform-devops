# Decision Log 

## Sprint 6

### DL-S6-01
- **Datum:** 05.05.2026
- **Naziv odluke:** Dodavanje atributa `odsjek` u shemu baze podataka
- **Opis problema:** Tokom implementacije registracije utvrđeno je da atribut `odsjek` nije bio uključen u inicijalnu shemu baze, iako je neophodan za studente i koordinatore kao relevantan akademski podatak.
- **Razmatrane opcije:**
  - Opcija A: Pohraniti odsjek kao slobodan tekstualni unos
  - Opcija B: Dodati atribut `odsjek` kao strukturirano polje u Sequelize model korisnika
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Strukturirano polje omogućava dosljednost podataka i lakše filtriranje i pretraživanje po odsjeku u narednim sprintovima.
- **Posljedice odluke:** Atribut `odsjek` dodan je u Sequelize model korisnika. Forme za registraciju studenta i koordinatora moraju uključivati ovo polje pri implementaciji u sprintu 6.
- **Status:** Aktivna

---
 
### DL-S6-02
- **Datum:** 05.05.2026
- **Naziv odluke:** Definisanje toka aktivacije korisničkog računa (registracija → verifikacija emaila → odobrenje računa)
- **Opis problema:** Trebalo je jasno definisati redoslijed koraka kroz koje korisnik prolazi od registracije do dobijanja pristupa sistemu, te šta se prikazuje korisniku u svakoj fazi tog procesa.
- **Razmatrane opcije:**
  - Opcija A: Korisnik dobija pristup odmah nakon registracije
  - Opcija B: Dvostepeni proces - verifikacija emaila, pa zatim odobrenje računa od strane administratora/koordinatora; pristup se daje tek po završetku oba koraka
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Verifikacija emaila je preduvjet za odobravanje računa - koordinator ili administrator ne mogu odobriti račun čiji vlasnik nije potvrdio da ima pristup unesenoj email adresi. Tek nakon verifikacije emaila zahtjev postaje vidljiv koordinatoru/administratoru za odobravanje i dodjelu role.
- **Posljedice odluke:** Tok aktivacije računa je sljedeći: (1) korisnik popunjava formu za registraciju, (2) sistem šalje verifikacioni email - ako korisnik pokuša pristupiti računu bez verifikacije preusmjerava se na stranicu "Verifikacija na čekanju", (3) korisnik verificira email - status prelazi u *email verificiran, račun na čekanju odobrenja*, (4) administrator/koordinator odobrava ili odbija račun, (5) korisnik dobija obavještenje i status prelazi u *aktivan*. JWT token se ne izdaje dok račun nije aktivan. Korisnik koji čeka odobrenje ima status "Čekamo da vas admin/koordinator odobri" i nema pristup nijednoj zaštićenoj ruti.
- **Status:** Aktivna

---

### DL-S6-03
- **Datum:** 03.05.2026
- **Naziv odluke:** Dodavanje upravljanja fakultetima u admin panel
- **Opis problema:** Tabela fakulteta postojala je u bazi podataka, međutim nije bila dostupna kroz admin panel, što je onemogućavalo administratorima pregled i upravljanje fakultetima direktno kroz aplikaciju.
- **Razmatrane opcije:**
  - Opcija A: Dodati stranicu za upravljanje fakultetima u admin panel s mogućnošću dodavanja, uređivanja i brisanja fakulteta
- **Odabrana opcija:** Opcija A
- **Razlog izbora:** Postojeća tabela fakulteta u bazi nije bila iskorištena kroz UI. Dodavanjem ove stranice u admin panel administrator dobija direktan uvid i kontrolu nad listom fakulteta u sistemu bez potrebe za direktnim pristupom bazi podataka.
- **Posljedice odluke:** Admin panel proširen je novom stranicom "Fakulteti" koja prikazuje listu svih fakulteta u sistemu (naziv, email, adresa) te omogućava dodavanje novih fakulteta i uređivanje ili brisanje postojećih. Podaci se učitavaju iz postojeće tabele u bazi podataka.
- **Status:** Aktivna

---

