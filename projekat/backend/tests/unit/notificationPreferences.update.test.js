'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Student: { findOne: jest.fn() },
  NotificationPreference: { findOrCreate: jest.fn() },
}));

const db = require('../../src/infrastructure/database/models');
const { getOrCreatePreferences, updatePreferences } = require('../../src/business/services/notificationPreferences.service');

beforeEach(() => jest.clearAllMocks());

function makePreferences(overrides = {}) {
  const prefs = {
    student_id: 10,
    prijava_podnesena_in_app: true,
    prijava_podnesena_email: true,
    prijava_odobrena_in_app: true,
    prijava_odobrena_email: true,
    prijava_odbijena_in_app: true,
    prijava_odbijena_email: true,
    ...overrides,
  };
  prefs.update = jest.fn(async (data) => Object.assign(prefs, data));
  return prefs;
}

// ── getOrCreatePreferences ────────────────────────────────────────────────────
describe('getOrCreatePreferences', () => {
  test('vraća null kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const result = await getOrCreatePreferences(1);
    expect(result).toBeNull();
    expect(db.NotificationPreference.findOrCreate).not.toHaveBeenCalled();
  });

  test('vraća ili kreira preference za studenta', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const prefs = makePreferences();
    db.NotificationPreference.findOrCreate.mockResolvedValue([prefs, false]);

    const result = await getOrCreatePreferences(1);

    expect(db.NotificationPreference.findOrCreate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { student_id: 10 } })
    );
    expect(result).toBe(prefs);
  });
});

// ── updatePreferences ─────────────────────────────────────────────────────────
describe('updatePreferences', () => {
  test('vraća null kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const result = await updatePreferences(1, { prijava_podnesena_email: false });
    expect(result).toBeNull();
  });

  test('ažurira boolean polja preference', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const prefs = makePreferences();
    db.NotificationPreference.findOrCreate.mockResolvedValue([prefs, false]);

    const result = await updatePreferences(1, {
      prijava_podnesena_email: false,
      prijava_odobrena_in_app: false,
    });

    expect(prefs.update).toHaveBeenCalledWith(
      expect.objectContaining({ prijava_podnesena_email: false, prijava_odobrena_in_app: false })
    );
    expect(result).toBe(prefs);
  });

  test('ignorira ne-boolean vrijednosti i nepoznata polja', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const prefs = makePreferences();
    db.NotificationPreference.findOrCreate.mockResolvedValue([prefs, false]);

    await updatePreferences(1, {
      prijava_podnesena_email: 'yes',
      unknown_field: true,
    });

    expect(prefs.update).toHaveBeenCalledWith({});
  });
});
