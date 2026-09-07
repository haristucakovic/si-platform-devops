# Risk Register

## R-01: Neispravna autentifikacija korisnika
- **Uzrok:** Greške u implementaciji login/registracije  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Validacija inputa i testiranje autentifikacije  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-02: Sigurnosni propusti i curenje podataka
- **Uzrok:** Rad sa osjetljivim korisničkim podacima  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Enkripcija podataka i sigurnosno testiranje  
- **Odgovorna osoba/uloga:** Backend developer / DevOps  
- **Status:** Otvoren  

---

## R-03: Gubitak podataka o prijavama
- **Uzrok:** Problemi sa bazom ili backup sistemom  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Redovan backup i transakcije baze  
- **Odgovorna osoba/uloga:** DB administrator  
- **Status:** Otvoren  

---

## R-04: Neispravan proces prijave na praksu
- **Uzrok:** Kompleksan workflow između više uloga  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Modeliranje procesa i testiranje scenarija  
- **Odgovorna osoba/uloga:** QA / Software architect  
- **Status:** Otvoren  

---

## R-05: Neispravna kontrola pristupa (role)
- **Uzrok:** Pogrešna implementacija korisničkih uloga  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Implementacija RBAC modela i testiranje  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-06: Loše performanse sistema
- **Uzrok:** Velik broj korisnika i zahtjeva  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Load i stress testiranje  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-07: Problemi sa uploadom dokumenata
- **Uzrok:** Neispravna validacija ili storage fajlova  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Validacija fajlova i testiranje upload-a  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-08: Neusklađenost implementacije sa zahtjevima
- **Uzrok:** Pogrešna interpretacija user stories  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Validacija kroz acceptance criteria  
- **Odgovorna osoba/uloga:** QA / Product Owner  
- **Status:** Otvoren  

---

## R-09: Loš korisnički interfejs
- **Uzrok:** Kompleksnost sistema i loš UX dizajn  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Srednji  
- **Prioritet:** Nizak  
- **Plan mitigacije:** User testing i poboljšanje dizajna  
- **Odgovorna osoba/uloga:** Frontend developer  
- **Status:** Otvoren  

---

## R-10: Kašnjenje u razvoju
- **Uzrok:** Loša procjena vremena i zadataka  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Praćenje sprintova i bolja organizacija  
- **Odgovorna osoba/uloga:** Scrum Master  
- **Status:** Otvoren  

---

## R-11: Neuspješno generisanje ugovora
- **Uzrok:** Kompleksna logika generisanja PDF dokumenta  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje generisanih dokumenata  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-12: Neispravno slanje notifikacija
- **Uzrok:** Problemi sa email servisom ili integracijom  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Retry mehanizam i fallback opcije  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-13: Nedostupnost sistema
- **Uzrok:** Pad servera ili hosting problema  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Monitoring i backup server  
- **Odgovorna osoba/uloga:** DevOps  
- **Status:** Otvoren  

---

## R-14: Neovlašten pristup podacima
- **Uzrok:** Loša kontrola pristupa ili sigurnosne rupe  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Audit pristupa i sigurnosni testovi  
- **Odgovorna osoba/uloga:** DevOps / Security  
- **Status:** Otvoren  

---

## R-15: Problemi sa integracijom sistema
- **Uzrok:** Integracija sa eksternim servisima  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje integracija i fallback rješenja  
- **Odgovorna osoba/uloga:** Backend developer  
- **Status:** Otvoren  

---

## R-16: Nepravilno evidentiranje prisustva
- **Uzrok:** Greške u unosu ili logici sistema  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Validacija unosa i provjera podataka  
- **Odgovorna osoba/uloga:** QA / Backend developer  
- **Status:** Otvoren  

---

## R-17: Nedovoljna skalabilnost sistema
- **Uzrok:** Povećanje broja korisnika  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Optimizacija baze i arhitekture  
- **Odgovorna osoba/uloga:** Software architect  
- **Status:** Otvoren  

---

## R-18: Problemi sa kompatibilnošću
- **Uzrok:** Različiti uređaji i browseri  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Testiranje na više platformi  
- **Odgovorna osoba/uloga:** Frontend developer  
- **Status:** Otvoren  

---

## R-19: Prekoračenje budžeta
- **Uzrok:** Loša procjena troškova i neplanirani izdaci  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Praćenje budžeta i redovne revizije troškova  
- **Odgovorna osoba/uloga:** Project Manager  
- **Status:** Otvoren  

---

## R-20: Elementarne nepogode
- **Uzrok:** Poplave, zemljotresi ili drugi vanjski faktori  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Disaster recovery plan i cloud infrastruktura  
- **Odgovorna osoba/uloga:** DevOps  
- **Status:** Otvoren  

---

## R-21: Zloupotreba privilegija administratora
- **Uzrok:** Prevelike privilegije bez kontrole  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Audit logovi i princip najmanjih privilegija  
- **Odgovorna osoba/uloga:** Security / DevOps  
- **Status:** Otvoren  

---

## R-22: Neefikasan rad koordinatora
- **Uzrok:** Loše upravljanje zadacima i komunikacijom  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Jasno definisane odgovornosti i praćenje rada  
- **Odgovorna osoba/uloga:** Project Manager  
- **Status:** Otvoren  

---

## R-23: Loša organizacija rada u timu
- **Uzrok:** Nedostatak koordinacije i komunikacije  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Uvođenje Agile praksi i redovni sastanci  
- **Odgovorna osoba/uloga:** Scrum Master  
- **Status:** Otvoren  

---

## R-24: Neusklađenost sa zakonima o zaštiti podataka
- **Uzrok:** Nepravilno rukovanje ličnim podacima korisnika  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Usklađivanje sa GDPR i lokalnim zakonima, pravna konsultacija  
- **Odgovorna osoba/uloga:** Security / Project Manager  
- **Status:** Otvoren  

---

## R-25: Neovlašteno korištenje licenci ili softvera
- **Uzrok:** Korištenje biblioteka ili alata bez odgovarajuće licence  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Provjera licenci i korištenje open-source alata sa dozvolom  
- **Odgovorna osoba/uloga:** Backend developer / Project Manager  
- **Status:** Otvoren  

---

## R-26: Pravna odgovornost zbog gubitka ili zloupotrebe podataka
- **Uzrok:** Incidenti sigurnosti ili gubitak podataka korisnika  
- **Vjerovatnoća:** Niska  
- **Uticaj:** Visok  
- **Prioritet:** Visok  
- **Plan mitigacije:** Sigurnosne mjere, backup i pravni ugovori o odgovornosti  
- **Odgovorna osoba/uloga:** Security / Management  
- **Status:** Otvoren  

---

## R-27: Nedostatak jasnih uslova korištenja sistema
- **Uzrok:** Nedefinisani Terms of Service i Privacy Policy  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Izrada pravnih dokumenata (npr. Privacy Policy)  
- **Odgovorna osoba/uloga:** Project Manager / Legal  
- **Status:** Otvoren  

---

## R-28: Neusklađenost sa institucionalnim pravilima (fakultet/organizacija)
- **Uzrok:** Sistem ne prati pravila institucije za praksu  
- **Vjerovatnoća:** Srednja  
- **Uticaj:** Srednji  
- **Prioritet:** Srednji  
- **Plan mitigacije:** Analiza pravilnika i validacija sa stakeholderima  
- **Odgovorna osoba/uloga:** Product Owner / Project Manager  
- **Status:** Otvoren  

---
