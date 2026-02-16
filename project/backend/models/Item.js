const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Item = db.define('Item', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('aktif', 'tidak_aktif'),
        defaultValue: 'aktif'
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assetId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    machineName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: true
    },
    model: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    assetTag: {
        type: DataTypes.STRING,
        allowNull: true
    },
    statusMesin: {
        type: DataTypes.STRING,
        defaultValue: 'Normal'
    },
    tingkatPrioritas: {
        type: DataTypes.STRING,
        allowNull: true
    },
    kondisiFisik: {
        type: DataTypes.STRING,
        allowNull: true
    },
    jamOperasional: {
        type: DataTypes.STRING,
        allowNull: true
    },
    photos: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    floor: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    }
});

module.exports = Item;
