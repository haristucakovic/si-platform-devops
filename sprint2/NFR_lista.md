# Nefunkcionalni zahtjevi


- **ID:** NFR-01
- **Kategorija:** Performanse
- **Opis zahtjeva:** Sistem mora omogućiti da student može pregledati i prijaviti se na praksu u roku od najviše 4 sekunde.
- **Način provjere:** Load testiranje
- **Prioritet:** Visok

---

- **ID:** NFR-02
- **Kategorija:** Sigurnost
- **Opis zahtjeva:** Sistem mora automatski odjaviti korisnika nakon 15 minuta neaktivnosti kako bi se spriječio neovlašten pristup.
- **Način provjere:** Test sesije
- **Prioritet:** Srednji

---

- **ID:** NFR-03
- **Kategorija:** Sigurnost
- **Opis zahtjeva:** Sistem mora osigurati autentifikaciju i zaštitu podataka. 
- **Način provjere:** Penetracijsko testiranje, enkripcija
- **Prioritet:** Visok
- **Napomena:** Pristup je ograničen samo ovlaštenim osobama.

---

- **ID:** NFR-04
- **Kategorija:** Pouzdanost
- **Opis zahtjeva:** Sistem mora pouzdano raditi bez gubitka podataka o prijavama i evaluacijama pri prekidu rada ili grešci.
- **Način provjere:** Provjera integriteta baze
- **Prioritet:** Visok
- **Napomena:** Implementacija automatskog spremanja, backup i rollback

---

- **ID:** NFR-05
- **Kategorija:** Pouzdanost
- **Opis zahtjeva:** Sistem mora omogućiti automatsko spremanje unosa u cilju zaštite gubitka podataka.
- **Način provjere:** Simulacija prekida
- **Prioritet:** Srednji

---

- **ID:** NFR-06
- **Kategorija:** Upotrebljivost
- **Opis zahtjeva:** Sistem mora imati intuitivan interfejs kako bi ga korisnici mogli jednostavno koristiti.
- **Način provjere:** User testiranje
- **Prioritet:** Srednji
- **Napomena:** Jednostavno korištenje sistema podrazumijeva da nije potrebna nikakva dodatna obuka za njegovo korištenje.

---

- **ID:** NFR-07
- **Kategorija:** Upotrebljivost
- **Opis zahtjeva:** Sistem mora jasno prikazati status prijave studenta.
- **Način provjere:** User test
- **Prioritet:** Nizak
- **Napomena:** Status mora biti uvijek vidljiv u realnom vremenu, te nakon promjene. Status uključuje da je prijava poslana, u obradi, prihvaćena ili odbijena.

---

- **ID:** NFR-08
- **Kategorija:** Skalabilnost
- **Opis zahtjeva:** Sistem mora omogućiti paralelni rad više koordinatora bez usporavanja sistema.
- **Način provjere:** User test, load test sa simulacijom rada više korisnika
- **Prioritet:** Srednji

---

- **ID:** NFR-09
- **Kategorija:** Skalabilnost
- **Opis zahtjeva:** Sistem mora podržati povećanje broja aktivnih korisnika bez uticaja na preformanse.
- **Način provjere:** Stress testiranje
- **Prioritet:** Visok
- **Napomena:** Brzina, stabilnost, kao i čitanje/pisanje u bazu ne smiju biti promijenjeni.

---

- **ID:** NFR-10
- **Kategorija:** Privatnost
- **Opis zahtjeva:** Lični podaci studenta moraju biti dostupni samo ovlaštenim licima.
- **Način provjere:** Provjera prava pristupa
- **Prioritet:** Visok

---

- **ID:** NFR-11
- **Kategorija:** Privatnost
- **Opis zahtjeva:** Student mora imati uvid samo u vlastite prijave, izvještaje i evaluacije, bez mogućnosti pristupa tuđim podacima.
- **Način provjere:** Pokušaj neovlaštenog pristupa
- **Prioritet:** Srednji

---

- **ID:** NFR-12
- **Kategorija:** Održivost
- **Opis zahtjeva:** Sistem mora imati jasno odvojene slojeve radi lakšeg održavanja i nadogradnje. 
- **Način provjere:** Code review
- **Prioritet:** Srednji
- **Napomena:** Odvojenost slojeva odnosi se na frontend, backend i bazu podataka.

---

- **ID:** NFR-13
- **Kategorija:** Održivost
- **Opis zahtjeva:** Sistem mora biti podijeljen na nezavisne cjeline kako bi se lako dodavale nove funkcionalnosti.
- **Način provjere:** Code review
- **Prioritet:** Srednji
- **Napomena:** Odvojeni moduli za prijave, izvještaje, notifikacije itd.

---

- **ID:** NFR-14
- **Kategorija:** Dostupnost
- **Opis zahtjeva:** Sistem mora biti dostupan korisnicima 24 sata neometano, bez greške, u 95% slučajeva upotrebe. 
- **Način provjere:** Testiranje pristupa u različitim intervalima
- **Prioritet:** Visok
- **Napomena:** Naročito u periodima prijave i evaluacije.

---

- **ID:** NFR-15
- **Kategorija:** Prenosivost
- **Opis zahtjeva:** Sistem mora biti dostupan putem web preglednika.
- **Način provjere:** Testiranje promjene browsera
- **Prioritet:** Srednje
- **Napomena:** Sistem treba raditi za Google Chrome, Edge, Safari

---

- **ID:** NFR-16
- **Kategorija:** Prenosivost
- **Opis zahtjeva:** Sistem mora biti responzivan.
- **Način provjere:** Testiranje UI na različitim rezolucijama
- **Prioritet:** Srednje
- **Napomena:** Responzivnost se odnosi na prilagođenost različitim rezolucijama i veličinama ekrana, kao što su laptopi, mobiteli, tableti

---

- **ID:** NFR-17
- **Kategorija:** Prenosivost
- **Opis zahtjeva:** Sistem mora biti podržan na različitim uređajima i operativnim sistemima.
- **Način provjere:** Promjena uređaja
- **Prioritet:** Srednje

---

- **ID:** NFR-18
- **Kategorija:** Kompatibilnost
- **Opis zahtjeva:** Sistem mora omogućiti slanje notifikacija putem email servisa. 
- **Način provjere:** Provjera isporuke poruke
- **Prioritet:** Srednji

---

- **ID:** NFR-19
- **Kategorija:** Kompatibilnost
- **Opis zahtjeva:** Sistem mora omogućiti integraciju sa drugim servisima.
- **Način provjere:** API testiranje
- **Prioritet:** Srednji
- **Napomena:** Navedeni servisi uključuju studentsku službu ili kompanije.

---

- **ID:** NFR-20
- **Kategorija:** Lokalizacija
- **Opis zahtjeva:** Sistem može podržavati više jezika za strane kompanije i studente u inostranstvu.
- **Način provjere:** Provjera prevoda
- **Prioritet:** Nizak

---

- **ID:** NFR-21
- **Kategorija:** Konzistentnost
- **Opis zahtjeva:** Interfejs treba biti vizuelno konzistentan.
- **Način provjere:** UI testiranje
- **Prioritet:** Nizak
- **Napomena:** Isti stil, fontovi, usklađene boje kroz čitav sistem.

---

- **ID:** NFR-22
- **Kategorija:** Pouzdanost
- **Opis zahtjeva:** Sistem mora omogućiti generisanje i prikaz notifikacija unutar aplikacije za  studente, koordinatore, te kompanije u vezi sa važnim događajima u sistemu u realnom vremenu.
- **Način provjere:** Manuelno testiranje
- **Prioritet:** Srednji
- **Napomena:** Zahtjeva prijavu korisnika.

---

- **ID:** NFR-23
- **Kategorija:** Dostupnost
- **Opis zahtjeva:** Sistem mora omogućiti oporavak u slučaju pada bez gubitka podataka.
- **Način provjere:** Simulacija pada
- **Prioritet:** Visok
- **Napomena:** Nakon ponovnog pokretanja svi prethodno sačuvani podaci i stanje sistema su vraćeni.

---

- **ID:** NFR-24
- **Kategorija:** Performanse
- **Opis zahtjeva:** Sistem mora omogućiti učitavanje liste dostupnih praksi i filtriranje ispod 3 sekunde u 90% pretraga u normalnim uslovima.
- **Način provjere:** Testiranje vremena filtriranja
- **Prioritet:** Srednji
- **Napomena:** Normalni uslovi podrazumijevaju standardno opterećenje sistema.

---


