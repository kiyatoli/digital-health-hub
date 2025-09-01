<<<<<<< HEAD
// controllers/analyticsController.js
=======
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
<<<<<<< HEAD
    const userHospitalId = req.user.hospital_id;
    const userClinicId = req.user.clinic_id;
    const isSuperAdmin = req.user.is_super_admin;

    let appointmentsQuery, revenueQuery, userDemographicsQuery, genderQuery, ageQuery;
    let queryParams = [];

    // Build queries based on user permissions
    if (isSuperAdmin) {
      appointmentsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_appointments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_appointments,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments
        FROM appointments
      `;
      
      revenueQuery = `
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_bills,
          COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_bills,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_revenue
        FROM billing
      `;
      
      userDemographicsQuery = `
        SELECT role, COUNT(*) as count FROM users GROUP BY role
        UNION ALL
        SELECT 'patient' as role, COUNT(*) as count FROM patients
      `;
      
      genderQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END), 0) as male,
          COALESCE(SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END), 0) as female,
          COALESCE(SUM(CASE WHEN sex = 'other' THEN 1 ELSE 0 END), 0) as other,
          COALESCE(SUM(CASE WHEN sex IS NULL THEN 1 ELSE 0 END), 0) as unknown
        FROM users
      `;
      
      ageQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 0 AND 18) as age_0_18,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 19 AND 35) as age_19_35,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 36 AND 50) as age_36_50,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) >= 51) as age_51_plus
        FROM patients
      `;
    } else if (userHospitalId) {
      appointmentsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_appointments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_appointments,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments
        FROM appointments 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      
      revenueQuery = `
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_bills,
          COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_bills,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_revenue
        FROM billing 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      
      userDemographicsQuery = `
        SELECT role, COUNT(*) as count FROM users 
        WHERE hospital_id = $1 OR hospital_id IS NULL 
        GROUP BY role
        UNION ALL
        SELECT 'patient' as role, COUNT(*) as count FROM patients 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      
      genderQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END), 0) as male,
          COALESCE(SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END), 0) as female,
          COALESCE(SUM(CASE WHEN sex = 'other' THEN 1 ELSE 0 END), 0) as other,
          COALESCE(SUM(CASE WHEN sex IS NULL THEN 1 ELSE 0 END), 0) as unknown
        FROM users 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      
      ageQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 0 AND 18) as age_0_18,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 19 AND 35) as age_19_35,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 36 AND 50) as age_36_50,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) >= 51) as age_51_plus
        FROM patients 
        WHERE hospital_id = $1 OR hospital_id IS NULL
      `;
      
      queryParams = [userHospitalId];
    } else if (userClinicId) {
      appointmentsQuery = `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_appointments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_appointments,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments
        FROM appointments 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      
      revenueQuery = `
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_bills,
          COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_bills,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_revenue
        FROM billing 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      
      userDemographicsQuery = `
        SELECT role, COUNT(*) as count FROM users 
        WHERE clinic_id = $1 OR clinic_id IS NULL 
        GROUP BY role
        UNION ALL
        SELECT 'patient' as role, COUNT(*) as count FROM patients 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      
      genderQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END), 0) as male,
          COALESCE(SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END), 0) as female,
          COALESCE(SUM(CASE WHEN sex = 'other' THEN 1 ELSE 0 END), 0) as other,
          COALESCE(SUM(CASE WHEN sex IS NULL THEN 1 ELSE 0 END), 0) as unknown
        FROM users 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      
      ageQuery = `
        SELECT 
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 0 AND 18) as age_0_18,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 19 AND 35) as age_19_35,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 36 AND 50) as age_36_50,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) >= 51) as age_51_plus
        FROM patients 
        WHERE clinic_id = $1 OR clinic_id IS NULL
      `;
      
      queryParams = [userClinicId];
    } else {
      // Return empty analytics for users without hospital/clinic association
      return res.json({
        appointments: { total_appointments: 0, confirmed_appointments: 0, pending_appointments: 0, cancelled_appointments: 0 },
        revenue: { total_revenue: 0, paid_bills: 0, unpaid_bills: 0, paid_revenue: 0 },
        demographics: [],
        genderData: { male: 0, female: 0, other: 0, unknown: 0 },
        ageData: { age_0_18: 0, age_19_35: 0, age_36_50: 0, age_51_plus: 0 }
      });
    }

    const [
      appointmentsResult,
      revenueResult,
      demographicsResult,
      genderResult,
      ageResult
    ] = await Promise.all([
      pool.query(appointmentsQuery, queryParams),
      pool.query(revenueQuery, queryParams),
      pool.query(userDemographicsQuery, queryParams),
      pool.query(genderQuery, queryParams),
      pool.query(ageQuery, queryParams)
    ]);
    
    res.json({
      appointments: appointmentsResult.rows[0] || { total_appointments: 0, confirmed_appointments: 0, pending_appointments: 0, cancelled_appointments: 0 },
      revenue: revenueResult.rows[0] || { total_revenue: 0, paid_bills: 0, unpaid_bills: 0, paid_revenue: 0 },
      demographics: demographicsResult.rows || [],
      genderData: genderResult.rows[0] || { male: 0, female: 0, other: 0, unknown: 0 },
      ageData: ageResult.rows[0] || { age_0_18: 0, age_19_35: 0, age_36_50: 0, age_51_plus: 0 }
    });
  } catch (err) {
    console.error('Analytics query error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics data', details: err.message });
  }
};

// Get analytics by facility (hospital/clinic)
exports.getAnalyticsByFacility = async (req, res) => {
  try {
    const { facilityType, facilityId } = req.params;
    const userHospitalId = req.user.hospital_id;
    const userClinicId = req.user.clinic_id;
    const isSuperAdmin = req.user.is_super_admin;

    // Check permissions
    if (!isSuperAdmin) {
      if (facilityType === 'hospital' && facilityId != userHospitalId) {
        return res.status(403).json({ error: 'Cannot access analytics from other hospitals' });
      }
      if (facilityType === 'clinic' && facilityId != userClinicId) {
        return res.status(403).json({ error: 'Cannot access analytics from other clinics' });
      }
    }

    let facilityCondition = '';
    if (facilityType === 'hospital') {
      facilityCondition = 'WHERE hospital_id = $1';
    } else {
      facilityCondition = 'WHERE clinic_id = $1';
    }

    const queries = {
      appointments: `
        SELECT 
          COUNT(*) as total_appointments,
          COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_appointments,
          COUNT(*) FILTER (WHERE status = 'pending') as pending_appointments,
          COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_appointments
        FROM appointments 
        ${facilityCondition}
      `,
      revenue: `
        SELECT 
          COALESCE(SUM(amount), 0) as total_revenue,
          COUNT(*) FILTER (WHERE status = 'paid') as paid_bills,
          COUNT(*) FILTER (WHERE status = 'unpaid') as unpaid_bills,
          COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_revenue
        FROM billing 
        ${facilityCondition}
      `,
      users: `
        SELECT role, COUNT(*) as count FROM users 
        ${facilityCondition}
        GROUP BY role
      `,
      patients: `
        SELECT COUNT(*) as count FROM patients 
        ${facilityCondition}
      `,
      gender: `
        SELECT 
          COALESCE(SUM(CASE WHEN sex = 'male' THEN 1 ELSE 0 END), 0) as male,
          COALESCE(SUM(CASE WHEN sex = 'female' THEN 1 ELSE 0 END), 0) as female,
          COALESCE(SUM(CASE WHEN sex = 'other' THEN 1 ELSE 0 END), 0) as other,
          COALESCE(SUM(CASE WHEN sex IS NULL THEN 1 ELSE 0 END), 0) as unknown
        FROM users 
        ${facilityCondition}
      `,
      age: `
        SELECT 
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 0 AND 18) as age_0_18,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 19 AND 35) as age_19_35,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) BETWEEN 36 AND 50) as age_36_50,
          COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM AGE(dob)) >= 51) as age_51_plus
        FROM patients 
        ${facilityCondition}
      `
    };

    const results = await Promise.all(
      Object.values(queries).map(query => pool.query(query, [facilityId]))
    );

    const [
      appointmentsResult,
      revenueResult,
      usersResult,
      patientsResult,
      genderResult,
      ageResult
    ] = results;

    res.json({
      appointments: appointmentsResult.rows[0] || { total_appointments: 0, confirmed_appointments: 0, pending_appointments: 0, cancelled_appointments: 0 },
      revenue: revenueResult.rows[0] || { total_revenue: 0, paid_bills: 0, unpaid_bills: 0, paid_revenue: 0 },
      demographics: [
        ...usersResult.rows,
        { role: 'patient', count: patientsResult.rows[0]?.count || 0 }
      ],
      genderData: genderResult.rows[0] || { male: 0, female: 0, other: 0, unknown: 0 },
      ageData: ageResult.rows[0] || { age_0_18: 0, age_19_35: 0, age_36_50: 0, age_51_plus: 0 }
    });
  } catch (err) {
    console.error('Facility analytics query error:', err);
    res.status(500).json({ error: 'Failed to fetch facility analytics', details: err.message });
=======
    const appointments = await pool.query('SELECT COUNT(*) FROM appointments WHERE status = $1', ['confirmed']);
    const revenue = await pool.query('SELECT SUM(amount) as total FROM billing WHERE status = $1', ['paid']);
    const demographics = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    res.json({
      appointments: appointments.rows[0].count,
      revenue: revenue.rows[0].total || 0,
      demographics: demographics.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
>>>>>>> eeea500e7c21953c51f8f841cd9d812eaa7d4522
  }
};