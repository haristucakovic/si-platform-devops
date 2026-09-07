'use strict';

jest.mock('../../src/business/services/listings.service');

const listingsService = require('../../src/business/services/listings.service');
const {
  createListing, getCompanyListings, getActiveListings, updateListing,
  getClosedListings, getClosedListingsByCompany, closeListing, archiveListing, restoreFromArchive,
} = require('../../src/business/controllers/listings.controller');

function makeReq(overrides = {}) {
  return { user: { id: 1, role: 'COMPANY' }, body: {}, params: {}, query: {}, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

// ── createListing ─────────────────────────────────────────────────────────────
describe('createListing', () => {
  test('201 — uspješno kreira oglas', async () => {
    const req = makeReq({ body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();
    const mockOglas = { id: 1, naziv: 'X', status: 'AKTIVAN' };
    listingsService.createListing.mockResolvedValue(mockOglas);

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ oglas: mockOglas }));
  });

  test('400 — nedostaje naziv', async () => {
    const req = makeReq({ body: { opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(listingsService.createListing).not.toHaveBeenCalled();
  });

  test('400 — brojMjesta je 0', async () => {
    const req = makeReq({ body: { naziv: 'X', opis: 'Y', brojMjesta: 0, rokPrijave: '2099-01-01' } });
    const res = makeRes();

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 — rokPrijave u prošlosti', async () => {
    const req = makeReq({ body: { naziv: 'X', opis: 'Y', brojMjesta: 1, rokPrijave: '2000-01-01' } });
    const res = makeRes();

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();
    listingsService.createListing.mockRejectedValue(new Error('DB error'));

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('403 — servis baci status grešku', async () => {
    const req = makeReq({ body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();
    const err = new Error('Nije odobren'); err.status = 403;
    listingsService.createListing.mockRejectedValue(err);

    await createListing(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── getCompanyListings ────────────────────────────────────────────────────────
describe('getCompanyListings', () => {
  test('200 — vraća oglase', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getListingsByCompany.mockResolvedValue([{ id: 1 }]);

    await getCompanyListings(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getListingsByCompany.mockRejectedValue(new Error('fail'));

    await getCompanyListings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getActiveListings ─────────────────────────────────────────────────────────
describe('getActiveListings', () => {
  test('200 — vraća aktivne oglase', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getActiveListings.mockResolvedValue([{ id: 2 }]);

    await getActiveListings(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getActiveListings.mockRejectedValue(new Error('fail'));

    await getActiveListings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── updateListing ─────────────────────────────────────────────────────────────
describe('updateListing', () => {
  test('200 — uspješno ažurira oglas', async () => {
    const req = makeReq({ params: { id: '10' }, body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();
    listingsService.updateListing.mockResolvedValue({ id: 10, naziv: 'X' });

    await updateListing(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ oglas: { id: 10, naziv: 'X' } }));
  });

  test('400 — nedostaje naziv', async () => {
    const req = makeReq({ params: { id: '10' }, body: { opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();

    await updateListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(listingsService.updateListing).not.toHaveBeenCalled();
  });

  test('400 — rokPrijave u prošlosti', async () => {
    const req = makeReq({ params: { id: '10' }, body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2000-01-01' } });
    const res = makeRes();

    await updateListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 — servis baci 404', async () => {
    const req = makeReq({ params: { id: '999' }, body: { naziv: 'X', opis: 'Y', brojMjesta: 2, rokPrijave: '2099-01-01' } });
    const res = makeRes();
    const err = new Error('Not found'); err.status = 404;
    listingsService.updateListing.mockRejectedValue(err);

    await updateListing(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── getClosedListings ─────────────────────────────────────────────────────────
describe('getClosedListings', () => {
  test('200 — vraća zatvorene oglase', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getClosedListings.mockResolvedValue([]);

    await getClosedListings(req, res);

    expect(res.json).toHaveBeenCalledWith([]);
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getClosedListings.mockRejectedValue(new Error('fail'));

    await getClosedListings(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getClosedListingsByCompany ────────────────────────────────────────────────
describe('getClosedListingsByCompany', () => {
  test('200 — vraća zatvorene oglase kompanije', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getClosedListingsByCompany.mockResolvedValue([{ id: 3 }]);

    await getClosedListingsByCompany(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 3 }]);
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    listingsService.getClosedListingsByCompany.mockRejectedValue(new Error('fail'));

    await getClosedListingsByCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── closeListing ──────────────────────────────────────────────────────────────
describe('closeListing', () => {
  test('200 — uspješno zatvara oglas', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    listingsService.closeListing.mockResolvedValue({ id: 10, status: 'ZATVOREN' });

    await closeListing(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ oglas: { id: 10, status: 'ZATVOREN' } }));
  });

  test('servis baci status grešku', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    const err = new Error('403'); err.status = 403;
    listingsService.closeListing.mockRejectedValue(err);

    await closeListing(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── archiveListing ────────────────────────────────────────────────────────────
describe('archiveListing', () => {
  test('200 — uspješno arhivira oglas', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    listingsService.archiveListing.mockResolvedValue({ id: 10, status: 'ARHIVIRAN' });

    await archiveListing(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ oglas: { id: 10, status: 'ARHIVIRAN' } }));
  });

  test('servis baci status grešku', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    const err = new Error('400'); err.status = 400;
    listingsService.archiveListing.mockRejectedValue(err);

    await archiveListing(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── restoreFromArchive ────────────────────────────────────────────────────────
describe('restoreFromArchive', () => {
  test('200 — uspješno vraća iz arhive', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    listingsService.restoreFromArchive.mockResolvedValue({ id: 10, status: 'ZATVOREN' });

    await restoreFromArchive(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ oglas: { id: 10, status: 'ZATVOREN' } }));
  });

  test('servis baci status grešku', async () => {
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();
    const err = new Error('400'); err.status = 400;
    listingsService.restoreFromArchive.mockRejectedValue(err);

    await restoreFromArchive(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
