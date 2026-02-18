const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access itemId from parent router
const maintenanceController = require('../controllers/maintenanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Note: maintenance routes might be mounted as /items/:itemId/maintenance
// Controller expects itemId in params.

router.post('/', authMiddleware, maintenanceController.addMaintenanceRecord);
router.put('/:id', authMiddleware, maintenanceController.updateMaintenanceRecord);

module.exports = router;
