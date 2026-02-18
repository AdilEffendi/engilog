const express = require('express');
const router = express.Router({ mergeParams: true });
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, loanController.addLoanRecord);

module.exports = router;
