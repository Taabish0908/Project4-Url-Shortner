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
    }
}, { timestamps: true });

module.exports = mongoose.model('Url', UrlSchema);