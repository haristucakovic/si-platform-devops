# Finalni Product Backlog Status

Ovaj dokument prikazuje završno stanje projekta na osnovu implementiranih funkcionalnosti i realizovanih sprintova. Statusi predstavljaju stvarno stanje sistema nakon završetka razvoja.

## Legenda statusa

* **Done** – stavka je potpuno implementirana i funkcionalna
* **Partially Done** – stavka je djelimično implementirana
* **Not Done** – stavka nije implementirana
* **Deferred / ostavljeno za budući rad** – stavka je planirana, ali nije realizovana u ovoj verziji sistema

| ID | Naziv stavke                             | Tip            | Prioritet | Status | Procjena složenosti | Opis                                                                           |
| -- | ---------------------------------------- | -------------- | --------- | ------ | ------------------- | ------------------------------------------------------------------------------ |
| 1  | Registracija korisnika                   | Feature        | High      | Done   | 3                   | Registracija studenata, kompanija i koordinatora putem email adrese i lozinke. |
| 2  | Prijava korisnika                        | Feature        | High      | Done   | 2                   | Autentifikacija korisnika i pristup sistemu.                                   |
| 3  | Profil studenta                          | Feature        | High      | Done   | 3                   | Upravljanje osnovnim podacima studenta.                                        |
| 4  | Profil kompanije                         | Feature        | High      | Done   | 3                   | Kreiranje i upravljanje profilom kompanije.                                    |
| 5  | Pristup koordinatora i administratora    | Feature        | High      | Done   | 2                   | Role-based pristup sa posebnim privilegijama.                                  |
| 6  | Kreiranje oglasa                         | Feature        | High      | Done   | 5                   | Kreiranje i objava oglasa za praksu.                                           |
| 7  | Pregled oglasa                           | Feature        | High      | Done   | 3                   | Prikaz liste dostupnih praksi.                                                 |
| 8  | Detalji oglasa                           | Feature        | Medium    | Done   | 2                   | Pregled detalja pojedinačne prakse.                                            |
| 9  | Prijava na praksu                        | Feature        | High      | Done   | 3                   | Prijava studenta na praksu.                                                    |
| 10 | Upload dokumentacije                     | Feature        | High      | Done   | 3                   | Upload CV-a i motivacionog pisma.                                              |
| 11 | Pregled prijava                          | Feature        | High      | Done   | 3                   | Kompanija pregledava prijave kandidata.                                        |
| 12 | Selekcija kandidata                      | Feature        | High      | Done   | 3                   | Evidentiranje užeg izbora kandidata.                                           |
| 13 | Odobravanje prakse                       | Feature        | High      | Done   | 2                   | Koordinator odobrava praksu.                                                   |
| 14 | Potvrda studenta                         | Feature        | High      | Done   | 1                   | Student potvrđuje učešće na praksi.                                            |
| 15 | Postavljanje baze podataka               | Technical Task | High      | Done   | 5                   | Dizajn i implementacija baze podataka.                                         |
| 16 | Implementacija autentifikacije           | Technical Task | High      | Done   | 5                   | Sigurna autentifikacija i autorizacija korisnika.                              |
| 17 | Generisanje ugovora                      | Feature        | Medium    | Done   | 5                   | Automatsko generisanje ugovora o praksi.                                       |
| 18 | Preuzimanje ugovora                      | Feature        | Medium    | Done   | 2                   | Preuzimanje digitalnog ugovora.                                                |
| 19 | Evidencija aktivnosti                    | Feature        | Medium    | Done   | 5                   | Evidentiranje aktivnosti tokom prakse.                                         |
| 20 | Praćenje prisustva                       | Feature        | Medium    | Done   | 3                   | Evidencija prisustva studenata.                                                |
| 21 | Evaluacija studenta                      | Feature        | Medium    | Done   | 3                   | Evaluacija rada studenta.                                                      |
| 22 | Evaluacija kompanije                     | Feature        | Medium    | Done   | 2                   | Evaluacija kompanije od strane studenta.                                       |
| 23 | Izvještaji                               | Feature        | Medium    | Done   | 5                   | Generisanje izvještaja o praksi.                                               |
| 24 | Analiza postojećih rješenja              | Research       | Medium    | Done   | 2                   | Analiza postojećih sistema za upravljanje praksama.                            |
| 25 | Dokumentacija sistema                    | Documentation  | Medium    | Done   | 3                   | Dokumentovanje sistema i funkcionalnosti.                                      |
| 26 | Uređivanje oglasa                        | Feature        | Medium    | Done   | 3                   | Izmjena postojećih oglasa.                                                     |
| 27 | Odustajanje od prakse                    | Feature        | Medium    | Done   | 2                   | Student može odustati od prakse.                                               |
| 28 | Obnavljanje lozinke                      | Feature        | High      | Done   | 3                   | Reset lozinke putem email linka.                                               |
| 29 | Student dashboard                        | Feature        | High      | Done   | 3                   | Centralizovan pregled prijava i statusa.                                       |
| 30 | Filtriranje i pretraživanje oglasa       | Feature        | Medium    | Done   | 3                   | Filtriranje i pretraga oglasa.                                                 |
| 31 | Notifikacije                             | Feature        | Medium    | Done   | 5                   | Sistem obavještenja o promjenama statusa.                                      |
| 32 | Verifikacija email adrese                | Feature        | High      | Done   | 3                   | Verifikacija korisničkog emaila.                                               |
| 33 | Deaktivacija/brisanje korisničkog računa | Feature        | Low       | Done   | 3                   | Deaktivacija ili brisanje naloga.                                              |
| 34 | Landing page                             | Feature        | High      | Done   | 3                   | Početna stranica platforme.                                                    |
| 35 | Navigacija                               | Feature        | High      | Done   | 2                   | Navigacija prilagođena korisničkoj roli.                                       |
| 36 | Pregled korisničkog profila              | Feature        | Medium    | Done   | 2                   | Pregled vlastitog profila.                                                     |
| 37 | Privacy Policy & User Terms              | Feature        | Low       | Done   | 2                   | Stranica uslova korištenja i privatnosti.                                      |
| 38 | Tamni režim rada                         | Feature        | Low       | Done   | 2                   | Dark mode podrška.                                                             |
| 39 | Uređivanje korisničkog profila           | Feature        | Medium    | Done   | 2                   | Uređivanje korisničkih podataka.                                               |
| 40 | Arhiviranje oglasa                       | Feature        | Low       | Done   | 2                   | Arhiviranje starih oglasa.                                                     |
| 41 | Pregled statistike prijava               | Feature        | Medium    | Done   | 3                   | Statistički pregled prijava po oglasu.                                         |
| 42 | Historija aktivnosti (Audit Log)         | Feature        | High      | Done   | 5                   | Evidencija svih važnih aktivnosti u sistemu.                                   |
| 43 | Pregled profila kompanije                | Feature        | Medium    | Done   | 2                   | Student može pregledati profil kompanije.                                      |
| 44 | Uređivanje profila kompanije             | Feature        | Medium    | Done   | 2                   | Kompanija može uređivati vlastiti profil.                                      |
| 45 | Zatvaranje oglasa                        | Feature        | Medium    | Done   | 2                   | Ručno zatvaranje oglasa za praksu.                                             |
| 46 | Favoriziranje oglasa                     | Feature        | Low       | Done   | 2                   | Dodavanje oglasa u favorite.                                                   |
| 47 | Upravljanje rokovima prijave             | Feature        | Medium    | Done   | 3                   | Definisanje i upravljanje rokovima prijave.                                    |
| 48 | Ograničenje broja prijava po studentu    | Feature        | Medium    | Done   | 2                   | Ograničenje aktivnih prijava.                                                  |
| 49 | Automatsko završavanje prakse            | Feature        | Medium    | Done   | 3                   | Automatsko označavanje završene prakse.                                        |
| 50 | Podešavanje tipova notifikacija          | Feature        | Low       | Done   | 2                   | Upravljanje preferencama notifikacija.                                         |
| 51 | Oznaka „Novo“ na oglasima                | Feature        | Low       | Done   | 1                   | Označavanje novododanih oglasa.                                                |
| 52 | Pregled zatvorenih oglasa                | Feature        | Low       | Done   | 2                   | Pregled zatvorenih oglasa.                                                     |
| 53 | Odobravanje korisničkog računa           | Feature        | High      | Done   | 3                   | Administrator odobrava nove korisničke račune.                                 |

---

# Sažetak završnog stanja

| Stavka                     | Vrijednost |
| -------------------------- | ---------- |
| Ukupan broj backlog stavki | 53         |
| Završeno                   | 53         |
| Djelimično završeno        | 0          |
| Nezavršeno                 | 0          |
| Odloženo za budući rad     | 0          |

## Zaključak

Sve planirane funkcionalnosti definisane u Product Backlog-u uspješno su implementirane i validirane kroz sprint cikluse razvoja. Sistem omogućava kompletan tok upravljanja studentskim praksama, uključujući registraciju korisnika, upravljanje oglasima, prijave na praksu, odobravanje i praćenje prakse, generisanje ugovora, evaluacije, izvještavanje i administrativne funkcionalnosti.

Na kraju projekta nije ostala nijedna nerealizovana ili djelimično realizovana stavka Product Backlog-a. Sve funkcionalnosti predviđene za završnu verziju sistema uspješno su implementirane i integrisane u jedinstvenu platformu za upravljanje studentskim praksama.
