const mongoose = require('mongoose');
const JsonDB = require('../utils/jsonDB');

const jsonDb = new JsonDB('bookings');

// 1. Mongoose Schema
const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingId: { type: String, required: true, unique: true },
    slotId: { type: String, required: true },
    parkingZone: { label: String, price: Number },
    date: { type: String, required: true },
    startTime: String,
    endTime: String,
    duration: Number,
    vehicleNumber: String,
    vehicleType: String,
    totalPrice: Number,
    paymentStatus: { type: String, default: 'pending' },
    paymentId: String,
    timestamp: { type: Date, default: Date.now }
});

const MongooseBooking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

// 2. Hybrid Wrapper
class Booking {
    static isMongoConnected() {
        return mongoose.connection.readyState === 1;
    }

    static async find(query) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.find(query);
        }
        return await jsonDb.find(query);
    }

    static async findOne(query) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.findOne(query);
        }
        return await jsonDb.findOne(query);
    }

    static async findById(id) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.findById(id);
        }
        return await jsonDb.findById(id);
    }

    constructor(data) {
        this.data = data;
    }

    async save() {
        if (Booking.isMongoConnected()) {
            const mongoBooking = new MongooseBooking(this.data);
            return await mongoBooking.save();
        }
        return await jsonDb.create(this.data);
    }
}

module.exports = Booking;
