const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const router = express.Router();

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { bookingId, currency = 'inr' } = req.body;

        if (!bookingId) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }

        // Fetch booking from database to get verified server-computed price
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure user owns the booking
        const userId = booking.user || booking.data?.user;
        if (userId !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized access to this booking' });
        }

        const totalPrice = booking.totalPrice || booking.data?.totalPrice || 50;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(totalPrice) * 100), // Secure verified amount
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                bookingId: booking._id || bookingId // Inject metadata for Webhooks
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error("Stripe Backend Error:", err);
        res.status(500).json({ message: err.message || 'Failed to create Stripe PaymentIntent', error: err.stack });
    }
});

module.exports = router;
