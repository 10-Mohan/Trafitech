const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: `Token is not valid: ${err.message}` });
    }
};
