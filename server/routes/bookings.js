const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const toPlain = (doc) => {
    if (!doc) return null;
    if (doc.data) return doc.data;
    if (typeof doc.toObject === 'function') return doc.toObject();
    return doc;
};

// Get user bookings
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id });
        const plainBookings = bookings.map(toPlain);
        // Sort manually by timestamp desc
        const sorted = plainBookings.sort((a, b) => {
            const aTime = a.timestamp || 0;
            const bTime = b.timestamp || 0;
            return new Date(bTime) - new Date(aTime);
        });
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Get active slots for a zone on a given date (real-time database state - Protected)
router.get('/active-slots', auth, async (req, res) => {
    const { zoneId, date } = req.query;
    try {
        const queryDate = date || new Date().toISOString().split('T')[0];
        const bookings = await Booking.find({ date: queryDate });
        // Filter by zoneId and active status
        const active = bookings.map(toPlain).filter(b => {
            const bZone = b.parkingZone;
            const bZoneId = typeof bZone === 'string' ? bZone : (bZone?.id || '');
            const hasZoneId = !zoneId || bZoneId === zoneId;
            const isActive = b.paymentStatus === 'paid' || b.paymentStatus === 'pending' || b.paymentStatus === 'completed';
            return hasZoneId && isActive;
        });

        // Sanitize to exclude sensitive user data (vehicleNumber, user id)
        const sanitized = active.map(b => ({
            slotId: b.slotId,
            parkingZone: b.parkingZone,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            paymentStatus: b.paymentStatus
        }));

        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { slot, slotId: bodySlotId, date, startTime, endTime, parkingZone, duration } = req.body;
        const zoneId = parkingZone?.id || '';
        const rawSlot = bodySlotId || slot?.id || slot?.title;
        const slotId = (zoneId && rawSlot && !rawSlot.startsWith(zoneId)) ? `${zoneId}-${rawSlot}` : rawSlot;

        if (!slotId || !date || !startTime || !endTime) {
            return res.status(400).json({ message: 'Missing booking details' });
        }

        // Execute overlap check and booking creation inside atomic lock queue
        const savedBooking = await Booking.lock(async () => {
            const bookings = await Booking.find({ date });
            const plainBookings = bookings.map(toPlain);
            const hasOverlap = plainBookings.some(b => {
                const bZoneId = b.parkingZone?.id;
                
                // Match slot and zone strictly
                const isSameSlot = (b.slotId === slotId || b.slotId === slot?.title || b.slotId === slot?.id) &&
                                   (!zoneId || !bZoneId || bZoneId === zoneId);
                if (!isSameSlot) return false;

                const isOverlap = b.startTime < endTime && b.endTime > startTime;
                const isPaid = b.paymentStatus === 'paid' || b.paymentStatus === 'completed';
                const isRecentPending = b.paymentStatus === 'pending' && 
                    (Date.now() - new Date(b.timestamp || Date.now()).getTime() < 15 * 60 * 1000);
                return isOverlap && (isPaid || isRecentPending);
            });

            if (hasOverlap) {
                const err = new Error('This slot is already reserved for the selected timeframe.');
                err.statusCode = 400;
                throw err;
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

            return await newBooking.save();
        });

        res.status(201).json(toPlain(savedBooking));
    } catch (err) {
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Update booking details (e.g. paymentStatus, vehicleId) - Protected
router.put('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const plain = toPlain(booking);
        const userId = String(plain.user || '');
        if (userId !== String(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this booking' });
        }

        const { paymentStatus, paymentId, paymentMethod, paidAt } = req.body;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        if (paymentId) booking.paymentId = paymentId;
        if (paymentMethod) booking.paymentMethod = paymentMethod;
        if (paidAt) booking.paidAt = paidAt;

        const updated = await booking.save();
        res.json(toPlain(updated));
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

        const plain = toPlain(booking);
        const userId = String(plain.user || '');
        if (userId !== String(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        const currentPaymentStatus = plain.paymentStatus;
        const currentPaymentId = plain.paymentId;

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
        res.json({ message: 'Booking cancelled and refunded successfully', booking: toPlain(updated) });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

// Get all bookings (Admin only)
router.get('/all', [auth, admin], async (req, res) => {
    try {
        const bookings = await Booking.find({});
        const plainBookings = bookings.map(toPlain);
        const sorted = plainBookings.sort((a, b) => {
            const aTime = a.timestamp || 0;
            const bTime = b.timestamp || 0;
            return new Date(bTime) - new Date(aTime);
        });
        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: err.message || 'Server error', error: err.message });
    }
});

module.exports = router;
