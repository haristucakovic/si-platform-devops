# Sprint broj
Sprint 9

# Sprint cilj
Cilj sprinta je implementirati kompletan tok selekcije i odobravanja prijava na praksu, upravljati životnim ciklusom oglasa kroz zatvaranje i arhiviranje, te uvesti napredne alate za koordinatore, kompanije, administratore i studente: sistem notifikacija o statusu prakse, pregled statistike prijava, audit log historije aktivnosti i ograničenje broja prijava po studentu.

# Ključne stavke koje tim želi završiti

## Upravljanje prijavama i selekcija

- Selekcija kandidata – kompanija može označiti kandidate koji prolaze u uži krug selekcije i ažurirati status prijave
- Odobravanje prakse – koordinator može odobriti studentsku prijavu za praksu i obavijestiti studenta o promjeni statusa
- Odbijanje prakse – koordinator može odbiti studentsku prijavu za praksu uz obavijest studentu (preuzeto iz Sprinta 10)

## Upravljanje oglasima

- Zatvaranje oglasa – kompanija može zatvoriti aktivan oglas kako bi spriječila pristizanje novih prijava
- Arhiviranje oglasa – kompanija može arhivirati zatvoren oglas radi zadržavanja evidencije bez prikazivanja studentima
- Pregled zatvorenih oglasa – studenti mogu pregledati zatvorene oglase i uslove koji su bili postavljeni

## Notifikacije i studentski dashboard

- Student dashboard – centralizovani pregled prijava, favorita i statusa prakse (realizovano u Sprintu 8)
- Notifikacije o statusu prakse – student prima notifikacije o svakoj promjeni statusa prijave (preuzeto iz Sprinta 10)
- Podešavanje tipova notifikacija – korisnik može odabrati koje vrste notifikacija želi primati

## Administrativni alati

- Historija aktivnosti (Audit log) – administrator može pregledati historiju svih ključnih akcija u sistemu
- Ograničenje broja prijava po studentu – administrator može definisati maksimalan broj aktivnih prijava po studentu
- Pregled statistike prijava – kompanija može pregledati statistiku prijava po oglasu (ukupan broj, distribucija po odsjeku i godini studija)

## Testiranje i dokumentacija

- Testirati sve implementirane funkcionalnosti u skladu sa Definition of Done kriterijima
- Provjeriti rolnu autorizaciju za sve nove akcije (selekcija, odobravanje, odbijanje, arhiviranje)
- Testirati sistem notifikacija i podešavanja za sve relevantne statusne promjene
- Ažurirati AI Usage Log i Decision Log sa tehničkim odlukama i korištenjem AI alata tokom sprinta

# Rizici i zavisnosti

- **Zavisnost od prijava iz Sprinta 8** – selekcija, odobravanje i odbijanje zavise od ispravno implementiranog sistema prijava i upload-a dokumentacije.

- **Redoslijed akcija u životnom ciklusu oglasa** – zatvaranje oglasa mora biti implementirano i ispravno prije arhiviranja; sistem mora spriječiti prijave na zatvorene oglase.

- **Sistem notifikacija** – notifikacije o statusu prakse zavise od ispravnih statusnih prijelaza prijave koje provode kompanija i koordinator.

- **Podešavanja notifikacija** – korisnici moraju imati mogućnost upravljanja preferencijama, a sistem mora poštovati ta podešavanja pri slanju notifikacija.

- **Audit log** – mora bilježiti sve relevantne akcije uključujući selekciju, odobravanje, odbijanje i upravljanje oglasima; pristup mora biti ograničen na administratora.

- **Ograničenje broja prijava** – sistem mora provjeriti limit pri svakom pokušaju prijave, bez utjecaja na već odobrene, odbijene ili završene prijave.

- **Koordinacija selekcije i odobravanja** – tok prijave prolazi kroz više rola (kompanija → koordinator), što zahtijeva pažljivu implementaciju statusnih prijelaza i autorizacije.
