const { Sequelize } = require('sequelize');

async function createDatabase() {
    // Connect to MySQL server without selecting a database
    const sequelize = new Sequelize('', 'root', '', {
        host: 'localhost',
        dialect: 'mysql',
        logging: false
    });

    try {
        await sequelize.authenticate();
        console.log('Connected to MySQL server.');

        await sequelize.query(`CREATE DATABASE IF NOT EXISTS engineering_web;`);
        console.log('Database "engineering_web" created or already exists.');

        await sequelize.close();
    } catch (error) {
        console.error('Unable to create database:', error);
        process.exit(1);
    }
}

createDatabase();
