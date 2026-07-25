const mongoose = require('mongoose');
const JsonDB = require('../utils/jsonDB');

const jsonDb = new JsonDB('bookings');

// 1. Mongoose Schema
const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    bookingId: { type: String, required: true },
    slotId: { type: String, required: true },
    parkingZone: mongoose.Schema.Types.Mixed,
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

    static async lock(fn) {
        if (Booking.isMongoConnected()) {
            return await fn();
        }
        return await jsonDb.lock(fn);
    }

    static async find(query) {
        if (Booking.isMongoConnected()) {
            const docs = await MongooseBooking.find(query);
            return docs.map(d => new Booking(d.toObject ? d.toObject() : d));
        }
        const results = await jsonDb.find(query);
        return results.map(b => new Booking(b));
    }

    static async findOne(query) {
        if (Booking.isMongoConnected()) {
            const doc = await MongooseBooking.findOne(query);
            if (!doc) return null;
            return new Booking(doc.toObject ? doc.toObject() : doc);
        }
        const booking = await jsonDb.findOne(query);
        if (!booking) return null;
        return new Booking(booking);
    }

    static async findById(id) {
        if (Booking.isMongoConnected()) {
            const doc = await MongooseBooking.findById(id);
            if (!doc) return null;
            return new Booking(doc.toObject ? doc.toObject() : doc);
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

    get _id() { return this.data._id; }
    set _id(val) { this.data._id = val; }
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
            if (this.data._id) {
                const updated = await MongooseBooking.findByIdAndUpdate(this.data._id, this.data, { new: true });
                const plain = updated ? (updated.toObject ? updated.toObject() : updated) : this.data;
                this.data = plain;
                return new Booking(plain);
            }
            const mongoBooking = new MongooseBooking(this.data);
            const saved = await mongoBooking.save();
            const plain = saved.toObject ? saved.toObject() : saved;
            this.data = plain;
            return new Booking(plain);
        }

        if (this.data._id) {
            const updated = await jsonDb.update(this.data._id, this.data);
            return new Booking(updated);
        }

        const saved = await jsonDb.create(this.data);
        this.data._id = saved._id;
        return new Booking(saved);
    }
}

module.exports = Booking;
