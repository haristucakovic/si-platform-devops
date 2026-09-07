'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Oglas',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      naziv: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      opis: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      brojMjesta: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      datumObjave: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      rokPrijave: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      trajanje: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('AKTIVAN', 'ZATVOREN', 'ARHIVIRAN'),
        allowNull: false,
        defaultValue: 'AKTIVAN',
      },
      kompanijaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oblast: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      placenaPraksa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lokacija: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      tip: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: 'Onsite',
      },
      datumPocetka: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      tehnologije: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
      },
      uslovi: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
      },
    },
    {
      tableName: 'oglasi',
      timestamps: false,
    }
  );
};