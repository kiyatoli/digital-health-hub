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