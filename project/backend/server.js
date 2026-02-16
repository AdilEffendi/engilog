const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/uploads'));

// Database Connection
db.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.log('Error: ' + err));

// Routes
const authRoutes = require('./routes/authRoutes');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const loanRoutes = require('./routes/loanRoutes');

app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

// Mount nested routes
// We need to mount maintenance and loans under items potentially, OR directly.
// Given the controllers use mergeParams and expect itemId, let's restructure:
// Actually, let's keep it simple:
// POST /maintenance/:itemId
// But standard REST is POST /items/:itemId/maintenance
// To support that, we need to modify itemRoutes to use these.

// Simpler approach for now:
app.use('/maintenance', maintenanceRoutes); // But maintenanceRoutes expects itemId in params?
// No, I wrote `const { itemId } = req.params;` in controller.
// If I mount at `/maintenance`, where does itemId come from?
// It must be in the body or URL.
// Let's modify the controller to expect itemId in body if not in params, OR change route.

// Better approach:
// app.use('/items/:itemId/maintenance', maintenanceRoutes);
// app.use('/items/:itemId/loans', loanRoutes);

app.use('/items/:itemId/maintenance', maintenanceRoutes);
app.use('/items/:itemId/loans', loanRoutes);

// Sync Database
db.sync({ alter: true }) // Updates schema without dropping tables
    .then(() => console.log('Database synced'))
    .catch(err => console.log('Error syncing database: ' + err));

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
