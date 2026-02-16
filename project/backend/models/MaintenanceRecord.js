const { DataTypes } = require('sequelize');
const db = require('../config/database');

const MaintenanceRecord = db.define('MaintenanceRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // itemId will be added by association
    tanggalKerusakan: {
        type: DataTypes.DATE,
        allowNull: true
    },
    penyebab: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    tindakan: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    kondisiAkhir: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teknisi: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tanggalSelesai: {
        type: DataTypes.DATE,
        allowNull: true
    },
    foto: {
        type: DataTypes.TEXT, // Changed to TEXT to store JSON string of paths
        allowNull: true
    }
});

module.exports = MaintenanceRecord;
