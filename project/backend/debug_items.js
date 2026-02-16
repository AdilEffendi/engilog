const db = require('./config/database');
const Item = require('./models/Item');
const MaintenanceRecord = require('./models/MaintenanceRecord'); // Ensure these exist and are exported correctly
const LoanRecord = require('./models/LoanRecord');

async function debugItems() {
    try {
        await db.authenticate();
        console.log('Database connected...');

        // Exact query from controller
        const items = await Item.findAll({
            include: [
                { model: MaintenanceRecord, as: 'maintenanceRecords' },
                { model: LoanRecord, as: 'loanRecords' }
            ]
        });
        console.log("Successfully fetched " + items.length + " items with relations.");

        items.forEach(item => {
            console.log(`Item: ${item.name} (ID: ${item.id})`);
            console.log(`Photos type:`, typeof item.photos);
            console.log(`Photos value:`, item.photos);
        });

        // Try to JSON stringify to catch circular refs or serialization errors
        JSON.stringify(items);
        console.log("Serialization successful.");

    } catch (error) {
        console.error("FATAL ERROR FETCHING ITEMS:", error);
    } finally {
        await db.close();
    }
}

debugItems();
