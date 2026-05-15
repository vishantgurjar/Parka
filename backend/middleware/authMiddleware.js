const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { userId, email, name }
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const isAdmin = (req, res, next) => {
    // Rely on JWT decoded payload for email/role check instead of query param
    // Ideally we'd use a role field from DB, but keeping it simple based on existing logic
    const adminEmail = process.env.ADMIN_EMAIL;
    if (req.user && req.user.email === adminEmail) {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
};

module.exports = { protect, isAdmin };
