'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Ugovor',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      praksaID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      datumKreiranja: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      status: {
        type: DataTypes.ENUM('KREIRAN', 'POTPISAN', 'PONISTEN'),
        allowNull: false,
        defaultValue: 'KREIRAN',
      },
      dokumentUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'ugovori',
      timestamps: false,
    }
  );
};