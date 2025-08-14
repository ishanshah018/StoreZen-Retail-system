const User = require('../Models/User');
const Bill = require('../Models/Bill');
const Coupon = require('../Models/Coupon');

// =============================================================================
// SMART BILLING CONTROLLER
// =============================================================================

/**
 * Get available coupons for a customer
 * Returns all active coupons that the customer can use
 */
const getAvailableCoupons = async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Fetch all active coupons that are currently valid
        const coupons = await Coupon.find({
            is_active: true,
            valid_from: { $lte: currentDate },
            valid_until: { $gte: currentDate }
        }).select('-createdAt -updatedAt');

        res.status(200).json({
            success: true,
            message: 'Available coupons fetched successfully',
            coupons: coupons
        });
    } catch (error) {
        console.error('Error fetching available coupons:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch available coupons',
            error: error.message
        });
    }
};

/**
 * Validate and calculate coupon discount
 * Checks if coupon is valid and calculates applicable discount
 */
const validateCoupon = async (req, res) => {
    try {
        const { couponCode, cartTotal, items } = req.body;

        if (!couponCode || !cartTotal) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code and cart total are required'
            });
        }

        const currentDate = new Date();
        
        // Find the coupon
        const coupon = await Coupon.findOne({
            coupon_code: couponCode.toUpperCase(),
            is_active: true,
            valid_from: { $lte: currentDate },
            valid_until: { $gte: currentDate }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired coupon code'
            });
        }

        // Check category applicability and calculate applicable amount
        let applicableAmount = cartTotal; // Default to full cart total
        
        if (items && items.length > 0 && coupon.applicable_categories.length > 0) {
            const applicableItems = items.filter(item => 
                coupon.applicable_categories.includes(item.category) ||
                coupon.applicable_categories.includes('All')
            );
            
            if (applicableItems.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'This coupon is not applicable to any items in your cart'
                });
            }
            
            // Calculate total amount for applicable category items only
            applicableAmount = applicableItems.reduce((total, item) => 
                total + (item.price * item.quantity), 0
            );
        }

        // Check minimum purchase requirement against applicable category amount
        if (applicableAmount < coupon.min_purchase) {
            const categoryText = coupon.applicable_categories.includes('All') 
                ? 'total purchase' 
                : `${coupon.applicable_categories.join(', ')} category purchase`;
            
            return res.status(400).json({
                success: false,
                message: `Minimum ${categoryText} of ₹${coupon.min_purchase} required for this coupon (current: ₹${Math.round(applicableAmount)})`
            });
        }

        // Calculate discount based on applicable amount
        let discount = 0;
        if (coupon.type === '%') {
            discount = (applicableAmount * coupon.value) / 100;
            if (discount > coupon.max_discount) {
                discount = coupon.max_discount;
            }
        } else if (coupon.type === 'rs') {
            discount = Math.min(coupon.value, applicableAmount);
        }

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            discount: Math.round(discount * 100) / 100, // Round to 2 decimal places
            couponDetails: {
                code: coupon.coupon_code,
                type: coupon.type,
                value: coupon.value,
                maxDiscount: coupon.max_discount
            }
        });

    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to validate coupon',
            error: error.message
        });
    }
};

/**
 * Get Smart Coins balance for a user
 */
const getSmartCoinsBalance = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId).select('smartCoins');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Smart Coins balance fetched successfully',
            balance: user.smartCoins.balance || 0
        });

    } catch (error) {
        console.error('Error fetching smart coins balance:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch smart coins balance',
            error: error.message
        });
    }
};

/**
 * Create a new bill and process payment
 */
const createBill = async (req, res) => {
    try {
        const {
            customerId,
            customerName,
            customerEmail,
            items,
            subtotal,
            couponCode,
            couponDiscount,
            smartCoinsUsed,
            paymentMethod
        } = req.body;

        // Validation
        if (!customerId || !customerName || !customerEmail || !items || !subtotal || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        if (!items.length) {
            return res.status(400).json({
                success: false,
                message: 'Cart cannot be empty'
            });
        }

        // Calculate Smart Coins discount (1 coin = ₹1)
        const smartCoinsDiscount = smartCoinsUsed || 0;
        
        // Calculate total discount
        const totalDiscount = (couponDiscount || 0) + smartCoinsDiscount;
        
        // Calculate final amount
        const finalAmount = Math.max(0, subtotal - totalDiscount);
        
        // Calculate Smart Coins earned (1% of final amount, minimum 1 coin per ₹100)
        const smartCoinsEarned = Math.floor(finalAmount * 0.01);

        // Generate unique bill ID
        const billId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Create bill object
        const newBill = new Bill({
            billId,
            customerName,
            customerEmail,
            customerId,
            items: items.map(item => ({
                productId: item.id,
                productName: item.name,
                category: item.category,
                price: item.price,
                quantity: item.quantity,
                itemTotal: item.price * item.quantity
            })),
            billing: {
                subtotal,
                couponDiscount: couponDiscount || 0,
                couponCode: couponCode || null,
                smartCoinsUsed,
                smartCoinsDiscount,
                totalDiscount,
                finalAmount,
                smartCoinsEarned
            },
            paymentMethod,
            paymentStatus: 'Paid' // Since we're bypassing real payment
        });

        // Save the bill
        const savedBill = await newBill.save();

        // Update user's Smart Coins balance
        const user = await User.findById(customerId);
        if (user) {
            // Deduct used Smart Coins
            user.smartCoins.balance = (user.smartCoins.balance || 0) - smartCoinsUsed;
            
            // Add earned Smart Coins
            user.smartCoins.balance += smartCoinsEarned;
            
            // Add transaction records
            if (smartCoinsUsed > 0) {
                user.smartCoins.transactions.push({
                    amount: smartCoinsUsed,
                    type: 'spent',
                    description: `Used for bill ${billId}`,
                    earnedDate: new Date()
                });
            }
            
            if (smartCoinsEarned > 0) {
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
                
                user.smartCoins.transactions.push({
                    amount: smartCoinsEarned,
                    type: 'earned',
                    description: `Earned from bill ${billId}`,
                    earnedDate: new Date(),
                    expiryDate: expiryDate
                });
            }
            
            await user.save();
        }

        res.status(201).json({
            success: true,
            message: 'Bill created successfully',
            bill: savedBill,
            smartCoinsEarned: smartCoinsEarned,
            newSmartCoinsBalance: (user?.smartCoins.balance || 0)
        });

    } catch (error) {
        console.error('Error creating bill:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create bill',
            error: error.message
        });
    }
};

/**
 * Get customer's bill history
 */
/**
 * Get customer's bill history with advanced filtering
 * Supports date range, month, year, and pagination filters
 */
const getBillHistory = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { 
            page = 1, 
            limit = 10,
            dateFrom,
            dateTo,
            month,
            year,
            filterType = 'all' // 'all', 'lastMonth', 'lastYear', 'custom'
        } = req.query;

        // Build date filter based on filterType
        let dateFilter = {};
        const now = new Date();

        switch (filterType) {
            case 'lastMonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                dateFilter = {
                    billDate: {
                        $gte: lastMonth,
                        $lte: lastMonthEnd
                    }
                };
                break;

            case 'lastYear':
                const lastYear = new Date(now.getFullYear() - 1, 0, 1);
                const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
                dateFilter = {
                    billDate: {
                        $gte: lastYear,
                        $lte: lastYearEnd
                    }
                };
                break;

            case 'thisMonth':
                const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                dateFilter = {
                    billDate: {
                        $gte: thisMonthStart,
                        $lte: thisMonthEnd
                    }
                };
                break;

            case 'thisYear':
                const thisYearStart = new Date(now.getFullYear(), 0, 1);
                const thisYearEnd = new Date(now.getFullYear(), 11, 31);
                dateFilter = {
                    billDate: {
                        $gte: thisYearStart,
                        $lte: thisYearEnd
                    }
                };
                break;

            case 'custom':
                if (dateFrom || dateTo) {
                    dateFilter.billDate = {};
                    if (dateFrom) dateFilter.billDate.$gte = new Date(dateFrom);
                    if (dateTo) dateFilter.billDate.$lte = new Date(dateTo);
                }
                break;

            case 'specificMonth':
                if (month && year) {
                    const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const monthEnd = new Date(parseInt(year), parseInt(month), 0);
                    dateFilter = {
                        billDate: {
                            $gte: monthStart,
                            $lte: monthEnd
                        }
                    };
                }
                break;

            case 'specificYear':
                if (year) {
                    const yearStart = new Date(parseInt(year), 0, 1);
                    const yearEnd = new Date(parseInt(year), 11, 31);
                    dateFilter = {
                        billDate: {
                            $gte: yearStart,
                            $lte: yearEnd
                        }
                    };
                }
                break;
        }

        // Combine customer filter with date filter
        const query = { customerId, ...dateFilter };

        // Fetch bills with pagination
        const bills = await Bill.find(query)
            .sort({ billDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Get total count for pagination
        const totalBills = await Bill.countDocuments(query);
        const totalPages = Math.ceil(totalBills / parseInt(limit));

        // Calculate summary statistics
        const billStats = await Bill.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$billing.finalAmount' },
                    totalSavings: { $sum: '$billing.totalDiscount' },
                    totalSmartCoins: { $sum: '$billing.smartCoinsEarned' },
                    averageBill: { $avg: '$billing.finalAmount' }
                }
            }
        ]);

        const stats = billStats[0] || {
            totalAmount: 0,
            totalSavings: 0,
            totalSmartCoins: 0,
            averageBill: 0
        };

        res.status(200).json({
            success: true,
            message: 'Bill history fetched successfully',
            bills,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBills,
                hasMore: parseInt(page) < totalPages,
                limit: parseInt(limit)
            },
            statistics: {
                totalAmount: stats.totalAmount,
                totalSavings: stats.totalSavings,
                totalSmartCoins: stats.totalSmartCoins,
                averageBill: Math.round(stats.averageBill * 100) / 100
            },
            filter: {
                filterType,
                dateFrom,
                dateTo,
                month,
                year
            }
        });

    } catch (error) {
        console.error('Error fetching bill history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bill history',
            error: error.message
        });
    }
};

/**
 * Get a specific bill by ID
 */
const getBillById = async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await Bill.findOne({ billId });

        if (!bill) {
            return res.status(404).json({
                success: false,
                message: 'Bill not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Bill fetched successfully',
            bill
        });

    } catch (error) {
        console.error('Error fetching bill:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bill',
            error: error.message
        });
    }
};

/**
 * Find best available coupon for cart automatically
 */
const findBestCoupon = async (req, res) => {
    try {
        const { cartTotal, items } = req.body;

        if (!cartTotal) {
            return res.status(400).json({
                success: false,
                message: 'Cart total is required'
            });
        }

        const currentDate = new Date();
        
        // Get all valid coupons (don't filter by min_purchase here as we need to check category-specific amounts)
        const coupons = await Coupon.find({
            is_active: true,
            valid_from: { $lte: currentDate },
            valid_until: { $gte: currentDate }
        });

        let bestCoupon = null;
        let maxDiscount = 0;

        // Find the coupon with maximum discount
        for (const coupon of coupons) {
            // Calculate applicable amount for this coupon
            let applicableAmount = cartTotal; // Default to full cart total
            
            // Check category applicability and calculate category-specific amount
            if (items && items.length > 0 && coupon.applicable_categories.length > 0) {
                const applicableItems = items.filter(item => 
                    coupon.applicable_categories.includes(item.category) ||
                    coupon.applicable_categories.includes('All')
                );
                
                if (applicableItems.length === 0) continue; // Skip if no applicable items
                
                // Calculate total amount for applicable category items only
                applicableAmount = applicableItems.reduce((total, item) => 
                    total + (item.price * item.quantity), 0
                );
            }
            
            // Check if minimum purchase requirement is met for applicable amount
            if (applicableAmount < coupon.min_purchase) {
                continue; // Skip this coupon as minimum not met
            }

            // Calculate discount for this coupon based on applicable amount
            let discount = 0;
            if (coupon.type === '%') {
                discount = (applicableAmount * coupon.value) / 100;
                if (discount > coupon.max_discount) {
                    discount = coupon.max_discount;
                }
            } else if (coupon.type === 'rs') {
                discount = Math.min(coupon.value, applicableAmount);
            }

            if (discount > maxDiscount) {
                maxDiscount = discount;
                bestCoupon = coupon;
            }
        }

        if (bestCoupon) {
            res.status(200).json({
                success: true,
                message: 'Best coupon found',
                coupon: {
                    code: bestCoupon.coupon_code,
                    type: bestCoupon.type,
                    value: bestCoupon.value,
                    discount: Math.round(maxDiscount * 100) / 100
                }
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'No applicable coupons found',
                coupon: null
            });
        }

    } catch (error) {
        console.error('Error finding best coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find best coupon',
            error: error.message
        });
    }
};

module.exports = {
    getAvailableCoupons,
    validateCoupon,
    getSmartCoinsBalance,
    createBill,
    getBillHistory,
    getBillById,
    findBestCoupon
};
