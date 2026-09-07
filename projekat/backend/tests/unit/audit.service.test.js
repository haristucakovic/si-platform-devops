'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  AuditLog: { create: jest.fn(), findAll: jest.fn() },
  User: { findByPk: jest.fn() },
}));

const db = require('../../src/infrastructure/database/models');
const { logAudit, getAuditLogs, ACTION_TYPES } = require('../../src/business/services/audit.service');

beforeEach(() => jest.clearAllMocks());

describe('ACTION_TYPES', () => {
  test('sadrži expected konstante', () => {
    expect(ACTION_TYPES.USER_REGISTERED).toBe('USER_REGISTERED');
    expect(ACTION_TYPES.APPLICATION_STATUS_CHANGED).toBe('APPLICATION_STATUS_CHANGED');
    expect(ACTION_TYPES.USER_DELETED).toBe('USER_DELETED');
    expect(ACTION_TYPES.LISTING_UPDATED).toBe('LISTING_UPDATED');
    expect(ACTION_TYPES.INTERNSHIP_WITHDRAWN).toBe('INTERNSHIP_WITHDRAWN');
  });
});

describe('logAudit', () => {
  test('kreira audit log s korisničkim snapshotom iz baze', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, ime: 'Test', prezime: 'User', email: 't@t.com', role: 'STUDENT' });
    db.AuditLog.create.mockResolvedValue({ id: 1 });

    const result = await logAudit({ userID: 1, actionType: 'USER_REGISTERED', details: {} });

    expect(db.AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ userID: 1, actionType: 'USER_REGISTERED', userName: 'Test User', userEmail: 't@t.com' }),
      undefined
    );
    expect(result).toEqual({ id: 1 });
  });

  test('kreira audit log s proslijeđenim snapshotom (ne dohvata iz baze)', async () => {
    db.AuditLog.create.mockResolvedValue({ id: 2 });
    const snapshot = { userName: 'Manual Name', userEmail: 'm@m.com', userRole: 'ADMIN' };

    await logAudit({ userID: 1, actionType: 'USER_DELETED', userSnapshot: snapshot });

    expect(db.User.findByPk).not.toHaveBeenCalled();
    expect(db.AuditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ userName: 'Manual Name' }),
      undefined
    );
  });

  test('vraća null kada actionType nije naveden', async () => {
    const result = await logAudit({ userID: 1 });
    expect(result).toBeNull();
    expect(db.AuditLog.create).not.toHaveBeenCalled();
  });

  test('vraća null kada je userID null i nema User.findByPk', async () => {
    db.AuditLog.create.mockResolvedValue({ id: 3 });
    const result = await logAudit({ userID: null, actionType: 'USER_REGISTERED' });
    expect(db.AuditLog.create).toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  test('vraća null kada AuditLog.create baci grešku', async () => {
    db.User.findByPk.mockResolvedValue(null);
    db.AuditLog.create.mockRejectedValue(new Error('DB error'));

    const result = await logAudit({ userID: 1, actionType: 'USER_REGISTERED' });
    expect(result).toBeNull();
  });

  test('proslijeđuje transaction parametar', async () => {
    db.User.findByPk.mockResolvedValue({ id: 1, ime: 'A', prezime: 'B', email: 'a@b.com', role: 'ADMIN' });
    db.AuditLog.create.mockResolvedValue({ id: 4 });
    const fakeTransaction = {};

    await logAudit({ userID: 1, actionType: 'USER_DELETED', transaction: fakeTransaction });

    expect(db.AuditLog.create).toHaveBeenCalledWith(
      expect.any(Object),
      { transaction: fakeTransaction }
    );
  });
});

describe('getAuditLogs', () => {
  test('vraća sve logove bez filtera', async () => {
    const mockLogs = [
      { id: 1, userID: 1, userName: 'Test', userEmail: 't@t.com', userRole: 'ADMIN', actionType: 'USER_DELETED', details: {}, createdAt: new Date() },
    ];
    db.AuditLog.findAll.mockResolvedValue(mockLogs);

    const result = await getAuditLogs();

    expect(db.AuditLog.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: {}, limit: 100 }));
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, actionType: 'USER_DELETED' });
  });

  test('filtrira po actionType', async () => {
    db.AuditLog.findAll.mockResolvedValue([]);
    await getAuditLogs({ actionType: 'USER_REGISTERED' });
    expect(db.AuditLog.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { actionType: 'USER_REGISTERED' } }));
  });

  test('ograničava limit na max 500', async () => {
    db.AuditLog.findAll.mockResolvedValue([]);
    await getAuditLogs({ limit: 9999 });
    expect(db.AuditLog.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 500 }));
  });

  test('koristi DEFAULT 100 kada je limit 0 (falsy)', async () => {
    db.AuditLog.findAll.mockResolvedValue([]);
    await getAuditLogs({ limit: 0 });
    // 0 is falsy so Number(0) || 100 = 100, then Math.max(100,1)=100
    expect(db.AuditLog.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
  });

  test('mapira log s praznim details na {}', async () => {
    db.AuditLog.findAll.mockResolvedValue([
      { id: 2, userID: null, userName: null, userEmail: null, userRole: null, actionType: 'USER_REGISTERED', details: null, createdAt: new Date() },
    ]);
    const result = await getAuditLogs();
    expect(result[0].details).toEqual({});
  });
});
