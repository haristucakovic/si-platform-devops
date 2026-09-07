'use strict';

const request = require('supertest');

let mockUser = { id: 1, role: 'STUDENT' };

jest.mock('../src/middleware/auth.middleware', () => ({
  authenticate: (req, _res, next) => {
    req.user = { ...mockUser };
    next();
  },
}));

jest.mock('../src/middleware/rbac.middleware', () => ({
  authorize: (...roles) => (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  },
}));

jest.mock('../src/business/services/applications.service', () => ({
  getMyApplications: jest.fn(),
  getApplicationStatistics: jest.fn(),
  getCompanyApplicationsForListing: jest.fn(),
  createApplication: jest.fn(),
  shortlistApplication: jest.fn(),
  approveApplicationByCompany: jest.fn(),
  rejectApplicationByCompany: jest.fn(),
  acceptApplicationByStudent: jest.fn(),
  declineApplicationByStudent: jest.fn(),
  withdrawApplication: jest.fn(),
}));

const app = require('../src/app');
const applicationsService = require('../src/business/services/applications.service');

beforeEach(() => {
  jest.clearAllMocks();
  mockUser = { id: 1, role: 'STUDENT' };
});

describe('student-only application routes', () => {
  test('403 — kompanija ne može odustati od prijave', async () => {
    mockUser = { id: 2, role: 'COMPANY' };

    const res = await request(app).patch('/api/applications/10/withdraw');

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Samo studenti/);
    expect(applicationsService.withdrawApplication).not.toHaveBeenCalled();
  });

  test('403 — kompanija ne može prihvatiti prijavu', async () => {
    mockUser = { id: 2, role: 'COMPANY' };

    const res = await request(app).patch('/api/applications/10/accept');

    expect(res.status).toBe(403);
    expect(applicationsService.acceptApplicationByStudent).not.toHaveBeenCalled();
  });

  test('403 — kompanija ne može odbiti prijavu', async () => {
    mockUser = { id: 2, role: 'COMPANY' };

    const res = await request(app).patch('/api/applications/10/decline');

    expect(res.status).toBe(403);
    expect(applicationsService.declineApplicationByStudent).not.toHaveBeenCalled();
  });

  test('200 — student može odustati od prijave', async () => {
    applicationsService.withdrawApplication.mockResolvedValue({
      message: 'Uspješno ste odustali od prijave.',
      application: { id: 10, status: 'ODUSTAO' },
    });

    const res = await request(app).patch('/api/applications/10/withdraw');

    expect(res.status).toBe(200);
    expect(applicationsService.withdrawApplication).toHaveBeenCalledWith(1, '10');
  });
});
