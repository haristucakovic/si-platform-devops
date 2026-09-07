'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Izvjestaj',
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
      koordinatorID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      datumGenerisanja: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      sadrzaj: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dokumentUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: 'izvjestaji',
      timestamps: false,
    }
  );
};