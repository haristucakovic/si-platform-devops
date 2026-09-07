'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  SystemSetting: { findOne: jest.fn(), findOrCreate: jest.fn() },
  Student: { findOne: jest.fn() },
  PrijavaNaPraksu: { count: jest.fn() },
}));

jest.mock('../../src/business/services/applicationStatus.service', () => ({
  ACTIVE_APPLICATION_STATUSES: ['CEKA_KOORDINATORA', 'CEKA_KOMPANIJU', 'U_RAZMATRANJU'],
}));

const db = require('../../src/infrastructure/database/models');
const {
  getApplicationLimit,
  setApplicationLimit,
  checkStudentApplicationLimit,
} = require('../../src/business/services/application_limit.service');

beforeEach(() => jest.clearAllMocks());

// ── getApplicationLimit ───────────────────────────────────────────────────────
describe('getApplicationLimit', () => {
  test('vraća DEFAULT_LIMIT=5 kada nema SystemSetting zapisa', async () => {
    db.SystemSetting.findOne.mockResolvedValue(null);
    const result = await getApplicationLimit();
    expect(result).toBe(5);
  });

  test('vraća parsiran limit iz baze', async () => {
    db.SystemSetting.findOne.mockResolvedValue({ value: '3' });
    const result = await getApplicationLimit();
    expect(result).toBe(3);
  });

  test('vraća DEFAULT kada je value NaN', async () => {
    db.SystemSetting.findOne.mockResolvedValue({ value: 'xyz' });
    const result = await getApplicationLimit();
    expect(result).toBe(5);
  });

  test('vraća DEFAULT kada je value 0 ili negativan', async () => {
    db.SystemSetting.findOne.mockResolvedValue({ value: '0' });
    const result = await getApplicationLimit();
    expect(result).toBe(5);
  });

  test('vraća DEFAULT kada DB baci grešku', async () => {
    db.SystemSetting.findOne.mockRejectedValue(new Error('DB error'));
    const result = await getApplicationLimit();
    expect(result).toBe(5);
  });
});

// ── setApplicationLimit ───────────────────────────────────────────────────────
describe('setApplicationLimit', () => {
  test('baca 400 za nenavedenu vrijednost (NaN)', async () => {
    const err = await setApplicationLimit('abc').catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 za 0', async () => {
    const err = await setApplicationLimit(0).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 za negativan broj', async () => {
    const err = await setApplicationLimit(-5).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('kreira novi setting i vraća parsed limit', async () => {
    const mockSetting = { value: '10', save: jest.fn() };
    db.SystemSetting.findOrCreate.mockResolvedValue([mockSetting, true]);
    const result = await setApplicationLimit(10);
    expect(result).toBe(10);
    expect(mockSetting.save).not.toHaveBeenCalled();
  });

  test('ažurira postojeći setting kada je vrijednost drugačija', async () => {
    const mockSetting = { value: '5', save: jest.fn() };
    db.SystemSetting.findOrCreate.mockResolvedValue([mockSetting, false]);
    const result = await setApplicationLimit(10);
    expect(mockSetting.value).toBe('10');
    expect(mockSetting.save).toHaveBeenCalled();
    expect(result).toBe(10);
  });

  test('ne ažurira setting kada je vrijednost ista', async () => {
    const mockSetting = { value: '10', save: jest.fn() };
    db.SystemSetting.findOrCreate.mockResolvedValue([mockSetting, false]);
    await setApplicationLimit(10);
    expect(mockSetting.save).not.toHaveBeenCalled();
  });
});

// ── checkStudentApplicationLimit ──────────────────────────────────────────────
describe('checkStudentApplicationLimit', () => {
  beforeEach(() => {
    db.SystemSetting.findOne.mockResolvedValue({ value: '3' });
  });

  test('dozvoljava kada student ne postoji (allowed=true, current=0)', async () => {
    db.Student.findOne.mockResolvedValue(null);
    const result = await checkStudentApplicationLimit(1);
    expect(result).toEqual({ allowed: true, current: 0, limit: 3 });
    expect(db.PrijavaNaPraksu.count).not.toHaveBeenCalled();
  });

  test('dozvoljava kada je current < limit', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.PrijavaNaPraksu.count.mockResolvedValue(2);
    const result = await checkStudentApplicationLimit(1);
    expect(result.allowed).toBe(true);
    expect(result.current).toBe(2);
    expect(result.limit).toBe(3);
  });

  test('ne dozvoljava kada je current >= limit', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.PrijavaNaPraksu.count.mockResolvedValue(3);
    const result = await checkStudentApplicationLimit(1);
    expect(result.allowed).toBe(false);
    expect(result.current).toBe(3);
  });
});
