'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Aktivnost',
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
        defaultValue: DataTypes.NOW,
      },
      opis: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
     
    },
    {
      tableName: 'aktivnosti',
      timestamps: false,
    }
  );
};