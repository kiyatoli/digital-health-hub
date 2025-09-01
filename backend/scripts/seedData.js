// backend/scripts/seedData.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedData() {
  let client;
  try {
    client = await pool.connect();
    console.log('Seeding database with sample data...');
    
    // First, let's check what users exist and get their IDs
    const usersResult = await client.query('SELECT id, role FROM users ORDER BY id');
    const patientsResult = await client.query('SELECT id FROM patients ORDER BY id');
    
    console.log('Existing users:', usersResult.rows);
    console.log('Existing patients:', patientsResult.rows);
    
    // Find admin and doctor users
    const adminUser = usersResult.rows.find(user => user.role === 'admin');
    const doctorUser = usersResult.rows.find(user => user.role === 'doctor');
    
    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await client.query(
        `INSERT INTO users (username, email, password_hash, role, phone, full_name) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['system_admin', 'system_admin@digitalhealthhub.com', hashedPassword, 'admin', '+1234567890', 'System Administrator']
      );
      adminUser = { id: newAdmin.rows[0].id };
    }
    
    if (!doctorUser) {
      console.log('No doctor user found. Creating one...');
      const hashedPassword = await bcrypt.hash('doctor123', 10);
      const newDoctor = await client.query(
        `INSERT INTO users (username, email, password_hash, role, phone, full_name) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['system_doctor', 'system_doctor@digitalhealthhub.com', hashedPassword, 'doctor', '+1234567891', 'System Doctor']
      );
      doctorUser = { id: newDoctor.rows[0].id };
    }
    
    // Use existing patient or create one
    let patientId;
    if (patientsResult.rows.length > 0) {
      patientId = patientsResult.rows[0].id;
    } else {
      console.log('No patients found. Creating one...');
      const hashedPassword = await bcrypt.hash('patient123', 10);
      const newPatient = await client.query(
        `INSERT INTO patients (name, email, password, dob, address, phone) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        ['John Doe', 'john.doe@example.com', hashedPassword, '1990-01-01', '123 Main St, City', '555-0101']
      );
      patientId = newPatient.rows[0].id;
    }
    
    console.log('Using patient ID:', patientId);
    console.log('Using doctor ID:', doctorUser.id);
    
    // Add sample appointments
    await client.query(`
      INSERT INTO appointments (patient_id, doctor_id, date_time, status)
      VALUES 
      ($1, $2, NOW() + INTERVAL '1 day', 'confirmed'),
      ($1, $2, NOW() + INTERVAL '2 days', 'pending'),
      ($1, $2, NOW() + INTERVAL '3 days', 'confirmed')
      ON CONFLICT DO NOTHING
    `, [patientId, doctorUser.id]);
    
    // Add sample billing records
    await client.query(`
      INSERT INTO billing (patient_id, amount, status, invoice_details)
      VALUES 
      ($1, 100.00, 'paid', 'Consultation fee'),
      ($1, 250.00, 'unpaid', 'Lab tests'),
      ($1, 150.00, 'paid', 'Medication')
      ON CONFLICT DO NOTHING
    `, [patientId]);
    
    // Add more patients
    await client.query(`
      INSERT INTO patients (name, email, password, dob, address, phone)
      VALUES 
      ('Alice Johnson', 'alice@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1990-05-15', '123 Main St, City', '555-0101'),
      ('Bob Smith', 'bob@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1985-08-22', '456 Oak St, Town', '555-0102'),
      ('Carol Davis', 'carol@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1978-12-10', '789 Pine St, Village', '555-0103')
      ON CONFLICT (email) DO NOTHING
    `);
    
    console.log('Sample data seeded successfully!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };