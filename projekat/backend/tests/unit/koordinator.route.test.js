'use strict';

const request = require('supertest');

// ── Mock middleware ───────────────────────────────────────────────────────────
jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 1, role: 'COORDINATOR' };
    next();
  },
}));

jest.mock('../../src/middleware/rbac.middleware', () => ({
  authorize: () => (_req, _res, next) => next(),
}));

// ── Mock modela ───────────────────────────────────────────────────────────────
jest.mock('../../src/infrastructure/database/models', () => ({
  User: {
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
  Student: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    associations: {},
  },
  Koordinator: {
    findOne: jest.fn(),
  },
  Odsjek: {
    findAll: jest.fn(),
  },
  PrijavaNaPraksu: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Oglas: {
    findAll: jest.fn(),
  },
  Kompanija: {},
  Praksa: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  Fakultet: {},
}));

// ── Mock email servisa ────────────────────────────────────────────────────────
jest.mock('../../src/business/services/email.service', () => ({
  sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendAccountRejectedEmail: jest.fn().mockResolvedValue(undefined),
  sendPrijavaStatusEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn().mockResolvedValue(null),
  canSendInApp: jest.fn().mockReturnValue(false),
  canSendEmail: jest.fn().mockReturnValue(false),
}));

// ── Mock approval.service za getZahtjevi ─────────────────────────────────────
jest.mock('../../src/business/services/approval.service', () => ({
  getStudentApprovalRequestsForKoordinator: jest.fn(),
  getUserApprovalRequests: jest.fn(),
  getUserApprovalRequestById: jest.fn(),
  approveUserRequest: jest.fn(),
  rejectUserRequest: jest.fn(),
}));

const app = require('../../src/app');
const db  = require('../../src/infrastructure/database/models');
const { getStudentApprovalRequestsForKoordinator } = require('../../src/business/services/approval.service');

// ── Helper funkcije ───────────────────────────────────────────────────────────
function makeMockUser(overrides = {}) {
  return {
    id: 10,
    ime: 'Amina',
    prezime: 'Begić',
    email: 'amina@test.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    approvalStatus: 'PENDING_APPROVAL',
    emailVerifikovan: true,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMockKoordinator(overrides = {}) {
  return {
    id: 1,
    userID: 1,
    fakultetID: 5,
    ...overrides,
  };
}

function makeMockStudent(overrides = {}) {
  return {
    id: 20,
    userID: 10,
    fakultetID: 5,
    index_number: 'IB210001',
    year_of_study: 3,
    odsjekID: 2,
    User: makeMockUser(),
    Odsjek: { id: 2, naziv: 'Softversko inženjerstvo' },
    PrijavaNaPraksu: [],
    ...overrides,
  };
}

function makeMockPrijava(overrides = {}) {
  return {
    id: 100,
    status: 'PODNESENA',
    datumPrijave: new Date('2026-01-10'),
    razlogOdbijanja: null,
    update: jest.fn().mockResolvedValue(undefined),
    Student: makeMockStudent(),
    Oglas: {
      id: 50,
      naziv: 'Backend developer praksa',
      trajanje: 30,
      brojMjesta: 2,
      Kompanija: { id: 3, naziv: 'TechCo', User: { ime: 'TechCo', email: 'hr@techco.ba' } },
    },
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── GET /api/koordinator/dashboard ────────────────────────────────────────────
describe('GET /api/koordinator/dashboard', () => {
  // Testira: endpoint vraća statistike prijava i praksi
  // Ulaz: GET /api/koordinator/dashboard, svi count mockovi vraćaju brojeve
  // Očekivani izlaz: HTTP 200, objekat sa ukupno, podnesene, odobrene, odbijene, aktivnePrakse, zavrsene
  test('200 — vraća dashboard statistike', async () => {
    db.PrijavaNaPraksu.count
      .mockResolvedValueOnce(10)  // ukupno
      .mockResolvedValueOnce(3)   // podnesene (CEKA_KOORDINATORA)
      .mockResolvedValueOnce(2)   // proslijedene (CEKA_KOMPANIJU + U_RAZMATRANJU)
      .mockResolvedValueOnce(5)   // odobrene (ODOBRENA)
      .mockResolvedValueOnce(1);  // odbijene (FINAL_REJECTED_STATUSES)
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/koordinator/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      ukupno: 10,
      podnesene: 3,
      proslijedene: 2,
      odobrene: 5,
      odbijene: 1,
      aktivnePrakse: 0,
      zavrsene: 0,
    });
  });

  // Testira: endpoint vraća 500 kada DB baci grešku
  // Ulaz: GET /api/koordinator/dashboard, PrijavaNaPraksu.count baca grešku
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — greška baze vraća 500', async () => {
    db.PrijavaNaPraksu.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/koordinator/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/koordinator/prijave ──────────────────────────────────────────────
describe('GET /api/koordinator/prijave', () => {
  // Testira: endpoint vraća paginiranu listu prijava
  // Ulaz: GET /api/koordinator/prijave, koordinator postoji, findAndCountAll vraća 1 prijavu
  // Očekivani izlaz: HTTP 200, data.prijave je niz, data.ukupno = 1
  test('200 — vraća listu prijava', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: [makeMockPrijava()],
    });

    const res = await request(app).get('/api/koordinator/prijave');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.ukupno).toBe(1);
    expect(Array.isArray(res.body.data.prijave)).toBe(true);
  });

  // Testira: endpoint prosljeđuje ?status filter u DB upit
  // Ulaz: GET /api/koordinator/prijave?status=PODNESENA
  // Očekivani izlaz: HTTP 200, findAndCountAll pozvan s where: { status: 'PODNESENA' }
  test('200 — normalizuje ?status=PODNESENA u CEKA_KOORDINATORA', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    const res = await request(app).get('/api/koordinator/prijave?status=PODNESENA');

    expect(res.status).toBe(200);
    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'CEKA_KOORDINATORA' } })
    );
  });

  // Testira: endpoint vraća 500 kada koordinator ne postoji u bazi
  // Ulaz: GET /api/koordinator/prijave, Koordinator.findOne vraća null
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — koordinator ne postoji vraća 500', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/koordinator/prijave');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 500 kada DB baci grešku
  // Ulaz: GET /api/koordinator/prijave, findAndCountAll baca grešku
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — greška baze vraća 500', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/koordinator/prijave');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/koordinator/prijave/:id ─────────────────────────────────────────
describe('GET /api/koordinator/prijave/:id', () => {
  // Testira: endpoint vraća detalje jedne prijave s istog fakulteta
  // Ulaz: GET /api/koordinator/prijave/100, koordinator postoji, findByPk vraća prijavu s istim fakultetID
  // Očekivani izlaz: HTTP 200, data.id = 100
  test('200 — vraća detalje prijave', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava());

    const res = await request(app).get('/api/koordinator/prijave/100');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(100);
  });

  // Testira: endpoint vraća 404 kada prijava ne postoji
  // Ulaz: GET /api/koordinator/prijave/999, koordinator postoji, findByPk vraća null
  // Očekivani izlaz: HTTP 404, success: false
  test('404 — prijava ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/koordinator/prijave/999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 404 kada prijava pripada studentu s drugog fakulteta
  // Ulaz: GET /api/koordinator/prijave/100, prijava ima Student s drugačijim fakultetID
  // Očekivani izlaz: HTTP 404, success: false
  test('404 — prijava je s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator({ fakultetID: 5 }));
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makeMockPrijava({ Student: makeMockStudent({ fakultetID: 99 }) })
    );

    const res = await request(app).get('/api/koordinator/prijave/100');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 500 kada koordinator ne postoji
  // Ulaz: GET /api/koordinator/prijave/100, Koordinator.findOne vraća null
  // Očekivani izlaz: HTTP 500
  test('500 — koordinator ne postoji vraća 500', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/koordinator/prijave/100');

    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/koordinator/prijave/:id/odluka ─────────────────────────────────
describe('PATCH /api/koordinator/prijave/:id/odluka', () => {
  // Testira: koordinator uspješno odobrava prijavu
  // Ulaz: PATCH /api/koordinator/prijave/100/odluka, body { odluka: 'odobrena' }
  // Očekivani izlaz: HTTP 200, data.status = 'ODOBRENA'
  test('200 — uspješno odobrava prijavu', async () => {
    const mockPrijava = makeMockPrijava();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(mockPrijava);

    const res = await request(app)
      .patch('/api/koordinator/prijave/100/odluka')
      .send({ odluka: 'odobrena' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrijava.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO' })
    );
  });

  // Testira: koordinator uspješno odbija prijavu s razlogom
  // Ulaz: PATCH /api/koordinator/prijave/100/odluka, body { odluka: 'odbijena', razlog: 'Nepotpuna dokumentacija' }
  // Očekivani izlaz: HTTP 200, update pozvan s ODBIJENA_KOORDINATOR
  test('200 — uspješno odbija prijavu s razlogom', async () => {
    const mockPrijava = makeMockPrijava();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(mockPrijava);

    const res = await request(app)
      .patch('/api/koordinator/prijave/100/odluka')
      .send({ odluka: 'odbijena', razlog: 'Nepotpuna dokumentacija' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrijava.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODBIJENA_KOORDINATOR', razlogOdbijanja: 'Nepotpuna dokumentacija' })
    );
  });

  // Testira: endpoint vraća 400 kada je odluka 'odbijena' bez razloga
  // Ulaz: PATCH /api/koordinator/prijave/100/odluka, body { odluka: 'odbijena' } bez razloga
  // Očekivani izlaz: HTTP 400, success: false
  test('400 — odbijanje bez razloga vraća 400', async () => {
    const res = await request(app)
      .patch('/api/koordinator/prijave/100/odluka')
      .send({ odluka: 'odbijena' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 400 za neispravnu vrijednost odluke
  // Ulaz: PATCH /api/koordinator/prijave/100/odluka, body { odluka: 'mozda' }
  // Očekivani izlaz: HTTP 400
  test('400 — neispravna vrijednost odluke', async () => {
    const res = await request(app)
      .patch('/api/koordinator/prijave/100/odluka')
      .send({ odluka: 'mozda' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada prijava ne postoji
  // Ulaz: PATCH /api/koordinator/prijave/999/odluka, body { odluka: 'odobrena' }, findByPk vraća null
  // Očekivani izlaz: HTTP 404
  test('404 — prijava ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/koordinator/prijave/999/odluka')
      .send({ odluka: 'odobrena' });

    expect(res.status).toBe(404);
  });

  // Testira: endpoint vraća 400 kada je prijava već odobrena ili odbijena (pogrešan status)
  // Ulaz: PATCH /api/koordinator/prijave/100/odluka, prijava ima status 'ODOBRENA'
  // Očekivani izlaz: HTTP 400
  test('400 — prijava već ima finalni status (ODOBRENA)', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava({ status: 'ODOBRENA' }));

    const res = await request(app)
      .patch('/api/koordinator/prijave/100/odluka')
      .send({ odluka: 'odobrena' });

    expect(res.status).toBe(400);
  });
});

// ── GET /api/koordinator/studenti ─────────────────────────────────────────────
describe('GET /api/koordinator/studenti', () => {
  // Testira: endpoint vraća listu studenata s istog fakulteta kao koordinator
  // Ulaz: GET /api/koordinator/studenti, koordinator ima fakultetID=5, student ima isti fakultetID
  // Očekivani izlaz: HTTP 200, data je niz studenata
  test('200 — vraća studente s istog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([makeMockStudent()]);

    const res = await request(app).get('/api/koordinator/studenti');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(db.Student.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { fakultetID: 5 } })
    );
  });

  // Testira: endpoint prosljeđuje parametar pretrage u DB upit
  // Ulaz: GET /api/koordinator/studenti?pretraga=Amina, koordinator pronađen
  // Očekivani izlaz: HTTP 200, Student.findAll pozvan s where koji sadrži pretragu
  test('200 — filtrira po ?pretraga=Amina', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([makeMockStudent()]);

    const res = await request(app).get('/api/koordinator/studenti?pretraga=Amina');

    expect(res.status).toBe(200);
    expect(db.Student.findAll).toHaveBeenCalled();
  });

  // Testira: endpoint vraća prazan niz kada nema studenata na fakultetu
  // Ulaz: GET /api/koordinator/studenti, Student.findAll vraća []
  // Očekivani izlaz: HTTP 200, data = []
  test('200 — vraća prazan niz kada nema studenata', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/koordinator/studenti');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Testira: endpoint vraća 404 kada koordinator profil ne postoji u bazi
  // Ulaz: GET /api/koordinator/studenti, Koordinator.findOne vraća null
  // Očekivani izlaz: HTTP 404, success: false
  test('404 — koordinator profil ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/koordinator/studenti');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 500 kada DB baci grešku
  // Ulaz: GET /api/koordinator/studenti, Koordinator.findOne baca grešku
  // Očekivani izlaz: HTTP 500
  test('500 — greška baze vraća 500', async () => {
    db.Koordinator.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/koordinator/studenti');

    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/koordinator/studenti/:id/odobri ────────────────────────────────
describe('PATCH /api/koordinator/studenti/:id/odobri', () => {
  // Testira: koordinator uspješno odobrava studenta s istog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/10/odobri, student na istom fakultetu, PENDING_APPROVAL
  // Očekivani izlaz: HTTP 200, success: true, approvalStatus: 'APPROVED'
  test('200 — uspješno odobrava studenta s istog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'PENDING_APPROVAL' }));

    const res = await request(app).patch('/api/koordinator/studenti/10/odobri');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approvalStatus).toBe('APPROVED');
  });

  // Testira: endpoint vraća 404 kada koordinator profil ne postoji
  // Ulaz: PATCH /api/koordinator/studenti/10/odobri, Koordinator.findOne vraća null
  // Očekivani izlaz: HTTP 404
  test('404 — koordinator profil ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    const res = await request(app).patch('/api/koordinator/studenti/10/odobri');

    expect(res.status).toBe(404);
  });

  // Testira: endpoint vraća 404 kada student nije s koordinatorovog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/10/odobri, Student.findOne vraća null (drugi fakultet)
  // Očekivani izlaz: HTTP 404, poruka o pogrešnom fakultetu
  test('404 — student nije s koordinatorovog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app).patch('/api/koordinator/studenti/10/odobri');

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/fakulteta/i);
  });

  // Testira: endpoint vraća 400 kada student nije verifikovao email
  // Ulaz: PATCH /api/koordinator/studenti/10/odobri, user.emailVerifikovan = false
  // Očekivani izlaz: HTTP 400
  test('400 — student nije verifikovao email', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ emailVerifikovan: false }));

    const res = await request(app).patch('/api/koordinator/studenti/10/odobri');

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 409 kada student već nije u statusu PENDING_APPROVAL
  // Ulaz: PATCH /api/koordinator/studenti/10/odobri, user.approvalStatus = 'APPROVED'
  // Očekivani izlaz: HTTP 409
  test('409 — student već odobren (nije PENDING_APPROVAL)', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'APPROVED' }));

    const res = await request(app).patch('/api/koordinator/studenti/10/odobri');

    expect(res.status).toBe(409);
  });
});

// ── PATCH /api/koordinator/studenti/:id/odbij ─────────────────────────────────
describe('PATCH /api/koordinator/studenti/:id/odbij', () => {
  // Testira: koordinator uspješno odbija studenta s razlogom
  // Ulaz: PATCH /api/koordinator/studenti/10/odbij, body { razlog: 'Nepotpuna dokumentacija' }
  // Očekivani izlaz: HTTP 200, success: true, approvalStatus: 'REJECTED'
  test('200 — uspješno odbija studenta s razlogom', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'PENDING_APPROVAL' }));

    const res = await request(app)
      .patch('/api/koordinator/studenti/10/odbij')
      .send({ razlog: 'Nepotpuna dokumentacija' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.approvalStatus).toBe('REJECTED');
  });

  // Testira: endpoint vraća 400 kada razlog nije proslijeđen
  // Ulaz: PATCH /api/koordinator/studenti/10/odbij, body {} bez razloga
  // Očekivani izlaz: HTTP 400
  test('400 — nedostaje razlog odbijanja', async () => {
    const res = await request(app)
      .patch('/api/koordinator/studenti/10/odbij')
      .send({});

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je razlog prazan string
  // Ulaz: PATCH /api/koordinator/studenti/10/odbij, body { razlog: '   ' }
  // Očekivani izlaz: HTTP 400
  test('400 — razlog je prazan string', async () => {
    const res = await request(app)
      .patch('/api/koordinator/studenti/10/odbij')
      .send({ razlog: '   ' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada student nije s koordinatorovog fakulteta
  // Ulaz: PATCH /api/koordinator/studenti/10/odbij, Student.findOne vraća null
  // Očekivani izlaz: HTTP 404
  test('404 — student nije s koordinatorovog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/koordinator/studenti/10/odbij')
      .send({ razlog: 'Razlog' });

    expect(res.status).toBe(404);
  });

  // Testira: endpoint vraća 409 kada student već nije u statusu PENDING_APPROVAL
  // Ulaz: PATCH /api/koordinator/studenti/10/odbij, user.approvalStatus = 'REJECTED'
  // Očekivani izlaz: HTTP 409
  test('409 — student već odbijen (nije PENDING_APPROVAL)', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'REJECTED' }));

    const res = await request(app)
      .patch('/api/koordinator/studenti/10/odbij')
      .send({ razlog: 'Razlog' });

    expect(res.status).toBe(409);
  });
});

// ── GET /api/koordinator/zahtjevi ─────────────────────────────────────────────
describe('GET /api/koordinator/zahtjevi', () => {
  // Testira: endpoint vraća listu studenata koji čekaju odobrenje s koordinatorovog fakulteta
  // Ulaz: GET /api/koordinator/zahtjevi, getStudentApprovalRequestsForKoordinator vraća 1 zahtjev
  // Očekivani izlaz: HTTP 200, data je niz s jednim zahtjevom
  test('200 — vraća zahtjeve za odobravanje s istog fakulteta', async () => {
    getStudentApprovalRequestsForKoordinator.mockResolvedValue([
      {
        id: 10,
        ime: 'Amina',
        prezime: 'Begić',
        email: 'amina@test.com',
        role: 'STUDENT',
        approvalStatus: 'PENDING_APPROVAL',
      },
    ]);

    const res = await request(app).get('/api/koordinator/zahtjevi');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0].email).toBe('amina@test.com');
    expect(getStudentApprovalRequestsForKoordinator).toHaveBeenCalledWith(1);
  });

  // Testira: endpoint vraća prazan niz kada nema zahtjeva na čekanju
  // Ulaz: GET /api/koordinator/zahtjevi, getStudentApprovalRequestsForKoordinator vraća []
  // Očekivani izlaz: HTTP 200, data = []
  test('200 — vraća prazan niz kada nema zahtjeva', async () => {
    getStudentApprovalRequestsForKoordinator.mockResolvedValue([]);

    const res = await request(app).get('/api/koordinator/zahtjevi');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Testira: endpoint vraća 500 kada servis baci grešku
  // Ulaz: GET /api/koordinator/zahtjevi, getStudentApprovalRequestsForKoordinator baca grešku
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — greška servisa vraća 500', async () => {
    getStudentApprovalRequestsForKoordinator.mockRejectedValue(new Error('Servis pao'));

    const res = await request(app).get('/api/koordinator/zahtjevi');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ── GET /api/koordinator/prakse ───────────────────────────────────────────────
describe('GET /api/koordinator/prakse', () => {
  // Testira: endpoint vraća listu praksi s koordinatorovog fakulteta
  // Ulaz: GET /api/koordinator/prakse, koordinator postoji, Praksa.findAll vraća jednu praksu
  // Očekivani izlaz: HTTP 200, success: true, data je niz
  test('200 — vraća listu praksi', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([
      { id: 1, status: 'AKTIVNA', datumPocetka: new Date(), PrijavaNaPraksu: makeMockPrijava() },
    ]);

    const res = await request(app).get('/api/koordinator/prakse');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // Testira: endpoint prihvata lifecycle filter bez pohranjene status kolone
  // Ulaz: GET /api/koordinator/prakse?status=AKTIVNA
  // Očekivani izlaz: HTTP 200, Praksa.findAll pozvan bez filtera nad Praksa.status
  test('200 — filtrira po lifecycle stanju AKTIVNA', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/koordinator/prakse?status=AKTIVNA');

    expect(res.status).toBe(200);
    expect(db.Praksa.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: endpoint vraća prazan niz kada nema praksi
  // Ulaz: GET /api/koordinator/prakse, Praksa.findAll vraća []
  // Očekivani izlaz: HTTP 200, data = []
  test('200 — vraća prazan niz kada nema praksi', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/koordinator/prakse');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  // Testira: endpoint vraća 500 kada koordinator ne postoji
  // Ulaz: GET /api/koordinator/prakse, Koordinator.findOne vraća null
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — koordinator ne postoji vraća 500', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/koordinator/prakse');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  // Testira: endpoint vraća 500 kada DB baci grešku
  // Ulaz: GET /api/koordinator/prakse, Praksa.findAll baca grešku
  // Očekivani izlaz: HTTP 500, success: false
  test('500 — greška baze vraća 500', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/koordinator/prakse');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
