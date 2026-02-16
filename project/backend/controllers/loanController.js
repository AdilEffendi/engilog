const { LoanRecord, Item } = require('../models');

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

        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
