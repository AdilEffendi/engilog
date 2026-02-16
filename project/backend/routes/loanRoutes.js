const express = require('express');
const router = express.Router({ mergeParams: true });
const loanController = require('../controllers/loanController');

router.post('/', loanController.addLoanRecord);

module.exports = router;
