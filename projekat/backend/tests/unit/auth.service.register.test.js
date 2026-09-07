'use strict';

process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findOne: jest.fn(), create: jest.fn() },
  Fakultet: { findByPk: jest.fn() },
  Odsjek: {},
  Student: { create: jest.fn() },
  Koordinator: { create: jest.fn() },
  Kompanija: { create: jest.fn() },
}));
jest.mock('../../src/infrastructure/database/db', () => ({ transaction: jest.fn() }));
jest.mock('../../src/business/services/email.service', () => ({
  sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$hashed'),
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken');

const { User, Fakultet, Student, Koordinator, Kompanija } =
  require('../../src/infrastructure/database/models');
const db = require('../../src/infrastructure/database/db');
const { sendEmailVerificationEmail } = require('../../src/business/services/email.service');
const { UniqueConstraintError } = require('sequelize');
const { register } = require('../../src/business/services/auth.service');

beforeEach(() => jest.clearAllMocks());

function makeCreatedUser(overrides = {}) {
  return {
    id: 1,
    email: 'test@test.com',
    emailVerificationToken: null,
    emailVerificationTokenExpiresAt: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function setupUserAvailable() {
  User.findOne
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null);
}

const baseStudent = {
  role: 'STUDENT',
  username: 'student1',
  email: 'student@test.com',
  password: 'password123',
  ime: 'Alen',
  prezime: 'Alic',
  fakultetID: 1,
  year_of_study: 2,
  index_number: '20/001',
  odsjekID: null,
};

const baseCoordinator = {
  role: 'COORDINATOR',
  username: 'coord1',
  email: 'coord@test.com',
  password: 'password123',
  ime: 'Koordinator',
  prezime: 'Jedan',
  fakultetID: 1,
  odsjekID: null,
};

const baseCompany = {
  role: 'COMPANY',
  username: 'company1',
  email: 'company@test.com',
  password: 'password123',
  naziv: 'Firma d.o.o.',
  adresa: 'Ulica 1',
  telefon: null,
  opisPoslovanja: null,
  kontaktOsoba: null,
};

// ── Validacija ulaza ─────────────────────────────────────────────────────────

describe('register — validacija', () => {
  test('baca 400 za neispravan email format', async () => {
    await expect(register({ ...baseStudent, email: 'not-an-email' }))
      .rejects.toMatchObject({ status: 400, message: 'Email adresa nije ispravnog formata.' });
  });

  test('baca 400 za kratku lozinku (manje od 8 karaktera)', async () => {
    await expect(register({ ...baseStudent, password: 'abc' }))
      .rejects.toMatchObject({ status: 400, message: 'Lozinka mora imati najmanje 8 karaktera.' });
  });

  test('baca 409 ako je korisničko ime zauzeto', async () => {
    User.findOne.mockResolvedValueOnce({ id: 99 }); // username taken
    await expect(register(baseStudent))
      .rejects.toMatchObject({ status: 409, message: 'Korisničko ime je već zauzeto.' });
  });

  test('baca 409 ako je email već registrovan', async () => {
    User.findOne
      .mockResolvedValueOnce(null)      // username free
      .mockResolvedValueOnce({ id: 99 }); // email taken
    await expect(register(baseStudent))
      .rejects.toMatchObject({ status: 409, message: 'Email adresa je već registrovana.' });
  });
});

// ── STUDENT ──────────────────────────────────────────────────────────────────

describe('register — STUDENT', () => {
  test('baca 400 za nevažeću godinu studija', async () => {
    setupUserAvailable();
    await expect(register({ ...baseStudent, year_of_study: 0 }))
      .rejects.toMatchObject({ status: 400, message: 'Godina studija mora biti pozitivan cijeli broj.' });
  });

  test('baca 404 ako fakultet nije pronađen', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue(null);
    await expect(register(baseStudent))
      .rejects.toMatchObject({ status: 404, message: 'Odabrani fakultet nije pronađen.' });
  });

  test('uspješno registruje studenta — token i email', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue({ id: 1, naziv: 'Elektrotehnički fakultet' });
    const createdUser = makeCreatedUser({ email: baseStudent.email });
    db.transaction.mockImplementation(fn => fn({}));
    User.create.mockResolvedValue(createdUser);
    Student.create.mockResolvedValue({});

    const result = await register(baseStudent);

    expect(result).toBe(createdUser);
    expect(createdUser.save).toHaveBeenCalled();
    expect(createdUser.emailVerificationToken).toBeTruthy();
    expect(sendEmailVerificationEmail).toHaveBeenCalledWith(
      baseStudent.email,
      expect.stringContaining('/verify-email?token='),
    );
  });
});

// ── COORDINATOR ──────────────────────────────────────────────────────────────

describe('register — COORDINATOR', () => {
  test('baca 404 ako fakultet nije pronađen', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue(null);
    await expect(register(baseCoordinator))
      .rejects.toMatchObject({ status: 404, message: 'Odabrani fakultet nije pronađen.' });
  });

  test('uspješno registruje koordinatora — token i email', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue({ id: 1, naziv: 'Fakultet' });
    const createdUser = makeCreatedUser({ email: baseCoordinator.email });
    db.transaction.mockImplementation(fn => fn({}));
    User.create.mockResolvedValue(createdUser);
    Koordinator.create.mockResolvedValue({});

    const result = await register(baseCoordinator);

    expect(result).toBe(createdUser);
    expect(createdUser.save).toHaveBeenCalled();
    expect(sendEmailVerificationEmail).toHaveBeenCalledWith(
      baseCoordinator.email,
      expect.stringContaining('/verify-email?token='),
    );
  });
});

// ── COMPANY ──────────────────────────────────────────────────────────────────

describe('register — COMPANY', () => {
  test('uspješno registruje kompaniju — token i email', async () => {
    setupUserAvailable();
    const createdUser = makeCreatedUser({ email: baseCompany.email });
    db.transaction.mockImplementation(fn => fn({}));
    User.create.mockResolvedValue(createdUser);
    Kompanija.create.mockResolvedValue({});

    const result = await register(baseCompany);

    expect(result).toBe(createdUser);
    expect(createdUser.save).toHaveBeenCalled();
    expect(sendEmailVerificationEmail).toHaveBeenCalledWith(
      baseCompany.email,
      expect.stringContaining('/verify-email?token='),
    );
  });
});

// ── Nepoznata rola ────────────────────────────────────────────────────────────

describe('register — nepoznata rola', () => {
  test('baca 400 za nepoznatu rolu', async () => {
    setupUserAvailable();
    await expect(register({ ...baseStudent, role: 'ADMIN' }))
      .rejects.toMatchObject({ status: 400, message: 'Nepoznata rola.' });
  });
});

// ── UniqueConstraintError ─────────────────────────────────────────────────────

describe('register — UniqueConstraintError', () => {
  test('pretvara UniqueConstraintError na email u 409', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue({ id: 1, naziv: 'Fakultet' });
    const ucErr = new UniqueConstraintError({ errors: [{ path: 'email' }] });
    db.transaction.mockRejectedValue(ucErr);

    await expect(register(baseStudent))
      .rejects.toMatchObject({ status: 409, message: 'Email adresa je već registrovana.' });
  });

  test('pretvara UniqueConstraintError na username u 409', async () => {
    setupUserAvailable();
    Fakultet.findByPk.mockResolvedValue({ id: 1, naziv: 'Fakultet' });
    const ucErr = new UniqueConstraintError({ errors: [{ path: 'username' }] });
    db.transaction.mockRejectedValue(ucErr);

    await expect(register(baseStudent))
      .rejects.toMatchObject({ status: 409, message: 'Korisničko ime je već zauzeto.' });
  });
});
