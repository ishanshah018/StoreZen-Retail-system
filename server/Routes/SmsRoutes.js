/**
 * SMS Routes
 * Defines API endpoints for SMS functionality
 */

const express = require('express');
const router = express.Router();
const smsController = require('../Controllers/SmsController');

/**
 * @route   POST /api/sms/send-promotional
 * @desc    Send promotional SMS to multiple customers
 * @body    { recipients: [{ name, contactNumber }], message: string }
 * @access  Private (should add authentication middleware)
 */
router.post('/send-promotional', async (req, res) => {
    await smsController.sendPromotionalSms(req, res);
});

/**
 * @route   GET /api/sms/status/:messageSid
 * @desc    Get SMS delivery status by message SID
 * @params  messageSid - Twilio message SID
 * @access  Private (should add authentication middleware)
 */
router.get('/status/:messageSid', async (req, res) => {
    await smsController.getSmsStatus(req, res);
});

/**
 * @route   POST /api/sms/test
 * @desc    Test SMS functionality (development only)
 * @body    { to: string, message: string }
 * @access  Private (development only)
 */
router.post('/test', async (req, res) => {
    await smsController.testSms(req, res);
});

module.exports = router;
