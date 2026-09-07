'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Student',
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
        allowNull: true,
      },
      index_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      year_of_study: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      odsjekID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'students',
      timestamps: false,
    }
  );
};