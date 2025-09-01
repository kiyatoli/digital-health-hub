const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.bookAppointment = async (req, res) => {
  const { doctor_id, hospital_id, clinic_id, date_time } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, hospital_id, clinic_id, date_time) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, doctor_id, hospital_id, clinic_id, date_time]
    );
    const user = await pool.query('SELECT email FROM users WHERE id = $1', [req.user.id]);
    await sendEmail(user.rows[0].email, 'Appointment Booked', `Your appointment is scheduled for ${date_time}`);
    await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', 
      [req.user.id, 'book_appointment', `Appointment ID ${result.rows[0].id}`]);
    res.status(201).json({ message: 'Appointment booked', appointmentId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reschedule = async (req, res) => {
  const { id } = req.params;
  const { date_time } = req.body;
  try {
    await pool.query('UPDATE appointments SET date_time = $1 WHERE id = $2 AND (patient_id = $3 OR $4 = \'doctor\')', 
      [date_time, id, req.user.id, req.user.role]);
    res.json({ message: 'Appointment rescheduled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.cancel = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE appointments SET status = \'cancelled\' WHERE id = $1 AND patient_id = $2', 
      [id, req.user.id]);
    res.json({ message: 'Appointment cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getQueue = async (req, res) => {
  try {
    const appointments = await pool.query(
      'SELECT * FROM appointments WHERE doctor_id = $1 AND status = \'pending\' ORDER BY date_time',
      [req.user.id]
    );
    res.json(appointments.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
<<<<<<< HEAD
};
// In appointmentController.js
exports.createAppointment = async (req, res) => {
  try {
    const { patient_id, hospital_id, clinic_id, date_time } = req.body;
    // ... other appointment creation logic ...

    // Update patient's hospital_id and clinic_id
    await pool.query(
      `UPDATE patients SET hospital_id = $1, clinic_id = $2 WHERE id = $3`,
      [hospital_id, clinic_id, patient_id]
    );

    // ... rest of the appointment creation ...
  } catch (err) {
    console.error('Failed to create appointment:', err);
    res.status(500).json({ error: 'Failed to create appointment', details: err.message });
  }
=======
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
};