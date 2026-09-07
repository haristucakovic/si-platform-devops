# Use Case Model – Sistem za upravljanje studentskim praksama

---

## UC-01: Registracija korisnika

**Akter:** Neregistrovani korisnik (student ili kompanija)

**Kratak opis:** Korisnik kreira novi nalog unosom email adrese i lozinke, nakon čega sistem šalje verifikacioni email. Račun postaje aktivan tek nakon verifikacije email adrese i odobrenja od strane koordinatora (za studente) ili administratora (za kompanije).

**Preduslovi:**
- Korisnik nije prijavljen na sistem.
- Korisnik ima važeću email adresu.

**Glavni tok:**
1. Korisnik odabire opciju "Registracija" na početnoj stranici
2. Sistem prikazuje registracijski formular
3. Korisnik unosi email adresu, lozinku i potvrdu lozinke
4. Korisnik odabire tip računa (student/kompanija)
5. Korisnik potvrđuje unos
6. Sistem validira unesene podatke (format emaila, podudaranje lozinki, jedinstvenost emaila)
7. Sistem kreira novi korisnički račun sa statusom "Neaktivan"
8. Sistem šalje verifikacioni email na unesenu adresu
9. Korisnik otvara email i klikće na verifikacioni link
10. Sistem aktivira email verifikaciju i mijenja status računa u "Na čekanju odobrenja"
11. Sistem prosljeđuje zahtjev za odobravanje odgovarajućoj osobi (koordinatoru za studente, administratoru za kompanije) - UC-20
12. Sistem obavještava korisnika da je zahtjev poslan i da čeka odobrenje

**Alternativni tokovi:**
- *A1 - Email već postoji:* U koraku 6, sistem obavještava korisnika da račun s tom email adresom već postoji i vraća ga na formular.
- *A2 - Lozinke se ne poklapaju:* U koraku 6, sistem označava grešku i traži ponovni unos.
- *A3 - Email nije verifikovan:* Korisnik ne klikne na verifikacioni link - račun ostaje neaktivan. Sistem može ponuditi slanje novog linka.

**Ishod:** Korisnički račun je kreiran i čeka odobrenje. Korisnik je obaviješten o statusu zahtjeva.

---

## UC-02: Prijava korisnika

**Akter:** Registrovani korisnik (student, kompanija, koordinator, administrator)

**Kratak opis:** Korisnik se prijavljuje na sistem unosom email adrese i lozinke.

**Preduslovi:**
- Korisnik ima registrovan, verifikovan i odobren nalog.
- Korisnik nije trenutno prijavljen.

**Glavni tok:**
1. Korisnik otvara stranicu za prijavu
2. Korisnik unosi email adresu i lozinku
3. Korisnik potvrđuje prijavu
4. Sistem provjerava ispravnost unesenih podataka
5. Sistem identificira rolu korisnika (student/kompanija/koordinator/administrator)
6. Sistem preusmjerava korisnika na odgovarajući dashboard prema roli

**Alternativni tokovi:**
- *A1 - Pogrešni podaci:* U koraku 4, sistem obavještava korisnika o neispravnim podacima.
- *A2 - Nalog nije verifikovan ili odobren:* Sistem obavještava korisnika o trenutnom statusu računa.
- *A3 - Zaboravljena lozinka:* Korisnik odabire opciju za obnavljanje lozinke i pokreće UC-03.

**Ishod:** Korisnik je uspješno prijavljen i preusmjeren na odgovarajući dashboard.

---

## UC-03: Obnavljanje lozinke

**Akter:** Registrovani korisnik

**Kratak opis:** Korisnik resetuje lozinku putem linka poslanog na email adresu.

**Preduslovi:**
- Korisnik ima registrovan nalog.
- Korisnik ima pristup svom email inbox-u.

**Glavni tok:**
1. Korisnik odabire opciju za obnavljanje lozinke na stranici za prijavu
2. Sistem prikazuje formular za unos email adrese
3. Korisnik unosi email adresu i potvrđuje
4. Sistem generira jedinstveni reset link s ograničenim rokom trajanja i šalje ga na unesenu adresu; sistem prikazuje istu poruku o slanju bez obzira postoji li nalog s tim emailom (iz sigurnosnih razloga)
5. Korisnik otvara email i klikće na link
6. Sistem provjerava valjanost linka (rok trajanja, jednokratnost)
7. Sistem prikazuje formular za unos nove lozinke
8. Korisnik unosi i potvrđuje novu lozinku
9. Sistem sprema novu lozinku i poništava iskorišteni reset link

**Alternativni tokovi:**
- *A1 - Link je istekao:* U koraku 6, sistem obavještava korisnika da link više nije validan i nudi slanje novog.
- *A2 - Link je već iskorišten:* U koraku 6, sistem odbija zahtjev i nudi slanje novog linka.

**Ishod:** Lozinka je uspješno promijenjena. Korisnik se može prijaviti s novom lozinkom.

---

## UC-04: Kreiranje oglasa za praksu

**Akter:** Kompanija

**Kratak opis:** Predstavnik kompanije kreira novi oglas za studentsku praksu s opisom, trajanjem, brojem mjesta i uslovima.

**Preduslovi:**
- Korisnik je prijavljen kao kompanija.
- Profil kompanije je popunjen.

**Glavni tok:**
1. Kompanija odabire opciju za kreiranje novog oglasa na dashboardu
2. Sistem prikazuje formular za kreiranje oglasa
3. Kompanija unosi naziv pozicije, opis prakse, uslove (tražene vještine), trajanje, rok za prijave i broj mjesta koja će biti popunjena
4. Kompanija potvrđuje kreiranje oglasa
5. Sistem validira unesene podatke
6. Sistem sprema oglas i dodjeljuje mu status "Aktivan"
7. Oglas postaje vidljiv studentima u listi dostupnih praksi

**Alternativni tokovi:**
- *A1 - Nepotpuni podaci:* U koraku 5, sistem označava obavezna polja koja nisu popunjena i ne dozvoljava objavu.
- *A2 - Kompanija sprema nacrt (draft):* Kompanija odabire opciju za spremanje nacrta - oglas se sprema sa statusom "Nacrt" i nije vidljiv studentima dok ga kompanija ne odluči objaviti.

**Ishod:** Oglas je objavljen i dostupan studentima za pregled i prijavu.

---

## UC-05: Prijava studenta na praksu

**Akter:** Student

**Kratak opis:** Student se prijavljuje na odabrani oglas za praksu i prilaže potrebnu dokumentaciju.

**Preduslovi:**
- Student je prijavljen na sistem.
- Student ima popunjen profil.
- Oglas je aktivan i otvoren za prijave.

**Glavni tok:**
1. Student pretražuje ili filtrira listu dostupnih oglasa (UC-10)
2. Student otvara detalje odabranog oglasa
3. Student odabire opciju za prijavu
4. Sistem prikazuje formular za prijavu
5. Student uploaduje CV i motivaciono pismo
6. Student potvrđuje prijavu
7. Sistem registruje prijavu i dodjeljuje joj status "Na čekanju"
8. Sistem šalje notifikaciju kompaniji o novoj prijavi
9. Sistem prikazuje studentu potvrdu o uspješnoj prijavi na stranici i šalje email potvrdu

**Alternativni tokovi:**
- *A1 - Student već prijavljen:* U koraku 3, sistem obavještava studenta da je već prijavljen na taj oglas.
- *A2 - Nedostaje dokumentacija:* U koraku 6, sistem označava obavezne dokumente koji nedostaju i ne dozvoljava slanje prijave.
- *A3 - Oglas zatvoren:* Zatvoreni oglasi ne prikazuju se u listi aktivnih oglasa, pa student ne može pristupiti prijavi.

**Ishod:** Prijava studenta je evidentirana. Kompanija je obaviještena i može razmatrati prijavu.

---

## UC-06: Selekcija i odobravanje kandidata

**Akter:** Kompanija, Koordinator

**Kratak opis:** Kompanija pregledava pristigle prijave i evidentira uži izbor kandidata, a koordinator finalno odobrava praksu.

**Preduslovi:**
- Postoji najmanje jedna prijava za oglas.
- Kompanija i koordinator su prijavljeni na sistem.

**Glavni tok:**
1. Kompanija otvara listu prijava za određeni oglas na dashboardu
2. Kompanija pregledava profile i priloženu dokumentaciju kandidata
3. Kompanija označava odabrane kandidate kao "Uži izbor"
4. Sistem obavještava odabrane studente o tome da su u užem izboru
5. Koordinator dobija zahtjev za pregled i odobravanje prakse
6. Koordinator pregledava prijedlog kompanije i dokumentaciju
7. Koordinator odobrava praksu
8. Sistem mijenja status prakse u "Odobreno" i obavještava sve uključene strane (studenta, kompaniju)
9. Student potvrđuje učešće na praksi (UC-14 - Potvrda studenta)

**Alternativni tokovi:**
- *A1 - Koordinator odbija prijedlog:* U koraku 7, koordinator vraća zahtjev kompaniji s napomenom o razlogu odbijanja.
- *A2 - Student ne potvrđuje u zadanom roku:* Sistem poništava studentovu prijavu i obavještava kompaniju i koordinatora.

**Ishod:** Praksa je odobrena. Student, kompanija i koordinator su obaviješteni. Sistem može pokrenuti generisanje ugovora (UC-12).

---

## UC-07: Upravljanje profilom studenta

**Akter:** Student, Koordinator

**Kratak opis:** Student može uređivati lične i dopunske podatke na svom profilu, dok su akademski podaci (indeks, godina studija, odsjek) zaštićeni i može ih mijenjati samo koordinator ili se ažuriraju automatski.

**Preduslovi:**
- Student je prijavljen na sistem.

**Glavni tok:**
1. Student odabire opciju "Moj profil" u navigaciji
2. Sistem prikazuje profil s dvije kategorije podataka: zaštićeni akademski podaci (prikazani samo za čitanje) i podaci koje student može uređivati
3. Student uređuje dostupne podatke: opis, vještine, hobiji, interesovanja, profilna slika
4. Student potvrđuje izmjene
5. Sistem validira i sprema ažurirane podatke

**Alternativni tokovi:**
- *A1 - Student želi promijeniti fakultet/odsjek:* Student šalje zahtjev za promjenu koji ide koordinatoru starog i novog fakulteta na odobravanje. Akademski podaci ostaju nepromijenjeni dok oba koordinatora ne odobre zahtjev.
- *A2 - Automatsko ažuriranje godine studija:* Sistem automatski ažurira godinu studija na početku akademske godine bez intervencije studenta.

**Ishod:** Profil studenta je ažuriran. Zaštićeni akademski podaci ostaju nepromijenjeni bez odobrenja koordinatora.

---

## UC-08: Upravljanje profilom kompanije

**Akter:** Kompanija

**Kratak opis:** Predstavnik kompanije kreira i ažurira profil kompanije koji je vidljiv studentima uz objavljene oglase.

**Preduslovi:**
- Korisnik je registrovan kao kompanija i prijavljen na sistem.

**Glavni tok:**
1. Kompanija odabire opciju "Profil kompanije" u navigaciji
2. Sistem prikazuje formular s trenutnim podacima
3. Kompanija unosi ili ažurira naziv, djelatnost, opis, kontakt podatke i lokaciju
4. Kompanija potvrđuje unos
5. Sistem validira i sprema podatke

**Alternativni tokovi:**
- *A1 - Nepotpuni obavezni podaci:* Sistem označava prazna obavezna polja i ne dozvoljava spremanje.

**Ishod:** Profil kompanije je ažuriran i vidljiv studentima uz objavljene oglase.

---

## UC-09: Uređivanje oglasa

**Akter:** Kompanija

**Kratak opis:** Kompanija mijenja podatke na već objavljenom aktivnom oglasu.

**Preduslovi:**
- Kompanija je prijavljena na sistem.
- Postoji najmanje jedan aktivan oglas koji kompanija posjeduje.

**Glavni tok:**
1. Kompanija otvara listu svojih oglasa na dashboardu
2. Kompanija odabire oglas koji želi izmijeniti
3. Sistem prikazuje formular s trenutnim podacima oglasa
4. Kompanija mijenja željene podatke (opis, trajanje, broj mjesta, uslovi, rok za prijave)
5. Kompanija potvrđuje izmjene
6. Sistem validira i sprema izmjene
7. Sistem obavještava studente koji su već prijavljeni na oglas o izmjenama

**Alternativni tokovi:**
- *A1 - Oglas ima aktivne prijave:* Sistem upozorava kompaniju da izmjene mogu uticati na već pristigle prijave i traži dodatnu potvrdu prije primjene izmjena.
- *A2 - Odustajanje od izmjena:* Kompanija odustaje od izmjena - sve promjene se odbacuju i oglas ostaje nepromijenjen.

**Ishod:** Oglas je ažuriran. Studenti koji su prijavljeni na taj oglas su obaviješteni o izmjenama.

---

## UC-10: Pretraživanje i filtriranje oglasa

**Akter:** Student

**Kratak opis:** Student pretražuje dostupne aktivne oglase po ključnoj riječi i filtrira ih prema željenim kriterijima.

**Preduslovi:**
- Student je prijavljen na sistem.
- Postoje aktivni oglasi u sistemu.

**Glavni tok:**
1. Student odlazi na stranicu s oglasima
2. Sistem prikazuje listu svih dostupnih aktivnih oglasa
3. Student unosi ključnu riječ u polje za pretragu i/ili postavlja filtere (odsjek, trajanje, lokacija i sl.)
4. Sistem filtrira i prikazuje rezultate koji odgovaraju zadanim kriterijima
5. Student pregledava rezultate i odabire oglas za pregled detalja

**Alternativni tokovi:**
- *A1 - Nema rezultata:* Sistem obavještava studenta da nema oglasa koji odgovaraju zadanim kriterijima i nudi opciju brisanja filtera.

**Ishod:** Studentu je prikazana lista oglasa koji odgovaraju njegovim kriterijima pretrage.

---

## UC-11: Student dashboard

**Akter:** Student

**Kratak opis:** Student ima centralizovani pregled svih svojih prijava, njihovih statusa i relevantnih obavijesti.

**Preduslovi:**
- Student je prijavljen na sistem.

**Glavni tok:**
1. Student odabire "Dashboard" u navigaciji
2. Sistem dohvaća sve prijave studenta i njihove statuse
3. Sistem prikazuje pregled aktivnih prijava, odobrenih prakse i odbijenih prijava
4. Student može odabrati pojedinu prijavu za pregled detalja
5. Sistem prikazuje relevantne notifikacije o promjenama statusa

**Alternativni tokovi:**
- *A1 - Nema prijava:* Sistem obavještava studenta da nema aktivnih prijava i upućuje ga na listu dostupnih oglasa.

**Ishod:** Student ima jasan pregled svih svojih prijava i aktivnosti na platformi.

---

## UC-12: Generisanje i preuzimanje ugovora

**Akter:** Student, Sistem

**Kratak opis:** Nakon odobrene prakse i potvrde studenta, sistem automatski generiše ugovor o praksi koji student može preuzeti.

**Preduslovi:**
- Praksa je odobrena od strane koordinatora.
- Student je potvrdio učešće.

**Glavni tok:**
1. Sistem automatski generiše ugovor o praksi na osnovu podataka o studentu, kompaniji i praksi
2. Sistem obavještava studenta da je ugovor dostupan za preuzimanje
3. Student odlazi na dashboard i pronalazi obavijest o ugovoru
4. Student odabire opciju za preuzimanje ugovora
5. Sistem generira PDF dokument i pokreće preuzimanje

**Alternativni tokovi:**
- *A1 - Greška pri generisanju:* Sistem bilježi grešku i obavještava koordinatora kako bi poduzeo odgovarajuće korake.

**Ishod:** Student posjeduje ugovor o praksi u PDF formatu.

---

## UC-13: Evidencija aktivnosti tokom prakse

**Akter:** Student

**Kratak opis:** Student redovno unosi dnevne ili sedmične aktivnosti obavljene tokom prakse.

**Preduslovi:**
- Student ima aktivnu, odobrenu praksu.
- Student je prijavljen na sistem.

**Glavni tok:**
1. Student odabire opciju "Evidencija aktivnosti" na dashboardu
2. Sistem prikazuje formular za unos aktivnosti s datumom, opisom i brojem sati
3. Student popunjava formular i sprema unos
4. Sistem bilježi aktivnost i prikazuje je u listi prethodnih unosa
5. Unesene aktivnosti su dostupne kompaniji i koordinatoru za pregled

**Alternativni tokovi:**
- *A1 - Praksa nije aktivna:* Sistem ne dozvoljava unos aktivnosti ako praksa nije u toku.
- *A2 - Dupli unos za isti dan:* Sistem upozorava studenta da već postoji unos za odabrani datum i traži potvrdu ili izmjenu.

**Ishod:** Aktivnosti su evidentirane i vidljive kompaniji i koordinatoru.

---

## UC-14: Praćenje prisustva studenta

**Akter:** Kompanija

**Kratak opis:** Kompanija evidentira prisustvo studenta tokom trajanja prakse.

**Preduslovi:**
- Praksa je aktivna.
- Kompanija je prijavljena na sistem.

**Glavni tok:**
1. Kompanija odabire opciju za evidenciju prisustva za određenog studenta na praksi
2. Sistem prikazuje kalendarski prikaz s danima prakse
3. Kompanija označava prisustvo ili odsustvo za svaki dan
4. Kompanija sprema evidenciju
5. Sistem ažurira podatke koji postaju dostupni koordinatoru

**Alternativni tokovi:**
- *A1 - Retroaktivni unos:* Kompanija može unijeti prisustvo za prethodne dane uz obaveznu napomenu o razlogu naknadnog unosa.

**Ishod:** Evidencija prisustva je zabilježena i dostupna koordinatoru za praćenje.

---

## UC-15: Evaluacija studenta

**Akter:** Kompanija

**Kratak opis:** Kompanija ocjenjuje studenta prema definisanim kriterijima po završetku prakse.

**Preduslovi:**
- Praksa je završena.
- Kompanija je prijavljena na sistem.

**Glavni tok:**
1. Kompanija dobija obavijest da je praksa završena i da može izvršiti evaluaciju
2. Kompanija odabire opciju za evaluaciju studenta
3. Sistem prikazuje evaluacijski formular s kriterijima (komunikacija, stručnost, radna etika i sl.)
4. Kompanija unosi ocjene i opcionalni komentar
5. Kompanija potvrđuje i šalje evaluaciju
6. Sistem sprema evaluaciju i obavještava koordinatora

**Alternativni tokovi:**
- *A1 - Evaluacija već postoji:* Sistem obavještava kompaniju da je evaluacija za tog studenta već izvršena.

**Ishod:** Evaluacija studenta je zabilježena i dostupna koordinatoru i studentu.

---

## UC-16: Evaluacija kompanije

**Akter:** Student

**Kratak opis:** Student ocjenjuje iskustvo prakse u kompaniji po njenom završetku. Evaluacija je anonimna - kompanija vidi samo agregirane prosječne ocjene od svih studenata, bez uvida u to ko je šta ocijenio.

**Preduslovi:**
- Praksa je završena.
- Student je prijavljen na sistem.

**Glavni tok:**
1. Student dobija obavijest da može evaluirati kompaniju
2. Student odabire opciju za evaluaciju kompanije na dashboardu
3. Sistem prikazuje evaluacijski formular s kriterijima (organizacija, mentorstvo, uslovi rada i sl.)
4. Student unosi ocjene i opcionalni komentar
5. Student potvrđuje i šalje evaluaciju
6. Sistem sprema evaluaciju i anonimno je agregira s ostalim evaluacijama iste kompanije
7. Kompanija na svom profilu vidi ažuriranu prosječnu ocjenu, bez informacija o individualnim ocjenjivačima

**Alternativni tokovi:**
- *A1 - Student preskače evaluaciju:* Sistem jednom naknadno podsjeća studenta, ali ne prisiljava na popunjavanje.

**Ishod:** Evaluacija je anonimno zabilježena. Kompanija dobija agregiranu povratnu informaciju o kvaliteti prakse.

---

## UC-17: Upravljanje korisničkim računima

**Akter:** Administrator

**Kratak opis:** Administrator ima mogućnost pregleda, uređivanja, deaktivacije i brisanja korisničkih računa.

**Preduslovi:**
- Korisnik je prijavljen s administratorskim privilegijama.

**Glavni tok:**
1. Administrator odabire opciju za upravljanje korisnicima u admin panelu
2. Sistem prikazuje listu svih korisnika s mogućnošću filtriranja po tipu (student/kompanija/koordinator)
3. Administrator odabire određenog korisnika
4. Sistem prikazuje detalje korisničkog računa
5. Administrator može izmijeniti podatke, promijeniti rolu, deaktivirati ili obrisati nalog
6. Sistem primjenjuje izmjene i bilježi akciju u sistemski log

**Alternativni tokovi:**
- *A1 - Brisanje naloga s aktivnim praksama:* Sistem upozorava administratora da korisnik ima aktivne prakse i traži dodatnu potvrdu prije brisanja.

**Ishod:** Korisnički račun je ažuriran prema odabranoj akciji administratora.

---

## UC-18: Odustajanje od prakse

**Akter:** Student

**Kratak opis:** Student može povući prijavu ili odustati od već odobrene prakse.

**Preduslovi:**
- Student ima aktivnu prijavu ili odobrenu praksu.
- Student je prijavljen na sistem.

**Glavni tok:**
1. Student odlazi na dashboard i pronalazi prijavu ili praksu od koje želi odustati
2. Student odabire opciju za odustajanje
3. Sistem traži potvrdu i razlog odustajanja
4. Student potvrđuje odustajanje
5. Sistem mijenja status prijave ili prakse u "Poništeno"
6. Sistem obavještava kompaniju i koordinatora o odustajanju

**Alternativni tokovi:**
- *A1 - Odustajanje od već odobrene prakse:* Sistem dodatno upozorava studenta na moguće posljedice i traži pisanu napomenu s obrazloženjem.

**Ishod:** Prijava ili praksa je poništena. Kompanija i koordinator su obaviješteni i mogu razmatrati alternativna rješenja.

---

## UC-19: Slanje notifikacija

**Akter:** Sistem

**Kratak opis:** Sistem automatski šalje notifikacije relevantnim korisnicima pri promjenama statusa prijava, prakse i ostalih aktivnosti.

**Preduslovi:**
- Postoji događaj koji pokreće notifikaciju (nova prijava, promjena statusa, evaluacija i sl.).

**Glavni tok:**
1. Sistem detektuje promjenu statusa ili relevantan događaj
2. Sistem identificira korisnike koji trebaju biti obaviješteni
3. Sistem generiše odgovarajuću notifikaciju
4. Notifikacija se prikazuje unutar platforme na dashboardu korisnika
5. Sistem šalje i email notifikaciju na adresu korisnika

**Alternativni tokovi:**
- *A1 - Korisnik ima isključene email notifikacije:* Sistem preskače slanje emaila, ali notifikacija ostaje vidljiva unutar platforme.

**Ishod:** Korisnici su pravovremeno obaviješteni o svim relevantnim promjenama u sistemu.

---

## UC-20: Odobravanje korisničkog računa

**Akter:** Koordinator (za studente), Administrator (za kompanije)

**Kratak opis:** Nakon što korisnik završi registraciju i verifikuje email adresu, koordinator ili administrator pregleda zahtjev i odobrava ili odbija aktivaciju računa.

**Preduslovi:**
- Korisnik je završio registraciju i verifikovao email adresu.
- Račun ima status "Na čekanju odobrenja".

**Glavni tok:**
1. Koordinator (ili administrator) dobija obavijest o novom zahtjevu za odobravanje računa
2. Koordinator/administrator otvara listu zahtjeva na čekanju
3. Sistem prikazuje detalje podnesenog zahtjeva (tip korisnika, email, uneseni podaci)
4. Koordinator/administrator pregledava zahtjev
5. Koordinator/administrator odobrava račun
6. Sistem mijenja status računa u "Aktivan"
7. Sistem obavještava korisnika da je njegov račun odobren i da se može prijaviti

**Alternativni tokovi:**
- *A1 - Zahtjev se odbija:* U koraku 5, koordinator/administrator odbija zahtjev uz navođenje razloga. Sistem obavještava korisnika o odbijanju i razlogu.
- *A2 - Zahtjev se ignorira duže vrijeme:* Sistem automatski podsjeća koordinatora/administratora o zahtjevu koji čeka na odobrenje.

**Ishod:** Korisnički račun je aktiviran ili odbijen. Korisnik je obaviješten o odluci i može se prijaviti (u slučaju odobrenja).

---

## UC-21: Zatvaranje oglasa
 
**Akter:** Kompanija
 
**Kratak opis:** Kompanija zatvara aktivan oglas čime se onemogućavaju nove prijave studenata. Zatvoreni oglas ostaje vidljiv studentima samo za pregled, ali nije moguće prijaviti se na njega.
 
**Preduslovi:**
- Kompanija je prijavljena na sistem.
- Postoji najmanje jedan aktivan oglas koji kompanija posjeduje.
 
**Glavni tok:**
1. Kompanija otvara listu svojih oglasa na dashboardu
2. Kompanija odabire aktivan oglas koji želi zatvoriti
3. Kompanija odabire opciju za zatvaranje oglasa
4. Sistem traži potvrdu od kompanije
5. Kompanija potvrđuje zatvaranje
6. Sistem mijenja status oglasa u "Zatvoren"
7. Oglas se uklanja iz liste aktivnih oglasa
8. Studenti koji su prijavljeni na oglas dobijaju obavijest o zatvaranju
 
**Alternativni tokovi:**
- *A1 - Odustajanje od zatvaranja:* U koraku 4, kompanija odustaje - oglas ostaje aktivan.
- *A2 - Automatsko zatvaranje:* Sistem automatski zatvara oglas nakon isteka roka za prijave bez intervencije kompanije.
 
**Ishod:** Oglas je zatvoren. Nove prijave nisu moguće. Studenti su obaviješteni o zatvaranju.
 
---
 
## UC-22: Arhiviranje oglasa
 
**Akter:** Kompanija
 
**Kratak opis:** Kompanija arhivira zatvoreni oglas radi organizacije historije oglasa. Arhivirani oglasi nisu vidljivi studentima, ali ih kompanija može pregledati ili vratiti iz arhive.
 
**Preduslovi:**
- Kompanija je prijavljena na sistem.
- Oglas ima status "Zatvoren" - UC-21.
 
**Glavni tok:**
1. Kompanija otvara listu zatvorenih oglasa na dashboardu
2. Kompanija odabire oglas koji želi arhivirati
3. Kompanija odabire opciju za arhiviranje
4. Sistem traži potvrdu od kompanije
5. Kompanija potvrđuje arhiviranje
6. Sistem mijenja status oglasa u "Arhiviran"
7. Oglas više nije vidljiv studentima ni u listi aktivnih ni zatvorenih oglasa
 
**Alternativni tokovi:**
- *A1 - Vraćanje iz arhive:* Kompanija odabire arhivirani oglas i odabire opciju za vraćanje - sistem mijenja status oglasa u "Zatvoren" i oglas postaje ponovo dostupan za pregled.
- *A2 – Odustajanje od arhiviranja:* U koraku 4, kompanija odustaje - oglas ostaje zatvoren.
 
**Ishod:** Oglas je arhiviran i nije vidljiv studentima. Kompanija ima uredan pregled historije oglasa.