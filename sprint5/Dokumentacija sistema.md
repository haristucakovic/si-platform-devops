# PraksaHub  
## Dokumentacija sistema (Sprint 5)


# 1. Uvod

## 1.1 Svrha dokumenta

Ovaj dokument predstavlja formalnu tehničku dokumentaciju sistema *PraksaHub* do završetka Sprinta 5. Dokument opisuje arhitekturu, implementiranu funkcionalnost, strukturu baze podataka i tehnološki stack sistema.

Dokumentacija se kontinuirano ažurira na kraju svakog sprinta i predstavlja referentni izvor informacija o trenutnom stanju sistema.

## 1.2 Opseg sistema

PraksaHub je aplikacija čija je svrha povezivanje studenata, fakulteta i kompanija u procesu realizacije stručne prakse.

Sistem omogućava:

- Registraciju i upravljanje korisničkim računima
- Administratorsko upravljanje rolama
- Centralizovano upravljanje podacima o korisnicima
- Javnu prezentaciju sistema putem početne stranice

U Sprintu 5 implementirani su osnovni infrastrukturni i administrativni moduli.

---

# 2. Analiza postojećih rješenja

Analiza tržišta postojećih sistema za upravljanje studentskim praksama pokazala je sljedeće karakteristike:

- Većina sistema je monolitnog tipa bez jasne podjele rola
- Nedostatak automatizacije procesa odobravanja
- Ograničena integracija između fakulteta i kompanija
- Nedovoljna transparentnost statusa prijava

PraksaHub se razlikuje po:

- Jasnoj podjeli korisničkih rola (student, kompanija, koordinator, administrator)
- Relacijskoj strukturi podataka
- Skalabilnoj arhitekturi
- Planiranoj automatizaciji procesa (u narednim sprintovima)

---

# 3. Arhitektura sistema

## 3.1 Arhitekturni model

Sistem je implementiran koristeći troslojnu arhitekturu:

1. Prezentacijski sloj (Frontend)
2. Poslovni sloj (Backend)
3. Infrastrukturni sloj (Baza podataka i storage)

Komunikacija između slojeva realizovana je putem REST API-ja.

Korisnik (Browser)

       ↓

React Frontend

       ↓

Node.js + Express API

       ↓

PostgreSQL (Supabase)

---

# 4. Tehnološki stack

## 4.1 Frontend

- React 18.x
- Vite 5.x
- React Router DOM 6.x
- Tailwind CSS 3.x
- Context API za globalno upravljanje autentifikacijom
- Fetch API za komunikaciju sa backendom

## 4.2 Backend

- Node.js 20.x LTS
- Express 4.x
- jsonwebtoken 9.x
- bcrypt 5.x
- Multer 1.x
- Nodemailer 6.x
- cors 2.x
- helmet 7.x
- node-cron 3.x
- dotenv 16.x

## 4.3 Baza podataka

- PostgreSQL 16 (Supabase)
- Sequelize ORM 6.x
- Sequelize CLI za migracije

## 4.4 File Storage

- Supabase Storage (za CV, dokumente i ugovore)

---

# 5. Dizajn baze podataka

## 5.1 Pregled entiteta

U Sprintu 5 implementirana je kompletna struktura baze podataka.

Postojeće tabele:

- users
- students
- kompanije
- koordinatori
- fakulteti
- oglasi
- prijave_na_praksu
- prakse
- ugovori
- aktivnosti
- prisustva
- evaluacije
- izvjestaji

---

## 5.2 Ključne relacije

### Users
Centralna tabela sistema.

Relacije:
- 1:1 sa students
- 1:1 sa kompanije
- 1:1 sa koordinatori

---

### Studenti
Povezani sa:
- fakulteti
- prijave_na_praksu

---

### Kompanije
Povezane sa:
- oglasi

---

### Oglasi
Povezani sa:
- kompanije
- prijave_na_praksu

---

### Prijave_na_praksu
Predstavlja veznu tabelu između:
- students
- oglasi

---

### Prakse
Nastaju na osnovu odobrenih prijava.

---

## 5.3 Normalizacija

Model baze podataka je normalizovan do najmanje treće normalne forme (3NF):

- Nema redundantnih podataka
- Relacije su jasno definisane
- Svi entiteti imaju primarni ključ
- Strani ključevi osiguravaju referencijalni integritet

---

# 6. Implementirane funkcionalnosti (Sprint 5)

## 6.1 Administratorski modul

Implementirano:

- Poseban administratorski interfejs
- Pregled svih korisnika
- Dodjela i izmjena rola
- Ograničen pristup samo administratoru

Sigurnosni mehanizam:
- JWT autentifikacija
- RBAC middleware

---

## 6.2 Početna stranica (Landing page)

Omogućava:

- Prikaz osnovnih informacija o sistemu
- Navigaciju ka registraciji i prijavi
- Pristup neprijavljenim korisnicima

---

## 6.3 Privacy Policy i User Terms

- Javna dostupnost bez prijave
- Informisanje korisnika o obradi podataka
- Usklađenost sa principima zaštite podataka

---

## 6.4 Tamni režim rada

Implementirana mogućnost:

- Prebacivanja između svijetle i tamne teme
- Globalno upravljanje temom
- Intuitivno korisničko iskustvo

---


# 7. Deployment (Development faza)

## 7.1 Hosting aplikacije

Frontend: Render Static Site  
Backend: Render Web Service (Docker kontejner)

## 7.2 Baza podataka

- Supabase PostgreSQL
- Online pristup putem web dashboard-a

## 7.3 CI/CD

- Automatski deploy pri push-u na main branch
- Docker kontejnerizacija backend-a

---

# 8. GitFlow strategija

Sistem koristi Gitflow model sa sljedećim granama:

- main – produkcijska verzija
- develop – razvojna integracija
- feature/*
- fix/*
- release/*
- hotfix/*
- chore/*
- docs/*

Commit poruke prate Conventional Commits standard.

---

# 9. Plan daljeg razvoja

U narednim sprintovima planirana je implementacija:

- Registracije korisnika
- Prijave na praksu
- Upload dokumentacije
- Evaluacija studenata
- Generisanje ugovora
- Notifikacioni sistem

---

# 10. Zaključak

Do završetka Sprinta 5 implementirana je kompletna infrastrukturna osnova sistema PraksaHub. Definisana je relacijska struktura baze podataka, implementiran administratorski modul i uspostavljena troslojna arhitektura sistema.

Sistem je postavljen na skalabilnu osnovu koja omogućava postepeno dodavanje funkcionalnosti u narednim sprintovima bez potrebe za arhitekturnim izmjenama.

Dokumentacija će biti ažurirana po završetku svakog narednog sprinta kako bi reflektovala aktuelno stanje sistema.

---
