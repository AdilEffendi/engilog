const { LoanRecord, Item } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

exports.addLoanRecord = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const record = await LoanRecord.create({
            ...req.body,
            itemId
        });

        // Update item status if needed (e.g. statusMesin = 'Dipinjam')
        if (req.body.statusMesin) {
            item.statusMesin = req.body.statusMesin;
            await item.save();
        }

        // Send Notification
        const senderId = req.user ? req.user.id : (req.body.peminjam || 'unknown');
        await createNotification(
            'ALL',
            senderId,
            'info',
            `Peminjaman baru dicatat untuk Item ID ${itemId}.`,
            itemId,
            'loan',
            req.io
        );

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
