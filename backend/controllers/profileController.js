// controllers/profileController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (userRole === 'patient') {
      const result = await pool.query(
        'SELECT id, name as full_name, email, phone, dob as date_of_birth, address FROM patients WHERE id = $1',
        [userId]
      );
      res.json({ ...result.rows[0], role: 'patient' });
    } else {
      const result = await pool.query(
        'SELECT id, username, email, role, phone, full_name, sex, age FROM users WHERE id = $1',
        [userId]
      );
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { username, email, phone, full_name, sex, age, date_of_birth, address, password } = req.body;
    
    if (userRole === 'patient') {
      let query = `UPDATE patients SET name = $1, email = $2, phone = $3, dob = $4, address = $5`;
      let values = [full_name, email, phone, date_of_birth, address, userId];
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `, password = $6 WHERE id = $7 RETURNING *`;
        values = [full_name, email, phone, date_of_birth, address, hashedPassword, userId];
      } else {
        query += ` WHERE id = $6 RETURNING *`;
      }
      
      const result = await pool.query(query, values);
      res.json({ ...result.rows[0], role: 'patient' });
    } else {
      let query = `UPDATE users SET username = $1, email = $2, phone = $3, full_name = $4, sex = $5, age = $6`;
      let values = [username, email, phone, full_name, sex, age, userId];
      
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query += `, password_hash = $7 WHERE id = $8 RETURNING *`;
        values = [username, email, phone, full_name, sex, age, hashedPassword, userId];
      } else {
        query += ` WHERE id = $7 RETURNING *`;
      }
      
      const result = await pool.query(query, values);
      res.json(result.rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};