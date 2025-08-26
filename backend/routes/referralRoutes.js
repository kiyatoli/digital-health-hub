const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const referralController = require('../controllers/referralController');

router.post('/', auth(['doctor']), referralController.createReferral);

module.exports = router;