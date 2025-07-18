const express = require('express');
const router = express.Router();
const {
    getManagerProfile,
    updateManagerProfile,
    updateStoreSettings,
    getStoreInfo
} = require('../Controllers/ManagerController');


// Manager profile routes - Handle profile data operations
router.get('/profile', getManagerProfile);
router.put('/profile', updateManagerProfile);
router.patch('/profile', updateManagerProfile); // Support both PUT and PATCH


// Store settings routes - Handle store theme and display settings
router.get('/store-settings', getStoreInfo);
router.put('/store-settings', updateStoreSettings);
router.patch('/store-settings', updateStoreSettings);


// Public store info route - For customer viewing
router.get('/store-info', getStoreInfo);


module.exports = router;
