'use strict';

jest.mock('../../src/business/services/application_limit.service');

const limitService = require('../../src/business/services/application_limit.service');
const { getLimitController, setLimitController } = require('../../src/business/controllers/application_limit.controller');

function makeReq(overrides = {}) {
  return { user: { id: 1 }, body: {}, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getLimitController', () => {
  test('200 — vraća trenutni limit', async () => {
    const req = makeReq();
    const res = makeRes();
    limitService.getApplicationLimit.mockResolvedValue(5);

    await getLimitController(req, res);

    expect(res.json).toHaveBeenCalledWith({ limit: 5 });
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    limitService.getApplicationLimit.mockRejectedValue(new Error('DB error'));

    await getLimitController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe('setLimitController', () => {
  test('200 — uspješno postavlja limit', async () => {
    const req = makeReq({ body: { limit: 10 } });
    const res = makeRes();
    limitService.setApplicationLimit.mockResolvedValue(10);

    await setLimitController(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ limit: 10 }));
  });

  test('400 — limit je undefined', async () => {
    const req = makeReq({ body: {} });
    const res = makeRes();

    await setLimitController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(limitService.setApplicationLimit).not.toHaveBeenCalled();
  });

  test('400 — limit je null', async () => {
    const req = makeReq({ body: { limit: null } });
    const res = makeRes();

    await setLimitController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 — servis baci 400 za nevalidan limit', async () => {
    const req = makeReq({ body: { limit: 0 } });
    const res = makeRes();
    const err = new Error('Limit mora biti pozitivan'); err.status = 400;
    limitService.setApplicationLimit.mockRejectedValue(err);

    await setLimitController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ body: { limit: 5 } });
    const res = makeRes();
    limitService.setApplicationLimit.mockRejectedValue(new Error('DB'));

    await setLimitController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
