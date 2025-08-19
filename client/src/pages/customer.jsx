import React, { useState, useEffect, useRef } from "react";
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
    User,ShoppingCart,Receipt,FileText,Ticket,Coins,BarChart,Star,Heart, 
    Send,Store,LogOut,ArrowLeft,Loader2,AlertCircle,Package,Search,X,Plus,Minus,CheckCircle,XCircle,
    CreditCard,Smartphone,Tag,Check,IndianRupee
} from "lucide-react";

// Chart.js components
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Utilities and API
import { API_CONFIG, buildApiUrl } from '../lib/apiConfig';

// Smart Shopping Assistant
import SmartShoppingAssistant from '../components/SmartShoppingAssistant';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// =============================================================================
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

/** Clear the trie */
clear() {
    this.root = new TrieNode();
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

// Ref to track if welcome message has been spoken
const hasSpokenWelcome = useRef(false);

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

// Past Bills modal states
const [showPastBillsModal, setShowPastBillsModal] = useState(false); // Past Bills modal toggle
const [pastBills, setPastBills] = useState([]); // User's past bills
const [pastBillsLoading, setPastBillsLoading] = useState(false); // Past bills loading state
const [pastBillsError, setPastBillsError] = useState(''); // Past bills error message
const [billFilter, setBillFilter] = useState({
    filterType: 'all',
    dateFrom: '',
    dateTo: '',
    month: '',
    year: ''
}); // Bill filtering options
const [currentPage, setCurrentPage] = useState(1); // Pagination
const [expandedBill, setExpandedBill] = useState(null); // Currently expanded bill for details
const [feedbackError, setFeedbackError] = useState(''); // Feedback error message
const [feedbackSuccess, setFeedbackSuccess] = useState(false); // Feedback success state

// Smart Billing states
const [showSmartBillingModal, setShowSmartBillingModal] = useState(false); // Smart Billing modal toggle
const [billingStep, setBillingStep] = useState('search'); // Current billing step: search, cart, payment, preview, success
const [billingProducts, setBillingProducts] = useState([]); // Products available for billing
const [searchResults, setSearchResults] = useState([]); // Product search results
const [billingSearchQuery, setBillingSearchQuery] = useState(''); // Product search query
const [billingTrie] = useState(new Trie()); // Search index for billing
const [cart, setCart] = useState([]); // Shopping cart items
const [cartTotal, setCartTotal] = useState(0); // Cart subtotal
const [appliedCoupon, setAppliedCoupon] = useState(null); // Applied coupon
const [couponDiscount, setCouponDiscount] = useState(0); // Coupon discount amount
const [manualCouponCode, setManualCouponCode] = useState(''); // Manual coupon code input
const [couponError, setCouponError] = useState(''); // Specific coupon error message
const [smartCoinsBalance, setSmartCoinsBalance] = useState(0); // User's smart coins balance
const [smartCoinsToUse, setSmartCoinsToUse] = useState(0); // Smart coins to use for payment
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(''); // Selected payment method
const [billingLoading, setBillingLoading] = useState(false); // Billing operation loading state
const [billingError, setBillingError] = useState(''); // Billing error message
const [generatedBill, setGeneratedBill] = useState(null); // Generated bill data
const [showPaymentSuccess, setShowPaymentSuccess] = useState(false); // Payment success animation

// Analytics modal states
const [showAnalyticsModal, setShowAnalyticsModal] = useState(false); // Analytics modal toggle

// Smart Shopping Assistant modal toggle
const [showSmartShoppingAssistant, setShowSmartShoppingAssistant] = useState(false);
const [analyticsData, setAnalyticsData] = useState(null); // Analytics data
const [analyticsLoading, setAnalyticsLoading] = useState(false); // Analytics loading state
const [analyticsError, setAnalyticsError] = useState(''); // Analytics error message

    // Time range filter states
    const [totalSpentTimeRange, setTotalSpentTimeRange] = useState('tillnow');
    const [totalSpentCustomStart, setTotalSpentCustomStart] = useState('');
    const [totalSpentCustomEnd, setTotalSpentCustomEnd] = useState('');
    
    const [graphYear, setGraphYear] = useState(new Date().getFullYear());// =============================================================================
// LIFECYCLE EFFECTS
// =============================================================================

/** Load customer name from localStorage on mount */
useEffect(() => {
    const savedCustomerName = localStorage.getItem('customerName') || "Guest";
    setCustomerName(savedCustomerName);
    
    // Load categories on initial mount (but not products to avoid changing view)
    fetchCategories();
    
    // Greet the user by name when they login/enter the page (only once)
    if (savedCustomerName && savedCustomerName !== "Guest" && !hasSpokenWelcome.current) {
        hasSpokenWelcome.current = true;
        // Small delay to ensure page is loaded
        setTimeout(() => {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(`Hello ${savedCustomerName}`);
                utterance.rate = 0.9;
                utterance.pitch = 1;
                utterance.volume = 1;
                window.speechSynthesis.speak(utterance);
            }
        }, 500);
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

/** Fetch products silently without changing view (for Smart Billing) */
const fetchProductsSilently = async () => {
    if (products.length > 0) return; // Don't fetch if already loaded
    
    setLoading(true);
    try {
        const response = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.products));
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
        
        // Build search trie for efficient searching
        trie.buildTrie(data);
    } catch (err) {
        console.error('Error loading products for Smart Billing:', err);
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
// PAST BILLS FUNCTIONS - Professional Implementation with Filtering
// =============================================================================

/**
 * Fetch customer's past bills with advanced filtering
 * Supports various filter types including date ranges, months, years
 */
const fetchPastBills = async (resetPage = false) => {
    try {
        setPastBillsLoading(true);
        setPastBillsError('');

        // Get current user ID from localStorage (assuming it's stored there during login)
        const userId = localStorage.getItem('userId') || localStorage.getItem('customerId');
        
        if (!userId) {
            setPastBillsError('User not authenticated. Please login again.');
            return;
        }

        // Build query parameters
        const queryParams = new URLSearchParams({
            page: resetPage ? 1 : currentPage,
            limit: 10,
            filterType: billFilter.filterType,
            ...(billFilter.dateFrom && { dateFrom: billFilter.dateFrom }),
            ...(billFilter.dateTo && { dateTo: billFilter.dateTo }),
            ...(billFilter.month && { month: billFilter.month }),
            ...(billFilter.year && { year: billFilter.year })
        });

        // Make API call to fetch bills
        const response = await fetch(
            buildApiUrl('node', `${API_CONFIG.endpoints.node.billing.billHistory}/${userId}?${queryParams}`)
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // If resetting page, replace bills; otherwise append for pagination
            if (resetPage || currentPage === 1) {
                setPastBills(result.bills);
                setCurrentPage(1);
            } else {
                setPastBills(prev => [...prev, ...result.bills]);
            }
            
        } else {
            setPastBillsError(result.message || 'Failed to fetch past bills');
        }

    } catch (error) {
        console.error('Error fetching past bills:', error);
        setPastBillsError('Failed to load your past bills. Please check your connection and try again.');
    } finally {
        setPastBillsLoading(false);
    }
};

/**
 * Apply filter to past bills and refresh data
 */
const applyBillFilter = (newFilter) => {
    setBillFilter(newFilter);
    setCurrentPage(1);
    fetchPastBills(true); // Reset page when applying new filter
};

/**
 * Load more bills for pagination - currently not implemented in UI
 * Can be used for infinite scroll or load more button functionality
 */
// const loadMoreBills = () => {
//     setCurrentPage(prev => prev + 1);
//     fetchPastBills(false);
// };

/**
 * Show Past Bills modal and fetch initial data
 */
const showPastBillsView = () => {
    setShowPastBillsModal(true);
    setExpandedBill(null);
    setBillFilter({ filterType: 'all', dateFrom: '', dateTo: '', month: '', year: '' });
    setCurrentPage(1);
    fetchPastBills(true);
};

/**
 * Toggle bill expansion to show/hide detailed view
 */
/**
 * Format date for display
 */
const formatBillDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get filter display text
 */
const getFilterDisplayText = () => {
    switch (billFilter.filterType) {
        case 'lastMonth': return 'Last Month';
        case 'lastYear': return 'Last Year';
        case 'thisMonth': return 'This Month';
        case 'thisYear': return 'This Year';
        case 'custom': return 'Custom Date Range';
        case 'specificMonth': return `${billFilter.month}/${billFilter.year}`;
        case 'specificYear': return billFilter.year;
        default: return 'All Time';
    }
};

// =============================================================================
// SMART BILLING FUNCTIONS
// =============================================================================

/** Show Smart Billing modal and initialize */
const showSmartBillingView = (initialStep = 'search') => {
    // If products aren't loaded yet, load them silently
    if (products.length === 0) {
        fetchProductsSilently();
    }
    
    setShowSmartBillingModal(true);
    setBillingStep(initialStep === 2 ? 'cart' : 'search');
    if (initialStep !== 2) {
        setCart([]);
        setCartTotal(0);
    }
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setSmartCoinsToUse(0);
    setSelectedPaymentMethod('');
    setBillingError('');
    setGeneratedBill(null);
    setManualCouponCode('');
    setCouponError('');
    fetchBillingProducts();
    fetchSmartCoinsBalance();
    fetchAvailableCoupons();
};

/** Fetch products for billing */
const fetchBillingProducts = async () => {
    try {
        setBillingLoading(true);
        const response = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.customerProducts));
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const productsData = await response.json();
        setBillingProducts(productsData);
        
        // Build Trie index for search
        billingTrie.clear();
        productsData.forEach(product => {
            const words = [
                product.name,
                product.category,
                product.description || ''
            ].join(' ').toLowerCase().split(/\s+/);
            
            words.forEach(word => {
                if (word.length > 0) {
                    billingTrie.insert(word, product);
                }
            });
        });
        
        setSearchResults(productsData); // Show all products initially
        
    } catch (error) {
        setBillingError('Failed to load products for billing');
        console.error('Error fetching billing products:', error);
    } finally {
        setBillingLoading(false);
    }
};

/** Search products for billing */
const handleBillingSearch = (query) => {
    setBillingSearchQuery(query);
    
    if (!query.trim()) {
        setSearchResults(billingProducts);
        return;
    }
    
    // Use Trie search
    const results = billingTrie.search(query);
    // Remove duplicates based on product ID
    const uniqueResults = results.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
    );
    setSearchResults(uniqueResults);
    
    // Smooth scroll to products grid after search
    setTimeout(() => {
        const productsGrid = document.querySelector('.products-grid-container');
        if (productsGrid) {
            productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};

/** Add product to cart */
const addToCart = (product) => {
    // Normalize product structure - handle both Django API and existing structures
    const normalizedProduct = {
        ...product,
        price: product.selling_price || product.price || 0,
        stock: product.stock || 0
    };

    setCart(prevCart => {
        const existingItem = prevCart.find(item => item.id === normalizedProduct.id);
        
        if (existingItem) {
            // Check stock availability
            if (existingItem.quantity >= normalizedProduct.stock) {
                setBillingError(`Only ${normalizedProduct.stock} items available for ${normalizedProduct.name}`);
                setTimeout(() => setBillingError(''), 3000);
                return prevCart;
            }
            
            // Update quantity
            const updatedCart = prevCart.map(item =>
                item.id === normalizedProduct.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
            updateCartTotal(updatedCart);
            
            // Show success feedback with gentle shake animation
            setTimeout(() => {
                const cartSummary = document.querySelector('.cart-summary-section');
                if (cartSummary) {
                    cartSummary.style.animation = 'bounceIn 0.5s ease-out';
                    setTimeout(() => {
                        cartSummary.style.animation = '';
                    }, 500);
                }
            }, 100);
            
            return updatedCart;
        } else {
            // Check stock availability
            if (normalizedProduct.stock <= 0) {
                setBillingError(`${normalizedProduct.name} is out of stock`);
                setTimeout(() => setBillingError(''), 3000);
                return prevCart;
            }
            
            // Add new item with normalized price
            const newCart = [...prevCart, { 
                ...normalizedProduct, 
                quantity: 1,
                price: normalizedProduct.price,
                itemTotal: normalizedProduct.price 
            }];
            updateCartTotal(newCart);
            
            // Smooth scroll to cart summary and highlight it
            setTimeout(() => {
                const cartSummary = document.querySelector('.cart-summary-section');
                if (cartSummary) {
                    cartSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    cartSummary.style.animation = 'bounceIn 0.5s ease-out';
                    setTimeout(() => {
                        cartSummary.style.animation = '';
                    }, 500);
                }
            }, 100);
            
            return newCart;
        }
    });
};

/** Remove product from cart */
const removeFromCart = (productId) => {
    setCart(prevCart => {
        const updatedCart = prevCart.filter(item => item.id !== productId);
        updateCartTotal(updatedCart);
        return updatedCart;
    });
};

/** Update item quantity in cart */
const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    setCart(prevCart => {
        const updatedCart = prevCart.map(item => {
            if (item.id === productId) {
                // Check stock availability
                if (newQuantity > item.stock) {
                    setBillingError(`Only ${item.stock} items available for ${item.name}`);
                    setTimeout(() => setBillingError(''), 3000);
                    return item;
                }
                
                return { 
                    ...item, 
                    quantity: newQuantity,
                    itemTotal: item.price * newQuantity
                };
            }
            return item;
        });
        updateCartTotal(updatedCart);
        return updatedCart;
    });
};

/** Update cart total and handle coupon revalidation */
const updateCartTotal = (cartItems) => {
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    setCartTotal(subtotal);
    
    // Revalidate applied coupon if cart total changes
    if (appliedCoupon && cartItems.length > 0) {
        validateCouponForCart(appliedCoupon.code, subtotal, cartItems);
    } else if (cartItems.length === 0) {
        // Clear coupon if cart is empty
        setAppliedCoupon(null);
        setCouponDiscount(0);
    }
};

/** Fetch Smart Coins balance */
const fetchSmartCoinsBalance = async () => {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        
        const response = await fetch(buildApiUrl('node', `${API_CONFIG.endpoints.node.billing.smartCoinsBalance}/${userId}`));
        if (!response.ok) throw new Error('Failed to fetch smart coins balance');
        
        const result = await response.json();
        if (result.success) {
            setSmartCoinsBalance(result.balance);
        }
    } catch (error) {
        console.error('Error fetching smart coins balance:', error);
        setSmartCoinsBalance(0);
    }
};

/** Fetch available coupons */
const fetchAvailableCoupons = async () => {
    try {
        const response = await fetch(buildApiUrl('node', API_CONFIG.endpoints.node.billing.availableCoupons));
        if (!response.ok) throw new Error('Failed to fetch coupons');
        
        const result = await response.json();
        if (result.success) {
            // Coupons fetched successfully - using manual entry now
        }
    } catch (error) {
        console.error('Error fetching available coupons:', error);
    }
};

/** Apply best coupon automatically */
const applyBestCoupon = async () => {
    if (cartTotal === 0) return;
    
    try {
        setBillingLoading(true);
        
        const response = await fetch(buildApiUrl('node', API_CONFIG.endpoints.node.billing.findBestCoupon), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cartTotal: cartTotal,
                items: cart
            })
        });
        
        if (!response.ok) throw new Error('Failed to find best coupon');
        
        const result = await response.json();
        if (result.success && result.coupon) {
            setAppliedCoupon(result.coupon);
            setCouponDiscount(result.coupon.discount);
        } else {
            setBillingError('No applicable coupons found');
            setTimeout(() => setBillingError(''), 3000);
        }
        
    } catch (error) {
        setBillingError('Failed to apply coupon automatically');
        setTimeout(() => setBillingError(''), 3000);
        console.error('Error applying best coupon:', error);
    } finally {
        setBillingLoading(false);
    }
};

/** Validate and apply coupon manually */
const validateCouponForCart = async (couponCode, total = cartTotal, items = cart) => {
    if (!couponCode || total === 0) return;
    
    try {
        setBillingLoading(true);
        setCouponError('');
        
        const response = await fetch(buildApiUrl('node', API_CONFIG.endpoints.node.billing.validateCoupon), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                couponCode: couponCode,
                cartTotal: total,
                items: items
            })
        });
        
        if (!response.ok) throw new Error('Failed to validate coupon');
        
        const result = await response.json();
        if (result.success) {
            setAppliedCoupon({
                code: result.couponDetails.code,
                discount: result.discount,
                ...result.couponDetails
            });
            setCouponDiscount(result.discount);
            setManualCouponCode('');
            setCouponError('');
        } else {
            // Show specific error messages
            const errorMessage = result.message || 'Invalid coupon code';
            setCouponError(errorMessage);
            setTimeout(() => setCouponError(''), 5000);
        }
        
    } catch (error) {
        setCouponError('Failed to validate coupon. Please try again.');
        setTimeout(() => setCouponError(''), 5000);
        console.error('Error validating coupon:', error);
    } finally {
        setBillingLoading(false);
    }
};

/** Handle Smart Coins usage */
const handleSmartCoinsChange = (amount) => {
    if (!amount || amount <= 0) {
        setSmartCoinsToUse(0);
        return;
    }

    const maxUsable = Math.min(smartCoinsBalance, cartTotal - couponDiscount);
    
    if (amount > smartCoinsBalance) {
        // User entered more than available balance
        setBillingError(`You only have ${smartCoinsBalance} Smart Coins available`);
        setSmartCoinsToUse(smartCoinsBalance);
        
        // Clear error after 3 seconds
        setTimeout(() => setBillingError(''), 3000);
        return;
    }
    
    if (amount > maxUsable) {
        // User entered more than what can be used for this purchase
        setBillingError(`Maximum ${maxUsable} coins can be used for this purchase`);
        setSmartCoinsToUse(maxUsable);
        
        // Clear error after 3 seconds
        setTimeout(() => setBillingError(''), 3000);
        return;
    }
    
    // Clear any previous errors
    setBillingError('');
    setSmartCoinsToUse(amount);
};

/** Calculate final amount */
const calculateFinalAmount = () => {
    return Math.max(0, cartTotal - couponDiscount - smartCoinsToUse);
};

/** Process payment and create bill */
const processBilling = async () => {
    if (!selectedPaymentMethod) {
        setBillingError('Please select a payment method');
        return;
    }
    
    if (cart.length === 0) {
        setBillingError('Cart is empty');
        return;
    }
    
    try {
        setBillingLoading(true);
        setBillingError('');
        
        const userId = localStorage.getItem('userId');
        const customerName = localStorage.getItem('customerName');
        const customerEmail = localStorage.getItem('loggedInUser'); // Assuming this stores email
        
        if (!userId || !customerName) {
            setBillingError('User authentication required');
            return;
        }
        
        // Create bill request
        const billData = {
            customerId: userId,
            customerName: customerName,
            customerEmail: customerEmail || 'customer@email.com',
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: cartTotal,
            couponCode: appliedCoupon?.code || null,
            couponDiscount: couponDiscount,
            smartCoinsUsed: smartCoinsToUse,
            paymentMethod: selectedPaymentMethod
        };
        
        // Create bill
        const billResponse = await fetch(buildApiUrl('node', API_CONFIG.endpoints.node.billing.createBill), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(billData)
        });
        
        if (!billResponse.ok) throw new Error('Failed to create bill');
        
        const billResult = await billResponse.json();
        if (!billResult.success) {
            setBillingError(billResult.message || 'Failed to create bill');
            return;
        }
        
        // Update stock in Django backend
        const stockResponse = await fetch(buildApiUrl('django', API_CONFIG.endpoints.django.updateStock), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                }))
            })
        });
        
        if (!stockResponse.ok) {
            console.warn('Failed to update stock, but bill was created');
        }
        
        // Success - show bill and update state
        setGeneratedBill(billResult.bill);
        setSmartCoinsBalance(billResult.newSmartCoinsBalance);
        setBillingStep('success');
        setShowPaymentSuccess(true);
        
        // Clear cart
        setCart([]);
        setCartTotal(0);
        setAppliedCoupon(null);
        setCouponDiscount(0);
        setSmartCoinsToUse(0);
        
    } catch (error) {
        setBillingError('Payment processing failed. Please try again.');
        console.error('Error processing billing:', error);
    } finally {
        setBillingLoading(false);
    }
};

/** Reset billing modal */
const resetBillingModal = () => {
    setBillingStep('search');
    setCart([]);
    setCartTotal(0);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setSmartCoinsToUse(0);
    setSelectedPaymentMethod('');
    setBillingError('');
    setGeneratedBill(null);
    setShowPaymentSuccess(false);
    setBillingSearchQuery('');
    setSearchResults(billingProducts);
    setManualCouponCode('');
    setCouponError('');
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
    // Speak goodbye message with faster rate
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("See you next time");
        utterance.rate = 1.3; // Fast speech rate
        utterance.pitch = 1;
        utterance.volume = 1;
        window.speechSynthesis.speak(utterance);
    }

    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('customerName');

    // Navigate to home page with a small delay to allow speech to start
    setTimeout(() => {
        navigate('/', { replace: true });
    }, 100);
};

// =============================================================================
// ANALYTICS FUNCTIONS
// =============================================================================

/** Fetch analytics data for the logged-in customer */
// Fetch Total Spent data with time filter
const fetchTotalSpentData = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        let startDate = null;
        let endDate = null;
        const now = new Date();
        
        switch (totalSpentTimeRange) {
            case 'tillnow':
                break;
            case 'lastmonth':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                startDate = lastMonth.toISOString();
                endDate = lastMonthEnd.toISOString();
                break;
            case 'thismonth':
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                startDate = thisMonth.toISOString();
                endDate = thisMonthEnd.toISOString();
                break;
            case 'thisyear':
                const thisYear = new Date(now.getFullYear(), 0, 1);
                const thisYearEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                startDate = thisYear.toISOString();
                endDate = thisYearEnd.toISOString();
                break;
            case 'lastyear':
                const lastYear = new Date(now.getFullYear() - 1, 0, 1);
                const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
                startDate = lastYear.toISOString();
                endDate = lastYearEnd.toISOString();
                break;
            case 'custom':
                if (totalSpentCustomStart && totalSpentCustomEnd) {
                    startDate = new Date(totalSpentCustomStart + 'T00:00:00').toISOString();
                    endDate = new Date(totalSpentCustomEnd + 'T23:59:59').toISOString();
                }
                break;
            default:
                // Default to 'tillnow' - no date filtering
                break;
        }

        let apiUrl = `http://localhost:8080/api/analytics/${userId}`;
        if (startDate && endDate) {
            apiUrl += `/custom?startDate=${startDate}&endDate=${endDate}`;
        }

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Update only the spending totals in analyticsData
                setAnalyticsData(prev => ({
                    ...prev,
                    totalSpent: result.data.totalSpent,
                    totalBills: result.data.totalBills,
                    totalSavings: result.data.totalSavings
                }));
            }
        }
    } catch (error) {
        console.error('Total spent fetch error:', error);
    }
};

// Fetch Graph data with year filter  
const fetchGraphData = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        // Always use year-based filtering for graphs
        const yearStart = new Date(graphYear, 0, 1);
        const yearEnd = new Date(graphYear, 11, 31, 23, 59, 59);
        const startDate = yearStart.toISOString();
        const endDate = yearEnd.toISOString();

        const apiUrl = `http://localhost:8080/api/analytics/${userId}/custom?startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Update only the graph data in analyticsData
                setAnalyticsData(prev => ({
                    ...prev,
                    monthlySpending: result.data.monthlySpending,
                    categoryWiseSpending: result.data.categoryWiseSpending,
                    topProducts: result.data.topProducts,
                    monthlyComparison: result.data.monthlyComparison
                }));
            }
        }
    } catch (error) {
        console.error('Graph data fetch error:', error);
    }
};

const fetchAnalyticsData = async () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        setAnalyticsError('User authentication required');
        return;
    }

    try {
        setAnalyticsLoading(true);
        setAnalyticsError('');

        // Basic API call to get all data initially
        const apiUrl = `http://localhost:8080/api/analytics/${userId}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                setAnalyticsData(result.data);
            } else {
                setAnalyticsError(result.message || 'Failed to fetch analytics data');
            }
        } else {
            const result = await response.json();
            setAnalyticsError(result.message || 'Failed to fetch analytics data');
        }
    } catch (error) {
        setAnalyticsError('Failed to connect to server. Please try again.');
        console.error('Analytics fetch error:', error);
    } finally {
        setAnalyticsLoading(false);
    }
};

/** Show analytics modal and fetch data */
const showAnalyticsView = () => {
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        alert('Please login first to view analytics!');
        return;
    }
    
    setShowAnalyticsModal(true);
    fetchAnalyticsData();
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

            {/* Quick Smart Billing Access */}
            <button
                onClick={() => showSmartBillingView()}
                className="group relative flex items-center space-x-2 transition-all duration-300 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-2 border-violet-300 hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/25 transform hover:scale-105 px-4 py-2 rounded-lg"
                title="Smart Billing - Quick Access"
            >
                <Receipt className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                <span className="font-medium hidden lg:block">Smart Billing</span>
                <span className="font-medium lg:hidden">Bill</span>
                
                {/* Quick access indicator */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-white animate-pulse">
                    <div className="w-full h-full bg-yellow-400 rounded-full animate-ping"></div>
                </div>
            </button>

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

    {/* COMPLETE ANALYTICS DASHBOARD MODAL */}
    {showAnalyticsModal && (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
        >
            <div 
                style={{
                    backgroundColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff',
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                    width: '95%',
                    maxWidth: '1200px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '30px 30px 20px',
                    borderBottom: `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: 'bold',
                            margin: '0 0 5px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            📊 Your Spending Analytics
                        </h1>
                        <p style={{
                            margin: 0,
                            fontSize: '16px',
                            opacity: 0.8
                        }}>
                            Visualize Your Spending Trends & Insights
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAnalyticsModal(false)}
                        style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            fontSize: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Analytics Content */}
                <div style={{ padding: '30px' }}>
                    {analyticsLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                border: '4px solid #f3f4f6',
                                borderTop: '4px solid #3b82f6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 20px'
                            }}></div>
                            <p style={{ fontSize: '18px' }}>Loading your analytics...</p>
                        </div>
                    ) : analyticsData ? (
                        <div>
                            {/* Summary Cards with Total Spent Filter */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        💰 Spending Summary
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <select
                                            value={totalSpentTimeRange}
                                            onChange={(e) => setTotalSpentTimeRange(e.target.value)}
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                                backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                color: currentTheme === 'dark' ? '#ffffff' : '#000000',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="tillnow">Till Now</option>
                                            <option value="lastmonth">Last Month</option>
                                            <option value="thismonth">This Month</option>
                                            <option value="thisyear">This Year</option>
                                            <option value="lastyear">Last Year</option>
                                            <option value="custom">Custom Date</option>
                                        </select>
                                        
                                        {totalSpentTimeRange === 'custom' && (
                                            <>
                                                <input
                                                    type="date"
                                                    value={totalSpentCustomStart}
                                                    onChange={(e) => setTotalSpentCustomStart(e.target.value)}
                                                    style={{
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                                        backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                        color: currentTheme === 'dark' ? '#ffffff' : '#000000',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                                <span style={{ fontSize: '12px' }}>to</span>
                                                <input
                                                    type="date"
                                                    value={totalSpentCustomEnd}
                                                    onChange={(e) => setTotalSpentCustomEnd(e.target.value)}
                                                    style={{
                                                        padding: '5px',
                                                        borderRadius: '5px',
                                                        border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                                        backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                        color: currentTheme === 'dark' ? '#ffffff' : '#000000',
                                                        fontSize: '12px'
                                                    }}
                                                />
                                            </>
                                        )}
                                        
                                        <button
                                            onClick={fetchTotalSpentData}
                                            style={{
                                                backgroundColor: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                padding: '5px 15px',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                                
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px'
                            }}>
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#f8fafc',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`
                                }}>
                                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', opacity: 0.8 }}>Total Spent</h3>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '28px', 
                                        fontWeight: 'bold',
                                        color: '#10b981'
                                    }}>
                                        ₹{analyticsData.totalSpent?.toLocaleString() || '0'}
                                    </p>
                                </div>
                                
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#f8fafc',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`
                                }}>
                                    <h3 style={{ margin: '0 0 15px', fontSize: '16px', opacity: 0.8 }}>Total Savings</h3>
                                    <p style={{ 
                                        margin: '0 0 10px', 
                                        fontSize: '28px', 
                                        fontWeight: 'bold',
                                        color: '#f59e0b'
                                    }}>
                                        ₹{(analyticsData.totalSavings?.amount || 0).toLocaleString()}
                                    </p>
                                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                        <div>🎫 Coupons: ₹{(analyticsData.totalSavings?.details?.coupons || 0).toLocaleString()}</div>
                                        <div>🪙 Smart Coins: ₹{(analyticsData.totalSavings?.details?.smartCoins || 0).toLocaleString()}</div>
                                    </div>
                                </div>

                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#f8fafc',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    textAlign: 'center',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`
                                }}>
                                    <h3 style={{ margin: '0 0 10px', fontSize: '16px', opacity: 0.8 }}>Total Orders</h3>
                                    <p style={{ 
                                        margin: 0, 
                                        fontSize: '28px', 
                                        fontWeight: 'bold',
                                        color: '#3b82f6'
                                    }}>
                                        {analyticsData.totalBills || analyticsData.totalOrders || 0}
                                    </p>
                                </div>
                                </div>
                            </div>

                            {/* Charts Grid with Graph Filter */}
                            <div style={{ marginBottom: '30px' }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        margin: 0,
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        📈 Trends & Analysis
                                    </h3>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                        <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Year:</label>
                                        <input
                                            type="number"
                                            value={graphYear}
                                            onChange={(e) => setGraphYear(parseInt(e.target.value))}
                                            min="2020"
                                            max="2030"
                                            placeholder="2025"
                                            style={{
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                border: `1px solid ${currentTheme === 'dark' ? '#4b5563' : '#d1d5db'}`,
                                                backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                                color: currentTheme === 'dark' ? '#ffffff' : '#000000',
                                                fontSize: '14px',
                                                width: '80px'
                                            }}
                                        />
                                        
                                        <button
                                            onClick={fetchGraphData}
                                            style={{
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '5px',
                                                padding: '5px 15px',
                                                fontSize: '14px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Update
                                        </button>
                                    </div>
                                </div>
                                
                            {/* Charts Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                                gap: '30px'
                            }}>
                                {/* Monthly Spending Trend */}
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`,
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h3 style={{ 
                                        margin: '0 0 20px', 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        📈 {graphYear} Monthly Spending Trend
                                    </h3>
                                    {analyticsData.monthlySpending && (
                                        <Line 
                                            data={{
                                                labels: analyticsData.monthlySpending.map(item => item.month),
                                                datasets: [{
                                                    label: 'Amount Spent (₹)',
                                                    data: analyticsData.monthlySpending.map(item => item.amount),
                                                    borderColor: '#3b82f6',
                                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                    borderWidth: 3,
                                                    fill: true,
                                                    tension: 0.4
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        labels: {
                                                            color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        ticks: {
                                                            color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                                                        },
                                                        grid: {
                                                            color: currentTheme === 'dark' ? '#4b5563' : '#e5e7eb'
                                                        }
                                                    },
                                                    x: {
                                                        ticks: {
                                                            color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                                                        },
                                                        grid: {
                                                            color: currentTheme === 'dark' ? '#4b5563' : '#e5e7eb'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Category Distribution */}
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`,
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h3 style={{ 
                                        margin: '0 0 20px', 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        🎯 Category-wise Spending
                                    </h3>
                                    {analyticsData.categoryWiseSpending && analyticsData.categoryWiseSpending.length > 0 && (
                                        <Doughnut 
                                            data={{
                                                labels: analyticsData.categoryWiseSpending.map(item => item.category),
                                                datasets: [{
                                                    data: analyticsData.categoryWiseSpending.map(item => item.amount),
                                                    backgroundColor: [
                                                        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                                                        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
                                                    ],
                                                    borderWidth: 2,
                                                    borderColor: currentTheme === 'dark' ? '#1f2937' : '#ffffff'
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                plugins: {
                                                    legend: {
                                                        labels: {
                                                            color: currentTheme === 'dark' ? '#ffffff' : '#000000'
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Top Products */}
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`,
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h3 style={{ 
                                        margin: '0 0 20px', 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        🏆 Top 5 Most Purchased (By Quantity)
                                    </h3>
                                    {analyticsData.topProducts && analyticsData.topProducts.length > 0 ? (
                                        <div style={{ space: '15px' }}>
                                            {analyticsData.topProducts
                                                .sort((a, b) => (b.totalQuantity || b.quantity || 0) - (a.totalQuantity || a.quantity || 0))
                                                .slice(0, 5)
                                                .map((product, index) => (
                                                <div key={index} style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '15px',
                                                    marginBottom: '10px',
                                                    backgroundColor: currentTheme === 'dark' ? '#4b5563' : '#f8fafc',
                                                    borderRadius: '10px',
                                                    border: `1px solid ${currentTheme === 'dark' ? '#6b7280' : '#e2e8f0'}`
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <div style={{
                                                            width: '30px',
                                                            height: '30px',
                                                            borderRadius: '50%',
                                                            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index],
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 'bold',
                                                            fontSize: '14px',
                                                            marginRight: '15px'
                                                        }}>
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <p style={{ 
                                                                margin: '0 0 5px', 
                                                                fontSize: '16px', 
                                                                fontWeight: 'bold',
                                                                color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                                            }}>
                                                                {product.name || product.productName || 'Unknown Product'}
                                                            </p>
                                                            <p style={{ 
                                                                margin: 0, 
                                                                fontSize: '14px', 
                                                                opacity: 0.7
                                                            }}>
                                                                Quantity: {product.totalQuantity || product.quantity || 0} items
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ 
                                                            margin: '0 0 5px', 
                                                            fontSize: '18px', 
                                                            fontWeight: 'bold',
                                                            color: '#10b981'
                                                        }}>
                                                            ₹{(product.totalAmount || 0).toLocaleString()}
                                                        </p>
                                                        <p style={{ 
                                                            margin: 0, 
                                                            fontSize: '12px', 
                                                            opacity: 0.7
                                                        }}>
                                                            Total Spent
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ 
                                            textAlign: 'center', 
                                            padding: '20px', 
                                            opacity: 0.7 
                                        }}>
                                            No product data available
                                        </p>
                                    )}
                                </div>

                                {/* Month-on-Month Comparison */}
                                <div style={{
                                    backgroundColor: currentTheme === 'dark' ? '#374151' : '#ffffff',
                                    padding: '25px',
                                    borderRadius: '15px',
                                    border: `2px solid ${currentTheme === 'dark' ? '#4b5563' : '#e2e8f0'}`,
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h3 style={{ 
                                        margin: '0 0 20px', 
                                        fontSize: '20px', 
                                        fontWeight: 'bold',
                                        color: currentTheme === 'dark' ? '#ffffff' : '#1f2937'
                                    }}>
                                        📊 Month-on-Month Change
                                    </h3>
                                    <div style={{ textAlign: 'center', padding: '20px' }}>
                                        <p style={{ 
                                            fontSize: '48px', 
                                            fontWeight: 'bold',
                                            margin: '0 0 10px',
                                            color: (analyticsData.monthlyComparison?.percentageChange || 0) >= 0 ? '#10b981' : '#ef4444'
                                        }}>
                                            {(analyticsData.monthlyComparison?.percentageChange || 0) >= 0 ? '+' : ''}{analyticsData.monthlyComparison?.percentageChange || 0}%
                                        </p>
                                        <p style={{ 
                                            fontSize: '18px', 
                                            opacity: 0.8,
                                            margin: 0
                                        }}>
                                            {(analyticsData.monthlyComparison?.percentageChange || 0) >= 0 ? '📈 Spending Increased' : '📉 Spending Decreased'} vs Last Month
                                        </p>
                                    </div>
                                </div>
                            </div>
                            </div>

                            {/* Action Buttons */}
                            <div style={{
                                marginTop: '40px',
                                textAlign: 'center',
                                padding: '20px',
                                borderTop: `2px solid ${currentTheme === 'dark' ? '#374151' : '#e5e7eb'}`
                            }}>
                                <button
                                    onClick={() => fetchAnalyticsData()}
                                    style={{
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        marginRight: '15px'
                                    }}
                                >
                                    🔄 Refresh Data
                                </button>
                                <button
                                    onClick={() => setShowAnalyticsModal(false)}
                                    style={{
                                        backgroundColor: '#6b7280',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Close Dashboard
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                                No analytics data available. This might be because:
                            </p>
                            <ul style={{ 
                                textAlign: 'left', 
                                maxWidth: '400px', 
                                margin: '0 auto 20px',
                                lineHeight: '1.8'
                            }}>
                                <li>You haven't made any purchases yet</li>
                                <li>Your purchase data is still being processed</li>
                                <li>There might be a connection issue</li>
                            </ul>
                            <button
                                onClick={() => fetchAnalyticsData()}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '10px',
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    cursor: 'pointer'
                                }}
                            >
                                Try Again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}

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
            className={`px-8 py-3 font-semibold text-sm uppercase tracking-wide transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 group relative rounded-lg ${
            feature.special 
                ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-purple-500/25" 
                : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md hover:shadow-emerald-500/25"
            }`}
            onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            if (feature.special) {
                // Handle AI Assistant launch - Open Smart Shopping Assistant
                setShowSmartShoppingAssistant(true);
            } else {
                // Handle View action
                if (feature.title === "View Products") {
                fetchProducts();
                } else if (feature.title === "View Coupons at Store") {
                fetchCoupons();
                } else if (feature.title === "View Smart Coins") {
                showSmartCoinsView();
                } else if (feature.title === "View Past Bills") {
                showPastBillsView();
                } else if (feature.title === "Submit Feedback for Store") {
                showFeedbackView();
                } else if (feature.title === "See Your Wishlisted Items") {
                showWishlistView();
                } else if (feature.title === "Smart Billing") {
                showSmartBillingView();
                } else if (feature.title === "Visualize Your Spending Trends") {
                showAnalyticsView();
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
            {/* Button content */}
            <span className="relative z-10 flex items-center justify-center gap-2 w-full">
            {feature.special ? (
                <>
                <Star className="h-4 w-4 flex-shrink-0" />
                <span>Launch AI Assistant</span>
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

    {/* =============================================================================
        PAST BILLS MODAL - Professional Bill History with Advanced Filtering
        ============================================================================= */}
    {showPastBillsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-6xl max-h-[95vh] overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 ${themeStyles.cardBg} border ${themeStyles.border}`}>
                
                {/* Modal Header with Filters */}
                <div className={`sticky top-0 z-10 p-6 border-b backdrop-blur-md ${themeStyles.headerBg} ${themeStyles.border}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                                <Receipt className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent`}>
                                    Your Past Bills
                                </h2>
                                <p className={`text-sm ${themeStyles.textSecondary}`}>
                                    View and manage your purchase history
                                </p>
                            </div>
                        </div>
                        
                        {/* Filter Controls */}
                        <div className="flex items-center space-x-3">
                            <select
                                value={billFilter.filterType}
                                onChange={(e) => {
                                    const newFilter = { ...billFilter, filterType: e.target.value };
                                    applyBillFilter(newFilter);
                                }}
                                className={`px-3 py-2 rounded-lg border ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text} text-sm focus:outline-none focus:ring-2 focus:ring-violet-500`}
                            >
                                <option value="all">All Time</option>
                                <option value="thisMonth">This Month</option>
                                <option value="lastMonth">Last Month</option>
                                <option value="thisYear">This Year</option>
                                <option value="lastYear">Last Year</option>
                                <option value="custom">Custom Range</option>
                            </select>
                            
                            <button
                                onClick={() => setShowPastBillsModal(false)}
                                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${themeStyles.textSecondary}`}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Range Inputs */}
                    {billFilter.filterType === 'custom' && (
                        <div className={`flex items-center space-x-4 mt-4 pt-4 border-t ${themeStyles.border}`}>
                            <div>
                                <label className={`block text-xs font-medium ${themeStyles.textSecondary} mb-1`}>From Date</label>
                                <input
                                    type="date"
                                    value={billFilter.dateFrom}
                                    onChange={(e) => {
                                        const newFilter = { ...billFilter, dateFrom: e.target.value };
                                        setBillFilter(newFilter);
                                    }}
                                    className={`px-3 py-2 rounded-lg border ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text} text-sm`}
                                />
                            </div>
                            <div>
                                <label className={`block text-xs font-medium ${themeStyles.textSecondary} mb-1`}>To Date</label>
                                <input
                                    type="date"
                                    value={billFilter.dateTo}
                                    onChange={(e) => {
                                        const newFilter = { ...billFilter, dateTo: e.target.value };
                                        setBillFilter(newFilter);
                                    }}
                                    className={`px-3 py-2 rounded-lg border ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text} text-sm`}
                                />
                            </div>
                            <button
                                onClick={() => applyBillFilter(billFilter)}
                                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm mt-5"
                            >
                                Apply Filter
                            </button>
                        </div>
                    )}

                    {/* Active Filter Display */}
                    <div className={`flex items-center justify-between mt-4 pt-4 border-t ${themeStyles.border}`}>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${themeStyles.textSecondary}`}>Showing:</span>
                            <span className={`px-2 py-1 rounded-full text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200`}>
                                {getFilterDisplayText()}
                            </span>
                            <span className={`text-sm ${themeStyles.textSecondary}`}>({pastBills.length} bills)</span>
                        </div>
                    </div>
                </div>

                {/* Bills List */}
                <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 p-6 max-h-[60vh]">
                    {pastBillsLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                            <span className={`ml-3 ${themeStyles.textSecondary}`}>Loading your bills...</span>
                        </div>
                    ) : pastBillsError ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <p className="text-red-600 dark:text-red-400 mb-4">{pastBillsError}</p>
                            <button
                                onClick={() => fetchPastBills(true)}
                                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : pastBills.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className={`h-16 w-16 ${themeStyles.textSecondary} mx-auto mb-4`} />
                            <p className={`text-lg ${themeStyles.textSecondary} mb-2`}>No bills found</p>
                            <p className={`text-sm ${themeStyles.textSecondary}`}>
                                {billFilter.filterType === 'all' 
                                    ? 'You haven\'t made any purchases yet'
                                    : `No bills found for the selected period: ${getFilterDisplayText()}`
                                }
                            </p>
                        </div>
                    ) : expandedBill ? (
                        // Show single expanded bill in full view
                        <div className="space-y-6">
                            {(() => {
                                const bill = pastBills.find(b => b._id === expandedBill);
                                if (!bill) return null;
                                
                                return (
                                    <div className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.border} p-6`}>
                                        {/* Back Button */}
                                        <div className={`flex items-center justify-between mb-6 pb-4 border-b ${themeStyles.border}`}>
                                            <button
                                                onClick={() => setExpandedBill(null)}
                                                className={`flex items-center space-x-2 px-4 py-2 ${themeStyles.cardBg} border ${themeStyles.border} rounded-lg hover:${themeStyles.hoverBg} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                                            >
                                                <ArrowLeft className="h-4 w-4" />
                                                <span>Back to Bills List</span>
                                            </button>
                                            <div className="text-right">
                                                <p className={`text-sm ${themeStyles.textSecondary}`}>Bill Details</p>
                                                <p className={`font-semibold ${themeStyles.text}`}>#{bill.billId}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Store Info */}
                                        <div className={`text-center mb-6 pb-4 border-b ${themeStyles.border}`}>
                                            <h3 className={`text-2xl font-bold ${themeStyles.accent}`}>{bill.storeName}</h3>
                                            <p className={`text-sm ${themeStyles.textSecondary}`}>Smart Shopping Experience</p>
                                            <p className={`text-sm ${themeStyles.textSecondary} mt-2`}>
                                                Date: {formatBillDate(bill.billDate)}
                                            </p>
                                        </div>

                                        {/* Bill Summary Card */}
                                        <div className={`p-4 rounded-lg ${themeStyles.headerBg} border ${themeStyles.border} mb-6`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className={`text-lg font-semibold ${themeStyles.text}`}>Bill Summary</h4>
                                                    <p className={`text-sm ${themeStyles.textSecondary}`}>{bill.items.length} items purchased</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-2xl font-bold ${themeStyles.accent}`}>₹{bill.billing.finalAmount}</p>
                                                    <div className={`px-3 py-1 rounded-full text-sm ${
                                                        bill.paymentMethod === 'Cash' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                                                        bill.paymentMethod === 'Card' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' :
                                                        'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                                                    }`}>
                                                        Paid via {bill.paymentMethod}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Customer Information */}
                                        <div className="mb-6">
                                            <h4 className={`text-lg font-semibold ${themeStyles.text} mb-3`}>Customer Information</h4>
                                            <div className={`p-4 rounded-lg ${themeStyles.cardBg} border ${themeStyles.border}`}>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className={`text-sm ${themeStyles.textSecondary}`}>Name</p>
                                                        <p className={`font-medium ${themeStyles.text}`}>{bill.customerName}</p>
                                                    </div>
                                                    <div>
                                                        <p className={`text-sm ${themeStyles.textSecondary}`}>Email</p>
                                                        <p className={`font-medium ${themeStyles.text}`}>{bill.customerEmail}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Items Purchased */}
                                        <div className="mb-6">
                                            <h4 className={`text-lg font-semibold ${themeStyles.text} mb-3`}>Items Purchased</h4>
                                            <div className="space-y-3">
                                                {bill.items.map((item, idx) => (
                                                    <div key={idx} className={`flex justify-between items-center p-4 rounded-lg ${themeStyles.cardBg} border ${themeStyles.border} hover:shadow-md transition-shadow`}>
                                                        <div className="flex-1">
                                                            <h5 className={`font-semibold ${themeStyles.text}`}>{item.productName}</h5>
                                                            <p className={`text-sm ${themeStyles.textSecondary}`}>{item.category}</p>
                                                            <p className={`text-sm ${themeStyles.textSecondary}`}>₹{item.price} each</p>
                                                        </div>
                                                        <div className="text-center mx-4">
                                                            <p className={`text-sm ${themeStyles.textSecondary}`}>Quantity</p>
                                                            <p className={`text-lg font-bold ${themeStyles.text}`}>{item.quantity}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-sm ${themeStyles.textSecondary}`}>Total</p>
                                                            <p className={`text-xl font-bold ${themeStyles.accent}`}>₹{item.itemTotal}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Billing Breakdown */}
                                        <div className={`p-6 rounded-lg ${themeStyles.headerBg} border ${themeStyles.border}`}>
                                            <h4 className={`text-lg font-semibold ${themeStyles.text} mb-4`}>Billing Breakdown</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className={`${themeStyles.textSecondary}`}>Subtotal</span>
                                                    <span className={`font-semibold ${themeStyles.text}`}>₹{bill.billing.subtotal}</span>
                                                </div>
                                                
                                                {bill.billing.couponDiscount > 0 && (
                                                    <div className="flex justify-between items-center text-green-600">
                                                        <span>Coupon Discount ({bill.billing.couponCode})</span>
                                                        <span className="font-semibold">-₹{bill.billing.couponDiscount}</span>
                                                    </div>
                                                )}
                                                
                                                {bill.billing.smartCoinsUsed > 0 && (
                                                    <div className="flex justify-between items-center text-yellow-600">
                                                        <span>Smart Coins Used ({bill.billing.smartCoinsUsed} coins)</span>
                                                        <span className="font-semibold">-₹{bill.billing.smartCoinsDiscount}</span>
                                                    </div>
                                                )}
                                                
                                                {(bill.billing.couponDiscount > 0 || bill.billing.smartCoinsUsed > 0) && (
                                                    <>
                                                        <div className={`border-t ${themeStyles.border} pt-2`}></div>
                                                        <div className="flex justify-between items-center text-green-600">
                                                            <span className="font-medium">Total Savings</span>
                                                            <span className="font-bold">₹{bill.billing.totalDiscount}</span>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <div className={`border-t ${themeStyles.border} pt-3`}></div>
                                                <div className="flex justify-between items-center">
                                                    <span className={`text-lg font-bold ${themeStyles.text}`}>Final Amount</span>
                                                    <span className={`text-2xl font-bold ${themeStyles.accent}`}>₹{bill.billing.finalAmount}</span>
                                                </div>
                                            </div>

                                            {/* Payment & Smart Coins Info */}
                                            {bill.billing.smartCoinsEarned > 0 && (
                                                <div className={`mt-4 pt-4 border-t ${themeStyles.border}`}>
                                                    <div className="flex items-center justify-center">
                                                        <div className="text-center">
                                                            <p className={`text-sm ${themeStyles.textSecondary}`}>Smart Coins Earned</p>
                                                            <p className="text-2xl font-bold text-yellow-600">+{bill.billing.smartCoinsEarned} coins</p>
                                                            <p className={`text-xs ${themeStyles.textSecondary}`}>Added to your wallet</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        // Show bills list
                        <div className="space-y-4">
                            {pastBills.map((bill, index) => (
                                <div key={bill._id} className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.border} overflow-hidden transition-all duration-300 hover:shadow-lg`}>
                                    {/* Bill Summary */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Receipt className="h-5 w-5 text-violet-500" />
                                                    <div>
                                                        <p className={`font-semibold ${themeStyles.text}`}>#{bill.billId}</p>
                                                        <p className={`text-sm ${themeStyles.textSecondary}`}>
                                                            {formatBillDate(bill.billDate)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`px-2 py-1 rounded-full text-xs ${
                                                    bill.paymentMethod === 'Cash' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200' :
                                                    bill.paymentMethod === 'Card' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' :
                                                    'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
                                                }`}>
                                                    {bill.paymentMethod}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className={`font-bold text-lg ${themeStyles.accent}`}>₹{bill.billing.finalAmount}</p>
                                                    {bill.billing.totalDiscount > 0 && (
                                                        <p className="text-sm text-green-600">Saved ₹{bill.billing.totalDiscount}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Summary with View Details Button */}
                                        <div className={`flex items-center justify-between mt-3 pt-3 border-t ${themeStyles.border}`}>
                                            <div className="flex items-center space-x-4">
                                                <span className={`text-sm ${themeStyles.textSecondary}`}>
                                                    {bill.items.length} item{bill.items.length > 1 ? 's' : ''}
                                                </span>
                                                {bill.billing.smartCoinsEarned > 0 && (
                                                    <span className="text-sm text-yellow-600">
                                                        +{bill.billing.smartCoinsEarned} coins earned
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setExpandedBill(bill._id)}
                                                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors text-sm font-medium"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}
    
    {/* =============================================================================
        SMART BILLING MODAL - COMPREHENSIVE BILLING SYSTEM
        ============================================================================= */}
    {showSmartBillingModal && (
        <>
        {/* CSS Animations for Smart Billing */}
        <style jsx>{`
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInFromLeft {
            from {
                opacity: 0;
                transform: translateX(-30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInFromRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes bounceIn {
            0% {
                opacity: 0;
                transform: scale(0.3);
            }
            50% {
                opacity: 1;
                transform: scale(1.05);
            }
            70% {
                transform: scale(0.9);
            }
            100% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .scroll-smooth {
            scroll-behavior: smooth;
        }
        
        .scrollbar-thin {
            scrollbar-width: thin;
        }
        
        .scrollbar-thumb-gray-300 {
            scrollbar-color: #d1d5db #f3f4f6;
        }
        
        .dark .scrollbar-thumb-gray-600 {
            scrollbar-color: #4b5563 #1f2937;
        }
        
        /* Webkit scrollbar styling */
        .scrollbar-thin::-webkit-scrollbar {
            width: 6px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
            background: #f3f4f6;
            border-radius: 10px;
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-track {
            background: #1f2937;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 10px;
            transition: background-color 0.3s ease;
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #4b5563;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #9ca3af;
        }
        
        .dark .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
        }
        
        .hover\\:scale-102:hover {
            transform: scale(1.02);
        }
        
        /* Pulse effect for active elements */
        .billing-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.8;
            }
        }
        
        /* Shimmer effect for loading */
        .billing-shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
        }
        
        @keyframes shimmer {
            0% {
                background-position: -200% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
        
        /* Smooth transitions for all elements */
        * {
            transition: all 0.3s ease;
        }
        `}</style>
        
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className={`${themeStyles.cardBg} rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border ${themeStyles.border} transform animate-in slide-in-from-bottom duration-500`}>
            
            {/* Header */}
            <div className={`${themeStyles.headerBg} px-6 py-4 border-b ${themeStyles.border} flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
                <Receipt className={`h-6 w-6 ${themeStyles.accent}`} />
                <h2 className={`text-xl font-bold ${themeStyles.text}`}>Smart Billing System</h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-700`}>
                {billingStep === 'search' && 'Search Products'}
                {billingStep === 'cart' && 'Review Cart'}
                {billingStep === 'payment' && 'Payment Options'}
                {billingStep === 'preview' && 'Bill Preview'}
                {billingStep === 'success' && 'Payment Complete'}
                </div>
            </div>
            <button
                onClick={() => setShowSmartBillingModal(false)}
                className={`${themeStyles.textSecondary} hover:${themeStyles.text} transition-colors`}
            >
                <X className="h-6 w-6" />
            </button>
            </div>

            {/* Step Progress Bar */}
            <div className="px-6 py-3">
            <div className="flex items-center justify-between">
                {['search', 'cart', 'payment', 'preview', 'success'].map((step, index) => {
                const isActive = billingStep === step;
                const isCompleted = ['search', 'cart', 'payment', 'preview', 'success'].indexOf(billingStep) > index;
                
                return (
                    <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                        isActive ? `${themeStyles.accent.replace('text-', 'bg-')} text-white` :
                        isCompleted ? 'bg-green-500 text-white' :
                        `${themeStyles.cardBg} border-2 ${themeStyles.border} ${themeStyles.textSecondary}`
                    }`}>
                        {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
                    </div>
                    {index < 4 && (
                        <div className={`h-0.5 w-16 mx-2 ${
                        isCompleted ? 'bg-green-500' : `${themeStyles.border}`
                        }`} />
                    )}
                    </div>
                );
                })}
            </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 billing-modal-content relative">

            {/* Step 1: Product Search */}
            {billingStep === 'search' && (
                <div className="p-6 space-y-6">
                
                {/* Search Header */}
                <div className="text-center mb-6">
                    <h3 className={`text-2xl font-bold ${themeStyles.text} mb-2`}>Find Products</h3>
                    <p className={`${themeStyles.textSecondary}`}>Search and add products to your cart</p>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${themeStyles.textSecondary} group-focus-within:text-blue-500 transition-colors duration-300`} />
                    <input
                    type="text"
                    value={billingSearchQuery}
                    onChange={(e) => handleBillingSearch(e.target.value)}
                    placeholder="Search products (e.g., Colgate, toothpaste)..."
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text} placeholder:${themeStyles.textSecondary} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-300 transform focus:scale-105`}
                    />
                </div>

                {/* Cart Summary (if not empty) */}
                {cart.length > 0 && (
                    <div className={`${themeStyles.cardBg} rounded-lg p-4 border ${themeStyles.border} cart-summary-section transition-all duration-300 overflow-hidden`}>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-semibold ${themeStyles.text} flex items-center`}>
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Cart ({cart.length} items)
                        </h4>
                        <span className={`font-bold ${themeStyles.accent}`}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {cart.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="px-2 py-1 rounded text-xs bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200 border border-violet-200 dark:border-violet-700 flex-shrink-0">
                            {item.name} x{item.quantity}
                        </div>
                        ))}
                        {cart.length > 3 && (
                        <span className={`text-xs ${themeStyles.textSecondary} flex-shrink-0`}>+{cart.length - 3} more</span>
                        )}
                        <button
                        onClick={() => {
                            setBillingStep('cart');
                            // Smooth scroll to top when switching steps
                            setTimeout(() => {
                                const modalContent = document.querySelector('.billing-modal-content');
                                if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }}
                        className="ml-auto px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                        Review Cart
                        </button>
                    </div>
                    </div>
                )}

                {/* Products Grid */}
                <div className="products-grid-container overflow-hidden">
                {billingLoading || products.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    <span className={`ml-3 ${themeStyles.textSecondary}`}>
                        {products.length === 0 ? 'Loading products...' : 'Searching products...'}
                    </span>
                    </div>
                ) : searchResults.length === 0 && billingSearchQuery ? (
                    <div className="flex flex-col items-center justify-center py-12">
                    <Package className="h-16 w-16 text-gray-400 mb-4" />
                    <p className={`text-lg font-semibold ${themeStyles.text} mb-2`}>No products found</p>
                    <p className={`${themeStyles.textSecondary} text-center`}>
                        Try searching with different keywords or check the spelling
                    </p>
                    </div>
                ) : (
                    <div className="relative">
                    <div className="max-h-96 overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500 pr-2">
                    
                    {/* Scroll Indicator */}
                    {searchResults.length > 6 && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-full text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 opacity-75 border border-violet-200 dark:border-violet-700">
                        Scroll for more
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((product, index) => (
                        <div 
                        key={product.id} 
                        className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.border} p-4 hover:shadow-lg transition-all duration-300 group transform hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600`}
                        style={{
                            animationDelay: `${index * 0.05}s`,
                            animation: 'fadeInUp 0.5s ease-out forwards'
                        }}
                        >
                        
                        {/* Product Info */}
                        <div className="mb-3">
                            <h4 className={`font-semibold ${themeStyles.text} group-hover:${themeStyles.accent} transition-colors`}>
                            {product.name}
                            </h4>
                            <p className={`text-sm ${themeStyles.textSecondary} mb-1`}>
                            {product.category}
                            </p>
                            <div className="flex items-center justify-between">
                            <span className={`text-lg font-bold ${themeStyles.accent}`}>
                                ₹{product.price}
                            </span>
                            <span className={`text-sm px-2 py-1 rounded ${
                                product.stock > 10 ? 'bg-green-100 text-green-700' :
                                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </span>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                            product.stock === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            }`}
                        >
                            <Plus className="h-4 w-4" />
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                        </div>
                        ))}
                    </div>
                    </div>
                    </div>
                )}
                </div>
                
                {/* Error Message */}
                {billingError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{billingError}</p>
                    </div>
                )}
                </div>
            )}

            {/* Step 2: Cart Review */}
            {billingStep === 'cart' && (
                <div className="h-[600px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    <div className="p-6 space-y-6">
                
                {/* Cart Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                    <h3 className={`text-2xl font-bold ${themeStyles.text} mb-2`}>Review Your Cart</h3>
                    <p className={`${themeStyles.textSecondary}`}>Adjust quantities and apply discounts</p>
                    </div>
                    <button
                    onClick={() => {
                        setBillingStep('search');
                        setTimeout(() => {
                            const modalContent = document.querySelector('.billing-modal-content');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 ${themeStyles.cardBg} border ${themeStyles.border} rounded-lg hover:${themeStyles.hoverBg} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Search</span>
                    </button>
                </div>

                {/* Scroll Indicator for Cart */}
                <div className="text-center mb-4">
                    <p className="text-sm text-violet-600 dark:text-violet-400 flex items-center justify-center space-x-2">
                        <span>Scroll for more content</span>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </p>
                </div>

                {/* Cart Items */}
                {cart.length === 0 ? (
                    <div className="text-center py-12">
                    <ShoppingCart className={`h-16 w-16 ${themeStyles.textSecondary} mx-auto mb-4`} />
                    <p className={`text-lg ${themeStyles.textSecondary}`}>Your cart is empty</p>
                    <button
                        onClick={() => setBillingStep('search')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Add Products
                    </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                    
                    {/* Cart Items List */}
                    <div className="space-y-3">
                        {cart.map((item, index) => (
                        <div 
                        key={item.id} 
                        className={`${themeStyles.cardBg} rounded-lg border ${themeStyles.border} p-4 flex items-center justify-between hover:shadow-md transition-all duration-300 transform hover:scale-102`}
                        style={{
                            animationDelay: `${index * 0.1}s`,
                            animation: 'slideInFromLeft 0.5s ease-out forwards'
                        }}
                        >
                            
                            {/* Item Info */}
                            <div className="flex-1">
                            <h4 className={`font-semibold ${themeStyles.text}`}>{item.name}</h4>
                            <p className={`text-sm ${themeStyles.textSecondary}`}>{item.category}</p>
                            <p className={`text-lg font-bold ${themeStyles.accent}`}>₹{item.price} each</p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                            <button
                                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className={`font-semibold px-3 ${themeStyles.text}`}>{item.quantity}</span>
                            <button
                                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                item.quantity >= item.stock
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 text-white hover:bg-green-600'
                                }`}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                            </div>

                            {/* Item Total & Remove */}
                            <div className="text-right ml-6">
                            <p className={`text-lg font-bold ${themeStyles.accent}`}>₹{(item.price * item.quantity).toFixed(2)}</p>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 transition-colors mt-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            </div>
                        </div>
                        ))}
                    </div>

                    {/* Cart Summary */}
                    <div className={`${themeStyles.headerBg} rounded-lg border ${themeStyles.border} p-6`}>
                        
                        {/* Subtotal */}
                        <div className="flex justify-between items-center mb-4">
                        <span className={`text-lg ${themeStyles.text}`}>Subtotal</span>
                        <span className={`text-lg font-bold ${themeStyles.text}`}>₹{cartTotal.toFixed(2)}</span>
                        </div>

                        {/* Apply Coupon Section */}
                        <div className="mb-4 space-y-3">
                        <h4 className={`font-semibold ${themeStyles.text} flex items-center`}>
                            <Tag className="h-5 w-5 mr-2" />
                            Coupons & Discounts
                        </h4>
                        
                        {/* Auto Apply Best Coupon */}
                        <button
                            onClick={applyBestCoupon}
                            disabled={billingLoading}
                            className="w-full py-2 px-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {billingLoading ? 'Finding...' : 'Smartly-Apply Best Coupon'}
                        </button>
                        
                        {/* Manual Coupon Code Entry */}
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={manualCouponCode}
                                onChange={(e) => setManualCouponCode(e.target.value.toUpperCase())}
                                placeholder="Enter coupon code (e.g., SAVE20)"
                                className={`flex-1 px-3 py-2 border rounded-lg ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text} placeholder:${themeStyles.textSecondary} focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                            />
                            <button
                                onClick={() => validateCouponForCart(manualCouponCode)}
                                disabled={!manualCouponCode.trim() || billingLoading}
                                className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Apply
                            </button>
                        </div>
                        
                        {/* Coupon Error Message */}
                        {couponError && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-600 dark:text-red-400 text-sm font-medium">{couponError}</p>
                            </div>
                        )}
                        
                        {/* Applied Coupon Display */}
                        {appliedCoupon && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                <span className="text-green-700 dark:text-green-400 font-medium">
                                    {appliedCoupon.code} Applied
                                </span>
                                <p className="text-sm text-green-600 dark:text-green-300">
                                    {appliedCoupon.type === '%' 
                                    ? `${appliedCoupon.value}% off` 
                                    : `₹${appliedCoupon.value} off`}
                                </p>
                                </div>
                                <div className="text-right">
                                <span className="text-green-700 dark:text-green-400 font-bold">
                                    -₹{couponDiscount.toFixed(2)}
                                </span>
                                <button
                                    onClick={() => {
                                    setAppliedCoupon(null);
                                    setCouponDiscount(0);
                                    }}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                                </div>
                            </div>
                            </div>
                        )}
                        </div>

                        {/* Total After Discount */}
                        <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className={`text-xl font-bold ${themeStyles.text}`}>Total</span>
                            <span className={`text-xl font-bold ${themeStyles.accent}`}>
                            ₹{(cartTotal - couponDiscount).toFixed(2)}
                            </span>
                        </div>
                        </div>

                        {/* Proceed to Payment */}
                        <button
                        onClick={() => {
                            setBillingStep('payment');
                            setTimeout(() => {
                                const modalContent = document.querySelector('.billing-modal-content');
                                if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }}
                        className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                        >
                        Proceed to Payment
                        </button>
                    </div>
                    </div>
                )}

                {/* Error Message */}
                {billingError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{billingError}</p>
                    </div>
                )}
                    </div>
                </div>
            )}

            {/* Step 3: Payment Options */}
            {billingStep === 'payment' && (
                <div className="h-[600px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    <div className="p-6 space-y-6">
                
                {/* Payment Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                    <h3 className={`text-2xl font-bold ${themeStyles.text} mb-2`}>Payment Options</h3>
                    <p className={`${themeStyles.textSecondary}`}>Choose your payment method</p>
                    </div>
                    <button
                    onClick={() => {
                        setBillingStep('cart');
                        setTimeout(() => {
                            const modalContent = document.querySelector('.billing-modal-content');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 ${themeStyles.cardBg} border ${themeStyles.border} rounded-lg hover:${themeStyles.hoverBg} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Cart</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Left: Payment Methods */}
                    <div>
                    <h4 className={`text-lg font-semibold ${themeStyles.text} mb-4 flex items-center`}>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Select Payment Method
                    </h4>
                    
                    <div className="space-y-3">
                        {[
                        { id: 'Cash', label: 'Cash Payment', icon: IndianRupee, color: 'from-green-500 to-emerald-500' },
                        { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard, color: 'from-blue-500 to-indigo-500' },
                        { id: 'UPI', label: 'UPI Payment', icon: Smartphone, color: 'from-purple-500 to-pink-500' }
                        ].map((method, index) => (
                        <div 
                            key={method.id} 
                            onClick={() => setSelectedPaymentMethod(method.id)}
                            className={`p-4 border-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg cursor-pointer ${
                            selectedPaymentMethod === method.id
                                ? `border-blue-500 ${themeStyles.cardBg} shadow-lg ring-2 ring-blue-200 dark:ring-blue-800`
                                : `${themeStyles.border} ${themeStyles.cardBg} hover:${themeStyles.hoverBg} hover:border-blue-300 dark:hover:border-blue-600`
                            }`}
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                animation: 'fadeInUp 0.5s ease-out forwards'
                            }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center text-white`}>
                                <method.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                <span className={`font-medium ${themeStyles.text}`}>{method.label}</span>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Right: Smart Coins & Summary */}
                    <div>
                    
                    {/* Smart Coins Section */}
                    <div className="mb-6">
                        <h4 className={`text-lg font-semibold ${themeStyles.text} mb-4 flex items-center`}>
                        <Coins className="h-5 w-5 mr-2" />
                        Use Smart Coins
                        </h4>
                        
                        <div className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-lg p-4`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`${themeStyles.text}`}>Available Balance</span>
                            <span className={`font-bold ${themeStyles.accent}`}>
                                {smartCoinsBalance > 0 ? `${smartCoinsBalance} coins` : 'No coins available'}
                            </span>
                        </div>
                        
                        {smartCoinsBalance > 0 ? (
                            <>
                            <div className="mb-3">
                                <label className={`block text-sm font-medium ${themeStyles.text} mb-1`}>
                                Use coins (1 coin = ₹1)
                                </label>
                                <input
                                type="number"
                                min="0"
                                max={Math.min(smartCoinsBalance, cartTotal - couponDiscount)}
                                value={smartCoinsToUse || ''}
                                onChange={(e) => handleSmartCoinsChange(parseInt(e.target.value) || 0)}
                                className={`w-full p-2 border rounded-lg ${themeStyles.cardBg} ${themeStyles.border} ${themeStyles.text}`}
                                placeholder="Enter coins to use"
                                />
                                <p className={`text-xs ${themeStyles.textSecondary} mt-1`}>
                                    Maximum usable: {Math.min(smartCoinsBalance, cartTotal - couponDiscount)} coins
                                </p>
                            </div>
                            
                            {smartCoinsToUse > 0 && (
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded">
                                <p className="text-blue-700 dark:text-blue-300 text-sm">
                                    Using {smartCoinsToUse} coins = ₹{smartCoinsToUse} discount
                                </p>
                                </div>
                            )}
                            </>
                        ) : (
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded text-center">
                                <p className={`text-sm ${themeStyles.textSecondary}`}>
                                    You don't have any Smart Coins available
                                </p>
                            </div>
                        )}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className={`${themeStyles.headerBg} rounded-lg border ${themeStyles.border} p-4`}>
                        <h4 className={`text-lg font-semibold ${themeStyles.text} mb-4`}>Payment Summary</h4>
                        
                        <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className={`${themeStyles.textSecondary}`}>Subtotal</span>
                            <span className={`${themeStyles.text}`}>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        
                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-green-600">
                            <span>Coupon Discount</span>
                            <span>-₹{couponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        
                        {smartCoinsToUse > 0 && (
                            <div className="flex justify-between text-blue-600">
                            <span>Smart Coins Used</span>
                            <span>-₹{smartCoinsToUse.toFixed(2)}</span>
                            </div>
                        )}
                        
                        <div className={`border-t pt-2 mt-2 flex justify-between items-center ${themeStyles.border}`}>
                            <span className={`text-lg font-bold ${themeStyles.text}`}>Final Amount</span>
                            <span className={`text-lg font-bold ${themeStyles.accent}`}>
                            ₹{calculateFinalAmount().toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="pt-3 mt-3 border-t">
                            <div className="flex justify-between text-sm text-green-600">
                            <span>Smart Coins to Earn</span>
                            <span>+{Math.floor(calculateFinalAmount() * 0.01)} coins</span>
                            </div>
                        </div>
                        </div>
                        
                        {/* Proceed to Review */}
                        <button
                        onClick={() => {
                            setBillingStep('preview');
                            setTimeout(() => {
                                const modalContent = document.querySelector('.billing-modal-content');
                                if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }}
                        disabled={!selectedPaymentMethod}
                        className={`w-full mt-4 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                            selectedPaymentMethod
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        >
                        Review Order
                        </button>
                    </div>
                    </div>
                </div>

                {/* Error Message */}
                {billingError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{billingError}</p>
                    </div>
                )}
                    </div>
                </div>
            )}

            {/* Step 4: Bill Preview */}
            {billingStep === 'preview' && (
                <div className="h-[600px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
                    <div className="p-6 space-y-6">
                
                {/* Preview Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                    <h3 className={`text-2xl font-bold ${themeStyles.text} mb-2`}>Bill Preview</h3>
                    <p className={`${themeStyles.textSecondary}`}>Review your order before payment</p>
                    </div>
                    <button
                    onClick={() => {
                        setBillingStep('payment');
                        setTimeout(() => {
                            const modalContent = document.querySelector('.billing-modal-content');
                            if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 ${themeStyles.cardBg} border ${themeStyles.border} rounded-lg hover:${themeStyles.hoverBg} transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Payment</span>
                    </button>
                </div>

                {/* Scroll Indicator for Bill Preview */}
                <div className="text-center mb-4">
                    <p className="text-sm text-violet-600 dark:text-violet-400 flex items-center justify-center space-x-2">
                        <span>Scroll to review complete bill</span>
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-1 h-1 bg-violet-600 dark:bg-violet-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                    </p>
                </div>

                {/* Bill Preview Content */}
                <div className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-lg p-6`}>
                    
                    {/* Store Header */}
                    <div className="text-center mb-6 border-b pb-4">
                    <h2 className={`text-2xl font-bold ${themeStyles.accent}`}>StoreZen Retail</h2>
                    <p className={`${themeStyles.textSecondary}`}>Smart Shopping Experience</p>
                    <p className={`text-sm ${themeStyles.textSecondary}`}>Date: {new Date().toLocaleDateString()}</p>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6">
                    <h4 className={`font-semibold ${themeStyles.text} mb-2`}>Customer Information</h4>
                    <p className={`${themeStyles.textSecondary}`}>Name: {customerName}</p>
                    </div>

                    {/* Items List */}
                    <div className="mb-6">
                    <h4 className={`font-semibold ${themeStyles.text} mb-3`}>Items</h4>
                    <div className="space-y-2">
                        {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                            <div>
                            <span className={`${themeStyles.text}`}>{item.name}</span>
                            <span className={`text-sm ${themeStyles.textSecondary} ml-2`}>x{item.quantity}</span>
                            </div>
                            <span className={`${themeStyles.text}`}>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        ))}
                    </div>
                    </div>

                    {/* Bill Calculation */}
                    <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className={`${themeStyles.text}`}>Subtotal</span>
                        <span className={`${themeStyles.text}`}>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    
                    {couponDiscount > 0 && (
                        <div className="flex justify-between text-green-600">
                        <span>Coupon Discount ({appliedCoupon?.code})</span>
                        <span>-₹{couponDiscount.toFixed(2)}</span>
                        </div>
                    )}
                    
                    {smartCoinsToUse > 0 && (
                        <div className="flex justify-between text-blue-600">
                        <span>Smart Coins Used</span>
                        <span>-₹{smartCoinsToUse.toFixed(2)}</span>
                        </div>
                    )}
                    
                    <div className={`border-t pt-2 mt-4 flex justify-between items-center ${themeStyles.border}`}>
                        <span className={`text-xl font-bold ${themeStyles.text}`}>Total Amount</span>
                        <span className={`text-xl font-bold ${themeStyles.accent}`}>₹{calculateFinalAmount().toFixed(2)}</span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t space-y-1">
                        <div className="flex justify-between text-sm">
                        <span className={`${themeStyles.textSecondary}`}>Payment Method</span>
                        <span className={`${themeStyles.text}`}>{selectedPaymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm text-green-600">
                        <span>Smart Coins to Earn</span>
                        <span>+{Math.floor(calculateFinalAmount() * 0.01)} coins</span>
                        </div>
                    </div>
                    </div>
                </div>

                {/* Confirm Payment Button */}
                <button
                    onClick={processBilling}
                    disabled={billingLoading}
                    className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                    billingLoading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                >
                    {billingLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Processing Payment...</span>
                    </div>
                    ) : (
                    <>Pay ₹{calculateFinalAmount().toFixed(2)}</>
                    )}
                </button>

                {/* Error Message */}
                {billingError && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-600 dark:text-red-400 text-sm">{billingError}</p>
                    </div>
                )}
                    </div>
                </div>
            )}

            {/* Step 5: Payment Success */}
            {billingStep === 'success' && generatedBill && (
                <div className="p-6 space-y-6">
                
                {/* Success Animation */}
                {showPaymentSuccess && (
                    <div className="text-center py-12">
                    <div className="relative mx-auto w-20 h-20 mb-6">
                        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
                        <div className="relative bg-green-500 rounded-full w-20 h-20 flex items-center justify-center">
                        <CheckCircle className="h-10 w-10 text-white animate-bounce" />
                        </div>
                    </div>
                    <h3 className={`text-3xl font-bold text-green-600 mb-2`}>Payment Successful!</h3>
                    <p className={`text-lg ${themeStyles.textSecondary}`}>Your order has been processed</p>
                    </div>
                )}

                {/* Bill Details */}
                <div className={`${themeStyles.cardBg} border ${themeStyles.border} rounded-lg p-6`}>
                    <div className="text-center mb-6">
                    <h4 className={`text-xl font-bold ${themeStyles.accent}`}>Digital Receipt</h4>
                    <p className={`text-sm ${themeStyles.textSecondary}`}>Bill ID: {generatedBill.billId}</p>
                    <p className={`text-sm ${themeStyles.textSecondary}`}>
                        Date: {new Date(generatedBill.billDate).toLocaleDateString()} at {new Date(generatedBill.billDate).toLocaleTimeString()}
                    </p>
                    </div>

                    <div className="space-y-4">
                    <div className="flex justify-between">
                        <span className={`${themeStyles.text}`}>Items Purchased</span>
                        <span className={`${themeStyles.text}`}>{generatedBill.items.length} items</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={`${themeStyles.text}`}>Total Amount</span>
                        <span className={`text-lg font-bold ${themeStyles.accent}`}>₹{generatedBill.billing.finalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className={`${themeStyles.text}`}>Payment Method</span>
                        <span className={`${themeStyles.text}`}>{generatedBill.paymentMethod}</span>
                    </div>
                    {generatedBill.billing.smartCoinsEarned > 0 && (
                        <div className="flex justify-between text-green-600">
                        <span>Smart Coins Earned</span>
                        <span>+{generatedBill.billing.smartCoinsEarned} coins</span>
                        </div>
                    )}
                    <div className="flex justify-between text-blue-600">
                        <span>New Smart Coins Balance</span>
                        <span>{smartCoinsBalance} coins</span>
                    </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                    onClick={resetBillingModal}
                    className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                    New Order
                    </button>
                    <button
                    onClick={() => setShowSmartBillingModal(false)}
                    className="flex-1 py-3 px-6 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                    Close
                    </button>
                </div>
                </div>
            )}

            </div>
        </div>
        </div>

        {/* =============================================================================
            ANALYTICS MODAL - Comprehensive Spending Analytics Dashboard
            ============================================================================= */}
        {showAnalyticsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    
                    {/* Simple Modal Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <BarChart className="w-8 h-8 text-purple-600" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Your spending insights</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAnalyticsModal(false)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Simple Modal Content */}
                    <div className="p-6">
                        {analyticsLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
                                <span className="ml-4 text-lg text-gray-600 dark:text-gray-400">Loading analytics...</span>
                            </div>
                        ) : analyticsError ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="text-center">
                                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{analyticsError}</p>
                                    <button
                                        onClick={() => fetchAnalyticsData()}
                                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        ) : analyticsData ? (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analytics Data Loaded!</h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Total Spent: ₹{analyticsData.totalSpent || 0} | 
                                        Total Bills: {analyticsData.totalBills || 0}
                                    </p>
                                </div>
                                
                                {/* Show some basic data */}
                                {analyticsData.monthlySpending && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Monthly Spending:</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {analyticsData.monthlySpending.slice(0, 6).map((item, index) => (
                                                <div key={index} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{item.month}</div>
                                                    <div className="text-lg font-bold text-purple-600">₹{item.amount}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <BarChart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                                <p className="text-gray-600 dark:text-gray-400">Start shopping to see your analytics!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Floating Smart Billing Button - Always Accessible */}
        <div className="fixed bottom-6 right-6 z-50">
            <button
                onClick={() => showSmartBillingView()}
                className="group relative bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white p-4 rounded-full shadow-2xl hover:shadow-violet-500/25 transform hover:scale-110 transition-all duration-300 border-2 border-white/20"
                title="Quick Smart Billing Access"
            >
                <Receipt className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
                
                {/* Pulse Ring Animation */}
                <div className="absolute inset-0 rounded-full bg-violet-400 animate-ping opacity-20"></div>
                
                {/* Quick Access Indicator */}
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full border-2 border-white animate-bounce">
                    ⚡
                </div>
                
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                    <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                        Smart Billing - Instant Access
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </div>
            </button>
        </div>

        </>
    )}
    
    {/* =============================================================================
        SMART SHOPPING ASSISTANT MODAL
        ============================================================================= */}
    {showSmartShoppingAssistant && (
        <SmartShoppingAssistant
            isOpen={showSmartShoppingAssistant}
            onClose={() => setShowSmartShoppingAssistant(false)}
            currentTheme={currentTheme}
            themeStyles={themeStyles}
            onOpenSmartBilling={showSmartBillingView}
            onAddToCart={addToCart}
            cartItems={cart}
        />
    )}
    
    </div>
);
};

// =============================================================================
// EXPORT
// =============================================================================

export default Customer;