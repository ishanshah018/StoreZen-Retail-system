const FeedbackModel = require('../Models/Feedback');
const UserModel = require('../Models/User');

// =============================================================================
// FEEDBACK CONTROLLER - Professional Customer Feedback Management
// =============================================================================

class FeedbackController {
    
    /** Submit customer feedback */
    static async submitFeedback(req, res) {
        try {
            const { userId } = req.params;
            const { rating, feedbackCategories, feedbackText } = req.body;

            // Validate required fields
            if (!userId || !rating) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID and rating are required'
                });
            }

            // Validate rating range
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }

            // Get user information
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Create feedback document
            const feedback = new FeedbackModel({
                userId: userId,
                userName: user.name,
                userEmail: user.email,
                rating: rating,
                feedbackCategories: feedbackCategories || [],
                feedbackText: feedbackText || '',
                submittedAt: new Date()
            });

            // Save feedback to database
            await feedback.save();

            res.status(201).json({
                success: true,
                message: 'Thank you for your feedback! We appreciate your input.',
                data: {
                    feedbackId: feedback._id,
                    rating: feedback.rating,
                    submittedAt: feedback.submittedAt
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to submit feedback. Please try again.',
                error: error.message
            });
        }
    }

    /** Get user's feedback history */
    static async getUserFeedback(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // Get user's feedback history
            const feedbacks = await FeedbackModel.find({ userId })
                .sort({ submittedAt: -1 })
                .limit(10);

            res.status(200).json({
                success: true,
                message: 'Feedback history retrieved successfully',
                data: {
                    feedbacks: feedbacks,
                    totalCount: feedbacks.length
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve feedback history',
                error: error.message
            });
        }
    }

    /** Get all feedback (Admin only) */
    static async getAllFeedback(req, res) {
        try {
            const { page = 1, limit = 50, rating } = req.query;
            
            // Build filter query
            const filter = {};
            if (rating) filter.rating = parseInt(rating);

            // Get feedback with pagination, sorted by most recent first
            const feedbacks = await FeedbackModel.find(filter)
                .sort({ submittedAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const totalCount = await FeedbackModel.countDocuments(filter);

            res.status(200).json({
                success: true,
                message: 'Feedback retrieved successfully',
                data: {
                    feedbacks: feedbacks,
                    totalCount: totalCount,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit)
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to retrieve feedback',
                error: error.message
            });
        }
    }
}

module.exports = FeedbackController;
