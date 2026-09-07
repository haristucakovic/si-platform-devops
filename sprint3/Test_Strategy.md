# Test Strategy
## Sistem za upravljanje studentskim praksama


## 1. Cilj testiranja

Cilj testiranja sistema za upravljanje studentskim praksama je osigurati da aplikacija funkcioniše pouzdano, sigurno i u skladu sa definisanim funkcionalnim i nefunkcionalnim zahtjevima. Testiranjem omogućavamo rano otkrivanje greške, te minimizaciju rizika prije produkcije. 

Pored funkcionalne ispravnosti, cilj testiranja je i validacija integracije između različitih komponenti sistema (arhitecture_overview), kako bi se osigurala konzistentnost podataka kroz cijeli sistem. Također, testiranje ima za cilj procjenu performansi, sigurnosti i upotrebljivosti sistema, kako bi se obezbijedilo kvalitetno i stabilno korisničko iskustvo za sve tipove korisnika (studenti, koordinatori i  kompanije) uz osiguranu tačnost podataka, te pouzdanu prijavu i praćenje praksi.

Konačno, cilj testiranja je pravovremeno otkrivanje i otklanjanje grešaka, kao i verifikacija da sistem ispunjava definisane acceptance kriterije i poslovne potrebe.

---

## 2. Nivoi testiranja

Testna strategija je organizovana po nivoima testiranja, gdje svaki nivo pokriva određeni aspekt sistema. U okviru strategije definisani su:
 - unit, 
 - integraciono, 
 - sistemsko i 
 - prihvatno testiranje. 
 
 Za svaki nivo testiranja definisano je šta se testira, koji tipovi testova se primjenjuju, kao i ko je odgovoran za njihovu realizaciju. Također je uspostavljena veza između definisanih acceptance kriterija i odgovarajućih nivoa testiranja, pri čemu su acceptance kriteriji raspoređeni po nivoima čime se osigurava efikasna pokrivenost funkcionalnih i nefunkcionalnih zahtjeva sistema.

Testiranje će se provoditi iterativno kroz razvojne sprintove, pri čemu će se unit i integraciono testiranje izvršavati tokom implementacije, dok će se sistemsko i prihvatno testiranje provoditi nakon implementacije funkcionalnosti.

### UNIT Testiranje

Unit testiranje se koristi za testiranje najmanjih logičkih jedinica sistema, prvenstveno backend poslovne logike i validacija koje su definisane kroz acceptance kriterije. Fokus je na validaciji unosa podataka, pravilima sistema i ograničenjima.

Na ovom nivou testira se:
- validacija registracije korisnika (ime, email format, lozinka, indeks, odsjek) 
- provjera jedinstvenosti email adrese u sistemu 
- validacija obaveznih polja u svim formama 
- logika verifikacije email adrese i isteka tokena 
- autentikacija korisnika i provjera kredencijala 
- autorizacija pristupa po rolama (student, kompanija, koordinator, admin) 
- logika ograničenja (npr. zabrana duple prijave, limit prijava po studentu) 
- validacija datuma i rokova (rok prijave u budućnosti) 
- validacija upload dokumenata (PDF format CV-a i motivacionog pisma) 
- logika resetovanja lozinke i generisanja tokena 

Testiranje se izvodi automatski korištenjem odgovarajućih alata, a odgovorna osoba je developer.

### Integraciono testiranje

Integraciono testiranje provjerava interakciju između modula sistema, uključujući frontend, backend, bazu podataka i vanjske servise.

Na ovom nivou testira se:
- komunikacija frontend backend pri registraciji i login-u 
- upis i čitanje korisnika iz baze podataka 
- rad sistema prijava na praksu (kreiranje, spremanje i dohvat prijava) 
- povezivanje oglasa sa kompanijama i studentima 
- integracija email servisa (verifikacija, reset lozinke, notifikacije) 
- upload i preuzimanje dokumenata (CV, ugovori)
- historija aktivnosti svih kritičnih akcija
- upravljanje statusima prijave 
- slanje i prikaz notifikacija korisnicima 
- filtriranje i pretraga oglasa kroz API 

Testiranje se izvodi kombinacijom automatskih i ručnih testova, a odgovorna osoba je QA tim uz podršku developera.

### Sistemsko testiranje

Sistemsko testiranje obuhvata testiranje kompletnog sistema kao cjeline kroz realne korisničke scenarije (end-to-end).

Na ovom nivou testira se:
- kompletan proces registracije, verifikacije i prijave korisnika 
- login i pristup sistemu po korisničkim ulogama 
- pregled, filtriranje i pretraga oglasa za praksu 
- proces prijave studenta na praksu od početka do kraja 
- selekcija kandidata od strane kompanije 
- odobravanje i odbijanje prakse od strane koordinatora 
- kompletan workflow statusa prijave kroz sistem 
- generisanje, digitalno potpisivanje i preuzimanje ugovora 
- evidencija aktivnosti tokom prakse i završetak prakse 
- evaluacija studenta i kompanije nakon završetka prakse 
- prikaz dashboarda, profila i navigacije po ulozi 
- notifikacije o svim promjenama statusa 

Testiranje se vrši ručno i automatski (E2E testovi), a odgovorna osoba je QA tim.

### UAT testiranje

Prihvatno testiranje se provodi kako bi se provjerilo da li sistem u potpunosti zadovoljava poslovne zahtjeve krajnjih korisnika.

Na ovom nivou testira se:
- da li je proces registracije jasan i jednostavan za studente i kompanije 
- da li korisnici mogu bez poteškoća da se prijave i koriste sistem 
- da li student može lako pronaći i prijaviti se na praksu 
- da li workflow odobravanja prakse odgovara realnom procesu fakulteta i kompanije
- da li su notifikacije korisne i pravovremene 
- da li je korisničko iskustvo (dashboard, navigacija, profili) intuitivno 
- da li sistem u praksi podržava stvarni proces upravljanja studentskim praksama 

Testiranje se izvodi ručno od strane stakeholdera i krajnjih korisnika.

---

## 3. Šta se testira u kojem nivou

Tabela povezuje ključne funkcionalnosti sistema i nefunkcionalne zahtjeve sa nivoima testiranja. Fokus je na tome šta se provjerava na kom nivou, a ne na konkretnim test case-ovima.

---

### Funkcionalni zahtjevi

| Funkcionalnost / zahtjev | Unit | Integraciono | Sistemsko | UI | Sigurnosno | Performansno |
|--------------------------|------|--------------|-----------|----|------------|--------------|
| Login, registracija i sesije (US-1–US-6, US-34, US-40) | Validacija emaila i lozinke; generisanje tokena; timeout logika | Auth API + baza + email servis | Kompletan tok registracije, verifikacije i login-a po rolama | Forma, poruke greške, stanje sesije | Zaštita ruta; enkripcija; blokada neovlaštenog pristupa; auto logout (NFR-02, NFR-03) | Vrijeme login-a u dozvoljenim granicama |
| Upravljanje profilom | Validacija izmjene podataka | API za izmjene + baza | Korisnik mijenja vlastite podatke bez prekida sesije | Validacije forme i potvrde | Korisnik može mijenjati samo svoj profil (NFR-10, NFR-11) | — |
| Upravljanje oglasima | Validacija obaveznih polja | CRUD oglasa + relacije | Kreiranje, zatvaranje, arhiviranje oglasa | Prikaz oznake "Novo", status oglasa | Samo ovlaštene role mogu uređivati | Brzina učitavanja oglasa (NFR-24) |
| Pregled i filtriranje praksi | Logika filtriranja | API filtriranje + baza | Prikaz aktivnih oglasa i detalja | Lista, detalji, prazno stanje, loader | Zabrana pristupa zatvorenim oglasima | Učitavanje i filtriranje < 3s (NFR-24) |
| Prijava na praksu | Zabrana duple prijave; validacija roka | Kreiranje prijave + relacije | Kompletan tok prijave i promjene statusa | Status prijave u realnom vremenu (NFR-07) | Student vidi samo svoje prijave (NFR-11) | Pregled i prijava < 4s (NFR-01) |
| Evaluacije i izvještaji | Validacija forme | Spremanje evaluacije + generisanje izvještaja | Kompletan tok završetka prakse | Prikaz statusa evaluacije | Pristup samo ovlaštenim korisnicima | — |
| Notifikacije (email + in-app) | Logika generisanja notifikacije | Integracija email servisa (NFR-18) | Slanje i prikaz notifikacija u realnom vremenu (NFR-22) | UI prikaz notifikacija | Provjera prava pristupa | Vrijeme isporuke notifikacije |

---

### Nefunkcionalni zahtjevi (NFR)

| NFR ID | Unit | Integraciono | Sistemsko | UI | Sigurnosno | Performansno |
|--------|------|--------------|-----------|----|------------|--------------|
| NFR-01 (Performanse – prijava <4s) | — | API response time | End-to-end mjerenje vremena | — | — | Load test |
| NFR-02 (Auto logout 15 min) | Timeout logika | Sesija + token | Test neaktivnosti | Obavijest o isteku sesije | Sprječavanje neovlaštenog pristupa | — |
| NFR-03 (Autentifikacija i zaštita podataka) | Enkripcija podataka | Auth + DB | Role-based pristup | — | Penetracijsko testiranje | — |
| NFR-04, NFR-23 (Oporavak i integritet) | Transakcije | Backup + rollback | Simulacija pada sistema | — | — | — |
| NFR-05 (Autosave) | Logika autosave | API spremanje | Simulacija prekida rada | Vizuelna potvrda spremanja | — | — |
| NFR-06, NFR-21 (Upotrebljivost i konzistentnost) | — | — | — | User testiranje; konzistentnost UI | — | — |
| NFR-08, NFR-09 (Skalabilnost) | — | Paralelni API zahtjevi | Simulacija više korisnika | — | — | Load i stress test |
| NFR-10, NFR-11 (Privatnost) | Provjera autorizacije | API zaštita podataka | Pokušaj neovlaštenog pristupa | — | Test prava pristupa | — |
| NFR-12, NFR-13 (Održivost) | Jedinični test modula | Modularna arhitektura | Code review | — | — | — |
| NFR-14 (Dostupnost 95%) | — | Monitoring | Testiranje pristupa u intervalima | — | — | Praćenje uptime |
| NFR-15, NFR-16, NFR-17 (Prenosivost) | — | — | Test u različitim okruženjima | Responsivnost i browser test | — | — |
| NFR-18, NFR-19 (Kompatibilnost) | — | API i email integracija | End-to-end integracija | — | — | — |
| NFR-20 (Lokalizacija) | Provjera prevoda | — | Sistem više jezika | UI promjena jezika | — | — |
| NFR-22 (Real-time notifikacije) | Logika događaja | Websocket / servis | Real-time prikaz | UI notifikacija | — | — |
| NFR-24 (Filtriranje <3s) | — | API optimizacija | End-to-end mjerenje | — | — | Test vremena filtriranja |

---

## 4. Veza sa acceptance kriterijima

Ova sekcija prikazuje kako se acceptance kriteriji mapiraju na nivoe testiranja i koje artefakte koristimo kao dokaz ispunjenja zahtjeva.  
Ne definišu se konkretni test case-ovi, već se prikazuje veza između zahtjeva, nivoa testiranja i dokaza ispunjenja.

---

### Autentifikacija i registracija

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-1, US-2, US-3, US-38, US-58 | Validna registracija; jedinstven email; verifikacija emaila; zabrana prijave prije odobrenja; dodjela role tek nakon odobrenja | Unit, Integraciono, Sistemsko, Sigurnosno, Prihvatno | CI rezultat validacije forme; DB provjera jedinstvenosti; log email servisa; audit log odobravanja; demo kompletnog toka |
| US-4, US-5, US-6 | Ispravna prijava uz validne kredencijale; zabrana pristupa neodobrenim i neverifikovanim računima | Unit, Integraciono, Sistemsko, Sigurnosno, UI | API log autentifikacije; test autorizacije po rolama; demo dashboard redirekcije |
| US-34 | Reset lozinke putem email linka sa istekom; sigurnosna poruka bez otkrivanja postojanja emaila | Unit, Integraciono, Sigurnosno, Sistemsko | Log generisanja tokena; test isteka linka; email servis evidencija |
| US-40 | Deaktivacija naloga; zabrana login-a; mogućnost reaktivacije od strane admina | Unit, Integraciono, Sistemsko, Sigurnosno | DB status korisnika; audit log akcije; demo blokade pristupa |

---

### Navigacija i pristup po rolama

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-9, US-8, US-42 | Prikaz role-specifične navigacije; zabrana pristupa bez odgovarajuće role | Unit, Integraciono, Sistemsko, UI, Sigurnosno | Test autorizacije middleware-a; screenshot UI-a; demo role-based pristupa |
| US-41, US-46 | Landing page javno dostupna; bez prikaza zaštićenog sadržaja; dostupna privacy policy | Sistemsko, UI, Prihvatno | UI verifikacija; sigurnosni test pristupa |

---

### Upravljanje oglasima

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-10, US-32 | Kreiranje i uređivanje oglasa uz validaciju obaveznih polja; zabrana uređivanja zatvorenog oglasa | Unit, Integraciono, Sistemsko, UI | API zapis kreiranja/izmjene; DB zapis; demo toka |
| US-31, US-49 | Zatvaranje i arhiviranje oglasa; zabrana prijave na zatvoren oglas | Unit, Integraciono, Sistemsko | Status oglasa u bazi; test blokade prijave |
| US-52 | Definisanje roka; automatsko zatvaranje nakon isteka | Unit, Integraciono, Sistemsko | Test vremenske logike; scheduler log; status promjene |
| US-56 | Oznaka "Novo" u definisanom periodu | Unit, UI, Sistemsko | Test vremenskog praga; UI verifikacija oznake |

---

### Pregled, filtriranje i pretraga

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-11, US-12, US-36, US-39 | Prikaz aktivnih oglasa; detalji; filtriranje; pretraga; poruka bez rezultata | Unit, Integraciono, Sistemsko, UI | API response validacija; test filtriranja; demo |
| US-43 | Pregled profila kompanije; zabrana pregleda neodobrene kompanije | Unit, Integraciono, Sistemsko | DB status kompanije; autorizacioni test |
| US-57 | Pregled zatvorenih oglasa uz jasnu oznaku; zabrana prijave | Sistemsko, UI | UI validacija; test blokade prijave |

---

### Prijava na praksu i statusi

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-13, US-53 | Prijava na praksu; zabrana duple prijave; limit aktivnih prijava | Unit, Integraciono, Sistemsko | DB constraint; test limit logike; poruka o grešci |
| US-15, US-16 | Pregled prijava; selekcija kandidata; promjena statusa | Integraciono, Sistemsko | API log status promjene; DB zapis |
| US-17, US-18 | Odobravanje/odbijanje od strane koordinatora | Integraciono, Sistemsko, Prihvatno | Audit log; notifikacija studentu; demo toka |
| US-19 | Potvrda studenta i obavještavanje ostalih strana | Integraciono, Sistemsko | Log notifikacije; promjena statusa |
| US-33 | Odustajanje od prakse; zabrana odustajanja završene prakse | Unit, Integraciono, Sistemsko | DB status validacija; audit zapis |
| US-37, US-55 | Slanje i prikaz notifikacija; bez duplikata; korisničke postavke | Unit, Integraciono, Sistemsko | Log notifikacija; test deduplikacije |

---

### Dokumenti i ugovori

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-14 | Upload PDF dokumenata; zabrana drugih formata | Unit, Integraciono, Sigurnosno | MIME validacija; storage zapis |
| US-22, US-23 | Generisanje i preuzimanje ugovora | Integraciono, Sistemsko | Generisan PDF; log preuzimanja |
| US-24, US-25 | Evidencija aktivnosti i prisustva | Integraciono, Sistemsko | DB zapisi aktivnosti; demo pregleda |
| US-26, US-27 | Evaluacija studenta i kompanije | Unit, Integraciono, Sistemsko | Formular zapis; UI prikaz |
| US-28 | Generisanje izvještaja | Integraciono, Sistemsko | Generisan dokument; demo |

---

### Statistika i automatizacije

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-50 | Statistika prijava po oglasu; filtriranje | Integraciono, Sistemsko | API agregacijski upit; UI graf |
| US-54 | Automatsko završavanje prakse po isteku trajanja | Unit, Integraciono, Sistemsko | Scheduler log; status promjene |

---

### Baza i sigurnost

| Referenca | Ključni acceptance kriteriji | Nivoi verifikacije | Dokaz ispunjenja |
|------------|-----------------------------|-------------------|------------------|
| US-20, US-21 | Dizajn i implementacija baze; relacije između entiteta | Unit, Integraciono | ERD dokument; DB migracije; test CRUD operacija |
| US-51 | Audit log svih ključnih akcija; pristup samo adminu | Unit, Integraciono, Sistemsko, Sigurnosno | Log zapisi; test autorizacije |

---


## 5. Načini evidencije rezultata testiranja

Rezultati testiranja će se sistematski evidentirati kako bi se omogućilo praćenje kvaliteta sistema, identifikacija grešaka i verifikacija ispunjenosti zahtjeva.

Za evidenciju rezultata testiranja koristit će se:
 - automatski izvještajti testiranja (automatizovane testove),
 - test case dokumenti,
 - sistem za praćenje grešaka ili evidenciju bugova (Jira)

Za svaki test case evidentiramo sljedeće informacije:
 - ID testa
 - opis testa
 - povezani acceptance kriterij
 - očekivani rezultat
 - stvarni rezultat
 - status testa (PASS / FAIL)
 - datum izvršenja
 - odgovorna osoba
 - napomene/prijavljeni bug

 Na ovaj način omogućava se konzistenstnost između zahtjeva, testnih slučajeva i rezultata testiranja, kao i efikasno upravljanje kvalitetom sistema.

 ---

 ## 6. Glavni rizici kvaliteta

U nastavku su definisani rizici koji mogu uticati na kvalitet, potpunost i pouzdanost samog procesa testiranja, te samim tim i na sposobnost otkrivanja grešaka u sistemu.

1. Nedovoljna pokrivenost testova

- Opis: Neki dijelovi sistema mogu ostati netestirani, što povećava rizik od neotkrivenih grešaka.
- Mitigacija: 

2. Neadekvatno definisani test slučajevi

- Opis: Testovi ne pokrivaju realne korisničke scenarije ili acceptance kriterije.
- Mitigacija: Korištenje user stories i acceptance kriterija pri definisanju testova.
 
3. Ljudske greške u ručnom testiranju

- Opis: Manualno testiranje može dovesti do propuštanja bugova ili nekonzistentnih rezultata.
- Mitigacija: Automatizacija ključnih testova i ponavljanje testnih scenarija.

4. Nedostatak automatizacije testiranja

- Opis: Previše ručnog testiranja povećava vrijeme i smanjuje efikasnost.
- Mitigacija: Korištenje unit i integration automatizovanih testova.

5. Nejasni ili nepotpuni acceptance kriteriji

- Opis: Bez jasnih kriterija testiranje može biti subjektivno i neprecizno.
- Mitigacija: Jasno definisanje acceptance kriterija u user story-ima.

6. Nedovoljna regresiona provjera

- Opis: Promjene u sistemu mogu narušiti već ispravne funkcionalnosti.
- Mitigacija: Redovno izvođenje regresionih testova nakon svake izmjene.

7. Ograničeno testiranje edge case scenarija

- Opis: Ekstremni i neobični scenariji mogu ostati neotkriveni.
- Mitigacija: Dizajn testova koji uključuju negativne i boundary slučajeve.

8. Nedovoljno testiranje integracije sistema

- Opis: Greške u komunikaciji između modula mogu ostati neotkrivene.
- Mitigacija: Integraciono testiranje API-ja i servisa.

9. Ograničeno testiranje performansi

- Opis: Sistem može raditi ispravno u malom obimu, ali padati pod opterećenjem.
- Mitigacija: Load i stress testiranje.

10. Neadekvatno testiranje sigurnosti

- Opis: Mogu postojati neotkrivene ranjivosti u autentifikaciji i pristupu podacima.
- Mitigacija: Sigurnosno i penetracijsko testiranje

---

## 7. Out of scope
Sljedeće stavke nisu predmet testiranja u okviru ove strategije:

- Testiranje infrastrukture fakultetske mreže ili hosting provajdera
- Produkcijski monitoring nakon deploy-a
- Interna implementacija third-party servisa (npr. email servis)
- Hardverska kompatibilnost korisničkih uređaja
- Sigurnosni audit eksternih sistema koji nisu dio aplikacije
- Testiranje vanjskih sistema sa kojima se aplikacija eventualno integriše (osim verifikacije komunikacije putem API-ja)
