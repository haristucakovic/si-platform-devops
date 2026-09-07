'use strict';

const listingsService = require('../services/listings.service');

async function createListing(req, res) {
  try {
    const { naziv, opis, brojMjesta, rokPrijave } = req.body;

    if (!naziv || !opis || !brojMjesta || !rokPrijave) {
      return res.status(400).json({
        message: 'Naziv, opis, broj mjesta i rok prijave su obavezni.',
      });
    }

    if (!Number.isInteger(Number(brojMjesta)) || Number(brojMjesta) <= 0) {
      return res.status(400).json({
        message: 'Broj mjesta mora biti pozitivan broj.',
      });
    }

    if (new Date(rokPrijave) <= new Date()) {
      return res.status(400).json({
        message: 'Rok prijave mora biti u buducnosti.',
      });
    }

    const oglas = await listingsService.createListing(req.body, req.user.id);

    return res.status(201).json({
      message: 'Oglas je uspjesno kreiran i objavljen.',
      oglas,
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
}

async function getCompanyListings(req, res) {
  try {
    const listings = await listingsService.getListingsByCompany(req.user.id);
    return res.json(listings);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
}

async function getActiveListings(req, res) {
  try {
    const listings = await listingsService.getActiveListings();
    return res.json(listings);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
    });
  }
}

async function updateListing(req, res) {
  try {
    const id = Number(req.params.id);
    const { naziv, opis, brojMjesta, rokPrijave } = req.body;

    if (!naziv || !opis || !brojMjesta || !rokPrijave) {
      return res.status(400).json({ message: 'Naziv, opis, broj mjesta i rok prijave su obavezni.' });
    }

    if (!Number.isInteger(Number(brojMjesta)) || Number(brojMjesta) <= 0) {
      return res.status(400).json({ message: 'Broj mjesta mora biti pozitivan broj.' });
    }

    if (new Date(rokPrijave) <= new Date()) {
      return res.status(400).json({ message: 'Rok prijave mora biti u budućnosti.' });
    }

    const oglas = await listingsService.updateListing(id, req.body, req.user.id);

    return res.json({ message: 'Oglas je uspješno ažuriran.', oglas });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function getClosedListings(req, res) {
  try {
    const listings = await listingsService.getClosedListings();
    return res.json(listings);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function getClosedListingsByCompany(req, res) {
  try {
    const listings = await listingsService.getClosedListingsByCompany(req.user.id);
    return res.json(listings);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

// === NOVI KONTROLERI ===

async function closeListing(req, res) {
  try {
    const id = Number(req.params.id);
    const oglas = await listingsService.closeListing(id, req.user.id);
    return res.json({ message: 'Oglas je uspješno zatvoren.', oglas });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function archiveListing(req, res) {
  try {
    const id = Number(req.params.id);
    const oglas = await listingsService.archiveListing(id, req.user.id);
    return res.json({ message: 'Oglas je uspješno arhiviran.', oglas });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function restoreFromArchive(req, res) {
  try {
    const id = Number(req.params.id);
    const oglas = await listingsService.restoreFromArchive(id, req.user.id);
    return res.json({ message: 'Oglas je uspješno vraćen iz arhive.', oglas });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = {
  createListing,
  getCompanyListings,
  getActiveListings,
  updateListing,
  getClosedListings,
  getClosedListingsByCompany,
  closeListing,
  archiveListing,
  restoreFromArchive,
};
