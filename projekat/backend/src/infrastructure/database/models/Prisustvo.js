'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Prisustvo',
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
      datum: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      brojSati: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      napomena: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'prisustva',
      timestamps: false,
    }
  );
};