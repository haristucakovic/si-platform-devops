# Sprint broj
Sprint 7

# Sprint cilj
Cilj sprinta je implementirati osnovne funkcionalnosti za rad sa korisničkim profilima, pristup koordinatora i početne funkcionalnosti vezane za oglase za praksu. Također, cilj je unaprijediti korisničko iskustvo kroz navigaciju prilagođenu korisničkim rolama i dodati mogućnost deaktivacije ili brisanja korisničkog računa.


# Ključne stavke koje tim želi završiti

## Korisnički profili

- Uređivanje profila studenta — student može unijeti ili izmijeniti lične podatke, vještine, interesovanja, opis i profilnu sliku
- Pregled korisničkog profila — korisnik može vidjeti svoje osnovne i pohranjene podatke
- Uređivanje profila kompanije — kompanija može pregledati i izmijeniti podatke o svom profilu
- Deaktivacija/brisanje korisničkog računa — korisnik može deaktivirati ili obrisati svoj nalog uz potvrdu akcije

## Pristup i navigacija

- Pristup koordinatora — koordinator ima poseban interfejs za uvid u informacije o prijavama studenata i osnovnim informacijama o studentima
- Navigacija — sistem prikazuje navigaciju prilagođenu roli korisnika: student, kompanija, koordinator ili administrator
- Navigacija mora sadržavati opciju odjave i linkove ka funkcionalnostima koje korisnik ima pravo koristiti

## Oglasi za praksu

- Kreiranje oglasa — kompanija može kreirati i objaviti oglas za praksu sa nazivom, opisom, trajanjem, brojem mjesta i uslovima
- Pregled oglasa — student može pregledati listu aktivnih oglasa za praksu
- Sistem prikazuje osnovne informacije o svakom oglasu, uključujući naziv, kompaniju, trajanje i broj dostupnih mjesta

## Testiranje i dokumentacija

- Testirati funkcionalnosti koje su implementirane u sprintu u skladu sa Definition of Done kriterijima
- Provjeriti da korisnik ne može pristupiti profilima, oglasima ili koordinatorskom interfejsu bez odgovarajuće prijave i role
- Ažurirati AI Usage Log sa opisom korištenja AI alata tokom sprinta
- Ažurirati Decision Log sa bitnim tehničkim odlukama donesenim tokom implementacije
- Ažurirati dokumentaciju sistema ukoliko su dodane nove rute, komponente ili izmjene u korisničkim tokovima

# Rizici i zavisnosti

- **Zavisnost od autentifikacije iz Sprinta 6** — funkcionalnosti profila, navigacije, pristupa koordinatora i oglasa zavise od ispravne registracije, prijave, verifikacije email adrese i odobravanja korisničkog računa.

- **Kontrola pristupa po rolama** — sistem mora pravilno razlikovati studenta, kompaniju, koordinatora i administratora. Ako role nisu ispravno provjerene, korisnik može vidjeti ili koristiti funkcionalnosti koje mu ne pripadaju.

- **Uređivanje korisničkih podataka** — potrebno je jasno ograničiti koje podatke korisnik smije mijenjati, kako ne bi došlo do izmjene sistemskih podataka kao što su rola, status računa ili sigurnosni podaci.

- **Kreiranje oglasa od strane kompanije** — oglas smije kreirati samo prijavljena i odobrena kompanija. Greška u provjeri može dovesti do toga da neovlašten korisnik objavi oglas.

- **Povezanost oglasa i kompanije** — svaki oglas mora biti vezan za kompaniju koja ga je kreirala. Ako ta veza nije ispravno implementirana, može doći do prikaza oglasa bez validnog vlasnika.

- **Navigacija po rolama** — frontend navigacija mora biti usklađena sa backend autorizacijom. Korisnik ne bi trebao vidjeti opcije koje ne može stvarno koristiti.

- **Deaktivacija/brisanje računa** — potrebno je definisati posljedice deaktivacije ili brisanja naloga, posebno ako korisnik već ima oglase, prijave ili druge povezane podatke u sistemu.