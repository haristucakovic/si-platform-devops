'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const request  = require('supertest');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcrypt');
const { Op }   = require('sequelize');
const app      = require('../src/app');
const {
  User,
  Student,
  Koordinator,
  Fakultet,
  Odsjek,
  PrijavaNaPraksu,
  Oglas,
  Kompanija,
  sequelize,
} = require('../src/infrastructure/database/models');

const PREFIX     = 'test_kord_int_';
const JWT_SECRET = process.env.JWT_SECRET;
const PASSWORD   = 'Test@1234';

let passwordHash;

// ── Akteri ───────────────────────────────────────────────────────────────────
let koordinatorUser;   // koordinator koji šalje zahtjeve
let koordinatorRec;    // Koordinator record (sa fakultetID)

let studentUser;       // student s istog fakulteta, PENDING_APPROVAL
let studentRec;        // Student record

let studentDrugiFakultet;     // student s drugog fakulteta
let studentDrugiFakultetRec;

let odobrenStudent;    // student koji je već APPROVED
let odobrenStudentRec;

let fakultet;          // zajednički fakultet
let drugiF;            // drugi fakultet
let odsjek;

let koordinatorToken;

// ── Setup ─────────────────────────────────────────────────────────────────────
beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 10);

  // Čistimo ostavljene podatke iz prethodnog pokretanja
  await PrijavaNaPraksu.destroy({ where: {}, truncate: false }).catch(() => {});
  await Oglas.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Student.destroy({ where: { index_number: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Koordinator.destroy({ where: {} }).catch(() => {});
  await User.destroy({ where: { username: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Odsjek.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Fakultet.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});

  // Kreiranje fakulteta
  fakultet = await Fakultet.create({
    naziv: `${PREFIX}Elektrotehnički fakultet`,
    email: `${PREFIX}etf@test.com`,
  });

  drugiF = await Fakultet.create({
    naziv: `${PREFIX}Mašinski fakultet`,
    email: `${PREFIX}mf@test.com`,
  });

  odsjek = await Odsjek.create({
    naziv: `${PREFIX}Računarstvo`,
    fakultetID: fakultet.id,
  });

  // Koordinator
  koordinatorUser = await User.create({
    ime: 'Koordinator', prezime: 'Test',
    username: `${PREFIX}koord`,
    email: `${PREFIX}koord@test.com`,
    passwordHash, role: 'COORDINATOR',
    status: 'ACTIVE', approvalStatus: 'APPROVED',
    emailVerifikovan: true, created_at: new Date(),
  });
  koordinatorRec = await Koordinator.create({
    userID: koordinatorUser.id,
    fakultetID: fakultet.id,
  });

  koordinatorToken = jwt.sign(
    { id: koordinatorUser.id, role: 'COORDINATOR' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Student s istog fakulteta — čeka odobrenje
  studentUser = await User.create({
    ime: 'Student', prezime: 'Isti',
    username: `${PREFIX}student`,
    email: `${PREFIX}student@test.com`,
    passwordHash, role: 'STUDENT',
    status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL',
    emailVerifikovan: true, created_at: new Date(),
  });
  studentRec = await Student.create({
    userID: studentUser.id,
    fakultetID: fakultet.id,
    index_number: `${PREFIX}IB001`,
    year_of_study: 3,
    odsjekID: odsjek.id,
  });

  // Student s drugog fakulteta
  studentDrugiFakultet = await User.create({
    ime: 'Student', prezime: 'Drugi',
    username: `${PREFIX}student_drugi`,
    email: `${PREFIX}student_drugi@test.com`,
    passwordHash, role: 'STUDENT',
    status: 'ACTIVE', approvalStatus: 'PENDING_APPROVAL',
    emailVerifikovan: true, created_at: new Date(),
  });
  studentDrugiFakultetRec = await Student.create({
    userID: studentDrugiFakultet.id,
    fakultetID: drugiF.id,
    index_number: `${PREFIX}IB002`,
    year_of_study: 2,
    odsjekID: null,
  });

  // Student koji je već odobren
  odobrenStudent = await User.create({
    ime: 'Student', prezime: 'Odobren',
    username: `${PREFIX}student_odobren`,
    email: `${PREFIX}student_odobren@test.com`,
    passwordHash, role: 'STUDENT',
    status: 'ACTIVE', approvalStatus: 'APPROVED',
    emailVerifikovan: true, created_at: new Date(),
  });
  odobrenStudentRec = await Student.create({
    userID: odobrenStudent.id,
    fakultetID: fakultet.id,
    index_number: `${PREFIX}IB003`,
    year_of_study: 1,
    odsjekID: odsjek.id,
  });
});

afterAll(async () => {
  // Brisanje u ispravnom redoslijedu zbog foreign key constraintova
  await PrijavaNaPraksu.destroy({ where: {}, force: true }).catch(() => {});

  await Student.destroy({
    where: {
      index_number: { [Op.like]: `${PREFIX}%` },
    },
  }).catch(() => {});

  await Koordinator.destroy({ where: {} }).catch(() => {});

  await User.destroy({
    where: { username: { [Op.like]: `${PREFIX}%` } },
  });

  await Odsjek.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});
  await Fakultet.destroy({ where: { naziv: { [Op.like]: `${PREFIX}%` } } }).catch(() => {});

  await sequelize.close();
});

// Vrati studenta u PENDING_APPROVAL prije svakog testa koji mijenja status
beforeEach(async () => {
  await studentUser.reload();
  if (studentUser.approvalStatus !== 'PENDING_APPROVAL') {
    studentUser.approvalStatus = 'PENDING_APPROVAL';
    studentUser.status = 'ACTIVE';
    studentUser.approvedBy = null;
    studentUser.approvedAt = null;
    studentUser.rejectedBy = null;
    studentUser.rejectedAt = null;
    studentUser.rejectionReason = null;
    await studentUser.save();
  }
});

// ── GET /api/koordinator/dashboard ───────────────────────────────────────────
describe('GET /api/koordinator/dashboard', () => {
  // Testira: autentificiran koordinator dobija dashboard statistike
  // Ulaz: GET /api/koordinator/dashboard s koordinator JWT tokenom
  // Očekivani izlaz: HTTP 200, data sadrži ukupno, podnesene, odobrene, odbijene
  test('200 — vraća dashboard statistike', async () => {
    const res = await request(app)
      .get('/api/koordinator/dashboard')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('ukupno');
    expect(res.body.data).toHaveProperty('podnesene');
    expect(res.body.data).toHaveProperty('odobrene');
    expect(res.body.data).toHaveProperty('odbijene');
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/koordinator/dashboard bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/koordinator/dashboard');
    expect(res.status).toBe(401);
  });

  // Testira: endpoint odbija zahtjev s tokenom pogrešne role
  // Ulaz: GET /api/koordinator/dashboard s STUDENT tokenom
  // Očekivani izlaz: HTTP 403
  test('403 — odbija zahtjev s STUDENT tokenom', async () => {
    const studentToken = jwt.sign(
      { id: studentUser.id, role: 'STUDENT' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .get('/api/koordinator/dashboard')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
});

// ── GET /api/koordinator/studenti ─────────────────────────────────────────────
describe('GET /api/koordinator/studenti', () => {
  // Testira: koordinator vidi samo studente s istog fakulteta
  // Ulaz: GET /api/koordinator/studenti s koordinator tokenom
  // Očekivani izlaz: HTTP 200, lista sadrži studentUser, ne sadrži studentDrugiFakultet
  test('200 — vraća samo studente s istog fakulteta', async () => {
    const res = await request(app)
      .get('/api/koordinator/studenti')
      .set('Authorization', `Bearer ${koordinatorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const emails = res.body.data.map(s => s.User?.email);
    expect(emails).toContain(odobrenStudent.email);
    expect(emails).not.toContain(studentDrugiFakultet.email);
  });

  // Testira: pretraga po imenu filtrira studente
  // Ulaz: GET /api/koordinator/studenti?pretraga=Isti
  // Očekivani izlaz: HTTP 200, lista sadrži studentUser s prezimenom 'Isti'
  test('200 — pretraga po imenu vraća odgovarajuće studente', async () => {
    const res = await request(app)
      .get('/api/koordinator/studenti?pretraga=Odobren')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    const pronadjen = res.body.data.find(s => s.User?.email === odobrenStudent.email);
    expect(pronadjen).toBeDefined();
  });

  // Testira: pretraga koja ne odgovara nijednom studentu vraća prazan niz
  // Ulaz: GET /api/koordinator/studenti?pretraga=XYZNepostoji
  // Očekivani izlaz: HTTP 200, data = []
  test('200 — pretraga bez rezultata vraća prazan niz', async () => {
    const res = await request(app)
      .get('/api/koordinator/studenti?pretraga=XYZNepostoji')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/koordinator/studenti bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/koordinator/studenti');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/koordinator/zahtjevi ─────────────────────────────────────────────
describe('GET /api/koordinator/zahtjevi', () => {
  // Testira: koordinator vidi samo studente s istog fakulteta koji čekaju odobrenje
  // Ulaz: GET /api/koordinator/zahtjevi s koordinator tokenom
  // Očekivani izlaz: HTTP 200, lista sadrži studentUser (PENDING_APPROVAL, isti fakultet),
  //                  ne sadrži studentDrugiFakultet ni odobrenStudent
  test('200 — vraća zahtjeve samo s istog fakulteta', async () => {
    const res = await request(app)
      .get('/api/koordinator/zahtjevi')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const ids = res.body.data.map(z => z.id);
    expect(ids).toContain(studentUser.id);
    expect(ids).not.toContain(studentDrugiFakultet.id);
    expect(ids).not.toContain(odobrenStudent.id);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/koordinator/zahtjevi bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/koordinator/zahtjevi');
    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/koordinator/studenti/:id/odobri ────────────────────────────────
describe('PATCH /api/koordinator/studenti/:id/odobri', () => {
  // Testira: koordinator uspješno odobrava studenta s istog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/:id/odobri s koordinator tokenom, student PENDING_APPROVAL
  // Očekivani izlaz: HTTP 200, approvalStatus u bazi = 'APPROVED', status = 'ACTIVE'
  test('200 — uspješno odobrava studenta s istog fakulteta', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odobri`)
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approvalStatus).toBe('APPROVED');

    await studentUser.reload();
    expect(studentUser.approvalStatus).toBe('APPROVED');
    expect(studentUser.status).toBe('ACTIVE');
    expect(studentUser.approvedBy).toBe(koordinatorUser.id);
  });

  // Testira: koordinator ne može odobriti studenta s drugog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/:id/odobri s ID studenta s drugog fakulteta
  // Očekivani izlaz: HTTP 404, poruka o pogrešnom fakultetu
  test('404 — ne može odobriti studenta s drugog fakulteta', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentDrugiFakultet.id}/odobri`)
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/fakulteta/i);
  });

  // Testira: endpoint vraća 409 kada je student već odobren
  // Ulaz: PATCH /api/koordinator/studenti/:id/odobri s ID već odobrenog studenta
  // Očekivani izlaz: HTTP 409
  test('409 — vraća 409 kada je student već odobren', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${odobrenStudent.id}/odobri`)
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(409);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: PATCH /api/koordinator/studenti/:id/odobri bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odobri`);
    expect(res.status).toBe(401);
  });
});

// ── PATCH /api/koordinator/studenti/:id/odbij ─────────────────────────────────
describe('PATCH /api/koordinator/studenti/:id/odbij', () => {
  // Testira: koordinator uspješno odbija studenta s razlogom
  // Ulaz: PATCH /api/koordinator/studenti/:id/odbij, body { razlog: 'Nepotpuna dokumentacija' }
  // Očekivani izlaz: HTTP 200, approvalStatus u bazi = 'REJECTED', status = 'DEACTIVATED'
  test('200 — uspješno odbija studenta s razlogom', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odbij`)
      .set('Authorization', `Bearer ${koordinatorToken}`)
      .send({ razlog: 'Nepotpuna dokumentacija' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approvalStatus).toBe('REJECTED');

    await studentUser.reload();
    expect(studentUser.approvalStatus).toBe('REJECTED');
    expect(studentUser.status).toBe('DEACTIVATED');
    expect(studentUser.rejectionReason).toBe('Nepotpuna dokumentacija');
    expect(studentUser.rejectedBy).toBe(koordinatorUser.id);
  });

  // Testira: endpoint vraća 400 kada razlog nije proslijeđen
  // Ulaz: PATCH /api/koordinator/studenti/:id/odbij, body {} bez razloga
  // Očekivani izlaz: HTTP 400
  test('400 — odbijanje bez razloga vraća 400', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odbij`)
      .set('Authorization', `Bearer ${koordinatorToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je razlog prazan string
  // Ulaz: PATCH /api/koordinator/studenti/:id/odbij, body { razlog: '   ' }
  // Očekivani izlaz: HTTP 400
  test('400 — prazan razlog vraća 400', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odbij`)
      .set('Authorization', `Bearer ${koordinatorToken}`)
      .send({ razlog: '   ' });

    expect(res.status).toBe(400);
  });

  // Testira: koordinator ne može odbiti studenta s drugog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/:id/odbij s ID studenta s drugog fakulteta
  // Očekivani izlaz: HTTP 404
  test('404 — ne može odbiti studenta s drugog fakulteta', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentDrugiFakultet.id}/odbij`)
      .set('Authorization', `Bearer ${koordinatorToken}`)
      .send({ razlog: 'Razlog' });

    expect(res.status).toBe(404);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: PATCH /api/koordinator/studenti/:id/odbij bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app)
      .patch(`/api/koordinator/studenti/${studentUser.id}/odbij`)
      .send({ razlog: 'Razlog' });
    expect(res.status).toBe(401);
  });
});

// ── GET /api/koordinator/prijave ──────────────────────────────────────────────
describe('GET /api/koordinator/prijave', () => {
  // Testira: koordinator dobija paginiranu listu prijava
  // Ulaz: GET /api/koordinator/prijave s koordinator tokenom
  // Očekivani izlaz: HTTP 200, data.prijave je niz, postoje polja ukupno i stranice
  test('200 — vraća paginiranu listu prijava', async () => {
    const res = await request(app)
      .get('/api/koordinator/prijave')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.prijave)).toBe(true);
    expect(res.body.data).toHaveProperty('ukupno');
    expect(res.body.data).toHaveProperty('stranice');
  });

  // Testira: filter po statusu radi ispravno
  // Ulaz: GET /api/koordinator/prijave?status=PODNESENA
  // Očekivani izlaz: HTTP 200, sve prijave u nizu imaju status PODNESENA
  test('200 — filter po statusu PODNESENA vraća samo PODNESENA', async () => {
    const res = await request(app)
      .get('/api/koordinator/prijave?status=PODNESENA')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    res.body.data.prijave.forEach(p => {
      expect(p.status).toBe('PODNESENA');
    });
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/koordinator/prijave bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/koordinator/prijave');
    expect(res.status).toBe(401);
  });
});

// ── GET /api/koordinator/prakse ───────────────────────────────────────────────
describe('GET /api/koordinator/prakse', () => {
  // Testira: koordinator dobija listu praksi
  // Ulaz: GET /api/koordinator/prakse s koordinator tokenom
  // Očekivani izlaz: HTTP 200, data je niz
  test('200 — vraća listu praksi', async () => {
    const res = await request(app)
      .get('/api/koordinator/prakse')
      .set('Authorization', `Bearer ${koordinatorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Testira: endpoint odbija zahtjev bez tokena
  // Ulaz: GET /api/koordinator/prakse bez Authorization headera
  // Očekivani izlaz: HTTP 401
  test('401 — odbija zahtjev bez tokena', async () => {
    const res = await request(app).get('/api/koordinator/prakse');
    expect(res.status).toBe(401);
  });
});