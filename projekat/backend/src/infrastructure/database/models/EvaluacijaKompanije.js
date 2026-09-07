'use strict';

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EvaluacijaKompanije = sequelize.define('EvaluacijaKompanije', {
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
        organizacija: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        mentorstvo: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        radnoOkruzenje: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        relevantnoPosla: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1, max: 5 },
        },
        preporukaKompanija: {
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
        tableName: 'EvaluacijaKompanije',
        timestamps: true,
    });

    return EvaluacijaKompanije;
};