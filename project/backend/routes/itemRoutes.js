const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

const upload = require('../middleware/uploadMiddleware');

router.get('/', itemController.getAllItems);
router.post('/', upload.array('photos', 10), itemController.createItem);
router.put('/:id', upload.array('photos', 10), itemController.updateItem);
router.post('/:id/maintenance', upload.array('photos', 10), itemController.addMaintenanceRecord);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
