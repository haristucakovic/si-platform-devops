'use strict';

const { Notifikacija, Student, User, Kompanija, Koordinator } = require('../../infrastructure/database/models');

async function createNotification(studentId, prijavaId, tip, naslov, poruka) {
  if (prijavaId) {
    const exists = await Notifikacija.findOne({
      where: { student_id: studentId, prijava_id: prijavaId, tip },
    });
    if (exists) return null;
  }

  return Notifikacija.create({
    student_id: studentId,
    prijava_id: prijavaId || null,
    tip,
    naslov,
    poruka,
    procitana: false,
    created_at: new Date(),
  });
}

async function createNotificationForKompanija(kompanijaId, prijavaId, tip, naslov, poruka) {
  if (prijavaId) {
    const exists = await Notifikacija.findOne({
      where: { kompanija_id: kompanijaId, prijava_id: prijavaId, tip },
    });
    if (exists) return null;
  }

  return Notifikacija.create({
    kompanija_id: kompanijaId,
    prijava_id: prijavaId || null,
    tip,
    naslov,
    poruka,
    procitana: false,
    created_at: new Date(),
  });
}

async function createNotificationForKoordinator(koordinatorId, prijavaId, tip, naslov, poruka) {
  if (prijavaId) {
    const exists = await Notifikacija.findOne({
      where: { koordinator_id: koordinatorId, prijava_id: prijavaId, tip },
    });
    if (exists) return null;
  }

  return Notifikacija.create({
    koordinator_id: koordinatorId,
    prijava_id: prijavaId || null,
    tip,
    naslov,
    poruka,
    procitana: false,
    created_at: new Date(),
  });
}

async function getMyNotifications(userId) {
  const user = await User.findByPk(userId);
  if (!user) return [];

  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ where: { userID: userId } });
    if (!student) return [];
    return Notifikacija.findAll({
      where: { student_id: student.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
  }

  if (user.role === 'COMPANY') {
    const kompanija = await Kompanija.findOne({ where: { userID: userId } });
    if (!kompanija) return [];
    return Notifikacija.findAll({
      where: { kompanija_id: kompanija.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
  }

  if (user.role === 'KOORDINATOR') {
    const koordinator = await Koordinator.findOne({ where: { userID: userId } });
    if (!koordinator) return [];
    return Notifikacija.findAll({
      where: { koordinator_id: koordinator.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
  }

  return [];
}

async function markAsRead(id, userId) {
  const user = await User.findByPk(userId);
  if (!user) return;

  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ where: { userID: userId } });
    if (!student) return;
    await Notifikacija.update({ procitana: true }, { where: { id, student_id: student.id } });
    return;
  }

  if (user.role === 'COMPANY') {
    const kompanija = await Kompanija.findOne({ where: { userID: userId } });
    if (!kompanija) return;
    await Notifikacija.update({ procitana: true }, { where: { id, kompanija_id: kompanija.id } });
    return;
  }

  if (user.role === 'KOORDINATOR') {
    const koordinator = await Koordinator.findOne({ where: { userID: userId } });
    if (!koordinator) return;
    await Notifikacija.update({ procitana: true }, { where: { id, koordinator_id: koordinator.id } });
  }
}

async function markAllAsRead(userId) {
  const user = await User.findByPk(userId);
  if (!user) return;

  if (user.role === 'STUDENT') {
    const student = await Student.findOne({ where: { userID: userId } });
    if (!student) return;
    await Notifikacija.update({ procitana: true }, { where: { student_id: student.id, procitana: false } });
    return;
  }

  if (user.role === 'COMPANY') {
    const kompanija = await Kompanija.findOne({ where: { userID: userId } });
    if (!kompanija) return;
    await Notifikacija.update({ procitana: true }, { where: { kompanija_id: kompanija.id, procitana: false } });
    return;
  }

  if (user.role === 'KOORDINATOR') {
    const koordinator = await Koordinator.findOne({ where: { userID: userId } });
    if (!koordinator) return;
    await Notifikacija.update({ procitana: true }, { where: { koordinator_id: koordinator.id, procitana: false } });
  }
}

module.exports = {
  createNotification,
  createNotificationForKompanija,
  createNotificationForKoordinator,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
