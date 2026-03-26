const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    longUrl: {
        type: String,
        trim: true,
        required: true,
        lowercase: true
    },
    shortUrl: {
        type: String,
        required: true,
        unique: true
    },
    clicks: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: false // Allow guest generation
    },
    expiresAt: {
        type: Date,
        required: false,
        index: { expireAfterSeconds: 0 } // TTL Index
    }
}, { timestamps: true });

module.exports = mongoose.model('Url', UrlSchema);