'use strict';

const { Kompanija, User, Oglas } = require('../../infrastructure/database/models');

async function getCompanyProfileForStudent(kompanijaId) {
  const kompanija = await Kompanija.findByPk(kompanijaId, {
    include: [{
      model: User,
      attributes: ['approvalStatus', 'status'],
    }],
  });

  if (!kompanija) {
    const err = new Error('Kompanija nije pronađena.');
    err.status = 404;
    throw err;
  }

  const owner = kompanija.User;
  if (!owner || owner.approvalStatus !== 'APPROVED' || owner.status !== 'ACTIVE') {
    const err = new Error('Profil ove kompanije trenutno nije dostupan.');
    err.status = 403;
    throw err;
  }

  const { Op } = require('sequelize');

  const oglasi = await Oglas.findAll({
    where: {
      kompanijaID: kompanija.id,
      status: 'AKTIVAN',
      rokPrijave: { [Op.gt]: new Date() },
    },
    attributes: ['id', 'naziv', 'lokacija', 'rokPrijave', 'opis'],
    order: [['datumObjave', 'DESC']],
  });

  return {
    kompanija: {
      id: kompanija.id,
      naziv: kompanija.naziv,
      opisPoslovanja: kompanija.opisPoslovanja,
      adresa: kompanija.adresa,
      djelatnost: kompanija.djelatnost,
      kontaktOsoba: kompanija.kontaktOsoba,
    },
    oglasi,
  };
}

module.exports = {
  getCompanyProfileForStudent,
};
