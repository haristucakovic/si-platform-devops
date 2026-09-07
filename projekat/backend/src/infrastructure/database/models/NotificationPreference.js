'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'NotificationPreference',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },

      prijava_podnesena_in_app: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      prijava_podnesena_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      prijava_odobrena_in_app: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      prijava_odobrena_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      prijava_odbijena_in_app: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      prijava_odbijena_email: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: 'notification_preferences',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );
};