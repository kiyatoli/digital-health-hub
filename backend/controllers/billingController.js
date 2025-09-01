const pool = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.createInvoice = async (req, res) => {
  const { patient_id, amount, invoice_details } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO billing (patient_id, amount, invoice_details) VALUES ($1, $2, $3) RETURNING id',
      [patient_id, amount, invoice_details]
    );
    const patient = await pool.query('SELECT email FROM users WHERE id = $1', [patient_id]);
    await sendEmail(patient.rows[0].email, 'New Invoice', `Invoice created: ${invoice_details}, Amount: ${amount}`);
    res.status(201).json({ message: 'Invoice created', invoiceId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};