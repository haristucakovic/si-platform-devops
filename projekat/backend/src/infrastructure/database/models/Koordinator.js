'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Koordinator',
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
      fakultetID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      odsjekID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'koordinatori',
      timestamps: false,
    }
  );
};