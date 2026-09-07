
# User Stories

---

> ## Izmjene sa konsultacija (drugi sprint)
>
> Dodani sljedeći user storiji:
>
> - **32. Uređivanje oglasa**
> - **33. Odustajanje od prakse**
> - **34. Obnavljanje lozinke** 
> - **35. Student dashboard** 
> - **36. Filtriranje oglasa** 
> - **37. Notifikacije o statusu prakse** 
> - **38. Verifikacija email adrese** 
> - **39. Pretraživanje oglasa** 
> - **40. Deaktivacija/brisanje korisničkog računa**
> - **41. Početna stranica (Landing page)**
> - **42. Navigacija**
> - **43. Pregled profila kompanije**
> - **44. Pregled korisničkog profila**
> - **45. Uređivanje profila kompanije**
> - **46. Privacy policy & User Terms stranica**
> - **47. Tamni režim rada**
> - **48. Favoriziranje oglasa**
> - **49. Arhiviranje oglasa**
> - **50. Pregled statistike prijava**
> - **51. Historija aktivnosti (Audit log)**
> - **52. Upravljanje rokovima prijave**
> - **53. Ograničenje broja prijava po studentu**
> - **54. Automatsko završavanje prakse**
> - **55. Podešavanje tipova notifikacija**
> - **56. Oznaka "Novo" na oglasima**
> - **57. Pregled zatvorenih oglasa**
> - **58. Odobravanje korisničkog računa**
>
> Svi user story-i su sada povezani sa odgovarajućim stavkama Product Backlog-a,
> te su dodani očekivani sprint-ovi u kojima se planira realizacija svakog story-a.
>
> **Napomena:** Na kraju dokumenta dodana tabela sa rasporedom user storija po sprintovima - [Idi na tabelu →](#raspored-user-storija-po-sprintovima)


---

## 1. Registracija studenta | PB1
- **Opis:** Kao student, želim da se registrujem u sistem kako bih kreirao svoj profil  
- **Poslovne vrijednosti:** Omogućava studentu pristup sistemu i njegovim osnovim funkcionalnostima  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student posjeduje fakultetski email  
- **Veza sa drugim storijima ili zavisnostima:**  
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka: ime, prezime, 
    email, lozinka, indeks, godina studija, odsjek
  - Kada student uspješno unese sve podatke, 
    korisnik treba dobiti potvrdu o registraciji na ekranu
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
  - Sistem ne smije odobriti profil prije verifikacije od strane     
  fakulteta
  - Sistem ne smije dozvoliti završetak registracije 
    bez popunjenih obaveznih polja
- **Očekivani sprint:** Sprint 6
---

## 2. Registracija koordinatora fakulteta | PB1
- **Opis:** Kao koordinator, želim da se registrujem u sistem s odgovarajućim privilegijama kako bih upravljao procesom odobravanja praksi  
- **Poslovne vrijednosti:** Omogućava koordinatoru pristup određenim privilegijama koje dolaze uz tu rolu  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 9
- **Acceptance criteria:** 
  - Sistem mora omogućiti unos podataka: ime, prezime, 
    email, lozinka, institucija, odsjek
  - Kada koordinator unese podatke, sistem mora kreirati 
    profil i dodijeliti mu rolu koordinatora
  - Korisnik treba dobiti obavještenje da je registracija 
    na čekanju adminovog odobravanja
  - Sistem ne smije dozvoliti pristup privilegijama 
    dok admin ne odobri account
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
- **Očekivani sprint:** Sprint 6
---

## 3. Registracija kompanije | PB1
- **Opis:** Kao kompanija, želim da se registrujem u sistem s ciljem objavljivanja oglasa i povezivanja sa studentima  
- **Poslovne vrijednosti:** Objavljivanje oglasa za praksu u cilju pronalaska kvalitetne radne snage  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti odobrena od strane fakulteta  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 9
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka: naziv kompanije, 
    email, lozinka, adresa, kontakt osoba
  - Kada kompanija unese podatke, sistem mora poslati 
    zahtjev adminu za odobravanje
  - Korisnik treba dobiti obavještenje da je registracija 
    na čekanju odobravanja
  - Sistem ne smije dozvoliti registraciju 
    s već postojećim emailom
- **Očekivani sprint:** Sprint 6
---

## 4. Prijava studenata | PB2
- **Opis:** Kao student, želim da se prijavim u sistem kako bih pristupio objavljenim praksama i prijavio se na njih  
- **Poslovne vrijednosti:** Omogućava studentu siguran pristup već kreiranom profilu i konstantan uvid u objavljene prakse i stanje prijavljenih praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Student se već registrovao u sistem  
- **Veza sa drugim storijima ili zavisnostima:**
  - 1(Registracija studenta)
- **Acceptance criteria:**
  - Kada student uspješno unese kredencijale(email, lozinka), 
    sistem ga  mora preusmjeriti na dashboard
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    bez verifikovanog accounta
  - Sistem ne smije dozvoliti prijavu 
    s nepostoječim emailom
- **Očekivani sprint:** Sprint 6


---

## 5. Prijava koordinatora | PB2
- **Opis:** Kao koordinator, želim da se prijavim u sistem kako bih odobravao studentima prijavljene prakse i imao uvid u njih  
- **Poslovne vrijednosti:** Omogućava koordinatoru siguran pristup već kreiranom profilu i dalje odobravanje i evaluacije praksi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je već odobren od strane administratora kao koordinator  
  - Kojim podacima studenata koordinator ima pristup?  
- **Veza sa drugim storijima ili zavisnostima:**
  - 2(Registracija koordinatora)
- **Acceptance criteria:**
- Kada koordinator uspješno unese kredencijale, 
    sistem ga mora preusmjeriti na koordinatorski dashboard
  - Sistem mora omogućiti pristup samo 
    odobrenim koordinatorskim accountima
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    neodobrenom koordinatoru
- **Očekivani sprint:** Sprint 6

---

## 6. Prijava kompanija | PB2
- **Opis:** Kao kompanija želim da se prijavim u sistem u cilju nastavka upravljanja i objavljivanja oglasa  
- **Poslovne vrijednosti:** Omogućava kompaniji siguran pristup već kreiranom profilu i nastavak upravljanja oglasima i prijavama  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija je već registrovana u sistem  
- **Veza sa drugim storijima ili zavisnostima:** 
  - U zavisnosti od 3(Registracija kompanija)
- **Acceptance criteria:**
 - Kada kompanija uspješno unese kredencijale, 
    sistem mora preusmjeriti je na dashboard kompanije
  - Sistem mora omogućiti pristup samo 
    odobrenim kompanijskim accountima
  - Korisnik treba dobiti poruku greške 
    u slučaju pogrešnih kredencijala
  - Sistem ne smije dozvoliti pristup 
    neodobrenoj kompaniji
- **Očekivani sprint:** Sprint 6

---

## 7. Uređivanje profila studenta | PB39
- **Opis:** Kao student želim da unesem/uređujem lične podatke (opis, vještine, hobiji, interesovanja, profilna slika)
- **Poslovne vrijednosti:** Student ima mogućnost održavanja profila ažurnim u cilju predstavljanja relevantnih informacija o sebi  
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Korisnik mora biti prijavljen da bi mogao uređivati profil
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenta)
- **Acceptance criteria:**
  - Sistem mora omogućiti izmjenu podataka: 
    ime, prezime, indeks, godina studija, odsjek
  - Kada student uspješno izmijeni podatke, 
    korisnik treba dobiti potvrdu o ažuriranju profila
- **Očekivani sprint:** Sprint 7

---

## 8. Pristup koordinatora | PB5
- **Opis:** Kao koordinator želim da pristupim posebnom interfejsu sa ciljem uvida u informacije o prijavama studenata na prakse i njihovim osnovnim informacijama  
- **Poslovne vrijednosti:** Pruža centralizovan pregled prijava i informacija o studentima što omogućava efikasno odobravanje praksi  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kojim informacijama može pristupiti koordinator?  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 5 (Prijava koordinatora)  
- **Acceptance criteria:**
  - Sistem mora omogućiti koordinatoru pregled 
    svih prijava studenata na prakse
  - Sistem mora omogućiti koordinatoru uvid u 
    osnovne informacije o studentima
  - Korisnik treba dobiti pregledan prikaz 
    statusa svake prijave
  - Sistem ne smije dozvoliti pristup 
    koordinatorskom interfejsu bez odgovarajuće role
- **Očekivani sprint:** Sprint 7
---

## 9. Pristup administratora | PB5
- **Opis:** Kao administrator želim da pristupim posebnom interfejsu sa ciljem uvida i upravljanja svim korisnicima sistema  
- **Poslovne vrijednosti:** Administratoru omogućava upravljanje rolama korisnika što je preduslov za ispravan rad sistema  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Administrator se ne registruje kao ostali korisnici  
- **Veza sa drugim storijima ili zavisnostima:**
  - U vezi sa 2 i 3 (Davanje role koordinatora/kompanije korisniku)  
- **Acceptance criteria:**
  - Sistem mora omogućiti administratoru pregled 
    svih korisnika sistema
  - Sistem mora omogućiti dodjelu rola 
    drugom adminu, koordinatoru i kompaniji
  - Korisnik treba dobiti potvrdu nakon 
    svake akcije odobravanja ili odbijanja
  - Sistem ne smije dozvoliti pristup 
    admin interfejsu bez admin role
- **Očekivani sprint:** Sprint 5

---

## 10. Kreiranje oglasa | PB6
- **Opis:** Kao kompanija želim da kreiram i objavim oglas kako bih studentima predstavio praksu i naše zahtjeve  
- **Poslovne vrijednosti:** Omogućava kompaniji objavljivanje oglasa za praksu i povezivanje sa studentima  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija je prijavljena i odobrena u sistemu  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 (Prijava kompanije)  
- **Acceptance criteria:**
  - Sistem mora omogućiti unos podataka oglasa: 
    naziv, opis, trajanje, broj mjesta, uslovi
  - Kada kompanija uspješno kreira oglas, 
    sistem mora objaviti oglas i učiniti ga vidljivim studentima
  - Korisnik treba dobiti potvrdu o uspješnom 
    kreiranju oglasa
  - Sistem ne smije dozvoliti kreiranje oglasa 
    bez popunjenih obaveznih polja
  - Sistem ne smije dozvoliti kreiranje oglasa 
    neodobrenoj kompaniji
- **Očekivani sprint:** Sprint 7
---

## 11. Pregled oglasa | PB7
- **Opis:** Kao student želim da imam mogućnost pregleda svih dostupnih praksi  
- **Poslovne vrijednosti:** Student ima konstantan uvid u dostupne prakse  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen da bi pristupio pregledu praksi  
- **Veza sa drugim storijima ili zavisnostima:**
  - U vezi sa 10 (Kreirani oglasi)  
  - Zavisi od 4 (Prijava studenta)  
- **Acceptance criteria:**
  - Sistem mora omogućiti studentu pregled 
    svih aktivnih oglasa
  - Sistem mora prikazati osnovne informacije 
    o svakom oglasu: naziv, kompanija, trajanje, broj mjesta
  - Sistem ne smije dozvoliti pregled oglasa 
    bez aktivne prijave u sistem
- **Očekivani sprint:** Sprint 7
---

## 12. Pregled detalja oglasa | PB8
- **Opis:** Kao student želim da imam uvid u detalje prakse s ciljem odluke prijavljivanja na istu  
- **Poslovne vrijednosti:** Student ima dublji uvid u zahtjeve za praksu  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 i 11  
- **Acceptance criteria:**  
  - Sistem mora prikazati: opis, trajanje, 
    broj mjesta, uslovi, kontakt informacije
  - Korisnik treba dobiti jasan prikaz 
    roka za prijavu
  - Sistem ne smije dozvoliti pregled detalja 
    neaktivnog oglasa
- **Očekivani sprint:** Sprint 8

---

## 13. Prijava na praksu | PB9
- **Opis:** Kao student želim da se prijavim na praksu  
- **Poslovne vrijednosti:** Omogućava studentu učešće u selekciji  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 11 i 12  
- **Acceptance criteria:**
  - Sistem mora omogućiti studentu prijavu 
    na odabrani oglas
  - Kada student uspješno podnese prijavu, 
    korisnik treba dobiti potvrdu o prijavi
  - Sistem mora prikazati status prijave: 
    (Na čekanju, Odobreno, Odbijeno)
  - Sistem ne smije dozvoliti prijavu 
    na isti oglas dva puta
  - Sistem ne smije dozvoliti prijavu 
    na neaktivan oglas
  - Sistem ne smije dozvoliti prijavu 
    bez popunjenog profila  
- **Očekivani sprint:** Sprint 9
---

## 14. Upload dokumentacije | PB10
- **Opis:** Kao student želim da upload-ujem dokumente (CV i motivaciono pismo)  
- **Poslovne vrijednosti:** Omogućava predstavljanje kvalifikacija  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Korisnik mora biti prijavljen  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenata)
  - Zavisi od 13(Prijava na praksu)
- **Acceptance criteria:**
  - Sistem mora omogućiti upload CV-a 
    i motivacionog pisma u PDF formatu
  - Kada student uspješno uploada dokumente, 
    treba dobiti potvrdu o uploadu
  - Sistem mora učiniti dokumente vidljivim 
    kompaniji nakon prijave
  - Sistem ne smije dozvoliti upload fajla 
    koji nije PDF format
- **Očekivani sprint:** Sprint 9
---

## 15. Pregled prijava na praksu | PB11
- **Opis:** Kao kompanija želim da pregledam listu prijavljenih studenata  
- **Poslovne vrijednosti:** Olakšava selekciju kandidata  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti prijavljena  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 i 13  
- **Acceptance criteria:**
  - Sistem mora omogućiti kompaniji pregled 
    svih prijavljenih studenata po oglasu
  - Sistem mora prikazati osnovne informacije 
    o svakom kandidatu: ime, prezime, odsjek, godina studija
  - Sistem mora omogućiti pregled uploadovanih 
    dokumenata svakog kandidata
  - Sistem ne smije dozvoliti pregled prijava 
    na tuđe oglase  
- **Očekivani sprint:** Sprint 9
---

## 16. Selekcija kandidata | PB12
- **Opis:** Kao kompanija želim da evidentiram uži krug kandidata  
- **Poslovne vrijednosti:** Efikasniji proces selekcije  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti prijavljena  
  - Oglas mora biti aktivan  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 6 i 13  
- **Acceptance criteria:**
  - Sistem mora omogućiti kompaniji označavanje 
    kandidata koji prolaze u uži krug
  - Kada kompanija selektuje kandidata, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave  
- **Očekivani sprint:** Sprint 9
---

## 17. Odobravanje prakse | PB13
- **Opis:** Kao koordinator, želim da odobrim studentsku prijavu za praksu
- **Poslovne vrijednosti:** Omogućava koordinatoru upravljanje studentskim praksama
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 15
- **Acceptance criteria:** 
  - Sistem mora omogućiti koordinatoru odobravanje
    studentskih prijava na praksi
  - Kada koordinator odobri praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave
- **Očekivani sprint:** Sprint 9
---

## 18. Odbijanje prakse | PB13
- **Opis:** Kao koordinator, želim da odbijem studentsku prijavu za praksu
- **Poslovne vrijednosti:** Omogućava koordinatoru upravljanje studentskim praksama
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Koordinator je uposlenik fakulteta  
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 8 i 15
- **Acceptance criteria:** 
  - Sistem mora omogućiti koordinatoru odbijanje
    studentskih prijava na praksi
  - Kada koordinator odobri praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti studenta 
    o promjeni statusa njegove prijave
- **Očekivani sprint:** Sprint 10  
---

## 19. Potvrda studenta | PB14
- **Opis:** Kao student, želim da potvrdim učešće na prijavu za praksu
- **Poslovne vrijednosti:** Omogućava studentu prihvatanje odobrene studentske prakse
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Oglas mora biti aktivan 
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 13 i 17
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu prihvatanje
    učešća na odobrenoj praksi
  - Kada student prihvati praksu, 
    sistem mora ažurirati status prijave
  - Sistem mora obavijestiti kompaniju i koordinatora 
    o promjeni statusa njegove prijave
- **Očekivani sprint:** Sprint 10
---

## 20. Dizajn baze podataka | PB15
- **Opis:** Osmisliti šemu baze podataka sistema
- **Poslovne vrijednosti:** Omogućava lakšu implementaciju baze podataka
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:** 
- **Veza sa drugim storijima ili zavisnostima:** 
- **Acceptance criteria:** 
  - Dizajn mora obuhvatati glavne entite sistema:
    koordinatore, studente, kompanije, prakse
  - Dizajn treba uspostaviti relacije između
    entiteta
  - Dizajn treba čuvati sve neophodne podatke o 
    entitetima
- **Očekivani sprint:** Sprint 5
---

## 21. Implementacija baze podataka | PB15
- **Opis:** Implementirati bazu podataka sistema
- **Poslovne vrijednosti:** Omogućava lakše upravljanje i pohranjivanje podataka neophodnih za rad sistema
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Osmišljen je dizajn baze podataka
  - Koju bazu podataka koristiti?
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 20
- **Acceptance criteria:** 
  - Sistem mora omogućiti skladištenje podataka 
    u bazi
- **Očekivani sprint:** Sprint 5
---

## 22. Generisanje ugovora | PB17
- **Opis:** Sistem generiše ugovor o praksi za studenta
- **Poslovne vrijednosti:** Omogućava automatsko generisanje ugovora koji pravno reguliše praksu studenta kod kompanije
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potvrdio praksu
  - Kompanija je saglasna sa prijavom
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16 i 19
- **Acceptance criteria:** 
  - Sistem mora omogućiti generisanje ugovora o praksi
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u ugovor
- **Očekivani sprint:** Sprint 10
---

## 23. Preuzimanje ugovora | PB18
- **Opis:** Student može preuzeti digitalni primjerak ugovora o praksi
- **Poslovne vrijednosti:** Omogućava studentu pregled ugovora o praksi
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potvrdio praksu
  - Kompanija je saglasna sa prijavom
  - Ugovor je generisan
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16, 19, 22
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u ugovor
  - Sistem mora omogućiti studentu preuzimanje
    digitalne kopije ugovora
- **Očekivani sprint:** Sprint 10
---

## 24. Evidencija aktivnosti | PB19
- **Opis:** Student unosi dnevne/sedmične aktivnosti na praksi
- **Poslovne vrijednosti:** Omogućava evidentiranje i praćenje aktivnosti studenta na praksi
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
  - Studentska praksa je u toku
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 16 i 19
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu 
    evidentiranje aktivnosti na praksi
  - Sistem mora omogućiti pregled 
    evidentiranih aktivnosti kompaniji i koordinatoru
- **Očekivani sprint:** Sprint 10
---

## 25. Praćenje prisustva | PB20
- **Opis:** Kompanija evidentira prisustvo studenta na praksi
- **Poslovne vrijednosti:** Kompanija može pratiti prisustvo studenta
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
  - Studentska praksa je u toku
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 24
- **Acceptance criteria:** 
  - Sistem mora omogućiti evidentiranje prisustva
  - Sistem mora omogućiti studentu 
    i kompaniji uvid u prisustvo studenta
- **Očekivani sprint:** Sprint 10
---

## 26. Evaluacija studenta | PB21
- **Opis:** Kompanija evaluira rad studenta na osnovu definisanih kriterija
- **Poslovne vrijednosti:** Kompanija može evaluirati rad studenta na praksi dajući uvid u njegovo zalaganje i trud. Student može dobiti feedback za svoj rad.
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 24
- **Acceptance criteria:** 
  - Sistem mora omogućiti evaluaciju studenta 
    na kraju prakse kroz predefinisani formular
  - Sistem mora omogućiti studentu 
    pregled evaluacije studenta
- **Očekivani sprint:** Sprint 10
---

## 27. Evaluacija kompanije | PB22
- **Opis:** Student evaluira kompaniju u kojoj je odradio praksu
- **Poslovne vrijednosti:** Student može iznijeti mišljenje o kompaniji kod koje je radio praksu. Kompanija može vidjeti dojam studenta o praksi, te izvršiti korekcije po potrebi.
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - 
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu evaluaciju
    kompanije kroz predefinisani formular
  - Sistem mora omogućiti kompaniji
    pregled evaluacije kompanije
- **Očekivani sprint:** Sprint 10
---

## 28. Izvještaji | PB23
- **Opis:** Kompanija generiše izvještaj o praksi
- **Poslovne vrijednosti:** Kompanija može generisati izvještaj o praksi koji služi studentu kao dokaz o pohađanju prakse
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je potpisao važeći ugovor o praksi
- **Veza sa drugim storijima ili zavisnostima:** 
  - 25, 26
- **Acceptance criteria:** 
  - Sistem mora omogućiti studentu evaluaciju
- **Očekivani sprint:** Sprint 10
---

## 29. Analiza postojećih rješenja | PB24
- **Opis:** Istražiti postojeća sisteme za upravljanje praksama
- **Poslovne vrijednosti:**  Vidjeti šta nedostaje drugim sistemima, a šta je dobro za implementirati
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
- **Veza sa drugim storijima ili zavisnostima:** 
- **Acceptance criteria:**  
- **Očekivani sprint:** Sprint 5
---

## 30. Dokumentacija sistema | PB25
- **Opis:** Dokumentovati fukncionalnosti i strukturu sistema
- **Poslovne vrijednosti:** Dokumentacija omogućava struktuirani pregled sistema
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Dokumentacija se aktivno održava
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od svih stavki
- **Acceptance criteria:** 
  - Promjene moraju biti redovno dokumentovane
  - Dokumentacija omogućava pregled dizajna 
    i plana rada na sistemu
- **Očekivani sprint:** Sprint 5
---


## 31. Zatvaranje oglasa | PB6
- **Opis:** Kao kompanija želim zatvoriti oglas za praksu koji sam prethodno objavila
- **Poslovne vrijednosti:** Oglas za praksu se zatvara kako ne bi pristizale nove prijave
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Oglas je prethodno objavljen
- **Veza sa drugim storijima ili zavisnostima:** 
  - Zavisi od 10, 12, 13
- **Acceptance criteria:** 
  - Na zatvoreni oglas se ne može više prijavljivati
  - Zatvoreni oglas se ne pojavljuje u listi aktivnih oglasa
- **Očekivani sprint:** Sprint 9
---


## 32. Uređivanje oglasa | PB26
- **Opis:** Kao kompanija, želim da izmijenim postojeći oglas kako bih ispravila greške ili ažurirala informacije (npr. datum, broj mjesta, uslove)
- **Poslovne vrijednosti:** Omogućava kompaniji održavanje oglasa ažurnim bez potrebe brisanja i ponovnog kreiranja
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Oglas je prethodno kreiran i aktivan
  - Da li izmjena oglasa obavještava studente koji su već prijavljeni?
  - Da li je moguće urediti oglas nakon što su pristigle prijave?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 10 (Kreiranje oglasa)
- **Acceptance criteria:**
  - Sistem mora omogućiti izmjenu podataka oglasa: naziv, opis, trajanje, broj mjesta, uslovi, datum
  - Kada kompanija uspješno izmijeni oglas, sistem mora sačuvati promjene i prikazati ažurirane podatke
  - Korisnik treba dobiti potvrdu o uspješnom ažuriranju oglasa
  - Sistem ne smije dozvoliti uređivanje zatvorenog oglasa
  - Sistem ne smije dozvoliti uređivanje oglasa bez popunjenih obaveznih polja
- **Očekivani sprint:** Sprint 8
---


## 33. Odustajanje od prakse | PB27
- **Opis:** Kao student, želim da odustanem od prijavljene ili odobrene prakse kako bih oslobodio mjesto za drugog kandidata
- **Poslovne vrijednosti:** Omogućava studentu fleksibilnost u upravljanju prijavam
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Student je prijavljen na praksu
  - Do kada student može odustati (prije ili nakon odobrenja)?
  - Da li odustajanje zahtijeva razlog ili potvrdu?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 9 (Prijava na praksu), 13 (Odobravanje prakse), 19 (Potvrda studenta)
- **Acceptance criteria:**
  - Sistem mora omogućiti studentu odustajanje od prakse u statusu "na čekanju" ili "odobrena"
  - Kada student odustane, sistem mora ažurirati status prijave
  - Sistem mora obavijestiti kompaniju i koordinatora o odustajanju studenta
  - Sistem ne smije dozvoliti odustajanje od prakse koja je već završena
- **Očekivani sprint:** Sprint 10
---


## 34. Obnavljanje lozinke | PB28
- **Opis:** Kao korisnik, želim da obnovim lozinku u slučaju zaboravljanja kako bih ponovo pristupio svom nalogu
- **Poslovne vrijednosti:** Osigurava kontinuiran pristup sistemu svim korisnicima bez potrebe za administratorskom intervencijom
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Korisnik posjeduje pristup registrovanom email nalogu
  - Koliko dugo reset link ostaje aktivan?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3 (Registracija korisnika), 4, 5, 6 (Prijava korisnika)
- **Acceptance criteria:**
  - Sistem mora omogućiti unos email adrese za slanje linka za resetovanje lozinke
  - Sistem mora poslati email sa reset linkom na registrovanu adresu
  - Reset link mora isteći nakon određenog vremenskog perioda (npr. 30 minuta)
  - Kada korisnik uspješno postavi novu lozinku, sistem ga mora preusmjeriti na stranicu za prijavu
  - Sistem ne smije otkriti da li email postoji u bazi u slučaju nepostojećeg emaila (sigurnost)
- **Očekivani sprint:** Sprint 6
---


## 35. Student dashboard | PB29
- **Opis:** Kao student, želim da imam centralizovani pregled svih svojih prijava na prakse, uključujući status svake prijave
- **Poslovne vrijednosti:** Studentu pruža jasan i brz uvid u stanje svih prijava na jednom mjestu, čime se poboljšava korisničko iskustvo
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Student je prijavljen u sistem
  - Koje sve informacije treba prikazati na dashboardu?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenta), 9 (Prijava na praksu)
- **Acceptance criteria:**
  - Sistem mora prikazati listu svih praksi na koje je student prijavljen
  - Sistem mora prikazati trenutni status svake prijave (npr. na čekanju, odobrena, odbijena, potvrđena)
  - Sistem mora omogućiti studentu brzi pristup detaljima svake prijave
  - Sistem mora prikazati obavještenja o nedavnim promjenama statusa
  - Sistem ne smije prikazivati prijave koje ne pripadaju prijavljenom studentu
- **Očekivani sprint:** Sprint 9
---


## 36. Filtriranje oglasa | PB30
- **Opis:** Kao student, želim da filtriram dostupne oglase po određenim kriterijima kako bih pronašao praksu koja odgovara mojim interesima i potrebama 
- **Poslovne vrijednosti:** Poboljšava korisničko iskustvo ubrzavanjem pretrage i smanjenjem irelevantnih rezultata
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Postoje oglasi objavljeni u sistemu
  - Koje kategorije filtriranja su prioritetne za implementaciju?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 7 (Pregled oglasa), 6 (Kreiranje oglasa)
- **Acceptance criteria:**
  - Sistem mora omogućiti filtriranje oglasa po oblasti zanimanja
  - Sistem mora omogućiti filtriranje po vrsti plaćanja (plaćena/neplaćena praksa)
  - Sistem mora omogućiti filtriranje po datumu objave i trajanju prakse
  - Sistem mora ažurirati listu oglasa u realnom vremenu pri primjeni filtera
  - Sistem mora omogućiti brisanje/resetovanje svih aktivnih filtera
- **Očekivani sprint:** Sprint 8
---


## 37. Notifikacije o statusu prakse | PB31
- **Opis:** Kao student, želim da primam notifikacije o svakoj promjeni statusa moje prijave na praksu kako bih bio pravovremeno obaviješten
- **Poslovne vrijednosti:** Smanjuje potrebu za manualnim praćenjem statusa i povećava angažovanost studenta u procesu
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Da li se notifikacije šalju putem emaila, unutar aplikacije, ili oboje?
  - Koje sve promjene statusa zahtijevaju notifikaciju?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 9 (Prijava na praksu), 13 (Odobravanje prakse), 35 (Student dashboard)
- **Acceptance criteria:**
  - Sistem mora poslati notifikaciju studentu kada kompanija promijeni status prijave (odobri, odbije, uvrsti u uži izbor)
  - Sistem mora poslati notifikaciju kada koordinator odobri ili odbije praksu
  - Sistem mora prikazati notifikacije unutar aplikacije na dashboardu studenta
  - Student mora moći vidjeti historiju svih primljenih notifikacija
  - Sistem ne smije slati duplikate notifikacija za istu promjenu statusa
- **Očekivani sprint:** Sprint 10
---


## 38. Verifikacija email adrese | PB32
- **Opis:** Kao novi korisnik, želim da primim email za verifikaciju računa kako bi sistem potvrdio moj identitet i aktivirao moj nalog
- **Poslovne vrijednosti:** Osigurava validnost korisničkih podataka i sprječava kreiranje lažnih naloga
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Korisnik je uspješno popunio formu za registraciju
  - Koliko dugo verifikacioni link ostaje aktivan?
  - Može li se verifikacioni email ponovo poslati?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3 (Registracija), direktno blokira 4, 5, 6 (Prijava)
- **Acceptance criteria:**
  - Sistem mora automatski poslati verifikacioni email odmah nakon registracije
  - Verifikacioni link mora isteći nakon određenog perioda (npr. 24 sata)
  - Kada korisnik klikne validni link, sistem mora aktivirati nalog i preusmjeriti ga na prijavu
  - Sistem mora onemogućiti prijavu na nalog koji nije verifikovan
  - Sistem mora omogućiti korisniku ponovno slanje verifikacionog emaila u slučaju da nije primljen
- **Očekivani sprint:** Sprint 6
---


## 39. Pretraživanje oglasa | PB30
- **Opis:** Kao student, želim da pretražujem oglase po ključnoj riječi kako bih brzo pronašao relevantne prakse
- **Poslovne vrijednosti:** Dopunjuje filtriranje i ubrzava pronalazak oglasa po specifičnim pojmovima
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Postoje oglasi objavljeni u sistemu
  - Da li pretraga obuhvata naziv, opis ili oboje?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 7 (Pregled oglasa), 36 (Filtriranje oglasa)
- **Acceptance criteria:**
  - Sistem mora omogućiti unos ključne riječi u polje za pretragu
  - Sistem mora prikazati sve oglase čiji naziv ili opis sadrži unesenu ključnu riječ
  - Sistem mora prikazati poruku ako nema rezultata za datu pretragu
- **Očekivani sprint:** Sprint 8
---


## 40. Deaktivacija/brisanje korisničkog računa | PB33
- **Opis:** Kao korisnik, želim da deaktiviram ili obrišem svoj nalog u sistemu
- **Poslovne vrijednosti:** Korisnicima daje kontrolu nad svojim podacima i nalogom
- **Prioritet:** Low
- **Pretpostavke i otvorena pitanja:**
  - Šta se dešava s aktivnim prijavama pri brisanju naloga?
  - Da li brisanje naloga zahtijeva administratorsko odobrenje?
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 5, 6 (Prijava korisnika), 9 (Pristup administratora)
- **Acceptance criteria:**
  - Sistem mora tražiti potvrdu od korisnika prije deaktivacije/brisanja naloga
  - Sistem mora onemogućiti prijavu na deaktiviran nalog
  - Sistem mora obavijestiti kompaniju ili koordinatora ako student s aktivnim prijavama obriše nalog
  - Administrator mora moći reaktivirati deaktiviran nalog
- **Očekivani sprint:** Sprint 7
---


  ## 41. Početna stranica (Landing page) | PB34
- **Opis:** Kao posjetilac, želim da vidim informativnu početnu stranicu sa opisom sistema i opcijama za registraciju i prijavu kako bih razumio svrhu platforme  
- **Poslovne vrijednosti:** Pruža prvi dojam o sistemu i usmjerava korisnike ka registraciji ili prijavi  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Korisnik nije prijavljen u sistem  
  - Koje informacije prikazati na landing pageu?  
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 1, 2, 3 (Registracija), 4, 5, 6 (Prijava)  
- **Acceptance criteria:**
  - Sistem mora prikazati kratki opis platforme 
    i njene svrhe
  - Sistem mora prikazati dugmad/linkove 
    za registraciju i prijavu
  - Stranica mora biti vidljiva svim posjetiocima 
    bez prijave
  - Sistem mora preusmjeriti već prijavljenog korisnika 
    na odgovarajući dashboard
  - Stranica ne smije prikazivati zaštićeni sadržaj 
    neprijavljenim korisnicima
- **Očekivani sprint:** Sprint 5
---

## 42. Navigacija | PB35
- **Opis:** Kao korisnik, želim jasnu i prilagođenu navigaciju ovisno o mojoj roli kako bih se lako kretao kroz sistem  
- **Poslovne vrijednosti:** Poboljšava korisničko iskustvo i omogućava brz pristup funkcionalnostima specifičnim za svaku rolu  
- **Prioritet:** High  
- **Pretpostavke i otvorena pitanja:**
  - Korisnik je prijavljen u sistem  
  - Koje stavke navigacije su potrebne za svaku rolu?  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4, 5, 6 (Prijava korisnika)  
  - Vezano za 35 (Student dashboard), 9 (Pristup administratora), 8 (Pristup koordinatora)  
- **Acceptance criteria:**
  - Sistem mora prikazati navigaciju prilagođenu roli korisnika 
    (student, kompanija, koordinator, admin)
  - Navigacija mora sadržavati brze linkove ka svim 
    glavnim funkcionalnostima date role
  - Sistem mora prikazati opciju za odjavu 
    u navigaciji
  - Navigacija mora biti vidljiva na svim stranicama 
    nakon prijave
  - Sistem ne smije prikazivati stavke navigacije 
    koje korisnik nema pravo koristiti
- **Očekivani sprint:** Sprint 7
---

## 43. Pregled profila kompanije | PB4
- **Opis:** Kao student, želim da vidim detalje o kompaniji prije prijave na praksu kako bih donio informisanu odluku o prijavljivanju  
- **Poslovne vrijednosti:** Student ima dublji uvid u kompaniju što povećava kvalitet prijava i smanjuje broj odustajanja od prakse  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Student mora biti prijavljen  
  - Koje informacije o kompaniji su vidljive studentu?  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 4 (Prijava studenta)  
  - Vezano za 12 (Pregled detalja oglasa)  
  - Vezano za 3 (Registracija kompanije)  
- **Acceptance criteria:**
  - Sistem mora prikazati osnovne informacije o kompaniji: 
    naziv, opis, adresa, djelatnost, kontakt osoba
  - Sistem mora prikazati listu aktivnih oglasa 
    te kompanije
  - Korisnik mora moći pristupiti profilu kompanije 
    direktno sa stranice oglasa
  - Sistem ne smije prikazivati profil 
    neodobrene kompanije
  - Sistem ne smije dozvoliti pregled profila 
    kompanije bez aktivne prijave u sistem
- **Očekivani sprint:** Sprint 8
---

## 44. Pregled korisničkog profila | PB36
- **Opis:** Kao korisnik, želim da vidim detalje o svom profilu kako bih imao uvid u moje pohranjene podatke.
- **Poslovne vrijednosti:** Korisnik može da vidi svoje lične informacije i u slučaju greške da traži izmjenu, ili da bude saglasan sa njima.
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
  - Korisnik mora biti prijavljen  
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 3 (Profil studenta)
  - Vezano za 4 (Profil kompanije)  
  - Zavisi od 1 (Registracija korisnika)  
- **Acceptance criteria:**
  - Sistem mora prikazati osnovne informacije o korisniku: 
    ime/naziv, adresa, email, i ostale specifične informacije
  - Sistem mora prikazati na ovoj stranici i mogućnost 
    izmjene određenih korisničkih podataka
  - Korisnik mora moći pristupiti profilu sa glavne stranice
  - Sistem ne smije prikazivati profil 
    neprijavljenom korisniku
- **Očekivani sprint:** Sprint 7
---

## 45. Uređivanje profila kompanije | PB39
- **Opis:** Kao kompanija, želim da vidim svoje pohranjene podatke koje sam unijela.
- **Poslovne vrijednosti:** Kompanija ima uvid u javno dostupnim informacijama o sebi, te u slučaju nesaglasnosti promijeniti iste, ili ostaviti kao takve.  
- **Prioritet:** Medium  
- **Pretpostavke i otvorena pitanja:**
  - Kompanija mora biti prijavljena
- **Veza sa drugim storijima ili zavisnostima:**
  - Vezano za 44 (Pregled korisničkog profila)
  - Zavisi od 3 (Registracija kompanije)  
- **Acceptance criteria:**
  - Sistem mora omogućiti izmjenu informacija na
    profilu kompanije
  - Kompanija mora moći pristupiti uređivanju sa
    profilne stranice kompanije
  - Sistem ne smije omogućiti uređivanje profila
    neprijavljenoj kompaniji
- **Očekivani sprint:** Sprint 7
---

## 46. Privacy policy & User Terms stranica | PB37
- **Opis:** Kao korisnik, želim da vidim Uslove korištenja stranice kao i politiku privatnosti.
- **Poslovne vrijednosti:** Korisnik zna koji su uslovi korištenja i donosi svjesnu odluku da je saglasan sa istim tako što nastavlja koristiti sistem.
- **Prioritet:** Low
- **Pretpostavke i otvorena pitanja:**
  
- **Veza sa drugim storijima ili zavisnostima:**
  
- **Acceptance criteria:**
  - Sistem mora prikazati politiku privatnosti
    i uslove korištenja korisniku
  - Sistem mora omogućiti prikaz ovih stavki i
    neprijavljenom korisniku
  - Sistem mora omogućiti jednostavnu navigaciju
    do ovih stavki
- **Očekivani sprint:** Sprint 5
---

## 47. Tamni režim rada | PB38
- **Opis:** Kao korisnik, želim da mogu promijeniti temu stranice.
- **Poslovne vrijednosti:** Korisnik može koristiti svjetlu ili tamnu temu stranice, što omogućava ugodnije korištenje iste
- **Prioritet:** Low
- **Pretpostavke i otvorena pitanja:**
  
- **Veza sa drugim storijima ili zavisnostima:**
  
- **Acceptance criteria:**
  - Sistem može prikazati sadržaj u svjetloj 
    kao i u tamnoj temi
  - Sistem mora omogućiti intuitivnu izmjenu teme
  - Sistem mora omogućiti jednostavan 
    pronalazak ove mogućnosti
- **Očekivani sprint:** Sprint 5
---

## 48. Favoriziranje oglasa | PB39
- **Opis:** Kao student, želim da označim oglase kao omiljene kako bih ih kasnije lakše pronašao
- **Poslovne vrijednosti:** Omogućava studentu organizaciju i lakši pristup interesantnim praksama
- **Prioritet:** Low
- **Pretpostavke i otvorena pitanja:**
    - Student je prijavljen u sistem
- **Veza sa drugim storijima ili zavisnostima:**
    - Zavisi od 4 (Prijava studenta), 11 (Pregled oglasa)
**Acceptance criteria:**
   - Sistem mora omogućiti studentu označavanje oglasa kao omiljenog
   - Sistem mora omogućiti pregled liste omiljenih oglasa
   - Sistem mora omogućiti uklanjanje oglasa iz omiljenih
   - Sistem ne smije prikazivati tuđe omiljene oglase
- **Očekivani sprint:** Sprint 8
---

## 49. Arhiviranje oglasa | PB40
- **Opis:** Kao kompanija, želim da arhiviram stare oglase kako bih zadržala evidenciju bez prikazivanja studentima
- **Poslovne vrijednosti:** Omogućava bolju organizaciju i historiju oglasa bez zatrpavanja aktivnih
- **Prioritet:** Low
- **Pretpostavke i otvorena pitanja:**
    - Oglas je prethodno zatvoren
- **Veza sa drugim storijima ili zavisnostima:**
    - Zavisi od 31 (Zatvaranje oglasa)
- **Acceptance criteria:**
    - Sistem mora omogućiti arhiviranje zatvorenog oglasa
    - Arhivirani oglasi se ne smiju prikazivati studentima
    - Sistem mora omogućiti kompaniji pregled arhiviranih oglasa
    - Sistem mora omogućiti vraćanje oglasa iz arhive
- **Očekivani sprint:** Sprint 9
---

## 50. Pregled statistike prijava | PB41
- **Opis:** Kao kompanija, želim da vidim statistiku prijava na oglas kako bih bolje razumjela interes studenata
- **Poslovne vrijednosti:** Omogućava donošenje boljih odluka za buduće oglase
- **Prioritet:** Medium
- **Pretpostavke i otvorena pitanja:**
    - Postoje prijave na oglas
- **Veza sa drugim storijima ili zavisnostima:**
    - Zavisi od 15 (Pregled prijava), 13 (Prijava na praksu)
- **Acceptance criteria:**
    - Sistem mora prikazati broj prijava po oglasu
    - Sistem mora prikazati osnovne statistike (npr. po odsjeku, godini studija)
    - Sistem mora omogućiti filtriranje statistike
    - Sistem ne smije prikazivati statistiku za oglase koji ne pripadaju kompaniji
- **Očekivani sprint:** Sprint 9

---
## 51. Historija aktivnosti (Audit log) | PB15

- **Opis:** Kao administrator, želim imati uvid u historiju svih ključnih akcija u sistemu  
- **Poslovne vrijednosti:** Omogućava sigurnost, pravnu validnost i praćenje zloupotreba  
- **Prioritet:** High  

- **Acceptance criteria:**
- Sistem mora bilježiti:
  - Registracije  
  - Promjene statusa prijava  
  - Brisanje naloga  
  - Uređivanje oglasa  
  - Odustajanje od prakse  
- Svaki zapis mora sadržavati:
  - korisnika  
  - vrijeme  
  - tip akcije  
- Samo administrator može pregledati audit log  
- **Očekivani sprint:** Sprint 9
---

## 52. Upravljanje rokovima prijave | PB6

- **Opis:** Kao kompanija, želim definisati rok za prijavu na oglas  
- **Poslovne vrijednosti:** Omogućava automatsko zatvaranje prijava  
- **Prioritet:** High  

- **Acceptance criteria:**
  - Kompanija mora unijeti rok prijave  
  - Sistem mora automatski zatvoriti oglas nakon isteka roka  
  - Sistem ne smije dozvoliti prijavu nakon isteka roka  
  - Sistem mora prikazati jasan datum isteka roka  
- **Očekivani sprint:** Sprint 8
---

## 53. Ograničenje broja prijava po studentu | PB9

- **Opis:** Kao fakultet, želim ograničiti broj aktivnih prijava po studentu  
- **Poslovne vrijednosti:** Sprječava masovno prijavljivanje bez stvarne namjere  
- **Prioritet:** Medium  

- **Acceptance criteria:**
- Administrator može definisati maksimalan broj aktivnih prijava  
- Sistem ne smije dozvoliti prijavu iznad definisanog limita  
- Student mora dobiti jasnu poruku o prekoračenju limita  
- **Očekivani sprint:** Sprint 9
---

## 54. Automatsko završavanje prakse | PB19

- **Opis:** Kao sistem, želim automatski označiti praksu završenom nakon isteka trajanja  
- **Poslovne vrijednosti:** Automatizacija administrativnih procesa  
- **Prioritet:** Medium  

- **Acceptance criteria:**
- Sistem mora pratiti datum početka i trajanje prakse  
- Po isteku trajanja status prelazi u "Završena"  
- Sistem mora obavijestiti studenta i kompaniju  
- **Očekivani sprint:** Sprint 10
---

  ## 55. Podešavanje tipova notifikacija | PB31
- **Opis:** Kao korisnik želim da odaberem koje vrste notifikacija primam kako bih primao samo relevantne obavijesti  
- **Poslovne vrijednosti:** Smanjuje nepotrebne notifikacije i poboljšava korisničko iskustvo  
- **Prioritet:** Low  
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 37 
- **Acceptance criteria:**
  - Sistem mora omogućiti korisniku izbor tipova notifikacija  
  - Sistem mora slati samo odabrane notifikacije  
  - Sistem mora zapamtiti korisničke postavke  
  - Promjene moraju biti odmah primijenjene  
- **Očekivani sprint:** Sprint 9
---

## 56. Oznaka "Novo" na oglasima | PB7
- **Opis:** Kao student želim da vidim koji su oglasi novododani kako bih lakše pronašao najnovije prakse  
- **Poslovne vrijednosti:** Poboljšava preglednost i omogućava brže pronalaženje novih oglasa  
- **Prioritet:** Low    
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 11
- **Acceptance criteria:**
  - Sistem mora označiti oglas kao "Novo" ako je objavljen u definisanom vremenskom periodu  
  - Oznaka se mora automatski ukloniti nakon isteka perioda  
  - Oznaka mora biti vidljiva na listi oglasa  
- **Očekivani sprint:** Sprint 8
---

## 57. Pregled zatvorenih oglasa | PB7
- **Opis:** Kao student želim da vidim zatvorene oglase kako bih razumio zahtjeve kompanija i bolje se pripremio za buduće prijave  
- **Poslovne vrijednosti:** Pomaže studentima u pripremi i povećava kvalitet prijava  
- **Prioritet:** Low   
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 31
  - U vezi sa 11 
- **Acceptance criteria:**
  - Sistem mora omogućiti prikaz zatvorenih oglasa  
  - Zatvoreni oglasi moraju biti jasno označeni  
  - Sistem ne smije dozvoliti prijavu na zatvorene oglase  
  - Sistem mora omogućiti pregled detalja zatvorenog oglasa
- **Očekivani sprint:** Sprint 9
---

## 58. Odobravanje korisničkog računa | PB5
- **Opis:** Kao administrator/koordinator, želim pregledati zahtjev 
  za registraciju, verificirati identitet korisnika i dodijeliti mu 
  odgovarajuću rolu kako bih osigurao da samo ovlašteni korisnici 
  pristupaju sistemu
- **Poslovne vrijednosti:** Osigurava kontrolisan pristup sistemu, 
  verificira identitet korisnika i uspostavlja ispravne role 
  prije aktivacije računa
- **Prioritet:** High
- **Pretpostavke i otvorena pitanja:**
  - Korisnik je završio registraciju i verifikovao email adresu
- **Veza sa drugim storijima ili zavisnostima:**
  - Zavisi od 1, 2, 3 (Registracija korisnika)
  - Zavisi od 38 (Verifikacija email adrese)
  - Vezano za 9 (Pristup administratora), 8 (Pristup koordinatora)
- **Acceptance criteria:**
  - Sistem mora obavijestiti koordinatora/administratora o novom 
    zahtjevu za odobravanje nakon verifikacije emaila
  - Koordinator/administrator mora moći pregledati podatke korisnika 
    i verificirati njegov identitet
  - Sistem mora dodijeliti odgovarajuću rolu korisniku 
    tek nakon odobrenja (student, kompanija, koordinator)
  - U slučaju odbijanja, sistem mora tražiti unos razloga odbijanja
  - Sistem mora obavijestiti korisnika o ishodu zahtjeva 
    (odobreno/odbijeno) i dodijeljenoj roli
  - Sistem ne smije dozvoliti prijavu korisniku čiji račun nije odobren
  - Sistem mora automatski podsjetiti koordinatora/administratora 
    ako zahtjev čeka odobrenje duže od definisanog perioda
- **Očekivani sprint:** Sprint 6
---

## Raspored user storija po sprintovima

| Sprint | User Stories |
|--------|-------------|
| **Sprint 5** | 29. Analiza postojećih rješenja, 20. Dizajn baze podataka, 21. Implementacija baze podataka, 30. Dokumentacija sistema, 9. Pristup administratora, 41. Početna stranica (Landing page), 46. Privacy policy & User Terms stranica, 47. Tamni režim rada |
| **Sprint 6** | 1. Registracija studenta, 2. Registracija koordinatora fakulteta, 3. Registracija kompanije, 4. Prijava studenata, 5. Prijava koordinatora, 6. Prijava kompanija, 34. Obnavljanje lozinke, 38. Verifikacija email adrese, 58. Odobravanje korisničkog računa |
| **Sprint 7** | 7. Uređivanje profila studenta, 8. Pristup koordinatora, 10. Kreiranje oglasa, 11. Pregled oglasa, 40. Deaktivacija/brisanje korisničkog računa, 42. Navigacija, 44. Pregled korisničkog profila, 45. Uređivanje profila kompanije |
| **Sprint 8** | 12. Pregled detalja oglasa, 32. Uređivanje oglasa, 36. Filtriranje oglasa, 39. Pretraživanje oglasa, 43. Pregled profila kompanije, 48. Favoriziranje oglasa, 52. Upravljanje rokovima prijave, 56. Oznaka "Novo" na oglasima |
| **Sprint 9** | 13. Prijava na praksu, 14. Upload dokumentacije, 15. Pregled prijava na praksu, 16. Selekcija kandidata, 17. Odobravanje prakse, 31. Zatvaranje oglasa, 35. Student dashboard, 49. Arhiviranje oglasa, 50. Pregled statistike prijava, 51. Historija aktivnosti (Audit log), 53. Ograničenje broja prijava po studentu, 55. Podešavanje tipova notifikacija, 57. Pregled zatvorenih oglasa |
| **Sprint 10** | 18. Odbijanje prakse, 19. Potvrda studenta, 22. Generisanje ugovora, 23. Preuzimanje ugovora, 24. Evidencija aktivnosti, 25. Praćenje prisustva, 26. Evaluacija studenta, 27. Evaluacija kompanije, 28. Izvještaji, 33. Odustajanje od prakse, 37. Notifikacije o statusu prakse, 54. Automatsko završavanje prakse |