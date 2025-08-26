const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const emrController = require('../controllers/emrController');

router.post('/', auth(['doctor']), emrController.updateEMR);
router.get('/:patient_id', auth(['patient', 'doctor']), emrController.getEMR);

module.exports = router;