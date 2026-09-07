# Završni izvještaj o radu tima
## Sistem za upravljanje studentskim praksama

---

## 1. Svrha projekta

Sistem za upravljanje studentskim praksama je digitalna platforma koja objedinjuje i automatizuje kompletan životni ciklus studentske prakse — od objave oglasa, prijave i selekcije kandidata, odobravanja od strane koordinatora, praćenja realizacije, do evaluacije i završnog izvještavanja.

Cilj sistema je da svim učesnicima u procesu (studentima, kompanijama i fakultetskim službama) pruži centralizovano, pregledno i standardizovano rješenje koje zamjenjuje neorganizovanu komunikaciju putem emaila, telefona i neformalnih kanala.

Dugoročna vizija sistema je da postane standardni alat za upravljanje praksama na nivou cijelog univerziteta — skalabilan na veći broj fakulteta, odsjeka i kompanija — i da kroz digitalizaciju i standardizaciju podigne ukupni kvalitet i transparentnost procesa za sve učesnike.

---

## 2. Problem koji sistem rješava

Organizacija studentskih praksi u trenutnom obliku pati od tri ključna nedostatka:

**Fragmentacija objave praksi.** Oglasi za prakse objavljuju se na velikom broju različitih platformi, ali i putem neformalnih kanala — emaila, telefona i ličnih poznanstava. Studenti nemaju jedno mjesto na kojemu mogu pregledati sve dostupne prilike, što smanjuje i transparentnost i jednakost pristupa.

**Nepostojanje praćenja statusa.** Praćenje napretka studenta, bilježenje prisustva i evidencija faza realizacije prakse su u većini slučajeva neefikasni ili u potpunosti odsutni. Koordinatori nemaju sistematičan uvid u tijek prakse, a studenti često ne znaju u kojoj fazi se nalaze.

**Nestandardizirano izvještavanje i evaluacija.** Ocjenjivanje studenata i povratne informacije kompanijama obavljaju se neformalno, bez ujednačenih kriterija. Fakultet nema pouzdanu osnovu za analizu kvaliteta realizovanih praksi ni za akademske izvještaje i akreditacije.

---

## 3. Glavne korisničke uloge

Sistem podržava četiri korisničke uloge s jasno razgraničenim pravima pristupa i odgovornostima (RBAC):

| Uloga | Opis |
|-------|------|
| **Student** | Pregledava oglase, aplicira na prakse, prati status prijava, potvrđuje sudjelovanje, vodi evidenciju aktivnosti i ocjenjuje kompaniju |
| **Kompanija** | Objavljuje i upravlja oglasima, pregledava i selektuje kandidate, prati prisustvo studenata i provodi evaluaciju |
| **Koordinator fakulteta** | Odobrava studentske i kompanijske naloge, validira prijave na prakse, prati realizaciju i generiše izvještaje |
| **Administrator** | Upravlja svim korisničkim računima, ima uvid u audit log, postavlja sistemska ograničenja (npr. max. broj aktivnih prijava po studentu) |

---

## 4. Glavne implementirane funkcionalnosti

Sistem je implementiran kroz 58 user storija raspoređenih u tri logička release-a.

### Release 1 — Objava i pregled oglasa

- Registracija i prijava korisnika svih rola (student, kompanija, koordinator)
- Verifikacija email adrese i obnavljanje lozinke
- Odobravanje korisničkih računa — koordinator odobrava studente, administrator odobrava kompanije i koordinatore
- Kreiranje, pregled i detaljan prikaz oglasa za praksu
- Administratorski pristup i upravljanje nalozima
- Navigacija, landing page i Privacy Policy stranica
- Tamni režim rada

### Release 2 — Prijava i upravljanje selekcijom

- Prijava na praksu s uploadom CV-a i motivacionog pisma (PDF)
- Ograničenje broja aktivnih prijava po studentu
- Pregled i filtriranje prijava od strane kompanije
- Selekcija kandidata i upravljanje statusima prijave (na čekanju → u selekciji → odobrena/odbijena)
- Odobravanje prakse od strane koordinatora i potvrda od strane studenta
- Student dashboard — centralizovani pregled svih prijava i statusa
- Zatvaranje i arhiviranje oglasa, pregled zatvorenih oglasa
- Oznaka "Novo" na svježe objavljenim oglasima
- Favoriziranje oglasa
- Audit log — evidencija ključnih akcija u sistemu (vidljivo administratoru)
- Pretraga i filtriranje oglasa
- Pregled statistike prijava (po oglasu, odsjeku, godini studija)
- Upravljanje rokovima prijave i automatsko zatvaranje oglasa
- Podešavanje tipova notifikacija od strane korisnika

### Release 3 — Realizacija prakse i napredne funkcionalnosti

- Potvrda studenta i generisanje ugovora o praksi
- Preuzimanje generisanog ugovora
- Evidencija aktivnosti (dnevni/sedmični zapisi studenta)
- Praćenje prisustva studenta od strane kompanije
- Evaluacija studenta od strane kompanije (standardizovani obrazac)
- Evaluacija kompanije od strane studenta
- Odustajanje od prakse
- Odbijanje prakse od strane koordinatora
- Automatsko završavanje prakse po isteku trajanja
- Generisanje završnih izvještaja
- Email notifikacije o promjenama statusa prijave

---

## 5. Pregled rada kroz sprintove

| Sprint | Fokus | Realizovane stavke |
|--------|-------|--------------------|
| **Sprint 5** | Priprema i infrastruktura | Analiza postojećih rješenja, dizajn i implementacija baze podataka, dokumentacija sistema, admin pristup, landing page, Privacy Policy, tamni režim |
| **Sprint 6** | Autentifikacija | Registracija i prijava svih rola, verifikacija emaila, obnavljanje lozinke, odobravanje naloga |
| **Sprint 7** | Profili i oglasi | Uređivanje profila studenta i kompanije, pregled profila, kreiranje i pregled oglasa, navigacija, deaktivacija naloga |
| **Sprint 8** | Upravljanje oglasima | Detalji oglasa, uređivanje oglasa, pretraga i filtriranje, favoriziranje, upravljanje rokovima, oznaka "Novo", pregled profila kompanije |
| **Sprint 9** | Prijave i selekcija | Prijava na praksu, upload dokumentacije, pregled prijava, selekcija kandidata, odobravanje prakse, zatvaranje/arhiviranje oglasa, student dashboard, statistike, audit log, ograničenje prijava, podešavanje notifikacija, pregled zatvorenih oglasa |
| **Sprint 10** | Realizacija i evaluacija | Potvrda studenta, odbijanje prakse, generisanje i preuzimanje ugovora, evidencija aktivnosti, praćenje prisustva, evaluacija studenta i kompanije, izvještaji, odustajanje od prakse, notifikacije o statusu, automatsko završavanje prakse |

---

## 6. Status realizacije

Tim je uspješno implementirao sve 58 planiranih user storija raspoređenih kroz šest sprintova (Sprint 5–10). Sva tri release-a su isporučena u cijelosti.

| Kategorija | Broj stavki | Status |
|------------|-------------|--------|
| Release 1 — Objava i pregled oglasa | 13 funkcionalnosti | ✅ Završeno |
| Release 2 — Prijava i upravljanje selekcijom | 14 funkcionalnosti | ✅ Završeno |
| Release 3 — Realizacija, evaluacija i analitika | 13 funkcionalnosti | ✅ Završeno |
| Tehnička podrška (baza, infrastruktura) | Kontinualno | ✅ Završeno |

Nije bilo stavki koje su ostale djelimično završene ili nerealizovane u odnosu na postavljeni plan.

---

## 7. Glavne tehničke odluke

| Odluka | Odabrano rješenje | Obrazloženje |
|--------|-------------------|--------------|
| **Frontend** | React.js | Komponentna arhitektura prilagođena višerolnom sistemu; React Router za zaštitu ruta po roli; AuthContext za globalno upravljanje stanjem korisnika |
| **Backend** | Node.js + Express | JavaScript na oba kraja steka ubrzava razvoj; lagan REST API; bogat ekosistem middleware-a |
| **Baza podataka** | PostgreSQL | Relacijska struktura prirodno odgovara vezama između entiteta (korisnici, oglasi, prijave, dokumenti, evaluacije) |
| **ORM** | Sequelize | Apstrakcija nad bazom u JavaScript kodu, definisanje modela i relacija, ugrađeni mehanizam migracija za verzionisanje sheme |
| **Autentifikacija** | JWT (JSON Web Token) | Stateless autentifikacija pogodna za REST API; token nosi informaciju o roli korisnika što omogućava RBAC na svakom endpointu |
| **Autorizacija** | RBAC middleware | Sistem ima četiri jasno definisane role; middleware čuva poslovnu logiku čistom od autorizacijskih provjera |
| **Upload dokumenata** | Multer (PDF only) | Serverska validacija formata fajla; ograničavanje na PDF sprječava upload potencijalno opasnih tipova fajlova |
| **Email servis** | Nodemailer + Gmail SMTP | Pokrivenost svih email scenarija (verifikacija, reset lozinke, notifikacije o statusu); besplatno do 500 emailova dnevno — dovoljno za projektne potrebe |
| **Hashovanje lozinki** | bcrypt | Industrijski standard; otporan na brute-force napade zahvaljujući adaptivnom work factoru |
| **HTTP komunikacija** | Fetch API | Ugrađen u browser bez vanjskih zavisnosti; dovoljan za sve potrebe prezentacijskog sloja |
| **Arhitektura** | Layered (N-tier) | Jasno razdvajanje prezentacijskog, poslovnog i podatkovnog sloja; olakšava paralelni razvoj frontenda i backenda; smanjuje sprezanje između komponenti |

---

## 8. Najveći problemi tokom razvoja i način rješavanja

### 8.1. Upravljanje korisničkim rolama i autorizacijom

**Problem:** Sistem ima četiri uloge s različitim pravima pristupa na svakom endpointu i svakoj stranici. Pogrešna autorizacijska logika mogla je dovesti do situacije gdje student vidi tuđe prijave ili kompanija pristupi podacima drugog partnera.

**Rješenje:** Implementiran je dedicirani RBAC middleware koji se provjerava na svakom zaštićenom endpointu prije izvršavanja poslovne logike. Na frontend strani, React Router rute su zaštićene temeljem role pohranjene u AuthContext-u, čime je onemogućen neovlašteni direktni pristup URL-ovima.

---

### 8.2. Kompleksnost toka statusa prijave

**Problem:** Prijava na praksu prolazi kroz više statusa (na čekanju → u selekciji → odobrena od kompanije → odobrena od koordinatora → potvrđena od studenta → aktivna → završena / odbijena / povučena). Svaki prijelaz ima svoja pravila i dopuštene aktere, što je predstavljalo izvor grešaka i edge case scenarija.

**Rješenje:** Statusni tok je eksplicitno modelovan i validiran na backend sloju — svaki kontroler provjerava trenutni status i rolu aktera prije nego što dozvoli promjenu. Time se osigurava da, na primjer, student ne može sam sebi odobriti praksu, niti kompanija promijeniti status koji je u nadležnosti koordinatora.

---

### 8.3. Integritet podataka pri uploadu dokumenata

**Problem:** Studenti uploadaju PDF dokumente (CV, motivaciono pismo) koji su vezani za konkretnu prijavu. Bilo je potrebno osigurati da se fajlovi čuvaju pouzdano i da kompanija pristupa isključivo dokumentima koji su joj namijenjeni.

**Rješenje:** Multer je konfigurisan da prihvata isključivo PDF format uz provjeru MIME tipa. Dokumenti su vezani za prijavu i korisnika na nivou baze podataka, a kontroler za preuzimanje provjerava vlasništvo nad dokumentom prije nego što ga posluži kompaniji.

---

### 8.4. Email servis kao kritična ovisnost

**Problem:** Verifikacija emaila, reset lozinke i sve notifikacije o statusu ovise o Gmail SMTP serveru. Kvar ili prekoračenje dnevnog limita od 500 emailova blokiralo bi ključne tokove sistema.

**Rješenje:** Email slanje je implementirano asinhronim pozivima koji ne blokiraju odgovor korisniku — u slučaju greške emaila, osnovna operacija (npr. registracija) i dalje uspijeva, a greška se loguje. Za razvoj je korišten dedicirani Gmail račun s application-specific lozinkom, izolovan od personalnih naloga članova tima.

---

### 8.5. Sinhronizacija frontenda i backenda u paralelnom razvoju

**Problem:** Frontend i backend su razvijani paralelno, što je zahtijevalo dogovorenu strukturu API odgovora i konzistentno imenovanje endpointa, jer su promjene na jednoj strani često narušavale drugu.

**Rješenje:** Tim je rano definisao API ugovor (struktura request/response, HTTP metode, URL konvencija) i striktno ga se pridržavao. Svi zahtjevi prema backend-u prolaze kroz centralizovani fetch sloj na frontendu, što je ubrzalo ispravljanje kada je dolazilo do neslaganja.

---

## 9. Šta bi tim unaprijedio da se projekat nastavlja

### 9.1. Ugrađivanje chat funkcionalnosti

Komunikacija između studenata, kompanija i koordinatora trenutno se odvija izvan sistema. Ugradnja real-time chata (npr. WebSocket / Socket.io) eliminisala bi potrebu za eksternim email razmjenama i zadržala cijelu historiju komunikacije unutar platforme.

### 9.2. Napredno filtriranje oglasa

MVP ne uključuje filtriranje po trajanju prakse, gradu, industriji ili studijskom programu. Implementacija faceted search-a s ovim parametrima — oslonjena na PostgreSQL full-text search ili Elasticsearch — značajno bi poboljšala iskustvo studenata pri pronalaženju relevantnih praksi.

### 9.3. Elektronski potpis ugovora

Generisani ugovori trenutno zahtijevaju ručno printanje i potpisivanje. Integracija s e-potpis servisom (npr. DocuSign API) digitalizovala bi i ovaj korak i učinila cijeli tok od prijave do aktivacije prakse u potpunosti bespapirnim.

### 9.4. Refresh token mehanizam

JWT tokeni trenutno imaju fiksno trajanje i ne mogu se invalidirati prije isteka. Uvođenje refresh tokena i crne liste (token blacklist) po odjavi povećalo bi sigurnost bez narušavanja korisničkog iskustva zbog čestih ponovnih prijava.

### 9.5. Antivirusna provjera uploadovanih fajlova

PDF dokumenti koje studenti uploadu trenutno se validiraju samo po MIME tipu, bez skeniranja sadržaja. Integracija s antivirusnim servisom (npr. ClamAV) uklonila bi potencijalni sigurnosni rizik, posebno bitno ako se sistem bude koristio u produkcijskom okruženju.

### 9.6. Višejezičnost

Sistem je trenutno dostupan isključivo na bosanskom jeziku. Implementacija i18n sloja (npr. react-i18next) i prevod na engleski otvorila bi platformu kompanijama s međunarodnim prisustvom i stranim studentima.

### 9.7. Prelazak u produkcionu fazu

Pri povećanju broja korisnika, sistem bi mogao preći u produkcionu fazu. To uključuje migraciju sa Render+Supabase okruženja na AWS okruženje, gdje bismo koristili EC2 instance, VPC mrežu, implementirali vlastiti CI/CD pipeline pomoću GitHub actions, i slično.
