const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to access itemId from parent router
const maintenanceController = require('../controllers/maintenanceController');

router.post('/', maintenanceController.addMaintenanceRecord);
router.put('/:id', maintenanceController.updateMaintenanceRecord);

module.exports = router;
