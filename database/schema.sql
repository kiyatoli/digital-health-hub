-- Users Table (with roles)
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin', 'pharmacist', 'lab_staff');
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    mfa_secret VARCHAR(255),
    hospital_id INTEGER,
    clinic_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hospitals Table
CREATE TABLE hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO hospitals (name, location) VALUES ('Robe General Hospital', 'Robe City'), ('Bale Hospital', 'Robe City');

-- Clinics Table
CREATE TABLE clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    hospital_id INTEGER REFERENCES hospitals(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO clinics (name, location) VALUES 
('Clinic A', 'Robe North'), ('Clinic B', 'Robe South'), ('Clinic C', 'Robe East'), 
('Clinic D', 'Robe West'), ('Clinic E', 'Robe Central'), ('Clinic F', 'Robe Outskirts');

-- Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    doctor_id INTEGER REFERENCES users(id),
    hospital_id INTEGER REFERENCES hospitals(id),
    clinic_id INTEGER REFERENCES clinics(id),
    date_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMR Table
CREATE TABLE emr (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    doctor_id INTEGER REFERENCES users(id),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prescriptions Table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    doctor_id INTEGER REFERENCES users(id),
    medication TEXT,
    dosage VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referrals Table
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    from_doctor_id INTEGER REFERENCES users(id),
    to_doctor_id INTEGER REFERENCES users(id),
    from_location_id INTEGER,
    to_location_id INTEGER,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab Results Table
CREATE TABLE lab_results (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    lab_staff_id INTEGER REFERENCES users(id),
    test_type VARCHAR(100),
    results TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Table
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    location_id INTEGER,
    low_stock_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Billing Table
CREATE TABLE billing (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'unpaid',
    invoice_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_emr_patient ON emr(patient_id);