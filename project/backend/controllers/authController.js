const { User } = require('../models');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { name: username } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // In a real app, use JWT here
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
