const ManagerModel = require('../Models/Manager');


// API endpoint - Get manager profile data from database
const getManagerProfile = async (req, res) => {
    try {
        let manager = await ManagerModel.findOne({});
        
        if (!manager) {
            // Create default manager if none exists
            manager = await ManagerModel.getOrCreateDefault();
        }

        res.status(200).json({
            success: true,
            message: "Manager profile retrieved successfully",
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.email,
                storeAddress: manager.storeAddress,
                contact: manager.contact,
                lowStockThreshold: manager.lowStockThreshold,
                whatsappAlertsEnabled: manager.whatsappAlertsEnabled,
                storeSettings: manager.storeSettings
            }
        });
    } catch (error) {
        console.error('Error fetching manager profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch manager profile",
            error: error.message
        });
    }
};


// API endpoint - Update manager profile information
const updateManagerProfile = async (req, res) => {
    try {
        const {
            name,
            email,
            storeAddress,
            contact,
            lowStockThreshold,
            whatsappAlertsEnabled
        } = req.body;

        let manager = await ManagerModel.findOne({});
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update fields if provided
        if (name !== undefined) manager.name = name;
        if (email !== undefined) manager.email = email;
        if (storeAddress !== undefined) manager.storeAddress = storeAddress;
        if (contact !== undefined) manager.contact = contact;
        if (lowStockThreshold !== undefined) manager.lowStockThreshold = lowStockThreshold;
        if (whatsappAlertsEnabled !== undefined) manager.whatsappAlertsEnabled = whatsappAlertsEnabled;

        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager profile updated successfully",
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.email,
                storeAddress: manager.storeAddress,
                contact: manager.contact,
                lowStockThreshold: manager.lowStockThreshold,
                whatsappAlertsEnabled: manager.whatsappAlertsEnabled,
                storeSettings: manager.storeSettings
            }
        });
    } catch (error) {
        console.error('Error updating manager profile:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update manager profile",
            error: error.message
        });
    }
};


// API endpoint - Update store theme and display settings
const updateStoreSettings = async (req, res) => {
    try {
        const {
            storeName,
            storeTheme
        } = req.body;

        let manager = await ManagerModel.findOne({});
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update store settings
        if (storeName !== undefined) manager.storeSettings.storeName = storeName;
        if (storeTheme !== undefined) manager.storeSettings.storeTheme = storeTheme;

        await manager.save();

        res.status(200).json({
            success: true,
            message: "Store settings updated successfully",
            storeSettings: manager.storeSettings
        });
    } catch (error) {
        console.error('Error updating store settings:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update store settings",
            error: error.message
        });
    }
};


// API endpoint - Get basic store information for customer view
const getStoreInfo = async (req, res) => {
    try {
        const manager = await ManagerModel.findOne({});
        
        if (!manager) {
            return res.status(404).json({
                success: false,
                message: "Store information not found"
            });
        }

        res.status(200).json({
            success: true,
            storeInfo: manager.fullStoreInfo,
            storeSettings: {
                storeName: manager.storeSettings.storeName,
                storeTheme: manager.storeSettings.storeTheme
            }
        });
    } catch (error) {
        console.error('Error fetching store info:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch store information",
            error: error.message
        });
    }
};


module.exports = {
    getManagerProfile,
    updateManagerProfile,
    updateStoreSettings,
    getStoreInfo
};
