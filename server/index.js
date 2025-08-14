// Load environment variables first
require('dotenv').config();

const express = require("express");
const bodyParser = require('body-parser');
const cors = require("cors");
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

require('./Models/db');

const app = express();
const PORT = process.env.PORT || 8080;


// Health check endpoint
app.get('/ping', (req, res) => {
    res.send("PONG")
});


// Middleware setup
app.use(bodyParser.json());
app.use(cors());


// API routes
app.use('/auth', AuthRouter);
app.use('/profile', ProfileRouter);
app.use('/manager', ManagerRouter);
app.use('/api/customers', CustomerRouter);
app.use('/api/sms', SmsRouter);
app.use('/api/coupons', CouponRouter);
app.use('/api/smartcoins', SmartCoinsRouter);
app.use('/api/feedback', FeedbackRouter);
app.use('/api/wishlist', WishlistRouter);
app.use('/api/billing', BillingRouter);
app.use('/api/analytics', AnalyticsRouter);


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
});