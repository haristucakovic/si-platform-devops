'use strict';

jest.mock('../../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 5, role: 'STUDENT' };
    next();
  },
}));

jest.mock('../../src/middleware/rbac.middleware', () => ({
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  },
}));

jest.mock('../../src/middleware/upload.middleware', () => ({
  uploadDocuments: {
    array: () => (req, _res, next) => {
      req.files = req._mockFiles || [];
      next();
    },
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

// ── GET /api/dokumenti/mine ───────────────────────────────────────────────────
describe('GET /api/dokumenti/mine', () => {
  test('200 — vraća dokumenta studenta', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findAll.mockResolvedValue([{ id: 1, original_name: 'CV.pdf' }]);

    const res = await request(app).get('/api/dokumenti/mine');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200 — vraća prazan niz kada student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/dokumenti/mine');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('500 — baza baci grešku', async () => {
    db.Student.findOne.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/dokumenti/mine');

    expect(res.status).toBe(500);
  });
});

// ── GET /api/dokumenti/:id/download ──────────────────────────────────────────
describe('GET /api/dokumenti/:id/download', () => {
  test('200 — vraća signed URL', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findOne.mockResolvedValue({ id: 1, file_path: 'path/file.pdf', original_name: 'CV.pdf' });

    const res = await request(app).get('/api/dokumenti/1/download');

    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://cdn.example.com/file');
  });

  test('403 — student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/dokumenti/1/download');

    expect(res.status).toBe(403);
  });

  test('404 — dokument ne postoji', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/dokumenti/1/download');

    expect(res.status).toBe(404);
  });

  test('500 — Supabase vrati grešku', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findOne.mockResolvedValue({ id: 1, file_path: 'path/file.pdf', original_name: 'CV.pdf' });
    supabase.storage.from.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({ data: null, error: { message: 'storage error' } }),
    });

    const res = await request(app).get('/api/dokumenti/1/download');

    expect(res.status).toBe(500);
  });
});

// ── DELETE /api/dokumenti/:id ─────────────────────────────────────────────────
describe('DELETE /api/dokumenti/:id', () => {
  test('204 — uspješno briše dokument', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const mockDoc = { id: 1, file_path: 'path/file.pdf', destroy: jest.fn() };
    db.Dokument.findOne.mockResolvedValue(mockDoc);

    const res = await request(app).delete('/api/dokumenti/1');

    expect(res.status).toBe(204);
    expect(mockDoc.destroy).toHaveBeenCalled();
  });

  test('204 — briše dokument bez file_path', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const mockDoc = { id: 1, file_path: null, destroy: jest.fn() };
    db.Dokument.findOne.mockResolvedValue(mockDoc);

    const res = await request(app).delete('/api/dokumenti/1');

    expect(res.status).toBe(204);
  });

  test('403 — student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app).delete('/api/dokumenti/1');

    expect(res.status).toBe(403);
  });

  test('404 — dokument ne postoji', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findOne.mockResolvedValue(null);

    const res = await request(app).delete('/api/dokumenti/1');

    expect(res.status).toBe(404);
  });
});

// ── POST /api/dokumenti/attach ────────────────────────────────────────────────
describe('POST /api/dokumenti/attach', () => {
  test('201 — uspješno prilaže dokument', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    const mockDoc = { id: 1, tip_dokumenta: 'CV', original_name: 'CV.pdf', file_name: 'f', file_path: 'p', mime_path: 'application/pdf', size: 1000 };
    db.Dokument.findOne.mockResolvedValue(mockDoc);
    db.Dokument.create.mockResolvedValue({ id: 99, ...mockDoc });

    const res = await request(app)
      .post('/api/dokumenti/attach')
      .send({ oglas_id: 10, dokument_ids: [1] });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('400 — nedostaje oglas_id', async () => {
    const res = await request(app)
      .post('/api/dokumenti/attach')
      .send({ dokument_ids: [1] });

    expect(res.status).toBe(400);
  });

  test('400 — prazna lista dokument_ids', async () => {
    const res = await request(app)
      .post('/api/dokumenti/attach')
      .send({ oglas_id: 10, dokument_ids: [] });

    expect(res.status).toBe(400);
  });

  test('403 — student ne postoji', async () => {
    db.Student.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/dokumenti/attach')
      .send({ oglas_id: 10, dokument_ids: [1] });

    expect(res.status).toBe(403);
  });

  test('201 — preskače dokument koji ne pripada studentu', async () => {
    db.Student.findOne.mockResolvedValue({ id: 10 });
    db.Dokument.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/dokumenti/attach')
      .send({ oglas_id: 10, dokument_ids: [999] });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveLength(0);
  });
});
