const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    productId: {
        type: Number, // Django product ID
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    isInStock: {
        type: Boolean,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, {
    versionKey: false
});

// Compound index to prevent duplicate wishlist items
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

const WishlistModel = mongoose.model('wishlists', WishlistSchema);
module.exports = WishlistModel;
