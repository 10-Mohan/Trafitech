const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Get user bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id });
        // Sort manually by timestamp desc for JSON fallback
        const sorted = bookings.sort((a, b) => {
            const aTime = a.timestamp || a.data?.timestamp || 0;
            const bTime = b.timestamp || b.data?.timestamp || 0;
            return new Date(bTime) - new Date(aTime);
        });
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Get active slots for a zone on a given date (real-time database state)
router.get('/active-slots', async (req, res) => {
    const { zoneId, date } = req.query;
    try {
        const queryDate = date || new Date().toISOString().split('T')[0];
        const bookings = await Booking.find({ date: queryDate });
        // Filter by zoneId and active status
        const active = bookings.filter(b => {
            const bParkingZone = b.parkingZone || b.data?.parkingZone;
            const bPaymentStatus = b.paymentStatus || b.data?.paymentStatus;
            const hasZoneId = bParkingZone && bParkingZone.id === zoneId;
            const isActive = bPaymentStatus === 'paid' || bPaymentStatus === 'pending';
            return hasZoneId && isActive;
        });
        res.json(active);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { slot, slotId: bodySlotId, date, startTime, endTime, parkingZone, duration } = req.body;
        const slotId = bodySlotId || slot?.title;

        if (!slotId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing booking details' });
        }

        // Overlap check
        const bookings = await Booking.find({ slotId, date });
        const hasOverlap = bookings.some(b => {
            const bStartTime = b.startTime || b.data?.startTime;
            const bEndTime = b.endTime || b.data?.endTime;
            const bPaymentStatus = b.paymentStatus || b.data?.paymentStatus;
            const bTimestamp = b.timestamp || b.data?.timestamp;

            const isOverlap = bStartTime < endTime && bEndTime > startTime;
            const isPaid = bPaymentStatus === 'paid';
            // Allow recent pending block window (15 minutes) to avoid reservation races
            const isRecentPending = bPaymentStatus === 'pending' && 
                (Date.now() - new Date(bTimestamp || Date.now()).getTime() < 15 * 60 * 1000);
            return isOverlap && (isPaid || isRecentPending);
        });

        if (hasOverlap) {
            return res.status(400).json({ message: 'This slot is already reserved for the selected timeframe.' });
        }

        // Calculate totalPrice securely on the server
        const currentHour = new Date().getHours();
        const isPeakHour = (currentHour >= 9 && currentHour <= 11) || (currentHour >= 17 && currentHour <= 19);
        const surgeMultiplier = isPeakHour ? 1.5 : 1;
        const basePrice = parkingZone?.price || 50;
        const calculatedPrice = Math.round((duration || 1) * basePrice * surgeMultiplier);

        const newBooking = new Booking({
            ...req.body,
            bookingId: req.body.bookingId || `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            slotId: slotId,
            totalPrice: calculatedPrice,
            user: req.user.id,
            timestamp: new Date()
        });

        const booking = await newBooking.save();
        res.status(201).json(booking.data || booking);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Cancel a booking and process Stripe refund
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Access user field from nested wrapper or raw mongoose document
        const userId = booking.user || booking.data?.user;
        if (userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        const currentPaymentStatus = booking.paymentStatus || booking.data?.paymentStatus;
        const currentPaymentId = booking.paymentId || booking.data?.paymentId;

        if (currentPaymentStatus === 'cancelled' || currentPaymentStatus === 'refunded') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        // Process refund via Stripe if paid
        if (currentPaymentStatus === 'paid' && currentPaymentId) {
            try {
                await stripe.refunds.create({
                    payment_intent: currentPaymentId
                });
                booking.paymentStatus = 'refunded';
            } catch (stripeErr) {
                console.error('Stripe Refund Error:', stripeErr);
                return res.status(500).json({ message: 'Stripe refund transaction failed', error: stripeErr.message });
            }
        } else {
            booking.paymentStatus = 'cancelled';
        }

        const updated = await booking.save();
        res.json({ message: 'Booking cancelled and refunded successfully', booking: updated.data || updated });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Get all bookings (Admin only)
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const sorted = bookings.sort((a, b) => {
            const aTime = a.timestamp || a.data?.timestamp || 0;
            const bTime = b.timestamp || b.data?.timestamp || 0;
            return new Date(bTime) - new Date(aTime);
        });
        res.json(sorted.map(b => b.data || b));
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

module.exports = router;
