'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const { User, sequelize } = require('../src/infrastructure/database/models');

const PREFIX = 'test_auth_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD = 'Test@1234';

let activeUser;
let pendingUser;
let deactivatedUser;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  [activeUser, pendingUser, deactivatedUser] = await Promise.all([
    User.create({
      ime: 'Active', prezime: 'User',
      username: `${PREFIX}active`, email: `${PREFIX}active@test.com`,
      passwordHash, role: 'STUDENT', status: 'ACTIVE',
      emailVerifikovan: true, approvalStatus: 'APPROVED', created_at: new Date(),
    }),
    User.create({
      ime: 'Pending', prezime: 'User',
      username: `${PREFIX}pending`, email: `${PREFIX}pending@test.com`,
      passwordHash, role: 'STUDENT', status: 'PENDING',
      emailVerifikovan: true, created_at: new Date(),
    }),
    User.create({
      ime: 'Deactivated', prezime: 'User',
      username: `${PREFIX}deactivated`, email: `${PREFIX}deactivated@test.com`,
      passwordHash, role: 'STUDENT', status: 'DEACTIVATED',
      emailVerifikovan: true, created_at: new Date(),
    }),
  ]);
});

afterAll(async () => {
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } });
  await sequelize.close();
});

describe('POST /api/auth/login', () => {
  // Testira: uspješan login vraća validan JWT token i ispravne user podatke iz baze
  // Ulaz: POST /api/auth/login s email i password ACTIVE korisnika kreiranog u beforeAll
  // Očekivani izlaz: HTTP 200, token koji se može verifikovati, user objekat s ispravnim id i role, bez passwordHash
  test('200 — uspješan login vraća validan JWT i user podatke', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: activeUser.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      id: activeUser.id,
      role: 'STUDENT',
      email: activeUser.email,
    });
    expect(res.body.user).not.toHaveProperty('passwordHash');

    const decoded = jwt.verify(res.body.token, JWT_SECRET);
    expect(decoded.id).toBe(activeUser.id);
    expect(decoded.role).toBe('STUDENT');
  });

  // Testira: login putem username-a funkcioniše kao alternativa email identifikatoru
  // Ulaz: POST /api/auth/login s username (ne email) ACTIVE korisnika i ispravnim password-om
  // Očekivani izlaz: HTTP 200, user.id odgovara ACTIVE korisniku
  test('200 — login putem username-a funkcioniše', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: activeUser.username, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(activeUser.id);
  });

  // Testira: login odbija pogrešan password za postojećeg korisnika
  // Ulaz: POST /api/auth/login s ispravnim email-om ali pogrešnim password-om
  // Očekivani izlaz: HTTP 401
  test('401 — pogrešan password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: activeUser.email, password: 'WrongPassword123!' });

    expect(res.status).toBe(401);
  });

  // Testira: login odbija email koji ne postoji u bazi
  // Ulaz: POST /api/auth/login s email adresom koja nije kreirana u beforeAll
  // Očekivani izlaz: HTTP 401
  test('401 — korisnik ne postoji u bazi', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'nepostoji@test.com', password: PASSWORD });

    expect(res.status).toBe(401);
  });

  // Testira: login odbija korisnika čiji je status PENDING u bazi
  // Ulaz: POST /api/auth/login s ispravnim kredencijalima PENDING korisnika
  // Očekivani izlaz: HTTP 401, message sadrži "aktivan"
  test('401 — nalog je PENDING', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: pendingUser.email, password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/aktivan/i);
  });

  // Testira: login odbija korisnika čiji je status DEACTIVATED u bazi
  // Ulaz: POST /api/auth/login s ispravnim kredencijalima DEACTIVATED korisnika
  // Očekivani izlaz: HTTP 401, message sadrži "deaktiviran"
  test('401 — nalog je DEACTIVATED', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: deactivatedUser.email, password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/deaktiviran/i);
  });

  // Testira: endpoint vraća 400 kada identifier nije proslijeđen u body-u
  // Ulaz: POST /api/auth/login s body { password: PASSWORD } (bez identifier)
  // Očekivani izlaz: HTTP 400
  test('400 — nedostaje identifier', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: PASSWORD });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada password nije proslijeđen u body-u
  // Ulaz: POST /api/auth/login s body { identifier: activeUser.email } (bez password)
  // Očekivani izlaz: HTTP 400
  test('400 — nedostaje password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: activeUser.email });

    expect(res.status).toBe(400);
  });
});
