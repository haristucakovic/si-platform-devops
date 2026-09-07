'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Oglas: { findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn(), update: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  User: { findByPk: jest.fn() },
  PrijavaNaPraksu: { count: jest.fn() },
}));

jest.mock('../../src/business/services/audit.service', () => ({
  ACTION_TYPES: { LISTING_UPDATED: 'LISTING_UPDATED' },
  logAudit: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/business/services/applicationStatus.service', () => ({
  APPLICATION_STATUS: { APPROVED: 'ODOBRENA' },
}));

const db = require('../../src/infrastructure/database/models');
const {
  createListing,
  getListingsByCompany,
  getActiveListings,
  updateListing,
  getClosedListings,
  getClosedListingsByCompany,
  closeListing,
  archiveListing,
  restoreFromArchive,
} = require('../../src/business/services/listings.service');

beforeEach(() => jest.clearAllMocks());

function makeUser(overrides = {}) {
  return {
    id: 1, role: 'COMPANY', emailVerifikovan: true,
    approvalStatus: 'APPROVED', status: 'ACTIVE',
    ...overrides,
  };
}

function makeKompanija(overrides = {}) {
  return { id: 5, userID: 1, ...overrides };
}

function makeOglas(overrides = {}) {
  const oglas = {
    id: 10, naziv: 'Test oglas', status: 'AKTIVAN', kompanijaID: 5,
    datumPocetka: '2099-02-01', trajanje: 3,
    ...overrides,
  };
  oglas.update = jest.fn(async (data) => Object.assign(oglas, data));
  return oglas;
}

// ── createListing ─────────────────────────────────────────────────────────────
describe('createListing', () => {
  beforeEach(() => {
    db.User.findByPk.mockResolvedValue(makeUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.create.mockResolvedValue(makeOglas());
  });

  test('uspješno kreira oglas', async () => {
    const result = await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 3 }, 1);
    expect(db.Oglas.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'AKTIVAN', kompanijaID: 5 }));
    expect(result).toBeDefined();
  });

  test('baca 404 kada user ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(null);
    const err = await createListing({}, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada user nije COMPANY', async () => {
    db.User.findByPk.mockResolvedValue(makeUser({ role: 'STUDENT' }));
    const err = await createListing({}, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 403 kada email nije verifikovan', async () => {
    db.User.findByPk.mockResolvedValue(makeUser({ emailVerifikovan: false }));
    const err = await createListing({}, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 403 kada nalog nije odobren', async () => {
    db.User.findByPk.mockResolvedValue(makeUser({ approvalStatus: 'PENDING' }));
    const err = await createListing({}, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 404 kada kompanijski profil ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await createListing({}, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('kreira oglas s tehnologijama i uslovima', async () => {
    await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 3, tehnologije: ['JS', null], uslovi: ['Node'] }, 1);
    expect(db.Oglas.create).toHaveBeenCalledWith(expect.objectContaining({ tehnologije: ['JS'], uslovi: ['Node'] }));
  });

  test('kreira oglas bez opcionih polja oblast, placenaPraksa, lokacija, tip', async () => {
    await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 2 }, 1);
    expect(db.Oglas.create).toHaveBeenCalledWith(expect.objectContaining({
      oblast: null,
      placenaPraksa: false,
      lokacija: null,
      tip: 'Onsite',
    }));
  });

  test('kreira oglas s praznim objektima za tehnologije i uslovi (ne-niz fallback)', async () => {
    await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 2, tehnologije: 'not-array', uslovi: null }, 1);
    expect(db.Oglas.create).toHaveBeenCalledWith(expect.objectContaining({
      tehnologije: [],
      uslovi: [],
    }));
  });

  test('baca 400 kada datum početka prakse nije unesen', async () => {
    const err = await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2099-01-01', trajanje: 3 }, 1).catch(e => e);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Datum početka prakse je obavezan.');
  });

  test('baca 400 kada trajanje nije pozitivan broj mjeseci', async () => {
    const err = await createListing({ naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 0 }, 1).catch(e => e);
    expect(err.status).toBe(400);
    expect(err.message).toBe('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
  });
});

// ── getListingsByCompany ──────────────────────────────────────────────────────
describe('getListingsByCompany', () => {
  test('vraća oglase kompanije', async () => {
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([makeOglas()]);
    const result = await getListingsByCompany(1);
    expect(db.Oglas.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { kompanijaID: 5 } }));
    expect(result).toHaveLength(1);
  });

  test('baca 404 kada kompanija ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await getListingsByCompany(1).catch(e => e);
    expect(err.status).toBe(404);
  });
});

// ── getActiveListings ─────────────────────────────────────────────────────────
describe('getActiveListings', () => {
  test('vraća aktivne oglase', async () => {
    db.Oglas.findAll.mockResolvedValue([makeOglas()]);
    const result = await getActiveListings();
    expect(db.Oglas.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: 'AKTIVAN' }) }));
    expect(result).toHaveLength(1);
  });
});

// ── getClosedListings ─────────────────────────────────────────────────────────
describe('getClosedListings', () => {
  test('vraća zatvorene oglase', async () => {
    db.Oglas.findAll.mockResolvedValue([makeOglas({ status: 'ZATVOREN' })]);
    const result = await getClosedListings();
    expect(db.Oglas.findAll).toHaveBeenCalled();
    expect(result).toHaveLength(1);
  });
});

// ── getClosedListingsByCompany ────────────────────────────────────────────────
describe('getClosedListingsByCompany', () => {
  test('vraća zatvorene oglase kompanije', async () => {
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([]);
    const result = await getClosedListingsByCompany(1);
    expect(db.Oglas.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { kompanijaID: 5, status: 'ZATVOREN' } }));
    expect(result).toEqual([]);
  });

  test('baca 404 kada kompanija ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await getClosedListingsByCompany(1).catch(e => e);
    expect(err.status).toBe(404);
  });
});

// ── updateListing ─────────────────────────────────────────────────────────────
describe('updateListing', () => {
  beforeEach(() => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.User.findByPk.mockResolvedValue(makeUser());
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    db.PrijavaNaPraksu.count.mockResolvedValue(0);
  });

  test('uspješno ažurira oglas', async () => {
    const result = await updateListing(10, { naziv: 'Novi', opis: 'Opis', brojMjesta: 3, rokPrijave: '2099-01-01', datumPocetka: '2099-02-01', trajanje: 3 }, 1);
    expect(result).toBeDefined();
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await updateListing(999, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 404 kada user ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(null);
    const err = await updateListing(10, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada user nije COMPANY', async () => {
    db.User.findByPk.mockResolvedValue(makeUser({ role: 'STUDENT' }));
    const err = await updateListing(10, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 404 kada kompanija ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await updateListing(10, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada oglas pripada drugoj kompaniji', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 99 });
    const err = await updateListing(10, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije AKTIVAN', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    const err = await updateListing(10, { naziv: 'X' }, 1).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada je rokPrijave u prošlosti', async () => {
    const err = await updateListing(10, { naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2000-01-01' }, 1).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada je brojMjesta 0', async () => {
    const err = await updateListing(10, { naziv: 'X', opis: 'Y', brojMjesta: 0, rokPrijave: '2099-01-01' }, 1).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 kada je brojMjesta manji od odobrenih prijava', async () => {
    db.PrijavaNaPraksu.count.mockResolvedValue(5);
    const err = await updateListing(10, { naziv: 'X', opis: 'Y', brojMjesta: 3, rokPrijave: '2099-01-01' }, 1).catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── closeListing ──────────────────────────────────────────────────────────────
describe('closeListing', () => {
  test('uspješno zatvara aktivni oglas', async () => {
    const oglas = makeOglas();
    db.Oglas.findByPk.mockResolvedValue(oglas);
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    await closeListing(10, 1);
    expect(oglas.update).toHaveBeenCalledWith({ status: 'ZATVOREN' });
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await closeListing(999, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada kompanija nema dozvolu', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.Kompanija.findOne.mockResolvedValue({ id: 99 });
    const err = await closeListing(10, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 403 kada kompanija nije pronađena', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.Kompanija.findOne.mockResolvedValue(null);
    const err = await closeListing(10, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije AKTIVAN', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    const err = await closeListing(10, 1).catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── archiveListing ────────────────────────────────────────────────────────────
describe('archiveListing', () => {
  test('uspješno arhivira zatvoren oglas', async () => {
    const oglas = makeOglas({ status: 'ZATVOREN' });
    db.Oglas.findByPk.mockResolvedValue(oglas);
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    await archiveListing(10, 1);
    expect(oglas.update).toHaveBeenCalledWith({ status: 'ARHIVIRAN' });
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await archiveListing(999, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada kompanija nema dozvolu', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    db.Kompanija.findOne.mockResolvedValue({ id: 99 });
    const err = await archiveListing(10, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije ZATVOREN', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'AKTIVAN' }));
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    const err = await archiveListing(10, 1).catch(e => e);
    expect(err.status).toBe(400);
  });
});

// ── restoreFromArchive ────────────────────────────────────────────────────────
describe('restoreFromArchive', () => {
  test('uspješno vraća arhivirani oglas na ZATVOREN', async () => {
    const oglas = makeOglas({ status: 'ARHIVIRAN' });
    db.Oglas.findByPk.mockResolvedValue(oglas);
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    await restoreFromArchive(10, 1);
    expect(oglas.update).toHaveBeenCalledWith({ status: 'ZATVOREN' });
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await restoreFromArchive(999, 1).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada kompanija nema dozvolu', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ARHIVIRAN' }));
    db.Kompanija.findOne.mockResolvedValue({ id: 99 });
    const err = await restoreFromArchive(10, 1).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 kada oglas nije ARHIVIRAN', async () => {
    db.Oglas.findByPk.mockResolvedValue(makeOglas({ status: 'ZATVOREN' }));
    db.Kompanija.findOne.mockResolvedValue(makeKompanija());
    const err = await restoreFromArchive(10, 1).catch(e => e);
    expect(err.status).toBe(400);
  });
});
