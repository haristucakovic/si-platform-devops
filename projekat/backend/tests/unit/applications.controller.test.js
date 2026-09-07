'use strict';

jest.mock('../../src/business/services/applications.service');

const applicationsService = require('../../src/business/services/applications.service');
const {
  createApplication, getMyApplications, getApplicationStatistics,
  getCompanyApplicationsForListing, shortlistApplication,
  approveApplicationByCompany, rejectApplicationByCompany,
  acceptApplicationByStudent, declineApplicationByStudent, withdrawApplication,
} = require('../../src/business/controllers/applications.controller');

function makeReq(overrides = {}) {
  return { user: { id: 1 }, body: {}, params: {}, query: {}, ...overrides };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

// ── createApplication ─────────────────────────────────────────────────────────
describe('createApplication', () => {
  test('201 — uspješno kreira prijavu', async () => {
    const req = makeReq({ body: { oglasID: 10 } });
    const res = makeRes();
    applicationsService.createApplication.mockResolvedValue({ id: 1 });

    await createApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ application: { id: 1 } }));
  });

  test('403 — servis baci status grešku', async () => {
    const req = makeReq({ body: { oglasID: 10 } });
    const res = makeRes();
    const err = new Error('Limit'); err.status = 403;
    applicationsService.createApplication.mockRejectedValue(err);

    await createApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ body: { oglasID: 10 } });
    const res = makeRes();
    applicationsService.createApplication.mockRejectedValue(new Error('DB'));

    await createApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getMyApplications ─────────────────────────────────────────────────────────
describe('getMyApplications', () => {
  test('200 — vraća listu prijava', async () => {
    const req = makeReq();
    const res = makeRes();
    applicationsService.getMyApplications.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    await getMyApplications(req, res);

    expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq();
    const res = makeRes();
    applicationsService.getMyApplications.mockRejectedValue(new Error('fail'));

    await getMyApplications(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getApplicationStatistics ──────────────────────────────────────────────────
describe('getApplicationStatistics', () => {
  test('200 — vraća statistiku', async () => {
    const req = makeReq({ query: { fakultetID: '1' } });
    const res = makeRes();
    const stats = { summary: { totalApplications: 5 } };
    applicationsService.getApplicationStatistics.mockResolvedValue(stats);

    await getApplicationStatistics(req, res);

    expect(res.json).toHaveBeenCalledWith(stats);
    expect(applicationsService.getApplicationStatistics).toHaveBeenCalledWith(1, expect.objectContaining({ fakultetID: '1' }));
  });

  test('500 — servis baci grešku', async () => {
    const req = makeReq({ query: {} });
    const res = makeRes();
    applicationsService.getApplicationStatistics.mockRejectedValue(new Error('fail'));

    await getApplicationStatistics(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getCompanyApplicationsForListing ─────────────────────────────────────────
describe('getCompanyApplicationsForListing', () => {
  test('200 — vraća prijave za oglas', async () => {
    const req = makeReq({ params: { oglasId: '10' } });
    const res = makeRes();
    const data = { oglas: { id: 10 }, applications: [] };
    applicationsService.getCompanyApplicationsForListing.mockResolvedValue(data);

    await getCompanyApplicationsForListing(req, res);

    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('404 — servis baci 404', async () => {
    const req = makeReq({ params: { oglasId: '999' } });
    const res = makeRes();
    const err = new Error('Not found'); err.status = 404;
    applicationsService.getCompanyApplicationsForListing.mockRejectedValue(err);

    await getCompanyApplicationsForListing(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── shortlistApplication ──────────────────────────────────────────────────────
describe('shortlistApplication', () => {
  test('200 — uspješno shortlistuje kandidata', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    applicationsService.shortlistApplication.mockResolvedValue({ id: 100 });

    await shortlistApplication(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ application: { id: 100 } }));
  });

  test('400 — servis baci 400', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    const err = new Error('Cannot'); err.status = 400;
    applicationsService.shortlistApplication.mockRejectedValue(err);

    await shortlistApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── approveApplicationByCompany ───────────────────────────────────────────────
describe('approveApplicationByCompany', () => {
  test('200 — uspješno odobrava', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    applicationsService.approveApplicationByCompany.mockResolvedValue({ id: 100 });

    await approveApplicationByCompany(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ application: { id: 100 } }));
  });

  test('400 — servis baci 400', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    const err = new Error('Cannot'); err.status = 400;
    applicationsService.approveApplicationByCompany.mockRejectedValue(err);

    await approveApplicationByCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

// ── rejectApplicationByCompany ────────────────────────────────────────────────
describe('rejectApplicationByCompany', () => {
  test('200 — uspješno odbija', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    applicationsService.rejectApplicationByCompany.mockResolvedValue({ id: 100 });

    await rejectApplicationByCompany(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ application: { id: 100 } }));
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ params: { id: '100' } });
    const res = makeRes();
    applicationsService.rejectApplicationByCompany.mockRejectedValue(new Error('DB'));

    await rejectApplicationByCompany(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── acceptApplicationByStudent ────────────────────────────────────────────────
describe('acceptApplicationByStudent', () => {
  test('200 — vraća sve podatke o prihvaćenoj prijavi (s praksom)', async () => {
    const req = makeReq({ params: { id: '200' } });
    const res = makeRes();
    const mockApp = {
      id: 200, status: 'APPROVED', koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO', studentStatus: 'PRIHVACENO', studentOdlucioAt: new Date(),
    };
    applicationsService.acceptApplicationByStudent.mockResolvedValue({
      message: 'Prijava prihvaćena.',
      application: mockApp,
      practice: { id: 1 },
    });

    await acceptApplicationByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Prijava prihvaćena.',
      application: mockApp,
      practice: { id: 1 },
    }));
  });

  test('200 — vraća podatke bez prakse (practice = null)', async () => {
    const req = makeReq({ params: { id: '200' } });
    const res = makeRes();
    const mockApp = {
      id: 200, status: 'SHORTLISTED', koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO', studentStatus: 'PRIHVACENO', studentOdlucioAt: new Date(),
    };
    applicationsService.acceptApplicationByStudent.mockResolvedValue({
      message: 'Prihvaćeno.',
      application: mockApp,
    });

    await acceptApplicationByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ practice: null }));
  });

  test('400 — servis baci 400 grešku', async () => {
    const req = makeReq({ params: { id: '200' } });
    const res = makeRes();
    const err = new Error('Nije moguće prihvatiti.'); err.status = 400;
    applicationsService.acceptApplicationByStudent.mockRejectedValue(err);

    await acceptApplicationByStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ params: { id: '200' } });
    const res = makeRes();
    applicationsService.acceptApplicationByStudent.mockRejectedValue(new Error('DB'));

    await acceptApplicationByStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── declineApplicationByStudent ───────────────────────────────────────────────
describe('declineApplicationByStudent', () => {
  test('200 — vraća podatke o odbijеnoj prijavi', async () => {
    const req = makeReq({ params: { id: '300' } });
    const res = makeRes();
    const mockApp = {
      id: 300, status: 'WITHDRAWN', koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO', studentStatus: 'ODBIJENO', studentOdlucioAt: new Date(),
    };
    applicationsService.declineApplicationByStudent.mockResolvedValue({
      message: 'Prijava odbijena.',
      application: mockApp,
    });

    await declineApplicationByStudent(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Prijava odbijena.',
      practice: null,
    }));
  });

  test('403 — servis baci 403 grešku', async () => {
    const req = makeReq({ params: { id: '300' } });
    const res = makeRes();
    const err = new Error('Nema pravo.'); err.status = 403;
    applicationsService.declineApplicationByStudent.mockRejectedValue(err);

    await declineApplicationByStudent(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── withdrawApplication ───────────────────────────────────────────────────────
describe('withdrawApplication', () => {
  test('200 — vraća poruku o povlačenju prijave', async () => {
    const req = makeReq({ params: { id: '400' } });
    const res = makeRes();
    const mockApp = { id: 400, status: 'WITHDRAWN' };
    applicationsService.withdrawApplication.mockResolvedValue({
      message: 'Prijava povučena.',
      application: mockApp,
    });

    await withdrawApplication(req, res);

    expect(res.json).toHaveBeenCalledWith({
      message: 'Prijava povučena.',
      application: mockApp,
    });
  });

  test('400 — servis baci 400 grešku', async () => {
    const req = makeReq({ params: { id: '400' } });
    const res = makeRes();
    const err = new Error('Nije moguće povući.'); err.status = 400;
    applicationsService.withdrawApplication.mockRejectedValue(err);

    await withdrawApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('500 — servis baci neočekivanu grešku', async () => {
    const req = makeReq({ params: { id: '400' } });
    const res = makeRes();
    applicationsService.withdrawApplication.mockRejectedValue(new Error('DB'));

    await withdrawApplication(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
