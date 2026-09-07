# Architecture Overview
## Sistem za upravljanje studentskim praksama

---

## 1. Kratak opis arhitektonskog pristupa

Sistem koristi **Layered (N-tier) arhitekturu** organizovanu u tri sloja, 
gdje React prezentacijski sloj komunicira sa Express/Node.js poslovnim 
slojem putem REST API-ja, a poslovni sloj upravlja podacima kroz 
PostgreSQL infrastrukturni sloj.

Arhitektonski pristup je odabran jer:
- Jasno razdvaja odgovornosti između prezentacijskog, 
  poslovnog i podatkovnog sloja
- Omogućava paralelni razvoj frontenda i backenda
- Odgovara prirodi sistema koji ima više korisničkih rola 
  (student, kompanija, koordinator, administrator)
- Svaki sloj komunicira isključivo sa slojem direktno ispod/iznad njega,
  što smanjuje sprezanje između komponenti

---

## 2. Glavne komponente sistema

---

**PREZENTACIJSKI SLOJ (React)**

Obuhvata sve što korisnik vidi i s čim interaguje:
- **React komponente** — ekrani i UI elementi po rolama
- **React Router** — navigacija i zaštita ruta po roli
- **React Context (AuthContext)** — globalno stanje prijavljenog korisnika
- **Fetch API** — HTTP komunikacija prema poslovnom sloju
- **useState / useEffect** — lokalno upravljanje stanjem komponenti

---

**SLOJ POSLOVNE LOGIKE (Node.js + Express)**

Odvijaju se sva pravila i procesi sistema:
- **Express Router** — definisanje API endpointa
- **Controllers** — primanje zahtjeva, validacija ulaznih podataka
- **JWT Middleware** — autentifikacija i provjera tokena
- **RBAC Middleware** — autorizacija na osnovu role korisnika
- **Multer** — upload i validacija PDF dokumenata
- **Nodemailer** — slanje emailova (verifikacija, notifikacije, reset)
- **bcrypt** — hashovanje i provjera lozinki

---

**INFRASTRUKTURNI SLOJ (PostgreSQL)**

Trajno skladištenje i upravljanje podacima:
- **PostgreSQL** — relacijska baza podataka
- **Sequelize** — ORM za komunikaciju sa bazom, definisanje modela i relacija
- **Sequelize migracije** — verzionisanje i upravljanje promjenama sheme baze
- **Tabele** — korisnici, oglasi, prijave, dokumenti, evaluacije, audit log

Komponente su organizovane u sljedeće module:

**Frontend moduli (React):**
- Auth modul (registracija, prijava, verifikacija)
- Oglas modul (pregled, detalji, filtriranje, pretraga)
- Prijava modul (prijava na praksu, status, odustajanje)
- Dashboard modul (student dashboard, notifikacije)
- Profil modul (profil studenta, profil kompanije)
- Tok prakse modul (ugovor, evidencija, evaluacija)
- Admin/Koordinator modul (odobravanje, upravljanje)

**Backend moduli (Express):**
- Auth modul (JWT autentifikacija, verifikacija emaila)
- Oglas modul (CRUD oglasa, filtriranje, pretraga)
- Prijava modul (upravljanje prijavama, statusima)
- Korisnik modul (upravljanje profilima i rolama)
- Notifikacija modul (slanje email i in-app notifikacija)
- Ugovor modul (generisanje i preuzimanje ugovora)
- Evaluacija modul (evaluacija studenta i kompanije)

---

## 3. Odgovornosti komponenti

| Komponenta | Tehnologija | Odgovornost |
|------------|-------------|-------------|
| React (Frontend) | React.js | Prikaz korisničkog interfejsa, upravljanje stanjem, slanje HTTP zahtjeva prema API-ju |
| HTTP komunikacija | Fetch API | HTTP komunikacija između prezentacijskog i poslovnog sloja, ugrađen u browser bez vanjskih zavisnosti |
| Express (Backend) | Node.js + Express | Obrada API zahtjeva, poslovna logika, autorizacija, validacija |
| JWT Middleware | jsonwebtoken | Provjera identiteta i role korisnika na svakom zaštićenom endpointu |
| Baza podataka | PostgreSQL | Trajno skladištenje svih podataka sistema |
| Email servis | Nodemailer + Gmail SMTP | Slanje emailova (verifikacija, reset lozinke, notifikacije) |
| File upload | Multer | Upload i validacija PDF dokumenata (CV, motivaciono pismo) |
| Hashovanje lozinki | bcrypt | Sigurno čuvanje korisničkih lozinki |

---

## 4. Tok podataka i interakcija

React komponenta → REST API (Express Server) → PostgreSQL → REST API → React komponenta  

Korisnik komunicira sa sistemom putem prezentacijskog sloja (React), koji šalje HTTP zahtjeve prema poslovnom sloju kroz REST API. Poslovni sloj predstavlja centralnu tačku sistema i obrađuje sve zahtjeve, vrši validaciju, primjenjuje poslovna pravila i komunicira s infrastrukturnim slojem (PostgreSQL).

Svi zahtjevi prema zaštićenim resursima prolaze kroz JWT middleware koji validira identitet korisnika i njegovu ulogu (RBAC). Nakon uspješne autentifikacije i autorizacije, zahtjev se prosljeđuje odgovarajućem backend modulu koji izvršava poslovnu logiku i pristupa bazi podataka. Rezultat obrade se vraća prezentacijskom sloju u JSON formatu.

---

### Sinhrona i asinhrona komunikacija

**Sinhrona komunikacija (request-response):**
- registracija i prijava korisnika  
- pregled i filtriranje oglasa  
- slanje prijava  
- upravljanje profilom  

**Asinhrona komunikacija:**
- slanje email notifikacija   
- pozadinski sistemski procesi (npr. automatsko zatvaranje oglasa)  

Asinhroni procesi se izvršavaju nakon glavne operacije i ne blokiraju odgovor korisniku.

---

## 4.1 Identifikacija entiteta i skladišta podataka (DFD)

### Eksterni entiteti:
- Student
- Kompanija
- Koordinator
- Administrator
- Email modul (eksterni sistem)

### Sistemski procesi:
- Autentifikacija i autorizacija (Auth modul)
- Upravljanje korisnicima (Korisnik modul)
- Upravljanje oglasima (Oglas modul)
- Upravljanje prijavama (Prijava modul)
- Upravljanje dokumentima
- Notifikacija modul
- Ugovor modul
- Evaluacija modul

### Skladišta podataka (Data Store):
- Baza korisnika
- Baza oglasa
- Baza prijava
- Baza dokumenata
- Baza evaluacija
- Audit log

---

## 4.2 Opšti tok podataka kroz sistem

1. Korisnik (Student/Kompanija/Koordinator/Admin) šalje zahtjev putem prezentacijskog sloja  
2. Prezentacijski sloj šalje HTTP zahtjev ka poslovnom sloju kroz REST API  
3. Poslovni sloj prolazi kroz:
   - autentifikaciju (JWT)
   - autorizaciju (RBAC)
   - validaciju podataka  
4. Zahtjev se prosljeđuje odgovarajućem modulu  
5. Modul komunicira sa infrastrukturnim slojem (PostgreSQL)  
6. Rezultat se vraća prezentacijskom sloju  
7. (Opcionalno) pokreću se asinhroni procesi:
   - slanje emaila   

---

## 4.3 Ključni tokovi podataka (Activity + DFD)

### 4.3.1 Registracija korisnika

**Tok podataka:**
- Korisnik → registracijski podaci → Auth modul  
- Auth modul → validacija → Baza korisnika  
- Auth modul → verifikacioni token → Email modul  
- Email modul → verifikacioni email → Korisnik  

**Activity tok:**
1. Korisnik unosi podatke  
2. Sistem validira podatke  
3. [Ako email postoji] → vraća grešku  
4. [Ako validno] → kreira korisnika (neaktivan)  
5. Šalje verifikacioni email  
6. Korisnik potvrđuje email  
7. Sistem aktivira nalog  

---

### 4.3.2 Prijava (Login)

**Tok podataka:**
- Korisnik → email + lozinka → Auth modul  
- Auth modul → upit → Baza korisnika  
- Auth modul → JWT token → Prezentacijski sloj  

**Activity tok:**
1. Korisnik unosi kredencijale  
2. Sistem provjerava podatke  
3. [Ako pogrešni] → greška  
4. [Ako ispravni] → generiše JWT  
5. Korisnik dobija pristup  

---

### 4.3.3 Upravljanje profilom

**Tok podataka:**
- Korisnik → izmjene profila → Korisnik modul  
- Korisnik modul → update → Baza korisnika  

**Activity tok:**
1. Korisnik pristupa profilu  
2. Mijenja podatke  
3. Sistem validira unos  
4. Sprema izmjene  
5. Vraća potvrdu 

---

### 4.3.4 Upravljanje oglasima

**Tok podataka:**
- Student → pretraga/filter → Oglas modul  
- Kompanija → kreiranje/izmjena → Oglas modul  
- Oglas modul → upit/update → Baza oglasa  

**Activity tok:**
1. [Student]:
   - pregledava oglase  
   - pretražuje i filtrira  
   - označava oglas kao favorit  
2. [Kompanija]:
   - kreira oglas  
   - uređuje oglas  
   - zatvara oglas  
3. Sistem validira akcije  
4. Sprema promjene u bazu  
5. Vraća rezultate    

---

### 4.3.5 Prijava na praksu

**Tok podataka:**
- Student → podaci prijave → Prijava modul  
- Prijava modul → provjera → Baza prijava  
- Prijava modul → upis → Baza prijava  
- Prijava modul → notifikacija → Email modul  

**Activity tok:**
1. Student pokreće prijavu  
2. Sistem validira korisnika  
3. Provjerava:
   - da li je već prijavljen  
   - limit prijava  
   - status oglasa  
4. [Ako nije validno] → greška  
5. Kreira prijavu (na čekanju)  
6. Šalje notifikaciju  
7. Student može odustati od prijave  

---

### 4.3.6 Selekcija kandidata (Kompanija)

**Tok podataka:**
- Kompanija → odluka → Prijava modul  
- Prijava modul → update → Baza prijava  
- Prijava modul → notifikacija → Student  

**Activity tok:**
1. Kompanija pregleda prijave  
2. Bira kandidata  
3. Sistem ažurira status  
4. Šalje notifikaciju  

---

### 4.3.7 Odobravanje prakse (Koordinator)

**Tok podataka:**
- Koordinator → odluka → Prijava modul  
- Prijava modul → update → Baza prijava  

**Activity tok:**
1. Koordinator pregleda prijavu  
2. Donosi odluku  
3. Sistem ažurira status  
4. Šalje notifikacije  

---

### 4.3.8 Upload dokumenata

**Tok podataka:**
- Student → dokument (PDF) → Poslovni sloj  
- Poslovni sloj → spremanje → Baza dokumenata  

**Activity tok:**
1. Student upload-a dokument  
2. Sistem validira format  
3. [Ako nije PDF] → greška  
4. Sprema dokument  
5. Omogućava pristup kompaniji  

---

### 4.3.9 Generisanje ugovora

**Tok podataka:**
- Poslovni sloj → podaci → Ugovor modul  
- Ugovor modul → dokument → Baza dokumenata  

**Activity tok:**
1. Praksa odobrena  
2. Sistem generiše ugovor  
3. Sprema dokument  
4. Omogućava preuzimanje  

---

### 4.3.10 Evaluacija

**Tok podataka:**
- Student/Kompanija → evaluacija → Evaluacija modul  
- Evaluacija modul → upis → Baza evaluacija  

**Activity tok:**
1. Korisnici unose evaluaciju  
2. Sistem validira podatke  
3. Sprema evaluaciju  
4. Označava praksu kao završenu  

---

### 4.3.11 Reset lozinke

**Tok podataka:**
- Korisnik → email → Auth modul  
- Auth modul → token → Email modul  
- Email modul → link → Korisnik  

**Activity tok:**
1. Korisnik traži reset  
2. Sistem šalje email  
3. Korisnik unosi novu lozinku  
4. Sistem ažurira lozinku  

---

### 4.3.12 Notifikacije

**Tok podataka:**
- Poslovni sloj → događaj → Notifikacija modul  
- Notifikacija modul → email/in-app → Korisnik  

**Activity tok:**
1. Događaj se desi (status promjena)  
2. Sistem generiše notifikaciju  
3. Šalje korisniku  

---

### 4.3.13 Brisanje/deaktivacija naloga

**Tok podataka:**
- Korisnik → zahtjev → Korisnik modul  
- Korisnik modul → update → Baza korisnika  

**Activity tok:**
1. Korisnik traži brisanje  
2. Sistem traži potvrdu  
3. Deaktivira nalog  
4. Šalje notifikacije  

---

### 4.3.14 Administracija sistema

**Tok podataka:**
- Administrator → akcije → Korisnik modul  
- Korisnik modul → update → Baza korisnika  

**Activity tok:**
1. Administrator pregledava korisnike  
2. Odobrava ili odbija naloge  
3. Dodjeljuje role  
4. Sistem ažurira podatke  
5. Vraća potvrdu

---

### 4.3.15 Dashboard (pregled podataka po roli)

**Tok podataka:**
- Prezentacijski sloj → zahtjev → Poslovni sloj  
- Poslovni sloj → upit → Infrastrukturni sloj (prijave, oglasi, notifikacije)  
- Poslovni sloj → agregirani podaci → Prezentacijski sloj  

**Activity tok:**
1. Korisnik se prijavi u sistem  
2. Prezentacijski sloj šalje zahtjev za dashboard  
3. Sistem identifikuje rolu korisnika  
4. Dohvata relevantne podatke:
   - Student → prijave + statusi + notifikacije  
   - Kompanija → oglasi + kandidati  
   - Koordinator → prijave za odobravanje  
   - Administrator → korisnici sistema  
5. Sistem agregira podatke  
6. Vraća podatke prezentacijskom sloju  
7. Prikazuje dashboard korisniku  

---

### 4.3.16 Automatski procesi (background)

**Tokovi:**
- Sistem → provjera rokova → Infrastrukturni sloj  
- Sistem → zatvaranje oglasa  
- Sistem → završavanje prakse  

**Activity tok:**
1. Scheduler pokreće proces  
2. Provjerava uslove  
3. Ažurira status  
4. Šalje notifikacije 

---

### 4.3.17 Obrada grešaka

**Tok podataka:**
- Prezentacijski sloj → zahtjev → Poslovni sloj  
- Poslovni sloj → greška → Prezentacijski sloj  

**Activity tok:**
1. Sistem obrađuje zahtjev  
2. [Ako dođe do greške]:
   - nevalidni podaci  
   - istek tokena  
   - greška baze  
3. Sistem vraća poruku greške  
4. Prezentacijski sloj prikazuje korisniku 

---

## 5. Ključne tehničke odluke

| Odluka | Odabrano rješenje | Razlog |
|--------|-------------------|--------|
| Frontend framework | React | Komponentna arhitektura pogodna za višerolni sistem, veliki ekosistem |
| Backend framework | Node.js + Express | JavaScript na oba kraja, lagan REST API razvoj |
| Baza podataka | PostgreSQL | Relacijska struktura prirodno odgovara vezama između entiteta sistema |
| ORM | Sequelize | Apstrakcija nad PostgreSQL bazom, definisanje modela i relacija u JavaScript kodu, ugrađene migracije |
| HTTP komunikacija | Fetch API | Ugrađen u browser, bez vanjskih zavisnosti, dovoljno za potrebe projekta |
| Autentifikacija | JWT (JSON Web Token) | Stateless autentifikacija, pogodan za REST API, nosi informaciju o roli |
| Autorizacija | Role-based (RBAC) | Sistem ima 4 jasno definirane role: student, kompanija, koordinator, admin |
| File upload | Multer (PDF only) | Validacija formata fajla na serverskoj strani |
| Email servis | Nodemailer + Gmail SMTP | Slanje verifikacionih emailova, reset lozinke i notifikacija, besplatan do 500 emailova dnevno |
| Password hashing | bcrypt | Industrijski standard za sigurno hashovanje lozinki |

---

## 6. Ograničenja i rizici arhitekture

**Ograničenja:**
- Skalabilnost je ograničena monolitnom strukturom poslovnog sloja —
  pri velikom broju korisnika može biti potrebno horizontalno skaliranje
- Sva poslovna logika je centralizovana u jednom sloju,
  što znači da kvar tog sloja onesposobljava cijeli sistem
- Promjene u modelu podataka zahtijevaju pažljivo upravljanje 
  strukturom baze kroz migracije

**Rizici:**
- JWT tokeni se ne mogu invalidirati prije isteka —
  potrebno implementirati blacklist mehanizam pri odjavi
- Upload PDF dokumenata bez antivirusne provjere
  predstavlja potencijalni sigurnosni rizik
- Slanje emailova ovisi o eksternom Gmail SMTP serveru —
  kvar ili prekoračenje dnevnog limita blokira verifikaciju i notifikacije
- Privatnost studentskih podataka zahtijeva pažljivu
  implementaciju kontrole pristupa (student ne smije vidjeti tuđe prijave)

---

## 7. Otvorena pitanja

- Da li implementirati refresh token mehanizam uz JWT
  ili koristiti kratke tokene sa čestim ponovnim prijavama?