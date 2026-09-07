'use strict';

const { backfillApplicationStatuses } = require('../../src/business/services/applicationStatus.service');

describe('backfillApplicationStatuses', () => {
  function makeMockPrijava() {
    return { update: jest.fn().mockResolvedValue([0]) };
  }

  test('poziva četiri PrijavaNaPraksu.update poziva za migraciju statusa', async () => {
    const mockPrijava = makeMockPrijava();
    await backfillApplicationStatuses(mockPrijava);
    expect(mockPrijava.update).toHaveBeenCalledTimes(4);
  });

  test('prvi update migrira PODNESENA → CEKA_KOORDINATORA', async () => {
    const mockPrijava = makeMockPrijava();
    await backfillApplicationStatuses(mockPrijava);
    const firstCall = mockPrijava.update.mock.calls[0];
    expect(firstCall[0]).toMatchObject({ status: 'CEKA_KOORDINATORA' });
    expect(firstCall[1].where).toMatchObject({ status: 'PODNESENA' });
  });

  test('drugi update migrira ODOBRENA (stara) → CEKA_KOMPANIJU', async () => {
    const mockPrijava = makeMockPrijava();
    await backfillApplicationStatuses(mockPrijava);
    const secondCall = mockPrijava.update.mock.calls[1];
    expect(secondCall[0]).toMatchObject({ status: 'CEKA_KOMPANIJU' });
  });

  test('treći update migrira U_RAZMATRANJU za koordinatorStatus i kompanijaStatus', async () => {
    const mockPrijava = makeMockPrijava();
    await backfillApplicationStatuses(mockPrijava);
    const thirdCall = mockPrijava.update.mock.calls[2];
    expect(thirdCall[0]).toMatchObject({ koordinatorStatus: 'ODOBRENO', kompanijaStatus: 'U_RAZMATRANJU' });
  });
});
