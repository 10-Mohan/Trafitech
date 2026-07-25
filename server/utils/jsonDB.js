const fs = require('fs');
const path = require('path');

class JsonDB {
    constructor(collectionName) {
        this.filePath = path.join(__dirname, '../data', `${collectionName}.json`);
        this.ensureFileExists();
        this.lockQueue = Promise.resolve();
    }

    ensureFileExists() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify([]));
        }
    }

    // Execute any function sequentially inside a mutex lock queue
    lock(fn) {
        const next = this.lockQueue.then(async () => {
            return await fn();
        });
        this.lockQueue = next.catch(() => {});
        return next;
    }

    async read() {
        return this.lock(async () => {
            const data = fs.readFileSync(this.filePath, 'utf8');
            return JSON.parse(data);
        });
    }

    async write(data) {
        return this.lock(async () => {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        });
    }

    async find(query = {}) {
        return this.lock(async () => {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const data = JSON.parse(raw);
            return data.filter(item => {
                for (let key in query) {
                    if (item[key] !== query[key]) return false;
                }
                return true;
            });
        });
    }

    async findOne(query = {}) {
        return this.lock(async () => {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const data = JSON.parse(raw);
            return data.find(item => {
                for (let key in query) {
                    if (item[key] !== query[key]) return false;
                }
                return true;
            });
        });
    }

    async create(item) {
        return this.lock(async () => {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const data = JSON.parse(raw);
            const newItem = { ...item, _id: Date.now().toString() + Math.random().toString(36).substring(2, 6) };
            data.push(newItem);
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
            return newItem;
        });
    }

    async update(id, item) {
        return this.lock(async () => {
            const raw = fs.readFileSync(this.filePath, 'utf8');
            const data = JSON.parse(raw);
            const index = data.findIndex(x => x._id === id);
            if (index !== -1) {
                data[index] = { ...data[index], ...item };
                fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
                return data[index];
            }
            return null;
        });
    }

    async findById(id) {
        return this.findOne({ _id: id });
    }
}

module.exports = JsonDB;
