const db = require('./config/database');

async function checkSchema() {
    try {
        await db.authenticate();
        console.log('Database connected...');

        const [results, metadata] = await db.query("DESCRIBE Items");
        console.log("Schema for Items table:");
        console.table(results);

    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        await db.close();
        process.exit();
    }
}

checkSchema();
