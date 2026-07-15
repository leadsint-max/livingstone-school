const express = require('express');
const { Pool } = require('pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
// This uses the DATABASE_URL you set in Render's Environment Variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SECRET = process.env.JWT_SECRET || "Livingstone_Secret_2026";

// 1. LOGIN ENDPOINT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) {
            console.log("Login Failed: User not found in database.");
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Check password
        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (isPasswordValid) {
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '8h' });
            console.log("Login Successful for:", email);
            res.json({
                token,
                role: user.role,
                redirectUrl: `${user.role}_dashboard.html`
            });
        } else {
            console.log("Login Failed: Wrong password.");
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        // THIS IS THE IMPORTANT PART FOR DEBUGGING
        console.error("CRITICAL DATABASE ERROR DURING LOGIN:");
        console.error(err.message);
        console.error(err.stack);
        res.status(500).json({ message: "Database error. Check Render logs for details." });
    }
});

// 2. STUDENT REGISTRATION
app.post('/api/students/register', async (req, res) => {
    const { firstName, lastName, dob, admissionNo, classId } = req.body;
    console.log("Attempting to register student:", firstName, lastName);

    try {
        const newStudent = await pool.query(
            'INSERT INTO student_profiles (first_name, last_name, date_of_birth, admission_no, current_stream_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [firstName, lastName, dob, admissionNo, classId]
        );
        console.log("Student Registered Successfully!");
        res.json({ success: true, student: newStudent.rows[0] });
    } catch (err) {
        console.error("CRITICAL DATABASE ERROR DURING REGISTRATION:");
        console.error(err.message);
        res.status(500).json({ success: false, message: "Database registration error." });
    }
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Livingstone Server is awake and running on port ${PORT}`);
});
