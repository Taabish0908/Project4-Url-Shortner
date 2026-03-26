const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: {
        type: String,
        default: 'unknown'
    },
    userAgent: {
        type: String,
        default: 'unknown'
    },
    os: {
        type: String,
        default: 'unknown'
    },
    browser: {
        type: String,
        default: 'unknown'
    },
    country: {
        type: String,
        default: 'unknown'
    }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
