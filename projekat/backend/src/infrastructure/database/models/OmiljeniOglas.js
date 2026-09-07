'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('OmiljeniOglas', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    studentID: { type: DataTypes.INTEGER, allowNull: false },
    oglasID: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'omiljeni_oglasi',
    timestamps: false,
  });
};
