'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const {
  User, Student, Kompanija, Oglas, PrijavaNaPraksu, Fakultet, SystemSetting, Notifikacija, sequelize,
} = require('../src/infrastructure/database/models');

const PREFIX = 'test_app_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const FUTURE = new Date('2099-12-31');

let studentUser, studentRec, fakultet;
let companyUser, companyRec, oglas;
let studentToken, otherStudentToken, companyToken;

beforeAll(async () => {
  // Čistimo ostavljene podatke iz prethodnog pokretanja
  // Najprije brišemo notifikacije za test korisnike (sprječava NOT NULL constraint error)
  const testUsers = await User.findAll({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => []);
  const testStudents = await Student.findAll({ where: { userID: testUsers.map(u => u.id) } }).catch(() => []);
  const testKompanije = await Kompanija.findAll({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => []);
  if (testStudents.length > 0) {
    await Notifikacija.destroy({ where: { student_id: testStudents.map(s => s.id) } }).catch(() => {});
  }
  if (testKompanije.length > 0) {
    await Notifikacija.destroy({ where: { kompanija_id: testKompanije.map(k => k.id) } }).catch(() => {});
  }
  await PrijavaNaPraksu.destroy({ where: {}, truncate: false }).catch(() => {});
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Fakultet.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await SystemSetting.destroy({ where: { key: 'max_active_applications' } }).catch(() => {});

  const passwordHash = await bcrypt.hash('Test@1234', 10);

  fakultet = await Fakultet.create({ naziv: `${PREFIX}ETF`, email: `${PREFIX}etf@test.com` });

  companyUser = await User.create({
    ime: 'AppTest', prezime: 'Company',
    username: `${PREFIX}company`, email: `${PREFIX}company@test.com`,
    passwordHash, role: 'COMPANY', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  companyRec = await Kompanija.create({ userID: companyUser.id, naziv: `${PREFIX}Firma`, adresa: 'Test 1' });

  oglas = await Oglas.create({
    naziv: `${PREFIX}Oglas`,
    opis: 'Oglas za testiranje prijava',
    brojMjesta: 5,
    rokPrijave: FUTURE,
    status: 'AKTIVAN',
    kompanijaID: companyRec.id,
    tehnologije: [],
    uslovi: [],
  });

  studentUser = await User.create({
    ime: 'AppTest', prezime: 'Student',
    username: `${PREFIX}student`, email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  studentRec = await Student.create({
    userID: studentUser.id,
    index_number: `${PREFIX}IB123456`,
    year_of_study: 3,
    fakultetID: fakultet.id,
  });

  // Student bez kompletnog profila (nema Student record)
  const otherUser = await User.create({
    ime: 'AppTest', prezime: 'Incomplete',
    username: `${PREFIX}incomplete`, email: `${PREFIX}incomplete@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  otherStudentToken = jwt.sign({ id: otherUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });

  studentToken = jwt.sign({ id: studentUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });
  companyToken = jwt.sign({ id: companyUser.id, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  if (studentRec) await Notifikacija.destroy({ where: { student_id: studentRec.id } }).catch(() => {});
  if (companyRec) await Notifikacija.destroy({ where: { kompanija_id: companyRec.id } }).catch(() => {});
  await PrijavaNaPraksu.destroy({ where: {}, truncate: false }).catch(() => {});
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Fakultet.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await SystemSetting.destroy({ where: { key: 'max_active_applications' } }).catch(() => {});
});

// ── GET /api/applications/mine ───────────────────────────────────────────────
describe('GET /api/applications/mine', () => {
  // Testira: student s kompletnim profilom dobija listu svojih prijava
  // Ulaz: GET /api/applications/mine s validnim studentskim JWT tokenom
  // Očekivani izlaz: HTTP 200, niz (može biti prazan)
  test('200 — vraća listu prijava studenta', async () => {
    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Testira: student bez Student recorda dobija prazan niz
  // Ulaz: GET /api/applications/mine s tokenom studenta koji nema Student profil
  // Očekivani izlaz: HTTP 200, prazan niz
  test('200 — student bez profila dobija prazan niz', async () => {
    const res = await request(app)
      .get('/api/applications/mine')
      .set('Authorization', `Bearer ${otherStudentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/applications/mine bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/applications/mine');
    expect(res.status).toBe(401);
  });
});

// ── POST /api/applications ───────────────────────────────────────────────────
describe('POST /api/applications', () => {
  // Testira: student uspješno podnosi prijavu na aktivan oglas
  // Ulaz: POST /api/applications s oglasID aktivnog oglasa i studentskim tokenom
  // Očekivani izlaz: HTTP 201, kreirana prijava sa statusom PODNESENA
  test('201 — student uspješno podnosi prijavu', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ oglasID: oglas.id });

    expect(res.status).toBe(201);
    expect(res.body.application).toMatchObject({
      oglasID: oglas.id,
      studentID: studentRec.id,
      status: 'CEKA_KOORDINATORA',
    });
  });

  // Testira: dupla prijava na isti oglas vraća 409
  // Ulaz: POST /api/applications s istim oglasID dva puta u istom testu
  // Očekivani izlaz: HTTP 409
  test('409 — dupla prijava na isti oglas', async () => {
    await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ oglasID: oglas.id });

    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ oglasID: oglas.id });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/prijavili na ovaj oglas/i);
  });

  // Testira: prijava na nepostojeći oglas vraća 404
  // Ulaz: POST /api/applications s nepostojećim oglasID
  // Očekivani izlaz: HTTP 404
  test('404 — oglas ne postoji', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ oglasID: 999999 });

    expect(res.status).toBe(404);
  });

  // Testira: prijava bez oglasID vraća 404
  // Ulaz: POST /api/applications bez polja oglasID
  // Očekivani izlaz: HTTP 404
  test('404 — nedostaje oglasID', async () => {
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({});

    expect(res.status).toBe(404);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: POST /api/applications bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).post('/api/applications').send({ oglasID: oglas.id });
    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/applications/:id/withdraw ─────────────────────────────────────
describe('PATCH /api/applications/:id/withdraw', () => {
  test('200 — student uspješno odustaje od prijave', async () => {
    const prijava = await PrijavaNaPraksu.findOne({
      where: { studentID: studentRec.id, oglasID: oglas.id },
    });
    expect(prijava).toBeTruthy();

    const res = await request(app)
      .patch(`/api/applications/${prijava.id}/withdraw`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/odustali/i);
    expect(res.body.application.status).toBe('ODUSTAO');
  });

  test('403 — kompanija ne može odustati od prijave', async () => {
    const oglas2 = await Oglas.create({
      naziv: `${PREFIX}OglasWithdraw`,
      opis: 'Oglas za withdraw 403 test',
      brojMjesta: 5,
      rokPrijave: FUTURE,
      status: 'AKTIVAN',
      kompanijaID: companyRec.id,
      tehnologije: [],
      uslovi: [],
    });

    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ oglasID: oglas2.id });

    expect(createRes.status).toBe(201);

    const res = await request(app)
      .patch(`/api/applications/${createRes.body.application.id}/withdraw`)
      .set('Authorization', `Bearer ${companyToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Samo studenti/);
  });
});
