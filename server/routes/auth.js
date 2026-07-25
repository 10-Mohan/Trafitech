const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userRole = role === 'admin' ? 'admin' : 'user';
        user = new User({ username, email, password, role: userRole });
        await user.save();

        const token = jwt.sign({ id: user._id, role: userRole }, process.env.JWT_SECRET || 'traffitech_super_secret_key_123', { expiresIn: '7d' });
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

        const userRole = role || user.role || 'user';
        const token = jwt.sign({ id: user._id, role: userRole }, process.env.JWT_SECRET || 'traffitech_super_secret_key_123', { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: userRole } });
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
