const urlModel = require('../models/urlModel');
const Analytics = require('../models/analyticsModel');
const shortid = require('shortid');
const AppError = require('../utils/AppError');
const { redisClient } = require('../config/redis');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

/**
 * Increment the click counter for analytics & Save detailed info
 */
const trackClick = async (urlCode, ip, userAgentStr) => {
    try {
        // Increment base counter
        await urlModel.findOneAndUpdate({ urlCode }, { $inc: { clicks: 1 } });
        
        // Parse User Agent
        const parser = new UAParser(userAgentStr);
        const browser = parser.getBrowser().name || 'Unknown';
        const os = parser.getOS().name || 'Unknown';

        // Parse IP Location
        const geo = geoip.lookup(ip);
        const country = (geo && geo.country) ? geo.country : 'Unknown';

        // Async drop into Analytics Model
        await Analytics.create({
            urlCode,
            ipAddress: ip,
            userAgent: userAgentStr,
            browser,
            os,
            country
        });

        // Invalidate cache
        const doc = await urlModel.findOne({ urlCode });
        if (doc) {
             await redisClient.set(urlCode, JSON.stringify(doc), { EX: 3600 });
        }
    } catch (err) {
        console.error('Failed to track analytics', err);
    }
};

/**
 * Create a short URL
 */
const shortenUrl = async (longUrl, customAlias, baseUrl, userId = null, expiresInDays = null) => {
    // If no custom alias and no expiration requirement, we can check basic cache
    if (!customAlias && !expiresInDays) {
        let cachedData = await redisClient.get(`gen:${longUrl}`);
        if (cachedData) {
            return JSON.parse(cachedData);
        }
    }

    let urlCode = shortid.generate().toLowerCase();

    // If customAlias is provided, check if it's already taken
    if (customAlias) {
        const aliasExists = await urlModel.findOne({ urlCode: customAlias.toLowerCase() });
        if (aliasExists) {
            throw new AppError('Custom alias is already in use.', 400);
        }
        urlCode = customAlias.toLowerCase();
    }

    const shortUrl = `${baseUrl}/${urlCode}`;
    
    // Calculate expiration if requested
    let expiresAt = null;
    if (expiresInDays) {
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + parseInt(expiresInDays));
    }

    const payload = {
        longUrl,
        shortUrl,
        urlCode
    };

    if (userId) payload.userId = userId;
    if (expiresAt) payload.expiresAt = expiresAt;

    const shortened = await urlModel.create(payload);

    const result = {
        longUrl: shortened.longUrl,
        shortUrl: shortened.shortUrl,
        urlCode: shortened.urlCode,
        clicks: shortened.clicks,
        expiresAt: shortened.expiresAt
    };

    // Cache the result
    if (!expiresInDays) await redisClient.set(`gen:${longUrl}`, JSON.stringify(result), { EX: 3600 });
    await redisClient.set(urlCode, JSON.stringify(result), { EX: 3600 });

    return result;
};

/**
 * Retrieve a long URL from short code
 */
const getLongUrl = async (urlCode, ip, userAgent) => {
    // Try getting from cache
    let cachedData = await redisClient.get(urlCode);
    if (cachedData) {
        let parsedData = JSON.parse(cachedData);
        trackClick(urlCode, ip, userAgent); // async
        return parsedData.longUrl;
    }

    const urlDoc = await urlModel.findOne({ urlCode });
    if (!urlDoc) {
        throw new AppError('No URL found for this code or URL has expired.', 404);
    }

    // Cache data and track
    await redisClient.set(urlCode, JSON.stringify(urlDoc), { EX: 3600 });
    trackClick(urlCode, ip, userAgent); // async

    return urlDoc.longUrl;
};

/**
 * Get recent URLs for dashboard
 */
const getRecentUrls = async (userId) => {
    const urls = await urlModel.find({ userId }).sort({ createdAt: -1 }).limit(20).select({ _id: 0, __v: 0 });
    return urls;
};

module.exports = {
    shortenUrl,
    getLongUrl,
    getRecentUrls
};
