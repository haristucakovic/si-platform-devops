'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define(
    'AuditLog',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      userName: {
        type: DataTypes.STRING(220),
        allowNull: true,
      },
      userEmail: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
      userRole: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      actionType: {
        type: DataTypes.STRING(80),
        allowNull: false,
      },
      details: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'audit_logs',
      timestamps: false,
    }
  );
};
