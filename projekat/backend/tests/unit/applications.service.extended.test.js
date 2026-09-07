'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Oglas: { findByPk: jest.fn(), findAll: jest.fn() },
  Kompanija: { findByPk: jest.fn(), findOne: jest.fn() },
  PrijavaNaPraksu: {
    create: jest.fn(), findOne: jest.fn(), findAll: jest.fn(),
    update: jest.fn(), findByPk: jest.fn(), count: jest.fn(),
  },
  Dokument: { update: jest.fn(), findAll: jest.fn() },
  Odsjek: {},
  Fakultet: {},
}));

jest.mock('../../src/business/services/application_limit.service', () => ({
  checkStudentApplicationLimit: jest.fn().mockResolvedValue({ allowed: true, current: 0, limit: 5 }),
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
const {
  getApplicationStatistics,
  getCompanyApplicationsForListing,
  shortlistApplication,
  approveApplicationByCompany,
  rejectApplicationByCompany,
} = require('../../src/business/services/applications.service');

beforeEach(() => jest.clearAllMocks());

function makeCompanyUser() {
  return { id: 2, role: 'COMPANY' };
}

function makeKompanija(overrides = {}) {
  return { id: 5, naziv: 'Firma', userID: 2, ...overrides };
}

function makeOglas(overrides = {}) {
  return { id: 10, naziv: 'Backend', status: 'AKTIVAN', kompanijaID: 5, Kompanija: makeKompanija(), ...overrides };
}

function makePrijava(overrides = {}) {
  const p = {
    id: 100, studentID: 20, oglasID: 10,
    status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO', kompanijaStatus: 'NA_CEKANJU',
    Student: {
      id: 20, year_of_study: 3, fakultetID: 1, odsjekID: 1,
      User: { id: 99, ime: 'A', prezime: 'B', email: 'a@b.com' },
      Fakultet: null, Odsjek: null,
    },
    Dokuments: [],
    ...overrides,
  };
  p.update = jest.fn(async (data) => Object.assign(p, data));
  return p;
}

// ── getApplicationStatistics ──────────────────────────────────────────────────
describe('getApplicationStatistics', () => {
  test('baca 404 kada kompanija ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await getApplicationStatistics(2).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('vraća praznu statistiku kada kompanija nema aktivnih oglasa', async () => {
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([]);

    const result = await getApplicationStatistics(2);
    expect(result.summary.totalApplications).toBe(0);
    expect(result.perListing).toEqual([]);
  });

  test('vraća statistiku s prijavama', async () => {
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([{ id: 10, naziv: 'Backend', status: 'AKTIVAN' }]);
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 1, oglasID: 10,
        Student: { year_of_study: 3, Odsjek: null, Fakultet: null },
      },
    ]);

    const result = await getApplicationStatistics(2);
    expect(result.summary.totalApplications).toBe(1);
    expect(result.byYear).toEqual([{ year: 3, count: 1 }]);
  });

  test('računa statistiku s odsjekom i fakultetom', async () => {
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([{ id: 10, naziv: 'Backend', status: 'AKTIVAN' }]);
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 1, oglasID: 10,
        Student: {
          year_of_study: 2,
          Odsjek: { id: 1, naziv: 'Softversko' },
          Fakultet: { id: 1, naziv: 'ETF' },
        },
      },
    ]);

    const result = await getApplicationStatistics(2);
    expect(result.byFakultet).toHaveLength(1);
    expect(result.byOdsjek).toHaveLength(1);
  });
});

// ── getCompanyApplicationsForListing ─────────────────────────────────────────
describe('getCompanyApplicationsForListing', () => {
  beforeEach(() => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findAll.mockResolvedValue([]);
  });

  test('vraća prijave za oglas kompanije', async () => {
    const result = await getCompanyApplicationsForListing(2, '10');
    expect(result.oglas).toBeDefined();
    expect(Array.isArray(result.applications)).toBe(true);
  });

  test('baca 403 kada user nije COMPANY', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'STUDENT' });
    const err = await getCompanyApplicationsForListing(2, '10').catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 404 kada oglasId nije validan broj', async () => {
    const err = await getCompanyApplicationsForListing(2, 'abc').catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await getCompanyApplicationsForListing(2, '10').catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada oglas pripada drugoj kompaniji', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ kompanijaID: 99 }));
    const err = await getCompanyApplicationsForListing(2, '10').catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije AKTIVAN', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    const err = await getCompanyApplicationsForListing(2, '10').catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── shortlistApplication ──────────────────────────────────────────────────────
describe('shortlistApplication', () => {
  function setupForShortlist(prijavaOverrides = {}) {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findByPk
      .mockResolvedValueOnce(makePrijava(prijavaOverrides))
      .mockResolvedValue(makePrijava(prijavaOverrides));
    db.PrijavaNaPraksu.update.mockResolvedValue([1]);
  }

  test('uspješno stavlja prijavu u uži krug', async () => {
    setupForShortlist();
    const result = await shortlistApplication(2, '100');
    expect(db.PrijavaNaPraksu.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'U_RAZMATRANJU' }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  test('vraća existing ako je već U_RAZMATRANJU', async () => {
    setupForShortlist({ status: 'U_RAZMATRANJU', kompanijaStatus: 'U_RAZMATRANJU' });
    await shortlistApplication(2, '100');
    expect(db.PrijavaNaPraksu.update).not.toHaveBeenCalled();
  });

  test('baca 400 kada prijava nije CEKA_KOMPANIJU (već zaključena)', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava({ status: 'ODOBRENA', kompanijaStatus: 'ODOBRENO' }));
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── approveApplicationByCompany ───────────────────────────────────────────────
describe('approveApplicationByCompany', () => {
  function setup(prijavaOverrides = {}) {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findByPk
      .mockResolvedValueOnce(makePrijava(prijavaOverrides))
      .mockResolvedValue(makePrijava({ ...prijavaOverrides, status: 'ODOBRENA' }));
    db.PrijavaNaPraksu.update.mockResolvedValue([1]);
  }

  test('uspješno odobrava prijavu', async () => {
    setup();
    const result = await approveApplicationByCompany(2, '100');
    expect(db.PrijavaNaPraksu.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODOBRENA' }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });

  test('baca 400 kada je prijava već zaključena', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava({ status: 'ODOBRENA', kompanijaStatus: 'ODOBRENO' }));
    const err = await approveApplicationByCompany(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada update ne ažurira nijedan red', async () => {
    setup();
    db.PrijavaNaPraksu.update.mockResolvedValue([0]);
    const err = await approveApplicationByCompany(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── rejectApplicationByCompany ────────────────────────────────────────────────
describe('rejectApplicationByCompany', () => {
  test('uspješno odbija prijavu', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findByPk
      .mockResolvedValueOnce(makePrijava())
      .mockResolvedValue(makePrijava({ status: 'ODBIJENA_KOMPANIJA' }));
    db.PrijavaNaPraksu.update.mockResolvedValue([1]);

    const result = await rejectApplicationByCompany(2, '100');
    expect(db.PrijavaNaPraksu.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODBIJENA_KOMPANIJA' }),
      expect.any(Object)
    );
    expect(result).toBeDefined();
  });
});

// ── resolveCompanyFromUser — additional branches ──────────────────────────────
describe('resolveCompanyFromUser — kompanija ne postoji', () => {
  test('baca 404 kada kompanija nije pronađena za COMPANY usera', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await getCompanyApplicationsForListing(2, '10').catch(e => e);
    expect(err.status).toBe(404);
  });
});

// ── loadCompanyActionContext — error paths ────────────────────────────────────
describe('loadCompanyActionContext — grane grešaka (via shortlistApplication)', () => {
  test('baca 404 kada prijava nije pronađena', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 404 kada oglas nije pronađen', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava());
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada oglas pripada drugoj kompaniji', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava());
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ kompanijaID: 99 }));
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije AKTIVAN', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava());
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada koordinator nije odobrio prijavu', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makePrijava({ koordinatorStatus: 'NA_CEKANJU' })
    );
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada je student povukao prijavu', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makePrijava({ status: 'ODUSTAO' })
    );
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    const err = await shortlistApplication(2, '100').catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── mapCompanyApplication — pokrivanje kroz getCompanyApplicationsForListing ──
describe('getCompanyApplicationsForListing — mapCompanyApplication', () => {
  test('mapira prijave s podacima o studentu, oglasu i dokumentima', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 1, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO',
        kompanijaStatus: 'NA_CEKANJU', datumPrijave: new Date(),
        Oglas: { id: 10, naziv: 'Backend', status: 'AKTIVAN' },
        Ogla: undefined,
        Student: {
          id: 20, year_of_study: 3, fakultetID: 1, odsjekID: 1,
          User: { ime: 'Ana', prezime: 'Anić', email: 'ana@test.com' },
          Fakultet: { id: 1, naziv: 'ETF' },
          Odsjek: { id: 1, naziv: 'Softversko' },
        },
        Dokuments: [
          { id: 5, original_name: 'CV.pdf', tip_dokumenta: 'CV', mime_path: 'application/pdf', size: 1000, created_at: new Date() },
        ],
      },
    ]);

    const result = await getCompanyApplicationsForListing(2, '10');

    expect(result.applications).toHaveLength(1);
    expect(result.applications[0].student.ime).toBe('Ana');
    expect(result.applications[0].dokumenti).toHaveLength(1);
    expect(result.applications[0].dokumenti[0].naziv).toBe('CV.pdf');
  });

  test('mapira prijavu bez studenta i bez dokumenta', async () => {
    db.User.findByPk.mockResolvedValue(makeCompanyUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 2, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO',
        kompanijaStatus: 'NA_CEKANJU', datumPrijave: new Date(),
        Oglas: null, Ogla: null,
        Student: null,
        Dokuments: [],
      },
    ]);

    const result = await getCompanyApplicationsForListing(2, '10');

    expect(result.applications[0].student).toBeNull();
    expect(result.applications[0].oglas).toBeNull();
    expect(result.applications[0].dokumenti).toHaveLength(0);
  });
});
