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

// =============================================================================
// MANAGER ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Get wishlist analytics for managers
 * Shows all wishlisted products with their counts across all customers
 */
const getWishlistAnalytics = async (req, res) => {
    try {
        console.log('📊 WishlistController: getWishlistAnalytics called');

        // Aggregate wishlist data to get product counts
        const wishlistAnalytics = await WishlistModel.aggregate([
            {
                // Group by productId and productName to count occurrences
                $group: {
                    _id: {
                        productId: '$productId',
                        productName: '$productName',
                        productCategory: '$productCategory',
                        productPrice: '$productPrice'
                    },
                    wishlistCount: { $sum: 1 }, // Count how many users wishlisted this item
                    customers: { $push: '$userId' }, // Array of customer IDs who wishlisted this
                    firstAddedAt: { $min: '$addedAt' }, // When first added to any wishlist
                    lastAddedAt: { $max: '$addedAt' } // When last added to any wishlist
                }
            },
            {
                // Sort by wishlist count in descending order (most wishlisted first)
                $sort: { wishlistCount: -1, lastAddedAt: -1 }
            },
            {
                // Reshape the output for better readability
                $project: {
                    _id: 0,
                    productId: '$_id.productId',
                    productName: '$_id.productName',
                    productCategory: '$_id.productCategory',
                    productPrice: '$_id.productPrice',
                    wishlistCount: 1,
                    customerCount: { $size: '$customers' }, // Number of unique customers
                    firstAddedAt: 1,
                    lastAddedAt: 1
                }
            }
        ]);

        // Get total statistics
        const totalStats = await WishlistModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalWishlistItems: { $sum: 1 },
                    uniqueProducts: { $addToSet: '$productId' },
                    uniqueCustomers: { $addToSet: '$userId' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalWishlistItems: 1,
                    uniqueProductCount: { $size: '$uniqueProducts' },
                    uniqueCustomerCount: { $size: '$uniqueCustomers' }
                }
            }
        ]);

        const stats = totalStats[0] || {
            totalWishlistItems: 0,
            uniqueProductCount: 0,
            uniqueCustomerCount: 0
        };

        console.log(`📊 WishlistController: Generated analytics for ${wishlistAnalytics.length} products`);
        console.log(`📊 Total wishlist items: ${stats.totalWishlistItems}, Unique products: ${stats.uniqueProductCount}, Unique customers: ${stats.uniqueCustomerCount}`);

        return res.status(200).json({
            success: true,
            message: 'Wishlist analytics retrieved successfully',
            data: {
                products: wishlistAnalytics,
                statistics: stats,
                generated_at: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ WishlistController Error generating wishlist analytics:', error);
        return res.status(500).json({
            success: false,
            message: 'Error generating wishlist analytics',
            error: error.message
        });
    }
};

/**
 * Remove a specific product from all customer wishlists
 * Called when manager restocks an item
 */
const removeProductFromAllWishlists = async (req, res) => {
    try {
        console.log('🗑️ WishlistController: removeProductFromAllWishlists called');
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required'
            });
        }

        // Remove the product from all customer wishlists
        const result = await WishlistModel.deleteMany({ productId: productId });

        console.log(`🗑️ WishlistController: Removed product ${productId} from ${result.deletedCount} wishlists`);

        return res.status(200).json({
            success: true,
            message: `Product removed from ${result.deletedCount} customer wishlists`,
            data: {
                productId: productId,
                removedFromWishlists: result.deletedCount
            }
        });

    } catch (error) {
        console.error('❌ WishlistController Error removing product from wishlists:', error);
        return res.status(500).json({
            success: false,
            message: 'Error removing product from wishlists',
            error: error.message
        });
    }
};

module.exports = {
    addToWishlist,
    getUserWishlist,
    removeFromWishlist,
    checkWishlistStatus,
    clearWishlist,
    getWishlistAnalytics,
    removeProductFromAllWishlists
};
