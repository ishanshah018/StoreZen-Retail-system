const bcrypt = require('bcrypt');
const UserModel = require('../Models/User');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        console.log('Getting profile for user ID:', userId); // Debug log
        
        const user = await UserModel.findById(userId).select('-password');
        
        if (!user) {
            console.log('User not found with ID:', userId); // Debug log
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        console.log('User found:', user.name, user.email); // Debug log

        res.status(200).json({
            success: true,
            message: 'Profile fetched successfully',
            profile: {
                name: user.name,
                email: user.email,
                contactNumber: user.contactNumber || '',
                address: user.address || {
                    street: '',
                    city: '',
                    state: '',
                    pincode: ''
                },
                notificationPreferences: user.notificationPreferences || {
                    promotions: false
                }
            }
        });
    } catch (error) {
        console.error('Error in getUserProfile:', error); // Debug log
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, password, contactNumber, address, notificationPreferences } = req.body;

        // Find the user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Prepare update object
        const updateData = {};
        
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (contactNumber) updateData.contactNumber = contactNumber;
        if (address) updateData.address = address;
        if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

        // Hash password if provided
        if (password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(password, saltRounds);
        }

        // Update user
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            profile: {
                name: updatedUser.name,
                email: updatedUser.email,
                contactNumber: updatedUser.contactNumber,
                address: updatedUser.address,
                notificationPreferences: updatedUser.notificationPreferences
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};
