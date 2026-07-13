const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // For password hashing

const app = express();
app.use(bodyParser.json());

// SECRET KEY for JWT (In production, use an environment variable)
const SECRET_KEY = "Livingstone_Secret_Key_2026";

/**
 * MOCK DATABASE ACCESS
 * In a real app, you would use: 
 * const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
 */
const mockUsers = [
    {
        id: "1",
        email: "admin@livingstone.edu",
        password_hash: bcrypt.hashSync("admin123", 10),
        role: "admin",
        name: "School Admin"
    },
    {
        id: "2",
        email: "teacher@livingstone.edu",
        password_hash: bcrypt.hashSync("teacher123", 10),
        role: "teacher",
        name: "Mr. Smith"
    },
    {
        id: "3",
        email: "parent@livingstone.edu",
        password_hash: bcrypt.hashSync("parent123", 10),
        role: "parent",
        name: "Mrs. Doe"
    }
];

// 1. LOGIN ENDPOINT
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = mockUsers.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create JWT Token
    const token = jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        SECRET_KEY,
        { expiresIn: '8h' }
    );

    // Return token and role so the frontend knows where to redirect
    res.json({
        message: "Login successful",
        token: token,
        role: user.role,
        redirectUrl: `/${user.role}-dashboard.html`
    });
});

// 2. MIDDLEWARE: Check if user is authenticated and has correct role
const authorize = (roles = []) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];

        if (!token) return res.status(403).json({ message: "No token provided" });

        jwt.verify(token, SECRET_KEY, (err, decoded) => {
            if (err) return res.status(401).json({ message: "Unauthorized" });

            // Check if user role is allowed
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Access forbidden: Insufficient permissions" });
            }

            req.user = decoded;
            next();
        });
    };
};

// 3. PROTECTED ROUTES (Example)
app.get('/api/admin/data', authorize(['admin']), (req, res) => {
    res.json({ message: "Welcome Admin! Here is the sensitive school data." });
});

app.get('/api/teacher/classes', authorize(['teacher', 'admin']), (req, res) => {
    res.json({ message: "Accessing class list for Teacher." });
});

// START SERVER
const PORT = 3000;
console.log(`Auth service running on port ${PORT}`);
// app.listen(PORT); // Commented out for now as this is a code demonstration.
