'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const app = require('../src/app');
const { User, sequelize } = require('../src/infrastructure/database/models');

const PREFIX = 'test_admin_int_';
const JWT_SECRET = process.env.JWT_SECRET;

let adminToken;
let adminUser;
let targetUser;

beforeAll(async () => {
  const passwordHash = await bcrypt.hash('Test@1234', 10);

  adminUser = await User.create({
    ime: 'Integration',
    prezime: 'Admin',
    username: `${PREFIX}admin`,
    email: `${PREFIX}admin@test.com`,
    passwordHash,
    role: 'ADMIN',
    status: 'ACTIVE',
    emailVerifikovan: true,
    created_at: new Date(),
  });

  adminToken = jwt.sign(
    { id: adminUser.id, role: 'ADMIN' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  targetUser = await User.create({
    ime: 'Target',
    prezime: 'User',
    username: `${PREFIX}target`,
    email: `${PREFIX}target@test.com`,
    passwordHash,
    role: 'STUDENT',
    status: 'PENDING',
    approvalStatus: 'APPROVED',
    emailVerifikovan: true,
    created_at: new Date(),
  });
});

afterAll(async () => {
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } });
  await sequelize.close();
});

beforeEach(async () => {
  targetUser.role = 'STUDENT';
  targetUser.status = 'PENDING';
  targetUser.approvalStatus = 'APPROVED';
  await targetUser.save();
});

// ── GET /api/admin/users ──────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  // Testira: endpoint vraća listu korisnika s ispravno mapiranim poljima iz baze
  // Ulaz: GET /api/admin/users s admin JWT tokenom
  // Očekivani izlaz: HTTP 200, niz koji sadrži targetUser s ispravnim name, email, role, status
  test('200 — vraća listu korisnika s mapiranim poljima', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const found = res.body.find(u => u.id === targetUser.id);
    expect(found).toMatchObject({
      id: targetUser.id,
      name: 'Target User',
      email: `${PREFIX}target@test.com`,
      role: 'STUDENT',
      status: 'PENDING',
    });
  });

  // Testira: endpoint filtrira korisnike po status query parametru i vraća samo PENDING
  // Ulaz: GET /api/admin/users?status=PENDING s admin tokenom, targetUser je PENDING
  // Očekivani izlaz: HTTP 200, svi korisnici u nizu imaju status=PENDING, targetUser je prisutan
  test('200 — filtrira po ?status=PENDING, vraća samo PENDING korisnike', async () => {
    const res = await request(app)
      .get('/api/admin/users?status=PENDING')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach(u => expect(u.status).toBe('PENDING'));
    expect(res.body.find(u => u.id === targetUser.id)).toBeDefined();
  });

  // Testira: endpoint filtrira korisnike po status=ACTIVE i ne vraća PENDING korisnika
  // Ulaz: GET /api/admin/users?status=ACTIVE s admin tokenom, targetUser je PENDING
  // Očekivani izlaz: HTTP 200, svi u nizu su ACTIVE, targetUser nije prisutan
  test('200 — filtrira po ?status=ACTIVE, ne vraća PENDING korisnika', async () => {
    const res = await request(app)
      .get('/api/admin/users?status=ACTIVE')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    res.body.forEach(u => expect(u.status).toBe('ACTIVE'));
    expect(res.body.find(u => u.id === targetUser.id)).toBeUndefined();
  });

  // Testira: endpoint odbija zahtjev bez Authorization headera
  // Ulaz: GET /api/admin/users bez tokena
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/admin/users');
    expect(res.status).toBe(401);
  });

  // Testira: endpoint odbija zahtjev korisnika koji ima STUDENT rolu umjesto ADMIN
  // Ulaz: GET /api/admin/users s tokenom potpisanim za STUDENT rolu
  // Očekivani izlaz: HTTP 403
  test('403 — odbija zahtjev s non-admin (STUDENT) tokenom', async () => {
    const studentToken = jwt.sign(
      { id: targetUser.id, role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
  });
});

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────

describe('PATCH /api/admin/users/:id/role', () => {
  // Testira: endpoint uspješno mijenja rolu korisnika u bazi i vraća ažurirani objekat
  // Ulaz: PATCH /api/admin/users/:id/role s admin tokenom i body { role: 'COORDINATOR' }
  // Očekivani izlaz: HTTP 200, res.body.user.role='COORDINATOR', baza ažurirana (reload)
  test('200 — uspješno mijenja rolu u bazi', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'COORDINATOR' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('COORDINATOR');

    await targetUser.reload();
    expect(targetUser.role).toBe('COORDINATOR');
  });

  // Testira: endpoint prihvata lowercase rolu i konvertuje je u uppercase, persistuje u bazi
  // Ulaz: PATCH /api/admin/users/:id/role s body { role: 'admin' } (lowercase)
  // Očekivani izlaz: HTTP 200, res.body.user.role='ADMIN', baza sadrži 'ADMIN'
  test('200 — prima lowercase rolu i konvertuje u uppercase', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');

    await targetUser.reload();
    expect(targetUser.role).toBe('ADMIN');
  });

  // Testira: endpoint vraća 400 kada role polje nije proslijeđeno u body-u
  // Ulaz: PATCH /api/admin/users/:id/role s admin tokenom i praznim body-em {}
  // Očekivani izlaz: HTTP 400, message sadrži "role"
  test('400 — nedostaje polje "role" u body-u', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/role/i);
  });

  // Testira: endpoint vraća 400 za rolu koja nije u listi dozvoljenih vrijednosti
  // Ulaz: PATCH /api/admin/users/:id/role s body { role: 'SUPERADMIN' }
  // Očekivani izlaz: HTTP 400
  test('400 — nevažeća vrijednost role (SUPERADMIN)', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'SUPERADMIN' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id u URL-u string a ne broj
  // Ulaz: PATCH /api/admin/users/abc/role s admin tokenom i body { role: 'STUDENT' }
  // Očekivani izlaz: HTTP 400
  test('400 — id nije broj (string "abc")', async () => {
    const res = await request(app)
      .patch('/api/admin/users/abc/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id negativan broj
  // Ulaz: PATCH /api/admin/users/-1/role s admin tokenom i body { role: 'STUDENT' }
  // Očekivani izlaz: HTTP 400
  test('400 — id je negativan broj', async () => {
    const res = await request(app)
      .patch('/api/admin/users/-1/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada korisnik s datim id-em ne postoji u bazi
  // Ulaz: PATCH /api/admin/users/999999/role s admin tokenom i body { role: 'ADMIN' }
  // Očekivani izlaz: HTTP 404, message sadrži "not found"
  test('404 — korisnik ne postoji u bazi', async () => {
    const res = await request(app)
      .patch('/api/admin/users/999999/role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // Testira: endpoint odbija zahtjev bez Authorization headera
  // Ulaz: PATCH /api/admin/users/:id/role bez tokena, body { role: 'ADMIN' }
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/role`)
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────

describe('PATCH /api/admin/users/:id/status', () => {
  // Testira: endpoint uspješno mijenja status korisnika u bazi i vraća ažurirani objekat
  // Ulaz: PATCH /api/admin/users/:id/status s admin tokenom i body { status: 'ACTIVE' }, targetUser je PENDING
  // Očekivani izlaz: HTTP 200, res.body.user.status='ACTIVE', baza ažurirana (reload)
  test('200 — uspješno mijenja status u bazi', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('ACTIVE');

    await targetUser.reload();
    expect(targetUser.status).toBe('ACTIVE');
  });

  // Testira: endpoint prihvata lowercase status i konvertuje ga u uppercase, persistuje u bazi
  // Ulaz: PATCH /api/admin/users/:id/status s body { status: 'deactivated' } (lowercase)
  // Očekivani izlaz: HTTP 200, res.body.user.status='DEACTIVATED', baza sadrži 'DEACTIVATED'
  test('200 — prima lowercase status i konvertuje u uppercase', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'deactivated' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('DEACTIVATED');

    await targetUser.reload();
    expect(targetUser.status).toBe('DEACTIVATED');
  });

  // Testira: endpoint vraća 400 kada status polje nije proslijeđeno u body-u
  // Ulaz: PATCH /api/admin/users/:id/status s admin tokenom i praznim body-em {}
  // Očekivani izlaz: HTTP 400, message sadrži "status"
  test('400 — nedostaje polje "status" u body-u', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status/i);
  });

  // Testira: endpoint vraća 400 za status koji nije u listi dozvoljenih vrijednosti
  // Ulaz: PATCH /api/admin/users/:id/status s body { status: 'BANNED' }
  // Očekivani izlaz: HTTP 400
  test('400 — nevažeća vrijednost statusa (BANNED)', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'BANNED' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id u URL-u string a ne broj
  // Ulaz: PATCH /api/admin/users/xyz/status s admin tokenom i body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 400
  test('400 — id nije broj (string "xyz")', async () => {
    const res = await request(app)
      .patch('/api/admin/users/xyz/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id nula (nije pozitivan cijeli broj)
  // Ulaz: PATCH /api/admin/users/0/status s admin tokenom i body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 400
  test('400 — id je nula', async () => {
    const res = await request(app)
      .patch('/api/admin/users/0/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada korisnik s datim id-em ne postoji u bazi
  // Ulaz: PATCH /api/admin/users/999999/status s admin tokenom i body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 404, message sadrži "not found"
  test('404 — korisnik ne postoji u bazi', async () => {
    const res = await request(app)
      .patch('/api/admin/users/999999/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  // Testira: endpoint odbija zahtjev bez Authorization headera
  // Ulaz: PATCH /api/admin/users/:id/status bez tokena, body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${targetUser.id}/status`)
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(401);
  });
});
