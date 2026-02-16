const { Sequelize } = require('sequelize');

// Database configuration
// Using default XAMPP/WAMP credentials: root, no password
const db = new Sequelize('engineering_web', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

module.exports = db;
