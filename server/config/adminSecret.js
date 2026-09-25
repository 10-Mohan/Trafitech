const crypto = require('crypto');

let devAdminSecret = null;

const getAdminSecret = () => {
    if (process.env.ADMIN_SECRET_KEY) {
        return process.env.ADMIN_SECRET_KEY;
    }

    if (!devAdminSecret) {
        devAdminSecret = process.env.ADMIN_SECRET_KEY || 'traffitech-admin-2026';
    }
    return devAdminSecret;
};

module.exports = { getAdminSecret };
