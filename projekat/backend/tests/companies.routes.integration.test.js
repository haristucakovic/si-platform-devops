'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const { User, Kompanija, sequelize } = require('../src/infrastructure/database/models');

const PREFIX = 'test_comp_int_';
const JWT_SECRET = process.env.JWT_SECRET;

let studentUser, studentToken;
let companyUser, companyRec;
let inactiveCompanyUser, inactiveCompanyRec;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('Test@1234', 10);

  // Čistimo ostavljene podatke iz prethodnog pokretanja
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});

  studentUser = await User.create({
    ime: 'CompTest', prezime: 'Student',
    username: `${PREFIX}student`, email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  studentToken = jwt.sign({ id: studentUser.id, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '1h' });

  companyUser = await User.create({
    ime: 'CompTest', prezime: 'Company',
    username: `${PREFIX}company`, email: `${PREFIX}company@test.com`,
    passwordHash, role: 'COMPANY', status: 'ACTIVE',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  companyRec = await Kompanija.create({
    userID: companyUser.id,
    naziv: `${PREFIX}Aktivna firma`,
    adresa: 'Testna bb',
    opisPoslovanja: 'Opis poslovanja',
    djelatnost: 'IT',
  });

  inactiveCompanyUser = await User.create({
    ime: 'CompTest', prezime: 'Inactive',
    username: `${PREFIX}inactive`, email: `${PREFIX}inactive@test.com`,
    passwordHash, role: 'COMPANY', status: 'DEACTIVATED',
    emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
  });
  inactiveCompanyRec = await Kompanija.create({
    userID: inactiveCompanyUser.id,
    naziv: `${PREFIX}Neaktivna firma`,
    adresa: 'Neaktivna bb',
  });
});

afterAll(async () => {
  await Kompanija.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } });
  await sequelize.close();
});

// ── GET /api/companies/:id ───────────────────────────────────────────────────
describe('GET /api/companies/:id', () => {
  // Testira: student dobija profil aktivne i odobrene kompanije
  // Ulaz: GET /api/companies/:id s validnim studentskim tokenom i ID aktivne kompanije
  // Očekivani izlaz: HTTP 200, podaci kompanije i lista aktivnih oglasa
  test('200 — vraća profil aktivne kompanije', async () => {
    const res = await request(app)
      .get(`/api/companies/${companyRec.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.kompanija).toMatchObject({
      id: companyRec.id,
      naziv: companyRec.naziv,
    });
    expect(Array.isArray(res.body.oglasi)).toBe(true);
  });

  // Testira: pristup profilu neaktivne kompanije vraća 403
  // Ulaz: GET /api/companies/:id s ID-om kompanije čiji je nalog DEACTIVATED
  // Očekivani izlaz: HTTP 403
  test('403 — neaktivna kompanija nije dostupna', async () => {
    const res = await request(app)
      .get(`/api/companies/${inactiveCompanyRec.id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });

  // Testira: pristup nepostojećoj kompaniji vraća 404
  // Ulaz: GET /api/companies/999999 s validnim studentskim tokenom
  // Očekivani izlaz: HTTP 404
  test('404 — kompanija ne postoji', async () => {
    const res = await request(app)
      .get('/api/companies/999999')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(404);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/companies/:id bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get(`/api/companies/${companyRec.id}`);
    expect(res.status).toBe(401);
  });
});
