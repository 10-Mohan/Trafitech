const mongoose = require('mongoose');
const JsonDB = require('../utils/jsonDB');

const jsonDb = new JsonDB('bookings');

// 1. Mongoose Schema
const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bookingId: { type: String, required: true, unique: true },
    slotId: { type: String, required: true },
    parkingZone: { id: String, label: String, price: Number },
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

// 2. Define Hybrid Wrapper
class Booking {
    static isMongoConnected() {
        return mongoose.connection.readyState === 1;
    }

    static async find(query) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.find(query);
        }
        const results = await jsonDb.find(query);
        return results.map(b => new Booking(b));
    }

    static async findOne(query) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.findOne(query);
        }
        const booking = await jsonDb.findOne(query);
        if (!booking) return null;
        return new Booking(booking);
    }

    static async findById(id) {
        if (Booking.isMongoConnected()) {
            return await MongooseBooking.findById(id);
        }
        const booking = await jsonDb.findById(id);
        if (!booking) return null;
        return new Booking(booking);
    }

    constructor(data) {
        this.data = data || {};
        if (this.data._id) {
            this._id = this.data._id;
        }
    }

    get bookingId() { return this.data.bookingId; }
    get slotId() { return this.data.slotId; }
    get parkingZone() { return this.data.parkingZone; }
    get date() { return this.data.date; }
    get startTime() { return this.data.startTime; }
    get endTime() { return this.data.endTime; }
    get duration() { return this.data.duration; }
    get totalPrice() { return this.data.totalPrice; }
    get paymentStatus() { return this.data.paymentStatus; }
    get paymentId() { return this.data.paymentId; }
    get timestamp() { return this.data.timestamp; }
    get user() { return this.data.user; }
    get slot() { return this.data.slot; }

    toJSON() {
        return this.data;
    }

    set paymentStatus(val) {
        this.data.paymentStatus = val;
    }

    set paymentId(val) {
        this.data.paymentId = val;
    }

    async save() {
        if (Booking.isMongoConnected()) {
            const mongoBooking = new MongooseBooking(this.data);
            return await mongoBooking.save();
        }

        if (this.data._id) {
            const updated = await jsonDb.update(this.data._id, this.data);
            return new Booking(updated);
        }

        const saved = await jsonDb.create(this.data);
        this.data._id = saved._id;
        this._id = saved._id;
        return new Booking(saved);
    }
}

module.exports = Booking;
