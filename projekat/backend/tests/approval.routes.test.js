'use strict';

const request = require('supertest');

jest.mock('../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { id: 9, role: 'ADMIN' };
    next();
  },
}));

jest.mock('../src/middleware/rbac.middleware', () => ({
  authorize: () => (_req, _res, next) => next(),
}));

jest.mock('../src/business/services/auth.service', () => ({}));
jest.mock('../src/business/services/admin.service', () => ({}));
jest.mock('../src/business/services/approval.service');

const app = require('../src/app');
const approvalService = require('../src/business/services/approval.service');

function makeApprovalResponse(overrides = {}) {
  return {
    id: 1,
    ime: 'Haris',
    prezime: 'Husic',
    email: 'haris@test.com',
    role: 'STUDENT',
    status: 'PENDING',
    approvalStatus: 'PENDING_APPROVAL',
    overdue: false,
    ...overrides,
  };
}

beforeEach(() => jest.clearAllMocks());

describe('GET /api/approval-requests/users', () => {
  test('200 - vraca listu zahtjeva za odobrenje', async () => {
    approvalService.getUserApprovalRequests.mockResolvedValue([makeApprovalResponse()]);

    const res = await request(app).get('/api/approval-requests/users');

    expect(res.status).toBe(200);
    expect(res.body[0]).toMatchObject({ id: 1, approvalStatus: 'PENDING_APPROVAL' });
  });

  test('500 - servisna greska vraca status i message', async () => {
    approvalService.getUserApprovalRequests.mockRejectedValue(new Error('DB failed'));

    const res = await request(app).get('/api/approval-requests/users');

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('DB failed');
  });
});

describe('GET /api/approval-requests/users/:id', () => {
  test('200 - vraca jedan zahtjev', async () => {
    approvalService.getUserApprovalRequestById.mockResolvedValue(makeApprovalResponse({ id: 2 }));

    const res = await request(app).get('/api/approval-requests/users/2');

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(2);
    expect(approvalService.getUserApprovalRequestById).toHaveBeenCalledWith(2);
  });

  test('400 - id mora biti pozitivan broj', async () => {
    const res = await request(app).get('/api/approval-requests/users/abc');

    expect(res.status).toBe(400);
    expect(approvalService.getUserApprovalRequestById).not.toHaveBeenCalled();
  });

  test('404 - servisna 404 greska se prosljedjuje', async () => {
    const err = new Error('User not found.');
    err.status = 404;
    approvalService.getUserApprovalRequestById.mockRejectedValue(err);

    const res = await request(app).get('/api/approval-requests/users/999');

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('User not found.');
  });
});

describe('PATCH /api/approval-requests/users/:id/approve', () => {
  test('200 - odobrava zahtjev i salje uppercase rolu servisu', async () => {
    approvalService.approveUserRequest.mockResolvedValue(
      makeApprovalResponse({ role: 'COORDINATOR', status: 'ACTIVE', approvalStatus: 'APPROVED' })
    );

    const res = await request(app)
      .patch('/api/approval-requests/users/1/approve')
      .send({ role: 'coordinator' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ role: 'COORDINATOR', status: 'ACTIVE' });
    expect(approvalService.approveUserRequest).toHaveBeenCalledWith(1, 'COORDINATOR', 9);
  });

  test('400 - id mora biti pozitivan broj', async () => {
    const res = await request(app)
      .patch('/api/approval-requests/users/0/approve')
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(400);
    expect(approvalService.approveUserRequest).not.toHaveBeenCalled();
  });

  test('400 - role je obavezan', async () => {
    const res = await request(app)
      .patch('/api/approval-requests/users/1/approve')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/role/i);
  });

  test('403 - servisna greska se prosljedjuje', async () => {
    const err = new Error('Ne mozete odobriti vlastiti racun.');
    err.status = 403;
    approvalService.approveUserRequest.mockRejectedValue(err);

    const res = await request(app)
      .patch('/api/approval-requests/users/1/approve')
      .send({ role: 'STUDENT' });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(err.message);
  });
});

describe('PATCH /api/approval-requests/users/:id/reject', () => {
  test('200 - odbija zahtjev i prosljedjuje actor id', async () => {
    approvalService.rejectUserRequest.mockResolvedValue(
      makeApprovalResponse({ status: 'DEACTIVATED', approvalStatus: 'REJECTED' })
    );

    const res = await request(app)
      .patch('/api/approval-requests/users/1/reject')
      .send({ rejectionReason: 'Nedostaju dokumenti' });

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ status: 'DEACTIVATED', approvalStatus: 'REJECTED' });
    expect(approvalService.rejectUserRequest).toHaveBeenCalledWith(1, 'Nedostaju dokumenti', 9);
  });

  test('400 - id mora biti pozitivan broj', async () => {
    const res = await request(app)
      .patch('/api/approval-requests/users/-1/reject')
      .send({ rejectionReason: 'Nedostaju dokumenti' });

    expect(res.status).toBe(400);
    expect(approvalService.rejectUserRequest).not.toHaveBeenCalled();
  });

  test('400 - servisna validacijska greska se prosljedjuje', async () => {
    const err = new Error('Razlog odbijanja je obavezan.');
    err.status = 400;
    approvalService.rejectUserRequest.mockRejectedValue(err);

    const res = await request(app)
      .patch('/api/approval-requests/users/1/reject')
      .send({ rejectionReason: '   ' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(err.message);
  });
});
