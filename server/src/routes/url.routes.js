const express = require('express');
const urlController = require('../controllers/url.controller');
const validate = require('../middlewares/validator');
const { urlSchema } = require('../utils/validationSchemas');
const { protect, optionalAuth } = require('../middlewares/auth');

const router = express.Router();

router.post('/url/shorten', optionalAuth, validate(urlSchema, 'body'), urlController.shortenUrl);
router.get('/urls/recent', protect, urlController.getRecentUrls); // Now specific to logged in user
router.get('/:urlCode', urlController.getShortUrl);

module.exports = router;
