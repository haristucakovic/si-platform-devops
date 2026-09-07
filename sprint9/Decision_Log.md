# Decision Log

## Sprint 9

### DL-S9-01
- **Datum:** 19.05.2026
- **Naziv odluke:** Preuzimanje Odbijanja prakse iz Sprinta 10 u Sprint 9
- **Opis problema:** Odobravanje prakse (US-17) planirano je za Sprint 9, ali logički komplementarna funkcionalnost — Odbijanje prakse (US-18) — originalno je bila planirana za Sprint 10. Bez mogućnosti odbijanja, koordinator ne bi imao kompletan set akcija nad prijavama u okviru istog sprinta, što bi rezultiralo nepotpunim i nefunkcionalnim koordinatorskim tokom.
- **Razmatrane opcije:**
  - **Opcija A:** Zadržati Odbijanje prakse u Sprintu 10 prema originalnom planu.
  - **Opcija B:** Prebaciti Odbijanje prakse u Sprint 9 kako bi koordinatorski tok bio potpun.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Odobravanje i odbijanje su dvije strane iste koordinatorske akcije i ne mogu biti funkcionalno razdvojene između sprintova. Implementacija samo jedne strane bez druge čini koordinatorski interfejs nepotpunim i neupotrebljivim u realnom scenariju.
- **Posljedice odluke:**
  - Stavka **SB-18 – Odbijanje prakse** prebačena je iz Sprinta 10 u Sprint 9
  - Koordinator sada ima kompletan set akcija nad prijavama (odobravanje i odbijanje) unutar jednog sprinta
  - Sprint 10 je rasterećen ove stavke, čime se oslobađa kapacitet za preostale napredne funkcionalnosti
- **Status:** Aktivna

---

### DL-S9-02
- **Datum:** 19.05.2026
- **Naziv odluke:** Preuzimanje Notifikacija o statusu prakse iz Sprinta 10 u Sprint 9
- **Opis problema:** Sistem notifikacija o statusu prakse (US-37) originalno je bio planiran za Sprint 10, ali sve akcije koje generišu notifikacije (selekcija, odobravanje, odbijanje, zatvaranje oglasa) implementirane su u Sprintu 9. Odlaganje notifikacija u Sprint 10 značilo bi da promjene statusa u Sprintu 9 ne bi imale nikakvu povratnu informaciju prema studentima.
- **Razmatrane opcije:**
  - **Opcija A:** Implementirati notifikacije u Sprintu 10 prema originalnom planu; u Sprintu 9 statusne promjene ne bi generirale notifikacije.
  - **Opcija B:** Prebaciti notifikacije u Sprint 9 kako bi sistem odmah slao obavijesti uz svaku statusnu promjenu.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Notifikacije su direktno vezane za akcije koje se implementiraju u Sprintu 9. Implementacija statusnih promjena bez notifikacija dovela bi do lošeg korisničkog iskustva i zahtijevala bi naknadne izmjene logike u Sprintu 10. Grupisanjem u isti sprint postiže se konzistentno i testabilno iskustvo od prvog dana.
- **Posljedice odluke:**
  - Stavka **SB-37 – Notifikacije o statusu prakse** prebačena je iz Sprinta 10 u Sprint 9
  - Sve statusne promjene implementirane u Sprintu 9 odmah generišu odgovarajuće notifikacije
  - Podešavanje tipova notifikacija (SB-55) realizovano je u istom sprintu, čime je notifikacijski sistem isporučen kao funkcionalna cjelina
  - Sprint 10 je rasterećen ove stavke
- **Status:** Aktivna

---

### DL-S9-03
- **Datum:** 21.05.2026
- **Naziv odluke:** Implementacija Audit loga kao centralizovane servisne komponente
- **Opis problema:** Audit log mora bilježiti akcije iz više različitih modula sistema (registracije, prijave, oglasi, upravljanje nalozima). Postojala je dilema između distribuiranog pristupa (svaki modul bilježi vlastite akcije) i centralizovanog pristupa (jedna servisna komponenta).
- **Razmatrane opcije:**
  - **Opcija A:** Svaki modul samostalno bilježi akcije u audit log tablicu.
  - **Opcija B:** Implementirati centralnu audit log servisnu komponentu koju pozivaju svi moduli.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Centralizovana komponenta osigurava konzistentno bilježenje (isti format zapisa, isti nivo detalja) bez dupliciranja logike. Lakše je osigurati da nijedna akcija nije propuštena, a buduće izmjene formata zapisa zahtijevaju promjenu samo na jednom mjestu.
- **Posljedice odluke:**
  - Audit log je implementiran kao zajednička servisna komponenta dostupna svim modulima sistema
  - Svi moduli koji mijenjaju stanje podataka pozivaju centralnu komponentu za bilježenje akcija
  - Konzistentnost zapisa je osigurana; dodavanje novih tipova akcija u budućim sprintovima ne zahtijeva izmjene u više mjesta
- **Status:** Aktivna
