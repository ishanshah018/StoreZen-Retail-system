const express = require('express');
const router = express.Router();
const { 
    getAllCustomers, 
    exportCustomersPDF, 
    exportCustomersExcel 
} = require('../Controllers/CustomerController');

// =============================================================================
// CUSTOMER DATA ROUTES
// =============================================================================

/**
 * GET /api/customers/all
 * Get all customer data for manager dashboard
 */
router.get('/all', getAllCustomers);

/**
 * GET /api/customers/export/pdf
 * Export customer data in PDF format
 */
router.get('/export/pdf', exportCustomersPDF);

/**
 * GET /api/customers/export/excel
 * Export customer data in Excel format
 */
router.get('/export/excel', exportCustomersExcel);

module.exports = router;
