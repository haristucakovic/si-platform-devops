# Decision Log 

## Sprint 5

### DL-S5-01
- **Datum:** 29.04.2026
- **Naziv odluke:** Pozicioniranje i scope tamnog režima rada
- **Opis problema:** Trebalo je odlučiti gdje se kontrola tamnog režima smješta u aplikaciji i da li je dostupna neprijavljenim korisnicima, te kako se odabrana tema prenosi između stranica.
- **Razmatrane opcije:**
  - Opcija A: Opcija za promjenu teme dostupna samo prijavljenim korisnicima unutar korisničkih postavki
  - Opcija B: Opcija za temu smještena direktno na landing page-u, dostupna svim posjetiocima, s globalnom primjenom na sve stranice
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Tamni režim je estetska preferencija korisnika koja ne zahtijeva prijavu. Smještanjem opcije (dugmeta) na landing page poboljšava se korisničko iskustvo već pri prvom kontaktu s platformom, a globalna primjena osigurava vizuelnu konzistentnost kroz cijelu aplikaciju.
- **Posljedice odluke:** Odabrana tema mora biti pohranjena u localStorage-u browsera kako bi bila perzistentna između sesija i stranica. Sve komponente sistema moraju podržavati obje teme od trenutka implementacije.
- **Status:** Aktivna

---

### DL-S5-02
- **Datum:** 26.04.2026
- **Naziv odluke:** Korištenje mock podataka za demonstraciju admin dashboarda
- **Opis problema:** Admin dashboard planiran je za implementaciju u sprintu 5, međutim registracija i prijava korisnika implementiraju se tek u sprintu 6. Bez stvarnih korisničkih podataka nije moguće demonstrirati funkcionalnosti pregleda i upravljanja računima.
- **Razmatrane opcije:**
  - Opcija A: Implementirati admin dashboard u sprintu 5 koristeći mock podatke za demonstraciju
- **Odabrana opcija:** Opcija A
- **Razlog izbora:** Zadržavanje planiranog rasporeda sprinta i mogućnost ranog testiranja i demonstracije UI-ja admin dashboarda bez čekanja na završetak autentifikacijskog modula...
- **Posljedice odluke:** Mock podaci moraju obuhvatati reprezentativne primjere korisnika svih rola (studenti, kompanije, koordinatori) s različitim statusima računa. Mock podaci se uklanjaju i zamjenjuju stvarnim podacima po implementaciji autentifikacije u sprintu 6.
- **Status:** Aktivna

