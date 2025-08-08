const UserModel = require('../Models/User');

// =============================================================================
// SMART COINS CONTROLLER - Professional Smart Coins Management System
// =============================================================================

class SmartCoinsController {
    
    // Get user's smart coins balance and transaction history
    static async getSmartCoins(req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // Find user and get smart coins data
            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

        // Automatically handle expired coins and update balance
        const currentDate = new Date();
        let coinsExpired = false;
        
        if (user.smartCoins.transactions) {
            user.smartCoins.transactions.forEach(transaction => {
                if (transaction.type === 'earned' && 
                    !transaction.isExpired && 
                    transaction.expiryDate && 
                    currentDate > transaction.expiryDate) {
                    
                    transaction.isExpired = true;
                    coinsExpired = true;
                    
                    // Deduct expired coins from balance
                    user.smartCoins.balance = Math.max(0, user.smartCoins.balance - transaction.amount);
                    
                    // Add expiry transaction record
                    user.smartCoins.transactions.push({
                        amount: transaction.amount,
                        type: 'expired',
                        description: `Expired coins from ${transaction.description}`,
                        earnedDate: currentDate
                    });
                }
            });

            // Save updated user data if coins expired
            if (coinsExpired) {
                await user.save();
            }
        }            // Sort transactions by date (newest first)
            const sortedTransactions = user.smartCoins.transactions.sort((a, b) => 
                new Date(b.earnedDate) - new Date(a.earnedDate)
            );

            res.status(200).json({
                success: true,
                message: 'Smart coins data retrieved successfully',
                data: {
                    balance: user.smartCoins.balance,
                    transactions: sortedTransactions,
                    userName: user.name,
                    userEmail: user.email
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch smart coins data',
                error: error.message
            });
        }
    }

    // Award smart coins to user (for purchases, referrals, etc.)
    static async awardSmartCoins(req, res) {
        try {
            const { userId } = req.params;
            const { amount, description } = req.body;

            if (!userId || !amount || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, amount, and description are required'
                });
            }

            if (amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Amount must be greater than 0'
                });
            }

            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Calculate expiry date (30 days from now)
            const earnedDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // Add to balance
            user.smartCoins.balance += amount;

            // Add transaction record
            user.smartCoins.transactions.push({
                amount: amount,
                type: 'earned',
                description: description,
                earnedDate: earnedDate,
                expiryDate: expiryDate,
                isExpired: false
            });

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Smart coins awarded successfully',
                data: {
                    newBalance: user.smartCoins.balance,
                    coinsAwarded: amount,
                    expiryDate: expiryDate
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to award smart coins',
                error: error.message
            });
        }
    }

    /** Initialize Smart Coins for new user during signup process */
    static async initializeSmartCoins(userId) {
        try {
            const user = await UserModel.findById(userId);
            
            if (user && !user.smartCoins) {
                user.smartCoins = {
                    balance: 0,
                    transactions: [{
                        amount: 0,
                        type: 'earned',
                        description: 'Welcome to StoreZen! Your Smart Coins journey begins here.',
                        earnedDate: new Date()
                    }]
                };
                
                await user.save();
            }
        } catch (error) {
            // Silent fail - don't block user signup if Smart Coins initialization fails
        }
    }

    // Spend smart coins
    static async spendSmartCoins(req, res) {
        try {
            const { userId } = req.params;
            const { amount, description } = req.body;

            if (!userId || !amount || !description) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID, amount, and description are required'
                });
            }

            const user = await UserModel.findById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (user.smartCoins.balance < amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient smart coins balance'
                });
            }

            // Deduct from balance
            user.smartCoins.balance -= amount;

            // Add transaction record
            user.smartCoins.transactions.push({
                amount: amount,
                type: 'spent',
                description: description,
                earnedDate: new Date()
            });

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Smart coins spent successfully',
                data: {
                    newBalance: user.smartCoins.balance,
                    coinsSpent: amount
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to spend smart coins',
                error: error.message
            });
        }
    }
}

module.exports = SmartCoinsController;
