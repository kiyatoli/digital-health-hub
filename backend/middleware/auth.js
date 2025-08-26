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
};