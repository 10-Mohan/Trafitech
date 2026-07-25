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
            const docs = await MongooseUser.find(query, projection);
            const instances = docs.map(u => new User(u.toObject ? u.toObject() : u));
            if (projection && projection.includes('-password')) {
                instances.forEach(inst => {
                    delete inst.data.password;
                });
            }
            return instances;
        }
        const results = await jsonDb.find(query);
        const instances = results.map(u => new User(u));
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
            return new User(doc.toObject ? doc.toObject() : doc);
        }

        const user = await jsonDb.findOne(query);
        if (!user) return null;
        return new User(user);
    }

    static async findById(id) {
        if (User.isMongoConnected()) {
            const doc = await MongooseUser.findById(id);
            if (!doc) return null;
            return new User(doc.toObject ? doc.toObject() : doc);
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

    get _id() {
        return this.data._id;
    }

    set _id(val) {
        this.data._id = val;
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

    toJSON() {
        return this.data;
    }

    async save() {
        if (User.isMongoConnected()) {
            if (this.data._id) {
                const updated = await MongooseUser.findByIdAndUpdate(this.data._id, this.data, { new: true });
                const plain = updated ? (updated.toObject ? updated.toObject() : updated) : this.data;
                this.data = plain;
                return new User(plain);
            }
            const mongoUser = new MongooseUser(this.data);
            const saved = await mongoUser.save();
            const plain = saved.toObject ? saved.toObject() : saved;
            this.data = plain;
            return new User(plain);
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
