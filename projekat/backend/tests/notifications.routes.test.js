'use strict';

const request = require('supertest');

jest.mock('../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 5, role: 'STUDENT' };
    next();
  },
}));

jest.mock('../src/middleware/rbac.middleware', () => ({
  authorize: () => (_req, _res, next) => next(),
}));

jest.mock('../src/business/services/notifications.service', () => ({
  getMyNotifications: jest.fn(),
  markAllAsRead: jest.fn(),
  markAsRead: jest.fn(),
}));

jest.mock('../src/business/services/auth.service', () => ({}));
jest.mock('../src/business/services/admin.service', () => ({}));
jest.mock('../src/business/services/approval.service', () => ({}));

const app = require('../src/app');
const notifService = require('../src/business/services/notifications.service');

beforeEach(() => jest.clearAllMocks());

// ── GET /api/notifications ────────────────────────────────────────────────────
describe('GET /api/notifications', () => {
  // Testira: autenticirani korisnik dobija listu svojih notifikacija
  // Ulaz: GET /api/notifications s validnim JWT-om (mockovanim)
  // Očekivani izlaz: HTTP 200, niz notifikacija
  test('200 — vraća listu notifikacija', async () => {
    notifService.getMyNotifications.mockResolvedValue([
      { id: 1, naslov: 'Prijava odobrena', procitano: false },
      { id: 2, naslov: 'Nova poruka', procitano: true },
    ]);

    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(notifService.getMyNotifications).toHaveBeenCalledWith(5);
  });

  // Testira: vraća prazan niz kada korisnik nema notifikacija
  // Ulaz: GET /api/notifications, getMyNotifications vraća []
  // Očekivani izlaz: HTTP 200, []
  test('200 — vraća prazan niz kada nema notifikacija', async () => {
    notifService.getMyNotifications.mockResolvedValue([]);

    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Testira: endpoint vraća 500 kada servis baci grešku
  // Ulaz: GET /api/notifications, getMyNotifications baca grešku
  // Očekivani izlaz: HTTP 500
  test('500 — greška servisa vraća 500', async () => {
    notifService.getMyNotifications.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/notifications');

    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
describe('PATCH /api/notifications/read-all', () => {
  // Testira: autenticirani korisnik uspješno označava sve notifikacije kao pročitane
  // Ulaz: PATCH /api/notifications/read-all s validnim JWT-om
  // Očekivani izlaz: HTTP 204
  test('204 — označava sve notifikacije kao pročitane', async () => {
    notifService.markAllAsRead.mockResolvedValue(undefined);

    const res = await request(app).patch('/api/notifications/read-all');

    expect(res.status).toBe(204);
    expect(notifService.markAllAsRead).toHaveBeenCalledWith(5);
  });

  // Testira: endpoint vraća 500 kada servis baci grešku
  // Ulaz: PATCH /api/notifications/read-all, markAllAsRead baca grešku
  // Očekivani izlaz: HTTP 500
  test('500 — greška servisa vraća 500', async () => {
    notifService.markAllAsRead.mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch('/api/notifications/read-all');

    expect(res.status).toBe(500);
  });
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
describe('PATCH /api/notifications/:id/read', () => {
  // Testira: autenticirani korisnik uspješno označava jednu notifikaciju kao pročitanu
  // Ulaz: PATCH /api/notifications/42/read s validnim JWT-om
  // Očekivani izlaz: HTTP 204
  test('204 — označava notifikaciju kao pročitanu', async () => {
    notifService.markAsRead.mockResolvedValue(undefined);

    const res = await request(app).patch('/api/notifications/42/read');

    expect(res.status).toBe(204);
    expect(notifService.markAsRead).toHaveBeenCalledWith('42', 5);
  });

  // Testira: endpoint vraća 500 kada servis baci grešku
  // Ulaz: PATCH /api/notifications/42/read, markAsRead baca grešku
  // Očekivani izlaz: HTTP 500
  test('500 — greška servisa vraća 500', async () => {
    notifService.markAsRead.mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch('/api/notifications/42/read');

    expect(res.status).toBe(500);
  });
});
