//=============================================================================
// MANAGER MODEL - MONGODB SCHEMA
//=============================================================================
// Defines the data structure for store managers in StoreZen retail system
// Features: Authentication, store settings, inventory thresholds, notifications
//=============================================================================

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Manager Schema
 * Defines the structure and validation rules for manager data
 */
const ManagerSchema = new Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        default: "Store Manager"
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    
    // Store Information
    storeAddress: {
        type: String,
        default: ""
    },
    contact: {
        type: String,
        default: "",
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty strings
                return /^\+[1-9]\d{1,14}$/.test(v); // E.164 format validation
            },
            message: 'Contact number must be in E.164 format (e.g., +1234567890)'
        }
    },
    
    // Inventory Management
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: 1,
        max: 1000
    },
    
    // Notification Settings
    whatsappAlertsEnabled: {
        type: Boolean,
        default: true
    },
    
    // Store Configuration
    storeSettings: {
        storeName: {
            type: String,
            default: "StoreZen"
        },
        storeTheme: {
            type: String,
            enum: ['light', 'dark', 'christmas', 'halloween', 'cyberpunk', 'diwali'],
            default: 'dark'
        }
    }
}, {
    versionKey: false, // Remove MongoDB version field
    timestamps: false  // Disable automatic timestamps
});

/**
 * Virtual Property - Full Store Information
 * Returns formatted store details for display purposes
 */
ManagerSchema.virtual('fullStoreInfo').get(function() {
    return {
        name: this.storeSettings.storeName,
        manager: this.name,
        address: this.storeAddress,
        contact: this.contact,
        email: this.email
    };
});

/**
 * Static Method - Get or Create Default Manager
 * Ensures a default manager exists for the system
 * @returns {Object} Manager document
 */
ManagerSchema.statics.getOrCreateDefault = async function() {
    const bcrypt = require('bcrypt');
    let manager = await this.findOne({});
    
    if (!manager) {
        // Create default manager with secure password
        const hashedPassword = await bcrypt.hash('test123', 10);
        manager = new this({
            name: "Store Manager",
            email: "testuser@gmail.com",
            password: hashedPassword,
            storeAddress: "123 Main Street, City, State 12345",
            contact: "+1 (555) 123-4567",
            lowStockThreshold: 10
        });
        await manager.save();
        console.log('✅ Default manager created successfully');
    }
    
    return manager;
};

// Export the Manager model
const ManagerModel = mongoose.model('managers', ManagerSchema);
module.exports = ManagerModel;
