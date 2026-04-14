const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();

// Get user bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).sort({ timestamp: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Create a booking
router.post('/', auth, async (req, res) => {
    try {
        const newBooking = new Booking({
            ...req.body,
            user: req.user.id
        });

        const booking = await newBooking.save();
        res.status(201).json(booking);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Get all bookings (Admin only)
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const bookings = await Booking.find({}).sort({ timestamp: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

module.exports = router;
