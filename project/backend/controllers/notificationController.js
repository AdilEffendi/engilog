const { Notification } = require('../models');

exports.getNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            console.error("[NotificationController] User not found in request");
            return res.status(401).json({ message: "User not authenticated" });
        }

        const userId = req.user.id;
        console.log(`[NotificationController] Fetching notifications for user: ${userId}`);

        const notifications = await Notification.findAll({
            where: { recipientId: userId },
            include: [
                { model: require('../models').User, as: 'sender', attributes: ['name'] }
            ],
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        console.log(`[NotificationController] Found ${notifications.length} notifications`);
        res.json(notifications);
    } catch (error) {
        console.error("[NotificationController] Error fetching notifications:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        await Notification.update({ isRead: true }, {
            where: { id: id, recipientId: userId }
        });

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        await Notification.update({ isRead: true }, {
            where: { recipientId: userId, isRead: false }
        });

        res.json({ message: 'All marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
