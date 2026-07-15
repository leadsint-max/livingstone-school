const express = require('express');
const { Pool } = require('pg'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SECRET = process.env.JWT_SECRET || "Livingstone_Secret_2026";

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userQuery.rows[0];

        if (!user) return res.status(401).json({ message: "User not found in database." });

        const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
        if (isPasswordValid) {
            const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
            res.json({ token, role: user.role, redirectUrl: `${user.role}_dashboard.html` });
        } else {
            res.status(401).json({ message: "Wrong password." });
        }
    } catch (err) {
        // THIS WILL SHOW THE ACTUAL ERROR ON YOUR SCREEN
        res.status(500).json({ message: "DB ERROR: " + err.message });
    }
});

app.get('/api/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ message: "CONNECTION ERROR: " + err.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
