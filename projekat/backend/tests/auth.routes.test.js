'use strict';

const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/business/services/auth.service');
const authService = require('../src/business/services/auth.service');

beforeEach(() => jest.clearAllMocks());

// ── GET /api/auth/faculties ───────────────────────────────────────────────────

describe('GET /api/auth/faculties', () => {
  // Testira: endpoint vraća listu fakulteta iz servisa
  // Ulaz: GET /api/auth/faculties, getPublicFaculties vraća dva fakulteta
  // Očekivani izlaz: HTTP 200, niz s dva objekta, prvi ima id=1 i naziv='FIT'
  test('200 — vraća listu fakulteta', async () => {
    authService.getPublicFaculties.mockResolvedValue([
      { id: 1, naziv: 'FIT' },
      { id: 2, naziv: 'PMF' },
    ]);

    const res = await request(app).get('/api/auth/faculties');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toMatchObject({ id: 1, naziv: 'FIT' });
  });

  // Testira: endpoint vraća prazan niz kada nema registrovanih fakulteta
  // Ulaz: GET /api/auth/faculties, getPublicFaculties vraća []
  // Očekivani izlaz: HTTP 200, body = []
  test('200 — vraća prazan niz ako nema fakulteta', async () => {
    authService.getPublicFaculties.mockResolvedValue([]);

    const res = await request(app).get('/api/auth/faculties');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Testira: endpoint vraća 500 kada servis baci neočekivanu grešku
  // Ulaz: GET /api/auth/faculties, getPublicFaculties baca Error('DB error')
  // Očekivani izlaz: HTTP 500
  test('500 — greška servera', async () => {
    authService.getPublicFaculties.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/auth/faculties');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/auth/faculties/:id/odsjeci', () => {
  test('200 - vraca listu odsjeka za fakultet', async () => {
    authService.getPublicOdsjeci.mockResolvedValue([
      { id: 1, naziv: 'Racunarstvo' },
      { id: 2, naziv: 'Softversko inzenjerstvo' },
    ]);

    const res = await request(app).get('/api/auth/faculties/1/odsjeci');

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(authService.getPublicOdsjeci).toHaveBeenCalledWith(1);
  });

  test('404 - servisna greska se prosljedjuje', async () => {
    const err = new Error('Faculty not found.');
    err.status = 404;
    authService.getPublicOdsjeci.mockRejectedValue(err);

    const res = await request(app).get('/api/auth/faculties/999/odsjeci');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Faculty not found.');
  });
});

// ── GET /api/auth/check ───────────────────────────────────────────────────────

describe('GET /api/auth/check', () => {
  // Testira: endpoint vraća available=true kada username nije zauzet
  // Ulaz: GET /api/auth/check?type=username&value=slobodan, servis vraća { available: true }
  // Očekivani izlaz: HTTP 200, body = { available: true }
  test('200 — username je dostupan', async () => {
    authService.checkAvailability.mockResolvedValue({ available: true });

    const res = await request(app).get('/api/auth/check?type=username&value=slobodan');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ available: true });
  });

  // Testira: endpoint vraća available=false kada email već postoji u bazi
  // Ulaz: GET /api/auth/check?type=email&value=zauzet@test.com, servis vraća { available: false }
  // Očekivani izlaz: HTTP 200, body = { available: false }
  test('200 — email je zauzet', async () => {
    authService.checkAvailability.mockResolvedValue({ available: false });

    const res = await request(app).get('/api/auth/check?type=email&value=zauzet@test.com');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ available: false });
  });

  // Testira: endpoint vraća 400 kada type parametar nije validan (nije username ni email)
  // Ulaz: GET /api/auth/check?type=phone&value=123, servis baca grešku sa status=400
  // Očekivani izlaz: HTTP 400, body ima message polje
  test('400 — nevažeći type parametar', async () => {
    const err = new Error('Neispravni parametri.');
    err.status = 400;
    authService.checkAvailability.mockRejectedValue(err);

    const res = await request(app).get('/api/auth/check?type=phone&value=123');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: endpoint vraća 500 kada servis baci neočekivanu grešku bez status polja
  // Ulaz: GET /api/auth/check?type=username&value=test, servis baca Error('DB crash')
  // Očekivani izlaz: HTTP 500
  test('500 — neočekivana greška servera', async () => {
    authService.checkAvailability.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get('/api/auth/check?type=username&value=test');

    expect(res.status).toBe(500);
  });
});

// ── POST /api/auth/register ───────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  const studentPayload = {
    role: 'STUDENT', username: 'haris', email: 'haris@test.com',
    password: 'Test@1234', ime: 'Haris', prezime: 'Husic',
    fakultetID: 1, year_of_study: 2, index_number: '19001',
  };

  // Testira: endpoint uspješno registruje korisnika i vraća potvrdu
  // Ulaz: POST /api/auth/register s validnim STUDENT payload-om, servis vraća {}
  // Očekivani izlaz: HTTP 201, body ima message polje
  test('201 — uspješna registracija', async () => {
    authService.register.mockResolvedValue({});

    const res = await request(app).post('/api/auth/register').send(studentPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: endpoint vraća 400 za neispravan format email adrese
  // Ulaz: POST /api/auth/register s email='nevalidan-email', servis baca grešku sa status=400
  // Očekivani izlaz: HTTP 400, message sadrži "email"
  test('400 — nevažeći format emaila', async () => {
    const err = new Error('Email adresa nije ispravnog formata.');
    err.status = 400;
    authService.register.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...studentPayload, email: 'nevalidan-email' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });

  // Testira: endpoint vraća 400 kada je lozinka prekratka (manje od 8 karaktera)
  // Ulaz: POST /api/auth/register s password='123', servis baca grešku sa status=400
  // Očekivani izlaz: HTTP 400, message sadrži "lozinka"
  test('400 — lozinka prekratka', async () => {
    const err = new Error('Lozinka mora imati najmanje 8 karaktera.');
    err.status = 400;
    authService.register.mockRejectedValue(err);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...studentPayload, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lozinka/i);
  });

  // Testira: endpoint vraća 409 kada korisničko ime već postoji u sistemu
  // Ulaz: POST /api/auth/register s username koji je već zauzet, servis baca grešku sa status=409
  // Očekivani izlaz: HTTP 409, message sadrži "korisničko ime"
  test('409 — username je već zauzet', async () => {
    const err = new Error('Korisničko ime je već zauzeto.');
    err.status = 409;
    authService.register.mockRejectedValue(err);

    const res = await request(app).post('/api/auth/register').send(studentPayload);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/korisničko ime/i);
  });

  // Testira: endpoint vraća 409 kada email adresa već postoji u sistemu
  // Ulaz: POST /api/auth/register s emailom koji je već registrovan, servis baca grešku sa status=409
  // Očekivani izlaz: HTTP 409, message sadrži "email"
  test('409 — email je već registrovan', async () => {
    const err = new Error('Email adresa je već registrovana.');
    err.status = 409;
    authService.register.mockRejectedValue(err);

    const res = await request(app).post('/api/auth/register').send(studentPayload);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/email/i);
  });

  // Testira: endpoint vraća 404 kada odabrani fakultet ne postoji u bazi
  // Ulaz: POST /api/auth/register s nepostojećim fakultetID, servis baca grešku sa status=404
  // Očekivani izlaz: HTTP 404, message sadrži "fakultet"
  test('404 — fakultet ne postoji', async () => {
    const err = new Error('Odabrani fakultet nije pronađen.');
    err.status = 404;
    authService.register.mockRejectedValue(err);

    const res = await request(app).post('/api/auth/register').send(studentPayload);

    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/fakultet/i);
  });

  // Testira: endpoint vraća 500 kada servis baci neočekivanu grešku bez status polja
  // Ulaz: POST /api/auth/register s validnim payload-om, servis baca Error('DB crash')
  // Očekivani izlaz: HTTP 500
  test('500 — neočekivana greška servera', async () => {
    authService.register.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).post('/api/auth/register').send(studentPayload);

    expect(res.status).toBe(500);
  });
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  // Testira: endpoint vraća JWT token i user podatke pri uspješnom loginu
  // Ulaz: POST /api/auth/login s ispravnim identifier i password, servis vraća token i user objekat
  // Očekivani izlaz: HTTP 200, body ima token i user bez passwordHash polja
  test('200 — uspješan login vraća token i user podatke', async () => {
    authService.loginService.mockResolvedValue({
      token: 'fake.jwt.token',
      user: { id: 1, username: 'haris', email: 'haris@test.com', role: 'STUDENT', institution: null },
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'haris@test.com', password: 'Test@1234' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'fake.jwt.token');
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });

  // Testira: endpoint vraća 400 bez pozivanja servisa kada identifier nije proslijeđen
  // Ulaz: POST /api/auth/login s body { password: 'Test@1234' } (bez identifier)
  // Očekivani izlaz: HTTP 400, loginService nije pozvan
  test('400 — nedostaje identifier', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'Test@1234' });
    expect(res.status).toBe(400);
    expect(authService.loginService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 400 kada je identifier prazan string (samo razmaci)
  // Ulaz: POST /api/auth/login s body { identifier: '   ', password: 'Test@1234' }
  // Očekivani izlaz: HTTP 400, loginService nije pozvan
  test('400 — identifier je prazan string', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '   ', password: 'Test@1234' });
    expect(res.status).toBe(400);
    expect(authService.loginService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 400 bez pozivanja servisa kada password nije proslijeđen
  // Ulaz: POST /api/auth/login s body { identifier: 'haris@test.com' } (bez password)
  // Očekivani izlaz: HTTP 400, loginService nije pozvan
  test('400 — nedostaje password', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: 'haris@test.com' });
    expect(res.status).toBe(400);
    expect(authService.loginService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 401 kada servis baci grešku zbog pogrešnih kredencijala
  // Ulaz: POST /api/auth/login s pogrešnim password-om, servis baca grešku
  // Očekivani izlaz: HTTP 401
  test('401 — pogrešne kredencijale', async () => {
    authService.loginService.mockRejectedValue(new Error('Pogrešno korisničko ime/e-mail ili lozinka.'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'haris@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
  });

  // Testira: endpoint vraća 401 s porukom o neaktivnom nalogu za PENDING korisnike
  // Ulaz: POST /api/auth/login za korisnika sa status=PENDING, servis baca grešku o neaktivnom nalogu
  // Očekivani izlaz: HTTP 401, message sadrži "aktivan"
  test('401 — nalog je PENDING', async () => {
    authService.loginService.mockRejectedValue(new Error('Vaš nalog još nije aktivan. Sačekajte odobrenje administratora.'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'haris@test.com', password: 'Test@1234' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/aktivan/i);
  });

  // Testira: endpoint vraća 401 s porukom o deaktiviranom nalogu za DEACTIVATED korisnike
  // Ulaz: POST /api/auth/login za korisnika sa status=DEACTIVATED, servis baca grešku o deaktiviranom nalogu
  // Očekivani izlaz: HTTP 401, message sadrži "deaktiviran"
  test('401 — nalog je DEACTIVATED', async () => {
    authService.loginService.mockRejectedValue(new Error('Vaš nalog je deaktiviran. Kontaktirajte administratora.'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'haris@test.com', password: 'Test@1234' });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/deaktiviran/i);
  });

  // Testira: endpoint vraća 500 kada servis baci neočekivanu grešku bez status polja
  // Ulaz: POST /api/auth/login s validnim kredencijalima, servis baca Error('Unexpected crash')
  // Očekivani izlaz: HTTP 500
  test('500 — neočekivana greška servera', async () => {
    authService.loginService.mockRejectedValue(new Error('Unexpected crash'));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'haris@test.com', password: 'Test@1234' });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  // Testira: endpoint vraća generičku poruku bez otkrivanja postoji li korisnik
  // Ulaz: POST /api/auth/forgot-password s validnim email-om, servis vraća undefined
  // Očekivani izlaz: HTTP 200, body ima message polje
  test('200 — uvijek vraća generičku poruku (postoji li korisnik ili ne)', async () => {
    authService.forgotPasswordService.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'haris@test.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: endpoint vraća identičnu poruku bez obzira postoji li korisnik u sistemu
  // Ulaz: dva poziva s različitim email adresama (jedna postoji, jedna ne), obje vraćaju undefined
  // Očekivani izlaz: oba odgovora imaju jednaku message vrijednost
  test('200 — ista poruka čak i kad korisnik ne postoji', async () => {
    authService.forgotPasswordService.mockResolvedValue(undefined);

    const res1 = await request(app).post('/api/auth/forgot-password').send({ email: 'postoji@test.com' });
    const res2 = await request(app).post('/api/auth/forgot-password').send({ email: 'nepostoji@test.com' });

    expect(res1.body.message).toBe(res2.body.message);
  });

  // Testira: endpoint vraća 400 bez pozivanja servisa kada email nije proslijeđen
  // Ulaz: POST /api/auth/forgot-password s praznim body-em {}
  // Očekivani izlaz: HTTP 400, forgotPasswordService nije pozvan
  test('400 — nedostaje email', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({});

    expect(res.status).toBe(400);
    expect(authService.forgotPasswordService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 400 kada je email prazan string (samo razmaci)
  // Ulaz: POST /api/auth/forgot-password s body { email: '   ' }
  // Očekivani izlaz: HTTP 400, forgotPasswordService nije pozvan
  test('400 — email je prazan string', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: '   ' });

    expect(res.status).toBe(400);
    expect(authService.forgotPasswordService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 500 kada email servis baci grešku pri slanju
  // Ulaz: POST /api/auth/forgot-password s validnim emailom, servis baca Error('SMTP error')
  // Očekivani izlaz: HTTP 500
  test('500 — greška email servisa', async () => {
    authService.forgotPasswordService.mockRejectedValue(new Error('SMTP error'));

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'haris@test.com' });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/auth/reset-password ────────────────────────────────────────────

describe('POST /api/auth/reset-password', () => {
  // Testira: endpoint uspješno resetuje lozinku uz validan token i novu lozinku
  // Ulaz: POST /api/auth/reset-password s validnim token i password, servis vraća undefined
  // Očekivani izlaz: HTTP 200, body ima message polje
  test('200 — uspješan reset lozinke', async () => {
    authService.resetPasswordService.mockResolvedValue(undefined);

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken123', password: 'NewPass123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // Testira: endpoint vraća 400 bez pozivanja servisa kada token nije proslijeđen
  // Ulaz: POST /api/auth/reset-password s body { password: 'NewPass123' } (bez token)
  // Očekivani izlaz: HTTP 400, resetPasswordService nije pozvan
  test('400 — nedostaje token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ password: 'NewPass123' });

    expect(res.status).toBe(400);
    expect(authService.resetPasswordService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 400 bez pozivanja servisa kada je nova lozinka kraća od 8 karaktera
  // Ulaz: POST /api/auth/reset-password s body { token: 'validtoken123', password: '123' }
  // Očekivani izlaz: HTTP 400, resetPasswordService nije pozvan
  test('400 — lozinka kraća od 8 karaktera', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken123', password: '123' });

    expect(res.status).toBe(400);
    expect(authService.resetPasswordService).not.toHaveBeenCalled();
  });

  // Testira: endpoint vraća 400 kada servis prepozna da token nije validan
  // Ulaz: POST /api/auth/reset-password s neispravnim tokenom, servis baca Error('Neispravan token.')
  // Očekivani izlaz: HTTP 400, message = 'Neispravan token.'
  test('400 — neispravan token (service baca očekivanu grešku)', async () => {
    authService.resetPasswordService.mockRejectedValue(new Error('Neispravan token.'));

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'wrongtoken', password: 'NewPass123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Neispravan token.');
  });

  // Testira: endpoint vraća 400 kada servis prepozna da je token istekao
  // Ulaz: POST /api/auth/reset-password s isteklim tokenom, servis baca Error('Token je istekao.')
  // Očekivani izlaz: HTTP 400, message = 'Token je istekao.'
  test('400 — istekao token (service baca očekivanu grešku)', async () => {
    authService.resetPasswordService.mockRejectedValue(new Error('Token je istekao.'));

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'expiredtoken', password: 'NewPass123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Token je istekao.');
  });

  // Testira: endpoint vraća 500 kada servis baci neočekivanu grešku bez status polja
  // Ulaz: POST /api/auth/reset-password s validnim podacima, servis baca Error('DB crash')
  // Očekivani izlaz: HTTP 500
  test('500 — neočekivana greška servera', async () => {
    authService.resetPasswordService.mockRejectedValue(new Error('DB crash'));

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'validtoken123', password: 'NewPass123' });

    expect(res.status).toBe(500);
  });
});

// ── POST /api/auth/login — EMAIL_NOT_VERIFIED ─────────────────────────────────

describe('POST /api/auth/login — EMAIL_NOT_VERIFIED', () => {
  test('403 — email nije verifikovan', async () => {
    authService.loginService.mockRejectedValue(new Error('EMAIL_NOT_VERIFIED'));
    const res = await request(app).post('/api/auth/login').send({ identifier: 'user@test.com', password: 'pass1234' });
    expect(res.status).toBe(403);
    expect(res.body.message).toBe('EMAIL_NOT_VERIFIED');
  });
});

// ── GET /api/auth/verify-email ────────────────────────────────────────────────

describe('GET /api/auth/verify-email', () => {
  test('400 — nedostaje token', async () => {
    const res = await request(app).get('/api/auth/verify-email');
    expect(res.status).toBe(400);
  });

  test('200 — uspješna verifikacija emaila', async () => {
    authService.verifyEmailService.mockResolvedValue(undefined);
    const res = await request(app).get('/api/auth/verify-email?token=validtoken');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('verifikovan');
  });

  test('400 — neispravan token', async () => {
    const err = Object.assign(new Error('Neispravan verifikacioni token.'), { status: 400 });
    authService.verifyEmailService.mockRejectedValue(err);
    const res = await request(app).get('/api/auth/verify-email?token=bad');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Neispravan verifikacioni token.');
  });
});

// ── POST /api/auth/resend-verification-email ──────────────────────────────────

describe('POST /api/auth/resend-verification-email', () => {
  test('400 — nedostaje email u body', async () => {
    const res = await request(app).post('/api/auth/resend-verification-email').send({});
    expect(res.status).toBe(400);
  });

  test('200 — email uspješno poslan', async () => {
    authService.resendVerificationEmailService.mockResolvedValue(undefined);
    const res = await request(app)
      .post('/api/auth/resend-verification-email')
      .send({ email: 'user@test.com' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
