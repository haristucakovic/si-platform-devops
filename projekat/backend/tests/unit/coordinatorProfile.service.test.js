'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Koordinator: {
    findOne: jest.fn(),
    findOrCreate: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
  },
  Fakultet: {
    findAll: jest.fn(),
  },
}));

const db = require('../../src/infrastructure/database/models');
const { resolveCoordinatorProfile } = require('../../src/business/services/coordinatorProfile.service');

beforeEach(() => jest.clearAllMocks());

// ── resolveCoordinatorProfile ─────────────────────────────────────────────────
describe('resolveCoordinatorProfile', () => {
  test('vraća postojeći koordinator profil ako postoji', async () => {
    const existingProfile = { id: 1, userID: 5, fakultetID: 2, odsjekID: null };
    db.Koordinator.findOne.mockResolvedValue(existingProfile);

    const result = await resolveCoordinatorProfile(5);

    expect(db.Koordinator.findOne).toHaveBeenCalledWith({
      where: { userID: 5 },
      attributes: ['id', 'userID', 'fakultetID', 'odsjekID'],
    });
    expect(result).toBe(existingProfile);
    expect(db.User.findOne).not.toHaveBeenCalled();
  });

  test('vraća null kada user nije pronađen u bazi', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue(null);

    const result = await resolveCoordinatorProfile(99);

    expect(result).toBeNull();
    expect(db.Fakultet.findAll).not.toHaveBeenCalled();
  });

  test('vraća null kada user nema institution', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 5, institution: null });

    const result = await resolveCoordinatorProfile(5);

    expect(result).toBeNull();
    expect(db.Fakultet.findAll).not.toHaveBeenCalled();
  });

  test('vraća null kada fakultet s datim nazivom ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 5, institution: 'Nepostojeci Fakultet' });
    db.Fakultet.findAll.mockResolvedValue([{ id: 1, naziv: 'ETF Sarajevo' }]);

    const result = await resolveCoordinatorProfile(5);

    expect(result).toBeNull();
    expect(db.Koordinator.findOrCreate).not.toHaveBeenCalled();
  });

  test('kreira novi profil kada fakultet postoji (tačno podudaranje)', async () => {
    const newProfile = { id: 2, userID: 5, fakultetID: 3 };
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 5, institution: 'Elektrotehnicki Fakultet Sarajevo' });
    db.Fakultet.findAll.mockResolvedValue([
      { id: 3, naziv: 'Elektrotehnicki Fakultet Sarajevo' },
      { id: 4, naziv: 'Fakultet Informacijskih Tehnologija' },
    ]);
    db.Koordinator.findOrCreate.mockResolvedValue([newProfile, true]);

    const result = await resolveCoordinatorProfile(5);

    expect(db.Koordinator.findOrCreate).toHaveBeenCalledWith({
      where: { userID: 5 },
      defaults: { userID: 5, fakultetID: 3, odsjekID: null },
    });
    expect(result).toBe(newProfile);
  });

  test('mapira legacky alias "etf" na ETF Sarajevo', async () => {
    const newProfile = { id: 10, userID: 7, fakultetID: 1 };
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 7, institution: 'ETF' });
    db.Fakultet.findAll.mockResolvedValue([
      { id: 1, naziv: 'Elektrotehnicki Fakultet Sarajevo' },
    ]);
    db.Koordinator.findOrCreate.mockResolvedValue([newProfile, true]);

    const result = await resolveCoordinatorProfile(7);

    expect(result).toBe(newProfile);
  });

  test('mapira legacky alias "fit" na FIT', async () => {
    const newProfile = { id: 11, userID: 8, fakultetID: 2 };
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 8, institution: 'FIT' });
    db.Fakultet.findAll.mockResolvedValue([
      { id: 2, naziv: 'Fakultet Informacijskih Tehnologija' },
    ]);
    db.Koordinator.findOrCreate.mockResolvedValue([newProfile, true]);

    const result = await resolveCoordinatorProfile(8);

    expect(result).toBe(newProfile);
  });

  test('normalizuje dijakritike i razmake u nazivu institucije', async () => {
    const newProfile = { id: 12, userID: 9, fakultetID: 5 };
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 9, institution: 'Filozofski  Fakultet' });
    db.Fakultet.findAll.mockResolvedValue([
      { id: 5, naziv: 'Filozofski Fakultet' },
    ]);
    db.Koordinator.findOrCreate.mockResolvedValue([newProfile, true]);

    const result = await resolveCoordinatorProfile(9);

    expect(result).toBe(newProfile);
  });

  test('vraća postojeći profil (findOrCreate vraća created=false)', async () => {
    const existingProfile = { id: 3, userID: 10, fakultetID: 1 };
    db.Koordinator.findOne.mockResolvedValue(null);
    db.User.findOne.mockResolvedValue({ id: 10, institution: 'Filozofski Fakultet' });
    db.Fakultet.findAll.mockResolvedValue([{ id: 1, naziv: 'Filozofski Fakultet' }]);
    db.Koordinator.findOrCreate.mockResolvedValue([existingProfile, false]);

    const result = await resolveCoordinatorProfile(10);

    expect(result).toBe(existingProfile);
  });
});
