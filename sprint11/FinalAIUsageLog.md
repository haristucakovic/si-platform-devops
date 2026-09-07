# Final AI Usage Summary

## 1. Uvod

Tokom razvoja sistema za upravljanje studentskim praksama korišteni su AI alati ChatGPT (GPT-5) i Claude Sonnet 4.6. AI alati nisu korišteni kao zamjena za razvojni rad članova tima, već kao podrška pri analizi zahtjeva, implementaciji funkcionalnosti, dizajnu korisničkog interfejsa, generisanju testova i rješavanju tehničkih problema.

Svi prijedlozi generisani pomoću AI alata dodatno su pregledani, testirani i prilagođeni postojećoj arhitekturi sistema prije integracije u projekat. Detaljni zapisi korištenja AI alata dokumentovani su kroz AI Usage Logove za svaki sprint.

---

## 2. Korišteni AI alati

| AI alat           | Način korištenja                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| ChatGPT (GPT-5)   | Implementacija backend logike, autentifikacije, dokumentacije, validacija, analiza problema i prijedlozi arhitekture |
| Claude Sonnet 4.6 | Generisanje frontend komponenti, dashboarda, CSS stilova, testova i UI prijedloga                                    |

---

## 3. Za šta je AI korišten

### 3.1. Registracija, autentifikacija i upravljanje korisnicima

AI je korišten za:

* registraciju studenata, kompanija i koordinatora
* JWT autentifikaciju
* RBAC autorizaciju
* hashiranje lozinki pomoću bcrypt-a
* email verifikaciju korisničkih računa
* password reset funkcionalnost
* administrativno odobravanje korisničkih naloga

### 3.2. Landing Page i javni dio sistema

AI je korišten za:

* implementaciju landing page-a
* dizajn hero sekcije
* navigaciju i footer
* dark mode podršku
* responzivni prikaz za mobilne uređaje
* Privacy Policy, Terms & Conditions i Cookie Policy stranice

### 3.3. Dashboard moduli

AI je korišten za:

* Admin Dashboard
* Koordinator Dashboard
* Student Dashboard
* dashboard navigaciju po rolama
* statističke kartice
* tabele i filtere
* prikaz korisnika i prijava

### 3.4. Upravljanje praksama

AI je korišten kao pomoć pri implementaciji:

* kreiranja oglasa za praksu
* uređivanja oglasa
* upravljanja rokovima prijave
* favorizacije oglasa
* oznake „Novo“
* prijave studenata na praksu
* upload-a dokumentacije
* pregleda prijava po oglasu
* pregleda profila kompanija

### 3.5. Upravljanje profilima

AI je korišten za:

* uređivanje studentskog profila
* uređivanje profila kompanije
* pregled korisničkih profila
* prikaz detalja kompanije

### 3.6. Testiranje i validacija

AI je korišten za:

* generisanje unit testova
* generisanje integracionih testova
* kreiranje mock podataka
* validaciju poslovne logike
* identifikaciju rubnih slučajeva

### 3.7. Dokumentacija sistema

AI je korišten za:

* generisanje početnih verzija Privacy Policy dokumenta
* generisanje Terms & Conditions dokumenta
* generisanje Cookie Policy dokumenta
* pomoć pri strukturisanju tehničke dokumentacije
* kreiranje prijedloga testnih scenarija

---

## 4. Šta je tim prihvatio

Tim je prihvatio AI prijedloge koji su bili u skladu sa zahtjevima sistema i koji nisu uvodili nepotrebnu složenost.

Najznačajniji prihvaćeni prijedlozi uključuju:

* osnovnu strukturu Landing Page-a
* Admin Dashboard arhitekturu
* Koordinator Dashboard arhitekturu
* Student Dashboard raspored
* JWT autentifikaciju
* password reset workflow
* email verifikaciju korisnika
* dark mode sistem
* role-based navigaciju
* backend API strukturu za administraciju
* generisane testove za koordinatorski modul
* strukturu pravne dokumentacije
* responzivni dizajn stranica
* implementaciju filtera i validacija
* generisane backend servise i kontrolere

---

## 5. Šta je tim izmijenio

Većina AI prijedloga zahtijevala je dodatno prilagođavanje projektu.

Tim je najčešće mijenjao:

* CSS stilove i boje
* raspored dashboard komponenti
* nazive ruta i endpointa
* validacione poruke
* strukturu API odgovora
* tekstualni sadržaj landing page-a
* sadržaj pravnih dokumenata
* logiku filtriranja korisnika po fakultetu
* poslovna pravila za odobravanje naloga
* mock podatke korištene tokom razvoja
* testne slučajeve nakon izmjena modela
* strukturu pojedinih React komponenti
* navigaciju između stranica

AI je često davao generička rješenja koja su morala biti prilagođena postojećim servisima, dizajnu i pravilima sistema.

---

## 6. Šta je tim odbacio

Tim je odbacio prijedloge koji nisu odgovarali zahtjevima projekta ili su uvodili nepotrebnu složenost.

| Odbačeni prijedlog                                        | Razlog odbacivanja                                 |
| --------------------------------------------------------- | -------------------------------------------------- |
| Automatsko odobravanje korisnika nakon email verifikacije | Nije odgovaralo poslovnim pravilima sistema        |
| Brisanje forme za dodjelu admin role                      | Potrebna funkcionalnost administratora             |
| Mock oglas u hero sekciji landing page-a                  | Oglasi tada nisu bili implementirani               |
| FAQ i Kontakt stranice u footeru                          | Nisu bile dio Product Backloga                     |
| Status tracker u hero sekciji                             | Zamijenjen carousel prikazom                       |
| Generički dizajn pravnih stranica                         | Nije bio usklađen sa ostatkom sistema              |
| Određeni redundantni test slučajevi                       | Nisu donosili dodatnu vrijednost                   |
| Generičke formulacije u pravnoj dokumentaciji             | Nisu odgovarale stvarnim funkcionalnostima sistema |

---

## 7. Greške, rizici i ograničenja AI prijedloga

### 7.1. Pogrešna interpretacija zahtjeva

AI je povremeno pogrešno interpretirao poslovna pravila sistema.

Primjeri:

* predloženo uklanjanje forme za dodjelu administratorske role
* prijedlog automatskog odobravanja korisnika nakon verifikacije emaila

### 7.2. Neusklađenost sa arhitekturom

AI je ponekad predlagao strukture i implementacije koje nisu bile potpuno usklađene sa postojećom arhitekturom projekta.

### 7.3. Problemi sa filtriranjem podataka

Kod koordinatorskog modula inicijalno nisu bila pravilno implementirana ograničenja po fakultetu, zbog čega su bili prikazivani podaci koji nisu pripadali odgovarajućem koordinatoru.

### 7.4. Rizici u testovima

Generisani testovi nisu uvijek bili usklađeni sa trenutnom implementacijom modela i servisa te su zahtijevali dodatne korekcije.

### 7.5. UI i UX problemi

Pojedini AI prijedlozi za korisnički interfejs nisu bili u skladu sa postojećim dizajnom aplikacije te su morali biti ručno prilagođeni.

### 7.6. Generička rješenja

AI je često predlagao generičke pristupe koji nisu uzimali u obzir specifične zahtjeve sistema za upravljanje studentskim praksama.

---

## 8. Dijelovi sistema razvijeni uz AI pomoć koje tim mora posebno znati objasniti

| Dio sistema                    | Šta je potrebno znati objasniti                                   |
| ------------------------------ | ----------------------------------------------------------------- |
| Registracija i autentifikacija | JWT, RBAC, bcrypt, email verifikacija i password reset            |
| Landing Page                   | Strukturu sekcija, navigaciju, dark mode i responzivnost          |
| Admin Dashboard                | Pregled korisnika, odobravanje naloga i dodjelu rola              |
| Koordinator Dashboard          | Pregled prijava, filtriranje po fakultetu i odobravanje studenata |
| Student Dashboard              | Pregled oglasa, filtere i favorite                                |
| Upravljanje praksama           | Kreiranje, uređivanje i pregled oglasa                            |
| Upload dokumentacije           | Validaciju i pohranu dokumenata                                   |
| Pravna dokumentacija           | Sadržaj i način prikaza Privacy Policy i Terms stranica           |
| Testovi                        | Strukturu unit i integracionih testova                            |
| Dark Mode                      | ThemeContext, localStorage i sinhronizaciju tema                  |

---

## 9. Način transparentnog i kritičkog korištenja AI alata

Tim je AI alate koristio transparentno i kritički:

* korištenje AI alata dokumentovano je kroz AI Usage Log za svaki sprint
* AI prijedlozi nisu automatski prihvatani
* svaki generisani kod je pregledan i testiran prije integracije
* poslovna logika definisana je od strane članova tima
* sigurnosne provjere nisu preuzimane bez validacije
* svi značajni AI doprinosi evidentirani su u projektnoj dokumentaciji
* konačne tehničke odluke donosio je tim
* AI alati korišteni su kao pomoćni alat, a ne kao zamjena za razvojni proces

---

## 10. Zaključak

AI alati značajno su ubrzali razvoj sistema za upravljanje studentskim praksama, posebno u oblastima frontend razvoja, generisanja testova, dokumentacije i implementacije standardnih funkcionalnosti. Međutim, AI nije korišten kao zamjena za razvojni proces.

Svi prijedlozi su analizirani, prilagođeni i validirani od strane članova tima prije integracije u sistem. Konačna odgovornost za arhitekturu, poslovna pravila, sigurnost, kvalitet implementacije i testiranje ostala je na članovima razvojnog tima.

Na osnovu iskustava tokom razvoja projekta, AI alati pokazali su se kao korisna podrška koja ubrzava razvoj i olakšava rješavanje problema, ali zahtijeva kontinuiranu ljudsku provjeru i razumijevanje generisanih rješenja prije njihove upotrebe u produkcionom sistemu.
