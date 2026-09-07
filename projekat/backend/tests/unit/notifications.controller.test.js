'use strict';

const { notificationsPlaceholderController } = require('../../src/business/controllers/notifications.controller');

describe('notificationsPlaceholderController', () => {
  test('vraća 501 sa placeholder porukom', () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    notificationsPlaceholderController(req, res);

    expect(res.status).toHaveBeenCalledWith(501);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});
