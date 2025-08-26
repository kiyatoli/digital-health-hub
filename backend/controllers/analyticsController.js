const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    const appointments = await pool.query('SELECT COUNT(*) FROM appointments WHERE status = $1', ['confirmed']);
    const revenue = await pool.query('SELECT SUM(amount) as total FROM billing WHERE status = $1', ['paid']);
    const demographics = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    res.json({
      appointments: appointments.rows[0].count,
      revenue: revenue.rows[0].total || 0,
      demographics: demographics.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};