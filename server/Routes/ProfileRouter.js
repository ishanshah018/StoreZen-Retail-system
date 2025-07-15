const router = require('express').Router();
const { getUserProfile, updateUserProfile } = require('../Controllers/ProfileController');
const ensureAuthenticated = require('../Middlewares/Auth');

// Get user profile
router.get('/', ensureAuthenticated, getUserProfile);

// Update user profile
router.put('/', ensureAuthenticated, updateUserProfile);

module.exports = router;
