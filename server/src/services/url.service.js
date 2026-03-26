const urlModel = require('../models/urlModel');
const shortid = require('shortid');
const AppError = require('../utils/AppError');
const { redisClient } = require('../config/redis');

/**
 * Increment the click counter for analytics
 */
const incrementClicks = async (urlCode) => {
    try {
        await urlModel.findOneAndUpdate({ urlCode }, { $inc: { clicks: 1 } });
        // Invalidate cache or update it
        const doc = await urlModel.findOne({ urlCode });
        if (doc) {
             await redisClient.set(urlCode, JSON.stringify(doc), {
                 EX: 3600
             });
        }
    } catch (err) {
        console.error('Failed to increment clicks', err);
    }
};

/**
 * Create a short URL
 */
const shortenUrl = async (longUrl, customAlias, baseUrl) => {
    // If customAlias is not provided, we check if original URL already has a basic short URL
    if (!customAlias) {
        let cachedData = await redisClient.get(longUrl);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        const existingUrl = await urlModel.findOne({ longUrl }).select({ _id: 0, __v: 0 });
        if (existingUrl) {
            await redisClient.set(longUrl, JSON.stringify(existingUrl), {
                EX: 3600 // cache for 1 hour
            });
            return existingUrl;
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

    const shortened = await urlModel.create({
        longUrl,
        shortUrl,
        urlCode
    });

    const result = {
        longUrl: shortened.longUrl,
        shortUrl: shortened.shortUrl,
        urlCode: shortened.urlCode,
        clicks: shortened.clicks
    };

    // Cache the result
    await redisClient.set(longUrl, JSON.stringify(result), { EX: 3600 });
    await redisClient.set(urlCode, JSON.stringify(result), { EX: 3600 });

    return result;
};

/**
 * Retrieve a long URL from short code
 */
const getLongUrl = async (urlCode) => {
    // Try getting from cache
    let cachedData = await redisClient.get(urlCode);
    if (cachedData) {
        let parsedData = JSON.parse(cachedData);
        incrementClicks(urlCode); // async call
        return parsedData.longUrl;
    }

    const urlDoc = await urlModel.findOne({ urlCode });
    if (!urlDoc) {
        throw new AppError('No URL found for this code', 404);
    }

    // Cache data and increment click
    await redisClient.set(urlCode, JSON.stringify(urlDoc), { EX: 3600 });
    incrementClicks(urlCode); // async call

    return urlDoc.longUrl;
};

/**
 * Get recent URLs for dashboard
 */
const getRecentUrls = async () => {
    const urls = await urlModel.find().sort({ createdAt: -1 }).limit(10).select({ _id: 0, __v: 0 });
    return urls;
};

module.exports = {
    shortenUrl,
    getLongUrl,
    getRecentUrls
};
