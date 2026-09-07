'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  sequelize: {
    transaction: jest.fn(async (callback) => callback({ LOCK: { UPDATE: 'UPDATE' } })),
  },
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Oglas: { findByPk: jest.fn() },
  PrijavaNaPraksu: { findByPk: jest.fn() },
  Praksa: { findOne: jest.fn() },
  Kompanija: {},
  Koordinator: { findByPk: jest.fn() },
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotificationForKompanija: jest.fn().mockResolvedValue(undefined),
  createNotificationForKoordinator: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendOdustajanjeKompaniji: jest.fn().mockResolvedValue(undefined),
  sendOdustajanjeKoordinatoru: jest.fn().mockResolvedValue(undefined),
}));

const db = require('../../src/infrastructure/database/models');
const notifications = require('../../src/business/services/notifications.service');
const emailService = require('../../src/business/services/email.service');
const { withdrawApplication } = require('../../src/business/services/applications.service');

function makeStudentUser(overrides = {}) {
  return { id: 1, ime: 'Amina', prezime: 'Begic', role: 'STUDENT', ...overrides };
}

function makePrijava(overrides = {}) {
  const prijava = {
    id: 100,
    studentID: 20,
    oglasID: 10,
    status: 'CEKA_KOORDINATORA',
    koordinatorID: null,
    ...overrides,
  };
  prijava.update = jest.fn(async (data) => Object.assign(prijava, data));
  return prijava;
}

beforeEach(() => jest.clearAllMocks());

describe('withdrawApplication', () => {
  test('baca 403 kada korisnik nije student', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });

    await expect(withdrawApplication(2, 100))
      .rejects.toMatchObject({ message: 'Samo studenti mogu odustati od prijave.', status: 403 });
  });

  test('baca 403 kada student profil ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue(null);

    await expect(withdrawApplication(1, 100))
      .rejects.toMatchObject({ message: 'Nemate pravo upravljati ovom prijavom.', status: 403 });
  });

  test('baca 404 kada prijava ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    await expect(withdrawApplication(1, 100))
      .rejects.toMatchObject({ message: 'Prijava nije pronađena.', status: 404 });
  });

  test('baca 403 kada prijava pripada drugom studentu', async () => {
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava({ studentID: 99 }));

    await expect(withdrawApplication(1, 100))
      .rejects.toMatchObject({ message: 'Nemate pravo upravljati ovom prijavom.', status: 403 });
  });

  test('vraća poruku kada je student već odustao', async () => {
    const prijava = makePrijava({ status: 'ODUSTAO' });
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await withdrawApplication(1, 100);

    expect(result.message).toMatch(/Već ste odustali/);
    expect(prijava.update).not.toHaveBeenCalled();
  });

  test('baca 400 kada status prijave nije withdrawable', async () => {
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava({ status: 'ODBIJENA_KOMPANIJA' }));

    await expect(withdrawApplication(1, 100))
      .rejects.toMatchObject({ message: 'Nije moguće odustati od ove prijave.', status: 400 });
  });

  test('baca 400 kada je odobrena praksa već završena', async () => {
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makePrijava({ status: 'ODOBRENA' }));
    db.Praksa.findOne.mockResolvedValue({ datumKraja: new Date('2020-01-01T00:00:00.000Z') });

    await expect(withdrawApplication(1, 100))
      .rejects.toMatchObject({ message: 'Nije moguće odustati od prakse koja je već završena.', status: 400 });
  });

  test('uspješno odustaje od prijave i pokreće obavijesti', async () => {
    const prijava = makePrijava({ status: 'CEKA_KOMPANIJU', koordinatorID: 3 });
    db.User.findByPk.mockResolvedValue(makeStudentUser());
    db.Student.findOne.mockResolvedValue({ id: 20, userID: 1 });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);
    db.Oglas.findByPk.mockResolvedValue({
      id: 10,
      naziv: 'Backend praksa',
      Kompanija: { id: 5, naziv: 'Firma', User: { email: 'company@test.com' } },
    });
    db.Koordinator.findByPk.mockResolvedValue({ User: { email: 'coord@test.com' } });

    const result = await withdrawApplication(1, 100);

    expect(result.message).toMatch(/Uspješno ste odustali/);
    expect(prijava.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODUSTAO' }),
      expect.any(Object)
    );
    expect(notifications.createNotificationForKompanija).toHaveBeenCalled();
    expect(emailService.sendOdustajanjeKompaniji).toHaveBeenCalledWith(
      'company@test.com',
      'Amina Begic',
      'Backend praksa'
    );
    expect(notifications.createNotificationForKoordinator).toHaveBeenCalled();
    expect(emailService.sendOdustajanjeKoordinatoru).toHaveBeenCalled();
  });
});
