'use strict';

const { authorize } = require('../../src/middleware/rbac.middleware');

function makeMocks(user) {
  const req = { user };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  const next = jest.fn();
  return { req, res, next };
}

describe('authorize middleware', () => {
  // Testira: authorize() vraća 401 kada authenticate() nije pozvan ispred i req.user nije postavljen
  // Ulaz: req.user = undefined, authorize('ADMIN')
  // Očekivani izlaz: HTTP 401, next() nije pozvan
  test('401 — req.user nije postavljen (authenticate nije pozvan ispred)', () => {
    const { req, res, next } = makeMocks(undefined);

    authorize('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: authorize() zabranjuje pristup korisniku čija rola nije u listi dozvoljenih
  // Ulaz: req.user = { id: 1, role: 'STUDENT' }, authorize('ADMIN')
  // Očekivani izlaz: HTTP 403, next() nije pozvan
  test('403 — rola korisnika nije u listi dozvoljenih', () => {
    const { req, res, next } = makeMocks({ id: 1, role: 'STUDENT' });

    authorize('ADMIN')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: authorize() propušta korisnika čija rola se nalazi u listi dozvoljenih
  // Ulaz: req.user = { id: 1, role: 'ADMIN' }, authorize('ADMIN')
  // Očekivani izlaz: next() pozvan jednom, status nije pozvan
  test('poziva next() kada je rola dozvoljena', () => {
    const { req, res, next } = makeMocks({ id: 1, role: 'ADMIN' });

    authorize('ADMIN')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  // Testira: authorize() ispravno radi sa listom više dozvoljenih rola
  // Ulaz: req.user = { id: 1, role: 'COORDINATOR' }, authorize('ADMIN', 'COORDINATOR')
  // Očekivani izlaz: next() pozvan jednom
  test('poziva next() kada je jedna od više dozvoljenih rola', () => {
    const { req, res, next } = makeMocks({ id: 1, role: 'COORDINATOR' });

    authorize('ADMIN', 'COORDINATOR')(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  // Testira: authorize() zabranjuje COMPANY rolu na ruti koja dozvoljava samo ADMIN i COORDINATOR
  // Ulaz: req.user = { id: 1, role: 'COMPANY' }, authorize('ADMIN', 'COORDINATOR')
  // Očekivani izlaz: HTTP 403, next() nije pozvan
  test('403 — rola COMPANY nije dozvoljena za ADMIN+COORDINATOR rutu', () => {
    const { req, res, next } = makeMocks({ id: 1, role: 'COMPANY' });

    authorize('ADMIN', 'COORDINATOR')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  // Testira: authorize() ne dopušta pristup STUDENT roli čak i kada lista sadrži više rola
  // Ulaz: req.user = { id: 1, role: 'STUDENT' }, authorize('ADMIN', 'COORDINATOR', 'COMPANY')
  // Očekivani izlaz: HTTP 403, next() nije pozvan
  test('403 — rola STUDENT nije dozvoljena čak i kad ima više dozvoljenih rola', () => {
    const { req, res, next } = makeMocks({ id: 1, role: 'STUDENT' });

    authorize('ADMIN', 'COORDINATOR', 'COMPANY')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
