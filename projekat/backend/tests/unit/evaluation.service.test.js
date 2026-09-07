'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  EvaluacijaStudenta: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  EvaluacijaKompanije: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  PrijavaNaPraksu: { findAll: jest.fn(), findOne: jest.fn() },
  Praksa: { findAll: jest.fn(), findOne: jest.fn() },
  Student: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Oglas: {},
  User: {},
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendEvaluacijaStudentaEmail: jest.fn().mockResolvedValue(null),
}));

const db = require('../../src/infrastructure/database/models');
const {
  getPendingStudentEvaluations,
  submitStudentEvaluation,
  getSubmittedStudentEvaluations,
  getPendingCompanyEvaluations,
  submitCompanyEvaluation,
  getStudentSubmittedCompanyEvaluations,
  getStudentReceivedEvaluations,
  getCompanyReceivedEvaluations,
} = require('../../src/business/services/evaluation.service');

beforeEach(() => jest.clearAllMocks());

// ── getKompanijaID helper (via getPendingStudentEvaluations) ──────────────────
describe('getKompanijaID helper', () => {
  test('baca 403 kada kompanija nije pronađena', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);

    await expect(getPendingStudentEvaluations(1)).rejects.toMatchObject({
      status: 403,
      message: 'Kompanija nije pronađena za ovog korisnika.',
    });
  });
});

// ── getStudentID helper (via getPendingCompanyEvaluations) ────────────────────
describe('getStudentID helper', () => {
  test('baca 403 kada student nije pronađen', async () => {
    db.Student.findOne.mockResolvedValue(null);

    await expect(getPendingCompanyEvaluations(1)).rejects.toMatchObject({
      status: 403,
      message: 'Student nije pronađen za ovog korisnika.',
    });
  });
});

// ── getPendingStudentEvaluations ──────────────────────────────────────────────
describe('getPendingStudentEvaluations', () => {
  test('vraća [] kada nema završenih praks', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await getPendingStudentEvaluations(1);

    expect(result).toEqual([]);
    expect(db.EvaluacijaStudenta.findAll).not.toHaveBeenCalled();
  });

  test('filtrira prakse koje su već evaluirane', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([
      {
        prijavaID: 10,
        PrijavaNaPraksu: { Student: { User: { ime: 'A', prezime: 'B', email: 'a@b.com' } }, Ogla: { naziv: 'Oglas' } },
      },
      {
        prijavaID: 20,
        PrijavaNaPraksu: { Student: { User: { ime: 'C', prezime: 'D', email: 'c@d.com' } }, Ogla: { naziv: 'Oglas2' } },
      },
    ]);
    db.EvaluacijaStudenta.findAll.mockResolvedValue([{ prijavaID: 10 }]);

    const result = await getPendingStudentEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(20);
  });

  test('vraća sve prakse kada nijedna nije evaluirana', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([
      {
        prijavaID: 10,
        PrijavaNaPraksu: { Student: { User: { ime: 'A', prezime: 'B', email: 'a@b.com' } }, Ogla: null },
      },
    ]);
    db.EvaluacijaStudenta.findAll.mockResolvedValue([]);

    const result = await getPendingStudentEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 10, studentIme: 'A', studentPrezime: 'B', studentEmail: 'a@b.com', oglasNaziv: '' });
  });

  test('koristi prazne stringove za nedostajuće podatke', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([
      { prijavaID: 30, PrijavaNaPraksu: null },
    ]);
    db.EvaluacijaStudenta.findAll.mockResolvedValue([]);

    const result = await getPendingStudentEvaluations(1);

    expect(result[0]).toMatchObject({ studentIme: '', studentPrezime: '', studentEmail: '', oglasNaziv: '' });
  });
});

// ── submitStudentEvaluation ───────────────────────────────────────────────────
describe('submitStudentEvaluation', () => {
  const evalData = {
    tehnickeVjestine: 4, komunikacija: 4, radnaEtika: 5,
    inicijativa: 3, timskiRad: 4, ukupnaOcjena: 4, komentar: 'Dobar student',
  };

  test('baca 400 kada nema završene prakse', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue(null);

    await expect(submitStudentEvaluation(1, 10, evalData)).rejects.toMatchObject({
      status: 400,
      message: 'Evaluacija je moguća samo nakon završetka prakse.',
    });
  });

  test('baca 403 kada prijava ne pripada ovoj kompaniji', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.PrijavaNaPraksu.findOne.mockResolvedValue(null);

    await expect(submitStudentEvaluation(1, 10, evalData)).rejects.toMatchObject({
      status: 403,
    });
  });

  test('baca 409 kada je evaluacija već poslana', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.PrijavaNaPraksu.findOne.mockResolvedValue({ id: 10 });
    db.EvaluacijaStudenta.findOne.mockResolvedValue({ id: 99 });

    await expect(submitStudentEvaluation(1, 10, evalData)).rejects.toMatchObject({
      status: 409,
      message: 'Evaluacija za ovu prijavu je već poslana.',
    });
  });

  test('kreira evaluaciju i vraća je', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.PrijavaNaPraksu.findOne
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({
        Student: { id: 20, User: { email: 'st@test.com', ime: 'Haris', prezime: 'H' } },
        Ogla: { naziv: 'Dev pozicija' },
      });
    db.EvaluacijaStudenta.findOne.mockResolvedValue(null);
    const mockEval = { id: 1, ...evalData };
    db.EvaluacijaStudenta.create.mockResolvedValue(mockEval);

    const result = await submitStudentEvaluation(1, 10, evalData);

    expect(db.EvaluacijaStudenta.create).toHaveBeenCalledWith(
      expect.objectContaining({ prijavaID: 10, ukupnaOcjena: 4 })
    );
    expect(result).toBe(mockEval);
  });

  test('kreira evaluaciju čak i ako notifikacija baci grešku', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.PrijavaNaPraksu.findOne
      .mockResolvedValueOnce({ id: 10 })
      .mockRejectedValueOnce(new Error('Greška notifikacije'));
    db.EvaluacijaStudenta.findOne.mockResolvedValue(null);
    const mockEval = { id: 1 };
    db.EvaluacijaStudenta.create.mockResolvedValue(mockEval);

    const result = await submitStudentEvaluation(1, 10, evalData);

    expect(result).toBe(mockEval);
  });

  test('kreira evaluaciju bez komentara (null)', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.PrijavaNaPraksu.findOne.mockResolvedValue({ id: 10 });
    db.EvaluacijaStudenta.findOne.mockResolvedValue(null);
    db.EvaluacijaStudenta.create.mockResolvedValue({ id: 2 });

    await submitStudentEvaluation(1, 10, { ...evalData, komentar: undefined });

    expect(db.EvaluacijaStudenta.create).toHaveBeenCalledWith(
      expect.objectContaining({ komentar: null })
    );
  });
});

// ── getSubmittedStudentEvaluations ────────────────────────────────────────────
describe('getSubmittedStudentEvaluations', () => {
  test('vraća mapirane evaluacije kompanije', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaStudenta.findAll.mockResolvedValue([
      {
        id: 1,
        prijavaID: 10,
        tehnickeVjestine: 4,
        komunikacija: 3,
        radnaEtika: 5,
        inicijativa: 4,
        timskiRad: 4,
        ukupnaOcjena: 4,
        komentar: 'Odlično',
        datumEvaluacije: new Date('2026-01-01'),
        PrijavaNaPraksu: {
          Student: { User: { ime: 'Haris', prezime: 'H' } },
          Ogla: { naziv: 'Dev' },
        },
      },
    ]);

    const result = await getSubmittedStudentEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 1,
      prijavaID: 10,
      studentIme: 'Haris',
      studentPrezime: 'H',
      ukupnaOcjena: 4,
    });
  });

  test('vraća prazan niz kada nema evaluacija', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaStudenta.findAll.mockResolvedValue([]);

    const result = await getSubmittedStudentEvaluations(1);

    expect(result).toEqual([]);
  });

  test('koristi prazne stringove za nedostajuće podatke', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaStudenta.findAll.mockResolvedValue([
      { id: 1, prijavaID: 10, PrijavaNaPraksu: null },
    ]);

    const result = await getSubmittedStudentEvaluations(1);

    expect(result[0]).toMatchObject({ studentIme: '', studentPrezime: '', oglasNaziv: '' });
  });
});

// ── getPendingCompanyEvaluations ──────────────────────────────────────────────
describe('getPendingCompanyEvaluations', () => {
  test('vraća [] kada nema završenih praks', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await getPendingCompanyEvaluations(1);

    expect(result).toEqual([]);
    expect(db.EvaluacijaKompanije.findAll).not.toHaveBeenCalled();
  });

  test('filtrira već evaluirane kompanije', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findAll.mockResolvedValue([
      { prijavaID: 5, PrijavaNaPraksu: { Ogla: { naziv: 'Dev', Kompanija: { naziv: 'Firma A' } } } },
      { prijavaID: 6, PrijavaNaPraksu: { Ogla: { naziv: 'Design', Kompanija: { naziv: 'Firma B' } } } },
    ]);
    db.EvaluacijaKompanije.findAll.mockResolvedValue([{ prijavaID: 5 }]);

    const result = await getPendingCompanyEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(6);
  });

  test('mapira podatke ispravno', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findAll.mockResolvedValue([
      { prijavaID: 5, PrijavaNaPraksu: { Ogla: { naziv: 'Backend', Kompanija: { naziv: 'TechCorp' } } } },
    ]);
    db.EvaluacijaKompanije.findAll.mockResolvedValue([]);

    const result = await getPendingCompanyEvaluations(1);

    expect(result[0]).toMatchObject({ id: 5, oglasNaziv: 'Backend', kompanijaNaziv: 'TechCorp' });
  });

  test('koristi prazne stringove za null podatke', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findAll.mockResolvedValue([
      { prijavaID: 5, PrijavaNaPraksu: null },
    ]);
    db.EvaluacijaKompanije.findAll.mockResolvedValue([]);

    const result = await getPendingCompanyEvaluations(1);

    expect(result[0]).toMatchObject({ kompanijaNaziv: '', oglasNaziv: '' });
  });
});

// ── submitCompanyEvaluation ───────────────────────────────────────────────────
describe('submitCompanyEvaluation', () => {
  const evalData = {
    organizacija: 4, mentorstvo: 5, radnoOkruzenje: 4,
    relevantnoPosla: 3, preporukaKompanija: 5, ukupnaOcjena: 4, komentar: 'Odlična firma',
  };

  test('baca 400 kada nema završene prakse', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findOne.mockResolvedValue(null);

    await expect(submitCompanyEvaluation(1, 5, evalData)).rejects.toMatchObject({
      status: 400,
      message: 'Evaluacija je moguća samo nakon završetka prakse.',
    });
  });

  test('baca 409 kada je evaluacija već poslana', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.EvaluacijaKompanije.findOne.mockResolvedValue({ id: 77 });

    await expect(submitCompanyEvaluation(1, 5, evalData)).rejects.toMatchObject({
      status: 409,
      message: 'Evaluacija za ovu prijavu je već poslana.',
    });
  });

  test('kreira i vraća evaluaciju kompanije', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.EvaluacijaKompanije.findOne.mockResolvedValue(null);
    const mockEval = { id: 1, ...evalData };
    db.EvaluacijaKompanije.create.mockResolvedValue(mockEval);

    const result = await submitCompanyEvaluation(1, 5, evalData);

    expect(db.EvaluacijaKompanije.create).toHaveBeenCalledWith(
      expect.objectContaining({ prijavaID: 5, ukupnaOcjena: 4 })
    );
    expect(result).toBe(mockEval);
  });

  test('kreira evaluaciju bez komentara', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Praksa.findOne.mockResolvedValue({ id: 1 });
    db.EvaluacijaKompanije.findOne.mockResolvedValue(null);
    db.EvaluacijaKompanije.create.mockResolvedValue({ id: 2 });

    await submitCompanyEvaluation(1, 5, { ...evalData, komentar: undefined });

    expect(db.EvaluacijaKompanije.create).toHaveBeenCalledWith(
      expect.objectContaining({ komentar: null })
    );
  });
});

// ── getStudentSubmittedCompanyEvaluations ─────────────────────────────────────
describe('getStudentSubmittedCompanyEvaluations', () => {
  test('vraća mapirane evaluacije studenta', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([
      {
        id: 1,
        prijavaID: 5,
        organizacija: 4,
        mentorstvo: 5,
        radnoOkruzenje: 4,
        relevantnoPosla: 3,
        preporukaKompanija: 5,
        ukupnaOcjena: 4,
        komentar: 'Dobra',
        datumEvaluacije: new Date('2026-01-01'),
        PrijavaNaPraksu: {
          Ogla: { naziv: 'Backend', Kompanija: { naziv: 'TechCorp' } },
        },
      },
    ]);

    const result = await getStudentSubmittedCompanyEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      applicationId: 5,
      prijavaID: 5,
      kompanijaNaziv: 'TechCorp',
      oglasNaziv: 'Backend',
    });
  });

  test('vraća prazan niz kada nema evaluacija', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([]);

    const result = await getStudentSubmittedCompanyEvaluations(1);

    expect(result).toEqual([]);
  });

  test('koristi prazne stringove za null podatke', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([
      { id: 1, prijavaID: 5, PrijavaNaPraksu: null },
    ]);

    const result = await getStudentSubmittedCompanyEvaluations(1);

    expect(result[0]).toMatchObject({ kompanijaNaziv: '', oglasNaziv: '' });
  });
});

// ── getStudentReceivedEvaluations ─────────────────────────────────────────────
describe('getStudentReceivedEvaluations', () => {
  test('vraća [] kada student nema prijava', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.PrijavaNaPraksu.findAll.mockResolvedValue([]);

    const result = await getStudentReceivedEvaluations(1);

    expect(result).toEqual([]);
    expect(db.EvaluacijaStudenta.findAll).not.toHaveBeenCalled();
  });

  test('vraća mapirane primljene evaluacije', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.PrijavaNaPraksu.findAll.mockResolvedValue([{ id: 5 }, { id: 6 }]);
    db.EvaluacijaStudenta.findAll.mockResolvedValue([
      {
        id: 1,
        prijavaID: 5,
        tehnickeVjestine: 4,
        komunikacija: 3,
        radnaEtika: 5,
        inicijativa: 4,
        timskiRad: 4,
        ukupnaOcjena: 4,
        komentar: 'Dobar',
        datumEvaluacije: new Date('2026-01-01'),
        PrijavaNaPraksu: {
          Ogla: { naziv: 'Frontend', Kompanija: { naziv: 'WebCorp' } },
        },
      },
    ]);

    const result = await getStudentReceivedEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, prijavaID: 5, kompanijaNaziv: 'WebCorp' });
  });

  test('koristi prazne stringove za null podatke', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.PrijavaNaPraksu.findAll.mockResolvedValue([{ id: 5 }]);
    db.EvaluacijaStudenta.findAll.mockResolvedValue([
      { id: 1, prijavaID: 5, PrijavaNaPraksu: null },
    ]);

    const result = await getStudentReceivedEvaluations(1);

    expect(result[0]).toMatchObject({ kompanijaNaziv: '', oglasNaziv: '' });
  });
});

// ── getCompanyReceivedEvaluations ─────────────────────────────────────────────
describe('getCompanyReceivedEvaluations', () => {
  test('vraća mapirane evaluacije primljene od studenata', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([
      {
        id: 1,
        prijavaID: 10,
        organizacija: 4,
        mentorstvo: 5,
        radnoOkruzenje: 4,
        relevantnoPosla: 3,
        preporukaKompanija: 5,
        ukupnaOcjena: 4,
        komentar: 'Odlično',
        datumEvaluacije: new Date('2026-01-01'),
        PrijavaNaPraksu: {
          Student: { User: { ime: 'Haris', prezime: 'H' } },
          Oglas: { naziv: 'Backend' },
        },
      },
    ]);

    const result = await getCompanyReceivedEvaluations(1);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, prijavaID: 10, studentIme: 'Haris', ukupnaOcjena: 4 });
  });

  test('vraća prazan niz kada nema evaluacija', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([]);

    const result = await getCompanyReceivedEvaluations(1);

    expect(result).toEqual([]);
  });

  test('koristi prazne stringove za null podatke', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.EvaluacijaKompanije.findAll.mockResolvedValue([
      { id: 1, prijavaID: 10, PrijavaNaPraksu: null },
    ]);

    const result = await getCompanyReceivedEvaluations(1);

    expect(result[0]).toMatchObject({ studentIme: '', studentPrezime: '', oglasNaziv: '' });
  });
});
