# Sprint Retrospective Summary

## Sprint broj
Sprint 9

## Šta je išlo dobro

- Sve planirane funkcionalnosti za Sprint 9 su uspješno implementirane
- Kompletan tok selekcije i odobravanja prijava (selekcija → odobravanje/odbijanje) realizovan je kao funkcionalna cjelina
- Sistem notifikacija uspješno je integrisan sa svim statusnim promjenama prijave
- Upravljanje životnim ciklusom oglasa (zatvaranje → arhiviranje) implementirano je konzistentno i bez regrekcija na postojeće funkcionalnosti
- Audit log implementiran je kao centralizovana komponenta koja pokriva sve ključne akcije sistema
- Tim je uspješno preuzeo dvije stavke iz Sprinta 10 (odbijanje prakse i notifikacije) i integrirao ih u sprint bez uticaja na ostatak planiranih zadataka
- Testiranje statusnih prijelaza prijave provedeno je koordinirano između frontend i backend članova tima

## Šta nije išlo dobro

- Implementacija statusnih prijelaza prijave zahtijevala je više iteracija zbog rubnih slučajeva (npr. pokušaj odobravanja već odbijene prijave)
- Usklađivanje sistema notifikacija s korisničkim podešavanjima tipova notifikacija dovelo je do dodatnih izmjena u logici slanja
- Koordinacija između modula selekcije (kompanija) i odobravanja (koordinator) zahtijevala je zajednički pregled toka podataka koji nije bio u potpunosti definisan na početku sprinta
- Audit log je u početnoj fazi imao nepotpuno pokrivanje svih akcija, što je zahtijevalo naknadne dopune

## Šta treba promijeniti

- Statusne prijelaze i poslovnu logiku kompleksnih tokova (višerolnih procesa) treba preciznije definisati u fazi planiranja sprinta
- Integraciono testiranje višerolnih funkcionalnosti (kompanija + koordinator) treba planirati ranije i uključiti oba člana odgovornih za frontend i backend
- Definiciju pokrivenosti audit loga treba dogovoriti na početku implementacije kako bi svi moduli bilježili akcije na konzistentan način
- Notifikacijska logika treba biti dokumentovana kao dio acceptance criteria kako bi se smanjio broj naknadnih izmjena

## Koje konkretne akcije tim uvodi u narednom sprintu

- Tim će na početku planiranja nacrtati dijagram statusnih prijelaza za sve ključne entitete (prijave, prakse) kako bi svi članovi imali zajednički referentni okvir
- Višerolni tokovi (npr. student → kompanija → koordinator) bit će testirani end-to-end čim su individualne komponente završene, a ne tek na kraju sprinta
- Audit log pokrivenost bit će uključena u Definition of Done svake stavke koja mijenja stanje podataka
- Notifikacijski zahtjevi bit će eksplicitno navedeni u acceptance criteria svakog user storija koji uključuje promjenu statusa
