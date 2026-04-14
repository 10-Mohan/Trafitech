const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const JsonDB = require('../utils/jsonDB');

const jsonDb = new JsonDB('users');

// 1. Define Mongoose Schema (for MongoDB Atlas)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);

// 2. Define Hybrid Wrapper
class User {
    static isMongoConnected() {
        return mongoose.connection.readyState === 1;
    }

    static async findOne(query) {
        if (User.isMongoConnected()) {
            return await MongooseUser.findOne(query);
        }

        const user = await jsonDb.findOne(query);
        if (user) {
            user.comparePassword = async function (candidatePassword) {
                return await bcrypt.compare(candidatePassword, this.password);
            };
        }
        return user;
    }

    static async findById(id) {
        if (User.isMongoConnected()) {
            return await MongooseUser.findById(id);
        }
        return await jsonDb.findById(id);
    }

    constructor(data) {
        this.data = { role: 'user', ...data };
    }

    async save() {
        if (User.isMongoConnected()) {
            const mongoUser = new MongooseUser(this.data);
            const saved = await mongoUser.save();
            return saved;
        }

        // JSON Fallback
        if (this.data.password && !this.data.password.startsWith('$2a$')) {
            const salt = await bcrypt.genSalt(10);
            this.data.password = await bcrypt.hash(this.data.password, salt);
        }
        return await jsonDb.create(this.data);
    }
}

module.exports = User;
