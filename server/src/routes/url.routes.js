const express = require('express');
const urlController = require('../controllers/url.controller');
const validate = require('../middlewares/validator');
const { urlSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/url/shorten', validate(urlSchema, 'body'), urlController.shortenUrl);
router.get('/urls/recent', urlController.getRecentUrls); // New endpoint for dashboard
router.get('/:urlCode', urlController.getShortUrl);

module.exports = router;
