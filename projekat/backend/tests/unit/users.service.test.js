'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findByPk: jest.fn(), findOne: jest.fn() },
  Student: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn(), create: jest.fn() },
  Oglas: { findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  PrijavaNaPraksu: { findAll: jest.fn(), findOne: jest.fn(), update: jest.fn(), count: jest.fn(), destroy: jest.fn() },
  Koordinator: { findOne: jest.fn() },
  Praksa: { findOne: jest.fn(), findAll: jest.fn() },
  Aktivnost: { destroy: jest.fn() },
  Prisustvo: { destroy: jest.fn() },
  Evaluacija: { destroy: jest.fn() },
  Ugovor: { destroy: jest.fn() },
  Izvjestaj: { destroy: jest.fn() },
  sequelize: { transaction: jest.fn() },
}));

jest.mock('../../src/business/services/email.service', () => ({
  sendStudentDeactivationToCompany: jest.fn().mockResolvedValue(undefined),
  sendStudentDeactivationToKoordinator: jest.fn().mockResolvedValue(undefined),
}));

const { User, Student, Kompanija, Oglas, PrijavaNaPraksu, Koordinator, Izvjestaj, sequelize } =
  require('../../src/infrastructure/database/models');

const {
  getCompanyProfile, updateCompanyProfile,
  checkDeactivation, deactivateMyAccount,
  checkCompanyDeactivation, deactivateCompanyAccount,
  checkCoordinatorDeactivation, deactivateCoordinatorAccount,
  deleteMyAccount, deleteCompanyAccount, deleteCoordinatorAccount,
} = require('../../src/business/services/users.service');

const {
  sendStudentDeactivationToCompany,
  sendStudentDeactivationToKoordinator,
} = require('../../src/business/services/email.service');

beforeEach(() => jest.clearAllMocks());

function makeUser(overrides = {}) {
  return {
    id: 1, ime: 'Firma d.o.o.', prezime: '', username: 'firma', email: 'firma@test.com',
    institution: 'Firma d.o.o.', status: 'ACTIVE',
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// ── getCompanyProfile ───────────────────────────────────────────────────────

describe('getCompanyProfile', () => {
  test('vraća profil kompanije ako Kompanija zapis postoji', async () => {
    Kompanija.findOne.mockResolvedValue({
      naziv: 'Firma', opisPoslovanja: null, djelatnost: null, adresa: 'Ul. 1', telefon: null, kontaktOsoba: null,
    });
    const result = await getCompanyProfile(1);
    expect(result.naziv).toBe('Firma');
  });

  test('vraća fallback profil ako nema Kompanija zapisa ali user postoji', async () => {
    Kompanija.findOne.mockResolvedValue(null);
    User.findByPk.mockResolvedValue(makeUser());
    const result = await getCompanyProfile(1);
    expect(result.naziv).toBe('Firma d.o.o.');
    expect(result.adresa).toBeNull();
  });

  test('baca 404 ako ni user ne postoji', async () => {
    Kompanija.findOne.mockResolvedValue(null);
    User.findByPk.mockResolvedValue(null);
    await expect(getCompanyProfile(1)).rejects.toMatchObject({ status: 404 });
  });
});

// ── updateCompanyProfile ────────────────────────────────────────────────────

describe('updateCompanyProfile', () => {
  test('baca 404 ako user ne postoji', async () => {
    Kompanija.findOne.mockResolvedValue(null);
    User.findByPk.mockResolvedValue(null);
    await expect(updateCompanyProfile(1, { naziv: 'X', adresa: 'Y' })).rejects.toMatchObject({ status: 404 });
  });

  test('uspješno ažurira postojeću kompaniju', async () => {
    const company = {
      naziv: 'Staro', adresa: 'Stara ul.', opisPoslovanja: null, djelatnost: null, telefon: null, kontaktOsoba: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    Kompanija.findOne.mockResolvedValue(company);
    User.findByPk.mockResolvedValue(makeUser({ ime: 'Staro', institution: 'Staro' }));
    sequelize.transaction.mockImplementation(fn => fn({}));

    const result = await updateCompanyProfile(1, { naziv: 'Nova Firma', adresa: 'Nova ul.' });
    expect(result.naziv).toBe('Nova Firma');
    expect(company.save).toHaveBeenCalled();
  });
});

// ── checkDeactivation ───────────────────────────────────────────────────────

describe('checkDeactivation', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(checkDeactivation(1)).rejects.toMatchObject({ status: 404 });
  });

  test('canDeactivate: true ako student zapis ne postoji', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Student.findOne.mockResolvedValue(null);
    const result = await checkDeactivation(1);
    expect(result).toEqual({ canDeactivate: true, pendingApplications: [] });
  });

  test('canDeactivate: false ako postoji odobrena prijava', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.findAll.mockResolvedValue([
      { status: 'ODOBRENA', Oglas: { Kompanija: { naziv: 'Firma A' } } },
    ]);
    const result = await checkDeactivation(1);
    expect(result.canDeactivate).toBe(false);
    expect(result.reason).toBe('ODOBRENA_EXISTS');
  });
});

// ── deactivateMyAccount ─────────────────────────────────────────────────────

describe('deactivateMyAccount', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deactivateMyAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 400 ako je nalog već deaktiviran', async () => {
    User.findByPk.mockResolvedValue(makeUser({ status: 'DEACTIVATED' }));
    await expect(deactivateMyAccount(1)).rejects.toMatchObject({ status: 400 });
  });

  test('deaktivira nalog kada student zapis ne postoji', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(null);
    await deactivateMyAccount(1);
    expect(user.status).toBe('DEACTIVATED');
    expect(user.save).toHaveBeenCalled();
  });
});

// ── checkCompanyDeactivation ────────────────────────────────────────────────

describe('checkCompanyDeactivation', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(checkCompanyDeactivation(1)).rejects.toMatchObject({ status: 404 });
  });

  test('canDeactivate: true ako kompanija zapis ne postoji', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Kompanija.findOne.mockResolvedValue(null);
    const result = await checkCompanyDeactivation(1);
    expect(result).toEqual({ canDeactivate: true, oglasiToClose: [] });
  });
});

// ── deactivateCompanyAccount ────────────────────────────────────────────────

describe('deactivateCompanyAccount', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deactivateCompanyAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 400 ako je nalog već deaktiviran', async () => {
    User.findByPk.mockResolvedValue(makeUser({ status: 'DEACTIVATED' }));
    await expect(deactivateCompanyAccount(1)).rejects.toMatchObject({ status: 400 });
  });

  test('deaktivira nalog kada kompanija zapis ne postoji', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Kompanija.findOne.mockResolvedValue(null);
    await deactivateCompanyAccount(1);
    expect(user.status).toBe('DEACTIVATED');
  });
});

// ── checkCoordinatorDeactivation ─────────────────────────────────────────────

describe('checkCoordinatorDeactivation', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(checkCoordinatorDeactivation(1)).rejects.toMatchObject({ status: 404 });
  });

  test('canDeactivate: true ako koordinator zapis ne postoji', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Koordinator.findOne.mockResolvedValue(null);
    const result = await checkCoordinatorDeactivation(1);
    expect(result).toEqual({ canDeactivate: true, pendingCount: 0 });
  });
});

// ── deactivateCoordinatorAccount ──────────────────────────────────────────────

describe('deactivateCoordinatorAccount', () => {
  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deactivateCoordinatorAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 400 ako je nalog već deaktiviran', async () => {
    User.findByPk.mockResolvedValue(makeUser({ status: 'DEACTIVATED' }));
    await expect(deactivateCoordinatorAccount(1)).rejects.toMatchObject({ status: 400 });
  });

  test('deaktivira nalog kada koordinator zapis ne postoji', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Koordinator.findOne.mockResolvedValue(null);
    await deactivateCoordinatorAccount(1);
    expect(user.status).toBe('DEACTIVATED');
  });
});

// ── updateCompanyProfile — dodatne grane ────────────────────────────────────

describe('updateCompanyProfile — kreiranje nove kompanije', () => {
  test('kreira novu Kompanija ako ne postoji', async () => {
    Kompanija.findOne.mockResolvedValue(null);
    User.findByPk.mockResolvedValue(makeUser({ ime: 'Firma', institution: 'Firma' }));
    const newCompany = {
      naziv: 'Nova Firma', adresa: 'Nova ul.',
      opisPoslovanja: null, djelatnost: null, telefon: null, kontaktOsoba: null,
    };
    Kompanija.create.mockResolvedValue(newCompany);
    sequelize.transaction.mockImplementation(fn => fn({}));

    const result = await updateCompanyProfile(1, { naziv: 'Nova Firma', adresa: 'Nova ul.' });
    expect(Kompanija.create).toHaveBeenCalled();
    expect(result.naziv).toBe('Nova Firma');
  });

  test('baca 400 ako je naziv prazan string', async () => {
    Kompanija.findOne.mockResolvedValue(null);
    User.findByPk.mockResolvedValue(makeUser({ ime: '' }));
    await expect(updateCompanyProfile(1, { naziv: '', adresa: 'Ul.' }))
      .rejects.toMatchObject({ status: 400 });
  });

  test('ažurira opcionalna polja na postojećoj kompaniji', async () => {
    const company = {
      naziv: 'Firma', adresa: 'Ul.',
      opisPoslovanja: null, djelatnost: null, telefon: null, kontaktOsoba: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    Kompanija.findOne.mockResolvedValue(company);
    User.findByPk.mockResolvedValue(makeUser({ ime: 'Firma', institution: 'Firma' }));
    sequelize.transaction.mockImplementation(fn => fn({}));

    await updateCompanyProfile(1, { naziv: 'Firma', adresa: 'Ul.', telefon: '061000000', opisPoslovanja: 'IT' });
    expect(company.telefon).toBe('061000000');
    expect(company.opisPoslovanja).toBe('IT');
    expect(company.save).toHaveBeenCalled();
  });
});

// ── checkDeactivation — pending prijave ─────────────────────────────────────

describe('checkDeactivation — pending prijave (PODNESENA/U_RAZMATRANJU)', () => {
  test('canDeactivate: true sa mapiranim pendingApplications', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.findAll.mockResolvedValue([
      { status: 'PODNESENA', Oglas: { naziv: 'Oglas 1', Kompanija: { naziv: 'Firma A' } } },
      { status: 'U_RAZMATRANJU', Oglas: { naziv: 'Oglas 2', Kompanija: { naziv: 'Firma B' } } },
    ]);
    const result = await checkDeactivation(1);
    expect(result.canDeactivate).toBe(true);
    expect(result.pendingApplications).toHaveLength(2);
    expect(result.pendingApplications[0].oglasNaziv).toBe('Oglas 1');
    expect(result.pendingApplications[1].kompanijaNaziv).toBe('Firma B');
  });
});

// ── deactivateMyAccount — student withdrawal flow ───────────────────────────

describe('deactivateMyAccount — student ima prijave', () => {
  test('baca 409 ako student ima ODOBRENU praksu', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.findOne.mockResolvedValue({ id: 10, status: 'ODOBRENA' });
    await expect(deactivateMyAccount(1))
      .rejects.toMatchObject({ status: 409, code: 'ODOBRENA_EXISTS' });
  });

  test('povlači pending prijave i šalje emailove kompaniji i koordinatoru', async () => {
    const user = makeUser({ ime: 'Ana', prezime: 'Anić' });
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.findOne.mockResolvedValue(null);
    PrijavaNaPraksu.findAll.mockResolvedValue([
      {
        Oglas: { naziv: 'Oglas 1', Kompanija: { User: { email: 'company@test.com' } } },
        Koordinator: { User: { email: 'coord@test.com' } },
      },
    ]);
    PrijavaNaPraksu.update.mockResolvedValue([1]);

    await deactivateMyAccount(1);

    expect(PrijavaNaPraksu.update).toHaveBeenCalled();
    expect(sendStudentDeactivationToCompany).toHaveBeenCalledWith('company@test.com', 'Ana Anić', 'Oglas 1');
    expect(sendStudentDeactivationToKoordinator).toHaveBeenCalledWith('coord@test.com', 'Ana Anić', 'Oglas 1');
    expect(user.status).toBe('DEACTIVATED');
  });

  test('deaktivira bez emailova ako prijava nema email kompanije/koordinatora', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.findOne.mockResolvedValue(null);
    PrijavaNaPraksu.findAll.mockResolvedValue([
      { Oglas: { naziv: 'Oglas', Kompanija: { User: null } }, Koordinator: null },
    ]);
    PrijavaNaPraksu.update.mockResolvedValue([1]);

    await deactivateMyAccount(1);

    expect(user.status).toBe('DEACTIVATED');
    expect(sendStudentDeactivationToCompany).not.toHaveBeenCalled();
    expect(sendStudentDeactivationToKoordinator).not.toHaveBeenCalled();
  });
});

// ── checkCompanyDeactivation — kompanija postoji ────────────────────────────

describe('checkCompanyDeactivation — kompanija ima aktivne oglase', () => {
  test('canDeactivate: false ako oglas ima aktivne prijave', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Kompanija.findOne.mockResolvedValue({ id: 10 });
    Oglas.findAll.mockResolvedValue([
      { naziv: 'Oglas 1', PrijavaNaPraksus: [{ id: 1 }] },
    ]);
    const result = await checkCompanyDeactivation(1);
    expect(result.canDeactivate).toBe(false);
    expect(result.reason).toBe('AKTIVAN_SA_PRIJAVAMA');
    expect(result.oglasi).toContain('Oglas 1');
  });

  test('canDeactivate: true sa oglasiToClose ako nema prijava', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Kompanija.findOne.mockResolvedValue({ id: 10 });
    Oglas.findAll.mockResolvedValue([
      { naziv: 'Oglas 1', PrijavaNaPraksus: [] },
      { naziv: 'Oglas 2', PrijavaNaPraksus: [] },
    ]);
    const result = await checkCompanyDeactivation(1);
    expect(result.canDeactivate).toBe(true);
    expect(result.oglasiToClose).toHaveLength(2);
  });
});

// ── deactivateCompanyAccount — kompanija postoji ────────────────────────────

describe('deactivateCompanyAccount — kompanija postoji', () => {
  test('baca 409 ako kompanija ima oglas sa prijavama', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Kompanija.findOne.mockResolvedValue({ id: 10 });
    Oglas.findOne.mockResolvedValue({ id: 5, naziv: 'Oglas 1' });
    await expect(deactivateCompanyAccount(1))
      .rejects.toMatchObject({ status: 409, code: 'AKTIVAN_SA_PRIJAVAMA' });
  });

  test('zatvara aktivne oglase i deaktivira nalog', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Kompanija.findOne.mockResolvedValue({ id: 10 });
    Oglas.findOne.mockResolvedValue(null);
    Oglas.update.mockResolvedValue([2]);

    await deactivateCompanyAccount(1);

    expect(Oglas.update).toHaveBeenCalledWith(
      { status: 'ZATVOREN' },
      expect.objectContaining({ where: expect.objectContaining({ kompanijaID: 10 }) })
    );
    expect(user.status).toBe('DEACTIVATED');
  });
});

// ── checkCoordinatorDeactivation — koordinator postoji ──────────────────────

describe('checkCoordinatorDeactivation — koordinator postoji', () => {
  test('canDeactivate: false ako koordinator ima ODOBRENE prakse', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.findAll.mockResolvedValue([
      { Student: { User: { ime: 'Ana', prezime: 'Anić' } } },
    ]);
    const result = await checkCoordinatorDeactivation(1);
    expect(result.canDeactivate).toBe(false);
    expect(result.reason).toBe('ODOBRENA_EXISTS');
    expect(result.studenti).toContain('Ana Anić');
  });

  test('canDeactivate: true sa pendingCount kada nema ODOBRENIH', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.findAll.mockResolvedValue([]);
    PrijavaNaPraksu.count.mockResolvedValue(3);
    const result = await checkCoordinatorDeactivation(1);
    expect(result.canDeactivate).toBe(true);
    expect(result.pendingCount).toBe(3);
  });
});

// ── deactivateCoordinatorAccount — koordinator postoji ──────────────────────

describe('deactivateCoordinatorAccount — koordinator postoji', () => {
  test('baca 409 ako koordinator ima ODOBRENU praksu u toku', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.findOne.mockResolvedValue({ id: 20 });
    await expect(deactivateCoordinatorAccount(1))
      .rejects.toMatchObject({ status: 409, code: 'ODOBRENA_EXISTS' });
  });

  test('nulluje pending prijave i deaktivira nalog', async () => {
    const user = makeUser();
    User.findByPk.mockResolvedValue(user);
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.findOne.mockResolvedValue(null);
    PrijavaNaPraksu.update.mockResolvedValue([2]);

    await deactivateCoordinatorAccount(1);

    expect(PrijavaNaPraksu.update).toHaveBeenCalledWith(
      { koordinatorID: null },
      expect.objectContaining({ where: expect.objectContaining({ koordinatorID: 7 }) })
    );
    expect(user.status).toBe('DEACTIVATED');
  });
});

// ── deleteMyAccount ────────────────────────────────────────────────────────

describe('deleteMyAccount', () => {
  function setupTransaction() {
    sequelize.transaction.mockImplementation(async (cb) => cb({}));
  }

  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deleteMyAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 409 ako student ima odobrenu prijavu', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Student.findOne.mockResolvedValue({ id: 10 });
    PrijavaNaPraksu.findOne.mockResolvedValueOnce({ id: 99 });
    await expect(deleteMyAccount(1)).rejects.toMatchObject({ status: 409, code: 'ODOBRENA_EXISTS' });
  });

  test('briše studenta i usera kada nema blokirajućih prijava', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    const student = { id: 10, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(student);
    PrijavaNaPraksu.findOne.mockResolvedValue(null);
    PrijavaNaPraksu.findAll.mockResolvedValue([]);
    PrijavaNaPraksu.destroy.mockResolvedValue(1);
    setupTransaction();

    await deleteMyAccount(1);

    expect(student.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('briše usera direktno kada nema student zapisa', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(null);
    setupTransaction();

    await deleteMyAccount(1);

    expect(user.destroy).toHaveBeenCalled();
  });
});

// ── deleteCompanyAccount ───────────────────────────────────────────────────

describe('deleteCompanyAccount', () => {
  function setupTransaction() {
    sequelize.transaction.mockImplementation(async (cb) => cb({}));
  }

  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deleteCompanyAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 409 ako kompanija ima aktivan oglas s prijavama', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Kompanija.findOne.mockResolvedValue({ id: 5 });
    Oglas.findOne.mockResolvedValue({ id: 20, naziv: 'Oglas 1' });
    await expect(deleteCompanyAccount(1)).rejects.toMatchObject({ status: 409, code: 'AKTIVAN_SA_PRIJAVAMA' });
  });

  test('briše kompaniju i usera kada nema blokirajućih oglasa', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    const kompanija = { id: 5, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Kompanija.findOne.mockResolvedValue(kompanija);
    Oglas.findOne.mockResolvedValue(null);
    Oglas.findAll.mockResolvedValue([]);
    Oglas.destroy.mockResolvedValue(1);
    setupTransaction();

    await deleteCompanyAccount(1);

    expect(kompanija.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('briše usera direktno kada nema kompanija zapisa', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Kompanija.findOne.mockResolvedValue(null);
    setupTransaction();

    await deleteCompanyAccount(1);

    expect(user.destroy).toHaveBeenCalled();
  });
});

// ── deleteCoordinatorAccount ───────────────────────────────────────────────

describe('deleteCoordinatorAccount', () => {
  function setupTransaction() {
    sequelize.transaction.mockImplementation(async (cb) => cb({}));
  }

  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deleteCoordinatorAccount(1)).rejects.toMatchObject({ status: 404 });
  });

  test('baca 409 ako koordinator ima odobrenu praksu u toku', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.findOne.mockResolvedValue({ id: 55 });
    await expect(deleteCoordinatorAccount(1)).rejects.toMatchObject({ status: 409, code: 'ODOBRENA_EXISTS' });
  });

  test('nulluje koordinatorID na prijavama i briše koordinatora i usera', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    const koordinator = { id: 7, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Koordinator.findOne.mockResolvedValue(koordinator);
    PrijavaNaPraksu.findOne.mockResolvedValue(null);
    PrijavaNaPraksu.update.mockResolvedValue([0]);
    Izvjestaj.destroy.mockResolvedValue(0);
    setupTransaction();

    await deleteCoordinatorAccount(1);

    expect(PrijavaNaPraksu.update).toHaveBeenCalledWith(
      { koordinatorID: null },
      expect.objectContaining({ where: expect.objectContaining({ koordinatorID: 7 }) })
    );
    expect(koordinator.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('briše usera direktno kada nema koordinator zapisa', async () => {
    const user = { ...makeUser(), destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Koordinator.findOne.mockResolvedValue(null);
    setupTransaction();

    await deleteCoordinatorAccount(1);

    expect(user.destroy).toHaveBeenCalled();
  });
});

// ── getMyProfile + updateStudentProfile ────────────────────────────────────

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn().mockResolvedValue('$newHash'),
}));

const bcrypt = require('bcrypt');

const {
  getMyProfile,
  updateStudentProfile,
} = require('../../src/business/services/users.service');

describe('getMyProfile', () => {
  test('vraća profil korisnika', async () => {
    User.findByPk.mockResolvedValue(makeUser());
    const result = await getMyProfile(1);
    expect(result.email).toBe('firma@test.com');
  });

  test('baca 404 ako korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    const err = await getMyProfile(1).catch(e => e);
    expect(err.status).toBe(404);
  });
});

describe('updateStudentProfile', () => {
  function makeStudent(overrides = {}) {
    return {
      id: 1, ime: 'Ana', prezime: 'Anić', email: 'ana@test.com', role: 'STUDENT',
      passwordHash: '$old',
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: function () { return { id: this.id, ime: this.ime, prezime: this.prezime, email: this.email }; },
      ...overrides,
    };
  }

  test('baca 404 ako korisnik ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    const err = await updateStudentProfile(1, { ime: 'X' }).catch(e => e);
    expect(err.status).toBe(404);
  });

  test('baca 403 ako korisnik nije STUDENT', async () => {
    User.findByPk.mockResolvedValue(makeStudent({ role: 'COMPANY' }));
    const err = await updateStudentProfile(1, { ime: 'X' }).catch(e => e);
    expect(err.status).toBe(403);
  });

  test('baca 400 ako novi email je već zauzet', async () => {
    User.findByPk.mockResolvedValue(makeStudent({ email: 'old@test.com' }));
    User.findOne.mockResolvedValue({ id: 99, email: 'new@test.com' });
    const err = await updateStudentProfile(1, { email: 'new@test.com' }).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 ako newPassword bez currentPassword', async () => {
    User.findByPk.mockResolvedValue(makeStudent());
    const err = await updateStudentProfile(1, { newPassword: 'NovaLozinka1' }).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 ako currentPassword nije ispravna', async () => {
    User.findByPk.mockResolvedValue(makeStudent());
    bcrypt.compare.mockResolvedValue(false);
    const err = await updateStudentProfile(1, { newPassword: 'NovaLozinka1', currentPassword: 'wrong' }).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('baca 400 ako nova lozinka kraća od 8 znakova', async () => {
    User.findByPk.mockResolvedValue(makeStudent());
    bcrypt.compare.mockResolvedValue(true);
    const err = await updateStudentProfile(1, { newPassword: 'short', currentPassword: 'current' }).catch(e => e);
    expect(err.status).toBe(400);
  });

  test('uspješno ažurira ime i prezime', async () => {
    const user = makeStudent();
    User.findByPk.mockResolvedValue(user);
    User.findOne.mockResolvedValue(null);
    await updateStudentProfile(1, { ime: 'Novo', prezime: 'Novak' });
    expect(user.save).toHaveBeenCalled();
    expect(user.ime).toBe('Novo');
    expect(user.prezime).toBe('Novak');
  });

  test('uspješno ažurira lozinku', async () => {
    const user = makeStudent();
    User.findByPk.mockResolvedValue(user);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('$hashNew');
    await updateStudentProfile(1, { newPassword: 'NovaLozinka1', currentPassword: 'stara123' });
    expect(user.passwordHash).toBe('$hashNew');
    expect(user.save).toHaveBeenCalled();
  });

  test('uspješno mijenja email (ne zauzet)', async () => {
    const user = makeStudent({ email: 'old@test.com' });
    User.findByPk.mockResolvedValue(user);
    User.findOne.mockResolvedValue(null);
    await updateStudentProfile(1, { email: 'new@test.com' });
    expect(user.email).toBe('new@test.com');
    expect(user.save).toHaveBeenCalled();
  });
});
