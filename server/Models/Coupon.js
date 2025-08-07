const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    coupon_code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: 20
    },
    type: {
        type: String,
        required: true,
        enum: ['%', 'rs'],
        default: '%'
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    max_discount: {
        type: Number,
        required: true,
        min: 0
    },
    min_purchase: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    valid_from: {
        type: Date,
        required: true,
        default: Date.now
    },
    valid_until: {
        type: Date,
        required: true
    },
    applicable_categories: {
        type: [String],
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
    // Removed created_at as timestamps: true already adds createdAt and updatedAt
}, {
    collection: 'coupons',
    timestamps: true,
    versionKey: false // Disable __v field
});

// Index for better performance
couponSchema.index({ coupon_code: 1 });
couponSchema.index({ is_active: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
