'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  sequelize: {
    transaction: jest.fn(async (callback) => callback({ LOCK: { UPDATE: 'UPDATE' } })),
  },
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Oglas: { findByPk: jest.fn(), findAll: jest.fn() },
  PrijavaNaPraksu: { findByPk: jest.fn() },
  Praksa: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Dokument: {},
  Odsjek: {},
  Fakultet: {},
}));

jest.mock('../../src/business/services/application_limit.service', () => ({
  checkStudentApplicationLimit: jest.fn(),
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendPrijavaPodnesenaEmail: jest.fn(),
  sendPrijavaShortlistedEmail: jest.fn(),
  sendPrijavaStatusEmail: jest.fn(),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn(),
  canSendInApp: jest.fn().mockReturnValue(false),
  canSendEmail: jest.fn().mockReturnValue(false),
}));

jest.mock('../../src/business/services/prakse.service', () => ({
  calculatePracticeDates: jest.fn(),
  ensurePracticeForApplication: jest.fn(),
  getStudentPracticeById: jest.fn(),
}));

const db = require('../../src/infrastructure/database/models');
const prakseService = require('../../src/business/services/prakse.service');
const {
  acceptApplicationByStudent,
  declineApplicationByStudent,
} = require('../../src/business/services/applications.service');

function makeApplication(overrides = {}) {
  const application = {
    id: 100,
    studentID: 20,
    oglasID: 10,
    status: 'ODOBRENA',
    koordinatorStatus: 'ODOBRENO',
    kompanijaStatus: 'ODOBRENO',
    studentStatus: 'NA_CEKANJU',
    studentOdlucioAt: null,
    ...overrides,
  };
  application.get = jest.fn(() => ({ ...application }));
  application.update = jest.fn(async (data) => Object.assign(application, data));
  return application;
}

beforeEach(() => {
  jest.clearAllMocks();
  db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
  db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
  db.Oglas.findByPk.mockResolvedValue({
    id: 10,
    status: 'ARHIVIRAN',
    datumPocetka: '2026-06-01',
    trajanje: 1,
  });
  db.Praksa.findOne.mockResolvedValue({ id: 80, prijavaID: 100 });
  prakseService.ensurePracticeForApplication.mockResolvedValue({ id: 80, prijavaID: 100 });
  prakseService.getStudentPracticeById.mockResolvedValue({ id: 80, prijavaID: 100 });
});

// ── acceptApplicationByStudent ────────────────────────────────────────────────
describe('acceptApplicationByStudent', () => {
  // Testira: zatvoren/arhiviran oglas ne blokira odluku za odobrenu prijavu
  // Ulaz: potpuno odobrena prijava u NA_CEKANJU i oglas statusa ARHIVIRAN
  // Očekivani izlaz: student prihvaćen, praksa osigurana, approval statusi se ne mijenjaju
  test('prihvata odobrenu prijavu i kada je oglas arhiviran', async () => {
    const application = makeApplication();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(application);

    const result = await acceptApplicationByStudent(1, 100);

    expect(prakseService.calculatePracticeDates).toHaveBeenCalledWith('2026-06-01', 1);
    expect(prakseService.ensurePracticeForApplication).toHaveBeenCalled();
    expect(application.update).toHaveBeenCalledWith(
      {
        studentStatus: 'PRIHVACENO',
        studentOdlucioAt: expect.any(Date),
      },
      expect.any(Object)
    );
    expect(application.update.mock.calls[0][0]).not.toHaveProperty('status');
    expect(application.status).toBe('ODOBRENA');
    expect(result.practice).toEqual({ id: 80, prijavaID: 100 });
  });

  test('ponovljeni accept koristi postojeću praksu bez promjene timestamp-a', async () => {
    const decidedAt = new Date('2026-05-26T08:00:00.000Z');
    const application = makeApplication({
      studentStatus: 'PRIHVACENO',
      studentOdlucioAt: decidedAt,
    });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(application);

    const result = await acceptApplicationByStudent(1, 100);

    expect(application.update).not.toHaveBeenCalled();
    expect(prakseService.ensurePracticeForApplication).toHaveBeenCalled();
    expect(application.studentOdlucioAt).toBe(decidedAt);
    expect(result.message).toBe('Učešće na praksi je već prihvaćeno.');
  });
});

// ── declineApplicationByStudent ───────────────────────────────────────────────
describe('declineApplicationByStudent', () => {
  test('odbija odobrenu prijavu na zatvorenom oglasu bez kreiranja prakse', async () => {
    const application = makeApplication();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(application);
    db.Oglas.findByPk.mockResolvedValue({ id: 10, status: 'ZATVOREN' });

    const result = await declineApplicationByStudent(1, 100);

    expect(application.update).toHaveBeenCalledWith(
      {
        studentStatus: 'ODBIJENO',
        studentOdlucioAt: expect.any(Date),
      },
      expect.any(Object)
    );
    expect(prakseService.ensurePracticeForApplication).not.toHaveBeenCalled();
    expect(result.message).toBe('Učešće na praksi je uspješno odbijeno.');
  });

  test('ne dozvoljava promjenu prethodno prihvaćene odluke', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makeApplication({ studentStatus: 'PRIHVACENO' })
    );

    const error = await declineApplicationByStudent(1, 100).catch((err) => err);

    expect(error.status).toBe(409);
    expect(error.message).toBe('Odluka o učešću je već evidentirana i nije je moguće promijeniti.');
  });
});
