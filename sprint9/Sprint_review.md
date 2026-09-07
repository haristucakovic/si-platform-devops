# Sprint Review Summary

## Sprint broj  
Sprint 9  

## Planirani sprint goal  
Implementirati kompletan tok selekcije i odobravanja prijava na praksu, upravljati životnim ciklusom oglasa kroz zatvaranje i arhiviranje, te uvesti napredne alate za koordinatore, kompanije, administratore i studente: sistem notifikacija o statusu prakse, pregled statistike prijava, audit log historije aktivnosti i ograničenje broja prijava po studentu.

---

## Šta je završeno  

- SB-16 – Selekcija kandidata  
- SB-17 – Odobravanje prakse  
- SB-18 – Odbijanje prakse (preuzeto iz Sprinta 10)  
- SB-31 – Zatvaranje oglasa  
- SB-37 – Notifikacije o statusu prakse (preuzeto iz Sprinta 10)  
- SB-49 – Arhiviranje oglasa  
- SB-50 – Pregled statistike prijava  
- SB-51 – Historija aktivnosti (Audit log)  
- SB-53 – Ograničenje broja prijava po studentu  
- SB-55 – Podešavanje tipova notifikacija  
- SB-57 – Pregled zatvorenih oglasa  

Sve planirane stavke Sprinta 9 su realizovane, zajedno sa dvije funkcionalnosti preuzete iz Sprinta 10 radi kompletiranja toka upravljanja prijavama i sistema notifikacija.

---

## Šta nije završeno  

Sve planirane funkcionalnosti su završene. Nema prenesenih stavki u naredni sprint.

---

## Demonstrirane funkcionalnosti ili artefakti  

### Selekcija kandidata  
Kompanija može označiti kandidate koji prolaze u uži krug selekcije direktno iz liste prijava na oglas. Sistem ažurira status prijave i obavještava studenta o promjeni. Onemogućena je selekcija kandidata na tuđim oglasima te selekcija od strane neprijavljene kompanije.

### Odobravanje prakse  
Koordinator može odobriti studentsku prijavu za praksu putem koordinatorskog sučelja. Sistem ažurira status prijave i šalje obavijest studentu. Onemogućeno je odobravanje bez odgovarajuće koordinatorske role te odobravanje već odobrene ili odbijene prijave.

### Odbijanje prakse  
Koordinator može odbiti studentsku prijavu za praksu uz automatsku obavijest studentu. Sistem spriječava odbijanje bez odgovarajuće role te odbijanje već odobrene ili završene prijave.

### Zatvaranje oglasa  
Kompanija može zatvoriti aktivan oglas, čime se onemogućava pristizanje novih prijava. Zatvoreni oglas se ne pojavljuje u listi aktivnih oglasa, a kandidati koji čekaju na odgovor bivaju obaviješteni. Sistem spriječava zatvaranje tuđih oglasa.

### Arhiviranje oglasa  
Kompanija može arhivirati zatvoren oglas radi zadržavanja evidencije bez prikazivanja studentima. Arhivirani oglasi su vidljivi kompaniji u posebnoj sekciji uz mogućnost vraćanja iz arhive. Sistem ne dopušta arhiviranje aktivnog oglasa koji nije prethodno zatvoren.

### Notifikacije o statusu prakse  
Student prima in-app i email notifikacije o svakoj promjeni statusa prijave (selekcija, odobravanje, odbijanje od strane kompanije i koordinatora). Sistem prikazuje notifikacije na dashboardu studenta uz historiju svih primljenih obavijesti i sprečava slanje duplikata za istu promjenu statusa.

### Pregled statistike prijava  
Kompanija može pregledati statistiku prijava po oglasu: ukupan broj prijava te distribuciju po odsjeku i godini studija. Statistika je dostupna isključivo za oglase koji pripadaju prijavljenoj kompaniji, a filtriranje po parametrima je omogućeno.

### Historija aktivnosti (Audit log)  
Administrator ima uvid u historiju svih ključnih akcija u sistemu: registracije, promjene statusa prijava, brisanje naloga, uređivanje oglasa i odustajanje od prakse. Svaki zapis sadrži korisnika, vrijeme i tip akcije. Implementirana je pretraga i filtriranje zapisa, a brisanje i izmjena zapisa nisu dozvoljeni ni administratoru.

### Ograničenje broja prijava po studentu  
Administrator može definisati maksimalan broj aktivnih prijava po studentu. Sistem provjerava limit pri svakom pokušaju prijave i vraća jasnu poruku u slučaju prekoračenja. Limit se ne odnosi na već odobrene, odbijene ili završene prijave, a promjena limita je odmah primjenjena.

### Podešavanje tipova notifikacija  
Korisnik može odabrati koje vrste notifikacija želi primati putem postavki profila. Sistem šalje isključivo odabrane notifikacije, pamti korisničke postavke između sesija i primjenjuje promjene odmah. Novi korisnici dobijaju razumne zadane postavke.

### Pregled zatvorenih oglasa  
Student može pregledati listu zatvorenih oglasa i detalje svakog od njih. Zatvoreni oglasi su jasno označeni kao zatvoreni, prijava na njih nije moguća, a arhivirani oglasi se ne prikazuju u ovoj listi.

---

## Glavni problemi i blokeri  

- Implementacija audit loga zahtijevala je pažljivu koordinaciju između svih servisa kako bi se osiguralo da se svaka relevantna akcija bilježi konzistentno bez narušavanja performansi.  
- Tok selekcije i odobravanja prolazi kroz više rola (kompanija → koordinator), što je zahtijevalo preciznu implementaciju statusnih prijelaza i provjere autorizacije na svakom koraku.  
- Integracija sistema notifikacija sa podešavanjima tipova notifikacija zahtijevala je dodatnu koordinaciju kako bi se poštovale korisničke preferencije u svim statusnim prijelazima.  

---

## Ključne odluke donesene u sprintu  

- Funkcionalnosti odbijanja prakse i notifikacija o statusu prakse preuzete su iz Sprinta 10 kako bi cjelokupan tok upravljanja prijavama (selekcija → odobravanje/odbijanje → notifikacija) bio funkcionalan unutar jednog sprinta.  
---

## Povratna informacija Product Ownera  

Product Owner je zadovoljan napretkom. Implementiran je kompletan tok selekcije i odobravanja prijava, životni ciklus oglasa sada je potpuno pokriven, a administrativni alati (audit log, ograničenje prijava, statistika) značajno unapređuju nadzor i upravljanje sistemom. Nije bilo dodatnih zahtjeva niti prijedloga za izmjene.

---

## Zaključak za naredni sprint  

Sprint 9 je uspješno realizovan sa svim planiranim funkcionalnostima i dodatnim stavkama preuzetim iz Sprinta 10. Sistem sada podržava kompletan tok od prijave na praksu do selekcije, odobravanja i odbijanja, uz upravljanje životnim ciklusom oglasa i napredne administrativne alate.  

Fokus narednog sprinta biće finalizacija sistema prakse: potvrda ugovora, evidencija aktivnosti i prisustva, izvještaji, evaluacijski sistem te automatsko završavanje prakse.
