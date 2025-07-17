const express = require('express');
const router = express.Router();
const {
    getManagerProfile,
    updateManagerProfile,
    updateStoreSettings,
    getStoreInfo,
    updateManagerPermissions
} = require('../Controllers/ManagerController');

// Manager profile routes
router.get('/profile', getManagerProfile);
router.put('/profile', updateManagerProfile);
router.patch('/profile', updateManagerProfile); // Support both PUT and PATCH

// Store settings routes
router.get('/store-settings', getStoreInfo);
router.put('/store-settings', updateStoreSettings);
router.patch('/store-settings', updateStoreSettings);

// Store info for customers (public route)
router.get('/store-info', getStoreInfo);

// Manager permissions (for future admin features)
router.put('/permissions', updateManagerPermissions);

module.exports = router;
