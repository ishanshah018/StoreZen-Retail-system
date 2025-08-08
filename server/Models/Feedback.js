const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// =============================================================================
// FEEDBACK MODEL - Professional Customer Feedback System
// =============================================================================

const FeedbackSchema = new Schema({
    // User Information
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    
    // Feedback Rating (1-5 stars)
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    
    // Feedback Categories (for ratings below 5 stars)
    feedbackCategories: [{
        category: {
            type: String,
            enum: [
                // 1 Star Categories
                'product_quality_issues',
                'website_problems',
                'other_issues',
                'poor_billing_facility',
                // 2 Star Categories  
                'product_quality',
                'pricing_concerns',
                'smart_coins_redemption_issues',
                'website_experience',
                // 3 Star Categories
                'product_availability',
                'checkout_process',
                'chatbot_issues',
                // 4 Star Categories
                'user_interface',
                'lagging_issues',
                'out_of_stock_items',
                // Common
                'others'
            ]
        },
        selected: {
            type: Boolean,
            default: false
        }
    }],
    
    // Optional Text Feedback
    feedbackText: {
        type: String,
        maxlength: 1000,
        default: ''
    },
    
    // Submission Date
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

// Indexes for better performance
FeedbackSchema.index({ userId: 1, submittedAt: -1 });
FeedbackSchema.index({ rating: 1 });

const FeedbackModel = mongoose.model('feedbacks', FeedbackSchema);
module.exports = FeedbackModel;
