'use strict';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 2, role: 'COMPANY' };
    next();
  },
}));

jest.mock('../../src/middleware/rbac.middleware', () => ({
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  },
}));

jest.mock('../../src/infrastructure/database/models', () => ({
  Student: { findOne: jest.fn() },
  Kompanija: { findOne: jest.fn() },
  Oglas: {},
  Dokument: { findAll: jest.fn(), findByPk: jest.fn(), findOne: jest.fn(), create: jest.fn() },
  PrijavaNaPraksu: {},
}));

jest.mock('../../src/infrastructure/supabase', () => ({
  storage: {
    from: jest.fn().mockReturnValue({
      createSignedUrl: jest.fn(),
      remove: jest.fn(),
      upload: jest.fn(),
    }),
  },
}));

jest.mock('../../src/business/services/applicationStatus.service', () => ({
  APPLICATION_STATUS: { WITHDRAWN: 'ODUSTAO' },
  COORDINATOR_STATUS: { APPROVED: 'ODOBRENO' },
}));

const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/infrastructure/database/models');
const supabase = require('../../src/infrastructure/supabase');

beforeEach(() => {
  jest.clearAllMocks();
  supabase.storage.from.mockReturnValue({
    createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://cdn.example.com/file' }, error: null }),
    remove: jest.fn().mockResolvedValue({}),
    upload: jest.fn().mockResolvedValue({ error: null }),
  });
});

function makeDocWithPrijava(overrides = {}) {
  return {
    id: 1,
    file_path: 'path/file.pdf',
    original_name: 'CV.pdf',
    PrijavaNaPraksu: {
      id: 10,
      status: 'CEKA_KOMPANIJU',
      koordinatorStatus: 'ODOBRENO',
      Ogla: { id: 20, kompanijaID: 5, status: 'AKTIVAN' },
      ...overrides.prijavnaOverrides,
    },
    ...overrides,
  };
}

// ── GET /api/dokumenti/:id/company-download ───────────────────────────────────
describe('GET /api/dokumenti/:id/company-download', () => {
  test('200 — vraća signed URL za kompaniju', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue(makeDocWithPrijava());

    const res = await request(app).get('/api/dokumenti/1/company-download');

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://cdn.example.com/file');
  });

  test('404 — nevažeći ID dokumenta', async () => {
    const res = await request(app).get('/api/dokumenti/0/company-download');
    expect(res.status).toBe(404);
  });

  test('404 — kompanija ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(404);
  });

  test('404 — dokument ne postoji', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue(null);

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(404);
  });

  test('403 — oglas pripada drugoj kompaniji', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue({
      id: 1,
      file_path: 'path/file.pdf',
      original_name: 'CV.pdf',
      PrijavaNaPraksu: {
        id: 10, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO',
        Ogla: { id: 20, kompanijaID: 99, status: 'AKTIVAN' },
      },
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(403);
  });

  test('403 — oglas nije AKTIVAN', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue({
      id: 1,
      file_path: 'path/file.pdf',
      original_name: 'CV.pdf',
      PrijavaNaPraksu: {
        id: 10, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO',
        Ogla: { id: 20, kompanijaID: 5, status: 'ZATVOREN' },
      },
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(403);
  });

  test('403 — koordinator nije odobrio prijavu', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue({
      id: 1,
      file_path: 'path/file.pdf',
      original_name: 'CV.pdf',
      PrijavaNaPraksu: {
        id: 10, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'NA_CEKANJU',
        Ogla: { id: 20, kompanijaID: 5, status: 'AKTIVAN' },
      },
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(403);
  });

  test('403 — student je povukao prijavu', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue({
      id: 1,
      file_path: 'path/file.pdf',
      original_name: 'CV.pdf',
      PrijavaNaPraksu: {
        id: 10, status: 'ODUSTAO', koordinatorStatus: 'ODOBRENO',
        Ogla: { id: 20, kompanijaID: 5, status: 'AKTIVAN' },
      },
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(403);
  });

  test('404 — dokument nema file_path', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue({
      id: 1,
      file_path: null,
      original_name: 'CV.pdf',
      PrijavaNaPraksu: {
        id: 10, status: 'CEKA_KOMPANIJU', koordinatorStatus: 'ODOBRENO',
        Ogla: { id: 20, kompanijaID: 5, status: 'AKTIVAN' },
      },
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(404);
  });

  test('500 — Supabase vrati grešku', async () => {
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Dokument.findByPk.mockResolvedValue(makeDocWithPrijava());
    supabase.storage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: { message: 'storage error' } }),
    });

    const res = await request(app).get('/api/dokumenti/1/company-download');
    expect(res.status).toBe(500);
  });
});


