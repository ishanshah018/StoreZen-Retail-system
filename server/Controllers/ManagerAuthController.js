//=============================================================================
// MANAGER AUTHENTICATION CONTROLLER
//=============================================================================
// Handles manager login and authentication for the StoreZen retail system
// Features: JWT token generation, password verification, default manager creation
//=============================================================================

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ManagerModel = require("../Models/Manager");

/**
 * Manager Login Controller
 * Authenticates manager credentials and returns JWT token
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JWT token and manager details on success
 */
const managerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find manager by email or create default if none exists
        let manager = await ManagerModel.findOne({ email });
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }
        
        // Validate manager email
        if (manager.email !== email) {
            return res.status(404).json({ 
                message: 'Manager not found. Please check your credentials.', 
                success: false
            });
        }
        
        // Verify password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, manager.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Invalid password. Please try again.', 
                success: false 
            });
        }

        // Generate JWT token with manager role
        const jwtToken = jwt.sign(
            { 
                email: manager.email, 
                _id: manager._id, 
                role: 'manager' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response with token and manager details
        res.status(200).json({
            message: "Manager login successful",
            success: true,
            jwtToken,
            email: manager.email,
            name: manager.name,
            userId: manager._id,
            role: 'manager'
        });

    } catch (error) {
        console.error('Manager login error:', error);
        res.status(500).json({
            message: "Internal server error during login",
            success: false
        });
    }
};

module.exports = {
    managerLogin
};
