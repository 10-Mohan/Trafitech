const crypto = require('crypto');

let devAdminSecret = null;

const getAdminSecret = () => {
    if (process.env.ADMIN_SECRET_KEY) {
        return process.env.ADMIN_SECRET_KEY;
    }

    if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
        console.error("FATAL ERROR: ADMIN_SECRET_KEY environment variable is required in production!");
        process.exit(1);
    }

    // In local development mode without ADMIN_SECRET_KEY, generate an ephemeral local secret per boot
    if (!devAdminSecret) {
        devAdminSecret = 'traffitech-admin-dev-' + crypto.randomBytes(8).toString('hex');
        console.warn("⚠️ Warning: ADMIN_SECRET_KEY environment variable is missing. Generated ephemeral local admin secret.");
    }
    return devAdminSecret;
};

module.exports = { getAdminSecret };
