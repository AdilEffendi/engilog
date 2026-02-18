const { MaintenanceRecord, Item } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

exports.addMaintenanceRecord = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const record = await MaintenanceRecord.create({
            ...req.body,
            itemId
        });

        // Optionally update item status if provided in the body (e.g., statusMesin)
        if (req.body.statusMesin) {
            item.statusMesin = req.body.statusMesin;
            await item.save();
        }

        // Send Notification
        const senderId = req.user ? req.user.id : (req.body.teknisi || 'unknown');
        await createNotification(
            'ALL',
            senderId,
            'warning',
            `Maintenance baru dicatat for Item ID ${itemId}.`,
            itemId,
            'maintenance',
            req.io
        );

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateMaintenanceRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await MaintenanceRecord.findByPk(id);

        if (!record) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }

        await record.update(req.body);

        // Also update item status if provided
        if (req.body.statusMesin || req.body.kondisiAkhir) {
            const item = await Item.findByPk(record.itemId);
            if (item) {
                // Map kondisiAkhir to statusMesin if needed, or just take statusMesin
                if (req.body.statusMesin) item.statusMesin = req.body.statusMesin;
                // If kondisiAkhir says "Normal", maybe set statusMesin to "Normal"?
                // Creating a simple logic:
                if (req.body.kondisiAkhir === 'Normal') item.statusMesin = 'Normal';
                if (req.body.kondisiAkhir === 'Rusak') item.statusMesin = 'Rusak';
                if (req.body.kondisiAkhir === 'Standby') item.statusMesin = 'Standby';

                await item.save();
            }
        }

        res.json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
