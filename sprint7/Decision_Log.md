# Decision Log

## Sprint 7

### DL-S7-01
- **Datum:** 10.05.2026
- **Naziv odluke:** Zamjena Nodemailer + Gmail SMTP s Brevo REST API-jem za slanje transakcijskih emailova
- **Opis problema:** Nodemailer u kombinaciji s Gmail SMTP-om radio je lokalno, ali nije u potpunosti funkcionisao u deployovanoj verziji na Renderu. Render na besplatnom planu blokira odlazne TCP konekcije na SMTP portovima (465/587) na mrežnom nivou, što je uzrokovalo `ETIMEDOUT` grešku već pri pokušaju uspostavljanja konekcije (`command: CONN`) - prije nego što bi ikakva autentifikacija ili slanje uopće počeli. Greška se manifestovala pri verifikaciji emaila pri registraciji.
- **Razmatrane opcije:**
  - Opcija A: Zadržati Nodemailer + Gmail SMTP i pokušati riješiti problem dodatnom konfiguracijom (OAuth2, App Passwords)
  - Opcija B: Zamijeniti Gmail SMTP s Brevo REST API-jem kao namjenskim servisom za transakcijske emailove
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Brevo je namjenski servis za transakcijske emailove koji radi pouzdano iz cloud okruženja bez ograničenja vezanih za IP reputaciju. Autentifikacija se vrši putem API ključa, što je jednostavnije i sigurnije od upravljanja Gmail OAuth2 tokovima. Besplatni plan pokriva 300 emailova dnevno, što je dovoljno za razvojnu fazu.
- **Posljedice odluke:** Nodemailer je u potpunosti zamijenjen direktnim pozivima prema Brevo REST API-ju (`https://api.brevo.com/v3/smtp/email`) putem native `fetch` funkcije. Autentifikacija se vrši `api-key` headerom. Kredencijali (`BREVO_API_KEY`, `BREVO_SENDER_EMAIL`) konfigurišu se kao environment varijable. Verifikacija emailova sada radi konzistentno u svim okruženjima, uključujući deployovanu verziju na Renderu.
- **Status:** Aktivna

---

### DL-S7-02
- **Datum:** 12.05.2026
- **Naziv odluke:** Preuzimanje stavki SB-12, SB-36 i SB-39 iz Sprinta 8 u Sprint 7
- **Opis problema:** Prilikom pripreme za prvi release, uočeno je da student, iako vidi listu oglasa (SB-11), nema mogućnost: (a) pregleda detaljnih informacija o pojedinačnom oglasu (SB-12), (b) filtriranja oglasa po kriterijima (SB-36) niti (c) pretraživanja oglasa po ključnoj riječi (SB-39). Bez ove tri funkcionalnosti sistem ne pruža upotrebljiv korisnički tok — student ne može pronaći relevantnu praksu niti donijeti informisanu odluku o prijavi.
- **Razmatrane opcije:**
  - **Opcija A:** Zadržati SB-12, SB-36 i SB-39 u Sprintu 8 (originalni plan).
  - **Opcija B:** Implementirati sve tri stavke u okviru Sprinta 7 kako bi tok pronalaska i pregleda oglasa bio funkcionalan u prvom release-u.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Stavke SB-12, SB-36 i SB-39 zajedno čine jedinstven korisnički tok — pretraga → filtriranje → detalji oglasa. Implementacija samo jednog dijela (SB-11 lista bez detalja, pretrage i filtera) ne osigurava upotrebljiv sistem u release-u. Sve tri stavke su funkcionalno međusobno zavisne (SB-39 zavisi od SB-36, obje zavise od SB-11, a SB-12 dopunjuje cjelinu), pa ih je tehnički i vremenski opravdano isporučiti zajedno u jednom sprintu.
- **Posljedice odluke:**
  - **SB-12 (Detalji oglasa):** Implementirana je kompletna logika za dohvaćanje i prikaz pojedinačnog oglasa. Uveden je novi API endpoint `GET /api/oglasi/:id` i odgovarajuća React ruta `/oglasi/:id`. Klik na oglas iz liste vodi korisnika na zasebnu stranicu sa svim informacijama o praksi.
  - **SB-36 (Filtriranje oglasa):** Implementirano je filtriranje na strani klijenta po tehnologijama, tipu prakse i trajanju, s mogućnošću resetovanja svih aktivnih filtera. Lista oglasa se ažurira u realnom vremenu pri primjeni filtera.
  - **SB-39 (Pretraživanje oglasa):** Implementiran je kolapsibilni search bar koji pretražuje oglase po ključnoj riječi u nazivu i opisu. Prikazuje se poruka kada nema rezultata za datu pretragu.
- **Status:** Aktivna

---

### DL-S7-03
- **Datum:** 12.05.2026
- **Naziv odluke:** Dodavanje polja "djelatnost" u profil kompanije
- **Opis problema:** Produc Backlog stavka 43 (Pregled profila kompanije) planirana za kasniji rad zahtijeva informaciju o djelatnosti kompanije. Trenutni model `Kompanija` nije sadržavao ovo polje, što bi kasnije dovelo do nekonzistentnosti podataka.
- **Razmatrane opcije:**
  - **Opcija A:** Odložiti dodavanje polja do implementacije stavke 43.
  - **Opcija B:** Odmah ažurirati model i kontrolere u sklopu rada na stavci SB-45 (Uređivanje profila kompanije).
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Proaktivno sprječavanje tehničkog duga. Dodavanjem polja sada, osiguravamo da sve kompanije koje se registruju/uređuju profil u Sprintu 7 odmah unesu potrebne podatke za buduće funkcionalnosti pretrage i filtriranja.
- **Posljedice odluke:**
  - **Baza podataka:** Ažuriran Sequelize model `Kompanija` dodavanjem atributa `djelatnost` tipa `DataTypes.STRING(150)`.
  - **Backend:** U fajlu `users.controller.js`, funkcija `updateCompanyProfileController` sada prihvata i validira polje `djelatnost` unutar `req.body`.
  - **API:** Ruta `PATCH /api/users/company-profile` sada podržava ažuriranje djelatnosti.
  - **Frontend:** Sequelize model `Kompanija` proširen je poljem `djelatnost` (`STRING(150)`), a `updateCompanyProfileController` je ažuriran da prihvata ovaj podatak. Sistem se sada ponaša tako da pri ažuriranju profila preko rute `PATCH /api/users/company-profile`, kompanija može pohraniti i svoju primarnu djelatnost. Ovo polje je odmah vidljivo i na frontend formi, čime se osigurava da baza podataka bude spremna za predstojeće filtriranje oglasa po sektorima.
- **Status:** Aktivna

---


