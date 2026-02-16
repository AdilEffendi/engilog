const db = require('./config/database');
const { Item, User, MaintenanceRecord } = require('./models');

const seedData = async () => {
    try {
        await db.sync({ force: true });
        console.log('Database synced!');

        // Users
        const users = [
            { id: "1", name: "admin", password: "password", role: "admin", createdAt: new Date() },
            { id: "2", name: "superadmin", password: "password", role: "superadmin", createdAt: new Date() },
            { id: "3", name: "peminjam", password: "peminjam", role: "peminjam", createdAt: new Date() },
            { id: "4", name: "teknisi", password: "teknisi", role: "teknisi", createdAt: new Date() },
            { id: "5", name: "epi", password: "epi", role: "peminjam", createdAt: new Date() },
        ];

        await User.bulkCreate(users);
        console.log('Users seeded!');

        // Generate 10 Items with similar coordinates
        const items = [];
        const baseLat = -1.2743738;
        const baseLng = 116.8569723;
        const categories = ["HVAC", "Power", "Plumbing", "Security", "Transport"];
        const statuses = ["Normal", "Rusak", "Maintenance", "Standby"];

        for (let i = 1; i <= 10; i++) {
            const randomCat = categories[Math.floor(Math.random() * categories.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            // Random tiny offset for coordinates (approx 10-20 meters)
            const latOffset = (Math.random() - 0.5) * 0.0002;
            const lngOffset = (Math.random() - 0.5) * 0.0002;

            items.push({
                id: i.toString(),
                name: `Item ${randomCat} ${i.toString().padStart(2, '0')}`,
                description: `Deskripsi otomatis untuk item ${i} dengan koordinat acak.`,
                category: randomCat,
                quantity: 1,
                location: "Pentacity Mall - Area Teknis",
                latitude: baseLat + latOffset,
                longitude: baseLng + lngOffset,
                status: "aktif",
                createdBy: "admin",
                createdAt: new Date(),
                updatedAt: new Date(),
                assetId: `AST-AUTO-${i.toString().padStart(3, '0')}`,
                machineName: `Mesin ${randomCat} Tipe-${i}`,
                brand: "Generic Brand",
                model: `Model-X${i}`,
                serialNumber: `SN-2024-${1000 + i}`,
                assetTag: `TAG-${2000 + i}`,
                statusMesin: randomStatus,
                tingkatPrioritas: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
                kondisiFisik: ["Bagus", "Sedang", "Buruk"][Math.floor(Math.random() * 3)],
                jamOperasional: `${Math.floor(Math.random() * 5000)} Jam`,
            });
        }

        await Item.bulkCreate(items);
        console.log('Items seeded with clustered coordinates!');

        // Add some maintenance records for context
        // ... (Optional, can add later if needed)

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedData();
