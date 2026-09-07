# Sprint Retrospective Summary

## Sprint broj
Sprint 10

## Planirane user storije

18. Odbijanje prakse · 19. Potvrda studenta · 22. Generisanje ugovora · 23. Preuzimanje ugovora · 24. Evidencija aktivnosti · 25. Praćenje prisustva · 26. Evaluacija studenta · 27. Evaluacija kompanije · 28. Izvještaji · 33. Odustajanje od prakse · 37. Notifikacije o statusu prakse · 54. Automatsko završavanje prakse

## Šta je išlo dobro

- Implementiran je kompletan tok od odobrene prijave do potvrđene prakse, uključujući kreiranje `Praksa` zapisa nakon prihvatanja studenta
- Generisanje i preuzimanje ugovora o praksi uspješno je integrisano u postojeće dashboard preglede studenta i kompanije
- Lifecycle pregledi praksi (nadolazeće, aktivne, završene) rade konzistentno na student, kompanija i koordinator dashboardima
- Evidencija aktivnosti implementirana je kroz backend API i UI na student, kompanija i koordinator strani
- Automatsko završavanje prakse implementirano je uz idempotentno obavještavanje studenta i kompanije
- Odustajanje od prakse integrirano je s audit logom i postojećim statusnim tokom prijava
- Stavke US-18 (odbijanje prakse) i US-37 (notifikacije) već su bile realizovane u Sprintu 9, što je omogućilo fokus na tok realizacije prakse
- Tim je uspješno iskoristio postojeću arhitekturu (email servis, notifikacije, preference) bez velikih refaktora

## Šta nije išlo dobro


## Šta treba promijeniti


## Koje konkretne akcije tim uvodi u narednom sprintu

- Tim će završiti preostale stavke Release 3 (prisustvo, evaluacije, izvještaji) prije prelaska na finalno testiranje
- End-to-end testiranje toka prakse (potvrda → ugovor → aktivnosti → završetak) bit će obavezni korak prije zatvaranja sprinta
- Svi novi jobovi i automatizacije bit će pokriveni unit testovima i dokumentovani u Proof of Testing
- Decision log će se ažurirati za svaku arhitekturnu odluku vezanu za evaluacije i izvještaje
