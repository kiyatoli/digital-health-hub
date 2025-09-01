<<<<<<< HEAD
// middleware/auth.js
const jwt = require('jsonwebtoken');

// Main authentication middleware
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Authorization middleware (role-based with hospital/clinic restrictions)
const authorize = (roles = [], checkHospitalClinic = false) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (roles.length && !roles.includes(req.user.role) && !req.user.is_super_admin) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    // Check hospital/clinic restrictions for non-super admins
    if (checkHospitalClinic && !req.user.is_super_admin) {
      const userHospitalId = req.user.hospital_id;
      const userClinicId = req.user.clinic_id;
      const targetHospitalId = req.params.hospitalId || req.body.hospital_id;
      const targetClinicId = req.params.clinicId || req.body.clinic_id;

      // Convert to numbers and handle null/undefined values
      const userHospId = userHospitalId ? parseInt(userHospitalId) : null;
      const userClinId = userClinicId ? parseInt(userClinicId) : null;
      const targetHospId = targetHospitalId ? parseInt(targetHospitalId) : null;
      const targetClinId = targetClinicId ? parseInt(targetClinicId) : null;

      // Admin can only access resources within their hospital
      if (userHospId && targetHospId && userHospId !== targetHospId) {
        return res.status(403).json({ error: 'Access denied. Cannot access resources outside your hospital.' });
      }

      // Admin can only access resources within their clinic
      if (userClinId && targetClinId && userClinId !== targetClinId) {
        return res.status(403).json({ error: 'Access denied. Cannot access resources outside your clinic.' });
      }
    }

    next();
  };
};

// Special middleware for super admin check
const requireSuperAdmin = (req, res, next) => {
  if (!req.user.is_super_admin) {
    return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  requireSuperAdmin
=======
const jwt = require('jsonwebtoken');

module.exports = (roles = []) => (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) return res.status(403).json({ error: 'Access denied' });
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
};