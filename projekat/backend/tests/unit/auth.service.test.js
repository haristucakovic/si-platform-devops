'use strict';

process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

jest.mock('../../src/infrastructure/database/models', () => ({
  User: { findOne: jest.fn() },
  Fakultet: { findAll: jest.fn() },
  Odsjek: { findAll: jest.fn() },
  Student: {},
  Koordinator: {},
  Kompanija: {},
}));
jest.mock('../../src/infrastructure/database/db', () => ({ transaction: jest.fn() }));
jest.mock('../../src/business/services/email.service', () => ({
  sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  sendEmailVerificationEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const { User, Fakultet, Odsjek } = require('../../src/infrastructure/database/models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../../src/business/services/email.service');
const {
  loginService,
  checkAvailability,
  getPublicFaculties,
  getPublicOdsjeci,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  resendVerificationEmailService,
} = require('../../src/business/services/auth.service');
const { sendEmailVerificationEmail } = require('../../src/business/services/email.service');

function makeUser(overrides = {}) {
  return {
    id: 1, ime: 'Haris', prezime: 'Husic',
    username: 'haris', email: 'haris@test.com',
    role: 'STUDENT', status: 'ACTIVE',
    passwordHash: '$2b$10$hashedpassword',
    institution: null,
    emailVerifikovan: true,
    approvalStatus: 'APPROVED',
    passwordResetToken: null,
    passwordResetExpires: null,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

// ── loginService ──────────────────────────────────────────────────────────────

describe('loginService', () => {
  // Testira: servis baca grešku kada korisnik s datim identifikatorom ne postoji u bazi
  // Ulaz: identifier = 'nepostoji@test.com', password = 'pass', User.findOne vraća null
  // Očekivani izlaz: odbačena Promise s porukom o pogrešnim kredencijalima
  test('baca grešku ako korisnik ne postoji', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(loginService('nepostoji@test.com', 'pass'))
      .rejects.toThrow('Pogrešno korisničko ime/e-mail ili lozinka.');
  });

  // Testira: servis baca grešku kada je nalog korisnika deaktiviran, bez provjere passworda
  // Ulaz: korisnik s status = 'DEACTIVATED'
  // Očekivani izlaz: odbačena Promise s porukom o deaktiviranom nalogu
  test('baca grešku ako je nalog DEACTIVATED', async () => {
    User.findOne.mockResolvedValue(makeUser({ status: 'DEACTIVATED' }));
    await expect(loginService('haris@test.com', 'pass'))
      .rejects.toThrow('Vaš nalog je deaktiviran. Kontaktirajte administratora.');
  });

  // Testira: servis baca grešku kada nalog čeka na odobrenje administratora
  // Ulaz: korisnik s status = 'PENDING'
  // Očekivani izlaz: odbačena Promise s porukom o neaktivnom nalogu
  test('baca grešku ako je nalog PENDING', async () => {
    User.findOne.mockResolvedValue(makeUser({ status: 'PENDING' }));
    await expect(loginService('haris@test.com', 'pass'))
      .rejects.toThrow('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.');
  });

  // Testira: servis baca grešku kada lozinka ne odgovara hash-u u bazi
  // Ulaz: korisnik s status = 'ACTIVE', bcrypt.compare vraća false
  // Očekivani izlaz: odbačena Promise s porukom o pogrešnim kredencijalima
  test('baca grešku ako password ne odgovara', async () => {
    User.findOne.mockResolvedValue(makeUser());
    bcrypt.compare.mockResolvedValue(false);
    await expect(loginService('haris@test.com', 'wrongpass'))
      .rejects.toThrow('Pogrešno korisničko ime/e-mail ili lozinka.');
  });

  // Testira: servis vraća JWT token i user objekat bez passwordHash pri uspješnoj prijavi
  // Ulaz: aktivan korisnik, bcrypt.compare vraća true, jwt.sign vraća 'mocked.jwt.token'
  // Očekivani izlaz: { token: 'mocked.jwt.token', user: { id, role, email, ... } } bez passwordHash
  test('vraća token i user objekt bez passwordHash', async () => {
    User.findOne.mockResolvedValue(makeUser());
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked.jwt.token');

    const result = await loginService('haris@test.com', 'correctpass');

    expect(result).toHaveProperty('token', 'mocked.jwt.token');
    expect(result.user).toMatchObject({ id: 1, role: 'STUDENT', email: 'haris@test.com' });
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  // Testira: jwt.sign se poziva s ispravnim payload-om koji sadrži id i role korisnika
  // Ulaz: korisnik s id = 42, role = 'ADMIN', uspješna autentikacija
  // Očekivani izlaz: jwt.sign pozvan s payload { id: 42, role: 'ADMIN' } i ispravnim secretom
  test('JWT se potpisuje s id i role iz korisničkog objekta', async () => {
    User.findOne.mockResolvedValue(makeUser({ id: 42, role: 'ADMIN' }));
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked.jwt.token');

    await loginService('haris@test.com', 'correctpass');

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: 42, role: 'ADMIN' },
      'test-secret',
      expect.objectContaining({ expiresIn: expect.anything() })
    );
  });

  // Testira: provjera statusa DEACTIVATED se vrši prije bcrypt provjere passworda
  // Ulaz: korisnik s status = 'DEACTIVATED'
  // Očekivani izlaz: greška bačena, bcrypt.compare nikad nije pozvan
  test('DEACTIVATED se provjerava PRIJE bcrypt provjere passworda', async () => {
    User.findOne.mockResolvedValue(makeUser({ status: 'DEACTIVATED' }));
    await expect(loginService('haris@test.com', 'anypass')).rejects.toThrow();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  // Testira: provjera statusa PENDING se vrši prije bcrypt provjere passworda
  // Ulaz: korisnik s status = 'PENDING'
  // Očekivani izlaz: greška bačena, bcrypt.compare nikad nije pozvan
  test('PENDING se provjerava PRIJE bcrypt provjere passworda', async () => {
    User.findOne.mockResolvedValue(makeUser({ status: 'PENDING' }));
    await expect(loginService('haris@test.com', 'anypass')).rejects.toThrow();
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });
});

// ── checkAvailability ─────────────────────────────────────────────────────────

describe('checkAvailability', () => {
  // Testira: servis vraća available: true kada username nije zauzet u bazi
  // Ulaz: type = 'username', value = 'slobodan', User.findOne vraća null
  // Očekivani izlaz: { available: true }
  test('vraća { available: true } ako username nije zauzet', async () => {
    User.findOne.mockResolvedValue(null);
    const result = await checkAvailability('username', 'slobodan');
    expect(result).toEqual({ available: true });
  });

  // Testira: servis vraća available: false kada username već postoji u bazi
  // Ulaz: type = 'username', value = 'haris', User.findOne vraća korisnika
  // Očekivani izlaz: { available: false }
  test('vraća { available: false } ako je username zauzet', async () => {
    User.findOne.mockResolvedValue(makeUser());
    const result = await checkAvailability('username', 'haris');
    expect(result).toEqual({ available: false });
  });

  // Testira: servis vraća available: true kada email nije zauzet u bazi
  // Ulaz: type = 'email', value = 'novi@test.com', User.findOne vraća null
  // Očekivani izlaz: { available: true }
  test('vraća { available: true } ako email nije zauzet', async () => {
    User.findOne.mockResolvedValue(null);
    const result = await checkAvailability('email', 'novi@test.com');
    expect(result).toEqual({ available: true });
  });

  // Testira: servis vraća available: false kada email već postoji u bazi
  // Ulaz: type = 'email', value = 'haris@test.com', User.findOne vraća korisnika
  // Očekivani izlaz: { available: false }
  test('vraća { available: false } ako je email zauzet', async () => {
    User.findOne.mockResolvedValue(makeUser());
    const result = await checkAvailability('email', 'haris@test.com');
    expect(result).toEqual({ available: false });
  });

  // Testira: servis baca 400 grešku za nevažeći type parametar
  // Ulaz: type = 'phone' (nije 'username' niti 'email'), value = '123'
  // Očekivani izlaz: odbačena Promise s err.status = 400, User.findOne nije pozvan
  test('baca 400 za nevažeći type', async () => {
    await expect(checkAvailability('phone', '123')).rejects.toMatchObject({ status: 400 });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  // Testira: servis baca 400 grešku kada value nije proslijeđen (prazan string)
  // Ulaz: type = 'username', value = '' (falsy vrijednost)
  // Očekivani izlaz: odbačena Promise s err.status = 400, User.findOne nije pozvan
  test('baca 400 ako value nije proslijeđen', async () => {
    await expect(checkAvailability('username', '')).rejects.toMatchObject({ status: 400 });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  // Testira: servis pretražuje bazu po username koloni kada je type = 'username'
  // Ulaz: type = 'username', value = 'haris'
  // Očekivani izlaz: User.findOne pozvan s where: { username: 'haris' }
  test('pretražuje po username koloni kada je type "username"', async () => {
    User.findOne.mockResolvedValue(null);
    await checkAvailability('username', 'haris');
    expect(User.findOne).toHaveBeenCalledWith({ where: { username: 'haris' } });
  });

  // Testira: servis pretražuje bazu po email koloni kada je type = 'email'
  // Ulaz: type = 'email', value = 'haris@test.com'
  // Očekivani izlaz: User.findOne pozvan s where: { email: 'haris@test.com' }
  test('pretražuje po email koloni kada je type "email"', async () => {
    User.findOne.mockResolvedValue(null);
    await checkAvailability('email', 'haris@test.com');
    expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'haris@test.com' } });
  });
});

// ── getPublicFaculties ────────────────────────────────────────────────────────

describe('getPublicFaculties', () => {
  // Testira: servis vraća listu fakulteta i prosljeđuje ORDER BY naziv ASC u upit
  // Ulaz: Fakultet.findAll vraća dva fakulteta
  // Očekivani izlaz: ista lista fakulteta, findAll pozvan s order: [['naziv', 'ASC']]
  test('vraća listu fakulteta sortiranu po nazivu', async () => {
    const mockFaculties = [{ id: 1, naziv: 'FIT' }, { id: 2, naziv: 'PMF' }];
    Fakultet.findAll.mockResolvedValue(mockFaculties);

    const result = await getPublicFaculties();

    expect(result).toEqual(mockFaculties);
    expect(Fakultet.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['naziv', 'ASC']] })
    );
  });

  // Testira: servis traži samo id i naziv atribute od baze
  // Ulaz: poziv bez argumenata
  // Očekivani izlaz: findAll pozvan s attributes: ['id', 'naziv']
  test('vraća samo id i naziv atribute', async () => {
    Fakultet.findAll.mockResolvedValue([]);

    await getPublicFaculties();

    expect(Fakultet.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ attributes: ['id', 'naziv'] })
    );
  });

  // Testira: servis vraća prazan niz kada u bazi nema fakulteta
  // Ulaz: Fakultet.findAll vraća []
  // Očekivani izlaz: []
  test('vraća prazan niz ako nema fakulteta', async () => {
    Fakultet.findAll.mockResolvedValue([]);
    const result = await getPublicFaculties();
    expect(result).toEqual([]);
  });
});

describe('getPublicOdsjeci', () => {
  test('vraca odsjeke za dati fakultet sortirane po nazivu', async () => {
    const odsjeci = [{ id: 1, naziv: 'Racunarstvo' }];
    Odsjek.findAll.mockResolvedValue(odsjeci);

    const result = await getPublicOdsjeci(1);

    expect(result).toEqual(odsjeci);
    expect(Odsjek.findAll).toHaveBeenCalledWith({
      where: { fakultetID: 1 },
      attributes: ['id', 'naziv'],
      order: [['naziv', 'ASC']],
    });
  });

  test('vraca prazan niz ako fakultet nema odsjeka', async () => {
    Odsjek.findAll.mockResolvedValue([]);

    const result = await getPublicOdsjeci(1);

    expect(result).toEqual([]);
  });
});

// ── forgotPasswordService ─────────────────────────────────────────────────────

describe('forgotPasswordService', () => {
  // Testira: servis tiho vraća undefined ako email ne postoji — sprječava user enumeration
  // Ulaz: email = 'nepostoji@test.com', User.findOne vraća null
  // Očekivani izlaz: resolves undefined, sendPasswordResetEmail nije pozvan
  test('tiho vraća undefined ako korisnik ne postoji — nema user enumeration', async () => {
    User.findOne.mockResolvedValue(null);

    await expect(forgotPasswordService('nepostoji@test.com')).resolves.toBeUndefined();
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  // Testira: servis generiše reset token i postavlja expiry na korisniku
  // Ulaz: email pronađen u bazi, User.findOne vraća korisnika sa save()
  // Očekivani izlaz: user.passwordResetToken je 64-znakovna hex vrijednost, passwordResetExpires je Date u budućnosti
  test('postavlja passwordResetToken i passwordResetExpires na korisniku', async () => {
    const mockUser = makeUser();
    User.findOne.mockResolvedValue(mockUser);

    await forgotPasswordService('haris@test.com');

    expect(mockUser.passwordResetToken).toMatch(/^[a-f0-9]{64}$/);
    expect(mockUser.passwordResetExpires).toBeInstanceOf(Date);
    expect(mockUser.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
  });

  // Testira: expiry za reset token je postavljen na tačno 1 sat od trenutka poziva
  // Ulaz: pronađen korisnik u bazi
  // Očekivani izlaz: passwordResetExpires je između 59 i 61 minute od sada
  test('expiry je otprilike 1 sat od sada', async () => {
    const mockUser = makeUser();
    User.findOne.mockResolvedValue(mockUser);
    const before = Date.now();

    await forgotPasswordService('haris@test.com');

    const diff = mockUser.passwordResetExpires.getTime() - before;
    expect(diff).toBeGreaterThan(59 * 60 * 1000);
    expect(diff).toBeLessThan(61 * 60 * 1000);
  });

  // Testira: servis poziva save() na korisniku kako bi token bio perzistiran u bazi
  // Ulaz: pronađen korisnik u bazi
  // Očekivani izlaz: user.save() pozvan tačno jednom
  test('poziva save() na korisniku', async () => {
    const mockUser = makeUser();
    User.findOne.mockResolvedValue(mockUser);

    await forgotPasswordService('haris@test.com');

    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });

  // Testira: servis šalje email na ispravnu adresu s linkom koji sadrži generisani token
  // Ulaz: korisnik s email = 'haris@test.com', FRONTEND_URL = 'http://localhost:5173'
  // Očekivani izlaz: sendPasswordResetEmail pozvan s (email, link koji sadrži token i FRONTEND_URL)
  test('šalje email s reset linkom koji sadrži token', async () => {
    const mockUser = makeUser({ email: 'haris@test.com' });
    User.findOne.mockResolvedValue(mockUser);

    await forgotPasswordService('haris@test.com');

    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const [toArg, linkArg] = sendPasswordResetEmail.mock.calls[0];
    expect(toArg).toBe('haris@test.com');
    expect(linkArg).toContain(mockUser.passwordResetToken);
    expect(linkArg).toContain('http://localhost:5173');
  });
});

// ── resetPasswordService ──────────────────────────────────────────────────────

describe('resetPasswordService', () => {
  // Testira: servis baca grešku kada token ne odgovara nijednom korisniku u bazi
  // Ulaz: token = 'invalidtoken', User.findOne vraća null
  // Očekivani izlaz: odbačena Promise s porukom 'Neispravan token.'
  test('baca grešku za neispravan token', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(resetPasswordService('invalidtoken', 'NewPass123'))
      .rejects.toThrow('Neispravan token.');
  });

  // Testira: servis baca grešku kada je token pronađen ali mu je istekao rok važenja
  // Ulaz: korisnik s passwordResetExpires = 1 sekunda u prošlosti
  // Očekivani izlaz: odbačena Promise s porukom 'Token je istekao.'
  test('baca grešku ako je token istekao', async () => {
    const expiredUser = makeUser({
      passwordResetToken: 'expiredtoken',
      passwordResetExpires: new Date(Date.now() - 1000),
    });
    User.findOne.mockResolvedValue(expiredUser);

    await expect(resetPasswordService('expiredtoken', 'NewPass123'))
      .rejects.toThrow('Token je istekao.');
  });

  // Testira: servis baca grešku kada passwordResetExpires nije uopće postavljen
  // Ulaz: korisnik s passwordResetToken postavljenim ali passwordResetExpires = null
  // Očekivani izlaz: odbačena Promise s porukom 'Token je istekao.'
  test('baca grešku ako passwordResetExpires nije postavljen', async () => {
    const userNoExpiry = makeUser({
      passwordResetToken: 'sometoken',
      passwordResetExpires: null,
    });
    User.findOne.mockResolvedValue(userNoExpiry);

    await expect(resetPasswordService('sometoken', 'NewPass123'))
      .rejects.toThrow('Token je istekao.');
  });

  // Testira: servis uspješno mijenja lozinku, čisti token i poziva save()
  // Ulaz: validan token, passwordResetExpires 1 sat u budućnosti, nova lozinka 'NewPass123'
  // Očekivani izlaz: passwordHash ažuriran, passwordResetToken = null, passwordResetExpires = null, save() pozvan jednom
  test('uspješno resetuje lozinku — hash, čišćenje tokena, save', async () => {
    const mockUser = makeUser({
      passwordResetToken: 'validtoken',
      passwordResetExpires: new Date(Date.now() + 3600000),
    });
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.hash.mockResolvedValue('$2b$10$newhash');

    await resetPasswordService('validtoken', 'NewPass123');

    expect(bcrypt.hash).toHaveBeenCalledWith('NewPass123', 10);
    expect(mockUser.passwordHash).toBe('$2b$10$newhash');
    expect(mockUser.passwordResetToken).toBeNull();
    expect(mockUser.passwordResetExpires).toBeNull();
    expect(mockUser.save).toHaveBeenCalledTimes(1);
  });
});

// ── loginService — approvalStatus i emailVerifikovan ─────────────────────────

describe('loginService — approvalStatus i emailVerifikovan provjere', () => {
  test('baca grešku ako je approvalStatus PENDING_APPROVAL', async () => {
    User.findOne.mockResolvedValue(makeUser({ role: 'STUDENT', approvalStatus: 'PENDING_APPROVAL' }));
    await expect(loginService('haris', 'Password1')).rejects.toThrow('čeka odobrenje');
  });

  test('baca grešku ako je approvalStatus REJECTED', async () => {
    User.findOne.mockResolvedValue(makeUser({ role: 'STUDENT', approvalStatus: 'REJECTED', rejectionReason: 'Nevalidni podaci' }));
    await expect(loginService('haris', 'Password1')).rejects.toThrow('odbijen');
  });

  test('baca grešku ako je approvalStatus nepoznat (nije APPROVED)', async () => {
    User.findOne.mockResolvedValue(makeUser({ role: 'STUDENT', approvalStatus: 'UNKNOWN' }));
    await expect(loginService('haris', 'Password1')).rejects.toThrow('nije odobren');
  });

  test('baca EMAIL_NOT_VERIFIED ako email nije verifikovan', async () => {
    User.findOne.mockResolvedValue(makeUser({ emailVerifikovan: false }));
    bcrypt.compare.mockResolvedValue(true);
    await expect(loginService('haris', 'Password1')).rejects.toThrow('EMAIL_NOT_VERIFIED');
  });
});

// ── verifyEmailService ────────────────────────────────────────────────────────

describe('verifyEmailService', () => {
  test('baca 400 ako token ne postoji u bazi', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(verifyEmailService('badtoken')).rejects.toMatchObject({ status: 400 });
  });

  test('baca 400 ako je token istekao', async () => {
    User.findOne.mockResolvedValue(makeUser({
      emailVerificationToken: 'tok',
      emailVerificationTokenExpiresAt: new Date(Date.now() - 1000),
    }));
    await expect(verifyEmailService('tok')).rejects.toMatchObject({ status: 400 });
  });

  test('postavlja emailVerifikovan na true uz validan token', async () => {
    const user = makeUser({
      emailVerificationToken: 'validtok',
      emailVerificationTokenExpiresAt: new Date(Date.now() + 60000),
    });
    User.findOne.mockResolvedValue(user);
    await verifyEmailService('validtok');
    expect(user.emailVerifikovan).toBe(true);
    expect(user.emailVerificationToken).toBeNull();
    expect(user.save).toHaveBeenCalled();
  });
});

// ── resendVerificationEmailService ────────────────────────────────────────────

describe('resendVerificationEmailService', () => {
  test('tiho vraća ako user ne postoji', async () => {
    User.findOne.mockResolvedValue(null);
    await expect(resendVerificationEmailService('ghost@test.com')).resolves.toBeUndefined();
    expect(sendEmailVerificationEmail).not.toHaveBeenCalled();
  });

  test('tiho vraća ako je email već verifikovan', async () => {
    User.findOne.mockResolvedValue(makeUser({ emailVerifikovan: true }));
    await expect(resendVerificationEmailService('haris@test.com')).resolves.toBeUndefined();
    expect(sendEmailVerificationEmail).not.toHaveBeenCalled();
  });

  test('šalje verifikacioni email ako user postoji i nije verifikovan', async () => {
    const user = makeUser({ emailVerifikovan: false, emailVerificationToken: null });
    User.findOne.mockResolvedValue(user);
    await resendVerificationEmailService('haris@test.com');
    expect(user.emailVerificationToken).not.toBeNull();
    expect(user.save).toHaveBeenCalled();
    expect(sendEmailVerificationEmail).toHaveBeenCalled();
  });
});
