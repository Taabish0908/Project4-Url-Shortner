const urlService = require('../services/url.service');

const shortenUrl = async (req, res, next) => {
    try {
        const { longUrl, customAlias } = req.body;
        // In Express, we can derive the base URL from the req or config
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;

        const data = await urlService.shortenUrl(longUrl, customAlias, baseUrl);

        res.status(201).json({
            status: 'success',
            data
        });
    } catch (err) {
        next(err);
    }
};

const getShortUrl = async (req, res, next) => {
    try {
        const { urlCode } = req.params;
        const longUrl = await urlService.getLongUrl(urlCode);

        // Standard 302 redirect
        res.status(302).redirect(longUrl);
    } catch (err) {
        next(err);
    }
};

const getRecentUrls = async (req, res, next) => {
    try {
        const urls = await urlService.getRecentUrls();
        res.status(200).json({
            status: 'success',
            data: urls
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    shortenUrl,
    getShortUrl,
    getRecentUrls
};
