'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'PrijavaNaPraksu',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      studentID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      oglasID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      koordinatorID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(
          'CEKA_KOORDINATORA',
          'CEKA_KOMPANIJU',
          'U_RAZMATRANJU',
          'ODOBRENA',
          'ODBIJENA_KOORDINATOR',
          'ODBIJENA_KOMPANIJA',
          'ODUSTAO',
          'PODNESENA',
          'ODBIJENA'
        ),
        allowNull: false,
        defaultValue: 'CEKA_KOORDINATORA',
      },
      koordinatorStatus: {
        type: DataTypes.ENUM('NA_CEKANJU', 'ODOBRENO', 'ODBIJENO'),
        allowNull: false,
        defaultValue: 'NA_CEKANJU',
      },
      kompanijaStatus: {
        type: DataTypes.ENUM(
          'NIJE_DOSTUPNO',
          'NA_CEKANJU',
          'U_RAZMATRANJU',
          'ODOBRENO',
          'ODBIJENO'
        ),
        allowNull: false,
        defaultValue: 'NIJE_DOSTUPNO',
      },
      studentStatus: {
        type: DataTypes.ENUM(
          'NIJE_DOSTUPNO',
          'NA_CEKANJU',
          'PRIHVACENO',
          'ODBIJENO'
        ),
        allowNull: false,
        defaultValue: 'NIJE_DOSTUPNO',
      },
      studentOdlucioAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      datumPrijave: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      cv: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      motivacionoPismo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      datumOdustajanja: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      razlogOdbijanja: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'prijave_na_praksu',
      timestamps: false,
    }
  );
};
