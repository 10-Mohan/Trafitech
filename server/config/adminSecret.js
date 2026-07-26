const crypto = require('crypto');

let devAdminSecret = null;

const getAdminSecret = () => {
    if (process.env.ADMIN_SECRET_KEY) {
        return process.env.ADMIN_SECRET_KEY;
    }

    if (!devAdminSecret) {
        devAdminSecret = 'traffitech-admin-key-' + crypto.randomBytes(12).toString('hex');
        if (process.env.NODE_ENV === 'production' || process.env.RENDER === 'true') {
            console.warn("🚨 PRODUCTION SECURITY WARNING: ADMIN_SECRET_KEY environment variable is not configured on Render.");
            console.warn("🔒 Generated ephemeral random secret for this deployment session. Set ADMIN_SECRET_KEY in Render environment variables for permanent custom key.");
        } else {
            console.warn("⚠️ Notice: ADMIN_SECRET_KEY environment variable is missing. Generated ephemeral local admin secret.");
        }
    }
    return devAdminSecret;
};

module.exports = { getAdminSecret };
