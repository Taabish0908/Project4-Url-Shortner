const Analytics = require('../models/analyticsModel');
const Url = require('../models/urlModel');
const User = require('../models/userModel');
const AppError = require('../utils/AppError');

// Protected Route for Users to see their own link trends
const getMyLinkAnalytics = async (req, res, next) => {
    try {
        const { urlCode } = req.params;
        const link = await Url.findOne({ urlCode, userId: req.user.id });

        if (!link) {
            return next(new AppError('No link found or you do not have permission.', 404));
        }

        const stats = await Analytics.find({ urlCode }).sort('-createdAt');
        
        res.status(200).json({
            status: 'success',
            count: stats.length,
            data: stats
        });
    } catch (err) {
        next(err);
    }
};

// Admin Route to see System-wide analytics
const getAdminSystemAnalytics = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalUrls = await Url.countDocuments();

        // Aggregate browsers usage
        const browserStats = await Analytics.aggregate([
            { $group: { _id: '$browser', count: { $sum: 1 } } }
        ]);

        const osStats = await Analytics.aggregate([
            { $group: { _id: '$os', count: { $sum: 1 } } }
        ]);

        const countryStats = await Analytics.aggregate([
            { $group: { _id: '$country', count: { $sum: 1 } } }
        ]);

        const recentClicks = await Analytics.find().sort('-createdAt').limit(20);

        res.status(200).json({
            status: 'success',
            data: {
                totalUsers,
                totalUrls,
                browserStats,
                osStats,
                countryStats,
                recentClicks
            }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getMyLinkAnalytics,
    getAdminSystemAnalytics
};
