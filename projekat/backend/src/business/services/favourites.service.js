'use strict';

const { OmiljeniOglas, Student, Oglas, Kompanija, User } = require('../../infrastructure/database/models');

async function addFavourite(userId, oglasId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) {
    const err = new Error('Studentski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  const oglas = await Oglas.findByPk(oglasId);
  if (!oglas) {
    const err = new Error('Oglas nije pronađen.');
    err.status = 404;
    throw err;
  }

  const existing = await OmiljeniOglas.findOne({
    where: { studentID: student.id, oglasID: oglasId },
  });
  if (existing) return existing;

  return OmiljeniOglas.create({ studentID: student.id, oglasID: oglasId });
}

async function removeFavourite(userId, oglasId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) {
    const err = new Error('Studentski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  await OmiljeniOglas.destroy({
    where: { studentID: student.id, oglasID: oglasId },
  });
}

async function getFavourites(userId) {
  const student = await Student.findOne({ where: { userID: userId } });
  if (!student) {
    const err = new Error('Studentski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  const rows = await OmiljeniOglas.findAll({ where: { studentID: student.id } });
  const ids = rows.map(r => r.oglasID);

  if (ids.length === 0) return { ids: [], listings: [] };

  const listings = await Oglas.findAll({
    where: { id: ids },
    include: [{
      model: Kompanija,
      attributes: ['id', 'naziv', 'kontaktOsoba'],
      include: [{ model: User, attributes: ['email'] }],
    }],
  });

  return { ids, listings };
}

module.exports = { addFavourite, removeFavourite, getFavourites };
