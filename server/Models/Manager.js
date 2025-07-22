const mongoose = require("mongoose");
const Schema = mongoose.Schema;


// Manager Schema - Defines the structure for store manager data
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
        default: "",
        validate: {
            validator: function(v) {
                if (!v) return true; // Allow empty strings
                return /^\+[1-9]\d{1,14}$/.test(v); // E.164 format validation
            },
            message: 'Contact number must be in E.164 format (e.g., +1234567890)'
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
        }
    }
}, {
    versionKey: false, // Removes __v field
    timestamps: false  // Removes createdAt and updatedAt
});


// Database indexes for better query performance
ManagerSchema.index({ email: 1 });


// Virtual field - Returns formatted store information
ManagerSchema.virtual('fullStoreInfo').get(function() {
    return {
        name: this.storeSettings.storeName,
        manager: this.name,
        address: this.storeAddress,
        contact: this.contact,
        email: this.email
    };
});


// Static method - Gets existing manager or creates default one
ManagerSchema.statics.getOrCreateDefault = async function() {
    let manager = await this.findOne({});
    
    if (!manager) {
        manager = new this({
            name: "Store Manager",
            email: "manager@storezen.com",
            storeAddress: "123 Main Street, City, State 12345",
            contact: "+1 (555) 123-4567",
            lowStockThreshold: 10
        });
        await manager.save();
    }
    
    return manager;
};


const ManagerModel = mongoose.model('managers', ManagerSchema);

module.exports = ManagerModel;
