const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    billId: {
        type: String,
        required: true,
        unique: true
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    items: [{
        productId: {
            type: Number,
            required: true
        },
        productName: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        itemTotal: {
            type: Number,
            required: true
        }
    }],
    billing: {
        subtotal: {
            type: Number,
            required: true
        },
        couponDiscount: {
            type: Number,
            default: 0
        },
        couponCode: {
            type: String,
            default: null
        },
        smartCoinsUsed: {
            type: Number,
            default: 0
        },
        smartCoinsDiscount: {
            type: Number,
            default: 0
        },
        totalDiscount: {
            type: Number,
            default: 0
        },
        finalAmount: {
            type: Number,
            required: true
        },
        smartCoinsEarned: {
            type: Number,
            default: 0
        }
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Cash', 'Card', 'UPI', 'Wallet', 'Online']
    },
    paymentStatus: {
        type: String,
        default: 'Paid',
        enum: ['Paid', 'Pending', 'Failed']
    },
    // Razorpay payment details (for online payments)
    razorpayPaymentId: {
        type: String,
        default: null
    },
    razorpayOrderId: {
        type: String,
        default: null
    },
    razorpaySignature: {
        type: String,
        default: null
    },
    billDate: {
        type: Date,
        default: Date.now
    },
    storeName: {
        type: String,
        default: 'StoreZen Retail'
    }
}, {
    collection: 'bills',
    timestamps: true,
    versionKey: false // Disable __v field
});

// Index for better performance
billSchema.index({ customerId: 1 });
billSchema.index({ billDate: -1 });
// billId index is already created by unique: true, so no need to duplicate

const Bill = mongoose.model('Bill', billSchema);
module.exports = Bill;
