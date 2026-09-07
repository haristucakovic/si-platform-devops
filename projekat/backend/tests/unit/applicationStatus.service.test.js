'use strict';

const { Op } = require('sequelize');
const {
  normalizeStatusFilter,
  isCoordinatorPending,
  canCompanyAct,
  canCompanyShortlist,
  APPLICATION_STATUS,
  COORDINATOR_STATUS,
  COMPANY_STATUS,
} = require('../../src/business/services/applicationStatus.service');

// ── normalizeStatusFilter ─────────────────────────────────────────────────────
describe('normalizeStatusFilter', () => {
  // Testira: null/undefined ulaz vraća null (bez filtriranja)
  test('vraća null za null ulaz', () => {
    expect(normalizeStatusFilter(null)).toBeNull();
    expect(normalizeStatusFilter(undefined)).toBeNull();
    expect(normalizeStatusFilter('')).toBeNull();
  });

  // Testira: legacy PODNESENA se normalizuje u CEKA_KOORDINATORA
  test('PODNESENA se normalizuje u CEKA_KOORDINATORA', () => {
    expect(normalizeStatusFilter('PODNESENA')).toBe('CEKA_KOORDINATORA');
  });

  // Testira: legacy ODBIJENA se normalizuje u Op.in s oba nova statusa odbijanja
  test('ODBIJENA se normalizuje u Op.in s oba statusa odbijanja', () => {
    const result = normalizeStatusFilter('ODBIJENA');
    expect(result).toHaveProperty([Op.in]);
    expect(result[Op.in]).toContain('ODBIJENA_KOORDINATOR');
    expect(result[Op.in]).toContain('ODBIJENA_KOMPANIJA');
  });

  // Testira: novi statusi se vraćaju nepromijenjeni
  test.each([
    'CEKA_KOORDINATORA',
    'CEKA_KOMPANIJU',
    'U_RAZMATRANJU',
    'ODOBRENA',
    'ODBIJENA_KOORDINATOR',
    'ODBIJENA_KOMPANIJA',
    'ODUSTAO',
  ])('novi status %s vraća se nepromjenjen', (status) => {
    expect(normalizeStatusFilter(status)).toBe(status);
  });
});

// ── isCoordinatorPending ──────────────────────────────────────────────────────
describe('isCoordinatorPending', () => {
  // Testira: PODNESENA (legacy) je pending status za koordinatora
  test('PODNESENA (legacy) je pending status', () => {
    expect(isCoordinatorPending({ status: 'PODNESENA' })).toBe(true);
  });

  // Testira: CEKA_KOORDINATORA je pending status za koordinatora
  test('CEKA_KOORDINATORA je pending status', () => {
    expect(isCoordinatorPending({ status: 'CEKA_KOORDINATORA' })).toBe(true);
  });

  // Testira: ODOBRENA, CEKA_KOMPANIJU, U_RAZMATRANJU nisu pending statusi
  test.each([
    'ODOBRENA',
    'CEKA_KOMPANIJU',
    'U_RAZMATRANJU',
    'ODBIJENA_KOORDINATOR',
    'ODBIJENA_KOMPANIJA',
    'ODUSTAO',
  ])('%s nije pending status', (status) => {
    expect(isCoordinatorPending({ status })).toBe(false);
  });

  // Testira: null/undefined prijava vraća false
  test('null/undefined prijava vraća false', () => {
    expect(isCoordinatorPending(null)).toBe(false);
    expect(isCoordinatorPending(undefined)).toBe(false);
    expect(isCoordinatorPending({})).toBe(false);
  });
});

// ── canCompanyAct ─────────────────────────────────────────────────────────────
describe('canCompanyAct', () => {
  // Testira: koordinator odobrio + CEKA_KOMPANIJU → kompanija može djelovati
  test('koordinatorStatus=ODOBRENO i status=CEKA_KOMPANIJU → true', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.WAITING_COMPANY,
    };
    expect(canCompanyAct(prijava)).toBe(true);
  });

  // Testira: koordinator odobrio + U_RAZMATRANJU → kompanija može djelovati
  test('koordinatorStatus=ODOBRENO i status=U_RAZMATRANJU → true', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.SHORTLISTED,
    };
    expect(canCompanyAct(prijava)).toBe(true);
  });

  // Testira: koordinator nije odobrio → kompanija ne može djelovati
  test('koordinatorStatus=NA_CEKANJU → false', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.PENDING,
      status: APPLICATION_STATUS.WAITING_COMPANY,
    };
    expect(canCompanyAct(prijava)).toBe(false);
  });

  // Testira: status ODOBRENA → kompanija ne može djelovati (finalni status)
  test('status=ODOBRENA → false', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.APPROVED,
    };
    expect(canCompanyAct(prijava)).toBe(false);
  });
});

// ── canCompanyShortlist ───────────────────────────────────────────────────────
describe('canCompanyShortlist', () => {
  // Testira: sve tri potrebne pretpostavke ispunjene → može uvrstiti u uži krug
  test('koordinator odobrio + CEKA_KOMPANIJU + kompanija NA_CEKANJU → true', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.WAITING_COMPANY,
      kompanijaStatus: COMPANY_STATUS.PENDING,
    };
    expect(canCompanyShortlist(prijava)).toBe(true);
  });

  // Testira: prijava već u U_RAZMATRANJU → ne može uvrstiti ponovo
  test('status=U_RAZMATRANJU → false (već uvršten)', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.SHORTLISTED,
      kompanijaStatus: COMPANY_STATUS.SHORTLISTED,
    };
    expect(canCompanyShortlist(prijava)).toBe(false);
  });

  // Testira: koordinator nije odobrio → ne može uvrstiti
  test('koordinatorStatus nije ODOBRENO → false', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.PENDING,
      status: APPLICATION_STATUS.WAITING_COMPANY,
      kompanijaStatus: COMPANY_STATUS.PENDING,
    };
    expect(canCompanyShortlist(prijava)).toBe(false);
  });

  // Testira: kompanija nije NA_CEKANJU → ne može uvrstiti
  test('kompanijaStatus nije NA_CEKANJU → false', () => {
    const prijava = {
      koordinatorStatus: COORDINATOR_STATUS.APPROVED,
      status: APPLICATION_STATUS.WAITING_COMPANY,
      kompanijaStatus: COMPANY_STATUS.SHORTLISTED,
    };
    expect(canCompanyShortlist(prijava)).toBe(false);
  });
});
