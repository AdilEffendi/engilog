const { DataTypes } = require('sequelize');
const db = require('../config/database');

const LoanRecord = db.define('LoanRecord', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // itemId will be added by association
    borrowerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    department: {
        type: DataTypes.STRING,
        allowNull: true
    },
    borrowDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    condition: {
        type: DataTypes.STRING,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    returnedBy: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = LoanRecord;
