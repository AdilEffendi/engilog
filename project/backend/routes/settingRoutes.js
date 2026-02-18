const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');
const upload = require('../middleware/uploadMiddleware');

router.get('/:key', settingController.getSetting);
router.post('/upload-photo', upload.single('photo'), settingController.uploadPhoto);
router.post('/:key', settingController.updateSetting);

module.exports = router;
