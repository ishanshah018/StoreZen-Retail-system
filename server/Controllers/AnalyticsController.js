const Bill = require('../Models/Bill');
const moment = require('moment');

// =============================================================================
// CUSTOMER ANALYTICS CONTROLLER
// =============================================================================

/**
 * Get comprehensive spending analytics for a customer
 * Returns all analytics data needed for the dashboard
 */
const getCustomerAnalytics = async (req, res) => {
    try {
        const { customerId } = req.params;
        
        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
        }

        // Get all bills for the customer
        const bills = await Bill.find({ customerId }).sort({ billDate: -1 });

        if (!bills.length) {
            return res.status(200).json({
                success: true,
                message: 'No bills found for analytics',
                data: {
                    monthlySpending: [],
                    categoryWiseSpending: [],
                    topProducts: [],
                    monthlyComparison: { current: 0, previous: 0, percentageChange: 0 },
                    totalSavings: { amount: 0, details: { coupons: 0, smartCoins: 0 } },
                    totalBills: 0,
                    totalSpent: 0
                }
            });
        }

        // Calculate analytics data
        const analyticsData = {
            monthlySpending: getMonthlySpending(bills),
            categoryWiseSpending: getCategoryWiseSpending(bills),
            topProducts: getTopProducts(bills),
            monthlyComparison: getMonthlyComparison(bills),
            totalSavings: getTotalSavings(bills),
            totalBills: bills.length,
            totalSpent: bills.reduce((sum, bill) => sum + bill.billing.finalAmount, 0)
        };

        res.status(200).json({
            success: true,
            message: 'Analytics data retrieved successfully',
            data: analyticsData
        });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data',
            error: error.message
        });
    }
};

/**
 * Get monthly spending data for charts
 */
function getMonthlySpending(bills, months = 12) {
    const monthlyData = {};
    const startDate = moment().subtract(months - 1, 'months').startOf('month');
    
    // Initialize all months with 0
    for (let i = 0; i < months; i++) {
        const monthKey = startDate.clone().add(i, 'months').format('YYYY-MM');
        monthlyData[monthKey] = { amount: 0, bills: 0 };
    }
    
    // Aggregate spending by month
    bills.forEach(bill => {
        const billMonth = moment(bill.billDate).format('YYYY-MM');
        if (monthlyData[billMonth]) {
            monthlyData[billMonth].amount += bill.billing.finalAmount;
            monthlyData[billMonth].bills += 1;
        }
    });
    
    // Convert to array format for charts
    return Object.keys(monthlyData).map(month => ({
        month: moment(month).format('MMM YYYY'),
        amount: Math.round(monthlyData[month].amount),
        bills: monthlyData[month].bills,
        monthKey: month
    }));
}

/**
 * Get category-wise spending data
 */
function getCategoryWiseSpending(bills) {
    const categoryData = {};
    
    bills.forEach(bill => {
        bill.items.forEach(item => {
            const category = item.category || 'Others';
            if (!categoryData[category]) {
                categoryData[category] = { amount: 0, quantity: 0, bills: new Set() };
            }
            categoryData[category].amount += item.itemTotal;
            categoryData[category].quantity += item.quantity;
            categoryData[category].bills.add(bill._id.toString());
        });
    });
    
    // Convert to array and sort by amount
    return Object.keys(categoryData)
        .map(category => ({
            category,
            amount: Math.round(categoryData[category].amount),
            quantity: categoryData[category].quantity,
            bills: categoryData[category].bills.size,
            percentage: 0 // Will be calculated on frontend
        }))
        .sort((a, b) => b.amount - a.amount);
}

/**
 * Get top 5 most purchased products
 */
function getTopProducts(bills) {
    const productData = {};
    
    bills.forEach(bill => {
        bill.items.forEach(item => {
            const productKey = item.productId.toString();
            if (!productData[productKey]) {
                productData[productKey] = {
                    productId: item.productId,
                    name: item.productName,
                    category: item.category,
                    price: item.price,
                    totalQuantity: 0,
                    totalAmount: 0,
                    purchaseCount: 0,
                    bills: new Set()
                };
            }
            
            productData[productKey].totalQuantity += item.quantity;
            productData[productKey].totalAmount += item.itemTotal;
            productData[productKey].purchaseCount += 1;
            productData[productKey].bills.add(bill._id.toString());
        });
    });
    
    // Sort by total amount and return top 5
    return Object.values(productData)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(product => ({
            ...product,
            totalAmount: Math.round(product.totalAmount),
            bills: product.bills.size,
            averagePrice: Math.round(product.totalAmount / product.totalQuantity)
        }));
}

/**
 * Get month-on-month comparison
 */
function getMonthlyComparison(bills) {
    const currentMonth = moment().startOf('month');
    const previousMonth = moment().subtract(1, 'month').startOf('month');
    
    let currentMonthSpending = 0;
    let previousMonthSpending = 0;
    
    bills.forEach(bill => {
        const billDate = moment(bill.billDate);
        
        if (billDate.isSame(currentMonth, 'month')) {
            currentMonthSpending += bill.billing.finalAmount;
        } else if (billDate.isSame(previousMonth, 'month')) {
            previousMonthSpending += bill.billing.finalAmount;
        }
    });
    
    let percentageChange = 0;
    if (previousMonthSpending > 0) {
        percentageChange = ((currentMonthSpending - previousMonthSpending) / previousMonthSpending) * 100;
    } else if (currentMonthSpending > 0) {
        percentageChange = 100;
    }
    
    return {
        current: Math.round(currentMonthSpending),
        previous: Math.round(previousMonthSpending),
        percentageChange: Math.round(percentageChange * 100) / 100,
        currentMonthName: currentMonth.format('MMMM'),
        previousMonthName: previousMonth.format('MMMM')
    };
}

/**
 * Get total savings from coupons and smart coins
 */
function getTotalSavings(bills, months = 3) {
    const cutoffDate = moment().subtract(months, 'months').startOf('month');
    
    let totalCouponSavings = 0;
    let totalSmartCoinsSavings = 0;
    let totalSmartCoinsEarned = 0;
    
    bills.forEach(bill => {
        if (moment(bill.billDate).isAfter(cutoffDate)) {
            totalCouponSavings += bill.billing.couponDiscount || 0;
            totalSmartCoinsSavings += bill.billing.smartCoinsDiscount || 0;
            totalSmartCoinsEarned += bill.billing.smartCoinsEarned || 0;
        }
    });
    
    const totalSavings = totalCouponSavings + totalSmartCoinsSavings;
    
    return {
        amount: Math.round(totalSavings),
        details: {
            coupons: Math.round(totalCouponSavings),
            smartCoins: Math.round(totalSmartCoinsSavings),
            smartCoinsEarned: Math.round(totalSmartCoinsEarned)
        },
        period: `Last ${months} months`
    };
}

/**
 * Get spending analytics for custom date range
 */
const getCustomRangeAnalytics = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { startDate, endDate, months = 6 } = req.query;
        
        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: 'Customer ID is required'
            });
        }

        // Build date filter
        let dateFilter = { customerId };
        
        if (startDate && endDate) {
            dateFilter.billDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default to specified months
            const monthsBack = parseInt(months) || 6;
            dateFilter.billDate = {
                $gte: moment().subtract(monthsBack, 'months').startOf('month').toDate()
            };
        }

        const bills = await Bill.find(dateFilter).sort({ billDate: -1 });
        
        const monthsToShow = startDate && endDate 
            ? moment(endDate).diff(moment(startDate), 'months') + 1
            : parseInt(months);

        const analyticsData = {
            monthlySpending: getMonthlySpending(bills, monthsToShow),
            categoryWiseSpending: getCategoryWiseSpending(bills),
            topProducts: getTopProducts(bills),
            totalBills: bills.length,
            totalSpent: bills.reduce((sum, bill) => sum + bill.billing.finalAmount, 0),
            dateRange: {
                start: startDate || moment().subtract(monthsToShow, 'months').format('YYYY-MM-DD'),
                end: endDate || moment().format('YYYY-MM-DD')
            }
        };

        res.status(200).json({
            success: true,
            message: 'Custom range analytics retrieved successfully',
            data: analyticsData
        });

    } catch (error) {
        console.error('Error fetching custom range analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch custom range analytics',
            error: error.message
        });
    }
};

module.exports = {
    getCustomerAnalytics,
    getCustomRangeAnalytics
};
