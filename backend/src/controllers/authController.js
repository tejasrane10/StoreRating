const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body || {};

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], async (checkErr, checkResults) => {
        if (checkErr) {
            console.error('Error checking user:', checkErr);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        const userRole = role || 'USER';

        db.query(insertQuery, [name, email, hashedPassword, userRole], (insertErr, insertResults) => {
            if (insertErr) {
                console.error('Error creating user:', insertErr);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Generate token
            if (!process.env.JWT_SECRET) {
                console.error('JWT_SECRET is not configured');
                return res.status(500).json({ error: 'Server configuration error' });
            }

            const token = jwt.sign({ id: insertResults.insertId, role: userRole }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, role: userRole, name });
        });
    });
};

exports.login = async (req, res) => {
    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';

    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign({ id: user.id , role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, role: user.role });
    })
}