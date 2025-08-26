const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validate');
const auth = require('../middleware/auth');

router.post('/register', (req, res, next) => {
  // Allow public registration only for patients
  if (req.body.role !== 'patient') {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Authentication required for non-patient roles' });
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== 'admin') return res.status(403).json({ error: 'Only admins can create non-patient roles' });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
  validateRegister(req, res, next);
}, authController.register);

router.post('/login', validateLogin, authController.login);
router.post('/verify-mfa', authController.verifyMFA);
router.get('/me', auth(), authController.getUser);
router.put('/update', auth(), authController.update);

module.exports = router;