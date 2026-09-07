'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  PrijavaNaPraksu: {
    count: jest.fn(),
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
  },
  Praksa: {
    count: jest.fn(),
    findAll: jest.fn(),
  },
  Student: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
  Koordinator: {
    findOne: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Oglas: {},
  Kompanija: {},
  Odsjek: {},
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendAccountApprovedEmail: jest.fn().mockResolvedValue(undefined),
  sendAccountRejectedEmail: jest.fn().mockResolvedValue(undefined),
  sendPrijavaStatusEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/audit.service', () => ({
  logAudit: jest.fn().mockResolvedValue(null),
  ACTION_TYPES: { APPLICATION_STATUS_CHANGED: 'APPLICATION_STATUS_CHANGED' },
}));

jest.mock('../../src/business/services/notifications.service', () => ({
  createNotification: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../src/business/services/notificationPreferences.service', () => ({
  getOrCreatePreferences: jest.fn().mockResolvedValue({}),
  canSendInApp: jest.fn().mockReturnValue(false),
  canSendEmail: jest.fn().mockReturnValue(false),
}));

const db = require('../../src/infrastructure/database/models');
const {
  sendAccountApprovedEmail,
  sendAccountRejectedEmail,
} = require('../../src/business/services/email.service');
const {
  getDashboardStats,
  getPrijave,
  getPrijavaById,
  odluciOPrijavi,
  getStudenti,
  getPrakse,
  approveStudent,
  rejectStudent,
} = require('../../src/business/services/koordinator.service');

// ── Helper funkcije ───────────────────────────────────────────────────────────
function makeMockUser(overrides = {}) {
  return {
    id: 10,
    ime: 'Amina',
    prezime: 'Begić',
    email: 'amina@test.com',
    role: 'STUDENT',
    status: 'ACTIVE',
    approvalStatus: 'PENDING_APPROVAL',
    emailVerifikovan: true,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeMockKoordinator(overrides = {}) {
  return { id: 1, userID: 1, fakultetID: 5, ...overrides };
}

function makeMockStudent(overrides = {}) {
  return {
    id: 20,
    userID: 10,
    fakultetID: 5,
    index_number: 'IB210001',
    year_of_study: 3,
    odsjekID: 2,
    ...overrides,
  };
}

function makeMockPrijava(overrides = {}) {
  const prijava = {
    id: 100,
    status: 'PODNESENA',
    Student: makeMockStudent(),
    ...overrides,
  };
  prijava.update = jest.fn(async (data) => Object.assign(prijava, data));
  return prijava;
}

beforeEach(() => jest.clearAllMocks());

// ── getDashboardStats ─────────────────────────────────────────────────────────
describe('getDashboardStats', () => {
  test('vraća ispravne statistike', async () => {
    db.PrijavaNaPraksu.count
      .mockResolvedValueOnce(10)  // ukupno
      .mockResolvedValueOnce(3)   // podnesene (CEKA_KOORDINATORA)
      .mockResolvedValueOnce(2)   // proslijedene (CEKA_KOMPANIJU + U_RAZMATRANJU)
      .mockResolvedValueOnce(4)   // odobrene (ODOBRENA)
      .mockResolvedValueOnce(1);  // odbijene (FINAL_REJECTED_STATUSES)
    db.Praksa.count.mockResolvedValueOnce(5);

    const result = await getDashboardStats();

    expect(result).toEqual({
      ukupno: 10,
      podnesene: 3,
      proslijedene: 2,
      odobrene: 4,
      odbijene: 1,
      aktivnePrakse: 5,
      zavrsene: 0,
    });
  });

  test('poziva count s ispravnim where filterima', async () => {
    db.PrijavaNaPraksu.count.mockResolvedValue(0);
    db.Praksa.count.mockResolvedValue(0);

    await getDashboardStats();

    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledTimes(5);
    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledWith({ where: { status: 'CEKA_KOORDINATORA' } });
    expect(db.PrijavaNaPraksu.count).toHaveBeenCalledWith({ where: { status: 'ODOBRENA' } });
  });

  test('propagira grešku iz baze', async () => {
    db.PrijavaNaPraksu.count.mockRejectedValue(new Error('DB error'));

    await expect(getDashboardStats()).rejects.toThrow('DB error');
  });
});

// ── getPrijave ────────────────────────────────────────────────────────────────
describe('getPrijave', () => {
  // Testira: funkcija vraća paginiran rezultat s ispravnim metapodacima
  // Ulaz: { stranica: 1, limit: 15, koordinatorUserId: 1 }, koordinator postoji
  // Očekivani izlaz: objekat s prijave, ukupno=20, stranice=2, trenutnaStranica=1
  test('vraća paginiran rezultat s ispravnim metapodacima', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({
      count: 20,
      rows: Array(15).fill(makeMockPrijava()),
    });

    const result = await getPrijave({ stranica: 1, limit: 15, koordinatorUserId: 1 });

    expect(result.ukupno).toBe(20);
    expect(result.stranice).toBe(2);
    expect(result.trenutnaStranica).toBe(1);
    expect(result.prijave).toHaveLength(15);
  });

  // Testira: funkcija normalizuje legacy status PODNESENA u CEKA_KOORDINATORA
  // Ulaz: { status: 'PODNESENA', stranica: 1, limit: 15, koordinatorUserId: 1 }
  // Očekivani izlaz: findAndCountAll pozvan s where: { status: 'CEKA_KOORDINATORA' }
  test('normalizuje legacy status PODNESENA u CEKA_KOORDINATORA', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ status: 'PODNESENA', stranica: 1, limit: 15, koordinatorUserId: 1 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'CEKA_KOORDINATORA' } })
    );
  });

  // Testira: funkcija ne dodaje where filter kada status nije proslijeđen
  // Ulaz: { stranica: 1, limit: 15, koordinatorUserId: 1 } bez statusa
  // Očekivani izlaz: findAndCountAll pozvan s where: {}
  test('ne filtrira po statusu kada nije proslijeđen', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ stranica: 1, limit: 15, koordinatorUserId: 1 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: ispravno računa offset za drugu stranicu
  // Ulaz: { stranica: 2, limit: 10, koordinatorUserId: 1 }
  // Očekivani izlaz: findAndCountAll pozvan s offset: 10
  test('ispravno računa offset za drugu stranicu', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

    await getPrijave({ stranica: 2, limit: 10, koordinatorUserId: 1 });

    expect(db.PrijavaNaPraksu.findAndCountAll).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 10, limit: 10 })
    );
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(getPrijave({ stranica: 1, limit: 15, koordinatorUserId: 999 }))
      .rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.PrijavaNaPraksu.findAndCountAll).not.toHaveBeenCalled();
  });
});

// ── getPrijavaById ────────────────────────────────────────────────────────────
describe('getPrijavaById', () => {
  // Testira: funkcija vraća prijavu kada postoji i pripada istom fakultetu
  // Ulaz: id=100, koordinatorUserId=1, koordinator i student imaju isti fakultetID=5
  // Očekivani izlaz: objekat prijave s id=100
  test('vraća prijavu kada postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava());

    const result = await getPrijavaById(100, 1);

    expect(result.id).toBe(100);
  });

  // Testira: funkcija baca NOT_FOUND kada prijava ne postoji
  // Ulaz: id=999, koordinatorUserId=1, findByPk vraća null
  // Očekivani izlaz: baca Error s porukom 'NOT_FOUND'
  test('baca NOT_FOUND kada prijava ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    await expect(getPrijavaById(999, 1)).rejects.toThrow('NOT_FOUND');
  });

  // Testira: funkcija baca NOT_FOUND kada prijava je s drugog fakulteta
  // Ulaz: id=100, koordinator ima fakultetID=5, student ima fakultetID=99
  // Očekivani izlaz: baca Error s porukom 'NOT_FOUND'
  test('baca NOT_FOUND kada prijava je s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator({ fakultetID: 5 }));
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makeMockPrijava({ Student: makeMockStudent({ fakultetID: 99 }) })
    );

    await expect(getPrijavaById(100, 1)).rejects.toThrow('NOT_FOUND');
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(getPrijavaById(100, 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.PrijavaNaPraksu.findByPk).not.toHaveBeenCalled();
  });
});

// ── odluciOPrijavi ────────────────────────────────────────────────────────────
describe('odluciOPrijavi', () => {
  beforeEach(() => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
  });

  test('odobrava prijavu i postavlja status CEKA_KOMPANIJU', async () => {
    const prijava = makeMockPrijava();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odobrena', '', 1);

    expect(result).toEqual({
      id: 100,
      status: 'CEKA_KOMPANIJU',
      koordinatorStatus: 'ODOBRENO',
      kompanijaStatus: 'NA_CEKANJU',
    });
    expect(prijava.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'CEKA_KOMPANIJU',
        koordinatorStatus: 'ODOBRENO',
        kompanijaStatus: 'NA_CEKANJU',
        razlogOdbijanja: null,
        koordinatorID: 1,
      })
    );
  });

  test('odbija prijavu i čuva razlog odbijanja', async () => {
    const prijava = makeMockPrijava();
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odbijena', 'Nepotpuna dokumentacija', 1);

    expect(result).toEqual({
      id: 100,
      status: 'ODBIJENA_KOORDINATOR',
      koordinatorStatus: 'ODBIJENO',
      kompanijaStatus: 'NIJE_DOSTUPNO',
    });
    expect(prijava.update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ODBIJENA_KOORDINATOR',
        razlogOdbijanja: 'Nepotpuna dokumentacija',
        koordinatorID: 1,
      })
    );
  });

  test('baca RAZLOG_REQUIRED kada je odbijanje bez razloga', async () => {
    await expect(odluciOPrijavi(100, 'odbijena', '', 1)).rejects.toThrow('RAZLOG_REQUIRED');
    expect(db.PrijavaNaPraksu.findByPk).not.toHaveBeenCalled();
  });

  test('baca NOT_FOUND kada student nije s fakulteta koordinatora', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(
      makeMockPrijava({ Student: makeMockStudent({ fakultetID: 99 }) })
    );

    await expect(odluciOPrijavi(100, 'odobrena', '', 1)).rejects.toThrow('NOT_FOUND');
  });

  test('baca NOT_FOUND kada prijava ne postoji', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(null);

    await expect(odluciOPrijavi(999, 'odobrena', '', 1)).rejects.toThrow('NOT_FOUND');
  });

  test('baca INVALID_STATUS kada prijava već ima finalni status', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava({ status: 'ODOBRENA' }));

    await expect(odluciOPrijavi(100, 'odobrena', '', 1)).rejects.toThrow('INVALID_STATUS');
  });

  // CEKA_KOMPANIJU nije na čekanju koordinatora — koordinator ne može ponovo djelovati
  test('baca INVALID_STATUS za prijavu sa statusom CEKA_KOMPANIJU', async () => {
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(makeMockPrijava({ status: 'CEKA_KOMPANIJU' }));

    await expect(odluciOPrijavi(100, 'odobrena', '', 1)).rejects.toThrow('INVALID_STATUS');
  });

  // CEKA_KOORDINATORA je noviji naziv za isti pending status (nasuprot legacy PODNESENA)
  test('prihvata prijavu sa statusom CEKA_KOORDINATORA', async () => {
    const prijava = makeMockPrijava({ status: 'CEKA_KOORDINATORA' });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    const result = await odluciOPrijavi(100, 'odobrena', '', 1);

    expect(result.status).toBe('CEKA_KOMPANIJU');
  });

  test('šalje in-app notifikaciju kada canSendInApp vraća true', async () => {
    const { canSendInApp } = require('../../src/business/services/notificationPreferences.service');
    canSendInApp.mockReturnValueOnce(true);

    const prijava = makeMockPrijava({
      Student: { ...makeMockStudent(), userID: 10 },
      Oglas: { naziv: 'Dev', Kompanija: { naziv: 'TechCorp' } },
    });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    await odluciOPrijavi(100, 'odobrena', '', 1);

    const { createNotification } = require('../../src/business/services/notifications.service');
    expect(createNotification).toHaveBeenCalled();
  });

  test('šalje email notifikaciju kada canSendEmail vraća true', async () => {
    const { canSendEmail } = require('../../src/business/services/notificationPreferences.service');
    canSendEmail.mockReturnValueOnce(true);

    const prijava = makeMockPrijava({
      Student: {
        ...makeMockStudent(),
        userID: 10,
        User: { email: 'student@test.com' },
      },
      Oglas: { naziv: 'Dev', Kompanija: { naziv: 'TechCorp' } },
    });
    db.PrijavaNaPraksu.findByPk.mockResolvedValue(prijava);

    await odluciOPrijavi(100, 'odobrena', '', 1);

    const { sendPrijavaStatusEmail } = require('../../src/business/services/email.service');
    expect(sendPrijavaStatusEmail).toHaveBeenCalled();
  });
});

// ── getStudenti ───────────────────────────────────────────────────────────────
describe('getStudenti', () => {
  test('filtrira studente po fakultetID koordinatora', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([makeMockStudent()]);

    await getStudenti(1);

    expect(db.Student.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { fakultetID: 5 } })
    );
  });

  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(getStudenti(999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findAll).not.toHaveBeenCalled();
  });

  test('vraća prazan niz kada nema studenata', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    const result = await getStudenti(1);

    expect(result).toEqual([]);
  });

  test('pretraga jednom riječju dodaje filter na ime i prezime', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    await getStudenti(1, 'Amina');

    const call = db.Student.findAll.mock.calls[0][0];
    const userInclude = call.include.find(i => i.model === db.User);
    const whereKeys = Object.getOwnPropertySymbols(userInclude.where);
    expect(whereKeys.length).toBeGreaterThan(0);
  });

  test('pretraga s dvije ili više riječi koristi ime i prezime kombinovano', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findAll.mockResolvedValue([]);

    await getStudenti(1, 'Amina Begić');

    const call = db.Student.findAll.mock.calls[0][0];
    const userInclude = call.include.find(i => i.model === db.User);
    const whereKeys = Object.getOwnPropertySymbols(userInclude.where);
    expect(whereKeys.length).toBeGreaterThan(0);
  });
});

// ── getPrakse ─────────────────────────────────────────────────────────────────
describe('getPrakse', () => {
  // Testira: funkcija vraća sve prakse bez filtera kada status nije proslijeđen
  // Ulaz: status='' (prazan string), koordinatorUserId=1
  // Očekivani izlaz: Praksa.findAll pozvan s where: {}
  test('vraća sve prakse bez filtera kada status nije proslijeđen', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    await getPrakse('', 1);

    expect(db.Praksa.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: lifecycle filter se računa iz datuma umjesto iz pohranjene status kolone
  // Ulaz: status='aktivna' (lowercase), koordinatorUserId=1
  // Očekivani izlaz: Praksa.findAll ne filtrira po nepostojećem Praksa.status
  test('primjenjuje lifecycle filter bez pohranjene status kolone', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    await getPrakse('aktivna', 1);

    expect(db.Praksa.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });

  // Testira: funkcija vraća prazan niz kada nema praksi
  // Ulaz: Praksa.findAll vraća [], koordinatorUserId=1
  // Očekivani izlaz: []
  test('vraća prazan niz kada nema praksi', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Praksa.findAll.mockResolvedValue([]);

    const result = await getPrakse('', 1);

    expect(result).toEqual([]);
  });

  // Testira: funkcija baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji
  // Ulaz: Koordinator.findOne vraća null
  // Očekivani izlaz: baca Error s porukom 'KOORDINATOR_NOT_FOUND'
  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(getPrakse('', 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Praksa.findAll).not.toHaveBeenCalled();
  });
});

// ── approveStudent ────────────────────────────────────────────────────────────
describe('approveStudent', () => {
  test('uspješno odobrava studenta i šalje email', async () => {
    const user = makeMockUser();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(user);

    const result = await approveStudent(10, 1);

    expect(user.approvalStatus).toBe('APPROVED');
    expect(user.status).toBe('ACTIVE');
    expect(user.approvedBy).toBe(1);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountApprovedEmail).toHaveBeenCalledWith('amina@test.com', 'STUDENT');
    expect(result).toEqual({ id: 10, approvalStatus: 'APPROVED' });
  });

  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(approveStudent(10, 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findOne).not.toHaveBeenCalled();
  });

  test('baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY za studenta s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    await expect(approveStudent(10, 1)).rejects.toThrow('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');
    expect(db.User.findByPk).not.toHaveBeenCalled();
  });

  test('baca EMAIL_NOT_VERIFIED kada student nije verifikovao email', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ emailVerifikovan: false }));

    await expect(approveStudent(10, 1)).rejects.toThrow('EMAIL_NOT_VERIFIED');
    expect(sendAccountApprovedEmail).not.toHaveBeenCalled();
  });

  test('baca INVALID_STATUS kada student već nije PENDING_APPROVAL', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'APPROVED' }));

    await expect(approveStudent(10, 1)).rejects.toThrow('INVALID_STATUS');
    expect(sendAccountApprovedEmail).not.toHaveBeenCalled();
  });

  test('baca NOT_FOUND kada user ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(null);

    await expect(approveStudent(10, 1)).rejects.toThrow('NOT_FOUND');
  });
});

// ── rejectStudent ─────────────────────────────────────────────────────────────
describe('rejectStudent', () => {
  test('uspješno odbija studenta i šalje email', async () => {
    const user = makeMockUser();
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(user);

    const result = await rejectStudent(10, 'Nepotpuna dokumentacija', 1);

    expect(user.approvalStatus).toBe('REJECTED');
    expect(user.status).toBe('DEACTIVATED');
    expect(user.rejectedBy).toBe(1);
    expect(user.rejectionReason).toBe('Nepotpuna dokumentacija');
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(sendAccountRejectedEmail).toHaveBeenCalledWith('amina@test.com', 'Nepotpuna dokumentacija');
    expect(result).toEqual({ id: 10, approvalStatus: 'REJECTED' });
  });

  test('baca RAZLOG_REQUIRED kada razlog nije proslijeđen', async () => {
    await expect(rejectStudent(10, undefined, 1)).rejects.toThrow('RAZLOG_REQUIRED');
    expect(db.Koordinator.findOne).not.toHaveBeenCalled();
  });

  test('baca RAZLOG_REQUIRED kada je razlog prazan string', async () => {
    await expect(rejectStudent(10, '   ', 1)).rejects.toThrow('RAZLOG_REQUIRED');
    expect(db.Koordinator.findOne).not.toHaveBeenCalled();
  });

  test('baca KOORDINATOR_NOT_FOUND kada koordinator ne postoji', async () => {
    db.Koordinator.findOne.mockResolvedValue(null);

    await expect(rejectStudent(10, 'Razlog', 999)).rejects.toThrow('KOORDINATOR_NOT_FOUND');
    expect(db.Student.findOne).not.toHaveBeenCalled();
  });

  test('baca STUDENT_NOT_FOUND_OR_WRONG_FACULTY za studenta s drugog fakulteta', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(null);

    await expect(rejectStudent(10, 'Razlog', 1)).rejects.toThrow('STUDENT_NOT_FOUND_OR_WRONG_FACULTY');
    expect(db.User.findByPk).not.toHaveBeenCalled();
  });

  test('baca INVALID_STATUS kada student već nije PENDING_APPROVAL', async () => {
    db.Koordinator.findOne.mockResolvedValue(makeMockKoordinator());
    db.Student.findOne.mockResolvedValue(makeMockStudent());
    db.User.findByPk.mockResolvedValue(makeMockUser({ approvalStatus: 'REJECTED' }));

    await expect(rejectStudent(10, 'Razlog', 1)).rejects.toThrow('INVALID_STATUS');
    expect(sendAccountRejectedEmail).not.toHaveBeenCalled();
  });
});
