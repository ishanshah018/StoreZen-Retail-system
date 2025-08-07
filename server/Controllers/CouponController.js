const Coupon = require('../Models/Coupon');

class CouponController {
    
    // Create new coupon
    static async createCoupon(req, res) {
        try {
            const {
                coupon_code,
                type,
                value,
                max_discount,
                min_purchase,
                valid_from,
                valid_until,
                applicable_categories
            } = req.body;
            
            // Validation
            if (!coupon_code || !type || !value || max_discount === undefined || min_purchase === undefined || !valid_until || !applicable_categories) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }
            
            // Check if coupon code already exists
            const existingCoupon = await Coupon.findOne({ 
                coupon_code: coupon_code.toUpperCase() 
            });
            
            if (existingCoupon) {
                return res.status(409).json({
                    success: false,
                    message: 'Coupon code already exists'
                });
            }
            
            // Create new coupon
            const newCoupon = new Coupon({
                coupon_code: coupon_code.toUpperCase(),
                type,
                value: parseFloat(value),
                max_discount: parseFloat(max_discount),
                min_purchase: parseFloat(min_purchase),
                valid_from: valid_from ? new Date(valid_from) : new Date(),
                valid_until: new Date(valid_until),
                applicable_categories: Array.isArray(applicable_categories) ? applicable_categories : [applicable_categories]
            });
            
            await newCoupon.save();
            
            res.status(201).json({
                success: true,
                message: 'Coupon created successfully',
                coupon: newCoupon
            });
            
        } catch (error) {
            console.error('Error creating coupon:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create coupon',
                error: error.message
            });
        }
    }
    
    // Get all active coupons
    static async getActiveCoupons(req, res) {
        try {
            const coupons = await Coupon.find({ is_active: true })
                .sort({ created_at: -1 });
            
            res.status(200).json({
                success: true,
                message: 'Active coupons fetched successfully',
                coupons
            });
            
        } catch (error) {
            console.error('Error fetching coupons:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch coupons',
                error: error.message
            });
        }
    }
    
    // Delete coupon
    static async deleteCoupon(req, res) {
        try {
            const { id } = req.params;
            
            // Actually delete the coupon from database instead of just deactivating
            const coupon = await Coupon.findByIdAndDelete(id);
            
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: 'Coupon not found'
                });
            }
            
            res.status(200).json({
                success: true,
                message: 'Coupon deleted successfully',
                deletedCoupon: {
                    coupon_code: coupon.coupon_code,
                    id: coupon._id
                }
            });
            
        } catch (error) {
            console.error('Error deleting coupon:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete coupon',
                error: error.message
            });
        }
    }
}

module.exports = CouponController;
