'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const {
  User, Student, Kompanija, Oglas, OmiljeniOglas, sequelize,
} = require('../src/infrastructure/database/models');

const PREFIX = 'test_fav_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const FUTURE = new Date('2099-12-31');

let studentUser, studentRec, companyUser, companyRec, oglas;
let studentToken, companyToken;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('Test@1234', 10);

  // Čistimo ostavljene podatke iz prethodnog pokretanja
  await OmiljeniOglas.destroy({ where: {} }).catch(() => {});
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});

  companyUser = await User.create({
    ime: 'FavTest', prezime: 'Company',
    username: `${PREFIX}company`, email: `${PREFIX}company@test.com`,
    passwordHash, role: 'COMPANY', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  companyRec = await Kompanija.create({ userID: companyUser.id, naziv: `${PREFIX}Firma`, adresa: 'Test 1' });

  oglas = await Oglas.create({
    naziv: `${PREFIX}Oglas`,
    opis: 'Oglas za testiranje omiljenih',
    brojMjesta: 2,
    rokPrijave: FUTURE,
    status: 'AKTIVAN',
    kompanijaID: companyRec.id,
    tehnologije: [],
    uslovi: [],
  });

  studentUser = await User.create({
    ime: 'FavTest', prezime: 'Student',
    username: `${PREFIX}student`, email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  studentRec = await Student.create({
    userID: studentUser.id,
    index_number: `${PREFIX}IB000001`,
    year_of_study: 2,
    fakultetID: null,
  });

  studentToken = jwt.sign({ id: studentUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });
  companyToken = jwt.sign({ id: companyUser.id, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await OmiljeniOglas.destroy({ where: {} }).catch(() => {});
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await sequelize.close();
});

// ── GET /api/favourites ──────────────────────────────────────────────────────
describe('GET /api/favourites', () => {
  // Testira: student dobija listu ID-ova omiljenih oglasa
  // Ulaz: GET /api/favourites s validnim studentskim JWT tokenom
  // Očekivani izlaz: HTTP 200, niz
  test('200 — vraća listu omiljenih', async () => {
    const res = await request(app)
      .get('/api/favourites')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.ids)).toBe(true);
  });

  // Testira: kompanija ne može pristupiti omiljenim
  // Ulaz: GET /api/favourites s kompanijskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — kompanija ne može pristupiti', async () => {
    const res = await request(app)
      .get('/api/favourites')
      .set('Authorization', `Bearer ${companyToken}`);

    expect(res.status).toBe(403);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/favourites bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/favourites/:oglasId ────────────────────────────────────────────
describe('POST /api/favourites/:oglasId', () => {
  // Testira: student uspješno dodaje oglas u omiljene
  // Ulaz: POST /api/favourites/:oglasId s validnim oglasId i studentskim tokenom
  // Očekivani izlaz: HTTP 201, poruka o uspjehu
  test('201 — uspješno dodaje oglas u omiljene', async () => {
    const res = await request(app)
      .post(`/api/favourites/${oglas.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: dodavanje istog oglasa ponovo vraća 201 (idempotentno)
  // Ulaz: POST /api/favourites/:oglasId s istim oglasId koji je već u omiljenim
  // Očekivani izlaz: HTTP 201 (vraća existing bez greške)
  test('201 — ponovljeno dodavanje je idempotentno', async () => {
    const res = await request(app)
      .post(`/api/favourites/${oglas.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(201);
  });

  // Testira: dodavanje nepostojećeg oglasa vraća 404
  // Ulaz: POST /api/favourites/999999 s validnim studentskim tokenom
  // Očekivani izlaz: HTTP 404
  test('404 — oglas ne postoji', async () => {
    const res = await request(app)
      .post('/api/favourites/999999')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: POST /api/favourites/:oglasId bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).post(`/api/favourites/${oglas.id}`);
    expect(res.status).toBe(401);
  });
});

// ── DELETE /api/favourites/:oglasId ─────────────────────────────────────────
describe('DELETE /api/favourites/:oglasId', () => {
  // Testira: student uspješno uklanja oglas iz omiljenih
  // Ulaz: DELETE /api/favourites/:oglasId s validnim studentskim tokenom (oglas je u omiljenim)
  // Očekivani izlaz: HTTP 200, poruka o uspjehu
  test('200 — uspješno uklanja oglas iz omiljenih', async () => {
    const res = await request(app)
      .delete(`/api/favourites/${oglas.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: uklanjanje oglasa koji nije u omiljenim vraća 200 (idempotentno)
  // Ulaz: DELETE /api/favourites/:oglasId s oglasId koji nije u omiljenim
  // Očekivani izlaz: HTTP 200
  test('200 — uklanjanje neomiljenog oglasa je idempotentno', async () => {
    const res = await request(app)
      .delete(`/api/favourites/${oglas.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: DELETE /api/favourites/:oglasId bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).delete(`/api/favourites/${oglas.id}`);
    expect(res.status).toBe(401);
  });
});
