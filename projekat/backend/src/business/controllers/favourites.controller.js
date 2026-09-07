'use strict';

const favouritesService = require('../services/favourites.service');

async function addFavourite(req, res) {
  try {
    await favouritesService.addFavourite(req.user.id, req.params.oglasId);
    return res.status(201).json({ message: 'Oglas dodan u omiljene.' });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function removeFavourite(req, res) {
  try {
    await favouritesService.removeFavourite(req.user.id, req.params.oglasId);
    return res.json({ message: 'Oglas uklonjen iz omiljenih.' });
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

async function getFavourites(req, res) {
  try {
    const ids = await favouritesService.getFavourites(req.user.id);
    return res.json(ids);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
}

module.exports = { addFavourite, removeFavourite, getFavourites };
