'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findByPk: jest.fn() },
  Student: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Fakultet: {},
  Odsjek: {},
  Oglas: {},
  PrijavaNaPraksu: { findAll: jest.fn(), findOne: jest.fn() },
  Praksa: { findOne: jest.fn(), findAll: jest.fn(), create: jest.fn() },
  Ugovor: { findOne: jest.fn(), create: jest.fn() },
  Prisustvo: { findAll: jest.fn(), findOrCreate: jest.fn() },
  Aktivnost: { create: jest.fn(), findAll: jest.fn() },
  Izvjestaj: { findOne: jest.fn(), findOrCreate: jest.fn() },
  EvaluacijaStudenta: { findOne: jest.fn() },
}));

jest.mock('../../src/business/services/coordinatorProfile.service', () => ({
  resolveCoordinatorProfile: jest.fn(),
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn(),
  createNotificationForKoordinator: jest.fn(),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn(),
  canSendInApp: jest.fn(),
  canSendEmail: jest.fn(),
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendPraksaZavrsenaStudentEmail: jest.fn(),
  sendPraksaZavrsenaCompanyEmail: jest.fn(),
}));

const { resolveCoordinatorProfile } = require('../../src/business/services/coordinatorProfile.service');
const db = require('../../src/infrastructure/database/models');
const notifications = require('../../src/business/services/notifications.service');
const notificationPreferences = require('../../src/business/services/notificationPreferences.service');
const emailService = require('../../src/business/services/email.service');
const {
  calculatePracticeDates,
  practiceLifecycleStatus,
  ensurePracticeForApplication,
  completeExpiredPractices,
  getStudentPractices,
  getCompanyPractices,
  getCoordinatorPractices,
  getCoordinatorPracticeSummary,
  backfillAcceptedPractices,
  getPracticeContract,
  createActivity,
  getPracticeActivities,
  getPracticeAttendance,
  upsertPracticeAttendance,
  generatePracticeReport,
  getPracticeReport,
} = require('../../src/business/services/prakse.service');

beforeEach(() => jest.clearAllMocks());

// ── calculatePracticeDates ────────────────────────────────────────────────────
describe('calculatePracticeDates', () => {
  // Testira: trajanje predstavlja inkluzivni broj kalendarskih mjeseci
  // Ulaz: početak 01.06.2026. i trajanje 1 mjesec
  // Očekivani izlaz: završetak 30.06.2026.
  test('računa inkluzivan kraj kalendarskog mjeseca', () => {
    const result = calculatePracticeDates('2026-06-01', 1);
    expect(result.datumPocetka).toBe('2026-06-01');
    expect(result.datumKraja).toBe('2026-06-30');
  });

  // Testira: helper ne prelazi u naredni mjesec kod kraćeg mjeseca
  // Ulaz: početak 31.01.2026. i trajanje 1 mjesec
  // Očekivani izlaz: završetak posljednji dan februara
  test('sigurno obrađuje kraj kraćeg mjeseca', () => {
    expect(calculatePracticeDates('2026-01-31', 1).datumKraja).toBe('2026-02-28');
  });

  test('baca jasnu grešku za nevažeće trajanje', () => {
    expect(() => calculatePracticeDates('2026-06-01', 0))
      .toThrow('Nije moguće odrediti datum završetka prakse iz unesenog trajanja.');
  });
});

// ── practiceLifecycleStatus ───────────────────────────────────────────────────
describe('practiceLifecycleStatus', () => {
  test('praksa koja počinje ili završava danas je aktivna', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-26', datumKraja: '2026-05-26' },
      '2026-05-26'
    )).toBe('AKTIVNA');
  });

  test('odustajanje ima prednost nad datumskim stanjem', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-01', datumKraja: '2026-06-01', datumOdustajanja: '2026-05-10' },
      '2026-05-26'
    )).toBe('ODUSTAO');
  });

  test('praksa čiji je kraj jučer je završena', () => {
    expect(practiceLifecycleStatus(
      { datumPocetka: '2026-05-01', datumKraja: '2026-05-25' },
      '2026-05-26'
    )).toBe('ZAVRSENA');
  });
});

// ── ensurePracticeForApplication ──────────────────────────────────────────────
describe('ensurePracticeForApplication', () => {
  test('koristi postojeću praksu bez kreiranja duplikata', async () => {
    const existing = { id: 7, prijavaID: 9 };
    db.Praksa.findOne.mockResolvedValue(existing);

    const result = await ensurePracticeForApplication(
      { id: 9 },
      { datumPocetka: null, trajanje: null }
    );

    expect(result).toBe(existing);
    expect(db.Praksa.create).not.toHaveBeenCalled();
  });

  test('kreira praksu s datumima oglasa kada praksa ne postoji', async () => {
    db.Praksa.findOne.mockResolvedValue(null);
    db.Praksa.create.mockImplementation(async (data) => data);

    await ensurePracticeForApplication(
      { id: 9 },
      { datumPocetka: '2026-06-01', trajanje: 1 }
    );

    expect(db.Praksa.create).toHaveBeenCalledWith(
      expect.objectContaining({
        prijavaID: 9,
        datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
        datumKraja: new Date('2026-06-30T00:00:00.000Z'),
      }),
      { transaction: undefined }
    );
  });
});

function makeExpiredPracticeRow(overrides = {}) {
  return {
    id: 1,
    prijavaID: 100,
    datumPocetka: new Date('2026-05-01T00:00:00.000Z'),
    datumKraja: new Date('2026-05-25T00:00:00.000Z'),
    datumOdustajanja: null,
    datumObavijestiZavrsetka: null,
    update: jest.fn().mockResolvedValue(undefined),
    PrijavaNaPraksu: {
      id: 100,
      status: 'ODOBRENA',
      koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO',
      studentStatus: 'PRIHVACENO',
      Student: {
        id: 20,
        User: { id: 3, ime: 'Amina', prezime: 'Begić', email: 'student@test.com' },
      },
      Oglas: {
        id: 10,
        naziv: 'Backend praksa',
        Kompanija: {
          id: 5,
          naziv: 'Firma d.o.o.',
          User: { email: 'company@test.com' },
        },
      },
    },
    ...overrides,
  };
}

// ── completeExpiredPractices ──────────────────────────────────────────────────
describe('completeExpiredPractices', () => {
  beforeEach(() => {
    notificationPreferences.getOrCreatePreferences.mockResolvedValue({});
    notificationPreferences.canSendInApp.mockReturnValue(true);
    notificationPreferences.canSendEmail.mockReturnValue(true);
    notifications.createNotification.mockResolvedValue({});
    emailService.sendPraksaZavrsenaStudentEmail.mockResolvedValue(undefined);
    emailService.sendPraksaZavrsenaCompanyEmail.mockResolvedValue(undefined);
  });

  test('šalje obavijesti i označava praksu kao obaviještenu', async () => {
    const row = makeExpiredPracticeRow();
    db.Praksa.findAll.mockResolvedValue([row]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 1, errors: [] });
    expect(notifications.createNotification).toHaveBeenCalledWith(
      20,
      100,
      'PRAKSA_ZAVRSENA',
      'Praksa je završena',
      expect.stringContaining('Backend praksa')
    );
    expect(emailService.sendPraksaZavrsenaStudentEmail).toHaveBeenCalledWith(
      'student@test.com',
      'Backend praksa',
      'Firma d.o.o.',
      '25.05.2026.'
    );
    expect(emailService.sendPraksaZavrsenaCompanyEmail).toHaveBeenCalledWith(
      'company@test.com',
      'Amina Begić',
      'Backend praksa',
      '25.05.2026.'
    );
    expect(row.update).toHaveBeenCalledWith({ datumObavijestiZavrsetka: expect.any(Date) });
  });

  test('ne obrađuje praksu kada nema isteklih zapisa', async () => {
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 0, errors: [] });
    expect(notifications.createNotification).not.toHaveBeenCalled();
    expect(emailService.sendPraksaZavrsenaStudentEmail).not.toHaveBeenCalled();
  });

  test('preskače praksu koja još nije završena prema lifecycle statusu', async () => {
    const row = makeExpiredPracticeRow({
      datumKraja: new Date('2026-05-26T00:00:00.000Z'),
    });
    db.Praksa.findAll.mockResolvedValue([row]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result).toEqual({ processed: 0, errors: [] });
    expect(row.update).not.toHaveBeenCalled();
  });

  test('vraća grešku bez prekida ostalih praksi', async () => {
    const failingRow = makeExpiredPracticeRow({ id: 1 });
    const successRow = makeExpiredPracticeRow({ id: 2 });
    failingRow.update.mockRejectedValue(new Error('DB greška'));
    db.Praksa.findAll.mockResolvedValue([failingRow, successRow]);

    const result = await completeExpiredPractices(new Date('2026-05-26T12:00:00.000Z'));

    expect(result.processed).toBe(1);
    expect(result.errors).toEqual([{ praksaId: 1, message: 'DB greška' }]);
    expect(successRow.update).toHaveBeenCalled();
  });
});

// ── getStudentPractices ───────────────────────────────────────────────────────
describe('getStudentPractices', () => {
  // Testira regresiju: Sequelize pripadajući oglas mapira kao Ogla
  // Ulaz: praksa čija prijava nosi Ogla.Kompanija relaciju
  // Očekivani izlaz: DTO s stvarnim nazivom oglasa i kompanije
  test('mapira Ogla alias u stvarne detalje oglasa i kompanije', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([{
      id: 1,
      prijavaID: 100,
      datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
      datumKraja: new Date('2026-06-30T00:00:00.000Z'),
      datumOdustajanja: null,
      PrijavaNaPraksu: {
        status: 'ODOBRENA',
        koordinatorStatus: 'ODOBRENO',
        kompanijaStatus: 'ODOBRENO',
        studentStatus: 'PRIHVACENO',
        Student: {
          id: 20,
          index_number: 'IB210001',
          User: { ime: 'Amina', prezime: 'Begić' },
          Fakultet: { naziv: 'ETF' },
          Odsjek: { naziv: 'RI' },
        },
        Ogla: {
          id: 10,
          naziv: 'Backend praksa',
          Kompanija: { id: 5, naziv: 'Firma d.o.o.' },
        },
      },
    }]);

    const result = await getStudentPractices(1, 'all');

    expect(result.prakse[0]).toMatchObject({
      oglas: { id: 10, naziv: 'Backend praksa' },
      kompanija: { id: 5, naziv: 'Firma d.o.o.' },
      student: { ime: 'Amina', prezime: 'Begić' },
    });
  });
});

function makeConfirmedPracticeRow() {
  return {
    id: 1,
    prijavaID: 100,
    datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
    datumKraja: new Date('2026-06-30T00:00:00.000Z'),
    datumOdustajanja: null,
    PrijavaNaPraksu: {
      status: 'ODOBRENA',
      koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'ODOBRENO',
      studentStatus: 'PRIHVACENO',
      Student: {
        id: 20,
        index_number: 'IB210001',
        User: { ime: 'Amina', prezime: 'Begić' },
        Fakultet: { naziv: 'ETF' },
        Odsjek: { naziv: 'RI' },
      },
      Ogla: {
        id: 10,
        naziv: 'Backend praksa',
        Kompanija: { id: 5, naziv: 'Firma d.o.o.' },
      },
    },
  };
}

// ── getPracticeContract ──────────────────────────────────────────────────────
describe('getPracticeContract', () => {
  test('studentu generiše bosanski ugovor za potvrđenu praksu', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Ugovor.findOne.mockResolvedValue(null);
    db.Ugovor.create.mockResolvedValue({
      id: 31,
      praksaID: 1,
      status: 'KREIRAN',
      datumKreiranja: new Date('2026-05-26T00:00:00.000Z'),
    });

    const result = await getPracticeContract(1, 'STUDENT', '1');

    expect(db.Ugovor.create).toHaveBeenCalledWith({
      praksaID: 1,
      status: 'KREIRAN',
      dokumentUrl: null,
    });
    expect(result.created).toBe(true);
    expect(result.ugovor.broj).toBe('UG-31');
    expect(result.sadrzaj).toContain('UGOVOR O OBAVLJANJU STRUČNE PRAKSE');
    expect(result.sadrzaj).toContain('Student: Amina Begić');
    expect(result.sadrzaj).toContain('Kompanija: Firma d.o.o.');
    expect(result.sadrzaj).toContain('sistema PraksaHub');
  });

  test('kompaniji vraća već kreiran ugovor bez duplikata', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Ugovor.findOne.mockResolvedValue({
      id: 31,
      praksaID: 1,
      status: 'KREIRAN',
      datumKreiranja: new Date('2026-05-26T00:00:00.000Z'),
    });

    const result = await getPracticeContract(2, 'COMPANY', 1);

    expect(result.created).toBe(false);
    expect(db.Ugovor.create).not.toHaveBeenCalled();
    expect(result.sadrzaj).toContain('Predmet ovog ugovora je obavljanje stručne prakse');
  });

  test('ne generiše ugovor za praksu koja nije dostupna korisniku', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([]);

    await expect(getPracticeContract(1, 'STUDENT', 99))
      .rejects.toMatchObject({ message: 'Praksa nije pronađena.', status: 404 });
    expect(db.Ugovor.findOne).not.toHaveBeenCalled();
  });

  test('baca 404 za nevalidan ID prakse', async () => {
    await expect(getPracticeContract(1, 'STUDENT', 'abc'))
      .rejects.toMatchObject({ message: 'Praksa nije pronađena.', status: 404 });
  });

  test('baca 403 za nedozvoljenu rolu', async () => {
    await expect(getPracticeContract(1, 'ADMIN', 1))
      .rejects.toMatchObject({ message: 'Nemate dozvolu za pristup ovom resursu.', status: 403 });
  });
});

describe('getCompanyPractices', () => {
  test('vraća prakse kompanije', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);

    const result = await getCompanyPractices(2, 'all');

    expect(result.prakse).toHaveLength(1);
    expect(result.prakse[0].kompanija).toMatchObject({ id: 5, naziv: 'Firma d.o.o.' });
  });
});

describe('getCoordinatorPractices', () => {
  test('vraća prakse studenata s fakulteta koordinatora', async () => {
    resolveCoordinatorProfile.mockResolvedValue({ id: 3, fakultetID: 7 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);

    const result = await getCoordinatorPractices(3, 'all');

    expect(result.prakse).toHaveLength(1);
    expect(resolveCoordinatorProfile).toHaveBeenCalledWith(3);
  });

  test('baca KOORDINATOR_NOT_FOUND kada profil ne postoji', async () => {
    resolveCoordinatorProfile.mockResolvedValue(null);

    await expect(getCoordinatorPractices(99))
      .rejects.toThrow('KOORDINATOR_NOT_FOUND');
  });
});

describe('getCoordinatorPracticeSummary', () => {
  test('broji aktivne i završene prakse', async () => {
    resolveCoordinatorProfile.mockResolvedValue({ id: 3, fakultetID: 7 });
    db.Praksa.findAll.mockResolvedValue([
      {
        ...makeConfirmedPracticeRow(),
        datumPocetka: new Date('2026-06-01T00:00:00.000Z'),
        datumKraja: new Date('2026-06-30T00:00:00.000Z'),
      },
      {
        ...makeConfirmedPracticeRow({ id: 2 }),
        datumPocetka: new Date('2026-01-01T00:00:00.000Z'),
        datumKraja: new Date('2026-01-31T00:00:00.000Z'),
      },
    ]);

    const result = await getCoordinatorPracticeSummary(3);

    expect(result.aktivnePrakse).toBeGreaterThanOrEqual(0);
    expect(result.zavrsene).toBeGreaterThanOrEqual(0);
    expect(result.aktivnePrakse + result.zavrsene).toBe(2);
  });
});

describe('backfillAcceptedPractices', () => {
  test('preskače prijave koje već imaju praksu', async () => {
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 9,
        Praksa: { id: 7 },
        Oglas: { datumPocetka: '2026-06-01', trajanje: 1 },
      },
    ]);

    await backfillAcceptedPractices();

    expect(db.Praksa.create).not.toHaveBeenCalled();
  });

  test('kreira praksu za prihvaćenu prijavu bez postojeće prakse', async () => {
    db.PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        id: 9,
        Praksa: null,
        Oglas: { datumPocetka: '2026-06-01', trajanje: 1 },
      },
    ]);
    db.Praksa.findOne.mockResolvedValue(null);
    db.Praksa.create.mockResolvedValue({ id: 11, prijavaID: 9 });

    await backfillAcceptedPractices();

    expect(db.Praksa.create).toHaveBeenCalled();
  });
});

describe('createActivity', () => {
  test('kreira aktivnost za aktivnu praksu studenta', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Aktivnost.create.mockResolvedValue({ id: 1, opis: 'Rad na API-ju' });

    const result = await createActivity(1, 1, 'Rad na API-ju');

    expect(db.Aktivnost.create).toHaveBeenCalledWith(expect.objectContaining({
      praksaID: 1,
      opis: 'Rad na API-ju',
    }));
    expect(result).toMatchObject({ id: 1, opis: 'Rad na API-ju' });
  });

  test('baca grešku kada praksa nije aktivna', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([{
      ...makeConfirmedPracticeRow(),
      datumPocetka: new Date('2020-01-01T00:00:00.000Z'),
      datumKraja: new Date('2020-01-31T00:00:00.000Z'),
    }]);

    await expect(createActivity(1, 1, 'Opis'))
      .rejects.toMatchObject({ message: 'Aktivnosti se mogu unositi samo tokom aktivne prakse.' });
  });

  test('baca 404 kada praksa ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([]);

    await expect(createActivity(1, 99, 'Opis'))
      .rejects.toMatchObject({ message: 'Praksa nije pronađena.', status: 404 });
  });
});

describe('getPracticeActivities', () => {
  test('vraća aktivnosti kompaniji za njenu praksu', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Aktivnost.findAll.mockResolvedValue([{ id: 1, opis: 'Sastanak' }]);

    const result = await getPracticeActivities(2, 'COMPANY', 1);

    expect(result).toEqual([{ id: 1, opis: 'Sastanak' }]);
  });
});

describe('practice attendance', () => {
  test('student moze vidjeti evidentirano prisustvo za svoju praksu', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Prisustvo.findAll.mockResolvedValue([{ id: 1, praksaID: 1, status: true }]);

    const result = await getPracticeAttendance(1, 'STUDENT', 1);

    expect(db.Prisustvo.findAll).toHaveBeenCalledWith({
      where: { praksaID: 1 },
      order: [['datum', 'DESC']],
    });
    expect(result).toEqual([{ id: 1, praksaID: 1, status: true }]);
  });

  test('kompanija evidentira ili azurira prisustvo tokom aktivne prakse', async () => {
    const existing = { id: 5, update: jest.fn().mockResolvedValue(undefined) };
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Prisustvo.findOrCreate.mockResolvedValue([existing, false]);

    const result = await upsertPracticeAttendance(2, 1, {
      datum: '2026-06-01',
      status: true,
      brojSati: 8,
      napomena: 'Redovan dolazak',
    });

    expect(db.Prisustvo.findOrCreate).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        praksaID: 1,
        datum: new Date('2026-06-01T00:00:00.000Z'),
      },
    }));
    expect(existing.update).toHaveBeenCalledWith({
      status: true,
      brojSati: 8,
      napomena: 'Redovan dolazak',
    });
    expect(result).toEqual({ prisustvo: existing, created: false });
  });

  test('baca grešku kada datum prisustva nedostaje', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);

    await expect(upsertPracticeAttendance(2, 1, { status: true }))
      .rejects.toMatchObject({ message: 'Datum prisustva je obavezan.' });
  });

  test('baca grešku za nevalidan broj sati', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);

    await expect(upsertPracticeAttendance(2, 1, { datum: '2026-06-01', brojSati: 25 }))
      .rejects.toMatchObject({ message: 'Broj sati mora biti cijeli broj od 0 do 24.' });
  });

  test('baca grešku kada datum nije u periodu prakse', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);

    await expect(upsertPracticeAttendance(2, 1, { datum: '2026-07-01', status: true }))
      .rejects.toMatchObject({ message: 'Datum prisustva mora biti unutar perioda prakse.' });
  });

  test('kreira novo prisustvo kada zapis ne postoji', async () => {
    const created = { id: 9, praksaID: 1, status: true };
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Prisustvo.findOrCreate.mockResolvedValue([created, true]);

    const result = await upsertPracticeAttendance(2, 1, { datum: '2026-06-15', status: 'false' });

    expect(result).toEqual({ prisustvo: created, created: true });
  });
});

describe('generatePracticeReport', () => {
  test('generiše izvještaj kada postoji evaluacija studenta', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.EvaluacijaStudenta.findOne.mockResolvedValue({
      tehnickeVjestine: 5,
      komunikacija: 4,
      radnaEtika: 5,
      inicijativa: 4,
      timskiRad: 5,
      ukupnaOcjena: 5,
      komentar: 'Odličan rad',
    });
    db.Prisustvo.findAll.mockResolvedValue([
      { status: true, brojSati: 8 },
      { status: false, brojSati: null },
    ]);
    db.PrijavaNaPraksu.findOne.mockResolvedValue({ koordinatorID: 3 });
    const izvjestaj = { id: 1, update: jest.fn().mockResolvedValue(undefined) };
    db.Izvjestaj.findOrCreate.mockResolvedValue([izvjestaj, true]);
    notifications.createNotification.mockResolvedValue(undefined);
    notifications.createNotificationForKoordinator.mockResolvedValue(undefined);

    const result = await generatePracticeReport(2, 1, { komentar: 'Student je završio sve zadatke.' });

    expect(result.created).toBe(true);
    expect(result.sadrzaj).toContain('IZVJEŠTAJ O OBAVLJENOJ PRAKSI');
    expect(result.sadrzaj).toContain('Student je završio sve zadatke.');
    expect(result.prisustvo).toMatchObject({ ukupnoEvidentirano: 2, prisutanDana: 1, ukupnoSati: 8 });
  });

  test('baca grešku kada evaluacija studenta ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.EvaluacijaStudenta.findOne.mockResolvedValue(null);

    await expect(generatePracticeReport(2, 1, { komentar: 'Test' }))
      .rejects.toMatchObject({ message: 'Morate prvo evaluirati studenta prije generisanja izvještaja.' });
  });

  test('baca grešku kada komentar nedostaje', async () => {
    db.User.findByPk.mockResolvedValue({ id: 2, role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.EvaluacijaStudenta.findOne.mockResolvedValue({ ukupnaOcjena: 5 });

    await expect(generatePracticeReport(2, 1, { komentar: '   ' }))
      .rejects.toMatchObject({ message: 'Komentar je obavezan.' });
  });
});

describe('getPracticeReport', () => {
  test('vraća izvještaj studentu za njegovu praksu', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([makeConfirmedPracticeRow()]);
    db.Izvjestaj.findOne.mockResolvedValue({ id: 1, sadrzaj: 'Izvještaj tekst' });
    db.EvaluacijaStudenta.findOne.mockResolvedValue({ ukupnaOcjena: 5 });
    db.Prisustvo.findAll.mockResolvedValue([{ status: true, brojSati: 8 }]);

    const result = await getPracticeReport(1, 'STUDENT', 1);

    expect(result.sadrzaj).toBe('Izvještaj tekst');
    expect(result.prisustvo).toMatchObject({ ukupnoEvidentirano: 1, prisutanDana: 1, ukupnoSati: 8 });
  });

  test('baca 404 kada praksa nije dostupna korisniku', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Praksa.findAll.mockResolvedValue([]);

    await expect(getPracticeReport(1, 'STUDENT', 99))
      .rejects.toMatchObject({ message: 'Praksa nije pronađena.', status: 404 });
  });
});
