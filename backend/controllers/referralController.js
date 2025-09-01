const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.createReferral = async (req, res) => {
  const { patient_id, to_doctor_id, to_location_id, reason } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO referrals (patient_id, from_doctor_id, to_doctor_id, from_location_id, to_location_id, reason) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [patient_id, req.user.id, to_doctor_id, req.user.hospital_id || req.user.clinic_id, to_location_id, reason]
    );
    const patient = await pool.query('SELECT email FROM users WHERE id = $1', [patient_id]);
    await sendEmail(patient.rows[0].email, 'Referral Created', `You have been referred: ${reason}`);
    res.status(201).json({ message: 'Referral created', referralId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};