const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ... keep the imports and setup code ...

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test route to verify server works
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// ===== DEBUG ENDPOINTS =====
app.get('/api/debug/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, username, email, role FROM users');
    console.log('Users in database:', result.rows);
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error', details: error.message });
  }
});

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
        if (insertError.code === '23505') { // Unique violation - user already exists
          console.log('User already exists:', user.email);
          results.push({ email: user.email, status: 'already_exists' });
        } else {
          throw insertError;
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

// ===== AUTH ROUTES =====
// Staff/User Login Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role, password_hash FROM users WHERE email = $1', 
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

    console.log('Login successful for user:', user.email);

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user.id,
      username: user.username,
      role: user.role,
      requiresMFA: false
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// ... keep the patient login and other routes ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));RT}`));