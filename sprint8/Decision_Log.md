# Decision Log

## Sprint 8

### DL-S8-01
- **Datum:** 18.05.2026
- **Naziv odluke:** Preuzimanje funkcionalnosti iz Sprinta 9 u Sprint 8
- **Opis problema:** Tokom planiranja Sprinta 8 uočeno je da postoje funkcionalnosti iz Sprinta 9 koje su direktno povezane sa već planiranim funkcionalnostima oglasa i korisničkog iskustva u Sprintu 8. Bez tih funkcionalnosti sistem ne bi pružao kompletan tok prijave studenta na praksu.
- **Razmatrane opcije:**
  - **Opcija A:** Zadržati funkcionalnosti u Sprintu 9 prema originalnom planu.
  - **Opcija B:** Prebaciti dio funkcionalnosti iz Sprinta 9 u Sprint 8 kako bi korisnički tok bio funkcionalniji.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Funkcionalnosti prijave na praksu, upload-a dokumentacije i student dashboarda direktno dopunjuju postojeće funkcionalnosti oglasa, favoriziranja i upravljanja prijavama. Implementacija u istom sprintu omogućava kompletniji i smisleniji korisnički tok za studente.
- **Posljedice odluke:**
  - Stavka **SB-13 – Prijava na praksu** prebačena je iz Sprinta 9 u Sprint 8
  - Stavka **SB-14 – Upload dokumentacije** prebačena je iz Sprinta 9 u Sprint 8
  - Stavka **SB-35 – Student dashboard** prebačena je iz Sprinta 9 u Sprint 8
  - Sprint 8 proširen je funkcionalnostima vezanim za kompletan proces prijave studenta na praksu
  - Sprint 9 je rasterećen dijela funkcionalnosti kako bi fokus ostao na preostalim naprednim funkcionalnostima sistema
- **Status:** Aktivna

---

### DL-S8-02
- **Datum:** 19.05.2026
- **Naziv odluke:** Grupisanje funkcionalnosti oglasa i prijava u isti sprint
- **Opis problema:** Funkcionalnosti uređivanja oglasa, upravljanja rokovima prijave, favoriziranja oglasa i prijave na praksu međusobno su zavisne i predstavljaju jedinstven korisnički tok.
- **Razmatrane opcije:**
  - **Opcija A:** Implementirati funkcionalnosti kroz više odvojenih sprintova.
  - **Opcija B:** Grupisati povezane funkcionalnosti u okviru Sprinta 8.
- **Odabrana opcija:** Opcija B
- **Razlog izbora:** Grupisanje povezanih funkcionalnosti omogućava lakše testiranje kompletnog toka rada i smanjuje potrebu za privremenim rješenjima između sprintova.
- **Posljedice odluke:**
  - Funkcionalnosti oglasa i prijava implementirane su i testirane kao povezana cjelina
  - Omogućeno je end-to-end testiranje toka: pregled oglasa → favoriziranje → prijava → upload dokumentacije
  - Smanjena je potreba za dodatnim izmjenama navigacije i korisničkog interfejsa u narednim sprintovima
- **Status:** Aktivna