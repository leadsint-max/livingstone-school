const express = require('express');
const { Pool } = require('pg'); // PostgreSQL Client
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
// When you deploy to Supabase/Render, you will put your real connection string here
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false }
});

const SECRET = process.env.JWT_SECRET || "Livingstone_Secret_2026";

// 1. REAL LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (user && bcrypt.compareSync(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
            res.json({
                token,
                role: user.role,
                redirectUrl: `${user.role}_dashboard.html`
            });
        } else {
            res.status(401).json({ message: "Invalid credentials" });
        }
    } catch (err) {
        res.status(500).json({ message: "Database error" });
    }
});

// 2. REAL STUDENT REGISTRATION
app.post('/api/students/register', async (req, res) => {
    const { firstName, lastName, dob, admissionNo, classId } = req.body;
    try {
        const newStudent = await pool.query(
            'INSERT INTO student_profiles (first_name, last_name, date_of_birth, admission_no, class_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [firstName, lastName, dob, admissionNo, classId]
        );
        res.json({ success: true, student: newStudent.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Livingstone Server running on port ${PORT}`));
