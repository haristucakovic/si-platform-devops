# Sprint broj
Sprint 10

# Sprint cilj
Cilj sprinta je implementirati kompletan tok realizacije prakse nakon odobrenja prijave — od potvrde studenta i ugovora, kroz praćenje aktivnosti, prisustva i evaluacija, do izvještaja, odustajanja i automatskog završetka prakse.

# Planirane user storije

| # | User story | PB |
|---|---|---|
| 18 | Odbijanje prakse | PB13 |
| 19 | Potvrda studenta | PB14 |
| 22 | Generisanje ugovora | PB17 |
| 23 | Preuzimanje ugovora | PB18 |
| 24 | Evidencija aktivnosti | PB19 |
| 25 | Praćenje prisustva | PB20 |
| 26 | Evaluacija studenta | PB21 |
| 27 | Evaluacija kompanije | PB22 |
| 28 | Izvještaji | PB23 |
| 33 | Odustajanje od prakse | PB27 |
| 37 | Notifikacije o statusu prakse | PB31 |
| 54 | Automatsko završavanje prakse | PB19 |

# Ključne stavke koje tim želi završiti

## Upravljanje prijavama i potvrda

- Odbijanje prakse – koordinator odbija studentsku prijavu uz obavijest studentu (preuzeto iz Sprinta 9)
- Potvrda studenta – student prihvata ili odbija odobrenu praksu, nakon čega se kreira stvarni zapis prakse
- Notifikacije o statusu prakse – student prima obavijesti o promjenama statusa prijave (preuzeto iz Sprinta 9)

## Ugovor o praksi

- Generisanje ugovora – sistem automatski generiše ugovor o praksi za studenta i kompaniju
- Preuzimanje ugovora – student i kompanija mogu pregledati i preuzeti digitalnu kopiju ugovora

## Praćenje realizacije prakse

- Evidencija aktivnosti – student unosi dnevne ili sedmične aktivnosti tokom aktivne prakse
- Praćenje prisustva – kompanija evidentira prisustvo studenta na praksi
- Evaluacija studenta – kompanija evaluira rad studenta prema definisanim kriterijima
- Evaluacija kompanije – student evaluira kompaniju nakon završetka prakse
- Izvještaji – kompanija generiše izvještaj o praksi kao dokaz o pohađanju

## Upravljanje statusom prakse

- Odustajanje od prakse – student može odustati od prijavljene ili odobrene prakse uz obavijest kompanije i koordinatora
- Automatsko završavanje prakse – sistem nakon isteka trajanja prakse označava je završenom i obavještava studenta i kompaniju

## Testiranje i dokumentacija

- Testirati sve implementirane funkcionalnosti u skladu sa Definition of Done kriterijima
- Provjeriti rolnu autorizaciju za sve nove akcije (student, kompanija, koordinator)
- Testirati lifecycle prijelaze prakse (nadolazeća → aktivna → završena → odustao)
- Ažurirati AI Usage Log i Decision Log sa tehničkim odlukama i korištenjem AI alata tokom sprinta

# Rizici i zavisnosti

- **Zavisnost od Sprinta 9** – potvrda studenta, ugovor i praćenje prakse zavise od ispravno implementiranog toka odobravanja prijave, selekcije i notifikacija.

- **Preuzete stavke iz Sprinta 9** – odbijanje prakse (US-18) i notifikacije o statusu prakse (US-37) realizovane su u Sprintu 9 radi potpunog koordinatorskog toka i korisničkog iskustva.

- **Lifecycle status prakse** – status prakse (nadolazeća, aktivna, završena) izračunava se iz datuma; promjene u logici datuma utiču na više modula odjednom.

- **Generisanje dokumenata** – ugovor i izvještaji zahtijevaju konzistentan format i lokalizaciju na bosanski jezik.

- **Automatsko završavanje** – periodički job mora pouzdano detektovati istek prakse i spriječiti višestruko slanje obavijesti.

- **Evaluacije i prisustvo** – zavise od aktivne prakse i ne smiju biti dostupne prije potvrde studenta i početka prakse.

- **Odustajanje od prakse** – mora ažurirati status prijave i prakse bez narušavanja integriteta povezanih podataka (aktivnosti, evaluacije, ugovor).
