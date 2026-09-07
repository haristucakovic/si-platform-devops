'use strict';

jest.mock('../../src/business/services/evaluation.service');

const evaluationService = require('../../src/business/services/evaluation.service');
const {
  getCompanyPendingEvaluations,
  postStudentEvaluation,
  getCompanySubmittedEvaluations,
  getStudentPendingEvaluations,
  postCompanyEvaluation,
  getStudentSubmittedEvaluations,
  getStudentReceivedEvaluations,
  getCompanyReceivedEvaluations,
} = require('../../src/business/controllers/evaluation.controller');

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides = {}) {
  return {
    user: { id: 1, role: 'COMPANY' },
    params: {},
    body: {},
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── getCompanyPendingEvaluations ──────────────────────────────────────────────
describe('getCompanyPendingEvaluations', () => {
  test('200 - vraća listu čekajućih evaluacija', async () => {
    const data = [{ id: 1, studentIme: 'Haris' }];
    evaluationService.getPendingStudentEvaluations.mockResolvedValue(data);
    const res = makeRes();

    await getCompanyPendingEvaluations(makeReq(), res);

    expect(evaluationService.getPendingStudentEvaluations).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('403 - prosljeđuje grešku servisa', async () => {
    const err = Object.assign(new Error('Kompanija nije pronađena.'), { status: 403 });
    evaluationService.getPendingStudentEvaluations.mockRejectedValue(err);
    const res = makeRes();

    await getCompanyPendingEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Kompanija nije pronađena.' });
  });

  test('500 - vraća 500 za neočekivanu grešku', async () => {
    evaluationService.getPendingStudentEvaluations.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();

    await getCompanyPendingEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB pad' });
  });
});

// ── postStudentEvaluation ─────────────────────────────────────────────────────
describe('postStudentEvaluation', () => {
  const validBody = {
    tehnickeVjestine: 4, komunikacija: 4, radnaEtika: 5,
    inicijativa: 3, timskiRad: 4, ukupnaOcjena: 4,
  };

  test('201 - uspješno kreira evaluaciju studenta', async () => {
    evaluationService.submitStudentEvaluation.mockResolvedValue({ id: 1 });
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '10' }, body: validBody });

    await postStudentEvaluation(req, res);

    expect(evaluationService.submitStudentEvaluation).toHaveBeenCalledWith(1, 10, validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Evaluacija studenta je uspješno poslana.' })
    );
  });

  test('400 - nevažeći applicationId (0)', async () => {
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '0' }, body: validBody });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Nevažeći ID prijave.' });
    expect(evaluationService.submitStudentEvaluation).not.toHaveBeenCalled();
  });

  test('400 - nevažeći applicationId (string)', async () => {
    const res = makeRes();
    const req = makeReq({ params: { applicationId: 'abc' }, body: validBody });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(evaluationService.submitStudentEvaluation).not.toHaveBeenCalled();
  });

  test('400 - ocjena van opsega (6)', async () => {
    const res = makeRes();
    const req = makeReq({
      params: { applicationId: '10' },
      body: { ...validBody, tehnickeVjestine: 6 },
    });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sve ocjene moraju biti između 1 i 5.' });
  });

  test('400 - ocjena ispod 1', async () => {
    const res = makeRes();
    const req = makeReq({
      params: { applicationId: '10' },
      body: { ...validBody, ukupnaOcjena: 0 },
    });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('400 - nedostaje ocjena', async () => {
    const res = makeRes();
    const req = makeReq({
      params: { applicationId: '10' },
      body: { tehnickeVjestine: 4 },
    });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('409 - prosljeđuje 409 grešku servisa', async () => {
    const err = Object.assign(new Error('Evaluacija već poslana.'), { status: 409 });
    evaluationService.submitStudentEvaluation.mockRejectedValue(err);
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '10' }, body: validBody });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: 'Evaluacija već poslana.' });
  });

  test('500 - vraća 500 za neočekivanu grešku', async () => {
    evaluationService.submitStudentEvaluation.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '10' }, body: validBody });

    await postStudentEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB pad' });
  });
});

// ── getCompanySubmittedEvaluations ────────────────────────────────────────────
describe('getCompanySubmittedEvaluations', () => {
  test('200 - vraća poslane evaluacije kompanije', async () => {
    const data = [{ id: 1 }];
    evaluationService.getSubmittedStudentEvaluations.mockResolvedValue(data);
    const res = makeRes();

    await getCompanySubmittedEvaluations(makeReq(), res);

    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('500 - greška servisa', async () => {
    evaluationService.getSubmittedStudentEvaluations.mockRejectedValue(new Error('Greška'));
    const res = makeRes();

    await getCompanySubmittedEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getStudentPendingEvaluations ──────────────────────────────────────────────
describe('getStudentPendingEvaluations', () => {
  test('200 - vraća čekajuće evaluacije studenta', async () => {
    const data = [{ id: 1, kompanijaNaziv: 'TechCorp' }];
    evaluationService.getPendingCompanyEvaluations.mockResolvedValue(data);
    const res = makeRes();
    const req = makeReq({ user: { id: 2, role: 'STUDENT' } });

    await getStudentPendingEvaluations(req, res);

    expect(evaluationService.getPendingCompanyEvaluations).toHaveBeenCalledWith(2);
    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('403 - prosljeđuje grešku servisa', async () => {
    const err = Object.assign(new Error('Student ne postoji.'), { status: 403 });
    evaluationService.getPendingCompanyEvaluations.mockRejectedValue(err);
    const res = makeRes();

    await getStudentPendingEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── postCompanyEvaluation ─────────────────────────────────────────────────────
describe('postCompanyEvaluation', () => {
  const validBody = {
    organizacija: 4, mentorstvo: 5, radnoOkruzenje: 4,
    relevantnoPosla: 3, preporukaKompanija: 5, ukupnaOcjena: 4,
  };

  test('201 - uspješno kreira evaluaciju kompanije', async () => {
    evaluationService.submitCompanyEvaluation.mockResolvedValue({ id: 1 });
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '5' }, body: validBody, user: { id: 2, role: 'STUDENT' } });

    await postCompanyEvaluation(req, res);

    expect(evaluationService.submitCompanyEvaluation).toHaveBeenCalledWith(2, 5, validBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Evaluacija kompanije je uspješno poslana.' })
    );
  });

  test('400 - nevažeći applicationId', async () => {
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '0' }, body: validBody });

    await postCompanyEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(evaluationService.submitCompanyEvaluation).not.toHaveBeenCalled();
  });

  test('400 - ocjena van opsega', async () => {
    const res = makeRes();
    const req = makeReq({
      params: { applicationId: '5' },
      body: { ...validBody, preporukaKompanija: 6 },
    });

    await postCompanyEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Sve ocjene moraju biti između 1 i 5.' });
  });

  test('409 - duplikat evaluacije', async () => {
    const err = Object.assign(new Error('Evaluacija već poslana.'), { status: 409 });
    evaluationService.submitCompanyEvaluation.mockRejectedValue(err);
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '5' }, body: validBody });

    await postCompanyEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  test('500 - neočekivana greška', async () => {
    evaluationService.submitCompanyEvaluation.mockRejectedValue(new Error('DB pad'));
    const res = makeRes();
    const req = makeReq({ params: { applicationId: '5' }, body: validBody });

    await postCompanyEvaluation(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'DB pad' });
  });
});

// ── getStudentSubmittedEvaluations ────────────────────────────────────────────
describe('getStudentSubmittedEvaluations', () => {
  test('200 - vraća evaluacije koje je student poslao', async () => {
    const data = [{ id: 1 }];
    evaluationService.getStudentSubmittedCompanyEvaluations.mockResolvedValue(data);
    const res = makeRes();

    await getStudentSubmittedEvaluations(makeReq(), res);

    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('500 - greška servisa', async () => {
    evaluationService.getStudentSubmittedCompanyEvaluations.mockRejectedValue(new Error('Greška'));
    const res = makeRes();

    await getStudentSubmittedEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ── getStudentReceivedEvaluations ─────────────────────────────────────────────
describe('getStudentReceivedEvaluations', () => {
  test('200 - vraća evaluacije primljene od kompanija', async () => {
    const data = [{ id: 1, ukupnaOcjena: 4 }];
    evaluationService.getStudentReceivedEvaluations.mockResolvedValue(data);
    const res = makeRes();

    await getStudentReceivedEvaluations(makeReq(), res);

    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('403 - prosljeđuje grešku', async () => {
    const err = Object.assign(new Error('Student ne postoji.'), { status: 403 });
    evaluationService.getStudentReceivedEvaluations.mockRejectedValue(err);
    const res = makeRes();

    await getStudentReceivedEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
  });
});

// ── getCompanyReceivedEvaluations ─────────────────────────────────────────────
describe('getCompanyReceivedEvaluations', () => {
  test('200 - vraća evaluacije primljene od studenata', async () => {
    const data = [{ id: 1, ukupnaOcjena: 5 }];
    evaluationService.getCompanyReceivedEvaluations.mockResolvedValue(data);
    const res = makeRes();

    await getCompanyReceivedEvaluations(makeReq(), res);

    expect(res.json).toHaveBeenCalledWith(data);
  });

  test('403 - prosljeđuje grešku', async () => {
    const err = Object.assign(new Error('Kompanija nije pronađena.'), { status: 403 });
    evaluationService.getCompanyReceivedEvaluations.mockRejectedValue(err);
    const res = makeRes();

    await getCompanyReceivedEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Kompanija nije pronađena.' });
  });

  test('500 - neočekivana greška', async () => {
    const err = new Error('DB pad');
    evaluationService.getCompanyReceivedEvaluations.mockRejectedValue(err);
    const res = makeRes();

    await getCompanyReceivedEvaluations(makeReq(), res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
