const express = require('express');
const router = express.Router();
const {
    getAvailableCoupons,
    validateCoupon,
    getSmartCoinsBalance,
    createBill,
    getBillHistory,
    getBillById,
    findBestCoupon,
    getCustomerBillsForAssistant
} = require('../Controllers/BillingController');

// =============================================================================
// SMART BILLING ROUTES
// =============================================================================

// Get available coupons
router.get('/coupons/available', getAvailableCoupons);

// Validate coupon and calculate discount
router.post('/coupons/validate', validateCoupon);

// Find best coupon automatically
router.post('/coupons/best', findBestCoupon);

// Get Smart Coins balance
router.get('/smart-coins/:userId', getSmartCoinsBalance);

// Create new bill
router.post('/create', createBill);

// Get bill history for customer
router.get('/history/:customerId', getBillHistory);

// Get specific bill by ID
router.get('/:billId', getBillById);

// Get customer bills for Smart Shopping Assistant
router.get('/customer/:userId', getCustomerBillsForAssistant);

module.exports = router;
