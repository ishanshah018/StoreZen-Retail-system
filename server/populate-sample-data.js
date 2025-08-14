const mongoose = require('mongoose');
const Bill = require('./Models/Bill');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/storezen')
    .then(() => {
        console.log('Connected to MongoDB');
        populateSampleData();
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

async function populateSampleData() {
    try {
        // Clear existing bills for test user
        const testUserId = '6895f7a42fa4e0f168904bbd';
        await Bill.deleteMany({ customerId: testUserId });
        
        console.log('Creating sample bill data...');
        
        const sampleBills = [];
        const categories = ['Groceries', 'Electronics', 'Clothing', 'Stationery', 'Health & Beauty'];
        const products = {
            'Groceries': [
                { name: 'Amul Gold Milk', price: 65 },
                { name: 'Aashirvaad Atta', price: 180 },
                { name: 'Basmati Rice', price: 120 },
                { name: 'Cooking Oil', price: 150 },
                { name: 'Sugar', price: 45 }
            ],
            'Electronics': [
                { name: 'Phone Charger', price: 299 },
                { name: 'Earphones', price: 599 },
                { name: 'Power Bank', price: 1299 },
                { name: 'USB Cable', price: 199 },
                { name: 'Phone Case', price: 399 }
            ],
            'Clothing': [
                { name: 'T-Shirt', price: 499 },
                { name: 'Jeans', price: 999 },
                { name: 'Shirt', price: 699 },
                { name: 'Socks', price: 199 },
                { name: 'Cap', price: 299 }
            ],
            'Stationery': [
                { name: 'Notebook', price: 45 },
                { name: 'Pen Set', price: 99 },
                { name: 'Pencil Box', price: 149 },
                { name: 'Highlighter', price: 25 },
                { name: 'Eraser', price: 15 }
            ],
            'Health & Beauty': [
                { name: 'Shampoo', price: 179 },
                { name: 'Toothpaste', price: 85 },
                { name: 'Face Wash', price: 129 },
                { name: 'Hand Cream', price: 99 },
                { name: 'Lip Balm', price: 49 }
            ]
        };

        // Generate bills for last 12 months
        const currentDate = new Date();
        for (let month = 0; month < 12; month++) {
            const billDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - month, Math.floor(Math.random() * 28) + 1);
            
            // Generate 2-5 bills per month
            const billsPerMonth = Math.floor(Math.random() * 4) + 2;
            
            for (let billIndex = 0; billIndex < billsPerMonth; billIndex++) {
                const billId = `BILL-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${month}-${billIndex}`;
                
                // Select random category
                const category = categories[Math.floor(Math.random() * categories.length)];
                const categoryProducts = products[category];
                
                // Generate 1-4 items per bill
                const itemCount = Math.floor(Math.random() * 4) + 1;
                const items = [];
                let subtotal = 0;
                
                for (let itemIndex = 0; itemIndex < itemCount; itemIndex++) {
                    const product = categoryProducts[Math.floor(Math.random() * categoryProducts.length)];
                    const quantity = Math.floor(Math.random() * 3) + 1;
                    const itemTotal = product.price * quantity;
                    
                    items.push({
                        productId: Math.floor(Math.random() * 1000) + 1,
                        productName: product.name,
                        category: category,
                        price: product.price,
                        quantity: quantity,
                        itemTotal: itemTotal
                    });
                    
                    subtotal += itemTotal;
                }
                
                // Random coupon discount (30% chance)
                const hasCoupon = Math.random() < 0.3;
                const couponDiscount = hasCoupon ? Math.floor(subtotal * 0.1) : 0;
                
                // Random smart coins usage (40% chance)
                const usesSmartCoins = Math.random() < 0.4;
                const smartCoinsUsed = usesSmartCoins ? Math.floor(Math.random() * 50) : 0;
                const smartCoinsDiscount = smartCoinsUsed;
                
                const totalDiscount = couponDiscount + smartCoinsDiscount;
                const finalAmount = Math.max(0, subtotal - totalDiscount);
                const smartCoinsEarned = Math.floor(finalAmount * 0.01);
                
                const paymentMethods = ['Cash', 'Card', 'UPI'];
                const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                
                const bill = {
                    billId,
                    customerName: 'Test Customer',
                    customerEmail: 'test@example.com',
                    customerId: testUserId,
                    items,
                    billing: {
                        subtotal,
                        couponDiscount,
                        couponCode: hasCoupon ? 'SAVE10' : null,
                        smartCoinsUsed,
                        smartCoinsDiscount,
                        totalDiscount,
                        finalAmount,
                        smartCoinsEarned
                    },
                    paymentMethod,
                    paymentStatus: 'Paid',
                    billDate,
                    storeName: 'StoreZen Retail'
                };
                
                sampleBills.push(bill);
            }
        }
        
        // Insert all sample bills
        await Bill.insertMany(sampleBills);
        console.log(`✅ Created ${sampleBills.length} sample bills for testing analytics!`);
        
        // Show some statistics
        const totalAmount = sampleBills.reduce((sum, bill) => sum + bill.billing.finalAmount, 0);
        const totalSavings = sampleBills.reduce((sum, bill) => sum + bill.billing.totalDiscount, 0);
        
        console.log(`📊 Total Amount: ₹${totalAmount}`);
        console.log(`💰 Total Savings: ₹${totalSavings}`);
        console.log(`🛍️ Total Bills: ${sampleBills.length}`);
        
        console.log('\n🚀 Sample data created successfully! You can now test the analytics feature.');
        
        mongoose.disconnect();
        process.exit(0);
        
    } catch (error) {
        console.error('Error populating sample data:', error);
        mongoose.disconnect();
        process.exit(1);
    }
}
