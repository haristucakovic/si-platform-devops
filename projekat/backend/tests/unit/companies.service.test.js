'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Kompanija: { findByPk: jest.fn() },
  User: {},
  Oglas: { findAll: jest.fn() },
}));

const db = require('../../src/infrastructure/database/models');
const { getCompanyProfileForStudent } = require('../../src/business/services/companies.service');

beforeEach(() => jest.clearAllMocks());

function makeKompanija(overrides = {}) {
  return {
    id: 5,
    naziv: 'Test Firma',
    opisPoslovanja: 'Opis',
    adresa: 'Adresa 1',
    djelatnost: 'IT',
    kontaktOsoba: 'Marko',
    User: { approvalStatus: 'APPROVED', status: 'ACTIVE' },
    ...overrides,
  };
}

describe('getCompanyProfileForStudent', () => {
  test('vraća profil aktivne i odobrene kompanije', async () => {
    db.Kompanija.findByPk.mockResolvedValue(makeKompanija());
    db.Oglas.findAll.mockResolvedValue([{ id: 1, naziv: 'Oglas 1' }]);

    const result = await getCompanyProfileForStudent(5);

    expect(result.kompanija).toMatchObject({ id: 5, naziv: 'Test Firma' });
    expect(Array.isArray(result.oglasi)).toBe(true);
  });

  test('baca 404 kada kompanija ne postoji', async () => {
    db.Kompanija.findByPk.mockResolvedValue(null);
    const err = await getCompanyProfileForStudent(999).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 kada kompanija nema User zapisa', async () => {
    db.Kompanija.findByPk.mockResolvedValue(makeKompanija({ User: null }));
    const err = await getCompanyProfileForStudent(5).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 403 kada approvalStatus nije APPROVED', async () => {
    db.Kompanija.findByPk.mockResolvedValue(makeKompanija({ User: { approvalStatus: 'PENDING', status: 'ACTIVE' } }));
    const err = await getCompanyProfileForStudent(5).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 403 kada status nije ACTIVE', async () => {
    db.Kompanija.findByPk.mockResolvedValue(makeKompanija({ User: { approvalStatus: 'APPROVED', status: 'DEACTIVATED' } }));
    const err = await getCompanyProfileForStudent(5).catch(e => e);
    expect(err.status).toBe(403);
  });
});
