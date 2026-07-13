-- SQL Schema for Livingstone International School Management System
-- Database: PostgreSQL

-- Enable UUID extension for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SCHOOLS & GLOBAL CONFIG
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    logo_url TEXT,
    website VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. USERS & AUTHENTICATION
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'accountant', 'teacher', 'student', 'parent');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL,
    phone VARCHAR(20),
    profile_picture_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. ACADEMIC STRUCTURE
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(20) NOT NULL, -- e.g., "2026-2027"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "Term 1"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE
);

-- 4. STAFF & CLASSES
CREATE TABLE staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id),
    employee_id VARCHAR(50) UNIQUE,
    designation VARCHAR(100),
    department VARCHAR(100),
    joining_date DATE,
    salary DECIMAL(12, 2)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    name VARCHAR(50) NOT NULL, -- e.g., "Grade 10"
    level INTEGER, -- for ordering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g., "A", "Blue", "Science"
    class_teacher_id UUID REFERENCES staff_profiles(id)
);

-- 5. STUDENTS & GUARDIANS
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    occupation VARCHAR(100),
    address TEXT
);

CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id),
    admission_no VARCHAR(50) UNIQUE NOT NULL,
    guardian_id UUID REFERENCES guardians(id),
    current_stream_id UUID REFERENCES streams(id),
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    enrollment_date DATE DEFAULT CURRENT_DATE
);

-- 6. ACADEMICS (SUBJECTS & MARKS)
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20)
);

CREATE TABLE class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stream_id UUID REFERENCES streams(id),
    subject_id UUID REFERENCES subjects(id),
    teacher_id UUID REFERENCES staff_profiles(id)
);

CREATE TABLE marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    subject_id UUID REFERENCES subjects(id),
    term_id UUID REFERENCES terms(id),
    assessment_type VARCHAR(50), -- e.g., "Quiz", "Mid-term", "Final"
    score DECIMAL(5, 2),
    max_score DECIMAL(5, 2),
    remarks TEXT,
    recorded_by UUID REFERENCES staff_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. ATTENDANCE
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    stream_id UUID REFERENCES streams(id),
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- "present", "absent", "late", "excused"
    remarks TEXT,
    recorded_by UUID REFERENCES staff_profiles(id)
);

-- 8. FINANCE (FEES & PAYMENTS)
CREATE TABLE fee_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    name VARCHAR(100) NOT NULL, -- e.g., "Tuition Fee", "Bus Fee"
    description TEXT
);

CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id),
    term_id UUID REFERENCES terms(id),
    fee_type_id UUID REFERENCES fee_types(id),
    amount DECIMAL(12, 2) NOT NULL
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id),
    term_id UUID REFERENCES terms(id),
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'unpaid', -- "unpaid", "partial", "paid"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    amount_paid DECIMAL(12, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50), -- "cash", "bank_transfer", "online"
    transaction_reference VARCHAR(100),
    received_by UUID REFERENCES users(id) -- Typically the accountant
);

-- 9. SEED INITIAL DATA
INSERT INTO schools (name) VALUES ('Livingstone International School');

-- Note: In a real system, you would hash the password. 
-- This is a placeholder for the initial Super Admin.
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@livingstone.edu', 'PBKDF2_PLACEHOLDER', 'System', 'Administrator', 'super_admin');
