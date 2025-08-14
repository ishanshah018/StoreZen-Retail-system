// =============================================================================
// STOREZEN API SERVER
// =============================================================================

/**
 * StoreZen Backend API Server
 * 
 * A comprehensive retail management system API providing:
 * - User authentication and authorization
 * - Product and inventory management  
 * - Shopping cart and billing system
 * - Analytics and reporting
 * - Smart coins and coupon management
 * - Customer feedback and wishlist features
 */

// Load environment variables first
require('dotenv').config();

// =============================================================================
// DEPENDENCIES AND IMPORTS
// =============================================================================

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");

// Route imports
const AuthRouter = require('./Routes/AuthRouter');
const ProfileRouter = require('./Routes/ProfileRouter');
const ManagerRouter = require('./Routes/ManagerRouter');
const CustomerRouter = require('./Routes/CustomerRoutes');
const SmsRouter = require('./Routes/SmsRoutes');
const CouponRouter = require('./Routes/CouponRouter');
const SmartCoinsRouter = require('./Routes/SmartCoinsRouter');
const FeedbackRouter = require('./Routes/FeedbackRouter');
const WishlistRouter = require('./Routes/WishlistRouter');
const BillingRouter = require('./Routes/BillingRouter');
const AnalyticsRouter = require('./Routes/AnalyticsRouter');

// Database connection
require('./Models/db');

// =============================================================================
// SERVER CONFIGURATION
// =============================================================================

const app = express();
const PORT = process.env.PORT || 8080;

// =============================================================================
// HEALTH CHECK ENDPOINT
// =============================================================================

app.get('/ping', (req, res) => {
    res.send("PONG")
});

// =============================================================================
// MIDDLEWARE SETUP
// =============================================================================
app.use(bodyParser.json());
app.use(cors());

// =============================================================================
// API ROUTES CONFIGURATION
// =============================================================================

// Authentication routes
app.use('/auth', AuthRouter);
app.use('/profile', ProfileRouter);

// Management routes  
app.use('/manager', ManagerRouter);
app.use('/api/customers', CustomerRouter);

// Commerce routes
app.use('/api/billing', BillingRouter);
app.use('/api/coupons', CouponRouter);
app.use('/api/smartcoins', SmartCoinsRouter);

// Customer features
app.use('/api/wishlist', WishlistRouter);
app.use('/api/feedback', FeedbackRouter);

// Communication and analytics
app.use('/api/sms', SmsRouter);
app.use('/api/analytics', AnalyticsRouter);

// =============================================================================
// SERVER STARTUP
// =============================================================================

app.listen(PORT, () => {
    console.log(`🚀 StoreZen API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/ping`);
});