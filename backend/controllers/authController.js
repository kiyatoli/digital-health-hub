const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.register = async (req, res) => {
  const { username, email, password, role, phone, hospital_id, clinic_id } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash, role, phone, hospital_id, clinic_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [username, email, hashedPassword, role, phone, hospital_id, clinic_id]
    );
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'register', `User ${username} registered`]
    );
    res.status(201).json({ message: 'User registered', userId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (!user.rows.length || !await bcrypt.compare(password, user.rows[0].password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await pool.query('UPDATE users SET mfa_secret = $1 WHERE id = $2', [otp, user.rows[0].id]);
    await sendEmail(email, 'Your OTP Code', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent', userId: user.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.update = async (req, res) => {
  const { username, email, phone, password } = req.body;
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  try {
    await pool.query(
      'UPDATE users SET username = $1, email = $2, phone = $3' + (hashedPassword ? ', password_hash = $4' : '') + ' WHERE id = $5',
      [username, email, phone, ...(hashedPassword ? [hashedPassword] : []), req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.verifyMFA = async (req, res) => {
  const { userId, otp } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user.rows.length || user.rows[0].mfa_secret !== otp) {
      return res.status(401).json({ error: 'Invalid OTP' });
    }
    await pool.query('UPDATE users SET mfa_secret = NULL WHERE id = $1', [userId]);
    const token = jwt.sign({ id: userId, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await pool.query('SELECT id, username, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};