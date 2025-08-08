const WishlistModel = require('../Models/Wishlist');
const UserModel = require('../Models/User');

// Add item to wishlist
const addToWishlist = async (req, res) => {
    try {
        console.log('💝 WishlistController: addToWishlist called');
        const { userId, productId, productName, productCategory, productPrice, isInStock } = req.body;

        // Validate required fields
        if (!userId || !productId || !productName || !productCategory || productPrice === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if item already exists in wishlist
        const existingItem = await WishlistModel.findOne({ userId, productId });
        if (existingItem) {
            return res.status(409).json({
                success: false,
                message: 'Item already in wishlist'
            });
        }

        // Create new wishlist item
        const wishlistItem = new WishlistModel({
            userId,
            productId,
            productName,
            productCategory,
            productPrice,
            isInStock: isInStock !== undefined ? isInStock : true
        });

        await wishlistItem.save();

        console.log(`💝 WishlistController: Added ${productName} to ${user.name}'s wishlist`);

        return res.status(201).json({
            success: true,
            message: 'Item added to wishlist successfully',
            data: wishlistItem
        });

    } catch (error) {
        console.error('❌ WishlistController Error adding to wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Error adding item to wishlist',
            error: error.message
        });
    }
};

// Get user's wishlist
const getUserWishlist = async (req, res) => {
    try {
        console.log('💝 WishlistController: getUserWishlist called');
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Get user's wishlist items
        const wishlistItems = await WishlistModel.find({ userId })
            .sort({ addedAt: -1 }) // Most recent first
            .exec();

        console.log(`💝 WishlistController: Found ${wishlistItems.length} wishlist items for user ${userId}`);

        return res.status(200).json({
            success: true,
            data: wishlistItems,
            count: wishlistItems.length
        });

    } catch (error) {
        console.error('❌ WishlistController Error fetching wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
};

// Remove item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        console.log('💝 WishlistController: removeFromWishlist called');
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Product ID are required'
            });
        }

        // Remove item from wishlist
        const result = await WishlistModel.deleteOne({ userId, productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in wishlist'
            });
        }

        console.log(`💝 WishlistController: Removed product ${productId} from user ${userId}'s wishlist`);

        return res.status(200).json({
            success: true,
            message: 'Item removed from wishlist successfully'
        });

    } catch (error) {
        console.error('❌ WishlistController Error removing from wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Error removing item from wishlist',
            error: error.message
        });
    }
};

// Check if item is in wishlist
const checkWishlistStatus = async (req, res) => {
    try {
        const { userId, productId } = req.params;

        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and Product ID are required'
            });
        }

        const wishlistItem = await WishlistModel.findOne({ userId, productId });

        return res.status(200).json({
            success: true,
            isInWishlist: !!wishlistItem
        });

    } catch (error) {
        console.error('❌ WishlistController Error checking wishlist status:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking wishlist status',
            error: error.message
        });
    }
};

// Clear entire wishlist
const clearWishlist = async (req, res) => {
    try {
        console.log('💝 WishlistController: clearWishlist called');
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const result = await WishlistModel.deleteMany({ userId });

        console.log(`💝 WishlistController: Cleared ${result.deletedCount} items from user ${userId}'s wishlist`);

        return res.status(200).json({
            success: true,
            message: `Cleared ${result.deletedCount} items from wishlist`
        });

    } catch (error) {
        console.error('❌ WishlistController Error clearing wishlist:', error);
        return res.status(500).json({
            success: false,
            message: 'Error clearing wishlist',
            error: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    clearWishlist
};
