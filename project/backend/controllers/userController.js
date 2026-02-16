const { User } = require('../models');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll(); // Included password and passwordPlaintext
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        if (req.body.password) {
            userData.passwordPlaintext = req.body.password;
            // Note: If hashing is implemented in model hooks, it will handle it.
            // If not, we might need to hash here, but for now following existing pattern.
        }
        const user = await User.create(userData);
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const userData = { ...req.body };
        if (req.body.password) {
            userData.passwordPlaintext = req.body.password;
        }
        const [updated] = await User.update(userData, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedUser = await User.findByPk(req.params.id);
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
