const { GlobalSetting } = require('../models');

exports.getSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await GlobalSetting.findOne({ where: { key } });
        if (!setting) {
            return res.json(null); // Return null instead of 404
        }
        res.json(setting.value);
    } catch (error) {
        console.error("Error in getSetting:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        // Return the relative URL for the uploaded file
        const photoUrl = `/uploads/${req.file.filename}`;
        res.json({ photoUrl });
    } catch (error) {
        console.error("Error in uploadPhoto:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        let setting = await GlobalSetting.findOne({ where: { key } });

        if (setting) {
            await setting.update({ value });
        } else {
            setting = await GlobalSetting.create({ key, value });
        }

        res.json({ message: 'Setting updated successfully', value: setting.value });
    } catch (error) {
        console.error("Error in updateSetting:", error);
        res.status(500).json({ message: error.message });
    }
};
