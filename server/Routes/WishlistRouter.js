const express = require('express');
const router = express.Router();
const WishlistController = require('../Controllers/WishlistController');

// POST /api/wishlist/add - Add item to wishlist
router.post('/add', WishlistController.addToWishlist);

// GET /api/wishlist/:userId - Get user's wishlist
router.get('/:userId', WishlistController.getUserWishlist);

// DELETE /api/wishlist/remove - Remove item from wishlist
router.delete('/remove', WishlistController.removeFromWishlist);

// GET /api/wishlist/check/:userId/:productId - Check if item is in wishlist
router.get('/check/:userId/:productId', WishlistController.checkWishlistStatus);

// DELETE /api/wishlist/clear/:userId - Clear entire wishlist
router.delete('/clear/:userId', WishlistController.clearWishlist);

// GET /api/wishlist/analytics/manager - Get wishlist analytics for managers
router.get('/analytics/manager', WishlistController.getWishlistAnalytics);

// DELETE /api/wishlist/product/:productId - Remove product from all wishlists (for restocking)
router.delete('/product/:productId', WishlistController.removeProductFromAllWishlists);

module.exports = router;
