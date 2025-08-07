const express = require('express');
const CouponController = require('../Controllers/CouponController');

const router = express.Router();

// Create new coupon
router.post('/create', CouponController.createCoupon);

// Get all active coupons
router.get('/active', CouponController.getActiveCoupons);

// Delete coupon
router.delete('/:id', CouponController.deleteCoupon);

module.exports = router;
