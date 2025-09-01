const pool = require('../config/db');
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.JWT_SECRET.slice(0, 32); // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const [iv, encryptedText] = text.split(':').map(part => Buffer.from(part, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

exports.updateEMR = async (req, res) => {
  const { patient_id, notes } = req.body;
  try {
    const encryptedNotes = encrypt(notes);
    await pool.query(
      'INSERT INTO emr (patient_id, doctor_id, notes) VALUES ($1, $2, $3) ON CONFLICT (patient_id) DO UPDATE SET notes = $3, updated_at = CURRENT_TIMESTAMP',
      [patient_id, req.user.id, encryptedNotes]
    );
    await pool.query('INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)', 
      [req.user.id, 'update_emr', `EMR updated for patient ${patient_id}`]);
    res.json({ message: 'EMR updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEMR = async (req, res) => {
  try {
    const emr = await pool.query(
      'SELECT * FROM emr WHERE patient_id = $1 AND (patient_id = $2 OR $3 = \'doctor\')',
      [req.params.patient_id, req.user.id, req.user.role]
    );
    if (emr.rows.length) {
      emr.rows[0].notes = decrypt(emr.rows[0].notes);
    }
    res.json(emr.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};