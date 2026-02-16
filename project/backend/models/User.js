const { DataTypes } = require('sequelize');
const db = require('../config/database');

const User = db.define('User', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    passwordPlaintext: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('superadmin', 'admin', 'peminjam', 'teknisi'),
        allowNull: false,
        defaultValue: 'peminjam'
    },
    nik: {
        type: DataTypes.STRING,
        allowNull: true
    },
    division: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Additional fields from User Management that might exist
});

module.exports = User;
