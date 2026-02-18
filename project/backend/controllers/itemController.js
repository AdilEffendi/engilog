const { Item, MaintenanceRecord, LoanRecord } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.findAll({
            include: [
                { model: MaintenanceRecord, as: 'maintenanceRecords' },
                { model: LoanRecord, as: 'loanRecords' }
            ]
        });
        res.json(items);
    } catch (err) {
        console.error("Error in getAllItems:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.createItem = async (req, res) => {
    try {
        let photos = [];
        if (req.files && req.files.length > 0) {
            photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Handle base64 or existing string photos if any (though for create it's mostly new)
        // If frontend sends mixed data, we might need to parse. For now, assume FormData sends 'photos' as files.
        // But if frontend also sends textual photo URLs (unlikely for create), we'd need to handle that.

        // Sanitize numeric inputs
        const parseCoord = (val) => {
            const num = parseFloat(val);
            return isNaN(num) ? null : num;
        };

        const itemData = {
            ...req.body,
            photos: photos,
            quantity: req.body.quantity ? parseInt(req.body.quantity) : 1,
            floor: req.body.floor ? parseInt(req.body.floor) : 1,
            latitude: parseCoord(req.body.latitude),
            longitude: parseCoord(req.body.longitude)
        };

        const item = await Item.create(itemData);

        // Send Notification
        const senderId = req.user ? req.user.id : (req.body.createdBy || null);
        await createNotification(
            'ALL',
            senderId,
            'success',
            `Item ${item.name} baru saja ditambahkan.`,
            item.id,
            'item',
            req.io
        );

        res.status(201).json(item);
    } catch (err) {
        console.error("Error creating item:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        // Handle Photos
        // Logic:
        // 1. If req.files > 0, we append them.
        // 2. req.body.existingPhotos is used to set the base list.
        // 3. If req.body.existingPhotos is undefined AND req.files is empty, we Assume it's a partial update and KEEP existing photos.
        // 4. If user wants to delete all photos, they must send existingPhotos="[]" (or empty array) explicitly.

        let newPhotos = [];
        if (req.files && req.files.length > 0) {
            newPhotos = req.files.map(file => `/uploads/${file.filename}`);
        }

        let finalPhotos = item.photos; // Default to keeping existing

        // If the client explicitly sends existingPhotos (even as empty), we use it.
        if (req.body.existingPhotos !== undefined) {
            let existingPhotosInput = [];
            try {
                if (typeof req.body.existingPhotos === 'string') {
                    if (req.body.existingPhotos.trim().startsWith('[')) {
                        const parsed = JSON.parse(req.body.existingPhotos);
                        existingPhotosInput = Array.isArray(parsed) ? parsed : [req.body.existingPhotos];
                    } else if (req.body.existingPhotos.trim() === "") {
                        existingPhotosInput = [];
                    } else {
                        existingPhotosInput = [req.body.existingPhotos];
                    }
                } else if (Array.isArray(req.body.existingPhotos)) {
                    existingPhotosInput = req.body.existingPhotos;
                } else {
                    existingPhotosInput = [req.body.existingPhotos];
                }
            } catch (e) {
                console.error("Error parsing existingPhotos:", e);
                // If parse fails, maybe fallback to empty or keep? Let's assume empty if malformed intent.
                existingPhotosInput = [];
            }
            finalPhotos = [...existingPhotosInput, ...newPhotos];
        } else if (newPhotos.length > 0) {
            // If we have new photos but no existingPhotos defined, just append to current?
            // Standard "Edit" form usually sends existingPhotos. 
            // If partial update sends files but no existing list, usually means "add these".
            finalPhotos = [...(item.photos || []), ...newPhotos];
        }

        // Prepare item data - Only update fields present in req.body
        const itemData = { ...req.body };

        // Protect special fields
        if (req.body.quantity !== undefined) itemData.quantity = req.body.quantity ? parseInt(req.body.quantity) : 0;
        if (req.body.latitude !== undefined) itemData.latitude = req.body.latitude ? parseFloat(req.body.latitude) : null;
        if (req.body.longitude !== undefined) itemData.longitude = req.body.longitude ? parseFloat(req.body.longitude) : null;
        if (req.body.floor !== undefined) itemData.floor = req.body.floor ? parseInt(req.body.floor) : 1;

        // Use our resolved photos
        itemData.photos = finalPhotos;

        // Handle Maintenance Records if present
        if (req.body.maintenanceRecords) {
            let maintenanceRecords = [];
            try {
                if (typeof req.body.maintenanceRecords === 'string') {
                    maintenanceRecords = JSON.parse(req.body.maintenanceRecords);
                } else {
                    maintenanceRecords = req.body.maintenanceRecords;
                }
            } catch (e) {
                console.error("Error parsing maintenanceRecords:", e);
            }

            if (Array.isArray(maintenanceRecords)) {
                // Delete existing records to ensure sync (handles deletions and updates via replacement)
                await MaintenanceRecord.destroy({ where: { itemId: req.params.id } });

                // Create new records
                if (maintenanceRecords.length > 0) {
                    const recordsToCreate = maintenanceRecords.map(rec => ({
                        ...rec,
                        itemId: req.params.id,
                        id: undefined
                    }));
                    await MaintenanceRecord.bulkCreate(recordsToCreate);
                }
            }
        }

        // Handle Loan Records if present
        if (req.body.loanRecords) {
            let loanRecords = [];
            try {
                if (typeof req.body.loanRecords === 'string') {
                    loanRecords = JSON.parse(req.body.loanRecords);
                } else {
                    loanRecords = req.body.loanRecords;
                }
            } catch (e) {
                console.error("Error parsing loanRecords:", e);
            }

            if (Array.isArray(loanRecords)) {
                // Delete existing records to ensure sync
                await LoanRecord.destroy({ where: { itemId: req.params.id } });

                // Create new records
                if (loanRecords.length > 0) {
                    const recordsToCreate = loanRecords.map(rec => ({
                        ...rec,
                        itemId: req.params.id,
                        id: undefined
                    }));
                    await LoanRecord.bulkCreate(recordsToCreate);
                }
            }
        }

        await item.update(itemData);

        // Always fetch return data even if Item table didn't change (e.g. only maintenance records changed)
        const updatedItem = await Item.findByPk(req.params.id, {
            include: [
                { model: MaintenanceRecord, as: 'maintenanceRecords' },
                { model: LoanRecord, as: 'loanRecords' }
            ]
        });



        // Send Notification
        const senderId = req.user ? req.user.id : 'unknown';
        await createNotification(
            'ALL',
            senderId,
            'info',
            `Item ${updatedItem.name} telah diperbarui.`,
            updatedItem.id,
            'item',
            req.io
        );

        res.json(updatedItem);
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const deleted = await Item.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();

            // Send Notification
            const senderId = req.user ? req.user.id : 'unknown';
            await createNotification(
                'ALL',
                senderId,
                'warning',
                `Sebuah item telah dihapus.`,
                req.params.id,
                'item',
                req.io
            );
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addMaintenanceRecord = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await Item.findByPk(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        let photos = [];
        if (req.files && req.files.length > 0) {
            photos = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Parse existing photos if any (though usually empty for new record)
        // Store as JSON string
        const photoString = JSON.stringify(photos);

        const recordData = {
            itemId: itemId,
            tanggalKerusakan: req.body.tanggalKerusakan,
            penyebab: req.body.penyebab,
            tindakan: req.body.tindakan,
            kondisiAkhir: req.body.kondisiAkhir,
            teknisi: req.body.teknisi,
            tanggalSelesai: req.body.tanggalSelesai,
            foto: photoString
        };

        await MaintenanceRecord.create(recordData);

        // Update Item Status if provided
        if (req.body.statusMesin) {
            await item.update({ statusMesin: req.body.statusMesin });
        }

        // Fetch updated item to return
        const updatedItem = await Item.findByPk(itemId, {
            include: [
                { model: MaintenanceRecord, as: 'maintenanceRecords' },
                { model: LoanRecord, as: 'loanRecords' }
            ]
        });

        // Send Notification
        const senderId = req.user ? req.user.id : (req.body.teknisi || 'unknown');
        await createNotification(
            'ALL',
            senderId,
            'warning',
            `Maintenance baru dicatat untuk ${item.name}.`,
            itemId,
            'maintenance',
            req.io
        );

        res.json(updatedItem);
    } catch (err) {
        console.error("Error adding maintenance record:", err);
        res.status(500).json({ message: err.message });
    }
};
