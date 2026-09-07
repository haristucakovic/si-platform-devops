'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const { User, Kompanija, Oglas, sequelize } = require('../src/infrastructure/database/models');

const PREFIX = 'test_lst_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const FUTURE = new Date('2099-12-31');

let companyUser, companyRec, studentUser, oglas;
let companyToken, studentToken;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('Test@1234', 10);

  // Čistimo ostavljene podatke iz prethodnog pokretanja
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});

  companyUser = await User.create({
    ime: 'ListTest', prezime: 'Company',
    username: `${PREFIX}company`, email: `${PREFIX}company@test.com`,
    passwordHash, role: 'COMPANY', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });

  companyRec = await Kompanija.create({
    userID: companyUser.id,
    naziv: `${PREFIX}Firma d.o.o.`,
    adresa: 'Testna 1',
  });

  studentUser = await User.create({
    ime: 'ListTest', prezime: 'Student',
    username: `${PREFIX}student`, email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });

  oglas = await Oglas.create({
    naziv: `${PREFIX}Oglas 1`,
    opis: 'Opis prakse za testiranje',
    brojMjesta: 3,
    rokPrijave: FUTURE,
    datumPocetka: '2099-02-01',
    trajanje: 3,
    status: 'AKTIVAN',
    kompanijaID: companyRec.id,
    tehnologije: ['JavaScript'],
    uslovi: [],
  });

  companyToken = jwt.sign({ id: companyUser.id, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '1h' });
  studentToken = jwt.sign({ id: studentUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } });
  await sequelize.close();
});

// ── GET /api/listings/active ─────────────────────────────────────────────────
describe('GET /api/listings/active', () => {
  // Testira: autentificirani korisnik dobija listu aktivnih oglasa
  // Ulaz: GET /api/listings/active s validnim JWT tokenom
  // Očekivani izlaz: HTTP 200, niz koji sadrži kreirani oglas
  test('200 — vraća aktivne oglase', async () => {
    const res = await request(app)
      .get('/api/listings/active')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const found = res.body.find(o => o.id === oglas.id);
    expect(found).toBeDefined();
    expect(found.naziv).toBe(oglas.naziv);
  });

  // Testira: endpoint je javan — vraća oglas bez tokena
  // Ulaz: GET /api/listings/active bez Authorization headera
  // Očekivani izlaz: HTTP 200 (javni endpoint, autentifikacija nije obavezna)
  test('200 — vraća aktivne oglase bez tokena (javni endpoint)', async () => {
    const res = await request(app).get('/api/listings/active');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ── POST /api/listings ───────────────────────────────────────────────────────
describe('POST /api/listings', () => {
  // Testira: kompanija uspješno kreira novi oglas
  // Ulaz: POST /api/listings s validnim podacima kompanije koja je odobrena i verifikovana
  // Očekivani izlaz: HTTP 201, oglas kreiran u bazi s ispravnim podacima
  test('201 — kompanija uspješno kreira oglas', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        naziv: `${PREFIX}Novi oglas`,
        opis: 'Detaljan opis prakse',
        brojMjesta: 2,
        rokPrijave: '2099-06-01',
        datumPocetka: '2099-07-01',
        trajanje: 3,
        tip: 'Remote',
      });

    expect(res.status).toBe(201);
    expect(res.body.oglas).toMatchObject({ naziv: `${PREFIX}Novi oglas`, brojMjesta: 2, status: 'AKTIVAN' });
    await Oglas.destroy({ where: { id: res.body.oglas.id } });
  });

  // Testira: kreiranje oglasa bez obaveznih polja vraća 400
  // Ulaz: POST /api/listings bez polja naziv
  // Očekivani izlaz: HTTP 400 s porukom o grešci
  test('400 — nedostaju obavezni podaci', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ opis: 'Samo opis', brojMjesta: 1, rokPrijave: '2099-01-01' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: kreiranje oglasa bez datuma početka prakse nije dozvoljeno
  // Ulaz: POST /api/listings s trajanjem, ali bez datumPocetka
  // Očekivani izlaz: HTTP 400 i jasna poruka validacije
  test('400 — datum početka prakse je obavezan', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({
        naziv: `${PREFIX}Bez početka`,
        opis: 'Opis',
        brojMjesta: 1,
        rokPrijave: '2099-06-01',
        trajanje: 3,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Datum početka prakse je obavezan.');
  });

  // Testira: kreiranje oglasa s rokom prijave u prošlosti vraća 400
  // Ulaz: POST /api/listings s rokPrijave koji je u prošlosti
  // Očekivani izlaz: HTTP 400
  test('400 — rok prijave u prošlosti', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: `${PREFIX}Prošli`, opis: 'X', brojMjesta: 1, rokPrijave: '2000-01-01' });

    expect(res.status).toBe(400);
  });

  // Testira: student ne može kreirati oglas
  // Ulaz: POST /api/listings s studentskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — student ne može kreirati oglas', async () => {
    const res = await request(app)
      .post('/api/listings')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ naziv: `${PREFIX}X`, opis: 'X', brojMjesta: 1, rokPrijave: '2099-01-01' });

    expect(res.status).toBe(403);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: POST /api/listings bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).post('/api/listings').send({});
    expect(res.status).toBe(401);
  });
});

// ── GET /api/listings/company ────────────────────────────────────────────────
describe('GET /api/listings/company', () => {
  // Testira: kompanija dobija listu svojih oglasa
  // Ulaz: GET /api/listings/company s kompanijskim JWT tokenom
  // Očekivani izlaz: HTTP 200, niz oglasa koji sadrži kreiran oglas
  test('200 — vraća oglase kompanije', async () => {
    const res = await request(app)
      .get('/api/listings/company')
      .set('Authorization', `Bearer ${companyToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.find(o => o.id === oglas.id)).toBeDefined();
  });

  // Testira: student ne može dobiti listu oglasa kompanije
  // Ulaz: GET /api/listings/company s studentskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — student ne može pristupiti', async () => {
    const res = await request(app)
      .get('/api/listings/company')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});

// ── PUT /api/listings/:id ────────────────────────────────────────────────────
describe('PUT /api/listings/:id', () => {
  // Testira: kompanija uspješno ažurira vlastiti oglas
  // Ulaz: PUT /api/listings/:id s validnim podacima i kompanijskim tokenom
  // Očekivani izlaz: HTTP 200, oglas ažuriran s novim podacima
  test('200 — uspješno ažurira oglas', async () => {
    const res = await request(app)
      .put(`/api/listings/${oglas.id}`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: `${PREFIX}Ažurirani`, opis: 'Novi opis', brojMjesta: 5, rokPrijave: '2099-11-01', datumPocetka: '2099-12-01', trajanje: 3 });

    expect(res.status).toBe(200);
    expect(res.body.oglas.naziv).toBe(`${PREFIX}Ažurirani`);
    expect(res.body.oglas.brojMjesta).toBe(5);
  });

  // Testira: ažuriranje nepostojećeg oglasa vraća 404
  // Ulaz: PUT /api/listings/999999 s validnim podacima
  // Očekivani izlaz: HTTP 404
  test('404 — oglas ne postoji', async () => {
    const res = await request(app)
      .put('/api/listings/999999')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: 'X', opis: 'X', brojMjesta: 1, rokPrijave: '2099-01-01' });

    expect(res.status).toBe(404);
  });

  // Testira: ažuriranje oglasa s rokom u prošlosti vraća 400
  // Ulaz: PUT /api/listings/:id s rokPrijave koji je u prošlosti
  // Očekivani izlaz: HTTP 400
  test('400 — rok prijave u prošlosti', async () => {
    const res = await request(app)
      .put(`/api/listings/${oglas.id}`)
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: 'X', opis: 'X', brojMjesta: 1, rokPrijave: '2000-01-01' });

    expect(res.status).toBe(400);
  });

  // Testira: student ne može ažurirati oglas
  // Ulaz: PUT /api/listings/:id s studentskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — student ne može ažurirati oglas', async () => {
    const res = await request(app)
      .put(`/api/listings/${oglas.id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ naziv: 'X', opis: 'X', brojMjesta: 1, rokPrijave: '2099-01-01' });

    expect(res.status).toBe(403);
  });
});
