const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/', auth(['admin']), analyticsController.getAnalytics);

module.org = router;