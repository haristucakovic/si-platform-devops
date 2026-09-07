# Sprint Review Summary

## Sprint broj  
Sprint 10  

## Planirani sprint goal  
Implementirati kompletan tok realizacije prakse nakon odobrenja prijave — od potvrde studenta i ugovora, kroz praćenje aktivnosti, prisustva i evaluacija, do izvještaja, odustajanja i automatskog završetka prakse.

---

## Šta je završeno  

- SB-58 – Odbijanje prakse (realizovano u Sprintu 9 kao preuzeta stavka)  
- SB-59 – Potvrda studenta  
- SB-60 – Generisanje ugovora  
- SB-61 – Preuzimanje ugovora  
- SB-62 – Evidencija aktivnosti  
- SB-63 – Praćenje prisustva  
- SB-64 – Evaluacija studenta  
- SB-65 – Evaluacija kompanije  
- SB-66 – Izvještaji  
- SB-67 – Odustajanje od prakse  
- SB-68 – Notifikacije o statusu prakse (realizovano u Sprintu 9 kao preuzeta stavka)  
- SB-69 – Automatsko završavanje prakse  

Sve planirane stavke Sprinta 10 su realizovane. Dvije stavke (SB-58 i SB-68) implementirane su u Sprintu 9 radi kompletiranja koordinatorskog toka i sistema notifikacija unutar tog sprinta, dok su sve ostale funkcionalnosti realizovane u Sprintu 10.

---

## Šta nije završeno  

Sve planirane funkcionalnosti su završene. Nema prenesenih stavki u naredni sprint.

---

## Demonstrirane funkcionalnosti ili artefakti  

### Potvrda studenta  
Student može prihvatiti ili odbiti odobrenu prijavu na praksu. Nakon prihvatanja, sistem automatski kreira zapis prakse i obavještava kompaniju i koordinatora. Implementirana su zasebna polja `studentStatus` i `studentOdlucioAt` kako bi se studentska odluka pratila neovisno od statusa odobrenja prijave. Sistem onemogućava potvrdu prijave koja nije u odobrenom statusu.

### Generisanje i preuzimanje ugovora  
Sistem automatski generiše ugovor o praksi za svaku potvrđenu praksu. Ugovor sadrži podatke o studentu, kompaniji, trajanju i datumu prakse, te je dostupan studentu i kompaniji. Preuzimanje je realizovano klijentskim PDF exportom bez uvođenja serverske biblioteke. Ugovor je na bosanskom jeziku.

### Evidencija aktivnosti  
Student može unositi dnevne ili sedmične aktivnosti tokom aktivne prakse. Evidentirane aktivnosti vidljive su kompaniji i koordinatoru. Sistem onemogućava unos aktivnosti za tuđu praksu te za prakse koje nisu u statusu aktivne.

### Praćenje prisustva  
Kompanija može evidentirati prisustvo studenta na praksi za svaki radni dan. Evidencija prisustva dostupna je studentu, kompaniji i koordinatoru za pregled. Sistem onemogućava evidenciju prisustva za tuđu praksu ili praksu koja nije aktivna.

### Evaluacija studenta  
Kompanija može evaluirati rad studenta prema predefinisanom formularu po završetku ili tokom završne faze prakse. Student može pregledati svoju evaluaciju. Sistem onemogućava evaluaciju bez aktivne ili završene prakse te evaluaciju tudih studenata.

### Evaluacija kompanije  
Student može evaluirati kompaniju u kojoj je obavio praksu putem predefinisanog formulara. Evaluacija je dostupna isključivo nakon završetka prakse. Kompanija može pregledati svoju evaluaciju.

### Izvještaji  
Kompanija može generisati izvještaj o praksi koji sadrži ključne podatke o trajanju, aktivnostima i prisustvu studenta. Student može pregledati i preuzeti izvještaj kao dokaz o pohađanju prakse. Sistem ne dozvoljava generisanje izvještaja za prakse koje nisu završene.

### Odustajanje od prakse  
Student može odustati od prijave koja je na čekanju ili odobrene prakse. Sistem ažurira status prijave i prakse te automatski obavještava kompaniju i koordinatora. Onemogućeno je odustajanje od prakse koja je već završena.

### Automatsko završavanje prakse  
Implementiran je periodički background job (`practiceCompletion.job.js`) koji se pokreće svakih 24 sata i provjerava prakse čiji je rok trajanja istekao. Za svaku takvu praksu sistem šalje obavijesti studentu i kompaniji. Obavijesti su idempotentne — polje `datumObavijestiZavrsetka` sprječava višestruko slanje. Status prakse (`ZAVRSENA`) izračunava se date-based logikom iz postojećih datumskih polja, bez persistiranog statusnog polja.

---

## Glavni problemi i blokeri  

- Tok potvrde studenta zahtijevao je uvođenje novih polja u model `PrijavaNaPraksu` (`studentStatus`, `studentOdlucioAt`) uz backfill postojećih zapisa kako bi se osigurala kompatibilnost s podacima koji već postoje u bazi.  
- Automatsko završavanje prakse i idempotentnost obavijesti zahtijevali su pažljivo upravljanje stanjem — dodano je posebno polje `datumObavijestiZavrsetka` kako bi job pouzdano radio bez slanja duplikata pri ponovnom pokretanju servera.  
- Koordinacija između modula evidencije aktivnosti, prisustva i evaluacija zahtijevala je preciznu provjeru lifecycle statusa prakse na svakom endpointu kako bi se spriječio pristup podacima za neaktivne ili nepostojeće prakse.  

---

## Ključne odluke donesene u sprintu  

- Studentska odluka o prihvatanju prakse modelovana je kao zasebna polja (`studentStatus`, `studentOdlucioAt`) unutar `PrijavaNaPraksu`, a ne kao promjena glavnog statusa prijave, radi jasnog razdvajanja faze odobrenja od faze prihvatanja.  
- Ugovor se generiše i preuzima klijentskim PDF exportom umjesto serverskog generisanja, čime je izbjegnuto uvođenje nove backend biblioteke i zadržana konzistentnost arhitekture.  
- Lifecycle status prakse (`nadolazeća`, `aktivna`, `završena`) ostaje date-based izračun iz postojećih datumskih polja, a periodički job odgovoran je isključivo za slanje obavijesti, a ne za ažuriranje stanja u bazi.  
- Background job implementiran je kao lightweight `setInterval` unutar `practiceCompletion.job.js` bez uvođenja `node-cron` ovisnosti, uz prvi run ~1 minutu nakon starta servera radi lakšeg testiranja.  

---

## Povratna informacija Product Ownera  

Product Owner je zadovoljan napretkom. Implementiran je kompletan tok realizacije prakse — od potvrde studenta i ugovora do praćenja aktivnosti, evaluacija i automatskog završetka. Sistem sada pokriva cjelokupan životni ciklus prakse end-to-end. Nije bilo dodatnih zahtjeva niti prijedloga za izmjene.

---

## Zaključak za naredni sprint  

Sprint 10 je uspješno realizovan sa svim planiranim funkcionalnostima. Sistem sada podržava kompletan tok od prijave na praksu do njenog završetka, uključujući ugovor, praćenje aktivnosti i prisustva, evaluacije te automatsko završavanje.  

Fokus narednog sprinta biće finalizacija sistema: deployment na produkcijsko okruženje, CD pipeline, korisnička dokumentacija, završni testovi i tehnička dokumentacija sistema.
