# AI Usage Log — Sprint 7

## Unos 1 — Implementacija koordinatorskog dashboarda (US-08)

| Polje | Sadržaj |
|---|---|
| **Datum** | 09.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Implementacija kompletnog koordinatorskog dashboarda - frontend i backend |

**Kratak opis upita:**

> Implementirati pristup koordinatora. Koordinator treba imati detaljan uvid u cijeli tok i napredak prakse kod studenta. Na dashboardu trebaju biti sve potrebne funkcionalnosti. CSS stil treba biti usklađen s dosadašnjim. Ispoštovati sve što se tiče user storija.

**Šta je AI predložio ili generisao:**

- `KoordinatorDashboard.jsx` - dashboard s tab navigacijom (Prijave na čekanju, Sve prijave, Aktivne prakse, Studenti, Odobravanje naloga), statistikama u karticama, tamnim režimom i navbarom s logom
- `KoordinatorDashboard.css` - kompletni stilovi usklađeni s postojećim CSS varijablama i design tokenima projekta, uključujući dark mode override-e, responsive grid za statistike, tab navigaciju, tabele, modalne prozore i toast notifikacije
- `PrijavePregled.jsx` - modul za pregled prijava s filterom po statusu, paginacijom i modalnim prozorom za odobravanje/odbijanje s unosom razloga
- `PraksePregled.jsx` - modul za pregled aktivnih i završenih praksi
- `StudentListaPregled.jsx` - modul za pregled studenata s istog fakulteta s pretragom po imenu, bočnim panelom s detaljima studenta i prikazom historije prijava
- `OdobravanjePregled.jsx` - modul za odobravanje/odbijanje studentskih naloga koji čekaju odobrenje
- `koordinatorService.js` - frontend servis s API pozivima za sve koordinatorske endpointe
- Backend: `koordinator.service.js`, `koordinator.controller.js`, `koordinator.routes.js` - servis, kontroler i rute za sve koordinatorske endpointe (`/dashboard`, `/prijave`, `/prijave/:id`, `/studenti`, `/prakse`, `/zahtjevi`, `/studenti/:id/odobri`, `/studenti/:id/odbij`)
- `approval.service.js` dopuna - funkcija `getStudentApprovalRequestsForKoordinator` koja filtrira zahtjeve po `fakultetID` koordinatora
- Responsive CSS pravila za tablet i mobilne uređaje

**Šta je tim prihvatio:**
- Kompletnu arhitekturu koordinatorskog dashboarda (frontend + backend)
- Filtriranje podataka po fakultetu koordinatora na svim endpointima (prijave, studenti, prakse, zahtjevi)
- Workflow odobravanja/odbijanja studentskih naloga s email obavijestima
- Tab navigaciju i statističke kartice
- Responsive dizajn

**Šta je tim izmijenio:**
- Uklonjen filter po smjeru (odsjeku) - koordinator vidi sve studente s istog fakulteta bez obzira na smjer
- Stilizacija nekih UI elemenata (ikonice, chip za rolu) usklađena s postojećim dizajnom
- Redoslijed i nazivi tabova prilagođeni zahtjevima
- `approvalStatus` pri registraciji promijenjen iz `'APPROVED'` u `'PENDING_APPROVAL'` kako bi korisnici ispravno čekali odobrenje

**Šta je tim odbacio:**
- Prijedlog automatskog odobravanja studenata odmah pri verifikaciji emaila

**Rizici, problemi ili greške:**
- Inicijalno je koordinator vidio studente s drugog fakulteta - uzrok je bio pogrešan endpoint u frontend servisu koji je pozivao admin rutu umjesto koordinatorske; riješeno preusmjeravanjem na `/api/koordinator/zahtjevi`
- Filtriranje po `fakultetID` u `getPrijave`, `getPrijavaById` i `getPrakse` dodato naknadno jer inicijalno nije bilo implementirano - koordinator je vidio sve prijave bez obzira na fakultet

---

## Unos 2 — Backend testovi za koordinatorski modul

| Polje | Sadržaj |
|---|---|
| **Datum** | 11.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | alukovac1 |
| **Svrha korištenja** | Pisanje unit i integracionih testova za koordinatorski modul |

**Kratak opis upita:**

> Napisati backend testove koji se tiču koordinator.service, koordinatorService, koordinator Controller, koordinator.routes. Po uzoru na postojeće testove (admin.routes.test.js, admin.routes.integration.js, approval.service.test.js).

**Šta je AI predložio ili generisao:**

- `koordinator.routes.test.js` - unit testovi za sve koordinatorske rute s mockiranim middleware-om, modelima i servisima (28 testova): dashboard statistike, lista prijava s filterom, detalji prijave, odluka o prijavi, lista studenata s pretragom, odobravanje/odbijanje studenta, lista zahtjeva, lista praksi
- `koordinator.routes.integration.test.js` - integracijski testovi s pravom bazom podataka (24 testa): kreiranje testnih korisnika u `beforeAll`, provjera filtriranja po fakultetu u stvarnim DB upitima, provjera promjena statusa u bazi nakon odobravanja/odbijanja
- `koordinator.service.test.js` - unit testovi za sve servisne funkcije (32 testa): `getDashboardStats`, `getPrijave`, `getPrijavaById`, `odluciOPrijavi`, `getStudenti`, `getPrakse`, `approveStudent`, `rejectStudent`
- Dopuna `approval.service.test.js` - 5 novih testova za `getStudentApprovalRequestsForKoordinator`

**Šta je tim prihvatio:**
- Kompletnu strukturu unit i integracionih testova po uzoru na postojeće
- Sve mock funkcije i helper funkcije (`makeMockUser`, `makeMockKoordinator`, `makeMockStudent`, `makeMockPrijava`)
- Integracijske testove koji kreiraju stvarne zapise u test bazi i provjeravaju filtriranje po fakultetu

**Šta je tim izmijenio:**
- Putanje za `require` mock-ova ispravljene (`../src/` → `../../src/`) jer je fajl smješten u `tests/unit/` podfolder
- Mock `Koordinator.findOne` dodan u sve testove koji pozivaju `getPrijave`, `getPrijavaById` i `getPrakse` - naknadno dodato jer je `koordinatorUserId` parametar dodan u te funkcije
- Identifikacija studenata u integracionim testovima promjenjena s `userID` na `User.email` jer model vraća ugniježđeni `User` objekat bez `id` polja na vrhu
- `getStudentApprovalRequestsForKoordinator` describe blok izvučen iz `rejectUserRequest` bloka - bio pogrešno ugniježđen

**Šta je tim odbacio:**
- Redundantni test slučajevi koji su pokrivali iste scenarije različitim formulacijama

**Rizici, problemi ili greške:**
- Unit test za pretragu studenata jednom riječju (`Op.or` filter) koristio `expect.any(Symbol)` s `toHaveProperty` što nije podržano - riješeno s `Object.getOwnPropertySymbols()`

## Unos 3 — Implementacija pregleda praksi za studente (US-11,12,32,36)

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | Haris Husić |
| **Svrha korištenja** | Implementacija stranice za pregled dostupnih praksi za studente |

**Kratak opis upita:**

> Implementirati stranicu za pregled praksi za studente na ruti `student/dashboard`. Stranica treba prikazivati objavljene oglase za prakse u obliku kartica sa mock podacima (8-10 oglasa), filterima po datumu, tehnologiji i trajanju, dark mode podrškom i auth guardom. Kartice trebaju imati hover efekat s blagim podizanjem i animiranom svjetlećom ivicom koja putuje u smjeru kazaljke na satu od gornjeg lijevog ugla, collapsing sidebar sa search opcijom koja ce takodje imati animaciju kao kartice, filterima sa svg dziajnom tokom collapsanog izgleda, plus opisom kada je sidebar otvoren koji ce pulsirati tokom hovera.

**Šta je AI predložio ili generisao:**

- `StudentDashboard.jsx` - glavna komponenta s prikazom kartica, filter barom, dark mode toggleom i auth guardom
- `StudentDashboard.css` - kompletni stilovi uključujući animaciju svjetleće ivice (`conic-gradient`), hover efekte, CSS varijable za light/dark mode, grid layout i responsive pravila
- Mock podaci — 8-10 realističnih oglasa za prakse s poljima: naziv pozicije, kompanija, tehnološki stack (tagovi), trajanje, broj mjesta, lokacija, datum objave, rok prijave i kratak opis
- Logika filtriranja na klijentskoj strani po datumu objave, tehnologiji i trajanju
- Auth guard koji provjerava prijavu korisnika i preusmjerava na login stranicu ako sesija nije aktivna

**Šta je tim prihvatio:**
- Raspored i i dizajn

**Šta je tim izmijenio:**
- Odabran novi izgled za sidebar koji je collapsing uz dodatne promjene za interaktivniji UI

**Šta je tim odbacio:**
- Pocetnu poziciju serach i filtera

**Rizici, problemi ili greške:**
- Pocetni dizajn kartice imao previse upadljivu animaciju koja je naknadno korigovana

---

## Unos 4 — Implementacija role-based navigacije i dashboard shell-a (SB-42)

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Codex / ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Haris Tucaković |
| **Svrha korištenja** | Usklađivanje navigacije i dashboard interfejsa prema korisničkim rolama |

**Kratak opis upita:**

> Dopuniti navigaciju na dashboardima tako da korisnici imaju jasne linkove prema funkcionalnostima svoje role. Posebno uskladiti kompanijski dashboard sa postojećim vizuelnim sistemom, bočni meni, profil meni, odjavu, dark mode podršku i responzivno ponašanje.

**Šta je AI predložio ili generisao:**

- `KompanijaDashboard.jsx` — top navbar s logom, nazivom kompanije i role chip-om, hover-expand sidebar, linkove za pregled dashboarda, oglase, kreiranje oglasa, profil i odjavu
- `KompanijaDashboard.css` — dashboard shell usklađen s `AdminDashboard` vizuelnim sistemom, stilovi za sidebar, navbar, profilni meni, dark mode i mobilne prikaze
- Dopune u `StudentDashboard.jsx`, `KoordinatorDashboard.jsx` i `AdminDashboard.jsx` radi konzistentnijeg izgleda navigacije među rolama
- Usklađivanje auth stranica i dashboard navigacije sa zajedničkim ikonama i postojećim CSS tokenima
- Dodavanje `lucide-react` dependency-ja u `package.json` i `package-lock.json` jer su dashboard ikonice zavisile od te biblioteke

**Šta je tim prihvatio:**
- Role-based navigaciju sa jasno odvojenim stavkama po tipu korisnika
- Sidebar koji se širi na hover i ostavlja više prostora glavnom sadržaju
- Profilni meni sa brzim pristupom profilu i odjavi
- Korištenje `useNavigate` i postojećih ruta umjesto ručnog mijenjanja URL-a
- Dark mode i responsive pravila u istom CSS sistemu kao ostatak aplikacije

**Šta je tim izmijenio:**
- Nazivi i redoslijed stavki u navigaciji prilagođeni su backlog zadacima i postojećim rutama
- Stil kompanijskog dashboarda dodatno je usklađen s admin dashboardom da se izbjegne različit vizuelni jezik među rolama

**Šta je tim odbacio:**
- Posebnu navigacijsku komponentu za svaku stranicu bez zajedničkog vizuelnog obrasca

**Rizici, problemi ili greške:**
- `lucide-react` nije bio upisan u dependency listu i mogao je uzrokovati grešku pri pokretanju frontenda; riješeno dodavanjem dependency-ja
- Dio CSS-a za sidebar zahtijevao je dodatna responsive pravila da hover ponašanje ne remeti mobilni prikaz

---

## Unos 5 — Pregled i uređivanje profila kompanije (SB-45)

| Polje | Sadržaj |
|---|---|
| **Datum** | 13.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Codex / ChatGPT (GPT-5, OpenAI) |
| **Ko je koristio** | Haris Tucaković |
| **Svrha korištenja** | Izmjena profila kompanije kroz postojeću profilnu stranicu |

**Kratak opis upita:**

> Doraditi pregled i uređivanje profila kompanije. Kompanija treba vidjeti svoje podatke, moći urediti naziv, djelatnost, adresu, telefon, kontakt osobu i opis poslovanja, dobiti poruku o uspješnom ažuriranju, a promjena naziva treba biti vidljiva i u kompanijskom dashboardu.

**Šta je AI predložio ili generisao:**

- `ProfilePage.jsx` — poseban prikaz za korisnike role `COMPANY` unutar postojeće profilne stranice
- Učitavanje podataka kompanije preko `getCompanyProfile` i spremanje izmjena preko `updateCompanyProfile`
- Formu za uređivanje polja `naziv`, `djelatnost`, `adresa`, `telefon`, `kontaktOsoba` i `opisPoslovanja`
- Validaciju obaveznog naziva kompanije i prikaz lokalizovanih error/success poruka
- Ažuriranje lokalnog auth korisnika nakon promjene naziva kompanije
- `company-profile-updated` browser event kako bi `KompanijaDashboard` mogao osvježiti prikaz naziva bez ručnog reload-a

**Šta je tim prihvatio:**
- Zadržavanje jedinstvene `ProfilePage.jsx` stranice uz role-specific rendering
- Korištenje postojećeg service sloja za API pozive umjesto direktnih fetch poziva iz komponente
- Uređivanje samo poslovnih podataka kompanije, bez izmjene sistemskih polja kao što su rola i status
- Toast poruku nakon uspješnog ažuriranja profila
- Povratak na odgovarajući dashboard prema roli korisnika

**Šta je tim izmijenio:**
- Payload za update usklađen je sa stvarnim nazivima polja u backend modelu kompanije
- Prikaz praznih vrijednosti prilagođen je tako da profil ostane čitljiv i kada nisu uneseni svi podaci
- Sinhronizacija naziva kompanije između profila, auth state-a i dashboarda dodana je nakon testiranja korisničkog toka

**Šta je tim odbacio:**
- Uređivanje statusa naloga, role i drugih sistemskih atributa kroz profilnu stranicu


**Rizici, problemi ili greške:**
- Bez event sinhronizacije dashboard je mogao prikazivati stari naziv kompanije do reload-a stranice
- Postojala je mogućnost neusklađenosti između auth korisnika i profila kompanije nakon update-a; riješeno osvježavanjem lokalnog auth state-a

## Unos 6 — Implementacija deaktivacije računa

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija funkcionalnosti deaktivacije korisničkog računa za sve role |

**Kratak opis upita:**

> Implementirati mogućnost deaktivacije računa za studenta, kompaniju i koordinatora putem settings panela na dashboardu. Admin treba moći deaktivirati bilo kojeg korisnika. Uključiti potvrdu akcije i prikaz grešaka.

**Šta je AI predložio ili generisao:**

- `admin.service.js` — funkcija `updateUserStatus` za promjenu statusa korisnika (ACTIVE/DEACTIVATED)
- `admin.controller.js` — controller za deaktivaciju korisnika od strane admina
- `admin.routes.js` — ruta `PATCH /api/admin/users/:id/status`
- `users.service.js` — logika deaktivacije za studenta (zatvara aktivne prijave), kompaniju (zatvara oglase) i koordinatora
- `users.controller.js` — controlleri za deaktivaciju po roli
- `users.routes.js` — rute za deaktivaciju po roli
- `StudentDashboard.jsx/css` — danger zona s potvrdom deaktivacije u settings panelu
- `KompanijaDashboard.jsx/css` — settings panel s danger zonom za deaktivaciju
- `KoordinatorDashboard.jsx/css` — settings panel s danger zonom za deaktivaciju
- `AdminDashboard.jsx` — "Deaktiviraj" dugme uz svaki aktivni korisnički nalog

**Šta je tim prihvatio:**
- Kompletnu arhitekturu deaktivacije za sve role
- Potvrdu akcije putem modalnog prozora s unosom provjere

**Šta je tim izmijenio:**
- Vizuelni stil settings panela usklađen između svih dashboarda

**Šta je tim odbacio:**

**Rizici, problemi ili greške:**

---

## Unos 7 — Implementacija brisanja računa

| Polje | Sadržaj |
|---|---|
| **Datum** | 14.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hhodzic9 |
| **Svrha korištenja** | Implementacija funkcionalnosti trajnog brisanja korisničkog računa za sve role |

**Kratak opis upita:**

> Implementirati trajno brisanje računa za studenta, kompaniju i koordinatora iz settings panela. Admin treba moći obrisati bilo kojeg korisnika. Brisanje treba biti unutar transakcije i ukloniti sve povezane podatke (prijave, prakse, oglasi, aktivnosti, evaluacije, ugovori, izvještaji).

**Šta je AI predložio ili generisao:**

- `users.service.js` — funkcije `deleteMyAccount`, `deleteCompanyAccount`, `deleteCoordinatorAccount` sa Sequelize transakcijama koje brišu sve povezane zapise
- `admin.service.js` — funkcija `deleteUser` za admin brisanje po roli
- `users.controller.js` — controlleri `deleteMyAccountController`, `deleteCompanyAccountController`, `deleteCoordinatorAccountController`
- `admin.controller.js` — controller `deleteUser`
- `users.routes.js` — rute `DELETE /api/users/delete`, `/company-delete`, `/coordinator-delete`
- `admin.routes.js` — ruta `DELETE /api/admin/users/:id`
- `StudentDashboard.jsx/css` — sekcija "Brisanje računa" s labelom izvan crvene kutije i modalnim prozorom za potvrdu
- `KompanijaDashboard.jsx/css` — ista sekcija za brisanje u settings overlaju
- `KoordinatorDashboard.jsx/css` — ista sekcija za brisanje u settings panelu
- `AdminDashboard.jsx/css` — "Obriši" dugme (crveni outline) uz svaki korisnički nalog za sve statuse
- `userService.js` — frontend API funkcije za delete endpointe
- Testovi: 12 novih unit testova u `users.controller.test.js`, 12 u `users.service.test.js`, 6 u `admin.service.test.js`, 3 u `admin.routes.test.js`

**Šta je tim prihvatio:**
- Kompletnu logiku brisanja s transakcijama za sve role
- Jedinstveni tekst modalnog prozora za potvrdu brisanja
- Danger zone s labelama izvan crvenih kutija

**Šta je tim izmijenio:**
- Vizuelni prikaz settings panela unificiran između Student, Kompanija i Koordinator dashboarda

**Šta je tim odbacio:**


**Rizici, problemi ili greške:**

--- 

## Unos 8 — Implementacija stranice profila (pregled i uređivanje)

| Polje | Sadržaj |
|---|---|
| **Datum** | 13.05.2026 |
| **Sprint broj** | 7 |
| **Alat** | Claude (claude-sonnet-4-6, claude.ai) |
| **Ko je koristio** | hibrahimag1 |
| **Svrha korištenja** | Implementacija korisničkih priča 44 (Pregled profila) i 39 (Uređivanje profila studenta) — backend rute, servisna logika, kontroleri i frontend stranica profila s podrškom za sve uloge |

**Kratak opis upita:**

> Implementirati `GET /users/me` i `PUT /users/student/update` backend rute s autentifikacijom. U servisu dohvatiti podatke korisnika uz Sequelize `include` za `Student` i `Fakultet` modele, te implementirati logiku ažuriranja (ime, prezime, email, lozinka uz verifikaciju trenutne). Na frontendu kreirati `ProfilePage.jsx` s prikazom podataka za sve uloge — studenti dobivaju edit mode za osnovne podatke, kompanije dobivaju edit mode za kompanijske podatke (`naziv`, `opisPoslovanje`, `djelatnost`, `adresa`, `telefon`, `kontaktOsoba`), a koordinatori i admini dobivaju read-only prikaz. Ukloniti `ProfileShell` i `EditProfileShell` iz `KompanijaDashboard.jsx` i prebaciti tu funkcionalnost na `/profile` rutu.

---

**Šta je AI predložio ili generisao:**

- Dodaci u `backend/src/business/services/users.service.js` — dvije nove funkcije: `getMyProfile` (dohvat korisnika s `include` za `Student` i `Fakultet`) i `updateStudentProfile` (validacija, provjera jedinstvenosti emaila, bcrypt verifikacija trenutne lozinke, hashovanje nove)
- Dodaci u `backend/src/business/controllers/users.controller.js` — `getMyProfileController` i `updateStudentProfileController`
- Dodaci u `backend/src/presentation/routes/users.routes.js` — `GET /me` i `PUT /student/update` rute zaštićene `authenticate` middlewareom
- Dodaci u `frontend/src/services/api.js` — `getMyProfile()` i `updateStudentProfile()` funkcije
- `frontend/src/pages/ProfilePage.jsx` — stranica s tri odvojene grane: `StudentProfile` (edit mode za ime, prezime, email, lozinka), `CompanyProfile` (poziva `getCompanyProfile()` i `updateCompanyProfile()`, edit mode za svih 6 kompanijskih polja), `ReadOnlyProfile` (koordinatori i admini)
- `frontend/src/pages/ProfilePage.css` — ko-locirani stylesheet koji koristi `variables.css` tokene, s podrškom za dark mode i responzivni layout
- Izmjene u `frontend/src/pages/KompanijaDashboard.jsx` — uklanjanje `ProfileShell`, `EditProfileShell`, `VIEWS.PROFILE`, `VIEWS.EDIT_PROFILE`, `profileLoading`, `profileError` stanja i `handleSaveCompanyProfile` funkcije; `Profil` nav dugme preusmjereno na `/profile` rutu
- Dodavanje `Profil` opcije u profile menije u `StudentDashboard.jsx`, `KoordinatorDashboard.jsx` i `AdminDashboard.jsx` sidebar-ima
- CSS dodaci u `AdminDashboard.css` za footer sidebar sekciju s avatarem, imenom i profile menijem

---

**Šta je tim prihvatio:**

- Kompletnu backend implementaciju s bcrypt verifikacijom lozinke i čuvanjem jedinstvenosti emaila
- Trojnu granu u `ProfilePage.jsx` po ulogama
- Ko-locirani `ProfilePage.css` koji koristi `variables.css` design tokene
- Uklanjanje duplirane logike profila iz `KompanijaDashboard.jsx`
- Navigaciju na `/profile` iz svih dashboard sidebar-a i navbar-a

---

**Šta je tim izmijenio:**

**Šta je tim odbacio:**

---

**Rizici, problemi ili greške:**

- Bijeli ekran u `AdminDashboard.jsx` uzrokovan nedostajućim importima `useRef` i `useNavigate` — riješeno dodavanjem u postojeće import linije