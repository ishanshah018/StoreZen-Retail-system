const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManagerSchema = new Schema({
    name: {
        type: String,
        required: true,
        default: "Store Manager"
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true // Allows multiple null values
    },
    storeAddress: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: ""
    },
    whatsappNumber: {
        type: String,
        default: "",
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty strings
                return /^\+[1-9]\d{1,14}$/.test(v); // E.164 format validation
            },
            message: 'WhatsApp number must be in E.164 format (e.g., +1234567890)'
        }
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 1,
        max: 1000
    },
    whatsappAlertsEnabled: {
        type: Boolean,
        default: true
    },
    storeSettings: {
        storeName: {
            type: String,
            default: "StoreZen"
        },
        storeTheme: {
            type: String,
            enum: ['light', 'dark', 'christmas', 'halloween', 'cyberpunk', 'diwali'],
            default: 'dark'
        },
        currency: {
            type: String,
            default: "₹"
        },
        timezone: {
            type: String,
            default: "Asia/Kolkata"
        }
    },
    permissions: {
        canManageInventory: {
            type: Boolean,
            default: true
        },
        canViewAnalytics: {
            type: Boolean,
            default: true
        },
        canManageCustomers: {
            type: Boolean,
            default: true
        },
        canConfigureStore: {
            type: Boolean,
            default: true
        }
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false // Removes __v field
});

// Index for better query performance
ManagerSchema.index({ email: 1 });
ManagerSchema.index({ isActive: 1 });

// Virtual for full store address
ManagerSchema.virtual('fullStoreInfo').get(function() {
    return {
        name: this.storeSettings.storeName,
        manager: this.name,
        address: this.storeAddress,
        contact: this.contact,
        email: this.email
    };
});

// Method to update last login
ManagerSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Static method to get or create default manager
ManagerSchema.statics.getOrCreateDefault = async function() {
    let manager = await this.findOne({ isActive: true });
    
    if (!manager) {
        manager = new this({
            name: "Store Manager",
            email: "manager@storezen.com",
            storeAddress: "123 Main Street, City, State 12345",
            contact: "+1 (555) 123-4567"
        });
        await manager.save();
    }
    
    return manager;
};

const ManagerModel = mongoose.model('managers', ManagerSchema);

module.exports = ManagerModel;
