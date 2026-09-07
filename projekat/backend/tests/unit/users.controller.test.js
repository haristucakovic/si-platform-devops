'use strict';

const request = require('supertest');

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => { req.user = { id: 1, role: 'COMPANY' }; next(); },
}));
jest.mock('../../src/middleware/rbac.middleware', () => ({
  authorize: () => (_req, _res, next) => next(),
}));
jest.mock('../../src/business/services/users.service');

const app = require('../../src/app');
const usersService = require('../../src/business/services/users.service');

beforeEach(() => jest.clearAllMocks());

function err(message, status, code) {
  return Object.assign(new Error(message), { status, code });
}

// ── GET /api/users/company-profile ─────────────────────────────────────────

describe('GET /api/users/company-profile', () => {
  test('200 — vraća profil kompanije', async () => {
    usersService.getCompanyProfile.mockResolvedValue({ naziv: 'Firma', adresa: 'Ul. 1' });
    const res = await request(app).get('/api/users/company-profile');
    expect(res.status).toBe(200);
    expect(res.body.naziv).toBe('Firma');
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.getCompanyProfile.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).get('/api/users/company-profile');
    expect(res.status).toBe(404);
  });
});

// ── PATCH /api/users/company-profile ───────────────────────────────────────

describe('PATCH /api/users/company-profile', () => {
  test('200 — uspješno ažurira profil', async () => {
    usersService.updateCompanyProfile.mockResolvedValue({ naziv: 'Nova Firma', adresa: 'Nova ul.' });
    const res = await request(app).patch('/api/users/company-profile').send({ naziv: 'Nova Firma', adresa: 'Nova ul.' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.profile.naziv).toBe('Nova Firma');
  });

  test('400 — validacijska greška servisa', async () => {
    usersService.updateCompanyProfile.mockRejectedValue(err('Naziv kompanije je obavezan.', 400));
    const res = await request(app).patch('/api/users/company-profile').send({});
    expect(res.status).toBe(400);
  });
});

// ── GET /api/users/deactivation-check ──────────────────────────────────────

describe('GET /api/users/deactivation-check', () => {
  test('200 — vraća status deaktivacije', async () => {
    usersService.checkDeactivation.mockResolvedValue({ canDeactivate: true, pendingApplications: [] });
    const res = await request(app).get('/api/users/deactivation-check');
    expect(res.status).toBe(200);
    expect(res.body.canDeactivate).toBe(true);
  });

  test('500 — neočekivana greška', async () => {
    usersService.checkDeactivation.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/users/deactivation-check');
    expect(res.status).toBe(500);
  });
});

// ── POST /api/users/deactivate ──────────────────────────────────────────────

describe('POST /api/users/deactivate', () => {
  test('200 — uspješno deaktivira nalog', async () => {
    usersService.deactivateMyAccount.mockResolvedValue(undefined);
    const res = await request(app).post('/api/users/deactivate');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('deaktiviran');
  });

  test('409 — odobrena praksa blokira deaktivaciju', async () => {
    usersService.deactivateMyAccount.mockRejectedValue(err('Imate odobrenu praksu.', 409, 'ODOBRENA_EXISTS'));
    const res = await request(app).post('/api/users/deactivate');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ODOBRENA_EXISTS');
  });
});

// ── GET /api/users/company-deactivation-check ───────────────────────────────

describe('GET /api/users/company-deactivation-check', () => {
  test('200 — vraća status deaktivacije kompanije', async () => {
    usersService.checkCompanyDeactivation.mockResolvedValue({ canDeactivate: true, oglasiToClose: [] });
    const res = await request(app).get('/api/users/company-deactivation-check');
    expect(res.status).toBe(200);
    expect(res.body.canDeactivate).toBe(true);
  });

  test('200 — canDeactivate false jer postoje aktivni oglasi s prijavama', async () => {
    usersService.checkCompanyDeactivation.mockResolvedValue({
      canDeactivate: false,
      reason: 'AKTIVAN_SA_PRIJAVAMA',
      oglasi: ['Oglas 1'],
    });
    const res = await request(app).get('/api/users/company-deactivation-check');
    expect(res.status).toBe(200);
    expect(res.body.canDeactivate).toBe(false);
    expect(res.body.reason).toBe('AKTIVAN_SA_PRIJAVAMA');
  });

  test('404 — kompanija nije pronađena', async () => {
    usersService.checkCompanyDeactivation.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).get('/api/users/company-deactivation-check');
    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška', async () => {
    usersService.checkCompanyDeactivation.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/users/company-deactivation-check');
    expect(res.status).toBe(500);
  });
});

// ── POST /api/users/company-deactivate ─────────────────────────────────────

describe('POST /api/users/company-deactivate', () => {
  test('200 — uspješno deaktivira kompaniju', async () => {
    usersService.deactivateCompanyAccount.mockResolvedValue(undefined);
    const res = await request(app).post('/api/users/company-deactivate');
    expect(res.status).toBe(200);
  });

  test('409 — aktivan oglas blokira deaktivaciju', async () => {
    usersService.deactivateCompanyAccount.mockRejectedValue(err('Imate aktivne oglase.', 409, 'AKTIVAN_SA_PRIJAVAMA'));
    const res = await request(app).post('/api/users/company-deactivate');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('AKTIVAN_SA_PRIJAVAMA');
  });

  test('400 — nalog je već deaktiviran', async () => {
    usersService.deactivateCompanyAccount.mockRejectedValue(err('Nalog je već deaktiviran.', 400));
    const res = await request(app).post('/api/users/company-deactivate');
    expect(res.status).toBe(400);
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.deactivateCompanyAccount.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).post('/api/users/company-deactivate');
    expect(res.status).toBe(404);
  });
});

// ── GET /api/users/coordinator-deactivation-check ───────────────────────────

describe('GET /api/users/coordinator-deactivation-check', () => {
  test('200 — vraća status deaktivacije koordinatora', async () => {
    usersService.checkCoordinatorDeactivation.mockResolvedValue({ canDeactivate: true, pendingCount: 0 });
    const res = await request(app).get('/api/users/coordinator-deactivation-check');
    expect(res.status).toBe(200);
    expect(res.body.pendingCount).toBe(0);
  });

  test('200 — canDeactivate false jer postoje odobrene prakse', async () => {
    usersService.checkCoordinatorDeactivation.mockResolvedValue({
      canDeactivate: false,
      reason: 'ODOBRENA_EXISTS',
      studenti: ['Ana Anić'],
    });
    const res = await request(app).get('/api/users/coordinator-deactivation-check');
    expect(res.status).toBe(200);
    expect(res.body.canDeactivate).toBe(false);
    expect(res.body.reason).toBe('ODOBRENA_EXISTS');
  });

  test('404 — koordinator nije pronađen', async () => {
    usersService.checkCoordinatorDeactivation.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).get('/api/users/coordinator-deactivation-check');
    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška', async () => {
    usersService.checkCoordinatorDeactivation.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/users/coordinator-deactivation-check');
    expect(res.status).toBe(500);
  });
});

// ── POST /api/users/coordinator-deactivate ─────────────────────────────────

describe('POST /api/users/coordinator-deactivate', () => {
  test('200 — uspješno deaktivira koordinatora', async () => {
    usersService.deactivateCoordinatorAccount.mockResolvedValue(undefined);
    const res = await request(app).post('/api/users/coordinator-deactivate');
    expect(res.status).toBe(200);
  });

  test('409 — koordinator ima odobrenu praksu u toku', async () => {
    usersService.deactivateCoordinatorAccount.mockRejectedValue(err('Koordinator ima odobrenu praksu.', 409, 'ODOBRENA_EXISTS'));
    const res = await request(app).post('/api/users/coordinator-deactivate');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ODOBRENA_EXISTS');
  });

  test('400 — nalog je već deaktiviran', async () => {
    usersService.deactivateCoordinatorAccount.mockRejectedValue(err('Nalog je već deaktiviran.', 400));
    const res = await request(app).post('/api/users/coordinator-deactivate');
    expect(res.status).toBe(400);
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.deactivateCoordinatorAccount.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).post('/api/users/coordinator-deactivate');
    expect(res.status).toBe(404);
  });
});

// ── DELETE /api/users/delete ────────────────────────────────────────────────

describe('DELETE /api/users/delete', () => {
  test('200 — uspješno briše studentski nalog', async () => {
    usersService.deleteMyAccount.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/users/delete');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('obrisan');
  });

  test('409 — odobrena praksa blokira brisanje', async () => {
    usersService.deleteMyAccount.mockRejectedValue(err('Imate odobrenu praksu.', 409, 'ODOBRENA_EXISTS'));
    const res = await request(app).delete('/api/users/delete');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ODOBRENA_EXISTS');
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.deleteMyAccount.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).delete('/api/users/delete');
    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška', async () => {
    usersService.deleteMyAccount.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/users/delete');
    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/users/company-delete ───────────────────────────────────────

describe('DELETE /api/users/company-delete', () => {
  test('200 — uspješno briše nalog kompanije', async () => {
    usersService.deleteCompanyAccount.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/users/company-delete');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('obrisan');
  });

  test('409 — aktivan oglas sa prijavama blokira brisanje', async () => {
    usersService.deleteCompanyAccount.mockRejectedValue(err('Imate aktivne oglase.', 409, 'AKTIVAN_SA_PRIJAVAMA'));
    const res = await request(app).delete('/api/users/company-delete');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('AKTIVAN_SA_PRIJAVAMA');
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.deleteCompanyAccount.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).delete('/api/users/company-delete');
    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška', async () => {
    usersService.deleteCompanyAccount.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/users/company-delete');
    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/users/coordinator-delete ───────────────────────────────────

describe('DELETE /api/users/coordinator-delete', () => {
  test('200 — uspješno briše koordinatorski nalog', async () => {
    usersService.deleteCoordinatorAccount.mockResolvedValue(undefined);
    const res = await request(app).delete('/api/users/coordinator-delete');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('obrisan');
  });

  test('409 — odobrena praksa blokira brisanje koordinatora', async () => {
    usersService.deleteCoordinatorAccount.mockRejectedValue(err('Imate aktivne prakse.', 409, 'ODOBRENA_EXISTS'));
    const res = await request(app).delete('/api/users/coordinator-delete');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('ODOBRENA_EXISTS');
  });

  test('404 — korisnik nije pronađen', async () => {
    usersService.deleteCoordinatorAccount.mockRejectedValue(err('Korisnik nije pronađen.', 404));
    const res = await request(app).delete('/api/users/coordinator-delete');
    expect(res.status).toBe(404);
  });

  test('500 — neočekivana greška', async () => {
    usersService.deleteCoordinatorAccount.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/users/coordinator-delete');
    expect(res.status).toBe(500);
  });
});
