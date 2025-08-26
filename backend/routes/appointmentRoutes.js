const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const appointmentController = require('../controllers/appointmentController');

router.post('/', auth(['patient']), appointmentController.bookAppointment);
router.put('/:id', auth(['patient', 'doctor']), appointmentController.reschedule);
router.delete('/:id', auth(['patient']), appointmentController.cancel);
router.get('/', auth(['doctor']), appointmentController.getQueue);

module.exports = router;