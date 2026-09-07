'use strict';

jest.mock('../../src/business/services/companies.service');

const companiesService = require('../../src/business/services/companies.service');
const { getCompanyProfile } = require('../../src/business/controllers/companies.controller');

function makeReq(overrides = {}) {
  return { user: { id: 1 }, params: { id: '5' }, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

describe('getCompanyProfile', () => {
  test('200 — vraća profil kompanije', async () => {
    const req = makeReq();
    const res = makeRes();
    companiesService.getCompanyProfileForStudent.mockResolvedValue({
      kompanija: { id: 5, naziv: 'Firma' },
      oglasi: [],
    });

    await getCompanyProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({
      kompanija: { id: 5, naziv: 'Firma' },
      oglasi: [],
    });
  });

  test('400 — ID kompanije nije validan broj', async () => {
    const req = makeReq({ params: { id: 'abc' } });
    const res = makeRes();

    await getCompanyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(companiesService.getCompanyProfileForStudent).not.toHaveBeenCalled();
  });

  test('400 — ID kompanije je 0', async () => {
    const req = makeReq({ params: { id: '0' } });
    const res = makeRes();

    await getCompanyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('404 — servis baci grešku s status=404', async () => {
    const req = makeReq();
    const res = makeRes();
    const err = new Error('Not found'); err.status = 404;
    companiesService.getCompanyProfileForStudent.mockRejectedValue(err);

    await getCompanyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    companiesService.getCompanyProfileForStudent.mockRejectedValue(new Error('DB'));

    await getCompanyProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
