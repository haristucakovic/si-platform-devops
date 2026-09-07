'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EvaluacijaStudenta = sequelize.define('EvaluacijaStudenta', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        // Veza sa prijavom (PrijavaNaPraksu)
        // Novo:
        prijavaID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // Kriteriji ocjenjivanja (1-5)
        tehnickeVjestine: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        komunikacija: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        radnaEtika: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        inicijativa: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        timskiRad: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        ukupnaOcjena: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        komentar: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        datumEvaluacije: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'EvaluacijaStudenta',
        timestamps: true,
    });

    return EvaluacijaStudenta;
};