const ManagerModel = require('../Models/Manager');

// Get manager profile
const getManagerProfile = async (req, res) => {
    try {
        let manager = await ManagerModel.findOne({ isActive: true });
        
        if (!manager) {
            // Create default manager if none exists
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update last login
        await manager.updateLastLogin();

        res.status(200).json({
            success: true,
            message: "Manager profile retrieved successfully",
            manager: {
                id: manager._id,
                name: manager.name,
                email: manager.email,
                storeAddress: manager.storeAddress,
                contact: manager.contact,
                whatsappNumber: manager.whatsappNumber,
                lowStockThreshold: manager.lowStockThreshold,
                whatsappAlertsEnabled: manager.whatsappAlertsEnabled,
                storeSettings: manager.storeSettings,
                permissions: manager.permissions,
                lastLogin: manager.lastLogin,
                createdAt: manager.createdAt,
                updatedAt: manager.updatedAt
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

// Update manager profile
const updateManagerProfile = async (req, res) => {
    try {
        const {
            name,
            email,
            storeAddress,
            contact,
            whatsappNumber,
            lowStockThreshold,
            whatsappAlertsEnabled
        } = req.body;

        let manager = await ManagerModel.findOne({ isActive: true });
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update fields if provided
        if (name !== undefined) manager.name = name;
        if (email !== undefined) manager.email = email;
        if (storeAddress !== undefined) manager.storeAddress = storeAddress;
        if (contact !== undefined) manager.contact = contact;
        if (whatsappNumber !== undefined) manager.whatsappNumber = whatsappNumber;
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
                whatsappNumber: manager.whatsappNumber,
                lowStockThreshold: manager.lowStockThreshold,
                whatsappAlertsEnabled: manager.whatsappAlertsEnabled,
                storeSettings: manager.storeSettings,
                permissions: manager.permissions,
                updatedAt: manager.updatedAt
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

// Update store settings
const updateStoreSettings = async (req, res) => {
    try {
        const {
            storeName,
            storeTheme,
            currency,
            timezone
        } = req.body;

        let manager = await ManagerModel.findOne({ isActive: true });
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update store settings
        if (storeName !== undefined) manager.storeSettings.storeName = storeName;
        if (storeTheme !== undefined) manager.storeSettings.storeTheme = storeTheme;
        if (currency !== undefined) manager.storeSettings.currency = currency;
        if (timezone !== undefined) manager.storeSettings.timezone = timezone;

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

// Get store info for customers
const getStoreInfo = async (req, res) => {
    try {
        const manager = await ManagerModel.findOne({ isActive: true });
        
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
                storeTheme: manager.storeSettings.storeTheme,
                currency: manager.storeSettings.currency
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

// Update manager permissions (for future admin features)
const updateManagerPermissions = async (req, res) => {
    try {
        const { permissions } = req.body;

        let manager = await ManagerModel.findOne({ isActive: true });
        
        if (!manager) {
            manager = await ManagerModel.getOrCreateDefault();
        }

        // Update permissions
        if (permissions) {
            Object.keys(permissions).forEach(key => {
                if (manager.permissions[key] !== undefined) {
                    manager.permissions[key] = permissions[key];
                }
            });
        }

        await manager.save();

        res.status(200).json({
            success: true,
            message: "Manager permissions updated successfully",
            permissions: manager.permissions
        });
    } catch (error) {
        console.error('Error updating manager permissions:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update manager permissions",
            error: error.message
        });
    }
};

module.exports = {
    getManagerProfile,
    updateManagerProfile,
    updateStoreSettings,
    getStoreInfo,
    updateManagerPermissions
};
