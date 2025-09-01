// scripts/seedData.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function seedData() {
  try {
    console.log('Seeding database with sample data...');
    
    // Add sample appointments
    await pool.query(`
      INSERT INTO appointments (patient_id, doctor_id, hospital_id, clinic_id, date_time, status)
      VALUES 
      (1, 12, 1, 1, NOW() + INTERVAL '1 day', 'confirmed'),
      (1, 12, 1, 1, NOW() + INTERVAL '2 days', 'pending'),
      (1, 12, 1, 1, NOW() + INTERVAL '3 days', 'confirmed')
      ON CONFLICT DO NOTHING
    `);
    
    // Add sample billing records
    await pool.query(`
      INSERT INTO billing (patient_id, amount, status, invoice_details)
      VALUES 
      (1, 100.00, 'paid', 'Consultation fee'),
      (1, 250.00, 'unpaid', 'Lab tests'),
      (1, 150.00, 'paid', 'Medication')
      ON CONFLICT DO NOTHING
    `);
    
    // Add more patients
    await pool.query(`
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
    await pool.end();
  }
}

seedData();