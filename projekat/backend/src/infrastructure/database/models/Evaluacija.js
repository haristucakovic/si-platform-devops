'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Evaluacija',
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
      ocjena: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      komentar: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipEvaluacije: {
        type: DataTypes.ENUM('STUDENT_OCJENJUJE_KOMPANIJU', 'KOMPANIJA_OCJENJUJE_STUDENTA'),
        allowNull: false,
      },
      datumEvaluacije: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'evaluacije',
      timestamps: false,
    }
  );
};