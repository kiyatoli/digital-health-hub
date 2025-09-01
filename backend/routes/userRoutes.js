// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize, requireSuperAdmin } = require('../middleware/auth');

// All routes require authentication and admin authorization
router.get('/', authenticate, authorize(['admin'], true), userController.getAllUsers);
router.post('/', authenticate, authorize(['admin'], true), userController.createUser);
router.put('/:id', authenticate, authorize(['admin'], true), userController.updateUser);
router.delete('/:id/:type', authenticate, authorize(['admin'], true), userController.deleteUser);
router.get('/search', authenticate, authorize(['admin'], true), userController.searchUsers);
router.patch('/:id/status', authenticate, authorize(['admin'], true), userController.toggleUserStatus);

// Super admin only routes for hospital/clinic management
router.post('/hospitals', authenticate, requireSuperAdmin, userController.createHospital);
router.post('/clinics', authenticate, requireSuperAdmin, userController.createClinic);

module.exports = router;