'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Oglas: { findByPk: jest.fn(), findAll: jest.fn() },
  Kompanija: { findByPk: jest.fn(), findOne: jest.fn() },
  PrijavaNaPraksu: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    findByPk: jest.fn(),
  },
  Dokument: {
    update: jest.fn(),
    findAll: jest.fn(),
  },
  Student: { findOne: jest.fn() },
  Odsjek: {},
  Fakultet: {},
}));

jest.mock('../../src/business/services/application_limit.service', () => ({
  checkStudentApplicationLimit: jest.fn(),
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendPrijavaPodnesenaEmail: jest.fn().mockResolvedValue(undefined),
  sendPrijavaShortlistedEmail: jest.fn().mockResolvedValue(undefined),
  sendPrijavaStatusEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn().mockResolvedValue(null),
  canSendInApp: jest.fn().mockReturnValue(false),
  canSendEmail: jest.fn().mockReturnValue(false),
}));

const db = require('../../src/infrastructure/database/models');
const { checkStudentApplicationLimit } = require('../../src/business/services/application_limit.service');
const { createApplication, getMyApplications } = require('../../src/business/services/applications.service');

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeMockUser(overrides = {}) {
  return { id: 1, ime: 'Test', prezime: 'Student', email: 'test@test.com', role: 'STUDENT', ...overrides };
}

function makeMockStudent(overrides = {}) {
  return {
    id: 10,
    userID: 1,
    index_number: 'IB210001',
    year_of_study: 3,
    fakultetID: 5,
    odsjekID: 2,
    ...overrides,
  };
}

function makeMockOglas(overrides = {}) {
  return { id: 50, naziv: 'Backend praksa', status: 'AKTIVAN', kompanijaID: 3, ...overrides };
}

function makeMockPrijava(overrides = {}) {
  const prijava = { id: 100, studentID: 10, oglasID: 50, status: 'CEKA_KOORDINATORA', ...overrides };
  prijava.update = jest.fn(async (data) => Object.assign(prijava, data));
  return prijava;
}

beforeEach(() => jest.clearAllMocks());

// ── createApplication ─────────────────────────────────────────────────────────
describe('createApplication', () => {
  beforeEach(() => {
    checkStudentApplicationLimit.mockResolvedValue({ allowed: true, current: 0, limit: 5 });
    db.User.findByPk.mockResolvedValue(makeMockUser());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.Oglas.findByPk.mockResolvedValue(makeMockOglas());
    db.PrijavaNaPraksu.findOne.mockResolvedValue(null);
    db.PrijavaNaPraksu.create.mockImplementation(async (data) => makeMockPrijava(data));
    db.Dokument.update.mockResolvedValue([0]);
    db.Dokument.findAll.mockResolvedValue([]);
    db.Kompanija.findByPk.mockResolvedValue({ id: 3, naziv: 'TechCo' });
  });

  // Testira: uspješna prijava kreira s novim status modelom
  // Ulaz: userId=1, data.oglasID=50, sve provjere prolaze
  // Očekivani izlaz: PrijavaNaPraksu.create s status=CEKA_KOORDINATORA
  test('kreira prijavu sa statusom CEKA_KOORDINATORA', async () => {
    const result = await createApplication(1, { oglasID: 50 });

    expect(db.PrijavaNaPraksu.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CEKA_KOORDINATORA',
        koordinatorStatus: 'NA_CEKANJU',
        kompanijaStatus: 'NIJE_DOSTUPNO',
      })
    );
    expect(result).toBeDefined();
  });

  // Testira: baca grešku kada je dostignut limit prijava
  // Ulaz: checkStudentApplicationLimit vraća { allowed: false, current: 5, limit: 5 }
  // Očekivani izlaz: baca Error s status=403
  test('baca grešku kada je dostignut limit prijava', async () => {
    checkStudentApplicationLimit.mockResolvedValue({ allowed: false, current: 5, limit: 5 });

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(403);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca NOT_FOUND kada oglasID nije proslijeđen
  // Ulaz: data={} bez oglasID
  // Očekivani izlaz: baca Error s status=404
  test('baca grešku kada oglasID nedostaje', async () => {
    const err = await createApplication(1, {}).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca NOT_FOUND kada oglas ne postoji u bazi
  // Ulaz: Oglas.findByPk vraća null
  // Očekivani izlaz: baca Error s status=404
  test('baca grešku kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca grešku kada oglas nije aktivan
  // Ulaz: oglas.status='ZATVOREN'
  // Očekivani izlaz: baca Error s status=400
  test('baca grešku kada oglas nije aktivan', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeMockOglas({ status: 'ZATVOREN' }));

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca 409 kada student već ima aktivnu prijavu na isti oglas
  // Ulaz: PrijavaNaPraksu.findOne vraća postojeću prijavu
  // Očekivani izlaz: baca Error s status=409
  test('baca 409 za duplu prijavu na isti oglas', async () => {
    db.PrijavaNaPraksu.findOne.mockResolvedValue({ id: 99 });

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(409);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca 400 kada student profil nije potpun (nema index_number)
  // Ulaz: student.index_number=null
  // Očekivani izlaz: baca Error s status=400
  test('baca grešku kada student profil nije potpun', async () => {
    db.Student.findOne.mockResolvedValue(makeMockStudent({ index_number: null }));

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(400);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });

  // Testira: baca 403 kada user nije STUDENT
  // Ulaz: user.role='COMPANY'
  // Očekivani izlaz: baca Error s status=403
  test('baca grešku kada korisnik nije STUDENT', async () => {
    db.User.findByPk.mockResolvedValue(makeMockUser({ role: 'COMPANY' }));

    const err = await createApplication(1, { oglasID: 50 }).catch(e => e);

    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(403);
    expect(db.PrijavaNaPraksu.create).not.toHaveBeenCalled();
  });
});

// ── getMyApplications ─────────────────────────────────────────────────────────
describe('getMyApplications', () => {
  // Testira: vraća prijave studenta s kompletnim profilom
  // Ulaz: userId=1, student postoji i ima potpun profil
  // Očekivani izlaz: niz prijava
  test('vraća prijave studenta s kompletnim profilom', async () => {
    db.User.findByPk.mockResolvedValue(makeMockUser());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    const mockPrijave = [{ id: 100 }, { id: 101 }];
    db.PrijavaNaPraksu.findAll.mockResolvedValue(mockPrijave);

    const result = await getMyApplications(1);

    expect(db.PrijavaNaPraksu.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { studentID: 10 } })
    );
    expect(result).toBe(mockPrijave);
  });

  // Testira: vraća prazan niz kada student ne postoji
  // Ulaz: Student.findOne vraća null
  // Očekivani izlaz: []
  test('vraća prazan niz kada student ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(makeMockUser());
    db.Student.findOne.mockResolvedValue(null);

    const result = await getMyApplications(1);

    expect(result).toEqual([]);
    expect(db.PrijavaNaPraksu.findAll).not.toHaveBeenCalled();
  });

  // Testira: vraća prazan niz kada student profil nije potpun
  // Ulaz: student.index_number=null (nepotpun profil)
  // Očekivani izlaz: []
  test('vraća prazan niz kada student profil nije potpun', async () => {
    db.User.findByPk.mockResolvedValue(makeMockUser());
    db.Student.findOne.mockResolvedValue(makeMockStudent({ index_number: null }));

    const result = await getMyApplications(1);

    expect(result).toEqual([]);
    expect(db.PrijavaNaPraksu.findAll).not.toHaveBeenCalled();
  });
});
