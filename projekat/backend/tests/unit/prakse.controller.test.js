'use strict';

jest.mock('../../src/business/services/prakse.service');

const prakseService = require('../../src/business/services/prakse.service');
const {
  getMine,
  getCompany,
  getCoordinator,
  generateContract,
  createActivity,
  getActivities,
  getAttendance,
  upsertAttendance,
  generateReport,
  getReport,
} = require('../../src/business/controllers/prakse.controller');

function makeReq(overrides = {}) {
  return {
    user: { id: 1, role: 'STUDENT' },
    params: { id: '7' },
    query: {},
    body: {},
    ...overrides,
  };
}

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

beforeEach(() => jest.clearAllMocks());

// ── getMine ───────────────────────────────────────────────────────────────────
describe('getMine', () => {
  test('200 - vraća prakse studenta', async () => {
    const data = [{ id: 1 }];
    prakseService.getStudentPractices.mockResolvedValue(data);
    const res = makeRes();

    await getMine(makeReq({ query: { filter: 'active' } }), res);

    expect(prakseService.getStudentPractices).toHaveBeenCalledWith(1, 'active');
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('prosljeđuje grešku s statusom', async () => {
    const err = Object.assign(new Error('KOORDINATOR_NOT_FOUND'), {});
    err.message = 'KOORDINATOR_NOT_FOUND';
    prakseService.getStudentPractices.mockRejectedValue(err);
    const res = makeRes();

    await getMine(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Koordinatorski profil nije pronađen.' });
  });

  test('500 - vraća grešku bez statusa', async () => {
    prakseService.getStudentPractices.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();

    await getMine(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Došlo je do greške na serveru.', detail: 'DB pad' })
    );
  });

  test('prosljeđuje grešku s custom statusom', async () => {
    const err = Object.assign(new Error('Praksa nije pronađena.'), { status: 404 });
    prakseService.getStudentPractices.mockRejectedValue(err);
    const res = makeRes();

    await getMine(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Praksa nije pronađena.', detail: 'Praksa nije pronađena.' });
  });
});

// ── getCompany ────────────────────────────────────────────────────────────────
describe('getCompany', () => {
  test('200 - vraća prakse kompanije', async () => {
    const data = [{ id: 2 }];
    prakseService.getCompanyPractices.mockResolvedValue(data);
    const res = makeRes();

    await getCompany(makeReq({ user: { id: 3, role: 'COMPANY' }, query: {} }), res);

    expect(prakseService.getCompanyPractices).toHaveBeenCalledWith(3, undefined);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('500 - greška servisa', async () => {
    prakseService.getCompanyPractices.mockRejectedValue(new Error('Greška'));
    const res = makeRes();

    await getCompany(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getCoordinator ────────────────────────────────────────────────────────────
describe('getCoordinator', () => {
  test('200 - vraća prakse koordinatora', async () => {
    const data = [{ id: 3 }];
    prakseService.getCoordinatorPractices.mockResolvedValue(data);
    const res = makeRes();

    await getCoordinator(makeReq({ user: { id: 5, role: 'KOORDINATOR' }, query: {} }), res);

    expect(prakseService.getCoordinatorPractices).toHaveBeenCalledWith(5, undefined);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('404 - KOORDINATOR_NOT_FOUND greška', async () => {
    const err = new Error('KOORDINATOR_NOT_FOUND');
    prakseService.getCoordinatorPractices.mockRejectedValue(err);
    const res = makeRes();

    await getCoordinator(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Koordinatorski profil nije pronađen.' });
  });
});

// ── generateContract ──────────────────────────────────────────────────────────
describe('generateContract', () => {
  test('201 - vraća novogenerisani ugovor', async () => {
    const result = { created: true, ugovor: { id: 1 }, sadrzaj: 'UGOVOR' };
    const res = makeRes();
    prakseService.getPracticeContract.mockResolvedValue(result);

    await generateContract(makeReq(), res);

    expect(prakseService.getPracticeContract).toHaveBeenCalledWith(1, 'STUDENT', '7');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  test('200 - vraća ranije generisani ugovor', async () => {
    const result = { created: false, ugovor: { id: 1 }, sadrzaj: 'UGOVOR' };
    const res = makeRes();
    prakseService.getPracticeContract.mockResolvedValue(result);

    await generateContract(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });

  test('404 - prosljeđuje grešku kada praksa nije dostupna', async () => {
    const error = new Error('Praksa nije pronađena.');
    error.status = 404;
    const res = makeRes();
    prakseService.getPracticeContract.mockRejectedValue(error);

    await generateContract(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Praksa nije pronađena.',
      detail: 'Praksa nije pronađena.',
    });
  });
});

// ── createActivity ────────────────────────────────────────────────────────────
describe('createActivity', () => {
  test('201 - kreira aktivnost i vraća je', async () => {
    const mockAktivnost = { id: 1, opis: 'Kodiranje' };
    prakseService.createActivity.mockResolvedValue(mockAktivnost);
    const res = makeRes();
    const req = makeReq({ body: { opis: 'Kodiranje' } });

    await createActivity(req, res);

    expect(prakseService.createActivity).toHaveBeenCalledWith(1, '7', 'Kodiranje');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockAktivnost);
  });

  test('404 - praksa nije pronađena', async () => {
    const err = Object.assign(new Error('Praksa nije pronađena.'), { status: 404 });
    prakseService.createActivity.mockRejectedValue(err);
    const res = makeRes();

    await createActivity(makeReq({ body: { opis: 'Test' } }), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - neočekivana greška', async () => {
    prakseService.createActivity.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();

    await createActivity(makeReq({ body: { opis: 'Test' } }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getActivities ─────────────────────────────────────────────────────────────
describe('getActivities', () => {
  test('200 - vraća aktivnosti prakse', async () => {
    const data = [{ id: 1, opis: 'Kodiranje' }];
    prakseService.getPracticeActivities.mockResolvedValue(data);
    const res = makeRes();

    await getActivities(makeReq(), res);

    expect(prakseService.getPracticeActivities).toHaveBeenCalledWith(1, 'STUDENT', '7');
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('403 - neovlašteni pristup', async () => {
    const err = Object.assign(new Error('Neovlašten.'), { status: 403 });
    prakseService.getPracticeActivities.mockRejectedValue(err);
    const res = makeRes();

    await getActivities(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── getAttendance ─────────────────────────────────────────────────────────────
describe('getAttendance', () => {
  test('200 - vraća prisustva prakse', async () => {
    const data = [{ id: 1, datum: '2026-01-01' }];
    prakseService.getPracticeAttendance.mockResolvedValue(data);
    const res = makeRes();

    await getAttendance(makeReq(), res);

    expect(prakseService.getPracticeAttendance).toHaveBeenCalledWith(1, 'STUDENT', '7');
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('404 - praksa nije pronađena', async () => {
    const err = Object.assign(new Error('Praksa nije pronađena.'), { status: 404 });
    prakseService.getPracticeAttendance.mockRejectedValue(err);
    const res = makeRes();

    await getAttendance(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });
});

// ── upsertAttendance ──────────────────────────────────────────────────────────
describe('upsertAttendance', () => {
  test('201 - kreira novo prisustvo', async () => {
    const mockPrisustvo = { id: 1, datum: '2026-01-01' };
    prakseService.upsertPracticeAttendance.mockResolvedValue({ created: true, prisustvo: mockPrisustvo });
    const res = makeRes();
    const req = makeReq({ body: { datum: '2026-01-01', prisutan: true } });

    await upsertAttendance(req, res);

    expect(prakseService.upsertPracticeAttendance).toHaveBeenCalledWith(1, '7', { datum: '2026-01-01', prisutan: true });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPrisustvo);
  });

  test('200 - ažurira postojeće prisustvo', async () => {
    const mockPrisustvo = { id: 1, datum: '2026-01-01' };
    prakseService.upsertPracticeAttendance.mockResolvedValue({ created: false, prisustvo: mockPrisustvo });
    const res = makeRes();

    await upsertAttendance(makeReq({ body: { datum: '2026-01-01' } }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockPrisustvo);
  });

  test('500 - greška servisa', async () => {
    prakseService.upsertPracticeAttendance.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();

    await upsertAttendance(makeReq({ body: {} }), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── generateReport ────────────────────────────────────────────────────────────
describe('generateReport', () => {
  test('201 - kreira novi izvještaj', async () => {
    const mockResult = { created: true, izvjestaj: { id: 1 } };
    prakseService.generatePracticeReport.mockResolvedValue(mockResult);
    const res = makeRes();
    const req = makeReq({ body: { sadrzaj: 'Izvještaj o radu' } });

    await generateReport(req, res);

    expect(prakseService.generatePracticeReport).toHaveBeenCalledWith(1, '7', { sadrzaj: 'Izvještaj o radu' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  test('200 - ažurira postojeći izvještaj', async () => {
    const mockResult = { created: false, izvjestaj: { id: 1 } };
    prakseService.generatePracticeReport.mockResolvedValue(mockResult);
    const res = makeRes();

    await generateReport(makeReq({ body: {} }), res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('400 - validacijska greška', async () => {
    const err = Object.assign(new Error('Sadržaj je obavezan.'), { status: 400 });
    prakseService.generatePracticeReport.mockRejectedValue(err);
    const res = makeRes();

    await generateReport(makeReq({ body: {} }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sadržaj je obavezan.', detail: 'Sadržaj je obavezan.' });
  });
});

// ── getReport ─────────────────────────────────────────────────────────────────
describe('getReport', () => {
  test('200 - vraća izvještaj prakse', async () => {
    const mockResult = { id: 1, sadrzaj: 'Izvještaj' };
    prakseService.getPracticeReport.mockResolvedValue(mockResult);
    const res = makeRes();

    await getReport(makeReq(), res);

    expect(prakseService.getPracticeReport).toHaveBeenCalledWith(1, 'STUDENT', '7');
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  test('404 - izvještaj nije pronađen', async () => {
    const err = Object.assign(new Error('Izvještaj nije pronađen.'), { status: 404 });
    prakseService.getPracticeReport.mockRejectedValue(err);
    const res = makeRes();

    await getReport(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('500 - neočekivana greška', async () => {
    prakseService.getPracticeReport.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();

    await getReport(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Došlo je do greške na serveru.' })
    );
  });
});
