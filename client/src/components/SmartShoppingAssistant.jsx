import React, { useState, useEffect } from 'react';
import { 
    ShoppingCart, X, Star, Calendar, Package, TrendingUp,
    ChevronRight, Sun, CloudRain, Snowflake,
    PartyPopper, Cake, Plane, Loader2, ArrowLeft, Plus, Minus
} from 'lucide-react';

const SmartShoppingAssistant = ({ 
    isOpen, 
    onClose, 
    currentTheme, 
    themeStyles,
    onOpenSmartBilling,
    onAddToCart,
    cartItems = []
}) => {
    // State Management
    const [currentStep, setCurrentStep] = useState('main'); // main, lastPurchases, eventBased
    const [loading, setLoading] = useState(false);
    const [lastPurchases, setLastPurchases] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [localCart, setLocalCart] = useState([]); // Local cart for assistant

    // Event Categories
    const eventCategories = {
        trip: {
            icon: Plane,
            title: "Trip / Travel",
            description: "Travel essentials and must-haves",
            color: "from-blue-500 to-cyan-500",
            keywords: ["travel", "portable", "mini", "travel size", "sunscreen", "charger", "pillow", "snack", "water bottle", "toiletries"]
        },
        festival: {
            icon: PartyPopper,
            title: "Festival Celebrations",
            description: "Festival decorations and treats",
            color: "from-purple-500 to-pink-500",
            keywords: ["decoration", "lights", "sweet", "gift", "candle", "flower", "rangoli", "lamp", "chocolate", "dry fruit"]
        },
        birthday: {
            icon: Cake,
            title: "Birthday Party",
            description: "Party supplies and celebrations",
            color: "from-yellow-500 to-orange-500",
            keywords: ["cake", "candle", "balloon", "decoration", "party", "gift", "chocolate", "juice", "chips", "return gift"]
        },
        summer: {
            icon: Sun,
            title: "Summer Season",
            description: "Beat the heat essentials",
            color: "from-orange-500 to-red-500",
            keywords: ["cold", "ice cream", "sunscreen", "cotton", "cooler", "water", "juice", "fan", "hat", "sunglasses"]
        },
        monsoon: {
            icon: CloudRain,
            title: "Monsoon Season",
            description: "Rainy season necessities",
            color: "from-teal-500 to-blue-500",
            keywords: ["umbrella", "raincoat", "waterproof", "warm", "tea", "coffee", "boots", "jacket", "towel", "plastic"]
        },
        winter: {
            icon: Snowflake,
            title: "Winter Season",
            description: "Stay warm and cozy",
            color: "from-indigo-500 to-purple-500",
            keywords: ["blanket", "jacket", "warm", "hot", "heater", "wool", "sweater", "gloves", "cap", "scarf"]
        }
    };

    // Fetch customer's last purchases
    const fetchLastPurchases = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/billing/customer/${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            console.log('Response status:', response.status); // Debug log

            if (response.ok) {
                const result = await response.json();
                console.log('Bills result:', result); // Debug log
                
                if (result.success && result.bills.length > 0) {
                    // Get last 5 bills and extract unique products
                    const recentBills = result.bills.slice(0, 5);
                    const purchasedProducts = [];
                    
                    recentBills.forEach(bill => {
                        bill.items.forEach(item => {
                            const existingProduct = purchasedProducts.find(p => p.productId === item.productId);
                            if (existingProduct) {
                                existingProduct.totalQuantity += item.quantity;
                                existingProduct.totalSpent += item.itemTotal;
                                existingProduct.lastPurchased = Math.max(existingProduct.lastPurchased, new Date(bill.billDate).getTime());
                            } else {
                                purchasedProducts.push({
                                    productId: item.productId,
                                    productName: item.productName,
                                    category: item.category,
                                    price: item.price,
                                    totalQuantity: item.quantity,
                                    totalSpent: item.itemTotal,
                                    lastPurchased: new Date(bill.billDate).getTime()
                                });
                            }
                        });
                    });

                    // Sort by frequency and recency
                    purchasedProducts.sort((a, b) => {
                        const freqScore = b.totalQuantity - a.totalQuantity;
                        const timeScore = (b.lastPurchased - a.lastPurchased) / (1000 * 60 * 60 * 24); // days
                        return freqScore + (timeScore * 0.1);
                    });

                    console.log('Processed purchases:', purchasedProducts.slice(0, 10)); // Debug log
                    setLastPurchases(purchasedProducts.slice(0, 10));
                } else {
                    console.log('No bills found or API error:', result); // Debug log
                }
            } else {
                console.error('API response not ok:', response.status, await response.text());
            }
        } catch (error) {
            console.error('Error fetching last purchases:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available products from Django
    const fetchAvailableProducts = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/products/');
            if (response.ok) {
                const products = await response.json();
                console.log('Fetched products:', products); // Debug log
                setAvailableProducts(products);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    // Generate suggestions based on last purchases
    const generateLastPurchaseSuggestions = () => {
        console.log('Last purchases:', lastPurchases);
        console.log('Available products:', availableProducts);
        
        if (lastPurchases.length === 0 || availableProducts.length === 0) return [];

        const suggestions = [];
        
        // 1. Same products (replenishment) - use productName matching
        lastPurchases.slice(0, 5).forEach(purchase => {
            const product = availableProducts.find(p => 
                p.name.toLowerCase() === purchase.productName.toLowerCase() || 
                p.id === purchase.productId
            );
            if (product && product.in_stock) {
                suggestions.push({
                    ...product,
                    reason: `You bought this ${purchase.totalQuantity} times`,
                    type: 'replenishment',
                    priority: 1
                });
            }
        });

        // 2. Same category products
        const purchasedCategories = [...new Set(lastPurchases.map(p => p.category))];
        purchasedCategories.forEach(category => {
            const categoryProducts = availableProducts
                .filter(p => p.category.toLowerCase() === category.toLowerCase() && p.in_stock)
                .filter(p => !suggestions.find(s => s.id === p.id))
                .slice(0, 3);
                
            categoryProducts.forEach(product => {
                suggestions.push({
                    ...product,
                    reason: `Popular in ${category} category`,
                    type: 'category',
                    priority: 2
                });
            });
        });

        console.log('Generated suggestions:', suggestions);
        return suggestions.slice(0, 12);
    };

    // Generate event-based suggestions
    const generateEventBasedSuggestions = (eventType) => {
        if (!eventCategories[eventType] || availableProducts.length === 0) return [];

        const keywords = eventCategories[eventType].keywords;
        const suggestions = [];

        // Search products by keywords
        availableProducts.forEach(product => {
            if (!product.in_stock) return;
            
            const productText = `${product.name} ${product.category}`.toLowerCase();
            const matchCount = keywords.filter(keyword => 
                productText.includes(keyword.toLowerCase())
            ).length;

            if (matchCount > 0) {
                suggestions.push({
                    ...product,
                    reason: `Perfect for ${eventCategories[eventType].title}`,
                    type: 'event',
                    priority: matchCount,
                    matchedKeywords: keywords.filter(keyword => 
                        productText.includes(keyword.toLowerCase())
                    )
                });
            }
        });

        // Sort by relevance (priority) and return top 15
        return suggestions
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 15);
    };

    // Initialize data
    useEffect(() => {
        if (isOpen) {
            fetchAvailableProducts();
            fetchLastPurchases();
        }
    }, [isOpen]);

    // Handle last purchases view
    const handleLastPurchasesView = () => {
        setCurrentStep('lastPurchases');
    };

    // Handle event selection
    const handleEventSelect = (eventType) => {
        setSelectedEvent(eventType);
        setLoading(true);
        const eventSuggestions = generateEventBasedSuggestions(eventType);
        setSuggestions(eventSuggestions);
        setCurrentStep('eventBased');
        setLoading(false);
    };

    // Add to local cart
    const addToLocalCart = (product) => {
        setLocalCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            
            if (existingItem) {
                // Check stock availability
                if (existingItem.quantity >= product.stock) {
                    alert(`Only ${product.stock} items available for ${product.name}`);
                    return prevCart;
                }
                
                // Update quantity
                return prevCart.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                // Check stock availability
                if (product.stock <= 0) {
                    alert(`${product.name} is out of stock`);
                    return prevCart;
                }
                
                // Add new item
                return [...prevCart, { 
                    ...product, 
                    quantity: 1,
                    price: product.selling_price || product.price
                }];
            }
        });
    };

    // Remove from local cart
    const removeFromLocalCart = (productId) => {
        setLocalCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    // Update quantity in local cart
    const updateLocalCartQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromLocalCart(productId);
            return;
        }
        
        setLocalCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === productId) {
                    const product = suggestions.find(p => p.id === productId);
                    if (newQuantity > product.stock) {
                        alert(`Only ${product.stock} items available for ${product.name}`);
                        return item;
                    }
                    
                    return { 
                        ...item, 
                        quantity: newQuantity
                    };
                }
                return item;
            });
        });
    };

    // Get cart total
    const getCartTotal = () => {
        return localCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    // Proceed to billing with cart items - Go directly to Step 2
    const proceedToBilling = () => {
        if (localCart.length === 0) {
            alert('Please add some items to your cart first!');
            return;
        }

        // Pass cart items to parent and open smart billing at step 2
        if (onAddToCart && localCart.length > 0) {
            localCart.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                    onAddToCart(item);
                }
            });
        }
        
        onClose();
        // Open Smart Billing and go to step 2
        if (onOpenSmartBilling) {
            setTimeout(() => {
                onOpenSmartBilling(2); // Pass step 2 parameter
            }, 100);
        }
    };

    // Format date
    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div 
                className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${themeStyles.cardBg} border border-gray-200/20`}
                style={{ 
                    animation: 'slideInFromBottom 0.3s ease-out',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* Header */}
                <div className={`sticky top-0 p-6 border-b border-gray-200/20 ${themeStyles.cardBg} rounded-t-2xl backdrop-blur-xl`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {currentStep !== 'main' && (
                                <button
                                    onClick={() => setCurrentStep('main')}
                                    className={`p-2 rounded-lg transition-all duration-200 ${themeStyles.hoverBg} ${themeStyles.text}`}
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                            )}
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-2xl font-bold ${themeStyles.text}`}>
                                        🛍️ Smart Shopping Assistant
                                    </h1>
                                    <p className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                        AI-powered personalized shopping recommendations
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-lg transition-all duration-200 ${themeStyles.hoverBg} text-gray-500 hover:text-red-500`}
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Main Menu */}
                    {currentStep === 'main' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className={`text-xl font-semibold mb-2 ${themeStyles.text}`}>
                                    How can I help you shop today? ✨
                                </h2>
                                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                    Choose from personalized recommendations or event-based suggestions
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Last Purchases Card */}
                                <div
                                    onClick={handleLastPurchasesView}
                                    className={`group cursor-pointer p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition-all duration-300 ${themeStyles.cardBg} hover:shadow-lg hover:shadow-blue-500/25 transform hover:scale-[1.02]`}
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text}`}>
                                                🔄 Purchase from Your Last Purchased
                                            </h3>
                                            <p className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                                Smart recommendations based on your shopping history and preferences
                                            </p>
                                            {lastPurchases.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                                    {lastPurchases.slice(0, 3).map((item, idx) => (
                                                        <span 
                                                            key={idx}
                                                            className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full"
                                                        >
                                                            {item.productName}
                                                        </span>
                                                    ))}
                                                    {lastPurchases.length > 3 && (
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                                                            +{lastPurchases.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight className={`w-5 h-5 mx-auto ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')} group-hover:text-blue-500`} />
                                    </div>
                                </div>

                                {/* Event-Based Shopping Card */}
                                <div
                                    onClick={() => setCurrentStep('eventSelection')}
                                    className={`group cursor-pointer p-6 rounded-xl border-2 border-dashed border-gray-300 hover:border-purple-500 transition-all duration-300 ${themeStyles.cardBg} hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02]`}
                                >
                                    <div className="text-center space-y-4">
                                        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Calendar className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text}`}>
                                                🎯 Smart Event-Based Shopping
                                            </h3>
                                            <p className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                                Get curated suggestions for trips, festivals, parties, and seasonal needs
                                            </p>
                                            <div className="mt-3 flex flex-wrap gap-2 justify-center">
                                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                                    🎉 Festivals
                                                </span>
                                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                                    ✈️ Travel
                                                </span>
                                                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                                                    🌤️ Seasonal
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 mx-auto ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')} group-hover:text-purple-500`} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Event Selection Step */}
                    {currentStep === 'eventSelection' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className={`text-xl font-semibold mb-2 ${themeStyles.text}`}>
                                    🎯 What are you planning for?
                                </h2>
                                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                    Select an occasion to get personalized product recommendations
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(eventCategories).map(([key, event]) => {
                                    const IconComponent = event.icon;
                                    return (
                                        <div
                                            key={key}
                                            onClick={() => handleEventSelect(key)}
                                            className={`group cursor-pointer p-6 rounded-xl border-2 border-transparent hover:border-gray-300 transition-all duration-300 ${themeStyles.cardBg} hover:shadow-lg transform hover:scale-[1.02]`}
                                            style={{
                                                background: `linear-gradient(135deg, ${currentTheme === 'dark' ? 'rgba(55, 65, 81, 0.8)' : 'rgba(255, 255, 255, 0.8)'} 0%, ${currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.6)' : 'rgba(249, 250, 251, 0.6)'} 100%)`
                                            }}
                                        >
                                            <div className="text-center space-y-3">
                                                <div className={`w-12 h-12 mx-auto bg-gradient-to-r ${event.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold mb-1 ${themeStyles.text}`}>
                                                        {event.title}
                                                    </h3>
                                                    <p className={`text-xs ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Event-Based Selection */}
                    {currentStep === 'eventBased' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                                        <p className={`text-lg ${themeStyles.text}`}>
                                            Finding perfect products for you...
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="text-center mb-8">
                                        <h2 className={`text-xl font-semibold mb-2 ${themeStyles.text}`}>
                                            🎯 Perfect for {eventCategories[selectedEvent]?.title}
                                        </h2>
                                        <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                            {suggestions.length} products found just for you
                                        </p>
                                    </div>

                                    {/* Products Grid */}
                                    {suggestions.length > 0 ? (
                                        <>
                                            {/* Cart Summary */}
                                            {localCart.length > 0 && (
                                                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-200">
                                                            🛒 Your Cart
                                                        </h3>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {localCart.length} item{localCart.length > 1 ? 's' : ''}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-2 mb-4">
                                                        {localCart.map(item => (
                                                            <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-sm">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">₹{item.price} each</p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => updateLocalCartQuantity(item.id, item.quantity - 1)}
                                                                        className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateLocalCartQuantity(item.id, item.quantity + 1)}
                                                                        className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                                                        <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                                            Total: ₹{getCartTotal().toLocaleString('en-IN')}
                                                        </div>
                                                        <button
                                                            onClick={proceedToBilling}
                                                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                                        >
                                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                                            Go to Billing (Step 2)
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                                {suggestions.map((product, index) => (
                                                    <div
                                                        key={`${product.id}-${index}`}
                                                        className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden transform hover:scale-[1.02]`}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-start justify-between mb-3">
                                                                <div className="flex-1">
                                                                    <h3 className={`font-semibold text-sm leading-tight mb-1 ${themeStyles.text} line-clamp-2`}>
                                                                        {product.name}
                                                                    </h3>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {product.category}
                                                                    </p>
                                                                </div>
                                                                <div className="ml-2">
                                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                                                        Stock: {product.stock}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Price */}
                                                            <div className="text-center mb-3">
                                                                <span className={`text-lg font-bold ${themeStyles.text}`}>
                                                                    ₹{parseFloat(product.selling_price || product.price || 0).toLocaleString('en-IN')}
                                                                </span>
                                                            </div>

                                                            {/* Add to Cart Button */}
                                                            <div className="flex items-center justify-center space-x-2">
                                                                {localCart.find(item => item.id === product.id) ? (
                                                                    <div className="flex items-center space-x-2">
                                                                        <button
                                                                            onClick={() => updateLocalCartQuantity(product.id, localCart.find(item => item.id === product.id).quantity - 1)}
                                                                            className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50"
                                                                        >
                                                                            <Minus className="w-3 h-3" />
                                                                        </button>
                                                                        <span className="text-sm font-semibold w-8 text-center">
                                                                            {localCart.find(item => item.id === product.id).quantity}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => updateLocalCartQuantity(product.id, localCart.find(item => item.id === product.id).quantity + 1)}
                                                                            className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50"
                                                                        >
                                                                            <Plus className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => addToLocalCart(product)}
                                                                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                                                                    >
                                                                        <Plus className="w-4 h-4" />
                                                                        <span>Add to Cart</span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-20">
                                            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                            <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text}`}>
                                                No products found
                                            </h3>
                                            <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                                Try selecting a different category or check back later
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Last Purchases View */}
                    {currentStep === 'lastPurchases' && (
                        <div className="space-y-6">
                            <div className="text-center mb-8">
                                <h2 className={`text-xl font-semibold mb-2 ${themeStyles.text}`}>
                                    🔄 Your Last Purchased Items
                                </h2>
                                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                    Replenish your frequently bought items
                                </p>
                            </div>

                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                                        <p className={`text-lg ${themeStyles.text}`}>
                                            Loading your purchase history...
                                        </p>
                                    </div>
                                </div>
                            ) : lastPurchases.length > 0 ? (
                                <>
                                    {/* Cart Summary */}
                                    {localCart.length > 0 && (
                                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold text-lg text-blue-800 dark:text-blue-200">
                                                    🛒 Your Cart
                                                </h3>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {localCart.length} item{localCart.length > 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-2 mb-4">
                                                {localCart.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3">
                                                        <div className="flex-1">
                                                            <p className="font-medium text-sm">{item.name}</p>
                                                            <p className="text-xs text-gray-500">₹{item.price} each</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                onClick={() => updateLocalCartQuantity(item.id, item.quantity - 1)}
                                                                className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateLocalCartQuantity(item.id, item.quantity + 1)}
                                                                className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-blue-200 dark:border-blue-800">
                                                <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                                    Total: ₹{getCartTotal().toLocaleString('en-IN')}
                                                </div>
                                                <button
                                                    onClick={proceedToBilling}
                                                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                                                >
                                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                                    Go to Billing (Step 2)
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {lastPurchases.map((purchase, index) => {
                                            // Try to find the product in available products for current info
                                            const currentProduct = availableProducts.find(p => 
                                                p.name.toLowerCase() === purchase.productName.toLowerCase() ||
                                                p.id === purchase.productId
                                            );
                                            
                                            const displayPrice = currentProduct?.selling_price || currentProduct?.price || purchase.price || 0;
                                            const stockStatus = currentProduct?.stock || 0;
                                            
                                            return (
                                                <div
                                                    key={`${purchase.productId}-${index}`}
                                                    className={`group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 overflow-hidden transform hover:scale-[1.02]`}
                                                >
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex-1">
                                                                <h3 className={`font-semibold text-sm leading-tight mb-1 ${themeStyles.text} line-clamp-2`}>
                                                                    {purchase.productName}
                                                                </h3>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {purchase.category}
                                                                </p>
                                                            </div>
                                                            <div className="ml-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    stockStatus > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 
                                                                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                                                }`}>
                                                                    {stockStatus > 0 ? `Stock: ${stockStatus}` : 'Out of Stock'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Purchase History Info */}
                                                        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium flex items-center">
                                                                <TrendingUp className="w-3 h-3 mr-1" />
                                                                You bought {purchase.totalQuantity} times
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                Last bought: {formatDate(purchase.lastPurchased)}
                                                            </p>
                                                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                                                Total spent: ₹{purchase.totalSpent.toLocaleString('en-IN')}
                                                            </p>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="text-center mb-3">
                                                            <span className={`text-lg font-bold ${themeStyles.text}`}>
                                                                ₹{parseFloat(displayPrice).toLocaleString('en-IN')}
                                                            </span>
                                                        </div>

                                                        {/* Add to Cart Button */}
                                                        <div className="flex items-center justify-center space-x-2">
                                                            {stockStatus <= 0 ? (
                                                                <button
                                                                    disabled
                                                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-lg font-semibold text-sm cursor-not-allowed"
                                                                >
                                                                    <span>Out of Stock</span>
                                                                </button>
                                                            ) : localCart.find(item => item.id === (currentProduct?.id || purchase.productId)) ? (
                                                                <div className="flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => updateLocalCartQuantity(
                                                                            currentProduct?.id || purchase.productId, 
                                                                            localCart.find(item => item.id === (currentProduct?.id || purchase.productId)).quantity - 1
                                                                        )}
                                                                        className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold hover:bg-red-200 dark:hover:bg-red-900/50"
                                                                    >
                                                                        <Minus className="w-3 h-3" />
                                                                    </button>
                                                                    <span className="text-sm font-semibold w-8 text-center">
                                                                        {localCart.find(item => item.id === (currentProduct?.id || purchase.productId)).quantity}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => updateLocalCartQuantity(
                                                                            currentProduct?.id || purchase.productId, 
                                                                            localCart.find(item => item.id === (currentProduct?.id || purchase.productId)).quantity + 1
                                                                        )}
                                                                        className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900/50"
                                                                    >
                                                                        <Plus className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        if (currentProduct) {
                                                                            addToLocalCart(currentProduct);
                                                                        } else {
                                                                            // Create a pseudo product from purchase history
                                                                            const pseudoProduct = {
                                                                                id: purchase.productId,
                                                                                name: purchase.productName,
                                                                                category: purchase.category,
                                                                                price: displayPrice,
                                                                                selling_price: displayPrice,
                                                                                stock: stockStatus,
                                                                                in_stock: stockStatus > 0
                                                                            };
                                                                            addToLocalCart(pseudoProduct);
                                                                        }
                                                                    }}
                                                                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 text-sm"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                    <span>Add to Cart</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-20">
                                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text}`}>
                                        No purchase history found
                                    </h3>
                                    <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                                        Start shopping to see personalized recommendations here
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes slideInFromBottom {
                    from {
                        opacity: 0;
                        transform: translateY(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default SmartShoppingAssistant;
