'use strict';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 5, role: 'STUDENT' };
    next();
  },
}));

jest.mock('../../src/business/services/notificationPreferences.service');

const request = require('supertest');
const app = require('../../src/app');
const preferencesService = require('../../src/business/services/notificationPreferences.service');

beforeEach(() => jest.clearAllMocks());

const MOCK_PREFS = { prijava_podnesena_inapp: true, prijava_podnesena_email: false };

// ── GET /api/notification-preferences ────────────────────────────────────────
describe('GET /api/notification-preferences', () => {
  test('200 — vraća preference korisnika', async () => {
    preferencesService.getOrCreatePreferences.mockResolvedValue(MOCK_PREFS);

    const res = await request(app).get('/api/notification-preferences');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(MOCK_PREFS);
  });

  test('404 — kada getOrCreatePreferences vraća null', async () => {
    preferencesService.getOrCreatePreferences.mockResolvedValue(null);

    const res = await request(app).get('/api/notification-preferences');

    expect(res.status).toBe(404);
  });

  test('500 — kada servis baci grešku', async () => {
    preferencesService.getOrCreatePreferences.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/notification-preferences');

    expect(res.status).toBe(500);
  });
});

// ── PUT /api/notification-preferences ────────────────────────────────────────
describe('PUT /api/notification-preferences', () => {
  test('200 — uspješno ažurira preference', async () => {
    const updated = { ...MOCK_PREFS, prijava_podnesena_email: true };
    preferencesService.updatePreferences.mockResolvedValue(updated);

    const res = await request(app)
      .put('/api/notification-preferences')
      .send({ prijava_podnesena_email: true });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updated);
  });

  test('404 — kada updatePreferences vraća null', async () => {
    preferencesService.updatePreferences.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/notification-preferences')
      .send({});

    expect(res.status).toBe(404);
  });

  test('500 — kada servis baci grešku', async () => {
    preferencesService.updatePreferences.mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .put('/api/notification-preferences')
      .send({});

    expect(res.status).toBe(500);
  });
});
