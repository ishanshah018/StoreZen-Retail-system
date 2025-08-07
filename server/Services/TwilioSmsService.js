/**
 * Twilio SMS Service
 * Handles SMS sending functionality using Twilio API
 */

const twilio = require('twilio');

class TwilioSmsService {
    constructor() {
        // Initialize Twilio client with credentials from environment variables
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
        
        // Validate Twilio credentials
        if (!this.accountSid || !this.authToken || !this.fromPhoneNumber) {
            console.error('Missing Twilio credentials in environment variables');
            throw new Error('Twilio credentials not configured');
        }
        
        // Initialize Twilio client
        try {
            this.client = twilio(this.accountSid, this.authToken);
            console.log('Twilio SMS Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Twilio client:', error.message);
            throw new Error('Failed to initialize Twilio client: ' + error.message);
        }
    }

    /**
     * Format phone number to international format
     * @param {string} phoneNumber - Phone number to format
     * @returns {string} - Formatted phone number
     */
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // If number doesn't start with country code, assume India (+91)
        if (cleaned.length === 10) {
            return `+91${cleaned}`;
        }
        
        // If already has country code
        if (cleaned.length > 10) {
            return `+${cleaned}`;
        }
        
        return phoneNumber; // Return as is if can't format
    }

    /**
     * Send SMS to a single recipient
     * @param {string} to - Recipient phone number
     * @param {string} message - SMS message content
     * @returns {Object} - Result object with success status and details
     */
    async sendSms(to, message) {
        try {
            // Format phone number
            const formattedTo = this.formatPhoneNumber(to);
            
            console.log(`Sending SMS to: ${formattedTo}`);
            
            // Send SMS using Twilio
            const result = await this.client.messages.create({
                body: message,
                from: this.fromPhoneNumber,
                to: formattedTo
            });

            console.log(`SMS sent successfully. SID: ${result.sid}`);
            
            return {
                success: true,
                messageSid: result.sid,
                to: formattedTo,
                status: result.status,
                message: 'SMS sent successfully'
            };

        } catch (error) {
            console.error(`Failed to send SMS to ${to}:`);
            console.error(`Error Code: ${error.code}`);
            console.error(`Error Message: ${error.message}`);
            console.error(`More Info: ${error.moreInfo}`);
            
            return {
                success: false,
                error: `Twilio Error ${error.code}: ${error.message}`,
                to: to,
                message: 'Failed to send SMS'
            };
        }
    }

    /**
     * Send promotional SMS to multiple recipients
     * @param {Array} recipients - Array of recipient objects with phone numbers and names
     * @param {string} message - SMS message content
     * @returns {Object} - Summary of SMS sending results
     */
    async sendPromotionalSms(recipients, message) {
        console.log(`Starting promotional SMS campaign to ${recipients.length} recipients`);
        
        const results = {
            total: recipients.length,
            successful: 0,
            failed: 0,
            details: []
        };

        // Send SMS to each recipient
        for (const recipient of recipients) {
            try {
                // Use phoneNumber field (matching frontend data structure)
                const phoneNumber = recipient.phoneNumber || recipient.contactNumber;
                
                if (!phoneNumber) {
                    console.error(`No phone number found for ${recipient.name}`);
                    results.details.push({
                        name: recipient.name,
                        phone: 'Not provided',
                        success: false,
                        error: 'No phone number provided'
                    });
                    results.failed++;
                    continue;
                }
                
                console.log(`Sending SMS to ${recipient.name} at ${phoneNumber}`);
                const result = await this.sendSms(phoneNumber, message);
                
                results.details.push({
                    name: recipient.name,
                    phone: phoneNumber,
                    success: result.success,
                    messageSid: result.messageSid,
                    error: result.error
                });

                if (result.success) {
                    results.successful++;
                } else {
                    results.failed++;
                    console.error(`SMS failed for ${recipient.name}: ${result.error}`);
                }

                // Add small delay between messages to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                console.error(`Error processing SMS for ${recipient.name}:`, error.message);
                
                results.details.push({
                    name: recipient.name,
                    phone: recipient.phoneNumber || recipient.contactNumber || 'Unknown',
                    success: false,
                    error: error.message
                });
                
                results.failed++;
            }
        }

        console.log(`SMS Campaign Complete: ${results.successful} successful, ${results.failed} failed`);
        return results;
    }

    /**
     * Get SMS delivery status
     * @param {string} messageSid - Twilio message SID
     * @returns {Object} - Message status details
     */
    async getMessageStatus(messageSid) {
        try {
            const message = await this.client.messages(messageSid).fetch();
            
            return {
                success: true,
                sid: message.sid,
                status: message.status,
                to: message.to,
                from: message.from,
                dateCreated: message.dateCreated,
                dateSent: message.dateSent,
                errorCode: message.errorCode,
                errorMessage: message.errorMessage
            };

        } catch (error) {
            console.error(`Failed to get message status:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Validate phone number format
     * @param {string} phoneNumber - Phone number to validate
     * @returns {boolean} - True if valid format
     */
    isValidPhoneNumber(phoneNumber) {
        if (!phoneNumber || typeof phoneNumber !== 'string') {
            return false;
        }

        // Remove all non-digit characters for validation
        const cleaned = phoneNumber.replace(/\D/g, '');
        
        // Check if it's a valid length (10 digits for India, or 10+ with country code)
        return cleaned.length === 10 || (cleaned.length > 10 && cleaned.length <= 15);
    }
}

module.exports = TwilioSmsService;
