import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// =============================================================================
// IMPORTS
// =============================================================================

// UI Components
import { 
    Card,CardContent,CardDescription,CardHeader,CardTitle 
} from "../components/ui/card";

// Theme Components
import { useTheme, getThemeStyles, ThemeBackground, 
getThemeEmoji 
} from "../components/theme";
import { 
GradientButton, 
GradientBadge 
} from "../components/theme";

// Icons
import {
    User,ShoppingCart,MessageCircle,Receipt,FileText,Ticket,Coins,BarChart,Star,Heart, 
    Send,Store,LogOut,ArrowLeft,Loader2,AlertCircle,Package,Search,X,Plus,Minus,CheckCircle,XCircle
} from "lucide-react";

// Utilities and API
import { API_CONFIG, buildApiUrl } from '../lib/apiConfig';// =============================================================================
// UTILITY CLASSES - TRIE DATA STRUCTURE FOR PRODUCT SEARCH
// =============================================================================

/** Trie node for efficient product search implementation */
class TrieNode {
constructor() {
    this.children = {};     // Character mapping to child nodes
    this.isEndOfWord = false; // Marks complete word
    this.products = [];     // Products that match this prefix
}
}

/** Trie data structure for O(m) product search complexity */
class Trie {
constructor() {
    this.root = new TrieNode();
}

/** Insert product into trie by word */
insert(word, product) {
    let node = this.root;
    const normalizedWord = word.toLowerCase();

    for (let char of normalizedWord) {
    if (!node.children[char]) {
        node.children[char] = new TrieNode();
    }
    node = node.children[char];
    node.products.push(product);
    }
    node.isEndOfWord = true;
}

/** Search products by prefix */
search(prefix) {
    let node = this.root;
    const normalizedPrefix = prefix.toLowerCase();

    for (let char of normalizedPrefix) {
    if (!node.children[char]) {
        return [];
    }
    node = node.children[char];
    }

    // Remove duplicates using Set
    const uniqueProducts = new Set();
    node.products.forEach(product => {
    uniqueProducts.add(JSON.stringify(product));
    });

    return Array.from(uniqueProducts).map(productStr => JSON.parse(productStr));
}

/** Build trie from products array */
buildTrie(products) {
    this.root = new TrieNode(); // Reset trie
    products.forEach(product => {
    this.insert(product.name, product);        // Insert product name
    this.insert(product.category, product);    // Insert category
    // Insert individual words from product name
    product.name.split(' ').forEach(word => {
        if (word.length > 1) { // Skip single characters
        this.insert(word, product);
        }
    });
    });
}
}

// =============================================================================
// MAIN CUSTOMER COMPONENT
// =============================================================================

const Customer = () => {
// =============================================================================
// HOOKS AND NAVIGATION
// =============================================================================

// Navigation and theme
const navigate = useNavigate();
const { currentTheme } = useTheme();

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

// Customer data
const [customerName, setCustomerName] = useState("Guest");

// Product management
const [products, setProducts] = useState([]);             // All products
const [filteredProducts, setFilteredProducts] = useState([]); // Filtered products
const [categories, setCategories] = useState([]);        // Available categories
const [selectedCategory, setSelectedCategory] = useState("All"); // Selected filter

// Search functionality
const [searchQuery, setSearchQuery] = useState("");      // Search input
const [trie] = useState(new Trie());                    // Search index

// UI states
const [showProducts, setShowProducts] = useState(false); // Product view toggle
const [loading, setLoading] = useState(false);          // Loading state
const [error, setError] = useState("");                 // Error message

// Coupon modal states
const [showCouponModal, setShowCouponModal] = useState(false); // Coupon modal toggle
const [coupons, setCoupons] = useState([]);             // All coupons
const [couponsLoading, setCouponsLoading] = useState(false); // Coupon loading state
const [couponsError, setCouponsError] = useState("");   // Coupon error message
const [copyMessage, setCopyMessage] = useState('');     // Copy success message
const [showCopyMessage, setShowCopyMessage] = useState(false); // Show copy message modal

// Smart Coins modal states
const [showSmartCoinsModal, setShowSmartCoinsModal] = useState(false); // Smart Coins modal toggle
const [smartCoinsData, setSmartCoinsData] = useState(null); // Smart Coins data
const [smartCoinsLoading, setSmartCoinsLoading] = useState(false); // Smart Coins loading state
const [smartCoinsError, setSmartCoinsError] = useState(""); // Smart Coins error message

// Feedback modal states
const [showFeedbackModal, setShowFeedbackModal] = useState(false); // Feedback modal toggle

// Wishlist states
const [showWishlistModal, setShowWishlistModal] = useState(false); // Wishlist modal toggle
const [wishlistItems, setWishlistItems] = useState([]);         // User's wishlist items
const [wishlistLoading, setWishlistLoading] = useState(false); // Wishlist loading state
const [wishlistProductStatus, setWishlistProductStatus] = useState({}); // Track which products are in wishlist

// Notification states
const [notification, setNotification] = useState({ show: false, message: '', type: '' }); // Clean notification system
const [showConfirmClear, setShowConfirmClear] = useState(false); // Confirmation for clear wishlist
const [feedbackRating, setFeedbackRating] = useState(0); // Selected star rating
const [feedbackCategories, setFeedbackCategories] = useState([]); // Selected feedback categories
const [feedbackText, setFeedbackText] = useState(''); // Optional feedback text
const [feedbackLoading, setFeedbackLoading] = useState(false); // Feedback submission loading
const [feedbackError, setFeedbackError] = useState(''); // Feedback error message
const [feedbackSuccess, setFeedbackSuccess] = useState(false); // Feedback success state

// =============================================================================
// LIFECYCLE EFFECTS
// =============================================================================

/** Load customer name from localStorage on mount */
useEffect(() => {
    const savedCustomerName = localStorage.getItem('customerName') || "Guest";
    setCustomerName(savedCustomerName);
    
    // Track customer dashboard access - prevent double counting in same session
    const sessionKey = `dashboardSession_${Date.now()}`;
    const lastSessionKey = localStorage.getItem('lastDashboardSession');
    
    // Only increment if this is a new session (not a React StrictMode double render)
    if (!sessionStorage.getItem('dashboardCountedThisSession')) {
        const currentClicks = localStorage.getItem('customerDashboardClicks') || '0';
        const newClickCount = parseInt(currentClicks) + 1;
        localStorage.setItem('customerDashboardClicks', newClickCount.toString());
        
        // Mark this session as counted
        sessionStorage.setItem('dashboardCountedThisSession', 'true');
    }
}, []);

// =============================================================================
// API FUNCTIONS
// =============================================================================

/** Fetch available product categories from Django backend */
const fetchCategories = async () => {
    try {
    const response = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.categories));
    if (!response.ok) throw new Error('Failed to fetch categories');
    
    const categories = await response.json();
    setCategories(categories);
    } catch (error) {
    setCategories(['Electronics', 'Fashion', 'Home & Garden']); // Fallback categories
    }
};

/** Fetch products with optional category filter */
const fetchProducts = async (category = "") => {
    setLoading(true);
    setError("");

    try {
    const url = category && category !== "All" 
        ? `${buildApiUrl('django', API_CONFIG.endpoints.django.customerProducts)}?category=${encodeURIComponent(category)}`
        : buildApiUrl('django', API_CONFIG.endpoints.django.customerProducts);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    setProducts(data);
    setFilteredProducts(data);

    // Build search trie for efficient searching
    trie.buildTrie(data);

    if (!showProducts) {
        await fetchCategories();
        setShowProducts(true);
    }
    } catch (err) {
    setError('Unable to load products. Please try again.');
    } finally {
    setLoading(false);
    }
};

/** Fetch coupons from Node.js backend */
const fetchCoupons = async () => {
    setCouponsLoading(true);
    setCouponsError("");

    try {
        const response = await fetch('http://localhost:8080/api/coupons/active');
        if (!response.ok) {
            throw new Error('Failed to fetch coupons');
        }
        
        const data = await response.json();
        if (data.success) {
            setCoupons(data.coupons);
            setShowCouponModal(true);
        } else {
            setCouponsError('Unable to load coupons');
        }
    } catch (err) {
        setCouponsError('Unable to connect to server. Please try again.');
    } finally {
        setCouponsLoading(false);
    }
};

/** Get coupon status based on current date */
const getCouponStatus = (coupon) => {
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (now < validFrom) {
        return { status: 'upcoming', label: 'Upcoming', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    } else if (now > validUntil) {
        return { status: 'expired', label: 'Expired', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else {
        return { status: 'active', label: 'Active', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
};

/** Copy coupon code to clipboard */
const copyCouponCode = async (code) => {
    try {
        await navigator.clipboard.writeText(code);
        setCopyMessage(`Coupon code "${code}" copied to clipboard!`);
        setShowCopyMessage(true);
        
        // Hide message after 3 seconds
        setTimeout(() => {
            setShowCopyMessage(false);
        }, 3000);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopyMessage(`Coupon code "${code}" copied to clipboard!`);
        setShowCopyMessage(true);
        
        // Hide message after 3 seconds
        setTimeout(() => {
            setShowCopyMessage(false);
        }, 3000);
    }
};

/** Fetch Smart Coins data from server */
const fetchSmartCoins = async () => {
    setSmartCoinsLoading(true);
    setSmartCoinsError("");
    
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setSmartCoinsError('User not found. Please login again.');
            return;
        }

        const response = await fetch(`http://localhost:8080/api/smartcoins/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                setSmartCoinsData(result.data);
            } else {
                setSmartCoinsError(result.message || 'Failed to fetch Smart Coins data');
            }
        } else {
            const errorData = await response.json();
            setSmartCoinsError(errorData.message || 'Failed to fetch Smart Coins data');
        }
    } catch (error) {
        setSmartCoinsError('Failed to connect to server. Please try again.');
    } finally {
        setSmartCoinsLoading(false);
    }
};

/** Show Smart Coins modal and fetch data */
const showSmartCoinsView = () => {
    setShowSmartCoinsModal(true);
    fetchSmartCoins();
};

// =============================================================================
// FEEDBACK FUNCTIONS
// =============================================================================

/** Feedback category definitions based on rating */
const getFeedbackCategories = (rating) => {
    const categories = {
        1: [
            { key: 'product_quality_issues', label: 'Product Quality Issues' },
            { key: 'website_problems', label: 'Website Problems' },
            { key: 'other_issues', label: 'Other Issues' },
            { key: 'poor_billing_facility', label: 'Poor Billing Facility' }
        ],
        2: [
            { key: 'product_quality', label: 'Product Quality' },
            { key: 'pricing_concerns', label: 'Pricing Concerns' },
            { key: 'smart_coins_redemption_issues', label: 'Smart Coins Redemption Issues' },
            { key: 'website_experience', label: 'Website Experience' },
            { key: 'others', label: 'Others' }
        ],
        3: [
            { key: 'product_availability', label: 'Product Availability' },
            { key: 'checkout_process', label: 'Checkout Process' },
            { key: 'chatbot_issues', label: 'Chatbot Issues' },
            { key: 'others', label: 'Others' }
        ],
        4: [
            { key: 'user_interface', label: 'User Interface' },
            { key: 'lagging_issues', label: 'Lagging Issues' },
            { key: 'out_of_stock_items', label: 'Out of Stock Items' },
            { key: 'others', label: 'Others' }
        ]
    };
    return categories[rating] || [];
};

/** Show feedback modal */
const showFeedbackView = () => {
    setShowFeedbackModal(true);
    setFeedbackRating(0);
    setFeedbackCategories([]);
    setFeedbackText('');
    setFeedbackError('');
    setFeedbackSuccess(false);
};

/** Handle star rating selection */
const handleStarRating = (rating) => {
    setFeedbackRating(rating);
    setFeedbackCategories([]); // Reset categories when rating changes
};

/** Handle feedback category selection */
const handleCategoryToggle = (categoryKey) => {
    setFeedbackCategories(prev => {
        const exists = prev.find(cat => cat.category === categoryKey);
        if (exists) {
            // Remove if already selected
            return prev.filter(cat => cat.category !== categoryKey);
        } else {
            // Add if not selected
            return [...prev, { category: categoryKey, selected: true }];
        }
    });
};

/** Submit feedback */
const submitFeedback = async () => {
    if (feedbackRating === 0) {
        setFeedbackError('Please select a rating');
        return;
    }

    setFeedbackLoading(true);
    setFeedbackError('');

    try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            setFeedbackError('User not found. Please login again.');
            return;
        }

        const response = await fetch(`http://localhost:8080/api/feedback/submit/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rating: feedbackRating,
                feedbackCategories: feedbackCategories,
                feedbackText: feedbackText.trim()
            })
        });

        const result = await response.json();
        
        if (result.success) {
            setFeedbackSuccess(true);
            // Auto-close modal after success
            setTimeout(() => {
                setShowFeedbackModal(false);
                setFeedbackSuccess(false);
            }, 2000);
        } else {
            setFeedbackError(result.message || 'Failed to submit feedback');
        }
    } catch (error) {
        setFeedbackError('Failed to connect to server. Please try again.');
    } finally {
        setFeedbackLoading(false);
    }
};

// =============================================================================
// WISHLIST FUNCTIONALITY
// =============================================================================

/** Fetch user's wishlist items */
const fetchWishlistItems = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setWishlistLoading(true);
    try {
        const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.node.wishlist.get}/${userId}`);
        const result = await response.json();
        
        if (result.success) {
            setWishlistItems(result.data);
            
            // Update wishlist status for products
            const statusMap = {};
            result.data.forEach(item => {
                statusMap[item.productId] = true;
            });
            setWishlistProductStatus(statusMap);
        }
    } catch (error) {
        // Error fetching wishlist
    } finally {
        setWishlistLoading(false);
    }
};

/** Add item to wishlist */
const addToWishlist = async (product) => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        showNotification('Please login to add items to wishlist', 'error');
        return;
    }

    // Show loading state
    const originalButton = document.activeElement;
    if (originalButton) {
        originalButton.disabled = true;
        originalButton.textContent = 'Adding...';
    }

    try {
        const requestData = {
            userId,
            productId: product.id,
            productName: product.name,
            productCategory: product.category,
            productPrice: parseFloat(product.price),
            isInStock: product.in_stock || false
        };

        const response = await fetch(`${API_CONFIG.NODE_SERVER}/api/wishlist/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        
        if (result.success) {
            // Update local state
            setWishlistProductStatus(prev => ({
                ...prev,
                [product.id]: true
            }));
            
            // Update wishlist items count
            fetchWishlistItems();
            
            showNotification('Item added to wishlist successfully', 'success');
        } else {
            showNotification(result.message || 'Failed to add item to wishlist', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect to server. Please try again.', 'error');
    } finally {
        // Restore button state
        if (originalButton) {
            originalButton.disabled = false;
            originalButton.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg> Add to Wishlist';
        }
    }
};

/** Remove item from wishlist */
const removeFromWishlist = async (productId) => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.node.wishlist.remove}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                productId
            })
        });

        const result = await response.json();
        
        if (result.success) {
            // Update local state
            setWishlistProductStatus(prev => {
                const updated = { ...prev };
                delete updated[productId];
                return updated;
            });
            
            // Remove from wishlist items
            setWishlistItems(prev => prev.filter(item => item.productId !== productId));
            
            showNotification('Item removed from wishlist', 'success');
        } else {
            showNotification(result.message || 'Failed to remove item from wishlist', 'error');
        }
    } catch (error) {
        showNotification('Failed to connect to server. Please try again.', 'error');
    }
};

/** Show wishlist modal */
const showWishlistView = () => {
    setShowWishlistModal(true);
    fetchWishlistItems();
};

/** Check wishlist status when products are loaded */
useEffect(() => {
    if (products.length > 0) {
        const userId = localStorage.getItem('userId');
        if (userId) {
            fetchWishlistItems();
        }
    }
}, [products]);

// =============================================================================
// NOTIFICATION HELPER
// =============================================================================

/** Show clean notification */
const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
    }, 3000);
};

/** Clear entire wishlist */
const handleClearWishlist = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        try {
            const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.node.wishlist.clear}/${userId}`, {
                method: 'DELETE'
            });
            const result = await response.json();
            if (result.success) {
                setWishlistItems([]);
                setWishlistProductStatus({});
                showNotification('Wishlist cleared successfully', 'success');
            }
        } catch (error) {
            showNotification('Failed to clear wishlist', 'error');
        }
    }
    setShowConfirmClear(false);
};

// =============================================================================
// EVENT HANDLERS
// =============================================================================

/** Handle category change */
const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery(""); // Clear search when changing category
    fetchProducts(category);
};

/** Handle search */
const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
    // If search is empty, show products based on selected category
    setFilteredProducts(products);
    return;
    }

    // Use Trie to search
    const searchResults = trie.search(query);

    // Filter by selected category if not "All"
    let finalResults = searchResults;
    if (selectedCategory !== "All") {
    finalResults = searchResults.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(finalResults);
};

/** Enhanced logout function */
const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('customerName');

    // Navigate to home page
    navigate('/', { replace: true });
};
// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

/** Profile features */
const profileFeatures = [
    {
    title: "Your Profile Handle",
    description: "Manage your personal information and preferences",
    icon: User,
    color: "from-blue-500 to-cyan-500",
    category: "profile",
    },
];

/** Shopping features */
const shoppingFeatures = [
    {
    title: "View Products",
    description: "Browse our extensive catalog with AI-powered filtering",
    icon: ShoppingCart,
    color: "from-green-500 to-emerald-500",
    category: "shopping",
    },
    {
    title: "Chatbot Feature",
    description: "24/7 AI assistant for instant help and recommendations",
    icon: MessageCircle,
    color: "from-indigo-500 to-purple-500",
    category: "shopping",
    },
    {
    title: "SMART Shopping Assistant",
    description: "AI-powered search and personalized recommendations",
    icon: Star,
    color: "from-yellow-500 to-orange-500",
    category: "shopping",
    special: true,
    },
];

/** Billing features */
const billingFeatures = [
    {
    title: "Smart Billing",
    description: "Lightning-fast checkout with intelligent payment options",
    icon: Receipt,
    color: "from-purple-500 to-pink-500",
    category: "billing",
    },
    {
    title: "View Past Bills",
    description: "Access your complete purchase history and receipts",
    icon: FileText,
    color: "from-gray-500 to-slate-500",
    category: "billing",
    },
    {
    title: "View Coupons at Store",
    description: "Browse available deals and discounts",
    icon: Ticket,
    color: "from-red-500 to-pink-500",
    category: "billing",
    },
    {
    title: "View Smart Coins",
    description: "Check your loyalty points and rewards balance",
    icon: Coins,
    color: "from-amber-500 to-yellow-500",
    category: "billing",
    },
];

/** Support features */
const supportFeatures = [
    {
    title: "Submit Feedback for Store",
    description: "Share your experience and suggestions",
    icon: Send,
    color: "from-cyan-500 to-blue-500",
    category: "support",
    },
    {
    title: "See Your Wishlisted Items",
    description: "View all your saved out-of-stock items in one place",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    category: "support",
    },
];

/** Insights features */
const insightsFeatures = [
    {
    title: "Visualize Your Spending Trends",
    description: "Smart analytics of your shopping patterns and budget",
    icon: BarChart,
    color: "from-violet-500 to-purple-500",
    category: "insights",
    },
];

/** All features combined */
const allFeatures = [
    ...profileFeatures,
    ...shoppingFeatures,
    ...billingFeatures,
    ...supportFeatures,
    ...insightsFeatures,
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/** Get category title by category key */
const getCategoryTitle = (category) => {
    const titles = {
    profile: "Profile Management",
    shopping: "Shopping Experience",
    billing: "Billing & Rewards",
    support: "Wishlist & Feedback",
    insights: "Smart Insights",
    };
    return titles[category];
};

/** Dashboard categories array */
const dashboardCategories = ["profile", "shopping", "billing", "support", "insights"];

/** Get theme styles */
const themeStyles = getThemeStyles(currentTheme);

// =============================================================================
// MAIN RENDER
// =============================================================================

return (
    <div className={`min-h-screen transition-all duration-500 ${themeStyles.bg}`}>
    {/* =============================================================================
        ANIMATED BACKGROUND ELEMENTS
        ============================================================================= */}
    <ThemeBackground currentTheme={currentTheme} />

    {/* =============================================================================
        HEADER SECTION - Matching Landing Page Style
        ============================================================================= */}
    <header className={`shadow-sm border-b transition-all duration-300 ${themeStyles.navBg} backdrop-blur-xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
            
            {/* Logo - Same as Landing Page */}
            <div className="flex items-center space-x-3">
            <Store className={`h-8 w-8 ${themeStyles.accent}`} />
            <span className={`text-2xl font-bold ${themeStyles.text}`}>
                StoreZen
                {getThemeEmoji(currentTheme) && (
                <span className="ml-2">{getThemeEmoji(currentTheme)}</span>
                )}
            </span>
            </div>

            {/* Right side - Welcome message and controls */}
            <div className="flex items-center space-x-6">
            
            {/* Welcome Message */}
            <div className="text-right hidden sm:block">
                <p className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                Welcome back,
                </p>
                <p className={`text-lg font-semibold ${themeStyles.text}`}>
                {customerName}
                </p>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="group flex items-center space-x-2 transition-all duration-300 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105 px-4 py-2 rounded-lg"
            >
                <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                <span className="font-medium">Logout</span>
            </button>
            
            </div>
        </div>
        </div>
    </header>

    {/* =============================================================================
        PRODUCTS VIEW - Detailed Product Browsing Interface
        ============================================================================= */}
    {showProducts && (
        <div className={`min-h-screen transition-all duration-500 ${themeStyles.bg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            
            {/* Back Button */}
            <button
            onClick={() => setShowProducts(false)}
            className={`mb-6 flex items-center space-x-2 transition-all duration-300 ${themeStyles.cardBg} border border-gray-200/20 hover:${themeStyles.hoverBg} text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2 rounded-lg hover:shadow-lg transform hover:scale-105`}
            >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
            </button>

            {/* Products Header */}
            <div className="text-center mb-6">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.text}`}>
                Available Products
                <Package className="inline-block ml-3 h-10 w-10" />
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                Browse our collection of quality products
            </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6 max-w-md mx-auto">
            <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')}`} />
                <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg ${themeStyles.cardBg} ${themeStyles.text} border-gray-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
            </div>
            {searchQuery && (
                <p className={`text-sm mt-2 text-center ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                Found {filteredProducts.length} products for "{searchQuery}"
                </p>
            )}
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
            <div className="mb-8">
                <h3 className={`text-lg font-semibold mb-4 text-center ${themeStyles.text}`}>
                Filter by Category
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                
                {/* All Products Button */}
                <button
                    onClick={() => handleCategoryChange("All")}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    selectedCategory === "All"
                        ? "bg-blue-500 text-white shadow-lg"
                        : `${themeStyles.cardBg} ${themeStyles.text} border border-gray-200/20 hover:${themeStyles.hoverBg}`
                    }`}
                >
                    All Products
                    {!loading && selectedCategory === "All" && (
                    <span className="ml-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                        {filteredProducts.length}
                    </span>
                    )}
                </button>

                {/* Category Buttons */}
                {categories.map((category) => (
                    <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                        selectedCategory === category
                        ? "bg-blue-500 text-white shadow-lg"
                        : `${themeStyles.cardBg} ${themeStyles.text} border border-gray-200/20 hover:${themeStyles.hoverBg}`
                    }`}
                    >
                    {category}
                    {!loading && selectedCategory === category && (
                        <span className="ml-2 bg-white text-blue-500 px-2 py-1 rounded-full text-xs">
                        {filteredProducts.length}
                        </span>
                    )}
                    </button>
                ))}
                
                </div>
            </div>
            )}

            {/* Loading State */}
            {loading && (
            <div className="flex justify-center items-center py-20">
                <div className="text-center">
                <Loader2 className={`h-12 w-12 animate-spin mx-auto mb-4 ${themeStyles.accent}`} />
                <p className={`text-lg ${themeStyles.text}`}>Loading products...</p>
                </div>
            </div>
            )}

            {/* Error State */}
            {error && (
            <div className={`max-w-md mx-auto text-center py-20`}>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
                <button
                onClick={() => fetchProducts(selectedCategory)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                Try Again
                </button>
            </div>
            )}

            {/* Products Grid */}
            {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                <Card
                    key={product.id}
                    className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${themeStyles.cardBg} border border-gray-200/20 hover:${themeStyles.hoverBg} hover:shadow-blue-500/15 hover:border-blue-300/30 ${!product.in_stock ? 'opacity-75 grayscale-50' : ''}`}
                >
                    <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <CardTitle className={`text-lg font-semibold ${themeStyles.text} line-clamp-2`}>
                        {product.name}
                        </CardTitle>
                        {product.in_stock ? (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            Available
                        </span>
                        ) : (
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                            OUT OF STOCK
                        </span>
                        )}
                    </div>
                    <div className="flex items-center justify-center">
                        <span className={`text-sm font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                        {product.category}
                        </span>
                    </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                    <div className="text-center mb-4">
                        <span className={`text-2xl font-bold ${themeStyles.text}`}>
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                        </span>
                    </div>
                    
                    {/* Add to Wishlist Button - ONLY for OUT OF STOCK items */}
                    {!product.in_stock && (
                        <div className="flex justify-center">
                            <button
                            onClick={(e) => {
                                e.stopPropagation();
                                
                                // Check if already in wishlist
                                if (wishlistProductStatus[product.id]) {
                                    showNotification('This item is already in your wishlist', 'warning');
                                    return;
                                }
                                
                                // Add to wishlist
                                addToWishlist(product);
                            }}
                            className={
                                wishlistProductStatus[product.id]
                                ? 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 cursor-not-allowed border border-green-200 dark:border-green-800'
                                : 'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 hover:bg-pink-200 dark:hover:bg-pink-900/50 border border-pink-200 dark:border-pink-800 hover:border-pink-300'
                            }
                            >
                            <Heart 
                                className={`w-4 h-4 ${wishlistProductStatus[product.id] ? 'fill-current' : ''}`} 
                            />
                            {wishlistProductStatus[product.id] ? '✅ Already in Wishlist' : 'Add to Wishlist'}
                            </button>
                        </div>
                    )}
                    </CardContent>
                </Card>
                ))}
            </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredProducts.length === 0 && (
            <div className={`max-w-md mx-auto text-center py-20`}>
                <Package className={`h-16 w-16 mx-auto mb-4 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')}`} />
                <h3 className={`text-xl font-semibold ${themeStyles.text} mb-2`}>
                {searchQuery ? 'No Products Found' : 'No Products Available'}
                </h3>
                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                {searchQuery 
                    ? `No products match "${searchQuery}". Try a different search term.`
                    : 'Check back later for new arrivals!'
                }
                </p>
                {searchQuery && (
                <button
                    onClick={() => {
                    setSearchQuery("");
                    setFilteredProducts(products);
                    }}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Clear Search
                </button>
                )}
            </div>
            )}
            
        </div>
        </div>
    )}

    {/* =============================================================================
        MAIN DASHBOARD CONTENT - Only show when not viewing products
        ============================================================================= */}
    {!showProducts && (
        <div>
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            {/* Page Title */}
            <div className="text-center mb-16">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.text}`}>
                Customer Dashboard
                {getThemeEmoji(currentTheme) && (
                <span className="ml-2">{getThemeEmoji(currentTheme)}</span>
                )}
            </h1>
            <p className={`text-xl max-w-3xl mx-auto ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                Your complete shopping experience with AI-powered features and smart analytics
            </p>
            </div>

            {/* Features by Category */}
            {dashboardCategories.map((category) => {
            const categoryFeatures = allFeatures.filter(
                (feature) => feature.category === category
            );
            if (categoryFeatures.length === 0) return null;

            return (
                <div key={category} className="mb-16">
                
                {/* Category Title */}
                <h2 className={`text-3xl font-bold mb-8 text-center ${themeStyles.text}`}>
                    {getCategoryTitle(category)}
                </h2>
                
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryFeatures.map((feature, index) => (
                    <Card
                        key={feature.title}
                        onClick={() => {
                        if (feature.title === "Your Profile Handle") {
                            // Check if user is authenticated before navigating
                            const token = localStorage.getItem('token');
                            const loggedInUser = localStorage.getItem('loggedInUser');
                            
                            if (token && loggedInUser) {
                                navigate('/profile');
                            } else {
                                // User not authenticated, redirect to login
                                navigate('/login');
                            }
                        } else if (feature.title === "View Products") {
                            fetchProducts();
                        }
                        }}
    className={`group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-500 cursor-pointer border rounded-lg relative overflow-visible ${
        feature.special
        ? `backdrop-blur-xl border-transparent ${themeStyles.cardBg} ${themeStyles.hoverBg} hover:shadow-blue-500/30 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40`
        : `${themeStyles.cardBg} border-gray-200/20 ${themeStyles.hoverBg} hover:shadow-blue-500/15`
    } hover:shadow-xl`}
    style={{
        boxShadow: feature.special 
        ? `0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        : undefined,
        background: feature.special 
        ? `linear-gradient(135deg, ${currentTheme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.6)'} 0%, ${currentTheme === 'light' ? 'rgba(249, 250, 251, 0.4)' : 'rgba(55, 65, 81, 0.4)'} 100%)`
        : undefined,
        '--hover-border': feature.special 
        ? 'linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)'
        : undefined
    }}
    onMouseEnter={(e) => {
        if (feature.special) {
            e.currentTarget.style.border = '2px solid transparent';
            e.currentTarget.style.backgroundImage = `linear-gradient(135deg, ${currentTheme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(31, 41, 55, 0.8)'} 0%, ${currentTheme === 'light' ? 'rgba(249, 250, 251, 0.6)' : 'rgba(55, 65, 81, 0.6)'} 100%), linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)`;
            e.currentTarget.style.backgroundOrigin = 'border-box';
            e.currentTarget.style.backgroundClip = 'content-box, border-box';
        }
    }}
    onMouseLeave={(e) => {
        if (feature.special) {
            e.currentTarget.style.border = '1px solid transparent';
            e.currentTarget.style.backgroundImage = `linear-gradient(135deg, ${currentTheme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.6)'} 0%, ${currentTheme === 'light' ? 'rgba(249, 250, 251, 0.4)' : 'rgba(55, 65, 81, 0.4)'} 100%)`;
            e.currentTarget.style.backgroundOrigin = 'padding-box';
            e.currentTarget.style.backgroundClip = 'padding-box';
        }
    }}
    >
        {/* AI Badge */}
        {feature.special && (
            <GradientBadge 
            variant="vibrant"
            className="absolute -top-3 -right-3 z-50 transform group-hover:scale-110 transition-all duration-300"
            >
            AI
            </GradientBadge>
        )}
        
        {/* Full Card Diamond Effects for AI Special Card */}
        {feature.special && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            {/* Large diamonds */}
            <div className="absolute top-4 left-4 w-4 h-4 bg-white/40 transform rotate-45 animate-pulse"></div>
            <div className="absolute top-6 right-8 w-3 h-3 bg-blue-300/60 transform rotate-45 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute bottom-8 left-6 w-3.5 h-3.5 bg-purple-300/50 transform rotate-45 animate-pulse" style={{animationDelay: '0.4s'}}></div>
            <div className="absolute bottom-4 right-4 w-2.5 h-2.5 bg-white/50 transform rotate-45 animate-bounce" style={{animationDelay: '0.6s'}}></div>
            <div className="absolute top-1/2 left-2 w-2 h-2 bg-blue-400/60 transform rotate-45 animate-pulse" style={{animationDelay: '0.8s'}}></div>
            <div className="absolute top-1/3 right-3 w-2 h-2 bg-purple-400/50 transform rotate-45 animate-bounce" style={{animationDelay: '1s'}}></div>
            
            {/* Medium diamonds */}
            <div className="absolute top-8 left-12 w-1.5 h-1.5 bg-yellow-300/40 transform rotate-45 animate-pulse" style={{animationDelay: '0.3s'}}></div>
            <div className="absolute bottom-12 right-12 w-1.5 h-1.5 bg-pink-300/50 transform rotate-45 animate-bounce" style={{animationDelay: '0.7s'}}></div>
            <div className="absolute top-2/3 left-8 w-1.5 h-1.5 bg-cyan-300/45 transform rotate-45 animate-pulse" style={{animationDelay: '0.9s'}}></div>
            
            {/* Small sparkles */}
            <div className="absolute top-12 right-6 w-1 h-1 bg-white/60 transform rotate-45 animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-6 left-10 w-1 h-1 bg-blue-200/70 transform rotate-45 animate-pulse" style={{animationDelay: '1.1s'}}></div>
            <div className="absolute top-16 left-3 w-1 h-1 bg-purple-200/60 transform rotate-45 animate-bounce" style={{animationDelay: '0.1s'}}></div>
            
            {/* Floating sparkles */}
            <div className="absolute top-3 right-16 w-1 h-1 bg-yellow-200/50 transform rotate-45 animate-pulse" style={{animationDelay: '1.2s'}}></div>
            <div className="absolute bottom-3 left-16 w-1 h-1 bg-pink-200/55 transform rotate-45 animate-bounce" style={{animationDelay: '0.4s'}}></div>
        </div>
        )}

        {/* Animated Bot Effects for Chatbot Feature */}
        {feature.title === "Chatbot Feature" && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
            {/* Bot emojis floating around */}
            <div className="absolute top-6 left-4 text-lg animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}>🤖</div>
            <div className="absolute top-12 right-6 text-sm animate-bounce" style={{animationDelay: '0.3s', animationDuration: '2.5s'}}>🤖</div>
            <div className="absolute bottom-8 left-8 text-base animate-bounce" style={{animationDelay: '0.6s', animationDuration: '2.2s'}}>🤖</div>
            <div className="absolute bottom-12 right-4 text-xs animate-bounce" style={{animationDelay: '0.9s', animationDuration: '2.8s'}}>🤖</div>
            <div className="absolute top-1/2 right-8 text-sm animate-bounce" style={{animationDelay: '1.2s', animationDuration: '2.3s'}}>🤖</div>
            <div className="absolute top-16 left-12 text-xs animate-bounce" style={{animationDelay: '1.5s', animationDuration: '2.6s'}}>🤖</div>
            
            {/* Chat bubble effects */}
            <div className="absolute top-8 left-16 text-xs animate-pulse" style={{animationDelay: '0.2s'}}>💬</div>
            <div className="absolute bottom-6 right-12 text-sm animate-pulse" style={{animationDelay: '0.8s'}}>💬</div>
            <div className="absolute top-20 right-16 text-xs animate-pulse" style={{animationDelay: '1.4s'}}>💬</div>
            
            {/* Small circuit-like dots */}
            <div className="absolute top-10 left-6 w-1.5 h-1.5 bg-indigo-400/60 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            <div className="absolute bottom-10 right-8 w-1 h-1 bg-purple-400/70 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-14 right-10 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-pulse" style={{animationDelay: '1.6s'}}></div>
        </div>
        )}
    
    <CardHeader className="text-center pb-4 relative">
        {feature.special && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"></div>
        )}
        <div
        className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg ${feature.special ? 'group-hover:shadow-yellow-400/40 ring-2 ring-yellow-400/30' : 'group-hover:shadow-blue-400/30'} transition-all duration-200 relative`}
        >
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {feature.special && (
        <div className="absolute inset-0 rounded-lg overflow-hidden">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-gradient-to-br from-white/60 to-transparent transform rotate-45 opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-white/40 to-transparent transform rotate-45 opacity-0 group-hover:opacity-100 animate-pulse" style={{animationDelay: '0.3s'}}></div>
        </div>
        )}
        <feature.icon className="h-8 w-8 text-white relative z-10" />
        </div>
        <CardTitle className={`text-xl font-semibold leading-tight ${themeStyles.text}`}>
        {feature.title}
        </CardTitle>
    </CardHeader>
    <CardContent className="text-center px-6 pb-6">
        <CardDescription className={`leading-relaxed mb-6 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
        {feature.description}
        </CardDescription>
        
        <div className="flex justify-center">
        <GradientButton
            variant={feature.special ? "primary" : "success"}
            className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transform transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 group relative overflow-hidden rounded-lg ${
            feature.special 
                ? "bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-blue-500/50 hover:shadow-2xl border-2 border-transparent hover:border-white/20" 
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-emerald-500/40 hover:shadow-xl border-2 border-transparent hover:border-emerald-300/30"
            } hover:animate-pulse`}
            onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            if (feature.special) {
                // Handle AI Assistant launch
            } else {
                // Handle View action
                if (feature.title === "View Products") {
                fetchProducts();
                } else if (feature.title === "View Coupons at Store") {
                fetchCoupons();
                } else if (feature.title === "View Smart Coins") {
                showSmartCoinsView();
                } else if (feature.title === "Submit Feedback for Store") {
                showFeedbackView();
                } else if (feature.title === "See Your Wishlisted Items") {
                showWishlistView();
                } else if (feature.title === "Your Profile Handle") {
                // Check if user is authenticated before navigating
                const token = localStorage.getItem('token');
                const loggedInUser = localStorage.getItem('loggedInUser');
                
                if (token && loggedInUser) {
                    navigate('/profile');
                } else {
                    // User not authenticated, redirect to login
                    navigate('/login');
                }
                }
            }
            }}
        >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
            
            {/* Button ripple effect */}
            <div className="absolute inset-0 rounded-lg bg-white/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            {/* Floating particles for special buttons */}
            {feature.special && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-1 left-2 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{animationDelay: '0.1s'}}></div>
                <div className="absolute top-2 right-3 w-1 h-1 bg-white/50 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute bottom-1 left-4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute bottom-2 right-1 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
            </div>
            )}
            
            {/* Button content */}
            <span className="relative z-10 flex items-center gap-2">
            {feature.special ? (
                <>
                <Star className="h-4 w-4" />
                Launch AI Assistant
                </>
            ) : feature.title === "View Products" ? (
                <>
                <ShoppingCart className="h-4 w-4" />
                Browse Products
                </>
            ) : feature.title === "Your Profile Handle" ? (
                <>
                <User className="h-4 w-4" />
                View Profile
                </>
            ) : feature.title === "Chatbot Feature" ? (
                <>
                <MessageCircle className="h-4 w-4" />
                Chat Now
                </>
            ) : feature.title === "Smart Billing" ? (
                <>
                <Receipt className="h-4 w-4" />
                Quick Pay
                </>
            ) : feature.title === "View Past Bills" ? (
                <>
                <FileText className="h-4 w-4" />
                View Bills
                </>
            ) : feature.title === "View Coupons at Store" ? (
                <>
                <Ticket className="h-4 w-4" />
                See Coupons
                </>
            ) : feature.title === "View Smart Coins" ? (
                <>
                <Coins className="h-4 w-4" />
                Check Balance
                </>
            ) : feature.title === "Submit Feedback for Store" ? (
                <>
                <Send className="h-4 w-4" />
                Send Feedback
                </>
            ) : feature.title === "Wishlist Unavailable Items" ? (
                <>
                <Heart className="h-4 w-4" />
                Add to Wishlist
                </>
            ) : feature.title === "Visualize Your Spending Trends" ? (
                <>
                <BarChart className="h-4 w-4" />
                View Analytics
                </>
            ) : (
                <>
                <Package className="h-4 w-4" />
                View
                </>
            )}
            </span>
        </GradientButton>
        </div>
    </CardContent>
    </Card>
))}
</div>
</div>
);
})}

            {/* Stats Section */}
            <div className={`mt-20 rounded-lg shadow-sm p-8 md:p-12 ${themeStyles.cardBg}`}>
            <h2 className={`text-3xl font-bold text-center mb-12 ${themeStyles.text}`}>
                Your StoreZen Experience
                {getThemeEmoji(currentTheme) && (
                <span className="ml-2">{getThemeEmoji(currentTheme)}</span>
                )}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                
                {/* AI Support Stat */}
                <div className="space-y-2">
                <div className="text-4xl font-bold text-purple-600">24/7</div>
                <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                    AI Support
                </div>
                </div>
                
                {/* Products Available Stat */}
                <div className="space-y-2">
                <div className="text-4xl font-bold text-blue-600">1M+</div>
                <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                    Products Available
                </div>
                </div>
                
                {/* Smart Billing Stat */}
                <div className="space-y-2">
                <div className="text-4xl font-bold text-green-600">Smart</div>
                <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                    Billing System
                </div>
                </div>
                
                {/* AI Recommendations Stat */}
                <div className="space-y-2">
                <div className="text-4xl font-bold text-orange-600">AI</div>
                <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                    Recommendations
                </div>
                </div>
                
            </div>
            </div>
            
        </div>
        </div>
    )}

    {/* =============================================================================
        COUPON MODAL - Perfect UI/UX in Modal
        ============================================================================= */}
    {showCouponModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`${themeStyles.cardBg} rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden`}>
            
            {/* Modal Header */}
            <div className={`p-6 border-b ${themeStyles.border} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
                <Ticket className="w-8 h-8 text-purple-600" />
                <h2 className={`text-2xl font-bold ${themeStyles.text}`}>Store Coupons & Offers</h2>
            </div>
            <button
                onClick={() => setShowCouponModal(false)}
                className={`p-2 rounded-lg ${themeStyles.hoverBg} hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
            >
                <ArrowLeft className="w-6 h-6" />
            </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            
            {/* Loading State */}
            {couponsLoading && (
                <div className="flex justify-center items-center py-20">
                <div className="text-center">
                    <Loader2 className={`h-12 w-12 animate-spin mx-auto mb-4 ${themeStyles.accent}`} />
                    <p className={`text-lg ${themeStyles.text}`}>Loading amazing deals...</p>
                </div>
                </div>
            )}

            {/* Error State */}
            {couponsError && (
                <div className="text-center py-20">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-red-600 mb-2">Oops! Something went wrong</h3>
                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} mb-6`}>{couponsError}</p>
                <button
                    onClick={() => fetchCoupons()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                    Try Again
                </button>
                </div>
            )}

            {/* Empty State */}
            {!couponsLoading && !couponsError && coupons.length === 0 && (
                <div className="text-center py-20">
                <Ticket className={`h-16 w-16 mx-auto mb-4 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')}`} />
                <h3 className={`text-xl font-semibold ${themeStyles.text} mb-2`}>No Coupons Available</h3>
                <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                    Check back later for exciting new offers!
                </p>
                </div>
            )}

            {/* Coupons Grid - Perfect Square Cards */}
            {!couponsLoading && !couponsError && coupons.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {coupons.map((coupon) => {
                    const status = getCouponStatus(coupon);
                    const validUntil = new Date(coupon.valid_until);
                    const today = new Date();
                    const daysRemaining = Math.ceil((validUntil - today) / (1000 * 60 * 60 * 24));

                    return (
                    <div
                        key={coupon._id}
                        className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative`}
                    >
                        {/* Status Badge */}
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}>
                        {status.label}
                        </div>

                        {/* Coupon Code */}
                        <div className="mb-4 text-center">
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg">
                            <div className="text-xl font-bold tracking-wider">{coupon.coupon_code}</div>
                        </div>
                        </div>

                        {/* Discount Value */}
                        <div className="mb-4 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                            {coupon.type === '%' ? `${coupon.value}%` : `₹${coupon.value}`}
                        </div>
                        <div className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
                            {coupon.type === '%' ? 'Percentage Off' : 'Flat Discount'}
                        </div>
                        </div>

                        {/* Coupon Details */}
                        <div className="space-y-2 mb-4 text-sm">
                        {coupon.type === '%' && (
                            <div className="flex justify-between">
                            <span className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Max Discount:</span>
                            <span className={`font-semibold ${themeStyles.text}`}>₹{coupon.max_discount}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Min Purchase:</span>
                            <span className={`font-semibold ${themeStyles.text}`}>₹{coupon.min_purchase}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Valid Until:</span>
                            <span className={`font-semibold ${themeStyles.text}`}>
                            {validUntil.toLocaleDateString()}
                            </span>
                        </div>
                        
                        {/* Days Remaining Warning */}
                        {status.status === 'active' && daysRemaining <= 7 && (
                            <div className="text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                                {daysRemaining === 0 ? 'Expires Today!' : daysRemaining === 1 ? 'Expires Tomorrow!' : `${daysRemaining} days left!`}
                            </span>
                            </div>
                        )}
                        </div>

                        {/* Categories - Fixed Visibility */}
                        <div className="mb-4">
                        <div className={`text-xs font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} mb-2`}>
                            Applicable Categories:
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {coupon.applicable_categories.slice(0, 3).map((category) => (
                            <span 
                                key={category}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-full font-medium border border-blue-200 dark:border-blue-700"
                            >
                                {category}
                            </span>
                            ))}
                            {coupon.applicable_categories.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full font-medium border border-gray-200 dark:border-gray-600">
                                +{coupon.applicable_categories.length - 3} more
                            </span>
                            )}
                        </div>
                        </div>

                        {/* Use Coupon Button - No Emojis */}
                        <button
                        onClick={() => {
                            if (status.status === 'active') {
                                copyCouponCode(coupon.coupon_code);
                            }
                        }}
                        disabled={status.status === 'expired' || status.status === 'upcoming'}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                            status.status === 'expired'
                            ? 'bg-gray-400 cursor-not-allowed'
                            : status.status === 'upcoming'
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-green-500/50 transform hover:scale-105'
                        }`}
                        >
                        {status.status === 'expired' 
                            ? 'Expired' 
                            : status.status === 'upcoming'
                            ? 'Coming Soon'
                            : 'Use Coupon'
                        }
                        </button>
                    </div>
                    );
                })}
                </div>
            )}

            </div>
        </div>
        </div>
    )}

    {/* =============================================================================
        COPY SUCCESS MODAL - Small Modal Message
        ============================================================================= */}
    {showCopyMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
        <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl transform animate-bounce pointer-events-auto">
            <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-4 border-r-2 border-b-2 border-green-500 transform rotate-45"></div>
            </div>
            <span className="font-medium">{copyMessage}</span>
            </div>
        </div>
        </div>
    )}

    {/* =============================================================================
        SMART COINS MODAL - Professional Design
        ============================================================================= */}
    {showSmartCoinsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300 ${
            currentTheme !== 'light' 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
        }`}>
            
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-md ${
            currentTheme !== 'light' 
                ? 'border-gray-700/50 bg-gray-900/80' 
                : 'border-gray-200/50 bg-white/80'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg">
                    <Coins className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className={`text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent`}>
                    Smart Coins
                    </h2>
                    <p className={`text-sm ${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your Digital Rewards
                    </p>
                </div>
                </div>
                
                <button
                onClick={() => setShowSmartCoinsModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    currentTheme !== 'light' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                >
                <X className="h-6 w-6" />
                </button>
            </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
            {/* Loading State */}
            {smartCoinsLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent"></div>
                <p className={`text-lg font-medium ${currentTheme !== 'light' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Loading your Smart Coins...
                </p>
                </div>
            )}
            
            {/* Error State */}
            {smartCoinsError && (
                <div className="text-center py-12">
                <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 w-fit mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-red-500 font-medium mb-2">Error Loading Smart Coins</p>
                <p className={`${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                    {smartCoinsError}
                </p>
                <button
                    onClick={fetchSmartCoins}
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-yellow-500/50"
                >
                    Retry
                </button>
                </div>
            )}
            
            {/* Smart Coins Data */}
            {!smartCoinsLoading && !smartCoinsError && smartCoinsData && (
                <div className="space-y-6">
                
                {/* Balance Card */}
                <div className={`rounded-xl p-6 border shadow-lg ${
                    currentTheme !== 'light' 
                    ? 'bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-yellow-700/30' 
                    : 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50'
                }`}>
                    <div className="text-center">
                    <h3 className={`text-lg font-medium mb-2 ${currentTheme !== 'light' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Current Balance
                    </h3>
                    <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent mb-2">
                        {smartCoinsData.balance || 0}
                    </div>
                    <p className={`text-sm ${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Smart Coins Available
                    </p>
                    </div>
                </div>
                
                {/* Transaction History */}
                <div>
                    <h3 className={`text-xl font-semibold mb-4 ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                    Recent Transactions
                    </h3>
                    
                    {smartCoinsData.transactions && smartCoinsData.transactions.length > 0 ? (
                    <div className="space-y-3">
                        {smartCoinsData.transactions
                        .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate))
                        .slice(0, 10) // Show last 10 transactions
                        .map((transaction, index) => {
                            const isEarned = transaction.type === 'earned';
                            const isExpiring = transaction.expiryDate && 
                            new Date(transaction.expiryDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
                            
                            return (
                            <div key={index} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                                currentTheme !== 'light' 
                                ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-800/70' 
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}>
                                <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${
                                    isEarned 
                                        ? 'bg-green-500/20 text-green-500' 
                                        : 'bg-red-500/20 text-red-500'
                                    }`}>
                                    {isEarned ? (
                                        <Plus className="h-4 w-4" />
                                    ) : (
                                        <Minus className="h-4 w-4" />
                                    )}
                                    </div>
                                    
                                    <div>
                                    <p className={`font-medium ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                                        {transaction.description || `Smart Coins ${isEarned ? 'Earned' : 'Spent'}`}
                                    </p>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <span className={currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'}>
                                        {new Date(transaction.earnedDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                        </span>
                                        {isEarned && transaction.expiryDate && (
                                        <>
                                            <span className={currentTheme !== 'light' ? 'text-gray-600' : 'text-gray-400'}>•</span>
                                            <span className={`${
                                            isExpiring 
                                                ? 'text-orange-500 font-medium' 
                                                : currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            Expires: {new Date(transaction.expiryDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                            </span>
                                            {isExpiring && (
                                            <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-500 rounded-full">
                                                Expiring Soon
                                            </span>
                                            )}
                                        </>
                                        )}
                                    </div>
                                    </div>
                                </div>
                                
                                <div className="text-right">
                                    <span className={`text-lg font-bold ${
                                    isEarned ? 'text-green-500' : 'text-red-500'
                                    }`}>
                                    {isEarned ? '+' : '-'}{Math.abs(transaction.amount)}
                                    </span>
                                </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                    ) : (
                    <div className={`text-center py-8 rounded-lg border-2 border-dashed ${
                        currentTheme !== 'light' 
                        ? 'border-gray-700 text-gray-400' 
                        : 'border-gray-300 text-gray-600'
                    }`}>
                        <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p className="font-medium mb-1">No transactions yet</p>
                        <p className="text-sm">Start earning Smart Coins by shopping and engaging with stores!</p>
                    </div>
                    )}
                </div>
                </div>
            )}
            
            </div>
        </div>
        </div>
    )}

    {/* =============================================================================
        FEEDBACK MODAL - Professional Star Rating & Category Selection
        ============================================================================= */}
    {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl transition-all duration-300 ${
            currentTheme !== 'light' 
            ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50' 
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200/50'
        }`}>
            
            {/* Modal Header */}
            <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-md ${
            currentTheme !== 'light' 
                ? 'border-gray-700/50 bg-gray-900/80' 
                : 'border-gray-200/50 bg-white/80'
            }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg">
                    <Send className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h2 className={`text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent`}>
                    Store Feedback
                    </h2>
                    <p className={`text-sm ${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Help us improve your experience
                    </p>
                </div>
                </div>
                
                <button
                onClick={() => setShowFeedbackModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                    currentTheme !== 'light' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
                }`}
                >
                <X className="h-6 w-6" />
                </button>
            </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
            
            {/* Success State */}
            {feedbackSuccess && (
                <div className="text-center py-8 space-y-4">
                <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 w-fit mx-auto">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-5 border-r-2 border-b-2 border-white transform rotate-45"></div>
                    </div>
                </div>
                <h3 className={`text-xl font-bold ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                    Thank You!
                </h3>
                <p className={`${currentTheme !== 'light' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your feedback has been submitted successfully.
                </p>
                </div>
            )}
            
            {/* Feedback Form */}
            {!feedbackSuccess && (
                <div className="space-y-6">
                
                {/* Star Rating */}
                <div>
                    <h3 className={`text-lg font-semibold mb-4 ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                    How would you rate your experience?
                    </h3>
                    <div className="flex justify-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                        key={star}
                        onClick={() => handleStarRating(star)}
                        className={`transition-all duration-200 hover:scale-125 ${
                            star <= feedbackRating 
                            ? 'text-yellow-400 hover:text-yellow-500' 
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                        >
                        <Star className={`h-8 w-8 ${star <= feedbackRating ? 'fill-current' : ''}`} />
                        </button>
                    ))}
                    </div>
                    {feedbackRating > 0 && (
                    <p className={`text-center mt-2 text-sm ${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {feedbackRating === 5 ? 'Excellent! We\'re glad you love us!' :
                        feedbackRating === 4 ? 'Great! What can we improve?' :
                        feedbackRating === 3 ? 'Good! Help us do better.' :
                        feedbackRating === 2 ? 'We can do better. What went wrong?' :
                        'We\'re sorry! Please tell us what happened.'}
                    </p>
                    )}
                </div>
                
                {/* Category Selection (Only for ratings below 5) */}
                {feedbackRating > 0 && feedbackRating < 5 && (
                    <div>
                    <h3 className={`text-lg font-semibold mb-4 ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                        What areas need improvement? (Select all that apply)
                    </h3>
                    <div className="space-y-3">
                        {getFeedbackCategories(feedbackRating).map((category) => {
                        const isSelected = feedbackCategories.some(cat => cat.category === category.key);
                        return (
                            <button
                            key={category.key}
                            onClick={() => handleCategoryToggle(category.key)}
                            className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                                isSelected 
                                ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400' 
                                : `border-gray-200 dark:border-gray-700 ${currentTheme !== 'light' ? 'text-gray-300 hover:border-gray-600' : 'text-gray-700 hover:border-gray-300'} hover:bg-gray-50 dark:hover:bg-gray-800`
                            }`}
                            >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{category.label}</span>
                                {isSelected && (
                                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-3 border-r-2 border-b-2 border-white transform rotate-45"></div>
                                </div>
                                )}
                            </div>
                            </button>
                        );
                        })}
                    </div>
                    </div>
                )}
                
                {/* Optional Text Feedback */}
                {feedbackRating > 0 && (
                    <div>
                    <h3 className={`text-lg font-semibold mb-4 ${currentTheme !== 'light' ? 'text-white' : 'text-gray-900'}`}>
                        Additional Comments (Optional)
                    </h3>
                    <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Tell us more about your experience..."
                        maxLength={1000}
                        rows={4}
                        className={`w-full p-3 border rounded-lg resize-none ${
                        currentTheme !== 'light' 
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        } focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    />
                    <div className={`text-right text-xs mt-1 ${currentTheme !== 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {feedbackText.length}/1000 characters
                    </div>
                    </div>
                )}
                
                {/* Error Message */}
                {feedbackError && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                    <p className="text-red-600 dark:text-red-400 text-sm">{feedbackError}</p>
                    </div>
                )}
                
                {/* Submit Button */}
                {feedbackRating > 0 && (
                    <button
                    onClick={submitFeedback}
                    disabled={feedbackLoading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                        feedbackLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/50 transform hover:scale-105'
                    }`}
                    >
                    {feedbackLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                        </div>
                    ) : (
                        'Submit Feedback'
                    )}
                    </button>
                )}
                </div>
            )}
            
            </div>
        </div>
        </div>
    )}
    
    {/* Wishlist Modal */}
    {showWishlistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className={`w-full max-w-4xl max-h-[80vh] ${themeStyles.cardBg} rounded-lg shadow-xl border ${themeStyles.border} overflow-hidden`}>
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b ${themeStyles.border} flex justify-between items-center`}>
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900/30">
                <Heart className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                <h2 className={`text-2xl font-bold ${themeStyles.text}`}>Your Wishlist</h2>
                <p className={`text-sm ${themeStyles.textSecondary}`}>
                    {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved
                </p>
                </div>
            </div>
            <button
                onClick={() => setShowWishlistModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${themeStyles.text}`}
            >
                <X className="w-6 h-6" />
            </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            {wishlistLoading ? (
                <div className="flex items-center justify-center py-20">
                <Loader2 className={`w-8 h-8 animate-spin ${themeStyles.text}`} />
                <span className={`ml-3 ${themeStyles.textSecondary}`}>Loading your wishlist...</span>
                </div>
            ) : wishlistItems.length === 0 ? (
                <div className="text-center py-20">
                <Heart className={`w-16 h-16 mx-auto mb-4 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')}`} />
                <h3 className={`text-xl font-semibold ${themeStyles.text} mb-2`}>Your wishlist is empty</h3>
                <p className={`${themeStyles.textSecondary} mb-6`}>
                    Start adding products you love to your wishlist!
                </p>
                <button
                    onClick={() => {
                    setShowWishlistModal(false);
                    fetchProducts();
                    }}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                    Browse Products
                </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wishlistItems.map((item) => (
                    <div
                    key={item._id}
                    className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-lg p-4 hover:shadow-lg transition-all duration-300 ${!item.isInStock ? 'opacity-75 grayscale-50' : ''}`}
                    >
                    {/* Product Info */}
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold ${themeStyles.text} line-clamp-2`}>{item.productName}</h3>
                        {item.isInStock ? (
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            Available
                            </span>
                        ) : (
                            <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-2 py-1 rounded-full">
                            OUT OF STOCK
                            </span>
                        )}
                        </div>
                        
                        <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 ${themeStyles.textSecondary}`}>
                            {item.productCategory}
                        </span>
                        <span className={`text-lg font-bold ${themeStyles.text}`}>
                            ₹{parseFloat(item.productPrice).toLocaleString('en-IN')}
                        </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                        onClick={() => removeFromWishlist(item.productId)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors border border-red-200 dark:border-red-800"
                        >
                        <Heart className="w-4 h-4 fill-current" />
                        Remove
                        </button>
                        
                        {item.isInStock && (
                        <button
                            onClick={() => {
                            showNotification('Add to Cart feature coming soon!', 'info');
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </button>
                        )}
                    </div>
                    
                    {/* Added date */}
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className={`text-xs ${themeStyles.textSecondary}`}>
                        Added {new Date(item.addedAt).toLocaleDateString()}
                        </p>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>

            {/* Modal Footer */}
            {wishlistItems.length > 0 && (
            <div className={`px-6 py-4 border-t ${themeStyles.border} flex justify-between items-center`}>
                <button
                onClick={() => setShowConfirmClear(true)}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                Clear All
                </button>
                
                <button
                onClick={() => setShowWishlistModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                Close
                </button>
            </div>
            )}
        </div>
        </div>
    )}
    
    {/* =============================================================================
        NOTIFICATION MODAL
        ============================================================================= */}
    {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
        <div className={`p-4 rounded-lg shadow-lg border-l-4 min-w-72 max-w-sm transition-all duration-300 ${
            notification.type === 'success' 
            ? 'bg-green-50 border-green-500 text-green-700' 
            : notification.type === 'error'
            ? 'bg-red-50 border-red-500 text-red-700'
            : 'bg-yellow-50 border-yellow-500 text-yellow-700'
        }`}>
            <div className="flex justify-between items-start">
            <div className="flex items-center">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                {notification.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
                {notification.type === 'warning' && <AlertCircle className="h-5 w-5 mr-2" />}
                <p className="font-medium">{notification.message}</p>
            </div>
            <button 
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
                <X className="h-4 w-4" />
            </button>
            </div>
        </div>
        </div>
    )}
    
    {/* =============================================================================
        CONFIRMATION MODAL FOR CLEAR WISHLIST
        ============================================================================= */}
    {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm mx-4">
            <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Clear Wishlist
            </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to clear your entire wishlist? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
            <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button
                onClick={handleClearWishlist}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
                Clear All
            </button>
            </div>
        </div>
        </div>
    )}
    
    </div>
);
};

// =============================================================================
// EXPORT
// =============================================================================

export default Customer;