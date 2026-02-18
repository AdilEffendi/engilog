const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Notification = db.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    recipientId: { // User ID who receives the notification
        type: DataTypes.STRING, // Assuming UUID/String IDs for users
        allowNull: false
    },
    senderId: { // User ID who triggered the action (optional, system could be null or specific ID)
        type: DataTypes.STRING,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
        defaultValue: 'info'
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    relatedId: { // ID of the related item/loan/etc.
        type: DataTypes.STRING,
        allowNull: true
    },
    relatedType: { // 'item', 'loan', 'maintenance', etc.
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

module.exports = Notification;
