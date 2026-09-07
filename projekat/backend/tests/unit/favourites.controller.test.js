'use strict';

jest.mock('../../src/business/services/favourites.service');

const favouritesService = require('../../src/business/services/favourites.service');
const { addFavourite, removeFavourite, getFavourites } = require('../../src/business/controllers/favourites.controller');

function makeReq(overrides = {}) {
  return { user: { id: 5 }, params: {}, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('addFavourite', () => {
  test('201 — uspješno dodaje u omiljene', async () => {
    const req = makeReq({ params: { oglasId: '50' } });
    const res = makeRes();
    favouritesService.addFavourite.mockResolvedValue({});

    await addFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('404 — servis baci grešku s status=404', async () => {
    const req = makeReq({ params: { oglasId: '999' } });
    const res = makeRes();
    const err = new Error('Not found'); err.status = 404;
    favouritesService.addFavourite.mockRejectedValue(err);

    await addFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ params: { oglasId: '50' } });
    const res = makeRes();
    favouritesService.addFavourite.mockRejectedValue(new Error('DB error'));

    await addFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('removeFavourite', () => {
  test('200 — uspješno uklanja iz omiljenih', async () => {
    const req = makeReq({ params: { oglasId: '50' } });
    const res = makeRes();
    favouritesService.removeFavourite.mockResolvedValue(undefined);

    await removeFavourite(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });

  test('404 — servis baci grešku s status=404', async () => {
    const req = makeReq({ params: { oglasId: '50' } });
    const res = makeRes();
    const err = new Error('Not found'); err.status = 404;
    favouritesService.removeFavourite.mockRejectedValue(err);

    await removeFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ params: { oglasId: '50' } });
    const res = makeRes();
    favouritesService.removeFavourite.mockRejectedValue(new Error('DB'));

    await removeFavourite(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('getFavourites', () => {
  test('200 — vraća omiljene oglase', async () => {
    const req = makeReq();
    const res = makeRes();
    favouritesService.getFavourites.mockResolvedValue({ ids: [1, 2], listings: [] });

    await getFavourites(req, res);

    expect(res.json).toHaveBeenCalledWith({ ids: [1, 2], listings: [] });
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    favouritesService.getFavourites.mockRejectedValue(new Error('DB'));

    await getFavourites(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
