# Product Vision

## Sistem za upravljanje studentskim praksama

Sistem za upravljanje studentskim praksama predstavlja digitalnu platformu koja omogućava upravljanje kompletnim procesom realizacije prakse - od prijave, odobravanja i praćenja, do komunikacije, evaluacije i izvještavanja.

Cilj sistema je objedinjavanje svih dostupnih praksi na jednom mjestu, uključujući prakse koje nude kompanije u saradnji sa univerzitetima, fakultetima i drugim obrazovnim i istraživačkim institucijama. Na taj način, sistem omogućava centralizovan i pregledan pristup informacijama o praksama.

Platforma je zamišljena tako da studentima pruži jasan i sistematičan pregled dostupnih praksi, kao i jednostavan i efikasan proces prijavljivanja u skladu sa njihovim interesovanjima i kvalifikacijama.

Glavni cilj sistema je rješavanje konkretnih problema koji postoje u trenutnom načinu organizacije i realizacije studentskih praksi. Sistem nastoji unaprijediti proces za sve učesnike (studente, kompanije i fakultete) kroz digitalizaciju, automatizaciju i standardizaciju ključnih aktivnosti.

### Glavni problemi

- Prakse se objavljuju na velikom broju različitih platformi, a u nekim slučajevima i putem neformalnih kanala (email, telefon, lična poznanstva), što komunikaciju i razmjenu informacija čini neorganizovanom i nepreglednom.
- Praćenje statusa, odnosno faze, prakse često je otežano ili u potpunosti nepostojeće, što dovodi do problema u praćenju napretka studenata, njihovog prisustva i faza realizacije prakse.
- Evaluacija i izvještavanje se u većini slučajeva obavljaju neformalno, bez standardizovanog pristupa, što otežava kompanijama objektivno ocjenjivanje studenata, a fakultetima analizu kvaliteta realizovanih praksi.

Ovi problemi imaju značajan utjecaj na sve učesnike u procesu, te njihovo rješavanje kroz jedan sveobuhvatan i centralizovan sistem predstavlja važan korak ka unapređenju kvaliteta studentskih praksi.

---

## Ciljni korisnici

Glavni korisnici ovog sistema su:

- **Studenti**
- **Kompanije**
  - HR menadžer
  - Mentor
- **Fakultet**
  - Koordinator
  - Administrativno osoblje

---

## Vrijednost sistema

Vrijednost koju ovaj sistem donosi organizaciji ogleda se u transparentnosti (svaki korisnik vidi šta se tačno od njega očekuje i u kojoj je fazi proces), skalabilnosti (mogućnost rada sa većim brojem korisnika) i usklađenosti (sve digitalno arhivirano i dostupno za bilo kakvu vrstu provjere).

### Vrijednost sistema po korisnicima

- **Studenti:**
  Praksa predstavlja važan korak ka zapošljavanju i profesionalnom razvoju. Sistem omogućava uštedu vremena, brže odgovore, lakši pristup informacijama, jasan pregled rokova, uslova i statusa prijava, kao i uvid u evaluaciju njihovog rada (znanje, vještine, profesionalnost...).

- **Fakulteti:**
  Sistem omogućava vođenje evidencije i centralizovan pregled podataka o studentima i praksama, čime se olakšava praćenje procesa i izrada izvještaja.

- **Kompanije:**
  Ključna vrijednost koju kompanije dobijaju ovakvim jednim sistemom jeste lakši pristup kvalifikovanoj i motivisanoj mladoj radnoj snazi. Platforma omogućava jednostavno upravljanje prijavama, praćenje većeg broja kandidata i efikasno davanje povratnih informacija studentima. Također, sistem pruža uvid u profil studenta, uključujući i informacije o studijskom programu, relevantnim vještinama i prethodnim aktivnostima. Shodno tome, na osnovu tih podataka, kompanije mogu lakše procijeniti kompatibilnost studenta sa ponuđenom praksom, te postaviti jasnija očekivanja i donijeti bolje odluke prilikom selekcije kandidata.

---

## Scope MVP verzije

### Autentifikacija i upravljanje korisnicima

- Registracija i prijava korisnika (email/lozinka)
- Upravljanje profilima (primjer: studenti - unos indeksa, godine studija...)
- Verifikacija prijave
- Pristup u zavisnosti od vrste korisnika

### Oglasi

- Kompanija kreira oglas/e sa osnovnim informacijama: broj mjesta, trajanje, opis posla i zahtjevi
- Student pretražuje oglase
- Student šalje prijavu uz motivaciono pismo i CV (upload-ovanje PDF fajla)

### Proces odobravanja

- Student se prijavljuje
- Kompanija pregleda prijavu i selektuje kandidata
- Koordinator fakulteta odobrava praksu
- Student potvrđuje prisustvovanje praksi
- Generisanje ugovora o praksi

### Praćenje toka prakse

- Student unosi kratke dnevne ili sedmične zapise o aktivnostima
- Kompanija potvrđuje i vodi evidenciju o prisustvu studenta

### Evaluacija

- Kompanija popunjava standardizovani obrazac za evaluaciju (podrazumijeva ocjenjivanje studenta po predefinisanim kriterijima)
- Student ocjenjuje kompanije
- Zatvaranje prakse

### Izvještavanje

- Koordinator fakulteta generiše izvještaj na osnovu podataka unesenih od strane studenta i kompanije za internu upotrebu, akreditaciju, dekanat...

### U MVP ne ulazi

- Chat između korisnika
- Filtriranje oglasa po trajanju, mjestu, industriji...
- Višejezičnost
- Elektronski potpis za ugovore

---

## Ključna ograničenja i pretpostavke

### Poslovna ograničenja

- Budžet
- Regulacioni zahtjevi (zaštita ličnih podataka, zakon o visokom obrazovanju)

### Tehnička ograničenja

- IT infrastruktura fakulteta
- Podrška browser-a (Chrome, Firefox, Edge, Safari)

### Organizaciona ograničenja

- Nedostatak posvećenosti glavnih aktera
- Promjene zahtjeva tokom razvoja
- Nedostatak tehničkog znanja kod korisnika

### Pretpostavke

- Svi korisnici imaju internet pristup
- Studenti žele koristiti ovakvu vrstu digitalnog sistema
- Kompanije su spremne objavljivati prakse
- Fakultet podržava sistem
