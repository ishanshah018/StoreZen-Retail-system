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
    Send,Store,LogOut,ArrowLeft,Loader2,AlertCircle,Package,Search
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

// =============================================================================
// LIFECYCLE EFFECTS
// =============================================================================

/** Load customer name from localStorage on mount */
useEffect(() => {
    const savedCustomerName = localStorage.getItem('customerName') || "Guest";
    setCustomerName(savedCustomerName);
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
    console.error('Error fetching categories:', error);
    setCategories(['Electronics', 'Fashion', 'Home & Garden']); // Fallback
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
    console.error('Error fetching products:', err);
    } finally {
    setLoading(false);
    }
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
    title: "Wishlist Unavailable Items",
    description: "Get notified when out-of-stock items become available",
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
    support: "Support & Services",
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
                    className={`group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${themeStyles.cardBg} border border-gray-200/20 hover:${themeStyles.hoverBg} hover:shadow-blue-500/15 hover:border-blue-300/30`}
                >
                    <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                        <CardTitle className={`text-lg font-semibold ${themeStyles.text} line-clamp-2`}>
                        {product.name}
                        </CardTitle>
                        {product.in_stock && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            Available
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
                    <div className="text-center">
                        <span className={`text-2xl font-bold ${themeStyles.text}`}>
                        ₹{parseFloat(product.price).toLocaleString('en-IN')}
                        </span>
                    </div>
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
                            navigate('/profile');
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
        <GradientButton
            variant={feature.special ? "primary" : "success"}
            className="px-6 py-2 hover:scale-105 transform"
            onClick={() => {
            if (feature.special) {
                // Handle AI Assistant launch
                console.log("Launching AI Assistant");
            } else {
                // Handle Get Started
                console.log("Getting started with", feature.title);
            }
            }}
        >
            {feature.special ? "Launch AI Assistant" : "Get Started"}
        </GradientButton>
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
    
    </div>
);
};

// =============================================================================
// EXPORT
// =============================================================================

export default Customer;