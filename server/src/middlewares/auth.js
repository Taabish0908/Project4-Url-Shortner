const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const User = require('../models/userModel');

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Not authorized to access this route. Please login.', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        next();
    } catch (err) {
        return next(new AppError('Not authorized to access this route.', 401));
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev_only');
            req.user = await User.findById(decoded.id);
        }
        next();
    } catch (err) {
        // Just continue without user if token is invalid
        next();
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('User role is not authorized to access this route.', 403));
        }
        next();
    };
};

module.exports = { protect, authorize, optionalAuth };
