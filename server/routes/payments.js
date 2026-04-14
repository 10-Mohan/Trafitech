const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const auth = require('../middleware/auth');
const router = express.Router();

// Create Payment Intent
router.post('/create-payment-intent', auth, async (req, res) => {
    try {
        const { amount, currency = 'inr' } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ message: 'Invalid payment amount specified' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(Number(amount) * 100), // Stripe requires integer in smallest currency unit
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error("Stripe Backend Error:", err);
        res.status(500).json({ message: err.message || 'Failed to creating Stripe PaymentIntent', error: err.stack });
    }
});

module.exports = router;
