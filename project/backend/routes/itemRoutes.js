const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', itemController.getAllItems);
router.post('/', authMiddleware, upload.array('photos', 10), itemController.createItem);
router.put('/:id', authMiddleware, upload.array('photos', 10), itemController.updateItem);
router.post('/:id/maintenance', authMiddleware, upload.array('photos', 10), itemController.addMaintenanceRecord);
router.delete('/:id', authMiddleware, itemController.deleteItem);

module.exports = router;
