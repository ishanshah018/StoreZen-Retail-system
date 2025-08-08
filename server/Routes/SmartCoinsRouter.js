const express = require('express');
const SmartCoinsController = require('../Controllers/SmartCoinsController');

const router = express.Router();

// =============================================================================
// SMART COINS ROUTES - Professional API Endpoints
// =============================================================================

// Get user's smart coins balance and transactions
router.get('/:userId', SmartCoinsController.getSmartCoins);

// Award smart coins to user
router.post('/award/:userId', SmartCoinsController.awardSmartCoins);

// Spend smart coins
router.post('/spend/:userId', SmartCoinsController.spendSmartCoins);

module.exports = router;
