# Initial Release Plan

Ovaj dokument definiše plan inicijalne isporuke sistema za upravljanje studentskim praksama.

Cilj plana je prikazati:
- planirane inkremente (release cjeline)
- raspored funkcionalnosti
- zavisnosti između modula
- identifikovane rizike
- okvirnu realizaciju kroz sprintove

Razvoj sistema organizovan je iterativno kroz sprintove, pri čemu svaki inkrement predstavlja logički zaokruženu funkcionalnu cjelinu koja donosi mjerljivu poslovnu vrijednost.

Planirana su tri release-a:
- **Release 1 – Objava i pregled oglasa**
- **Release 2 – Prijava na praksu i upravljanje selekcijom i statusima**
- **Release 3 – Realizacija i praćenje prakse, analitika, automatizacija i napredne funkcionalnosti**


---

# RELEASE 1

## Naziv
Objava i pregled oglasa 

## Cilj
Omogućiti kompanijama kreiranje oglasa i studentima prijavu na oglase.

## Glavne funkcionalnosti

- **Registracija korisnika** – omogućava studentima, kompanijama i koordinatorima kreiranje korisničkog računa unosom osnovnih podataka.  
- **Login korisnika** – omogućava registrovanim korisnicima pristup sistemu putem email-a i lozinke.  
- **Odobravanje računa (kompanija, koordinator)** – omogućava administratoru pregled i odobravanje novoregistrovanih korisnika prije aktivacije naloga.  
- **Odobravanje računa (student)** - omogućava koordinatoru da pregelda i odobri račun novoregistrovanih studenata prije aktivacije naloga
- **Kreiranje oglasa** – omogućava kompanijama objavu oglasa za praksu sa opisom, zahtjevima i rokom prijave.  
- **Pregled oglasa** – omogućava studentima pregled liste dostupnih oglasa za praksu.  
- **Pregled detalja oglasa** – omogućava prikaz svih informacija o pojedinačnom oglasu.  
- **Administratorski pristup** – omogućava administratoru upravljanje korisničkim računima i odobravanje registracija.  
- **Navigacija** – omogućava korisnicima jednostavno kretanje kroz sistem.  
- **Landing page** – omogućava prikaz osnovnih informacija o sistemu i pristup registraciji i prijavi.  
- **Verifikacija email adrese** – omogućava potvrdu identiteta korisnika putem verifikacionog linka poslanog na email adresu.  
- **Obnavljanje lozinke** – omogućava korisnicima resetovanje lozinke putem email linka u slučaju zaboravljene lozinke.
- **Tamni režim rada** – omogućava promjenu vizuelne teme sistema.

### Tehnička podrška
- Dizajn i implementacija baze podataka  

## Zavisnosti
- Email servis
- Stabilna baza podataka  
- Role-based autorizacija  

## Rizici
- Problemi sa validacijom podataka  
- Neispravan workflow prijave  
- Sigurnosni propusti  

## Sprintovi
- Sprint 5  
- Sprint 6  
- Sprint 7  


---

# RELEASE 2

## Naziv
Prijava na praksu i upravljanje statusima i selekcijom  

## Cilj
Omogućiti kompaniji i koordinatoru upravljanje procesom selekcije kandidata.

## Glavne funkcionalnosti

- **Prijava na praksu** – omogućava studentima slanje prijave na odabrani oglas.  
- **Upload dokumentacije** – omogućava studentima dodavanje potrebnih dokumenata (CV, motivaciono pismo) prilikom prijave.  
- **Pregled prijava (kompanija)** – omogućava kompanijama uvid u sve pristigle prijave za njihove oglase.  
- **Ograničenje broja prijava po studentu** – omogućava fakultetu definisanje maksimalnog broja aktivnih prijava po studentu
- **Selekcija kandidata** – omogućava pregled i izbor prijavljenih kandidata za praksu.  
- **Upravljanje statusom prijave** – omogućava kompaniji i koordinatoru promjenu statusa prijave (npr. na čekanju, u selekciji, odobrena, odbijena), kao i studentu potvrdu ili povlačenje prijave.
- **Student dashboard** – omogućava studentu centralizovani pregled svih prijava na prakse, uključujući trenutni status svake prijave.
- **Zatvaranje oglasa** – omogućava kompaniji zatvaranje oglasa nakon završetka prijava.  
- **Pregled zatvorenih oglasa** – omogućava uvid u zatvorene oglase oglase.
- **Oznaka “Novo”** – označava nedavno objavljene oglase.
- **Favoriziranje oglasa** – omogućava studentima označavanje omiljenih oglasa.
- **Arhiviranje oglasa** – omogućava dugoročno čuvanje neaktivnih oglasa.
- **Audit log** – omogućava praćenje aktivnosti korisnika u sistemu.  

## Zavisnosti
- Funkcionalan proces registracije (Release 1)

## Rizici
- Kompleksnost statusa  
- Nekonzistentnost podataka  
- Edge case scenariji  

## Sprintovi
- Sprint 8  
- Sprint 9  

---

# RELEASE 3

## Naziv
Realizacija i praćenje prakse, analitika, automatizacija i napredne funkcionalnosti  

## Cilj
Omogućiti praćenje realizacije prakse nakon prihvatanja, te dodati napredne funkcionalnosti i administrativne mogućnosti.


## Glavne funkcionalnosti

- **Notifikacije o statusu prijave** – omogućava obavještavanje studenta o promjeni statusa prijave.
- **Generisanje ugovora** – omogućava automatsko kreiranje ugovora za praksu.  
- **Preuzimanje ugovora** – omogućava korisnicima preuzimanje generisanih dokumenata.  
- **Evidencija aktivnosti** – omogućava bilježenje aktivnosti tokom prakse.  
- **Praćenje prisustva** – omogućava evidenciju dolazaka studenta.  
- **Evaluacija studenta** – omogućava kompaniji ocjenjivanje studenta.  
- **Evaluacija kompanije** – omogućava studentu ocjenjivanje kompanije.  
- **Odustajanje od prakse** – omogućava prekid prakse od strane učesnika.  
- **Automatsko završavanje prakse** – omogućava sistemu da automatski zatvori praksu nakon isteka.
- **Izvještaji** – omogućavaju generisanje izvještaja o završetku prakse.
- **Statistika prijava** – omogućava analizu prijava po oglasima i korisnicima.  
- **Napredna pretraga i filtriranje** – omogućava precizno pretraživanje oglasa.  
- **Podešavanje tipova notifikacija** – omogućava korisnicima kontrolu nad obavijestima.  

## Zavisnosti
- Stabilan statusni sistem (Release 2)
- Stabilan produkcijski sistem  

## Rizici
- Automatizovani procesi  
- Generisanje dokumenata  
- Integritet podataka
- Performanse baze  
- Skalabilnost  
- Kompleksnost izvještaja

## Sprintovi 
- Sprint 10  







