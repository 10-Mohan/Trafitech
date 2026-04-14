const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');

// Stripe Webhook Endpoint
// Note: This requires the stripe CLI or a public URL to test locally
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log(`💰 PaymentIntent for ${paymentIntent.amount} was successful!`);

        // Update booking status if metadata exists
        const bookingId = paymentIntent.metadata.bookingId;
        if (bookingId) {
            try {
                const booking = await Booking.findById(bookingId);
                if (booking) {
                    booking.paymentStatus = 'paid';
                    await booking.save();
                }
            } catch (err) {
                console.error('Error updating booking via webhook:', err);
            }
        }
    }

    res.json({ received: true });
});

module.exports = router;
