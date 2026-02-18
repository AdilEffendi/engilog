const { Notification, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a notification and emit via Socket.io
 * @param {string|Array} recipientIds - User ID(s) to receive notification. If 'ALL', sends to all except sender.
 * @param {string} senderId - User ID who triggered the action.
 * @param {string} type - 'info', 'warning', 'success', 'error'
 * @param {string} message - Notification message
 * @param {string} relatedId - ID of related resource
 * @param {string} relatedType - Type of related resource
 * @param {object} io - Socket.io instance
 */
exports.createNotification = async (recipientIds, senderId, type, message, relatedId, relatedType, io) => {
    try {
        let targets = [];

        if (recipientIds === 'ALL') {
            // Get all users except sender
            // Get all users except sender (if sender is known)
            const whereClause = {};
            if (senderId) {
                whereClause.id = { [Op.ne]: senderId };
            }

            const users = await User.findAll({
                where: whereClause,
                attributes: ['id']
            });
            targets = users.map(u => u.id);
            console.log(`[NotificationHelper] 'ALL' resolved to ${targets.length} users (Sender: ${senderId})`);
        } else if (Array.isArray(recipientIds)) {
            targets = recipientIds;
        } else {
            targets = [recipientIds];
        }

        console.log(`[NotificationHelper] Creating notifications for targets:`, targets);

        const notifications = targets.map(rId => ({
            recipientId: rId,
            senderId,
            type,
            message,
            relatedId,
            relatedType,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }));

        if (notifications.length > 0) {
            const createdNotifications = await Notification.bulkCreate(notifications);

            // Emit to each recipient
            createdNotifications.forEach(notif => {
                if (io) {
                    console.log(`[NotificationHelper] Emitting to room user-${notif.recipientId}`);
                    io.to(`user-${notif.recipientId}`).emit('receive_notification', notif);
                } else {
                    console.error("[NotificationHelper] IO instance is missing!");
                }
            });
        }

    } catch (error) {
        console.error("Error creating notification:", error);
    }
};
