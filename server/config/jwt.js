const crypto = require('crypto');

let devSecret = null;

const getJwtSecret = () => {
    if (process.env.JWT_SECRET) {
        return process.env.JWT_SECRET;
    }

    if (process.env.NODE_ENV === 'production') {
        console.error("FATAL ERROR: JWT_SECRET environment variable is required in production!");
        process.exit(1);
    }

    // In local development mode without JWT_SECRET, generate a random ephemeral secret per boot
    if (!devSecret) {
        devSecret = crypto.randomBytes(32).toString('hex');
        console.warn("⚠️ Warning: JWT_SECRET environment variable is missing. Generated ephemeral local secret.");
    }
    return devSecret;
};

module.exports = { getJwtSecret };
