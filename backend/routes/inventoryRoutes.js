const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const inventoryController = require('../controllers/inventoryController');

const upload = multer({ dest: 'uploads/' });

router.post('/', auth(['pharmacist', 'admin']), inventoryController.addInventory);
router.post('/upload', auth(['admin']), upload.single('file'), inventoryController.uploadInventory);

module.exports = router;