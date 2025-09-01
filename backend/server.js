const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

console.log('Database config:', {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

// Import route files
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
// Add to your server.js after other route imports

const systemRoutes = require('./routes/systemRoutes');
// Use the system routes
app.use('/api/system', systemRoutes);
// Use the routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

// Test route to verify server works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Debug endpoint to check users
app.get('/api/debug/users', async (req, res) => {
  try {
    console.log('Attempting to query users table...');
    const result = await pool.query('SELECT id, username, email, role FROM users');
    console.log('Users query successful:', result.rows);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Users query error:', error.message);
    res.status(500).json({ 
      error: 'Database error', 
      message: error.message,
      hint: 'Make sure the users table exists and database is connected'
    });
  }
});

// Create test users endpoint
app.get('/api/debug/create-test-users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = [
      { username: 'admin_john', email: 'admin@digitalhealthhub.com', role: 'admin', phone: '+1-555-0101' },
      { username: 'dr_smith', email: 'dr.smith@digitalhealthhub.com', role: 'doctor', phone: '+1-555-0102' },
      { username: 'pharma_lisa', email: 'pharmacist@digitalhealthhub.com', role: 'pharmacist', phone: '+1-555-0103' },
      { username: 'lab_tech_mike', email: 'lab@digitalhealthhub.com', role: 'lab_staff', phone: '+1-555-0104' }
    ];
    
    const results = [];
    
    for (const user of users) {
      try {
        const result = await pool.query(`
          INSERT INTO users (username, email, password_hash, role, phone) 
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, username, email, role
        `, [user.username, user.email, hashedPassword, user.role, user.phone]);
        
        results.push(result.rows[0]);
      } catch (insertError) {
        if (insertError.code === '23505') {
          results.push({ email: user.email, status: 'already_exists', error: insertError.message });
        } else {
          results.push({ email: user.email, status: 'error', error: insertError.message });
        }
      }
    }
    
    res.json({ 
      message: 'Test users processed',
      users: results,
      password: 'password123'
    });
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ error: 'Failed to create users', details: error.message });
  }
});

// server.js
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role, password_hash, hospital_id, clinic_id, is_super_admin FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('No user found with email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];
    
    if (!user.password_hash) {
      console.log('Password hash missing for user:', user.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('Password validation failed for user:', user.email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email, 'Role:', user.role);

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        hospital_id: user.hospital_id || 0,
        clinic_id: user.clinic_id || 0,
        is_super_admin: user.is_super_admin || false
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
      hospital_id: user.hospital_id || 0,
      clinic_id: user.clinic_id || 0,
      is_super_admin: user.is_super_admin || false,
      requiresMFA: false
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});
// Add this to your server.js for debugging
app.get('/api/debug/check-auth', async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({ authenticated: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    res.json({ 
      authenticated: true, 
      user: decoded,
      message: 'Token is valid' 
    });
  } catch (err) {
    res.json({ 
      authenticated: false, 
      message: 'Invalid token',
      error: err.message 
    });
  }
});
// Add to server.js
app.get('/api/debug/verify-token', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    res.json({ 
      valid: true, 
      user: decoded,
      message: 'Token is valid' 
    });
  } catch (err) {
    res.status(401).json({ 
      valid: false, 
      message: 'Invalid token',
      error: err.message 
    });
  }
});
// Test password hash endpoint
app.get('/api/debug/test-password', async (req, res) => {
  try {
    const testPassword = 'password123';
    const storedHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    const isValid = await bcrypt.compare(testPassword, storedHash);
    
    res.json({
      testPassword: testPassword,
      storedHash: storedHash,
      isValid: isValid,
      message: isValid ? 'Password matches hash' : 'Password does not match hash'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug specific user login
app.post('/api/debug/check-user', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role, password_hash FROM users WHERE email = $1', 
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.json({ found: false, message: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    res.json({
      found: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        password_hash: user.password_hash,
        hash_length: user.password_hash ? user.password_hash.length : 0
      },
      passwordValid: isValid,
      message: isValid ? 'Password is valid' : 'Password is invalid'
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add this test endpoint to your server.js to verify the hash works
app.get('/api/debug/verify-hashes', async (req, res) => {
  try {
    const testPassword = 'password123';
    const storedHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    
    // Test the hash comparison
    const isValid = await bcrypt.compare(testPassword, storedHash);
    
    res.json({
      testPassword: testPassword,
      storedHash: storedHash,
      isValid: isValid,
      message: isValid ? '✅ Hash comparison successful!' : '❌ Hash comparison failed!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint to create users with proper password hashing
app.post('/api/test/create-user', async (req, res) => {
  try {
    const { username, email, password, role, phone } = req.body;

    // Validate input
    if (!username || !email || !role) {
      return res.status(400).json({ message: 'Username, email, and role are required' });
    }

    // Check if user already exists
    const emailCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Hash password (use 'test123' as default if not provided)
    const passwordToHash = password || 'test123';
    const hashedPassword = await bcrypt.hash(passwordToHash, 10);

    // Insert user
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, role, phone)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email, role, phone
    `, [username, email, hashedPassword, role, phone]);

    console.log('User created:', result.rows[0]);
    
    res.status(201).json({
      message: 'User created successfully',
      user: result.rows[0],
      password: passwordToHash // Return the plain text password for testing
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ message: 'Server error during user creation' });
  }
});

// Patient Login Route
app.post('/api/auth/patient-login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const patientResult = await pool.query('SELECT * FROM patients WHERE email = $1', [email]);
    
    if (patientResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const patient = patientResult.rows[0];
    const isPasswordValid = await bcrypt.compare(password, patient.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: patient.id, role: 'patient', email: patient.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: patient.id,
      role: 'patient',
      requiresMFA: false
    });

  } catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Test endpoint: http://localhost:5000/api/test');
  console.log('Debug users endpoint: http://localhost:5000/api/debug/users');
  console.log('Create test users: http://localhost:5000/api/debug/create-test-users');
});

module.exports = app;