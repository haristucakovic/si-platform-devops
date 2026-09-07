'use strict';

jest.mock('../../src/infrastructure/database/models', () => ({
  Notifikacija: {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
  },
  Student: {
    findOne: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Kompanija: {
    findOne: jest.fn(),
  },
  Koordinator: {
    findOne: jest.fn(),
  },
}));

const db = require('../../src/infrastructure/database/models');
const {
  createNotification,
  createNotificationForKompanija,
  createNotificationForKoordinator,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../../src/business/services/notifications.service');

beforeEach(() => jest.clearAllMocks());

// ── createNotification ────────────────────────────────────────────────────────
describe('createNotification', () => {
  test('kreira notifikaciju kada nema duplikata', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    const mockNotif = { id: 1, naslov: 'Test' };
    db.Notifikacija.create.mockResolvedValue(mockNotif);

    const result = await createNotification(1, 10, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(db.Notifikacija.findOne).toHaveBeenCalledWith({
      where: { student_id: 1, prijava_id: 10, tip: 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI' },
    });
    expect(db.Notifikacija.create).toHaveBeenCalled();
    expect(result).toBe(mockNotif);
  });

  test('vraća null i ne kreira kada duplikat postoji', async () => {
    db.Notifikacija.findOne.mockResolvedValue({ id: 99 });

    const result = await createNotification(1, 10, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(result).toBeNull();
    expect(db.Notifikacija.create).not.toHaveBeenCalled();
  });

  test('bez prijavaId preskače provjeru duplikata i direktno kreira', async () => {
    const mockNotif = { id: 2, naslov: 'Test bez prijave' };
    db.Notifikacija.create.mockResolvedValue(mockNotif);

    const result = await createNotification(1, null, 'PRIJAVA_PROSLIJEDJENA_KOMPANIJI', 'Test', 'Poruka');

    expect(db.Notifikacija.findOne).not.toHaveBeenCalled();
    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: 1, prijava_id: null, procitana: false })
    );
    expect(result).toBe(mockNotif);
  });

  test('create se poziva s ispravnim podacima', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    db.Notifikacija.create.mockResolvedValue({});

    await createNotification(5, 20, 'PRIJAVA_ODBIJENA', 'Odbijena', 'Vaša prijava je odbijena.');

    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student_id: 5,
        prijava_id: 20,
        tip: 'PRIJAVA_ODBIJENA',
        naslov: 'Odbijena',
        poruka: 'Vaša prijava je odbijena.',
        procitana: false,
      })
    );
  });
});

// ── createNotificationForKompanija ────────────────────────────────────────────
describe('createNotificationForKompanija', () => {
  test('kreira notifikaciju za kompaniju kada nema duplikata', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    const mockNotif = { id: 3, naslov: 'Test kompanija' };
    db.Notifikacija.create.mockResolvedValue(mockNotif);

    const result = await createNotificationForKompanija(2, 5, 'NOVI_TIP', 'Naslov', 'Poruka');

    expect(db.Notifikacija.findOne).toHaveBeenCalledWith({
      where: { kompanija_id: 2, prijava_id: 5, tip: 'NOVI_TIP' },
    });
    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({ kompanija_id: 2, prijava_id: 5, procitana: false })
    );
    expect(result).toBe(mockNotif);
  });

  test('vraća null za duplikat kompanija notifikacije', async () => {
    db.Notifikacija.findOne.mockResolvedValue({ id: 50 });

    const result = await createNotificationForKompanija(2, 5, 'NOVI_TIP', 'Naslov', 'Poruka');

    expect(result).toBeNull();
    expect(db.Notifikacija.create).not.toHaveBeenCalled();
  });

  test('kreira bez prijavaId (preskače duplikat provjeru)', async () => {
    db.Notifikacija.create.mockResolvedValue({ id: 4 });

    await createNotificationForKompanija(2, null, 'NOVI_TIP', 'Naslov', 'Poruka');

    expect(db.Notifikacija.findOne).not.toHaveBeenCalled();
    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({ kompanija_id: 2, prijava_id: null })
    );
  });
});

// ── createNotificationForKoordinator ─────────────────────────────────────────
describe('createNotificationForKoordinator', () => {
  test('kreira notifikaciju za koordinatora kada nema duplikata', async () => {
    db.Notifikacija.findOne.mockResolvedValue(null);
    db.Notifikacija.create.mockResolvedValue({ id: 5 });

    await createNotificationForKoordinator(3, 7, 'TIP_K', 'Naslov', 'Poruka');

    expect(db.Notifikacija.findOne).toHaveBeenCalledWith({
      where: { koordinator_id: 3, prijava_id: 7, tip: 'TIP_K' },
    });
    expect(db.Notifikacija.create).toHaveBeenCalledWith(
      expect.objectContaining({ koordinator_id: 3, prijava_id: 7, procitana: false })
    );
  });

  test('vraća null za duplikat koordinator notifikacije', async () => {
    db.Notifikacija.findOne.mockResolvedValue({ id: 77 });

    const result = await createNotificationForKoordinator(3, 7, 'TIP_K', 'Naslov', 'Poruka');

    expect(result).toBeNull();
  });

  test('kreira bez prijavaId', async () => {
    db.Notifikacija.create.mockResolvedValue({ id: 6 });

    await createNotificationForKoordinator(3, null, 'TIP_K', 'Naslov', 'Poruka');

    expect(db.Notifikacija.findOne).not.toHaveBeenCalled();
  });
});

// ── getMyNotifications ────────────────────────────────────────────────────────
describe('getMyNotifications', () => {
  test('vraća [] kada user ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(null);

    const result = await getMyNotifications(99);

    expect(result).toEqual([]);
    expect(db.Student.findOne).not.toHaveBeenCalled();
  });

  test('STUDENT - vraća notifikacije kada student postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    const mockNotifs = [{ id: 1 }, { id: 2 }];
    db.Notifikacija.findAll.mockResolvedValue(mockNotifs);

    const result = await getMyNotifications(5);

    expect(db.User.findByPk).toHaveBeenCalledWith(5);
    expect(db.Student.findOne).toHaveBeenCalledWith({ where: { userID: 5 } });
    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { student_id: 20 } })
    );
    expect(result).toBe(mockNotifs);
  });

  test('STUDENT - vraća [] kada student ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue(null);

    const result = await getMyNotifications(999);

    expect(result).toEqual([]);
    expect(db.Notifikacija.findAll).not.toHaveBeenCalled();
  });

  test('STUDENT - sortira notifikacije po created_at DESC s limitom 50', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.findAll.mockResolvedValue([]);

    await getMyNotifications(5);

    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ order: [['created_at', 'DESC']], limit: 50 })
    );
  });

  test('COMPANY - vraća notifikacije kompanije', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    const mockNotifs = [{ id: 10 }];
    db.Notifikacija.findAll.mockResolvedValue(mockNotifs);

    const result = await getMyNotifications(3);

    expect(db.Kompanija.findOne).toHaveBeenCalledWith({ where: { userID: 3 } });
    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { kompanija_id: 5 }, order: [['created_at', 'DESC']], limit: 50 })
    );
    expect(result).toBe(mockNotifs);
  });

  test('COMPANY - vraća [] kada kompanija ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue(null);

    const result = await getMyNotifications(3);

    expect(result).toEqual([]);
    expect(db.Notifikacija.findAll).not.toHaveBeenCalled();
  });

  test('KOORDINATOR - vraća notifikacije koordinatora', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue({ id: 7 });
    const mockNotifs = [{ id: 20 }];
    db.Notifikacija.findAll.mockResolvedValue(mockNotifs);

    const result = await getMyNotifications(4);

    expect(db.Koordinator.findOne).toHaveBeenCalledWith({ where: { userID: 4 } });
    expect(db.Notifikacija.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ where: { koordinator_id: 7 }, order: [['created_at', 'DESC']], limit: 50 })
    );
    expect(result).toBe(mockNotifs);
  });

  test('KOORDINATOR - vraća [] kada koordinator ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue(null);

    const result = await getMyNotifications(4);

    expect(result).toEqual([]);
  });

  test('nepoznata rola vraća []', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'ADMIN' });

    const result = await getMyNotifications(1);

    expect(result).toEqual([]);
    expect(db.Notifikacija.findAll).not.toHaveBeenCalled();
  });
});

// ── markAsRead ────────────────────────────────────────────────────────────────
describe('markAsRead', () => {
  test('vraća bez akcije kada user ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(null);

    await markAsRead('42', 999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('STUDENT - označava notifikaciju s ispravnim where klauzulama', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.update.mockResolvedValue([1]);

    await markAsRead('42', 5);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { id: '42', student_id: 20 } }
    );
  });

  test('STUDENT - ne poziva update kada student ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue(null);

    await markAsRead('42', 999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('COMPANY - označava notifikaciju za kompaniju', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 8 });
    db.Notifikacija.update.mockResolvedValue([1]);

    await markAsRead('15', 3);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { id: '15', kompanija_id: 8 } }
    );
  });

  test('COMPANY - ne poziva update kada kompanija ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue(null);

    await markAsRead('15', 3);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('KOORDINATOR - označava notifikaciju za koordinatora', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue({ id: 9 });
    db.Notifikacija.update.mockResolvedValue([1]);

    await markAsRead('77', 4);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { id: '77', koordinator_id: 9 } }
    );
  });

  test('KOORDINATOR - ne poziva update kada koordinator ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue(null);

    await markAsRead('77', 4);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });
});

// ── markAllAsRead ─────────────────────────────────────────────────────────────
describe('markAllAsRead', () => {
  test('vraća bez akcije kada user ne postoji', async () => {
    db.User.findByPk.mockResolvedValue(null);

    await markAllAsRead(999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('STUDENT - označava sve nepročitane notifikacije', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue({ id: 20 });
    db.Notifikacija.update.mockResolvedValue([3]);

    await markAllAsRead(5);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { student_id: 20, procitana: false } }
    );
  });

  test('STUDENT - ne poziva update kada student ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'STUDENT' });
    db.Student.findOne.mockResolvedValue(null);

    await markAllAsRead(999);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('COMPANY - označava sve notifikacije kompanije kao pročitane', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue({ id: 5 });
    db.Notifikacija.update.mockResolvedValue([2]);

    await markAllAsRead(3);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { kompanija_id: 5, procitana: false } }
    );
  });

  test('COMPANY - ne poziva update kada kompanija ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'COMPANY' });
    db.Kompanija.findOne.mockResolvedValue(null);

    await markAllAsRead(3);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });

  test('KOORDINATOR - označava sve notifikacije koordinatora kao pročitane', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue({ id: 7 });
    db.Notifikacija.update.mockResolvedValue([1]);

    await markAllAsRead(4);

    expect(db.Notifikacija.update).toHaveBeenCalledWith(
      { procitana: true },
      { where: { koordinator_id: 7, procitana: false } }
    );
  });

  test('KOORDINATOR - ne poziva update kada koordinator ne postoji', async () => {
    db.User.findByPk.mockResolvedValue({ role: 'KOORDINATOR' });
    db.Koordinator.findOne.mockResolvedValue(null);

    await markAllAsRead(4);

    expect(db.Notifikacija.update).not.toHaveBeenCalled();
  });
});
