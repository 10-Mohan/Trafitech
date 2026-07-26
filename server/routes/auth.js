const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { getJwtSecret } = require('../config/jwt');
const { getAdminSecret } = require('../config/adminSecret');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role, adminSecret } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let userRole = 'user';
        if (role === 'admin') {
            const validAdminSecret = getAdminSecret();
            if (!adminSecret || adminSecret !== validAdminSecret) {
                return res.status(403).json({ message: 'Invalid or missing Admin Passcode. Cannot create Administrator account.' });
            }
            userRole = 'admin';
        }

        user = new User({ username, email, password, role: userRole });
        await user.save();

        const token = jwt.sign({ id: user._id, role: userRole }, getJwtSecret(), { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: userRole } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Strict role validation: Always enforce the role stored in DB
        const storedRole = user.role || 'user';
        if (role === 'admin' && storedRole !== 'admin') {
            return res.status(403).json({ message: 'Access Denied: This account does not have Administrator privileges.' });
        }

        const token = jwt.sign({ id: user._id, role: storedRole }, getJwtSecret(), { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: storedRole } });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all users (Admin only)
router.get('/', [auth, admin], async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude passwords
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
