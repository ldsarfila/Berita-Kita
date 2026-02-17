const { verifyAccessToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.slice(7);

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa' });
    }
}

module.exports = {
    requireAuth
};
