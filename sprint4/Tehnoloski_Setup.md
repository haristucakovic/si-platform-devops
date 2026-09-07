# Tehnološki Setup

---

## 1. Tehnologije

Aplikacija je organizovana u tri sloja - prezentacijski (React), poslovni (Node.js + Express) i infrastrukturni (PostgreSQL) - koji međusobno komuniciraju putem REST API-ja.

---

### 1.1 Frontend

| Biblioteka / Alat | Verzija | Namjena i razlog izbora |
|---|---|---|
| **React** | 18.x | Komponentna arhitektura pogodna za sistem s više korisničkih rola (student, kompanija, koordinator, administrator). Svaka rola dobiva vlastiti skup ekrana i UI elemenata, što se prirodno mapira na React komponentni model. Velik ekosistem, odlična dokumentacija i dugoročna podrška čine ga pouzdanim izborom. |
| **Vite** | 5.x | Build alat koji zamjenjuje zastarjeli Create React App. Višestruko brži dev server zahvaljujući native ES modulima - izmjene u kodu se reflektuju gotovo trenutno bez ponovnog bundlovanja cijele aplikacije. |
| **React Router DOM** | 6.x | Upravljanje navigacijom i zaštitom ruta na osnovu korisničke role. Neautorizovani korisnici se automatski preusmjeravaju - student ne može pristupiti koordinatorskim ekranima i obratno. |
| **React Context API - AuthContext** | ugrađen | Globalno stanje prijavljenog korisnika (identitet, rola, JWT token) dostupno svim komponentama bez prop drillinga (situacija u Reactu kada je potrebno proslijeđivati podatke kroz više komponenti koje te podatke uopće ne koriste, samo ih dalje prosljeđuju do komponente kojoj su stvarno potrebni). |
| **Fetch API** | ugrađen u browser | HTTP komunikacija prema backend sloju. Ugrađen u sve moderne browsere, bez vanjskih zavisnosti. Svi zahtjevi prema zaštićenim resursima automatski nose JWT token iz AuthContexta. |
| **useState / useEffect** | ugrađen | Ugrađeni React hookovi. useState prati sve što se mijenja unutar komponente i treba biti prikazano korisniku - npr. poruka greške, stanje forme, koji je tab trenutno aktivan... useEffect pokreće API pozive u pravo vrijeme - npr. kada student otvori listu oglasa, useEffect dohvata oglase s backenda i prikazuje ih. |
| **Tailwind CSS** | 3.x | Utility-first CSS framework koji eliminiše konflikte između CSS klasa i ubrzava stilizovanje komponenti. Nema potrebe za pisanjem zasebnih CSS fajlova za svaku komponentu. |

---

### 1.2 Backend

| Biblioteka / Alat | Verzija | Namjena i razlog izbora |
|---|---|---|
| **Node.js** | 20.x LTS | JavaScript runtime okruženje. LTS (Long-Term Support) verzija garantuje sigurnosne ispravke i stabilnost do 2026. Korištenje JavaScript-a na oba kraja (frontend i backend) znači zajednički jezik u timu i mogućnost dijeljenja koda (npr. Zod validacijskih shema). |
| **Express.js** | 4.x | Minimalistički web framework za Node.js koji daje potpunu kontrolu nad middlewareom. Ovaj stepen fleksibilnosti je ključan za implementaciju JWT i RBAC middleware lanca koji svaki zahtjev prolazi prije nego što dođe do poslovne logike. |
| **jsonwebtoken** | 9.x | Stateless autentifikacija koja ne zahtijeva čuvanje sesija na serveru. Token nosi informaciju o identitetu i roli korisnika, što middleware-u omogućava provjeru ovlaštenja bez dodatnog upita prema bazi. Svi zaštićeni endpointi provjeravaju valjanost tokena pri svakom zahtjevu. |
| **RBAC Middleware** | custom | Custom middleware za autorizaciju na osnovu role. Nakon provjere JWT tokena, RBAC middleware provjerava ima li konkretna rola dozvolu za pristup traženom resursu. Sistem ima četiri jasno definirane role: student, kompanija, koordinator i administrator. |
| **bcrypt** | 5.x | Industrijski standard za sigurno hashovanje lozinki. Koristi adaptivni algoritam koji postaje sporiji s povećanjem computing snage - direktno usporava brute force napade. Lozinke se nikad ne čuvaju u čitljivom obliku. |
| **Multer** | 1.x | Middleware za obradu multipart/form-data zahtjeva - upload PDF dokumenata (CV i motivaciono pismo). Validira format fajla na serverskoj strani neovisno o onome što klijent tvrdi. |
| **Nodemailer + Gmail SMTP** | 6.x | Slanje transakcijskih emailova: verifikacija email adrese pri registraciji, reset lozinke i notifikacije o promjenama statusa prijave. Gmail SMTP je besplatan do 500 emailova dnevno. |
| **cors** | 2.x | Middleware koji kontroliše s kojih domena backend prihvata zahtjeve. Konfigurisan da prihvata isključivo zahtjeve s frontend domene - wildcard (`*`) nije dozvoljen u produkciji. |
| **helmet** | 7.x | Automatski postavlja skup sigurnosnih HTTP headera koji štite od uobičajenih web napada: XSS, Clickjacking, MIME type sniffing i drugi. Jedna linija konfiguracije pokriva širok spektar zaštite. |
| **node-cron** | 3.x | Scheduler za pozadinske procese koji se izvršavaju po rasporedu: automatsko zatvaranje oglasa kojima je istekao rok, automatsko označavanje prakse kao završene. Procesi se izvršavaju asinhrono i ne blokiraju odgovor korisniku. |
| **dotenv** | 16.x | Učitavanje konfiguracije iz `.env` fajla. Odvaja tajne (API ključevi, lozinke, connection string baze) od koda - `.env` fajl se nikad ne commituje u repozitorij. |

---

### 1.3 Baza podataka

#### PostgreSQL 16

Relacijska baza podataka s ACID (Atomicity-Consistency-Isolation-Durability) garancijama. Relacijska struktura prirodno odgovara vezama između entiteta sistema - korisnici, oglasi, prijave, evaluacije i ugovori su međusobno čvrsto povezani entiteti kojima pogoduju strani ključevi, JOIN upiti i transakcije. PostgreSQL je zrela, battle-tested tehnologija s odličnom podrškom za kompleksne relacije i izvrsnim performansama za ovakav tip aplikacije.

#### Sequelize 6

ORM framework koji omogućava rad s bazom podataka kroz JavaScript kod umjesto pisanja sirovih SQL upita. Modeli, relacije i upiti definišu se kao JavaScript objekti i metode, što smanjuje rizik od SQL injection ranjivosti i ubrzava razvoj. Ugrađeni sistem migracija osigurava da svaka promjena sheme baze bude verzionisana i konzistentno primijenjena u svim okruženjima (development, staging, produkcija).

#### Sequelize CLI

Alat za upravljanje migracijama iz komandne linije. Svaka promjena sheme baze (nova tabela, novi stupac, novi indeks) kreira se kao zasebna migracija koja se može primijeniti ili poništiti - baza nikad ne smije biti ručno mijenjana u produkciji.

---

### 1.4 Pohrana fajlova

#### Supabase

PDF fajlove koje studenti uploaduju (CV, motivaciono pismo) i generirane ugovore nije moguće čuvati na aplikacijskom serveru jer cloud platforme koriste privremeni filesystem - fajlovi se gube pri svakom redeploymentu. Supabase Storage je open-source cloud storage servis s direktnom Multer integracijom koji trajno čuva fajlove i servira ih putem CDN-a. Besplatan tier podrazumijeva 1 GB storage. URL fajla pohranjuje se u PostgreSQL bazu i služi za kontrolu pristupa.
Tok: Multer prima i validira fajl → Supabase Storage ga trajno čuva → URL se sprema u bazu → kompanija ili koordinator pristupa fajlu putem URL-a.

---

### 1.5 Development alati

#### ESLint + Prettier

ESLint provjerava kvalitet koda i hvata potencijalne greške statičkom analizom. Prettier automatski formatira kod prema dogovorenim pravilima. Kombinacija osigurava konzistentnost koda kroz cijeli tim neovisno o individualnim podešavanjima editora.

#### Postman

Testiranje i dokumentacija API endpointa tokom razvoja. Kolekcije zahtjeva mogu se dijeliti u timu kao živa dokumentacija API-ja.

#### pgAdmin 4

Vizualni alat za upravljanje PostgreSQL bazom u lokalnom razvoju. Omogućava pregled podataka, strukturu tabela i izvršavanje upita bez pisanja SQL-a u terminalu.

---

## 2. GitFlow Branching Strategija

Odabrana strategija je Gitflow. Za razliku od GitHub Flow-a koji ima samo jedan trajni branch i jednostavan je za solo ili mali tim bez definisanih release ciklusa, Gitflow eksplicitno propisuje kada i zašto se otvara svaki tip brancha. Ova struktura sprječava nesporazume u timu, jasno razdvaja aktivni razvoj od stabilnih verzija i omogućava paralelni rad na više funkcionalnosti bez međusobnog ometanja.

---

### 2.1 Trajni branchevi

Ova dva brancha nikad se ne brišu i nikad se ne commituje direktno u njih - sve izmjene prolaze isključivo kroz Pull Request.

| Branch | Namjena |
|---|---|
| `main` | Produkcijska verzija - uvijek stabilna i deployable. Merge isključivo iz `release/*` ili `hotfix/*`. |
| `develop` | Integracijski branch - najnoviji razvoj u toku. Jedina baza iz koje se kreiraju svi novi branchevi. |

---

### 2.2 Pravila za svaki tip brancha

Svaki tip brancha ima jasno definisan trenutak otvaranja, način imenovanja, iz kojeg se brancha kreira i kako se vraća nazad.

---

#### `feature/*` - nova funkcionalnost

**Kada se otvara:** za svaku novu stavku iz backlog-a, bez obzira na veličinu.

**Imenovanje:** `feature/kratak-opis` ili `feature/broj-stavke-kratak-opis`
```
feature/user-registration
feature/student-dashboard
feature/14-student-confirmation
```

**Kreira se iz:** `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/user-registration
```

**Merg-a se nazad u:** `develop` - isključivo putem Pull Request-a, metodom Squash and Merge.

Squash and Merge sažima sve međucommitove nastale tokom razvoja ("wip", "fix", "još jedna provjera"...) u jedan čist commit na `develop` branchu. Na taj način git historija ostaje pregledna i svaki commit na `develop` predstavlja jednu završenu cjelinu.

**Branch se briše** odmah nakon mergea.

---

#### `fix/*` - ispravka greške u razvoju

**Kada se otvara:** kada se tokom aktivnog razvoja (na `develop` branchu) pronađe greška koja nije hitna i ne zahtijeva direktnu intervenciju na produkciji.

**Imenovanje:** `fix/kratak-opis-greske`
```
fix/login-validation-error
fix/duplicate-application-check
```

**Kreira se iz:** `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b fix/login-validation-error
```

**Merg-a se nazad u:** `develop` - putem Pull Request-a, metodom Squash and Merge.

**Branch se briše** odmah nakon mergea.

---

#### `release/*` - priprema produkcijskog releasea

**Kada se otvara:** kada je `develop` stabilan i sve planirane funkcionalnosti za tu verziju su mergane. Od ovog trenutka na `develop` se mogu nastaviti raditi nove stvari za sljedeći release, a `release` branch služi isključivo za finalne sitne ispravke i pripremu.

**Imenovanje:** `release/x.x.x` (semantičko verzionisanje)
```
release/1.0.0
release/1.1.0
```

**Kreira se iz:** `develop`
```bash
git checkout develop
git pull origin develop
git checkout -b release/1.0.0
```

**Merg-a se nazad u:** `main` i `develop`
- merge u `main` → produkcijski deploy, tag verzije (`git tag v1.0.0`)
- merge u `develop` → kako bi sve ispravke napravljene na release branchu bile uključene u dalji razvoj

**Branch se briše** nakon mergea u obje grane.

---

#### `hotfix/*` - hitna ispravka na produkciji

**Kada se otvara:** kada se na produkciji (`main`) pojavi kritična greška koja se mora ispraviti odmah, bez čekanja na sljedeći regularni release.

**Imenovanje:** `hotfix/kratak-opis-greske`
```
hotfix/sql-injection-patch
hotfix/contract-generation-fail
```

**Kreira se iz:** `main` - jedini branch koji se kreira direktno iz `main`, jer ispravka mora biti bazirana na trenutnoj produkcijskoj verziji, a ne na nedovršenom razvoju koji postoji na `develop`.
```bash
git checkout main
git pull origin main
git checkout -b hotfix/jwt-expiry-crash
```

**Merg-a se nazad u:** `main` i `develop`
- merge u `main` → hitni produkcijski deploy, tag verzije (`git tag v1.0.1`)
- merge u `develop` → kako ispravka ne bi bila izgubljena u sljedećem releaseu

**Branch se briše** odmah nakon mergea u obje grane.

---

#### `chore/*` - tehnički zadaci bez promjene funkcionalnosti

**Kada se otvara:** za ažuriranje zavisnosti, izmjene konfiguracije alata, refaktorisanje koda bez promjene ponašanja, podešavanje CI/CD pipeline-a.

**Imenovanje:** `chore/kratak-opis`
```
chore/update-dependencies
chore/reorganize-folder-structure
```

**Kreira se iz:** `develop` | **Merg-a se u:** `develop` putem Pull Request-a.

---

#### `docs/*` - dokumentacija

**Kada se otvara:** za izmjene ili dopune dokumentacije (README, API dokumentacija, komentari u kodu).

**Imenovanje:** `docs/kratak-opis`
```
docs/api-endpoints
docs/database-schema
```

**Kreira se iz:** `develop` | **Merg-a se u:** `develop` putem Pull Request-a.

---

### 2.3 Pull Request i code review

Svaka promjena koja ulazi u `develop` ili `main` prolazi kroz Pull Request na GitHubu. Direktan push u ove brancheve nije moguć (vidi sekciju 2.6).

**Šta PR mora sadržavati:**
- Jasan naslov koji opisuje šta je urađeno
- Kratak opis promjena
- Screenshot ili snimak ekrana ako se radi o UI promjeni
- Broj backlog stavke na koju se odnosi

**Ko radi review:**
- Minimalno jedan approval od drugog člana tima
- Reviewer ne smije biti ista osoba koja je otvorila PR

**Šta reviewer provjerava:**
- Ispravnost poslovne logike
- Konzistentnost s postojećom strukturom koda i modulima
- Da ne postoje `.env` tajne ili osjetljivi podaci u kodu

**Nakon odobrenog review-a:** autor brancha bira Squash and Merge na GitHubu, a branch se briše.

---

### 2.4 Rješavanje konflikata

Konflikte uvijek rješava **autor brancha**, nikad reviewer.

**Preporučeni pristup - rebase:**
```bash
# Na svom feature branchu
git fetch origin
git rebase origin/develop

# Ako dođe do konflikta, Git pauzira i označava konfliktne fajlove.
# Otvoriti svaki konfliktni fajl, riješiti konflikt, zatim:
git add .
git rebase --continue

# Nakon uspješnog rebasea, force push na GitHub
git push origin feature/user-registration --force-with-lease
```

Opcija `--force-with-lease` je sigurnija od `--force` jer neće prepisati tuđe commitove ako je neko u međuvremenu pushao na isti branch.

**Ako je konflikt u poslovnoj logici** (nije jasno koja verzija koda je ispravna) - ne rješavati nagađanjem. Konsultovati drugog člana tima koji je pisao konfliktni kod, a tek onda nastaviti s rješavanjem.

**Nakon rješenih konflikata** reviewer ponovo pregleda izmijenjene dijelove prije davanja approval-a.

---

### 2.5 Commit konvencija - Conventional Commits

Koristi se [Conventional Commits](https://www.conventionalcommits.org/) standard koji osigurava konzistentnu i čitljivu git historiju u timu.

| Tip | Kada se koristi | Primjer |
|---|---|---|
| `feat` | Nova funkcionalnost | `feat(auth): add email verification flow` |
| `fix` | Ispravka greške | `fix(upload): reject non-PDF mime types` |
| `refactor` | Refaktorisanje bez promjene ponašanja | `refactor(auth): extract token validation to middleware` |
| `test` | Dodavanje ili izmjena testova | `test(listings): add unit tests for listing creation` |
| `docs` | Izmjene dokumentacije | `docs: update API endpoint reference` |
| `chore` | Alati, zavisnosti, konfiguracija | `chore: upgrade sequelize to v6.35` |
| `style` | Formatiranje koda, bez logičkih promjena | `style: format auth controller with prettier` |

Primjer kompletne commit poruke:

```
feat(applications): dodaj slanje prijave na praksu

Student se sada može prijaviti na oglas slanjem motivacionog
pisma i uploada CV-a u PDF formatu. Duple prijave se
odbijaju s greškom 409 Conflict.

Closes #9
Closes #10
```

---

### 2.6 Pregled Gitflow-a

**Nova funkcionalnost**
`develop` → `feature/*` → rad → PR → review → Squash and Merge u `develop` → brisanje brancha

**Produkcijski release**
`develop` → `release/x.x.x` → finalni bugfixevi → merge u `main` + `develop` → tag verzije → brisanje brancha

**Hitni fix na produkciji**
`main` → `hotfix/*` → ispravka → merge u `main` + `develop` → brisanje brancha

---

## 3. Deployment i Hosting

Postoje dva načina deployment-a koja ćemo koristiti u različitim fazama projekta. Oni su prikazani tabelarno ispod.

|          | Development | Production |
|--------|----------|----------|
| Aplikacija | Render | AWS EC2 |
| Baza podataka | Supabase | AWS RDS |
| File storage | Supabase Storage | AWS S3 |

---

### 3.1 Development faza
U development fazi koristićemo pojednostavljeni model deployment-a s fokusom na jednostavnost objavljivanja aplikacije i olakšanim konfiguracijama. Također, servisi 
koje ćemo koristiti imaju besplatne planove, što će smanjiti trošak izrade/razvoja sistema.

Za host-anje aplikacije koristićemo [Render](https://render.com/). Render-ov besplatni plan omogućava da objavimo aplikaciju kojoj će se moći pristupiti uvijek,
s tim da će prvo pristupanje nakon perioda neaktivnosti potrajati duže, što nam ne smeta dok smo još u fazi razvoja. Deploy-anje aplikacije je vrlo jednostavno - 
potrebno je samo povezati naš GitHub repozitorij (preciznije, naš main branch) sa Renderom čime se automatski prati svaka promjena na repozitoriju. Te se promjene
automatski prikazuju i na deploy-anoj aplikaciji, što znači da imamo osiguran CI/CD pipeline. Render omogućava da imamo i build-amo servise preko docker datoteka.

Na Renderu ćemo imati pokrenute 2 instance: Render Static Site (za frontend) i Render Web Service (za backend). 

RSS služi za serviranje statičkih datoteka poput HTML i 
CSS file-ova. Na svakom push-u na main, pokreće se rebuild (obično sa `npm run build`), novi statički fileovi se build-aju i sačuvaju u `/dist` folderu, te se taj folder
sačuva u CDN (Content Distribution Network) na Renderu. Kada korisnik pristupi domeni aplikacije, Renderov CDN (preko RSS) će poslužiti korisniku glavne datoteke poput
index.html, main.js i ostale potrebne UI datoteke. Kada korisnik izvrši neku akciju za koju je potreban backend (npr. login) unutar tih datoteka se nalaze pozivi
za backend servis koji se nalazi na lokaciji koju pruža RWS.

Render Web Service (RWS) nam služi za host-anje servera odnosno backend-a naše aplikacije. Za deploy-anje backend-a aplikacije koristićemo docker kontenjer koji ćemo
izgraditi preko odgovarajućeg dockerfile-a smještenog u backendu repozitorija. Kontejnerizacija nam je korisna jer osigurava konzistentnost okruženja - isti kontejner 
koji se pokreće lokalno pokreće se identično i na Renderu, bez razlika u verzijama Node.js-a ili ostalih zavisnosti. Također, korištenje dockerfilea u development fazi 
direktno nam olakšava prelazak na AWS EC2 u production fazi, jer je isti dockerfile prenosiv između okruženja. Pri tom konfiguracija docker-a kao i build/run docker
slika se vrši automatski od strane Render-a. Mi samo povežemo dockerfile sa Renderom i ostalo se izvršava automatski.

Tok izgradnje bi izgledao ovako:
1. Pokrećemo Render Web Service koji nam build-a backend i daje nam URL. Taj URL koristimo za API pozive.
2. Koristimo `env` varijable za definisanje API_URL-a. Render prima ove varijable pri pokretanju build procesa, te ih Vite ugrađuje direktno u kompajlirani `main.js` pri 
izvršavanju `npm run build`. 
3. Pokrećemo Render Static Site koji čuva naše statičke fileove i proslijeđujemo mu RWS (odnosno API) URL kao `env` var. Dobijamo UI_URL.
4. Update-ati backend da omogući primanje zahtjeva sa našeg frontend URL-a (npr. korištenjem `cors`)
5. Korisnici pristupaju UI_URL-u, dok se zahtjevi šalju implicitno sa tog URL-a na API_URL.

Za host-anje baze podataka koristićemo [Supabase](https://supabase.com/). Ovo je također servis koji omogućava besplatni plan, čime izbjegavamo nepotrebni trošak
na početku projekta. Supabase je PostgreSQL baza koja odgovara našim potrebama. Dostupna je online, te njeno upravljanje je dosta olakšano preko web dashboard-a. To
vizuelno upravljanje je dosta značajno u razvojnoj fazi kada se dešava dosta promjena na bazi, te manuelni pristup preko terminala nije najefikasniji. 

Za čuvanje datoteka poput CV-ova, motivacionih pisama i slično koristićemo [Supabase Storage](https://supabase.com/storage). Ovo je prirodan izbor za naš projekat, jer 
je direktno kompatibilan sa bazom podataka koja se nalazi u istom ekosistemu, a zasniva se na AWS S3 servisu koji se planira koristiti u narednoj fazi.

---

### 3.2 Smjernice za prelazak iz Development u Production fazu

Kako bi se omogućio što jednostavnija migracija iz development setup-a u production setup, biće potrebno razvijati sistem sa ovom migracijom na umu. To većinom znači 
pratiti neke generalne coding smjernice, ali i neke projekt-specifične upute. Te smjernice se mogu pronaći u [Developer Guidelines](#). Neke od njih uključuju:
- Korištenje ORM (poput `Sequelize`) umjesto Supabase klijenta za dohvatanje podataka u backendu
- Pravljenje Storage Service wrapper-a da se Supabase-specific kod nalazi na jednom mjestu (prilikom prelaska na AWS S3 mijenja se samo ovaj file)
- Pisanje custom JWT autentifikacije sa `bcrypt` i `jsonwebtoken` umjesto korištenja Supabase Auth
- Korištenje dockerfilea za backend na Renderu

---

### 3.3 Production faza

U production fazi prelazimo na robusniji setup koji uključuje korištenje AWS ekosistema. Ovaj prelazak omogućava veću kontrolu nad konfiguracijom sistema, 
bolju skalabilnost, te pouzdaniju uslugu korisnicima. U development fazi smo se fokusirali na jednostavniji razvoj i deployment, dok se ovdje fokusiramo na bolje
korisničko iskustvo i kontrolu nad deployment-om.

Za host-anje aplikacije koristićemo AWS EC2 servis. Prevashodno ćemo napraviti zajedničku VPC mrežu za sve instance u ekosistemu. Imaćemo jednu EC2 (Ubuntu 24.04 LTS) 
instancu u javnoj podmreži na kojoj ćemo pokrenuti dva docker kontejnera: jedan javno dostupan za Nginx (zaslužan za usluživanje statičkih datoteka i preusmjeravanje API 
poziva na backend), i jedan privatni za Node.js (zaslužan za odgovaranje na API pozive i vraćanje odgovora na Nginx kontejner). Na ovaj način postižemo bolju izolovanost, 
samim time i sigurnost, jer je zahtjeve moguće slati samo preko javnog frontend-a, a nedostupnost ne zavisi od softvera, već od mrežnih postavki.

Za host-anje baze podataka koristićemo AWS RDS servise. Ovo je standardni servis za bazu podataka na AWS-u, koja omogućava i pokretanje PostgreSQL baze. RDS pokrećemo u
sklopu iste VPC mreže, ali u privatnoj podmreži. To je bitno, opet radi sigurnosti, da korisnici ne bi mogli pristupati bazi podataka i upravljati njome. Baza je povezana 
sa web serverom preko VPC mreže te može komunicirati sa njom. To omogućava prenos podataka u/iz baze. 

Za čuvanje datoteka koristićemo AWS S3 servis. Ovaj servis radi na istom principu kao i Supabase Storage, te neće biti velike promjene mimo promjene poziva funkcija.

Za automatizaciju deployment procesa u production fazi koristićemo GitHub Actions. Pri svakom push-u na main granu, GitHub Actions workflow se automatski pokreće i 
izvršava sljedeće korake: build-a novi Docker image od najnovijeg koda, te ga objavljuje na Docker Hub. Nakon toga, workflow se spaja na EC2 instancu putem SSH-a 
(koristeći privatni ključ pohranjen kao GitHub Secret) i izvršava komande za preuzimanje novog image-a sa Docker Huba te restart kontejnera. Na ovaj način je osiguran 
potpuno automatizovan CI/CD pipeline bez potrebe za ručnim intervencijama pri svakom novom release-u.

Dodatne mogućnosti prilikom konfiguracije sistema u produkcijskoj fazi predstavljaju prednost, dok su u development fazi bili samo komplikacija. Na Renderu smo ograničeni 
sa izborom mašine na kojoj se pokreće naš web server, te nemamo izbora u odabir operativnog sistema. Preko AWS-a je moguće izabrati preko stotinu različitih specifikacija 
mašina, sa inkrementalnim poboljšanjima. To nam omogućava da, ako dođe do porasta korisnika u budućnosti, lahko nadogradimo naš sistem. Također možemo izabrati bilo koji 
OS koji nam treba, te se može izabrati onaj koji nam daje najbolje usluge/performanse. Također, praćenje troškova je sada dosta lakše jer se svi servisi koji koristimo
nalaze u istom ekosistemu, odnosno na jednom mjestu.

---

### 3.4 Post-production faza

U production fazi je izabran public cloud servis radi jednostavnijeg početka sa manjim up-front troškom. Međutim, nedostaci korištenja public cloud-a su ponajviše 
sigurnost podataka. U budućnosti je moguće prebaciti se sa public cloud sistema na private odnosno community cloud. S obzirom da su korisnici ove aplikacije usko povezani 
odnosno sa sličnim zahtjevima, a nalaze se u istom lokalitetu (gradu), ako sistem zaživi i bude imao dovoljno korisnika da to opravda, prebacivanje na community cloud bi 
dao korisnicima (fakultetima, kompanijama, i studentima) veću kontrolu nad svojim podacima.