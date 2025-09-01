// routes/systemRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// Get all hospitals - accessible to admins
router.get('/hospitals', authenticate, authorize(['admin'], false), async (req, res) => {
  try {
    const userHospitalId = req.user.hospital_id;
    const isSuperAdmin = req.user.is_super_admin;

    let query = 'SELECT * FROM hospitals ORDER BY name';
    let queryParams = [];

    if (!isSuperAdmin && userHospitalId > 0) {
      query = 'SELECT * FROM hospitals WHERE id = $1 ORDER BY name';
      queryParams = [userHospitalId];
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch hospitals:', err);
    res.status(500).json({ error: 'Failed to fetch hospitals', details: err.message });
  }
});

// Get all clinics - accessible to admins
router.get('/clinics', authenticate, authorize(['admin'], false), async (req, res) => {
  try {
    const userHospitalId = req.user.hospital_id;
    const userClinicId = req.user.clinic_id;
    const isSuperAdmin = req.user.is_super_admin;

    let query = 'SELECT * FROM clinics ORDER BY name';
    let queryParams = [];

    if (!isSuperAdmin) {
      if (userClinicId > 0) {
        query = 'SELECT * FROM clinics WHERE id = $1 ORDER BY name';
        queryParams = [userClinicId];
      } else if (userHospitalId > 0) {
        query = 'SELECT * FROM clinics WHERE hospital_id = $1 ORDER BY name';
        queryParams = [userHospitalId];
      }
    }

    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch clinics:', err);
    res.status(500).json({ error: 'Failed to fetch clinics', details: err.message });
  }
});

module.exports = router;