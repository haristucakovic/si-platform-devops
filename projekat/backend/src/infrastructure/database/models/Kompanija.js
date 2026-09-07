'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Kompanija',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      naziv: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      opisPoslovanja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      djelatnost: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      adresa: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      telefon: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      kontaktOsoba: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
    },
    {
      tableName: 'kompanije',
      timestamps: false,
    }
  );
};
