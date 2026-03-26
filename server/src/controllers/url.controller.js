const urlService = require('../services/url.service');

const shortenUrl = async (req, res, next) => {
    try {
        const { longUrl, customAlias, expiresInDays } = req.body;
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const userId = req.user ? req.user.id : null;

        const data = await urlService.shortenUrl(longUrl, customAlias, baseUrl, userId, expiresInDays);

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
        let { ip } = req;
        const userAgent = req.headers['user-agent'];

        // Localhost bypass for Resume/Portfolio demonstrations!
        // Local IPs (127.0.0.1 or ::1) do not have a country. We will randomly assign 
        // a public IP to simulate traffic from around the world for your dashboard.
        if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
            const mockIps = [
                '207.97.227.239', // US
                '8.8.8.8', // US
                '178.23.190.255', // Russia
                '14.139.61.12', // India
                '81.2.69.142', // UK
                '103.213.238.255', // Australia
                '177.38.190.255' // Brazil
            ];
            ip = mockIps[Math.floor(Math.random() * mockIps.length)];
        }

        const longUrl = await urlService.getLongUrl(urlCode, ip, userAgent);

        res.status(302).redirect(longUrl);
    } catch (err) {
        next(err);
    }
};

const getRecentUrls = async (req, res, next) => {
    try {
        const urls = await urlService.getRecentUrls(req.user.id);
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
