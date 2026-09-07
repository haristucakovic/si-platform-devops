'use strict';

process.env.JWT_SECRET = 'test-secret';

const jwt = require('jsonwebtoken');
const { authenticate } = require('../../src/middleware/auth.middleware');

function makeMocks(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authenticate middleware', () => {
  // Testira: middleware odbija zahtjev kada Authorization header uopće nije proslijeđen
  // Ulaz: req bez Authorization headera (undefined)
  // Očekivani izlaz: HTTP 401, next() nije pozvan
  test('401 — nema Authorization headera', () => {
    const { req, res, next } = makeMocks(undefined);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: middleware odbija zahtjev kada header postoji ali ne koristi Bearer shemu
  // Ulaz: Authorization: "Basic abc123"
  // Očekivani izlaz: HTTP 401, next() nije pozvan
  test('401 — Authorization header ne počinje s "Bearer "', () => {
    const { req, res, next } = makeMocks('Basic abc123');

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: middleware odbija string koji nije validan JWT format
  // Ulaz: Authorization: "Bearer invalid.token.here"
  // Očekivani izlaz: HTTP 401, next() nije pozvan
  test('401 — potpuno neispravan token', () => {
    const { req, res, next } = makeMocks('Bearer invalid.token.here');

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: middleware prepoznaje istekao token i vraća specifičnu poruku o sesiji
  // Ulaz: Bearer token potpisan validnim secretom ali s expiresIn: -1 (odmah istekao)
  // Očekivani izlaz: HTTP 401, poruka u JSON-u sadrži riječ "sesija", next() nije pozvan
  test('401 — istekao token vraća poruku o sesiji', () => {
    const expired = jwt.sign({ id: 1, role: 'ADMIN' }, 'test-secret', { expiresIn: -1 });
    const { req, res, next } = makeMocks(`Bearer ${expired}`);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringMatching(/sesija/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: middleware odbija token koji je potpisan pogrešnim secretom
  // Ulaz: Bearer token potpisan sa "wrong-secret" umjesto "test-secret"
  // Očekivani izlaz: HTTP 401, next() nije pozvan
  test('401 — token potpisan pogrešnim secretom', () => {
    const token = jwt.sign({ id: 1, role: 'ADMIN' }, 'wrong-secret', { expiresIn: '1h' });
    const { req, res, next } = makeMocks(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: middleware propušta validan token, postavlja req.user i poziva next()
  // Ulaz: Bearer token s payload { id: 42, role: 'ADMIN' }, potpisan ispravnim secretom
  // Očekivani izlaz: next() pozvan jednom, req.user sadrži { id: 42, role: 'ADMIN' }, status nije pozvan
  test('ispravan token — poziva next() i postavlja req.user', () => {
    const token = jwt.sign({ id: 42, role: 'ADMIN' }, 'test-secret', { expiresIn: '1h' });
    const { req, res, next } = makeMocks(`Bearer ${token}`);

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toMatchObject({ id: 42, role: 'ADMIN' });
    expect(res.status).not.toHaveBeenCalled();
  });
});
