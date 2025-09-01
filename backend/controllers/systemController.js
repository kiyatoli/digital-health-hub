// controllers/systemController.js
const pool = require('../config/db');

exports.getHospitals = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, location FROM hospitals ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch hospitals', details: err.message });
  }
};

exports.getClinics = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, location, hospital_id FROM clinics ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clinics', details: err.message });
  }
};