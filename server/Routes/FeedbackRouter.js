const express = require('express');
const FeedbackController = require('../Controllers/FeedbackController');

const router = express.Router();

// =============================================================================
// FEEDBACK ROUTES - Professional Customer Feedback API Endpoints
// =============================================================================

// Submit customer feedback
router.post('/submit/:userId', FeedbackController.submitFeedback);

// Get user's feedback history
router.get('/user/:userId', FeedbackController.getUserFeedback);

// Get all feedback (Admin)
router.get('/all', FeedbackController.getAllFeedback);

module.exports = router;
