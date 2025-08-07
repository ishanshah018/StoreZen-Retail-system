/**
 * SMS Controller
 * Handles SMS-related API endpoints using Twilio service
 */

const TwilioSmsService = require('../Services/TwilioSmsService');

class SmsController {
    constructor() {
        // Initialize Twilio SMS service
        try {
            this.twilioService = new TwilioSmsService();
        } catch (error) {
            console.error('Failed to initialize Twilio SMS Service:', error.message);
            this.twilioService = null;
        }
    }

    /**
     * Send promotional SMS to selected customers
     * POST /api/sms/send-promotional
     */
    async sendPromotionalSms(req, res) {
        try {
            // Check if Twilio service is available
            if (!this.twilioService) {
                return res.status(500).json({
                    success: false,
                    message: 'SMS service not available. Please check Twilio configuration.',
                    error: 'Twilio service not initialized'
                });
            }

            // Extract data from request body
            const { customers, message } = req.body;

            // Validate request data
            if (!customers || !Array.isArray(customers) || customers.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Customers array is required and cannot be empty',
                    error: 'Invalid customers data'
                });
            }

            if (!message || typeof message !== 'string' || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Message content is required',
                    error: 'Invalid message data'
                });
            }

            // Validate recipients data
            const validRecipients = customers.filter(customer => {
                return customer.name && 
                       customer.phoneNumber && 
                       this.twilioService.isValidPhoneNumber(customer.phoneNumber);
            });

            if (validRecipients.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid recipients found with proper phone numbers',
                    error: 'Invalid recipient phone numbers'
                });
            }

            console.log(`Processing SMS request for ${validRecipients.length} recipients`);
            console.log('Recipients:', validRecipients.map(r => ({ name: r.name, phone: r.phoneNumber })));

            // Send promotional SMS
            const results = await this.twilioService.sendPromotionalSms(validRecipients, message.trim());

            // Determine response status based on results
            const responseStatus = results.successful > 0 ? 200 : 
                                  results.failed === results.total ? 500 : 207; // 207 = Multi-Status

            // Send response
            res.status(responseStatus).json({
                success: results.successful > 0,
                message: `SMS campaign completed. ${results.successful} sent, ${results.failed} failed.`,
                data: {
                    campaign: {
                        totalRecipients: results.total,
                        successful: results.successful,
                        failed: results.failed,
                        successRate: Math.round((results.successful / results.total) * 100)
                    },
                    details: results.details,
                    timestamp: new Date().toISOString()
                }
            });

            // Log detailed results
            console.log('SMS Campaign Results:', {
                successful: results.successful,
                failed: results.failed,
                details: results.details
            });

        } catch (error) {
            console.error('Error in sendPromotionalSms:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error while sending SMS',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    }

    /**
     * Get SMS delivery status
     * GET /api/sms/status/:messageSid
     */
    async getSmsStatus(req, res) {
        try {
            // Check if Twilio service is available
            if (!this.twilioService) {
                return res.status(500).json({
                    success: false,
                    message: 'SMS service not available',
                    error: 'Twilio service not initialized'
                });
            }

            const { messageSid } = req.params;

            if (!messageSid) {
                return res.status(400).json({
                    success: false,
                    message: 'Message SID is required',
                    error: 'Missing message SID'
                });
            }

            // Get message status from Twilio
            const statusResult = await this.twilioService.getMessageStatus(messageSid);

            if (statusResult.success) {
                res.json({
                    success: true,
                    message: 'Message status retrieved successfully',
                    data: statusResult
                });
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Message not found or error retrieving status',
                    error: statusResult.error
                });
            }

        } catch (error) {
            console.error('Error in getSmsStatus:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error while getting SMS status',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    }

    /**
     * Test SMS functionality (for development/testing)
     * POST /api/sms/test
     */
    async testSms(req, res) {
        try {
            // Only allow in development environment
            if (process.env.NODE_ENV !== 'development') {
                return res.status(403).json({
                    success: false,
                    message: 'Test endpoint only available in development mode'
                });
            }

            // Check if Twilio service is available
            if (!this.twilioService) {
                return res.status(500).json({
                    success: false,
                    message: 'SMS service not available',
                    error: 'Twilio service not initialized'
                });
            }

            const { to, message } = req.body;

            if (!to || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number and message are required for testing'
                });
            }

            // Send test SMS
            const result = await this.twilioService.sendSms(to, message);

            res.json({
                success: result.success,
                message: result.success ? 'Test SMS sent successfully' : 'Failed to send test SMS',
                data: result
            });

        } catch (error) {
            console.error('Error in testSms:', error);

            res.status(500).json({
                success: false,
                message: 'Internal server error while sending test SMS',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
            });
        }
    }
}

module.exports = new SmsController();
