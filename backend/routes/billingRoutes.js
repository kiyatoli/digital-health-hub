const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const billingController = require('../controllers/billingController');

router.post('/', auth(['admin']), billingController.createInvoice);

module.exports = router;