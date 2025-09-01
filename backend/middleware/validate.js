module.exports = {
  validateRegister: (req, res, next) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }
    if (!['patient', 'doctor', 'admin', 'pharmacist', 'lab_staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    next();
  },
  validateLogin: (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    next();
  }
};