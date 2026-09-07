'use strict';

const { Op } = require('sequelize');
const { Oglas, Kompanija, User, PrijavaNaPraksu } = require('../../infrastructure/database/models');
const { ACTION_TYPES, logAudit } = require('./audit.service');
const { APPLICATION_STATUS } = require('./applicationStatus.service');
const { calculatePracticeDates } = require('./prakse.service');

async function createListing(data, userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  // Mora biti kompanija
  if (user.role !== 'COMPANY') {
    const err = new Error('Samo kompanija može kreirati oglas.');
    err.status = 403;
    throw err;
  }

  // Mora biti email verifikovan
  if (!user.emailVerifikovan) {
    const err = new Error('Morate verifikovati email.');
    err.status = 403;
    throw err;
  }

  // Mora biti odobren
  if (user.approvalStatus !== 'APPROVED' || user.status !== 'ACTIVE') {
    const err = new Error('Vaš korisnički račun još nije odobren.');
    err.status = 403;
    throw err;
  }

  // Pronađi kompanijski profil
  const kompanija = await Kompanija.findOne({
    where: { userID: user.id },
  });

  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  calculatePracticeDates(data.datumPocetka, data.trajanje);

  const oglas = await Oglas.create({
    naziv: data.naziv,
    opis: data.opis,
    brojMjesta: data.brojMjesta,
    rokPrijave: data.rokPrijave,
    trajanje: data.trajanje ? String(data.trajanje) : null,
    oblast: data.oblast || null,
    placenaPraksa: data.placenaPraksa || false,
    lokacija: data.lokacija?.trim() || null,
    tip: data.tip || 'Onsite',
    datumPocetka: data.datumPocetka || null,
    tehnologije: Array.isArray(data.tehnologije) ? data.tehnologije.filter(Boolean) : [],
    uslovi: Array.isArray(data.uslovi) ? data.uslovi.filter(Boolean) : [],
    status: 'AKTIVAN',
    kompanijaID: kompanija.id,
  });

  return oglas;
}

async function getListingsByCompany(userId) {
  const kompanija = await Kompanija.findOne({
    where: { userID: userId },
  });

  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronadjen.');
    err.status = 404;
    throw err;
  }

  // Kompanija vidi sve svoje oglase (Aktivne, Zatvorene, Arhivirane)
  return Oglas.findAll({
    where: { kompanijaID: kompanija.id },
    order: [['datumObjave', 'DESC']],
  });
}

async function getActiveListings() {
  // Aktivni oglasi ne smiju biti arhivirani
  return Oglas.findAll({
    where: { status: 'AKTIVAN', rokPrijave: { [Op.gt]: new Date() } },
    include: [{
      model: Kompanija,
      attributes: ['id', 'naziv', 'kontaktOsoba'],
      include: [{ model: User, attributes: ['email'] }],
    }],
    order: [['datumObjave', 'DESC']],
  });
}

async function updateListing(id, data, userId) {
  const oglas = await Oglas.findByPk(id);
  if (!oglas) {
    const err = new Error('Oglas nije pronađen.');
    err.status = 404;
    throw err;
  }

  const user = await User.findByPk(userId);
  if (!user) {
    const err = new Error('Korisnik nije pronađen.');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'COMPANY') {
    const err = new Error('Samo kompanija može uređivati oglas.');
    err.status = 403;
    throw err;
  }

  const kompanija = await Kompanija.findOne({ where: { userID: user.id } });
  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  if (oglas.kompanijaID !== kompanija.id) {
    const err = new Error('Nemate dozvolu za uređivanje ovog oglasa.');
    err.status = 403;
    throw err;
  }

  if (oglas.status !== 'AKTIVAN') {
    const err = new Error('Zatvoreni ili arhivirani oglasi se ne mogu uređivati.');
    err.status = 400;
    throw err;
  }

  calculatePracticeDates(
    typeof data.datumPocetka !== 'undefined' ? data.datumPocetka : oglas.datumPocetka,
    typeof data.trajanje !== 'undefined' ? data.trajanje : oglas.trajanje
  );

  // Ako mijenjate rok prijave, mora biti u budućnosti
  if (data.rokPrijave && new Date(data.rokPrijave) <= new Date()) {
    const err = new Error('Rok prijave mora biti u budućnosti.');
    err.status = 400;
    throw err;
  }

  // Ako smanjujete broj mjesta, provjerite postoje li odobrene prijave
  if (typeof data.brojMjesta !== 'undefined') {
    const broj = Number(data.brojMjesta);
    if (!Number.isInteger(broj) || broj <= 0) {
      const err = new Error('Broj mjesta mora biti pozitivan cijeli broj.');
      err.status = 400;
      throw err;
    }
    const accepted = await PrijavaNaPraksu.count({
      where: { oglasID: id, status: APPLICATION_STATUS.APPROVED },
    });
    if (broj < accepted) {
      const err = new Error('Ne možete smanjiti broj mjesta ispod broja već odobrenih prijava.');
      err.status = 400;
      throw err;
    }
  }

  const updated = await oglas.update({
    naziv: data.naziv ?? oglas.naziv,
    opis: data.opis ?? oglas.opis,
    brojMjesta: typeof data.brojMjesta !== 'undefined' ? Number(data.brojMjesta) : oglas.brojMjesta,
    rokPrijave: data.rokPrijave ?? oglas.rokPrijave,
    trajanje: typeof data.trajanje !== 'undefined' ? String(data.trajanje) : oglas.trajanje,
    oblast: typeof data.oblast !== 'undefined' ? data.oblast : oglas.oblast,
    placenaPraksa: typeof data.placenaPraksa !== 'undefined' ? !!data.placenaPraksa : oglas.placenaPraksa,
    lokacija: typeof data.lokacija !== 'undefined' ? (data.lokacija?.trim() || null) : oglas.lokacija,
    tip: typeof data.tip !== 'undefined' ? data.tip : oglas.tip,
    datumPocetka: typeof data.datumPocetka !== 'undefined' ? data.datumPocetka : oglas.datumPocetka,
    tehnologije: Array.isArray(data.tehnologije) ? data.tehnologije.filter(Boolean) : oglas.tehnologije,
    uslovi: Array.isArray(data.uslovi) ? data.uslovi.filter(Boolean) : oglas.uslovi,
  });

  await logAudit({
    userID: userId,
    actionType: ACTION_TYPES.LISTING_UPDATED,
    details: {
      oglasID: oglas.id,
      naziv: updated.naziv,
      changedFields: Object.keys(data || {}),
    },
  });

  return updated;
}

async function getClosedListings() {
  // Javni pregled zatvorenih oglasa (ne prikazujemo arhivirane)
  return Oglas.findAll({
    where: {
      [Op.or]: [
        { status: 'ZATVOREN' },
        { status: 'AKTIVAN', rokPrijave: { [Op.lt]: new Date() } },
      ],
    },
    include: [{
      model: Kompanija,
      attributes: ['id', 'naziv', 'kontaktOsoba'],
      include: [{ model: User, attributes: ['email'] }],
    }],
    order: [['rokPrijave', 'DESC']],
  });
}

async function getClosedListingsByCompany(userId) {
  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija) {
    const err = new Error('Kompanijski profil nije pronađen.');
    err.status = 404;
    throw err;
  }

  // Kompanija vidi svoje zatvorene oglase (isključujemo arhivirane)
  return Oglas.findAll({
    where: {
      kompanijaID: kompanija.id,
      status: 'ZATVOREN'
    },
    order: [['rokPrijave', 'DESC']],
  });
}

// === NOVE FUNKCIJE ZA IMPLEMENTACIJU USLOVA ZADATKA ===

async function closeListing(id, userId) {
  const oglas = await Oglas.findByPk(id);
  if (!oglas) {
    const err = new Error('Oglas nije pronađen.');
    err.status = 404;
    throw err;
  }

  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija || oglas.kompanijaID !== kompanija.id) {
    const err = new Error('Nemate dozvolu za zatvaranje ovog oglasa.');
    err.status = 403;
    throw err;
  }

  if (oglas.status !== 'AKTIVAN') {
    const err = new Error('Moguće je zatvoriti samo aktivne oglase.');
    err.status = 400;
    throw err;
  }

  return await oglas.update({ status: 'ZATVOREN' });
}

async function archiveListing(id, userId) {
  const oglas = await Oglas.findByPk(id);
  if (!oglas) {
    const err = new Error('Oglas nije pronađen.');
    err.status = 404;
    throw err;
  }

  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija || oglas.kompanijaID !== kompanija.id) {
    const err = new Error('Nemate dozvolu za arhiviranje ovog oglasa.');
    err.status = 403;
    throw err;
  }

  // Uslov: Oglas mora biti prethodno zatvoren
  if (oglas.status !== 'ZATVOREN') {
    const err = new Error('Oglas mora biti prethodno zatvoren da bi se mogao arhivirati.');
    err.status = 400;
    throw err;
  }

  return await oglas.update({ status: 'ARHIVIRAN' });
}

async function restoreFromArchive(id, userId) {
  const oglas = await Oglas.findByPk(id);
  if (!oglas) {
    const err = new Error('Oglas nije pronađen.');
    err.status = 404;
    throw err;
  }

  const kompanija = await Kompanija.findOne({ where: { userID: userId } });
  if (!kompanija || oglas.kompanijaID !== kompanija.id) {
    const err = new Error('Nemate dozvolu za upravljanje ovim oglasom.');
    err.status = 403;
    throw err;
  }

  if (oglas.status !== 'ARHIVIRAN') {
    const err = new Error('Samo arhivirani oglasi se mogu vratiti iz arhive.');
    err.status = 400;
    throw err;
  }

  // Vraćamo ga u status 'ZATVOREN' kako bi kompanija mogla odlučiti hoće li produžiti rok i aktivirati ga ponovo
  return await oglas.update({ status: 'ZATVOREN' });
}

module.exports = {
  createListing,
  getListingsByCompany,
  getActiveListings,
  updateListing,
  getClosedListings,
  getClosedListingsByCompany,
  closeListing,
  archiveListing,
  restoreFromArchive,
};
