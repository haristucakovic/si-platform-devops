'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findAll: jest.fn(), findByPk: jest.fn(), update: jest.fn() },
  Fakultet: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  Odsjek: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  Koordinator: { count: jest.fn(), findOne: jest.fn() },
  Student: { count: jest.fn(), findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Oglas: { findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  PrijavaNaPraksu: { findAll: jest.fn(), update: jest.fn(), destroy: jest.fn() },
  Praksa: { findOne: jest.fn() },
  Aktivnost: { destroy: jest.fn() },
  Prisustvo: { destroy: jest.fn() },
  Evaluacija: { destroy: jest.fn() },
  Ugovor: { destroy: jest.fn() },
  Izvjestaj: { destroy: jest.fn() },
  sequelize: { transaction: jest.fn() },
}));

const { User, Fakultet, Odsjek, Koordinator, Student, Kompanija, Oglas, PrijavaNaPraksu, Izvjestaj, sequelize } = require('../../src/infrastructure/database/models');
const {
  getUsers, updateUserRole, updateUserStatus, deleteUser,
  getFaculties, createFaculty, updateFaculty, deleteFaculty,
  getOdsjeci, createOdsjek, deleteOdsjek,
} = require('../../src/business/services/admin.service');

function makeDbUser(overrides = {}) {
  const base = {
    id: 1, ime: 'Haris', prezime: 'Husic',
    email: 'haris@test.com', role: 'STUDENT',
    status: 'PENDING', institution: 'FIT',
    emailVerifikovan: true,
    created_at: new Date('2025-01-01'),
  };
  return { ...base, ...overrides, save: jest.fn().mockResolvedValue(undefined) };
}

function makeFaculty(overrides = {}) {
  return {
    id: 1, naziv: 'FIT', email: 'fit@unsa.ba', adresa: 'Zmaja od Bosne',
    save: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function makeOdsjek(overrides = {}) {
  return {
    id: 1, naziv: 'Racunarstvo', fakultetID: 1,
    destroy: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── getUsers ──────────────────────────────────────────────────────────────────

describe('getUsers', () => {
  // Testira: servis mapira DB korisnika — spaja ime i prezime u name, uklanja raw kolone
  // Ulaz: User.findAll vraća korisnika s ime='Haris', prezime='Husic'
  // Očekivani izlaz: mapped objekat s name='Haris Husic', bez ime/prezime polja
  test('vraća mapiranu listu — ime+prezime spojeni u name', async () => {
    User.findAll.mockResolvedValue([makeDbUser()]);

    const result = await getUsers();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, name: 'Haris Husic', email: 'haris@test.com', role: 'STUDENT' });
    expect(result[0]).not.toHaveProperty('ime');
    expect(result[0]).not.toHaveProperty('prezime');
  });

  // Testira: servis prosljeđuje prazan where objekat kada status filter nije proslijeđen
  // Ulaz: poziv bez argumenata
  // Očekivani izlaz: User.findAll pozvan s where: {}
 test('bez filtera prosljeđuje prazan where objekat', async () => {
  User.findAll.mockResolvedValue([]);
  await getUsers();
  expect(User.findAll).toHaveBeenCalledWith(
    expect.objectContaining({ where: { approvalStatus: 'APPROVED' } })
  );
});
  // Testira: servis konvertuje status filter u uppercase prije slanja u bazu
  // Ulaz: status = 'pending' (lowercase)
  // Očekivani izlaz: User.findAll pozvan s where: { status: 'PENDING' }
  test('status filter se konvertuje u uppercase', async () => {
  User.findAll.mockResolvedValue([]);
  await getUsers('pending');
  expect(User.findAll).toHaveBeenCalledWith(
    expect.objectContaining({ where: { status: 'PENDING', approvalStatus: 'APPROVED' } })
  );
});
});

// ── updateUserRole ────────────────────────────────────────────────────────────

describe('updateUserRole', () => {
  // Testira: mapped rezultat sadrži name (spojeno ime+prezime) umjesto raw kolona
  // Ulaz: korisnik s ime='Ana', prezime='Kovač'
  // Očekivani izlaz: rezultat.name = 'Ana Kovač', nema ime/prezime polja
  test('rezultat sadrži name umjesto ime i prezime', async () => {
    const mockUser = makeDbUser({ ime: 'Ana', prezime: 'Kovač' });
    User.findByPk.mockResolvedValue(mockUser);

    const result = await updateUserRole(1, 'ADMIN');

    expect(result.name).toBe('Ana Kovač');
    expect(result).not.toHaveProperty('ime');
    expect(result).not.toHaveProperty('prezime');
  });

  // Testira: sve validne role (STUDENT, COMPANY, COORDINATOR, ADMIN) prolaze bez greške
  // Ulaz: id = 1, svaka od validnih rola iterativno
  // Očekivani izlaz: svaki poziv se uspješno razriješi s odgovarajućom rolom
  test('sve validne role prolaze bez greške', async () => {
    for (const role of ['STUDENT', 'COMPANY', 'COORDINATOR', 'ADMIN']) {
      User.findByPk.mockResolvedValue(makeDbUser());
      await expect(updateUserRole(1, role)).resolves.toMatchObject({ role });
    }
  });
});

// ── updateUserStatus ──────────────────────────────────────────────────────────

describe('updateUserStatus', () => {
  // Testira: svi validni statusi (PENDING, ACTIVE, DEACTIVATED) prolaze bez greške
  // Ulaz: id = 1, svaki od validnih statusa iterativno
  // Očekivani izlaz: svaki poziv se uspješno razriješi s odgovarajućim statusom
  test('svi validni statusi prolaze bez greške', async () => {
    for (const status of ['PENDING', 'ACTIVE', 'DEACTIVATED']) {
      User.findByPk.mockResolvedValue(makeDbUser());
      await expect(updateUserStatus(1, status)).resolves.toMatchObject({ status });
    }
  });

  test('ACTIVE status postavlja approval metapodatke za odobren korisnik', async () => {
    const mockUser = makeDbUser({
      status: 'PENDING',
      approvalStatus: 'PENDING_APPROVAL',
      rejectedAt: new Date('2025-01-01'),
      rejectedBy: 2,
      rejectionReason: 'Nije kompletno',
    });
    User.findByPk.mockResolvedValue(mockUser);

    await updateUserStatus(1, 'ACTIVE');

    expect(mockUser.approvalStatus).toBe('APPROVED');
    expect(mockUser.approvedAt).toBeInstanceOf(Date);
    expect(mockUser.rejectedAt).toBeNull();
    expect(mockUser.rejectedBy).toBeNull();
    expect(mockUser.rejectionReason).toBeNull();
  });

  test('DEACTIVATED status oznacava korisnika kao odbijenog', async () => {
    const mockUser = makeDbUser({ status: 'ACTIVE', approvalStatus: 'APPROVED' });
    User.findByPk.mockResolvedValue(mockUser);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(mockUser.approvalStatus).toBe('REJECTED');
    expect(mockUser.rejectedAt).toBeInstanceOf(Date);
  });

  test('PENDING status vraca zahtjev na cekanje odobrenja', async () => {
    const mockUser = makeDbUser({ status: 'ACTIVE', approvalStatus: 'APPROVED' });
    User.findByPk.mockResolvedValue(mockUser);

    await updateUserStatus(1, 'PENDING');

    expect(mockUser.approvalStatus).toBe('PENDING_APPROVAL');
    expect(mockUser.approvalRequestedAt).toBeInstanceOf(Date);
  });

  test('deaktivacija studenta otkazuje sve aktivne prijave', async () => {
    const mockUser = makeDbUser({ role: 'STUDENT', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Student.findOne.mockResolvedValue({ id: 5 });
    PrijavaNaPraksu.update.mockResolvedValue([2]);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(PrijavaNaPraksu.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ODUSTAO' }),
      expect.objectContaining({ where: expect.objectContaining({ studentID: 5 }) })
    );
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija studenta bez Student zapisa ne poziva PrijavaNaPraksu.update', async () => {
    const mockUser = makeDbUser({ role: 'STUDENT', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Student.findOne.mockResolvedValue(null);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(PrijavaNaPraksu.update).not.toHaveBeenCalled();
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija kompanije zatvara sve aktivne oglase', async () => {
    const mockUser = makeDbUser({ role: 'COMPANY', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Kompanija.findOne.mockResolvedValue({ id: 10 });
    Oglas.update.mockResolvedValue([3]);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(Oglas.update).toHaveBeenCalledWith(
      { status: 'ZATVOREN' },
      expect.objectContaining({ where: expect.objectContaining({ kompanijaID: 10, status: 'AKTIVAN' }) })
    );
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija kompanije bez Kompanija zapisa ne poziva Oglas.update', async () => {
    const mockUser = makeDbUser({ role: 'COMPANY', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Kompanija.findOne.mockResolvedValue(null);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(Oglas.update).not.toHaveBeenCalled();
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija koordinatora uklanja ga sa pending prijava', async () => {
    const mockUser = makeDbUser({ role: 'COORDINATOR', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Koordinator.findOne.mockResolvedValue({ id: 7 });
    PrijavaNaPraksu.update.mockResolvedValue([1]);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(PrijavaNaPraksu.update).toHaveBeenCalledWith(
      { koordinatorID: null },
      expect.objectContaining({ where: expect.objectContaining({ koordinatorID: 7 }) })
    );
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija koordinatora bez Koordinator zapisa ne poziva PrijavaNaPraksu.update', async () => {
    const mockUser = makeDbUser({ role: 'COORDINATOR', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);
    Koordinator.findOne.mockResolvedValue(null);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(PrijavaNaPraksu.update).not.toHaveBeenCalled();
    expect(mockUser.status).toBe('DEACTIVATED');
  });

  test('deaktivacija ADMIN korisnika ne poziva cleanup', async () => {
    const mockUser = makeDbUser({ role: 'ADMIN', status: 'ACTIVE' });
    User.findByPk.mockResolvedValue(mockUser);

    await updateUserStatus(1, 'DEACTIVATED');

    expect(Student.findOne).not.toHaveBeenCalled();
    expect(Kompanija.findOne).not.toHaveBeenCalled();
    expect(Koordinator.findOne).not.toHaveBeenCalled();
    expect(mockUser.status).toBe('DEACTIVATED');
  });
});

// ── getFaculties ──────────────────────────────────────────────────────────────

describe('getFaculties', () => {
  // Testira: servis vraća listu fakulteta i sortira po nazivu ASC
  // Ulaz: Fakultet.findAll vraća dva fakulteta
  // Očekivani izlaz: ista lista, findAll pozvan s order: [['naziv', 'ASC']]
  test('vraća listu fakulteta sortiranu po nazivu ASC', async () => {
    const mockFaculties = [makeFaculty({ naziv: 'FIT' }), makeFaculty({ id: 2, naziv: 'PMF' })];
    Fakultet.findAll.mockResolvedValue(mockFaculties);

    const result = await getFaculties();

    expect(result).toEqual(mockFaculties);
    expect(Fakultet.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['naziv', 'ASC']] })
    );
  });

  // Testira: servis vraća prazan niz kada baza nema fakulteta
  // Ulaz: Fakultet.findAll vraća []
  // Očekivani izlaz: []
  test('vraća prazan niz ako nema fakulteta', async () => {
    Fakultet.findAll.mockResolvedValue([]);
    expect(await getFaculties()).toEqual([]);
  });
});

// ── createFaculty ─────────────────────────────────────────────────────────────

describe('createFaculty', () => {
  // Testira: servis kreira fakultet u bazi s ispravnim podacima i vraća novi objekat
  // Ulaz: { naziv: 'FIT', email: 'fit@unsa.ba', adresa: 'Zmaja od Bosne' }
  // Očekivani izlaz: vraćen novi fakultet, Fakultet.create pozvan s ispravnim argumentima
  test('uspješno kreira fakultet i vraća novi objekat', async () => {
    const created = makeFaculty();
    Fakultet.create.mockResolvedValue(created);

    const result = await createFaculty({ naziv: 'FIT', email: 'fit@unsa.ba', adresa: 'Zmaja od Bosne' });

    expect(result).toBe(created);
    expect(Fakultet.create).toHaveBeenCalledWith({
      naziv: 'FIT',
      email: 'fit@unsa.ba',
      adresa: 'Zmaja od Bosne',
    });
  });

  // Testira: servis trimuje whitespace s naziva prije kreiranja
  // Ulaz: { naziv: '  FIT  ' } (naziv s razmacima)
  // Očekivani izlaz: Fakultet.create pozvan s naziv = 'FIT' (bez razmaka)
  test('trimuje naziv prije kreiranja', async () => {
    Fakultet.create.mockResolvedValue(makeFaculty());

    await createFaculty({ naziv: '  FIT  ' });

    expect(Fakultet.create).toHaveBeenCalledWith(
      expect.objectContaining({ naziv: 'FIT' })
    );
  });

  // Testira: servis baca 400 grešku kada naziv nije proslijeđen
  // Ulaz: { email: 'fit@unsa.ba' } bez naziv polja
  // Očekivani izlaz: odbačena Promise s err.status = 400, Fakultet.create nije pozvan
  test('baca 400 ako naziv nije proslijeđen', async () => {
    await expect(createFaculty({ email: 'fit@unsa.ba' })).rejects.toMatchObject({ status: 400 });
    expect(Fakultet.create).not.toHaveBeenCalled();
  });

  // Testira: servis baca 400 grešku kada je naziv prazan string (samo whitespace)
  // Ulaz: { naziv: '   ' } (samo razmaci)
  // Očekivani izlaz: odbačena Promise s err.status = 400, Fakultet.create nije pozvan
  test('baca 400 ako je naziv prazan string', async () => {
    await expect(createFaculty({ naziv: '   ' })).rejects.toMatchObject({ status: 400 });
    expect(Fakultet.create).not.toHaveBeenCalled();
  });

  // Testira: servis postavlja email i adresu na null kada nisu proslijeđeni
  // Ulaz: { naziv: 'FIT' } bez email i adresa
  // Očekivani izlaz: Fakultet.create pozvan s { naziv: 'FIT', email: null, adresa: null }
  test('email i adresa se postavljaju na null ako nisu proslijeđeni', async () => {
    Fakultet.create.mockResolvedValue(makeFaculty());

    await createFaculty({ naziv: 'FIT' });

    expect(Fakultet.create).toHaveBeenCalledWith({ naziv: 'FIT', email: null, adresa: null });
  });
});

// ── updateFaculty ─────────────────────────────────────────────────────────────

describe('updateFaculty', () => {
  // Testira: servis ažurira naziv fakulteta i vraća ažurirani objekat
  // Ulaz: id = 1, { naziv: 'Novi naziv' }, fakultet pronađen u bazi
  // Očekivani izlaz: faculty.naziv = 'Novi naziv', save() pozvan jednom, vraćen isti objekat
  test('uspješno ažurira naziv i vraća faculty', async () => {
    const mockFaculty = makeFaculty({ naziv: 'Stari naziv' });
    Fakultet.findByPk.mockResolvedValue(mockFaculty);

    const result = await updateFaculty(1, { naziv: 'Novi naziv' });

    expect(mockFaculty.naziv).toBe('Novi naziv');
    expect(mockFaculty.save).toHaveBeenCalledTimes(1);
    expect(result).toBe(mockFaculty);
  });

  // Testira: servis trimuje whitespace s naziva pri ažuriranju
  // Ulaz: id = 1, { naziv: '  FIT Sarajevo  ' }
  // Očekivani izlaz: faculty.naziv = 'FIT Sarajevo' (bez razmaka)
  test('trimuje naziv pri ažuriranju', async () => {
    const mockFaculty = makeFaculty();
    Fakultet.findByPk.mockResolvedValue(mockFaculty);

    await updateFaculty(1, { naziv: '  FIT Sarajevo  ' });

    expect(mockFaculty.naziv).toBe('FIT Sarajevo');
  });

  // Testira: servis baca 404 grešku kada fakultet s datim id-em ne postoji
  // Ulaz: id = 999, Fakultet.findByPk vraća null
  // Očekivani izlaz: odbačena Promise s err.status = 404
  test('baca 404 ako fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);
    await expect(updateFaculty(999, { naziv: 'Test' })).rejects.toMatchObject({ status: 404 });
  });

  // Testira: servis ne mijenja polja koja nisu proslijeđena u update objektu (parcijalni update)
  // Ulaz: id = 1, samo { naziv: 'FIT Updated' }, email i adresa nisu proslijeđeni
  // Očekivani izlaz: email i adresa ostaju nepromijenjeni
  test('ne mijenja polja koja nisu proslijeđena', async () => {
    const mockFaculty = makeFaculty({ naziv: 'FIT', email: 'fit@unsa.ba', adresa: 'Zmaja' });
    Fakultet.findByPk.mockResolvedValue(mockFaculty);

    await updateFaculty(1, { naziv: 'FIT Updated' });

    expect(mockFaculty.email).toBe('fit@unsa.ba');
    expect(mockFaculty.adresa).toBe('Zmaja');
  });

  // Testira: servis postavlja email na null kada je proslijeđen prazan string
  // Ulaz: id = 1, { email: '' } (prazan string)
  // Očekivani izlaz: faculty.email = null
  test('postavlja email na null ako je proslijeđen prazan string', async () => {
    const mockFaculty = makeFaculty({ email: 'fit@unsa.ba' });
    Fakultet.findByPk.mockResolvedValue(mockFaculty);

    await updateFaculty(1, { email: '' });

    expect(mockFaculty.email).toBeNull();
  });
});

// ── deleteFaculty ─────────────────────────────────────────────────────────────

describe('deleteFaculty', () => {
  // Testira: servis uspješno briše fakultet koji nema vezanih koordinatora i studenata
  // Ulaz: id = 1, Koordinator.count = 0, Student.count = 0
  // Očekivani izlaz: resolves undefined, destroy() pozvan jednom
  test('uspješno briše fakultet bez vezanih koordinatora i studenata', async () => {
    const mockFaculty = makeFaculty();
    Fakultet.findByPk.mockResolvedValue(mockFaculty);
    Koordinator.count.mockResolvedValue(0);
    Student.count.mockResolvedValue(0);

    await expect(deleteFaculty(1)).resolves.toBeUndefined();

    expect(mockFaculty.destroy).toHaveBeenCalledTimes(1);
  });

  // Testira: servis baca 404 grešku kada fakultet s datim id-em ne postoji
  // Ulaz: id = 999, Fakultet.findByPk vraća null
  // Očekivani izlaz: odbačena Promise s err.status = 404
  test('baca 404 ako fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);
    await expect(deleteFaculty(999)).rejects.toMatchObject({ status: 404 });
  });

  // Testira: servis baca 409 grešku kada fakultet ima vezane koordinatore
  // Ulaz: id = 1, Koordinator.count vraća 2
  // Očekivani izlaz: odbačena Promise s err.status = 409, Student.count nije ni pozvan
  test('baca 409 ako ima vezanih koordinatora', async () => {
    Fakultet.findByPk.mockResolvedValue(makeFaculty());
    Koordinator.count.mockResolvedValue(2);

    await expect(deleteFaculty(1)).rejects.toMatchObject({ status: 409 });
    expect(Student.count).not.toHaveBeenCalled();
  });

  // Testira: servis baca 409 grešku kada fakultet ima vezane studente (bez koordinatora)
  // Ulaz: id = 1, Koordinator.count = 0, Student.count vraća 5
  // Očekivani izlaz: odbačena Promise s err.status = 409
  test('baca 409 ako ima vezanih studenata (nema koordinatora)', async () => {
    Fakultet.findByPk.mockResolvedValue(makeFaculty());
    Koordinator.count.mockResolvedValue(0);
    Student.count.mockResolvedValue(5);

    await expect(deleteFaculty(1)).rejects.toMatchObject({ status: 409 });
  });

  // Testira: provjera koordinatora se vrši prije provjere studenata
  // Ulaz: id = 1, Koordinator.count vraća 1
  // Očekivani izlaz: greška o koordinatorima bačena, Student.count nikad nije pozvan
  test('koordinatori se provjeravaju PRIJE studenata', async () => {
    Fakultet.findByPk.mockResolvedValue(makeFaculty());
    Koordinator.count.mockResolvedValue(1);

    await expect(deleteFaculty(1)).rejects.toThrow(/coordinator/i);
    expect(Student.count).not.toHaveBeenCalled();
  });
});

describe('getOdsjeci', () => {
  test('vraca odsjeke za postojeci fakultet sortirane po nazivu ASC', async () => {
    const odsjeci = [makeOdsjek(), makeOdsjek({ id: 2, naziv: 'Softversko inzenjerstvo' })];
    Fakultet.findByPk.mockResolvedValue(makeFaculty());
    Odsjek.findAll.mockResolvedValue(odsjeci);

    const result = await getOdsjeci(1);

    expect(result).toBe(odsjeci);
    expect(Odsjek.findAll).toHaveBeenCalledWith({
      where: { fakultetID: 1 },
      order: [['naziv', 'ASC']],
    });
  });

  test('baca 404 ako fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);

    await expect(getOdsjeci(999)).rejects.toMatchObject({ status: 404 });
    expect(Odsjek.findAll).not.toHaveBeenCalled();
  });
});

describe('createOdsjek', () => {
  test('kreira odsjek za postojeci fakultet i trimuje naziv', async () => {
    const created = makeOdsjek({ naziv: 'Softversko inzenjerstvo' });
    Fakultet.findByPk.mockResolvedValue(makeFaculty());
    Odsjek.create.mockResolvedValue(created);

    const result = await createOdsjek(1, '  Softversko inzenjerstvo  ');

    expect(result).toBe(created);
    expect(Odsjek.create).toHaveBeenCalledWith({
      naziv: 'Softversko inzenjerstvo',
      fakultetID: 1,
    });
  });

  test('baca 400 ako naziv nije proslijedjen', async () => {
    await expect(createOdsjek(1, '   ')).rejects.toMatchObject({ status: 400 });
    expect(Fakultet.findByPk).not.toHaveBeenCalled();
    expect(Odsjek.create).not.toHaveBeenCalled();
  });

  test('baca 404 ako fakultet ne postoji', async () => {
    Fakultet.findByPk.mockResolvedValue(null);

    await expect(createOdsjek(999, 'Racunarstvo')).rejects.toMatchObject({ status: 404 });
    expect(Odsjek.create).not.toHaveBeenCalled();
  });
});

describe('deleteOdsjek', () => {
  test('brise postojeci odsjek', async () => {
    const odsjek = makeOdsjek();
    Odsjek.findByPk.mockResolvedValue(odsjek);

    await expect(deleteOdsjek(1)).resolves.toBeUndefined();

    expect(odsjek.destroy).toHaveBeenCalledTimes(1);
  });

  test('baca 404 ako odsjek ne postoji', async () => {
    Odsjek.findByPk.mockResolvedValue(null);

    await expect(deleteOdsjek(999)).rejects.toMatchObject({ status: 404 });
  });
});

// ── deleteUser ─────────────────────────────────────────────────────────────

describe('deleteUser', () => {
  function setupTransaction() {
    sequelize.transaction.mockImplementation(async (cb) => cb({}));
  }

  function makeDbUserWithDestroy(overrides = {}) {
    return { id: 1, role: 'STUDENT', destroy: jest.fn().mockResolvedValue(undefined), ...overrides };
  }

  test('baca 404 ako user ne postoji', async () => {
    User.findByPk.mockResolvedValue(null);
    await expect(deleteUser(999)).rejects.toMatchObject({ status: 404 });
  });

  test('STUDENT — briše studenta, prijave i usera', async () => {
    const user = makeDbUserWithDestroy({ role: 'STUDENT' });
    const student = { id: 10, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(student);
    PrijavaNaPraksu.findAll.mockResolvedValue([]);
    PrijavaNaPraksu.destroy.mockResolvedValue(1);
    setupTransaction();

    await deleteUser(1);

    expect(student.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('STUDENT — bez student zapisa briše samo usera', async () => {
    const user = makeDbUserWithDestroy({ role: 'STUDENT' });
    User.findByPk.mockResolvedValue(user);
    Student.findOne.mockResolvedValue(null);
    setupTransaction();

    await deleteUser(1);

    expect(user.destroy).toHaveBeenCalled();
  });

  test('COMPANY — briše kompaniju, oglase i usera', async () => {
    const user = makeDbUserWithDestroy({ role: 'COMPANY' });
    const kompanija = { id: 5, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Kompanija.findOne.mockResolvedValue(kompanija);
    Oglas.findAll.mockResolvedValue([]);
    Oglas.destroy.mockResolvedValue(1);
    setupTransaction();

    await deleteUser(1);

    expect(kompanija.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('COORDINATOR — nulluje koordinatorID na prijavama i briše koordinatora i usera', async () => {
    const user = makeDbUserWithDestroy({ role: 'COORDINATOR' });
    const koordinator = { id: 7, destroy: jest.fn().mockResolvedValue(undefined) };
    User.findByPk.mockResolvedValue(user);
    Koordinator.findOne.mockResolvedValue(koordinator);
    PrijavaNaPraksu.update.mockResolvedValue([0]);
    Izvjestaj.destroy.mockResolvedValue(0);
    setupTransaction();

    await deleteUser(1);

    expect(PrijavaNaPraksu.update).toHaveBeenCalledWith(
      { koordinatorID: null },
      expect.objectContaining({ where: expect.objectContaining({ koordinatorID: 7 }) })
    );
    expect(koordinator.destroy).toHaveBeenCalled();
    expect(user.destroy).toHaveBeenCalled();
  });

  test('ADMIN — nulluje approvedBy/rejectedBy reference i briše usera', async () => {
    const user = makeDbUserWithDestroy({ role: 'ADMIN' });
    User.findByPk.mockResolvedValue(user);
    User.update.mockResolvedValue([0]);
    setupTransaction();

    await deleteUser(1);

    expect(User.update).toHaveBeenCalledWith(
      { approvedBy: null },
      expect.objectContaining({ where: { approvedBy: 1 } })
    );
    expect(user.destroy).toHaveBeenCalled();
  });
});
