'use strict';

/**
 * SystemSetting.js
 *
 * Putanja: backend/src/infrastructure/database/models/SystemSetting.js
 *
 * Pohrana globalnih podešavanja sistema (key/value).
 * Primjer: max_active_applications = "5"
 *
 * Nakon dodavanja fajla, Sequelize će automatski kreirati tabelu
 * pri sljedećem pokretanju (sync({ alter: true }) u server.js).
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SystemSetting = sequelize.define('SystemSetting', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'system_settings',
    timestamps: true,
  });

  return SystemSetting;
};