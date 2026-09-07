'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Notifikacija',
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      kompanija_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      koordinator_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prijava_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      tip: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      naslov: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      poruka: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      procitana: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'notifikacije',
      timestamps: false,
    }
  );
};
