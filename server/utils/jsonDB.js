const fs = require('fs');
const path = require('path');

class JsonDB {
    constructor(collectionName) {
        this.filePath = path.join(__dirname, '../data', `${collectionName}.json`);
        this.ensureFileExists();
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

    async read() {
        const data = fs.readFileSync(this.filePath, 'utf8');
        return JSON.parse(data);
    }

    async write(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }

    async find(query = {}) {
        const data = await this.read();
        return data.filter(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    }

    async findOne(query = {}) {
        const data = await this.read();
        return data.find(item => {
            for (let key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    }

    async create(item) {
        const data = await this.read();
        const newItem = { ...item, _id: Date.now().toString() };
        data.push(newItem);
        await this.write(data);
        return newItem;
    }

    async findById(id) {
        return this.findOne({ _id: id });
    }
}

module.exports = JsonDB;
