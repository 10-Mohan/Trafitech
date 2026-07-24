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

    static async find(query = {}, projection = '') {
        if (User.isMongoConnected()) {
            return await MongooseUser.find(query, projection);
        }
        const results = await jsonDb.find(query);
        // Map to User instances
        const instances = results.map(u => new User(u));
        // Apply basic projection if -password is requested
        if (projection && projection.includes('-password')) {
            instances.forEach(inst => {
                delete inst.data.password;
            });
        }
        return instances;
    }

    static async findOne(query) {
        if (User.isMongoConnected()) {
            const doc = await MongooseUser.findOne(query);
            if (!doc) return null;
            // Add Mongoose compatibility layer if needed or return direct mongoose doc
            return doc;
        }

        const user = await jsonDb.findOne(query);
        if (!user) return null;
        return new User(user);
    }

    static async findById(id) {
        if (User.isMongoConnected()) {
            return await MongooseUser.findById(id);
        }
        const user = await jsonDb.findById(id);
        if (!user) return null;
        return new User(user);
    }

    constructor(data) {
        this.data = { role: 'user', ...data };
        // Expose top level fields directly or via getter/setter to match mongoose objects
        if (this.data._id) {
            this._id = this.data._id;
        }
    }

    get role() {
        return this.data.role;
    }

    get username() {
        return this.data.username;
    }

    get email() {
        return this.data.email;
    }

    get password() {
        return this.data.password;
    }

    async comparePassword(candidatePassword) {
        // Safe check for hashed passwords
        const hash = this.data.password || '';
        return await bcrypt.compare(candidatePassword, hash);
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

        if (this.data._id) {
            const updated = await jsonDb.update(this.data._id, this.data);
            return new User(updated);
        }

        const saved = await jsonDb.create(this.data);
        this.data._id = saved._id;
        this._id = saved._id;
        return new User(saved);
    }
}

module.exports = User;
