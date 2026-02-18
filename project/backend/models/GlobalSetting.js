const { DataTypes } = require('sequelize');
const db = require('../config/database');

const GlobalSetting = db.define('GlobalSetting', {
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    value: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = GlobalSetting;
