'use strict';

const request = require('supertest');

jest.mock('../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 1, role: 'ADMIN' };
    next();
  },
}));

jest.mock('../src/middleware/rbac.middleware', () => ({
  authorize: () => (_req, _res, next) => next(),
}));

jest.mock('../src/infrastructure/database/models', () => ({
  User: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Fakultet: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Odsjek: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Koordinator: {
    count: jest.fn(),
    findOne: jest.fn(),
  },
  Student: {
    count: jest.fn(),
    findOne: jest.fn(),
  },
  Kompanija: {
    findOne: jest.fn(),
  },
  Oglas: {
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  PrijavaNaPraksu: {
    findAll: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Praksa: { findOne: jest.fn() },
  Aktivnost: { destroy: jest.fn() },
  Prisustvo: { destroy: jest.fn() },
  Evaluacija: { destroy: jest.fn() },
  Ugovor: { destroy: jest.fn() },
  Izvjestaj: { destroy: jest.fn() },
  sequelize: { transaction: jest.fn() },
}));

const app = require('../src/app');
const { User, Fakultet, Odsjek, Koordinator, Student, sequelize } = require('../src/infrastructure/database/models');

function makeMockUser(overrides = {}) {
  const base = {
    id: 1,
    ime: 'Haris',
    prezime: 'Husic',
    email: 'haris@example.com',
    role: 'STUDENT',
    status: 'PENDING',
    institution: 'FIT',
    emailVerifikovan: true,
    created_at: new Date('2025-01-01'),
  };
  const data = { ...base, ...overrides };
  return { ...data, save: jest.fn().mockResolvedValue(undefined) };
}

function makeMockFaculty(overrides = {}) {
  return {
    id: 1,
    naziv: 'FIT',
    email: 'fit@unsa.ba',
    adresa: 'Zmaja od Bosne',
    save: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMockOdsjek(overrides = {}) {
  return {
    id: 1,
    naziv: 'Racunarstvo',
    fakultetID: 1,
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── GET /api/admin/users ──────────────────────────────────────────────────────

describe('GET /api/admin/users', () => {
  // Testira: endpoint vraća listu korisnika s ispravno mapiranim poljima
  // Ulaz: GET /api/admin/users, User.findAll vraća jednog korisnika
  // Očekivani izlaz: HTTP 200, niz s objektom koji ima name, email, role, status, institution
  test('200 — vraća listu korisnika s mapiranim poljima', async () => {
    User.findAll.mockResolvedValue([makeMockUser()]);

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({
      id: 1,
      name: 'Haris Husic',
      email: 'haris@example.com',
      role: 'STUDENT',
      status: 'PENDING',
      institution: 'FIT',
    });
  });

  // Testira: endpoint prosljeđuje query parametar status u DB upit kao where filter
  // Ulaz: GET /api/admin/users?status=PENDING
  // Očekivani izlaz: HTTP 200, User.findAll pozvan s where: { status: 'PENDING' }
  test('200 — filtrira po statusu kad je proslijeđen ?status=PENDING', async () => {
  User.findAll.mockResolvedValue([makeMockUser({ status: 'PENDING' })]);

  const res = await request(app).get('/api/admin/users?status=PENDING');

  expect(res.status).toBe(200);
  expect(User.findAll).toHaveBeenCalledWith(
    expect.objectContaining({ where: { status: 'PENDING', approvalStatus: 'APPROVED' } })
  );
});

  // Testira: endpoint vraća prazan niz kada nema korisnika u bazi
  // Ulaz: GET /api/admin/users, User.findAll vraća []
  // Očekivani izlaz: HTTP 200, body = []
  test('200 — vraća prazan niz kad nema korisnika', async () => {
    User.findAll.mockResolvedValue([]);

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Testira: endpoint vraća 500 kada DB baci grešku
  // Ulaz: GET /api/admin/users, User.findAll baca Error('DB connection failed')
  // Očekivani izlaz: HTTP 500, body ima message polje
  test('500 — greška baze vraća 500', async () => {
    User.findAll.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('message');
  });
});

// ── PATCH /api/admin/users/:id/role ──────────────────────────────────────────

describe('PATCH /api/admin/users/:id/role', () => {
  // Testira: endpoint uspješno mijenja rolu korisnika i vraća ažurirani objekat
  // Ulaz: PATCH /api/admin/users/1/role, body { role: 'COORDINATOR' }, korisnik pronađen
  // Očekivani izlaz: HTTP 200, res.body.user.role = 'COORDINATOR', save() pozvan
  test('200 — uspješno mijenja rolu', async () => {
    const mockUser = makeMockUser({ role: 'STUDENT' });
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .patch('/api/admin/users/1/role')
      .send({ role: 'COORDINATOR' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('COORDINATOR');
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  // Testira: endpoint prihvata lowercase rolu i konvertuje je u uppercase
  // Ulaz: PATCH /api/admin/users/1/role, body { role: 'admin' }
  // Očekivani izlaz: HTTP 200, res.body.user.role = 'ADMIN'
  test('200 — prima lowercase rolu i konvertuje u uppercase', async () => {
    const mockUser = makeMockUser();
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .patch('/api/admin/users/1/role')
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('ADMIN');
  });

  // Testira: endpoint vraća 400 kada role polje nije proslijeđeno u body-u
  // Ulaz: PATCH /api/admin/users/1/role, body {} (prazan)
  // Očekivani izlaz: HTTP 400, poruka sadrži "role"
  test('400 — nedostaje polje "role" u body-u', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/role')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/role/i);
  });

  // Testira: endpoint vraća 400 za rolu koja nije u listi dozvoljenih vrijednosti
  // Ulaz: PATCH /api/admin/users/1/role, body { role: 'SUPERADMIN' }
  // Očekivani izlaz: HTTP 400
  test('400 — nevažeća vrijednost role (SUPERADMIN)', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/role')
      .send({ role: 'SUPERADMIN' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id u URL-u string a ne broj
  // Ulaz: PATCH /api/admin/users/abc/role, body { role: 'STUDENT' }
  // Očekivani izlaz: HTTP 400
  test('400 — id nije broj (string "abc")', async () => {
    const res = await request(app)
      .patch('/api/admin/users/abc/role')
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id negativan broj
  // Ulaz: PATCH /api/admin/users/-1/role, body { role: 'STUDENT' }
  // Očekivani izlaz: HTTP 400
  test('400 — id je negativan broj', async () => {
    const res = await request(app)
      .patch('/api/admin/users/-1/role')
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada korisnik s datim id-em ne postoji
  // Ulaz: PATCH /api/admin/users/999/role, body { role: 'ADMIN' }, User.findByPk vraća null
  // Očekivani izlaz: HTTP 404, poruka sadrži "not found"
  test('404 — korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/admin/users/999/role')
      .send({ role: 'ADMIN' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

describe('GET /api/admin/faculties', () => {
  test('200 - vraca listu fakulteta', async () => {
    Fakultet.findAll.mockResolvedValue([makeMockFaculty()]);

    const res = await request(app).get('/api/admin/faculties');

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: 1, naziv: 'FIT' });
    expect(Fakultet.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['naziv', 'ASC']] })
    );
  });

  test('500 - greska baze vraca 500', async () => {
    Fakultet.findAll.mockRejectedValue(new Error('DB failed'));

    const res = await request(app).get('/api/admin/faculties');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB failed');
  });
});

describe('POST /api/admin/faculties', () => {
  test('201 - kreira fakultet', async () => {
    Fakultet.create.mockResolvedValue(makeMockFaculty({ naziv: 'PMF' }));

    const res = await request(app)
      .post('/api/admin/faculties')
      .send({ naziv: ' PMF ', email: 'pmf@unsa.ba', adresa: 'Sarajevo' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ naziv: 'PMF' });
    expect(Fakultet.create).toHaveBeenCalledWith({
      naziv: 'PMF',
      email: 'pmf@unsa.ba',
      adresa: 'Sarajevo',
    });
  });

  test('400 - naziv je obavezan', async () => {
    const res = await request(app)
      .post('/api/admin/faculties')
      .send({ email: 'fit@unsa.ba' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/naziv/i);
  });
});

describe('PUT /api/admin/faculties/:id', () => {
  test('200 - azurira fakultet', async () => {
    const faculty = makeMockFaculty({ naziv: 'Stari naziv' });
    Fakultet.findByPk.mockResolvedValue(faculty);

    const res = await request(app)
      .put('/api/admin/faculties/1')
      .send({ naziv: 'Novi naziv' });

    expect(res.status).toBe(200);
    expect(res.body.naziv).toBe('Novi naziv');
    expect(faculty.save).toHaveBeenCalledTimes(1);
  });

  test('400 - id mora biti pozitivan broj', async () => {
    const res = await request(app)
      .put('/api/admin/faculties/abc')
      .send({ naziv: 'FIT' });

    expect(res.status).toBe(400);
    expect(Fakultet.findByPk).not.toHaveBeenCalled();
  });

  test('404 - fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/admin/faculties/999')
      .send({ naziv: 'FIT' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/faculties/:id', () => {
  test('200 - brise fakultet bez povezanih zapisa', async () => {
    const faculty = makeMockFaculty();
    Fakultet.findByPk.mockResolvedValue(faculty);
    Koordinator.count.mockResolvedValue(0);
    Student.count.mockResolvedValue(0);

    const res = await request(app).delete('/api/admin/faculties/1');

    expect(res.status).toBe(200);
    expect(faculty.destroy).toHaveBeenCalledTimes(1);
  });

  test('409 - ne brise fakultet sa koordinatorima', async () => {
    Fakultet.findByPk.mockResolvedValue(makeMockFaculty());
    Koordinator.count.mockResolvedValue(1);

    const res = await request(app).delete('/api/admin/faculties/1');

    expect(res.status).toBe(409);
    expect(Student.count).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/faculties/:id/odsjeci', () => {
  test('200 - vraca odsjeke za fakultet', async () => {
    Fakultet.findByPk.mockResolvedValue(makeMockFaculty());
    Odsjek.findAll.mockResolvedValue([makeMockOdsjek()]);

    const res = await request(app).get('/api/admin/faculties/1/odsjeci');

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ naziv: 'Racunarstvo', fakultetID: 1 });
    expect(Odsjek.findAll).toHaveBeenCalledWith({
      where: { fakultetID: 1 },
      order: [['naziv', 'ASC']],
    });
  });

  test('400 - faculty id mora biti pozitivan broj', async () => {
    const res = await request(app).get('/api/admin/faculties/0/odsjeci');

    expect(res.status).toBe(400);
    expect(Odsjek.findAll).not.toHaveBeenCalled();
  });

  test('404 - fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/admin/faculties/999/odsjeci');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/admin/faculties/:id/odsjeci', () => {
  test('201 - kreira odsjek', async () => {
    Fakultet.findByPk.mockResolvedValue(makeMockFaculty());
    Odsjek.create.mockResolvedValue(makeMockOdsjek({ naziv: 'Softversko inzenjerstvo' }));

    const res = await request(app)
      .post('/api/admin/faculties/1/odsjeci')
      .send({ naziv: ' Softversko inzenjerstvo ' });

    expect(res.status).toBe(201);
    expect(res.body.naziv).toBe('Softversko inzenjerstvo');
    expect(Odsjek.create).toHaveBeenCalledWith({
      naziv: 'Softversko inzenjerstvo',
      fakultetID: 1,
    });
  });

  test('400 - naziv je obavezan', async () => {
    const res = await request(app)
      .post('/api/admin/faculties/1/odsjeci')
      .send({});

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/odsjeci/:id', () => {
  test('200 - brise odsjek', async () => {
    const odsjek = makeMockOdsjek();
    Odsjek.findByPk.mockResolvedValue(odsjek);

    const res = await request(app).delete('/api/admin/odsjeci/1');

    expect(res.status).toBe(200);
    expect(odsjek.destroy).toHaveBeenCalledTimes(1);
  });

  test('404 - odsjek ne postoji', async () => {
    Odsjek.findByPk.mockResolvedValue(null);

    const res = await request(app).delete('/api/admin/odsjeci/999');

    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────

describe('PATCH /api/admin/users/:id/status', () => {
  // Testira: endpoint uspješno mijenja status korisnika i vraća ažurirani objekat
  // Ulaz: PATCH /api/admin/users/1/status, body { status: 'ACTIVE' }, korisnik s PENDING statusom
  // Očekivani izlaz: HTTP 200, res.body.user.status = 'ACTIVE', save() pozvan
  test('200 — uspješno mijenja status na ACTIVE', async () => {
    const mockUser = makeMockUser({ status: 'PENDING' });
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .patch('/api/admin/users/1/status')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('ACTIVE');
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  // Testira: endpoint prihvata lowercase status i konvertuje ga u uppercase
  // Ulaz: PATCH /api/admin/users/1/status, body { status: 'deactivated' }
  // Očekivani izlaz: HTTP 200, res.body.user.status = 'DEACTIVATED'
  test('200 — prima lowercase status i konvertuje u uppercase', async () => {
    const mockUser = makeMockUser();
    User.findByPk.mockResolvedValue(mockUser);

    const res = await request(app)
      .patch('/api/admin/users/1/status')
      .send({ status: 'deactivated' });

    expect(res.status).toBe(200);
    expect(res.body.user.status).toBe('DEACTIVATED');
  });

  // Testira: endpoint vraća 400 kada status polje nije proslijeđeno u body-u
  // Ulaz: PATCH /api/admin/users/1/status, body {} (prazan)
  // Očekivani izlaz: HTTP 400, poruka sadrži "status"
  test('400 — nedostaje polje "status" u body-u', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/status')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/status/i);
  });

  // Testira: endpoint vraća 400 za status koji nije u listi dozvoljenih vrijednosti
  // Ulaz: PATCH /api/admin/users/1/status, body { status: 'BANNED' }
  // Očekivani izlaz: HTTP 400
  test('400 — nevažeća vrijednost statusa (BANNED)', async () => {
    const res = await request(app)
      .patch('/api/admin/users/1/status')
      .send({ status: 'BANNED' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id u URL-u string a ne broj
  // Ulaz: PATCH /api/admin/users/xyz/status, body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 400
  test('400 — id nije broj (string "xyz")', async () => {
    const res = await request(app)
      .patch('/api/admin/users/xyz/status')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 400 kada je id nula (nije pozitivan cijeli broj)
  // Ulaz: PATCH /api/admin/users/0/status, body { status: 'ACTIVE' }
  // Očekivani izlaz: HTTP 400
  test('400 — id je nula', async () => {
    const res = await request(app)
      .patch('/api/admin/users/0/status')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(400);
  });

  // Testira: endpoint vraća 404 kada korisnik s datim id-em ne postoji
  // Ulaz: PATCH /api/admin/users/999/status, body { status: 'ACTIVE' }, User.findByPk vraća null
  // Očekivani izlaz: HTTP 404, poruka sadrži "not found"
  test('404 — korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/admin/users/999/status')
      .send({ status: 'ACTIVE' });

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });
});

// ── DELETE /api/admin/users/:id ────────────────────────────────────────────

describe('DELETE /api/admin/users/:id', () => {
  test('200 — uspješno briše STUDENT korisnika', async () => {
    const user = {
      ...makeMockUser({ role: 'STUDENT' }),
      destroy: jest.fn().mockResolvedValue(undefined),
    };
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(null);
    sequelize.transaction.mockImplementation(async (cb) => cb({}));

    const res = await request(app).delete('/api/admin/users/1');

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deleted');
  });

  test('404 — korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);

    const res = await request(app).delete('/api/admin/users/999');

    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška transakcije', async () => {
    User.findByPk.mockResolvedValue({ ...makeMockUser({ role: 'STUDENT' }), destroy: jest.fn() });
    Student.findOne.mockResolvedValue(null);
    sequelize.transaction.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/admin/users/1');

    expect(res.status).toBe(500);
  });
});
