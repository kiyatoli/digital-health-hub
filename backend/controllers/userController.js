// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get hospitals and clinics data
exports.getHospitalsAndClinics = async (req, res) => {
  try {
    // Check if hospitals and clinics tables exist and have data
    let hospitals = [];
    let clinics = [];
    
    try {
      // Try to get data from database tables if they exist
      const hospitalsResult = await pool.query('SELECT id, name, location FROM hospitals ORDER BY name');
      const clinicsResult = await pool.query('SELECT id, name, location, hospital_id FROM clinics ORDER BY name');
      
      hospitals = hospitalsResult.rows;
      clinics = clinicsResult.rows;
    } catch (err) {
      // If tables don't exist, use default data
      console.log('Using default hospital and clinic data');
      
      hospitals = [
        { id: 1, name: 'General Hospital', location: 'City Center' },
        { id: 2, name: 'Children Hospital', location: 'North District' }
      ];
      
      clinics = [
        { id: 1, name: 'Cardiology Clinic', location: 'Building A', hospital_id: 1 },
        { id: 2, name: 'Pediatric Clinic', location: 'Building B', hospital_id: 1 },
        { id: 3, name: 'Surgery Clinic', location: 'Main Wing', hospital_id: 2 },
        { id: 4, name: 'Emergency Clinic', location: 'Ground Floor', hospital_id: 2 },
        { id: 5, name: 'Dental Clinic', location: 'Annex Building', hospital_id: 1 },
        { id: 6, name: 'Eye Clinic', location: 'West Wing', hospital_id: 2 }
      ];
    }
    
    res.json({
      hospitals,
      clinics
    });
  } catch (err) {
    console.error('Failed to fetch hospitals and clinics:', err);
    res.status(500).json({ error: 'Failed to load hospitals and clinics', details: err.message });
  }
};

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const userHospitalId = req.user.hospital_id;
    const userClinicId = req.user.clinic_id;
    const isSuperAdmin = req.user.is_super_admin;
    const { search, role, hospital_id, clinic_id, type } = req.query;

    let usersQuery, patientsQuery, queryParams = [];
    let whereConditions = [];

    if (isSuperAdmin) {
      // Super admin can see all users
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
      `;
    } else if (userHospitalId) {
      // Hospital admin can see users in their hospital only
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      queryParams = [userHospitalId];
    } else if (userClinicId) {
      // Clinic admin can see users in their clinic only
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      queryParams = [userClinicId];
    } else {
      return res.status(200).json([]);
    }

    // Add filters for users
    let userFilters = [];
    let userFilterParams = [...queryParams];
    let paramIndex = queryParams.length + 1;

    if (search) {
      userFilters.push(`(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`);
      userFilterParams.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      userFilters.push(`role = $${paramIndex}`);
      userFilterParams.push(role);
      paramIndex++;
    }
    if (hospital_id) {
      userFilters.push(`hospital_id = $${paramIndex}`);
      userFilterParams.push(hospital_id);
      paramIndex++;
    }
    if (clinic_id) {
      userFilters.push(`clinic_id = $${paramIndex}`);
      userFilterParams.push(clinic_id);
      paramIndex++;
    }

    // Add filters for patients
    let patientFilters = [];
    let patientFilterParams = [...queryParams];
    paramIndex = queryParams.length + 1;

    if (search) {
      patientFilters.push(`(email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`);
      patientFilterParams.push(`%${search}%`);
      paramIndex++;
    }
    if (hospital_id) {
      patientFilters.push(`hospital_id = $${paramIndex}`);
      patientFilterParams.push(hospital_id);
      paramIndex++;
    }
    if (clinic_id) {
      patientFilters.push(`clinic_id = $${paramIndex}`);
      patientFilterParams.push(clinic_id);
      paramIndex++;
    }

    // Apply filters to queries
    if (userFilters.length > 0) {
      usersQuery += ` AND ${userFilters.join(' AND ')}`;
    }
    if (patientFilters.length > 0) {
      patientsQuery += ` AND ${patientFilters.join(' AND ')}`;
    }

    // Execute queries
    const usersResult = await pool.query(usersQuery, userFilterParams);
    const patientsResult = await pool.query(patientsQuery, patientFilterParams);

    // Get hospital and clinic names
    const hospitalIds = [...new Set([
      ...usersResult.rows.map(u => u.hospital_id),
      ...patientsResult.rows.map(p => p.hospital_id)
    ])].filter(id => id);

    const clinicIds = [...new Set([
      ...usersResult.rows.map(u => u.clinic_id),
      ...patientsResult.rows.map(p => p.clinic_id)
    ])].filter(id => id);

    let hospitalsMap = {};
    let clinicsMap = {};

    if (hospitalIds.length > 0) {
      const hospitalsResult = await pool.query(
        'SELECT id, name FROM hospitals WHERE id = ANY($1)',
        [hospitalIds]
      );
      hospitalsResult.rows.forEach(h => {
        hospitalsMap[h.id] = h.name;
      });
    }

    if (clinicIds.length > 0) {
      const clinicsResult = await pool.query(
        'SELECT id, name FROM clinics WHERE id = ANY($1)',
        [clinicIds]
      );
      clinicsResult.rows.forEach(c => {
        clinicsMap[c.id] = c.name;
      });
    }

    // Combine results and add hospital/clinic names
    const users = usersResult.rows.map(user => ({
      ...user,
      hospital_name: user.hospital_id ? hospitalsMap[user.hospital_id] : null,
      clinic_name: user.clinic_id ? clinicsMap[user.clinic_id] : null
    }));

    const patients = patientsResult.rows.map(patient => ({
      ...patient,
      hospital_name: patient.hospital_id ? hospitalsMap[patient.hospital_id] : null,
      clinic_name: patient.clinic_id ? clinicsMap[patient.clinic_id] : null
    }));

    // Filter by type if specified
    let combinedUsers = [...users, ...patients];
    if (type) {
      combinedUsers = combinedUsers.filter(user => user.type === type);
    }

    res.json(combinedUsers);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to load users', details: err.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      phone,
      full_name,
      sex,
      age,
      type,
      hospital_id,
      clinic_id,
      is_active,
      is_locked,
      mfa_enabled,
      is_super_admin
    } = req.body;

    if (type === 'user') {
      // Create staff user
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users 
         (username, email, password, role, phone, full_name, sex, age, hospital_id, clinic_id, is_active, is_locked, mfa_enabled, is_super_admin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [username, email, hashedPassword, role, phone, full_name, sex, age, hospital_id, clinic_id, is_active, is_locked, mfa_enabled, is_super_admin]
      );

      res.status(201).json(result.rows[0]);
    } else if (type === 'patient') {
      // Create patient
      const result = await pool.query(
        `INSERT INTO patients 
         (full_name, email, phone, dob, hospital_id, clinic_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [full_name, email, phone, age, hospital_id, clinic_id]
      );

      res.status(201).json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error('Failed to create user:', err);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      role,
      phone,
      full_name,
      sex,
      age,
      type,
      hospital_id,
      clinic_id,
      is_active,
      is_locked,
      mfa_enabled,
      is_super_admin,
      date_of_birth
    } = req.body;

    if (type === 'user') {
      // Update staff user
      const result = await pool.query(
        `UPDATE users 
         SET username = $1, email = $2, role = $3, phone = $4, full_name = $5, 
             sex = $6, age = $7, hospital_id = $8, clinic_id = $9, 
             is_active = $10, is_locked = $11, mfa_enabled = $12, is_super_admin = $13 
         WHERE id = $14 
         RETURNING *`,
        [username, email, role, phone, full_name, sex, age, hospital_id, clinic_id, 
         is_active, is_locked, mfa_enabled, is_super_admin, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } else if (type === 'patient') {
      // Update patient
      const result = await pool.query(
        `UPDATE patients 
         SET full_name = $1, email = $2, phone = $3, dob = $4, hospital_id = $5, clinic_id = $6 
         WHERE id = $7 
         RETURNING *`,
        [full_name, email, phone, date_of_birth || age, hospital_id, clinic_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id, type } = req.params;

    if (type === 'user') {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    } else if (type === 'patient') {
      const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Failed to delete user:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, statusType, value } = req.body;

    if (type === 'user') {
      const result = await pool.query(
        `UPDATE users SET ${statusType} = $1 WHERE id = $2 RETURNING *`,
        [value, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Status updated successfully', user: result.rows[0] });
    } else {
      res.status(400).json({ error: 'Status can only be updated for staff users' });
    }
  } catch (err) {
    console.error('Failed to update user status:', err);
    res.status(500).json({ error: 'Failed to update user status', details: err.message });
  }
};// controllers/userController.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Get hospitals and clinics data
exports.getHospitalsAndClinics = async (req, res) => {
  try {
    // Check if hospitals and clinics tables exist and have data
    let hospitals = [];
    let clinics = [];
    
    try {
      // Try to get data from database tables if they exist
      const hospitalsResult = await pool.query('SELECT id, name, location FROM hospitals ORDER BY name');
      const clinicsResult = await pool.query('SELECT id, name, location, hospital_id FROM clinics ORDER BY name');
      
      hospitals = hospitalsResult.rows;
      clinics = clinicsResult.rows;
    } catch (err) {
      // If tables don't exist, use default data
      console.log('Using default hospital and clinic data');
      
      hospitals = [
        { id: 1, name: 'General Hospital', location: 'City Center' },
        { id: 2, name: 'Children Hospital', location: 'North District' }
      ];
      
      clinics = [
        { id: 1, name: 'Cardiology Clinic', location: 'Building A', hospital_id: 1 },
        { id: 2, name: 'Pediatric Clinic', location: 'Building B', hospital_id: 1 },
        { id: 3, name: 'Surgery Clinic', location: 'Main Wing', hospital_id: 2 },
        { id: 4, name: 'Emergency Clinic', location: 'Ground Floor', hospital_id: 2 },
        { id: 5, name: 'Dental Clinic', location: 'Annex Building', hospital_id: 1 },
        { id: 6, name: 'Eye Clinic', location: 'West Wing', hospital_id: 2 }
      ];
    }
    
    res.json({
      hospitals,
      clinics
    });
  } catch (err) {
    console.error('Failed to fetch hospitals and clinics:', err);
    res.status(500).json({ error: 'Failed to load hospitals and clinics', details: err.message });
  }
};

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
  try {
    const userHospitalId = req.user.hospital_id;
    const userClinicId = req.user.clinic_id;
    const isSuperAdmin = req.user.is_super_admin;
    const { search, role, hospital_id, clinic_id, type } = req.query;

    let usersQuery, patientsQuery, queryParams = [];
    let whereConditions = [];

    if (isSuperAdmin) {
      // Super admin can see all users
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
      `;
    } else if (userHospitalId) {
      // Hospital admin can see users in their hospital only
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      queryParams = [userHospitalId];
    } else if (userClinicId) {
      // Clinic admin can see users in their clinic only
      usersQuery = `
        SELECT id, username, email, role, phone, full_name, sex, age, 
               hospital_id, clinic_id, is_active, is_locked, is_super_admin, created_at, 'user' as type 
        FROM users 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      patientsQuery = `
        SELECT id, full_name, email, phone, dob as date_of_birth, address, 
               hospital_id, clinic_id, 'patient' as role, created_at, 'patient' as type 
        FROM patients 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      queryParams = [userClinicId];
    } else {
      return res.status(200).json([]);
    }

    // Add filters for users
    let userFilters = [];
    let userFilterParams = [...queryParams];
    let paramIndex = queryParams.length + 1;

    if (search) {
      userFilters.push(`(username ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`);
      userFilterParams.push(`%${search}%`);
      paramIndex++;
    }
    if (role) {
      userFilters.push(`role = $${paramIndex}`);
      userFilterParams.push(role);
      paramIndex++;
    }
    if (hospital_id) {
      userFilters.push(`hospital_id = $${paramIndex}`);
      userFilterParams.push(hospital_id);
      paramIndex++;
    }
    if (clinic_id) {
      userFilters.push(`clinic_id = $${paramIndex}`);
      userFilterParams.push(clinic_id);
      paramIndex++;
    }

    // Add filters for patients
    let patientFilters = [];
    let patientFilterParams = [...queryParams];
    paramIndex = queryParams.length + 1;

    if (search) {
      patientFilters.push(`(email ILIKE $${paramIndex} OR full_name ILIKE $${paramIndex})`);
      patientFilterParams.push(`%${search}%`);
      paramIndex++;
    }
    if (hospital_id) {
      patientFilters.push(`hospital_id = $${paramIndex}`);
      patientFilterParams.push(hospital_id);
      paramIndex++;
    }
    if (clinic_id) {
      patientFilters.push(`clinic_id = $${paramIndex}`);
      patientFilterParams.push(clinic_id);
      paramIndex++;
    }

    // Apply filters to queries
    if (userFilters.length > 0) {
      usersQuery += ` AND ${userFilters.join(' AND ')}`;
    }
    if (patientFilters.length > 0) {
      patientsQuery += ` AND ${patientFilters.join(' AND ')}`;
    }

    // Execute queries
    const usersResult = await pool.query(usersQuery, userFilterParams);
    const patientsResult = await pool.query(patientsQuery, patientFilterParams);

    // Get hospital and clinic names
    const hospitalIds = [...new Set([
      ...usersResult.rows.map(u => u.hospital_id),
      ...patientsResult.rows.map(p => p.hospital_id)
    ])].filter(id => id);

    const clinicIds = [...new Set([
      ...usersResult.rows.map(u => u.clinic_id),
      ...patientsResult.rows.map(p => p.clinic_id)
    ])].filter(id => id);

    let hospitalsMap = {};
    let clinicsMap = {};

    if (hospitalIds.length > 0) {
      const hospitalsResult = await pool.query(
        'SELECT id, name FROM hospitals WHERE id = ANY($1)',
        [hospitalIds]
      );
      hospitalsResult.rows.forEach(h => {
        hospitalsMap[h.id] = h.name;
      });
    }

    if (clinicIds.length > 0) {
      const clinicsResult = await pool.query(
        'SELECT id, name FROM clinics WHERE id = ANY($1)',
        [clinicIds]
      );
      clinicsResult.rows.forEach(c => {
        clinicsMap[c.id] = c.name;
      });
    }

    // Combine results and add hospital/clinic names
    const users = usersResult.rows.map(user => ({
      ...user,
      hospital_name: user.hospital_id ? hospitalsMap[user.hospital_id] : null,
      clinic_name: user.clinic_id ? clinicsMap[user.clinic_id] : null
    }));

    const patients = patientsResult.rows.map(patient => ({
      ...patient,
      hospital_name: patient.hospital_id ? hospitalsMap[patient.hospital_id] : null,
      clinic_name: patient.clinic_id ? clinicsMap[patient.clinic_id] : null
    }));

    // Filter by type if specified
    let combinedUsers = [...users, ...patients];
    if (type) {
      combinedUsers = combinedUsers.filter(user => user.type === type);
    }

    res.json(combinedUsers);
  } catch (err) {
    console.error('Failed to fetch users:', err);
    res.status(500).json({ error: 'Failed to load users', details: err.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      phone,
      full_name,
      sex,
      age,
      type,
      hospital_id,
      clinic_id,
      is_active,
      is_locked,
      mfa_enabled,
      is_super_admin
    } = req.body;

    if (type === 'user') {
      // Create staff user
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await pool.query(
        `INSERT INTO users 
         (username, email, password, role, phone, full_name, sex, age, hospital_id, clinic_id, is_active, is_locked, mfa_enabled, is_super_admin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
         RETURNING *`,
        [username, email, hashedPassword, role, phone, full_name, sex, age, hospital_id, clinic_id, is_active, is_locked, mfa_enabled, is_super_admin]
      );

      res.status(201).json(result.rows[0]);
    } else if (type === 'patient') {
      // Create patient
      const result = await pool.query(
        `INSERT INTO patients 
         (full_name, email, phone, dob, hospital_id, clinic_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [full_name, email, phone, age, hospital_id, clinic_id]
      );

      res.status(201).json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error('Failed to create user:', err);
    res.status(500).json({ error: 'Failed to create user', details: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      role,
      phone,
      full_name,
      sex,
      age,
      type,
      hospital_id,
      clinic_id,
      is_active,
      is_locked,
      mfa_enabled,
      is_super_admin,
      date_of_birth
    } = req.body;

    if (type === 'user') {
      // Update staff user
      const result = await pool.query(
        `UPDATE users 
         SET username = $1, email = $2, role = $3, phone = $4, full_name = $5, 
             sex = $6, age = $7, hospital_id = $8, clinic_id = $9, 
             is_active = $10, is_locked = $11, mfa_enabled = $12, is_super_admin = $13 
         WHERE id = $14 
         RETURNING *`,
        [username, email, role, phone, full_name, sex, age, hospital_id, clinic_id, 
         is_active, is_locked, mfa_enabled, is_super_admin, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } else if (type === 'patient') {
      // Update patient
      const result = await pool.query(
        `UPDATE patients 
         SET full_name = $1, email = $2, phone = $3, dob = $4, hospital_id = $5, clinic_id = $6 
         WHERE id = $7 
         RETURNING *`,
        [full_name, email, phone, date_of_birth || age, hospital_id, clinic_id, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }

      res.json(result.rows[0]);
    } else {
      res.status(400).json({ error: 'Invalid user type' });
    }
  } catch (err) {
    console.error('Failed to update user:', err);
    res.status(500).json({ error: 'Failed to update user', details: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id, type } = req.params;

    if (type === 'user') {
      const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
    } else if (type === 'patient') {
      const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Failed to delete user:', err);
    res.status(500).json({ error: 'Failed to delete user', details: err.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, statusType, value } = req.body;

    if (type === 'user') {
      const result = await pool.query(
        `UPDATE users SET ${statusType} = $1 WHERE id = $2 RETURNING *`,
        [value, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'Status updated successfully', user: result.rows[0] });
    } else {
      res.status(400).json({ error: 'Status can only be updated for staff users' });
    }
  } catch (err) {
    console.error('Failed to update user status:', err);
    res.status(500).json({ error: 'Failed to update user status', details: err.message });
  }
};