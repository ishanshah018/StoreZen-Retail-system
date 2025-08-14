const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/AnalyticsController');

// =============================================================================
// CUSTOMER ANALYTICS ROUTES
// =============================================================================

/**
 * GET /api/analytics/:customerId
 * Get comprehensive analytics for a customer (last 12 months)
 */
router.get('/:customerId', analyticsController.getCustomerAnalytics);

/**
 * GET /api/analytics/:customerId/custom
 * Get analytics for custom date range or specified months
 * Query params: startDate, endDate, months
 */
router.get('/:customerId/custom', analyticsController.getCustomRangeAnalytics);

module.exports = router;
