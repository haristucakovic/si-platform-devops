'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  OmiljeniOglas: { findOne: jest.fn(), create: jest.fn(), destroy: jest.fn(), findAll: jest.fn() },
  Student: { findOne: jest.fn() },
  Oglas: { findAll: jest.fn(), findByPk: jest.fn() },
  Kompanija: {},
  User: {},
}));

const db = require('../../src/infrastructure/database/models');
const { addFavourite, removeFavourite, getFavourites } = require('../../src/business/services/favourites.service');

beforeEach(() => jest.clearAllMocks());

function makeStudent() { return { id: 10, userID: 1 }; }
function makeOglas() { return { id: 50, naziv: 'Backend' }; }

// ── addFavourite ──────────────────────────────────────────────────────────────
describe('addFavourite', () => {
  test('uspješno dodaje oglas u omiljene', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    db.OmiljeniOglas.findOne.mockResolvedValue(null);
    db.OmiljeniOglas.create.mockResolvedValue({ studentID: 10, oglasID: 50 });

    const result = await addFavourite(1, 50);

    expect(db.OmiljeniOglas.create).toHaveBeenCalledWith({ studentID: 10, oglasID: 50 });
    expect(result).toBeDefined();
  });

  test('vraća existing ako oglas već u omiljenim', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.Oglas.findByPk.mockResolvedValue(makeOglas());
    const existing = { studentID: 10, oglasID: 50 };
    db.OmiljeniOglas.findOne.mockResolvedValue(existing);

    const result = await addFavourite(1, 50);

    expect(db.OmiljeniOglas.create).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  test('baca 404 kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const err = await addFavourite(1, 50).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 404 kada oglas ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.Oglas.findByPk.mockResolvedValue(null);
    const err = await addFavourite(1, 999).catch(e => e);
    expect(err.status).toBe(404);
  });
});

// ── removeFavourite ───────────────────────────────────────────────────────────
describe('removeFavourite', () => {
  test('uspješno uklanja oglas iz omiljenih', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.OmiljeniOglas.destroy.mockResolvedValue(1);

    await removeFavourite(1, 50);

    expect(db.OmiljeniOglas.destroy).toHaveBeenCalledWith({ where: { studentID: 10, oglasID: 50 } });
  });

  test('baca 404 kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const err = await removeFavourite(1, 50).catch(e => e);
    expect(err.status).toBe(404);
  });
});

// ── getFavourites ─────────────────────────────────────────────────────────────
describe('getFavourites', () => {
  test('vraća prazne liste kada student nema omiljenih', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.OmiljeniOglas.findAll.mockResolvedValue([]);

    const result = await getFavourites(1);

    expect(result).toEqual({ ids: [], listings: [] });
    expect(db.Oglas.findAll).not.toHaveBeenCalled();
  });

  test('vraća ids i listings kada postoje omiljeni', async () => {
    db.Student.findOne.mockResolvedValue(makeStudent());
    db.OmiljeniOglas.findAll.mockResolvedValue([{ oglasID: 50 }, { oglasID: 51 }]);
    db.Oglas.findAll.mockResolvedValue([makeOglas(), { id: 51, naziv: 'Frontend' }]);

    const result = await getFavourites(1);

    expect(result.ids).toEqual([50, 51]);
    expect(result.listings).toHaveLength(2);
  });

  test('baca 404 kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const err = await getFavourites(1).catch(e => e);
    expect(err.status).toBe(404);
  });
});
