# Sprint broj
Sprint 8

# Sprint cilj
Cilj sprinta je unaprijediti funkcionalnosti oglasa za praksu kroz mogućnost uređivanja, upravljanja rokovima prijave i označavanja novih oglasa, te omogućiti studentima lakše praćenje i prijavu na prakse putem favoriziranja oglasa, upload-a dokumentacije i studentskog dashboarda.

# Ključne stavke koje tim želi završiti

## Oglasi za praksu

- Uređivanje oglasa - kompanija može izmijeniti postojeći oglas za praksu, uključujući naziv, opis, trajanje, broj mjesta i uslove
- Upravljanje rokovima prijave - kompanija može definisati i mijenjati rok prijave za oglas
- Oznaka „Novo“ na oglasima - sistem prikazuje oznaku za novoobjavljene oglase kako bi studenti lakše prepoznali nove prilike
- Favoriziranje oglasa - student može označiti oglase kao omiljene radi lakšeg kasnijeg pregleda

## Prijave na praksu

- Prijava na praksu - student može poslati prijavu na aktivan oglas za praksu
- Upload dokumentacije - student može priložiti potrebnu dokumentaciju prilikom prijave (CV, motivaciono pismo i slično)

## Studentski dashboard

- Student dashboard - student ima pregled svojih prijava, favoriziranih oglasa i osnovnih informacija vezanih za praksu na jednom mjestu
- Dashboard prikazuje status prijava i osnovne informacije o aktivnim oglasima

## Testiranje i dokumentacija

- Testirati funkcionalnosti implementirane u sprintu u skladu sa Definition of Done kriterijima
- Provjeriti da samo ovlašteni korisnici mogu uređivati oglase, upravljati rokovima i vršiti prijave na praksu
- Testirati upload dokumentacije i validaciju podržanih formata fajlova
- Ažurirati AI Usage Log sa opisom korištenja AI alata tokom sprinta
- Ažurirati Decision Log sa tehničkim odlukama vezanim za upravljanje prijavama, dokumentacijom i dashboard funkcionalnostima
- Ažurirati dokumentaciju sistema ukoliko su dodane nove rute, komponente ili izmjene korisničkih tokova

# Rizici i zavisnosti

- **Zavisnost od funkcionalnosti oglasa iz Sprinta 7** - uređivanje oglasa, favoriziranje i prijave zavise od ispravno implementiranog sistema oglasa i povezanosti oglasa sa kompanijama.

- **Kontrola pristupa po rolama** - samo kompanija smije uređivati svoje oglase i upravljati rokovima prijave, dok samo student može vršiti prijavu i favorizirati oglase.

- **Validacija prijava na praksu** - sistem mora spriječiti prijavu na neaktivne oglase ili oglase kojima je istekao rok prijave.

- **Upload dokumentacije** - potrebno je ograničiti dozvoljene formate i veličinu fajlova kako bi se spriječile sigurnosne i performansne poteškoće.

- **Povezanost prijave i korisnika** - svaka prijava mora biti povezana sa odgovarajućim studentom i oglasom. Neispravna implementacija može dovesti do gubitka ili pogrešnog prikaza prijava.

- **Tačnost dashboard prikaza** - studentski dashboard mora prikazivati ažurne informacije o prijavama, favoritima i statusima oglasa.

- **Oznaka „Novo“ na oglasima** - potrebno je jasno definisati vremenski period tokom kojeg se oglas smatra novim kako bi prikaz bio konzistentan i očekivan za korisnike.