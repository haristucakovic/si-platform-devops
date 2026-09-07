'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'Dokument',
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

      oglas_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      prijava_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      tip_dokumenta: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      original_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      file_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      file_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      mime_path: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      size: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: 'dokumenti',
      timestamps: false,
    }
  );
};