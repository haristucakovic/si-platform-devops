'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const { User, Student, Kompanija, Fakultet, sequelize } = require('../src/infrastructure/database/models');

const PREFIX = 'test_usr_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD = 'Test@1234';

let companyUser, companyRec;
let studentUser, studentRec, fakultet;
let companyToken, studentToken;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  fakultet = await Fakultet.create({ naziv: `${PREFIX}ETF`, email: `${PREFIX}etf@test.com` });

  companyUser = await User.create({
    ime: 'UsrTest', prezime: 'Company',
    username: `${PREFIX}company`, email: `${PREFIX}company@test.com`,
    passwordHash, role: 'COMPANY', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  companyRec = await Kompanija.create({
    userID: companyUser.id,
    naziv: `${PREFIX}Firma`,
    adresa: 'Adresa 1',
  });

  studentUser = await User.create({
    ime: 'UsrTest', prezime: 'Student',
    username: `${PREFIX}student`, email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  studentRec = await Student.create({
    userID: studentUser.id,
    index_number: `${PREFIX}IB987654`,
    year_of_study: 2,
    fakultetID: fakultet.id,
  });

  companyToken = jwt.sign({ id: companyUser.id, role: 'COMPANY' }, JWT_SECRET, { expiresIn: '1h' });
  studentToken = jwt.sign({ id: studentUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } });
  await Fakultet.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await sequelize.close();
});

// ── GET /api/users/me ────────────────────────────────────────────────────────
describe('GET /api/users/me', () => {
  // Testira: autentificirani korisnik dobija vlastite podatke bez passwordHash
  // Ulaz: GET /api/users/me s validnim JWT tokenom
  // Očekivani izlaz: HTTP 200, user objekat bez passwordHash
  test('200 — vraća profil prijavljenog korisnika', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(studentUser.id);
    expect(res.body).not.toHaveProperty('passwordHash');
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/users/me bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/users/company-profile ──────────────────────────────────────────
describe('GET /api/users/company-profile', () => {
  // Testira: kompanija dobija vlastiti profil
  // Ulaz: GET /api/users/company-profile s kompanijskim JWT tokenom
  // Očekivani izlaz: HTTP 200, podaci profila kompanije
  test('200 — vraća profil kompanije', async () => {
    const res = await request(app)
      .get('/api/users/company-profile')
      .set('Authorization', `Bearer ${companyToken}`);

    expect(res.status).toBe(200);
    expect(res.body.naziv).toBe(companyRec.naziv);
  });

  // Testira: student ne može pristupiti kompanijskom profilu
  // Ulaz: GET /api/users/company-profile s studentskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — student ne može pristupiti', async () => {
    const res = await request(app)
      .get('/api/users/company-profile')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/users/company-profile ────────────────────────────────────────
describe('PATCH /api/users/company-profile', () => {
  // Testira: kompanija uspješno ažurira vlastiti profil
  // Ulaz: PATCH /api/users/company-profile s novim podacima i kompanijskim tokenom
  // Očekivani izlaz: HTTP 200, ažurirani podaci profila
  test('200 — uspješno ažurira profil kompanije', async () => {
    const res = await request(app)
      .patch('/api/users/company-profile')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: `${PREFIX}Ažurirana firma`, adresa: 'Nova adresa 2' });

    expect(res.status).toBe(200);
    expect(res.body.profile.naziv).toBe(`${PREFIX}Ažurirana firma`);
    expect(res.body.profile.adresa).toBe('Nova adresa 2');
  });

  // Testira: ažuriranje bez obaveznog polja naziv vraća 400
  // Ulaz: PATCH /api/users/company-profile bez naziva kompanije
  // Očekivani izlaz: HTTP 400
  test('400 — naziv je obavezan', async () => {
    const res = await request(app)
      .patch('/api/users/company-profile')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: '', adresa: 'Adresa' });

    expect(res.status).toBe(400);
  });

  // Testira: ažuriranje s neispravnim telefonskim brojem vraća 400
  // Ulaz: PATCH /api/users/company-profile s neispravnim telefonom
  // Očekivani izlaz: HTTP 400
  test('400 — neispravan telefon', async () => {
    const res = await request(app)
      .patch('/api/users/company-profile')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ naziv: `${PREFIX}Firma`, adresa: 'Adresa', telefon: '123' });

    expect(res.status).toBe(400);
  });
});

// ── GET /api/users/deactivation-check ───────────────────────────────────────
describe('GET /api/users/deactivation-check', () => {
  // Testira: student bez aktivnih prijava može deaktivirati nalog
  // Ulaz: GET /api/users/deactivation-check s studentskim JWT tokenom
  // Očekivani izlaz: HTTP 200, canDeactivate true ili false
  test('200 — vraća status deaktivacije za studenta', async () => {
    const res = await request(app)
      .get('/api/users/deactivation-check')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canDeactivate');
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/users/deactivation-check bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/users/deactivation-check');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/users/company-deactivation-check ────────────────────────────────
describe('GET /api/users/company-deactivation-check', () => {
  // Testira: kompanija dobija status deaktivacije
  // Ulaz: GET /api/users/company-deactivation-check s kompanijskim tokenom
  // Očekivani izlaz: HTTP 200, canDeactivate true ili false
  test('200 — vraća status deaktivacije za kompaniju', async () => {
    const res = await request(app)
      .get('/api/users/company-deactivation-check')
      .set('Authorization', `Bearer ${companyToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('canDeactivate');
  });
});

// ── PUT /api/users/student/update ────────────────────────────────────────────
describe('PUT /api/users/student/update', () => {
  // Testira: student uspješno ažurira ime i prezime
  // Ulaz: PUT /api/users/student/update s novim ime/prezime i studentskim tokenom
  // Očekivani izlaz: HTTP 200, ažurirani podaci bez passwordHash
  test('200 — uspješno ažurira ime i prezime', async () => {
    const res = await request(app)
      .put('/api/users/student/update')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ ime: 'NovoIme', prezime: 'NovoPrezime' });

    expect(res.status).toBe(200);
    expect(res.body.user.ime).toBe('NovoIme');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  // Testira: promjena lozinke bez trenutne lozinke vraća 400
  // Ulaz: PUT /api/users/student/update s newPassword ali bez currentPassword
  // Očekivani izlaz: HTTP 400
  test('400 — promjena lozinke bez currentPassword', async () => {
    const res = await request(app)
      .put('/api/users/student/update')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ newPassword: 'NovaLozinka123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/trenutnu lozinku/i);
  });

  // Testira: promjena lozinke s pogrešnom trenutnom lozinkom vraća 400
  // Ulaz: PUT /api/users/student/update s neispravnim currentPassword
  // Očekivani izlaz: HTTP 400
  test('400 — pogrešna trenutna lozinka', async () => {
    const res = await request(app)
      .put('/api/users/student/update')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ currentPassword: 'PogrešnaLozinka', newPassword: 'NovaLozinka123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/nije ispravna/i);
  });

  // Testira: kompanija ne može koristiti student update endpoint
  // Ulaz: PUT /api/users/student/update s kompanijskim tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — kompanija ne može koristiti student update', async () => {
    const res = await request(app)
      .put('/api/users/student/update')
      .set('Authorization', `Bearer ${companyToken}`)
      .send({ ime: 'Test' });

    expect(res.status).toBe(403);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: PUT /api/users/student/update bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).put('/api/users/student/update').send({ ime: 'Test' });
    expect(res.status).toBe(401);
  });
});
