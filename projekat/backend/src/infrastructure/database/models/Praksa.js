'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Praksa',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      datumPocetka: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      datumKraja: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      prijavaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      razlogOdustajanja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      datumOdustajanja: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      datumObavijestiZavrsetka: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'prakse',
      timestamps: false,
    }
  );
};