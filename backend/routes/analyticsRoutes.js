<<<<<<< HEAD
// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const userController = require('../controllers/userController'); // Add this import
const { authenticate, authorize } = require('../middleware/auth');

// Analytics routes require authentication and admin authorization
router.get('/', authenticate, authorize(['admin']), analyticsController.getAnalytics);
router.get('/facility/:facilityType/:facilityId', authenticate, authorize(['admin']), analyticsController.getAnalyticsByFacility);

// This route should probably be in userRoutes.js, but if it's needed here:
router.get('/users/hospitals-clinics', authenticate, authorize(['admin']), userController.getHospitalsAndClinics);

module.exports = router;
=======
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.get('/', auth(['admin']), analyticsController.getAnalytics);

module.org = router;
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
