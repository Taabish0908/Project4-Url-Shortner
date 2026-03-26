const express = require('express');
const { getMyLinkAnalytics, getAdminSystemAnalytics } = require('../controllers/analytics.controller');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.get('/:urlCode', protect, getMyLinkAnalytics);
router.get('/system/admin', protect, authorize('admin'), getAdminSystemAnalytics);

module.exports = router;
