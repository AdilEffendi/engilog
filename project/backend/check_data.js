const { Item } = require('./models');

const checkData = async () => {
    try {
        const items = await Item.findAll();
        items.forEach(item => {
            console.log(`Item: ${item.name}, Lat: ${item.latitude}, Lng: ${item.longitude}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkData();
