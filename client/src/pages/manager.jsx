import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useTheme, getThemeStyles } from "../components/theme";
import {
Card,
CardContent,
CardDescription,
CardHeader,
CardTitle,
} from "../components/ui/card";
import {
Package,
BarChart,
Megaphone,
Users,
Percent,
MessageCircle,
Heart,
Plus,
Send,
TrendingUp,
AlertTriangle,
Settings,
Calendar,
Clock,
Store,
ArrowLeft,
} from "lucide-react";

// API Configuration
const API_CONFIG = {
NODE_SERVER: 'http://localhost:8000',
DJANGO_SERVER: 'http://127.0.0.1:8000',
endpoints: {
manager: {
profile: '/manager/profile',
storeSettings: '/manager/store-settings'
},
django: {
products: '/api/products/'
}
}
};

const Manager = () => {
// Get theme from global context
const { currentTheme, setCurrentTheme } = useTheme();

// Trie implementation for efficient product search
class TrieNode {
constructor() {
    this.children = {};
    this.products = [];
}
}

class Trie {
constructor() {
this.root = new TrieNode();
}

insert(product) {
// Insert by product name
this.insertWord(product.name.toLowerCase(), product);
// Insert by category
this.insertWord(product.category.toLowerCase(), product);
}

insertWord(word, product) {
let node = this.root;
for (let char of word) {
if (!node.children[char]) {
node.children[char] = new TrieNode();
}
node = node.children[char];
node.products.push(product);
}
}

search(query) {
const lowerQuery = query.toLowerCase().trim();
if (!lowerQuery) return [];

let node = this.root;
for (let char of lowerQuery) {
if (!node.children[char]) {
return [];
}
node = node.children[char];
}

// Remove duplicates using Set with product id
const uniqueProducts = new Map();
for (let product of node.products) {
uniqueProducts.set(product.id, product);
}
return Array.from(uniqueProducts.values());
}
}

// Modal states
const [showInventoryOptions, setShowInventoryOptions] = useState(false);
const [showStockView, setShowStockView] = useState(false);
const [showAddProduct, setShowAddProduct] = useState(false);
const [showUpdateStock, setShowUpdateStock] = useState(false);
const [showRemoveProduct, setShowRemoveProduct] = useState(false);
const [showReportOptions, setShowReportOptions] = useState(false);
const [showOutOfStockSettings, setShowOutOfStockSettings] = useState(false);
const [showStoreSettings, setShowStoreSettings] = useState(false);
const [showThemeSettings, setShowThemeSettings] = useState(false);
const [showProfileSettings, setShowProfileSettings] = useState(false);

// Stock data state
const [stockData, setStockData] = useState([]);
const [stockLoading, setStockLoading] = useState(false);
const [stockError, setStockError] = useState(null);

// Search functionality state
const [searchQuery, setSearchQuery] = useState('');
const [filteredStockData, setFilteredStockData] = useState([]);
const [productTrie] = useState(() => new Trie());

// Search states for stock update and remove products
const [updateStockSearchQuery, setUpdateStockSearchQuery] = useState('');
const [filteredUpdateStockData, setFilteredUpdateStockData] = useState([]);
const [removeProductSearchQuery, setRemoveProductSearchQuery] = useState('');
const [filteredRemoveProductData, setFilteredRemoveProductData] = useState([]);

// Product form states
const [newProduct, setNewProduct] = useState({
name: '',
category: '',
price: '',
stock: ''
});
const [updateStockData, setUpdateStockData] = useState([]);
const [loading, setLoading] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
const [showAddMore, setShowAddMore] = useState(false);
const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
const [productToRemove, setProductToRemove] = useState(null);
const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
const [updateSuccess, setUpdateSuccess] = useState('');
const [showPdfSuccess, setShowPdfSuccess] = useState(false);

// Product name validation and suggestions
const [productSuggestions, setProductSuggestions] = useState([]);
const [showProductSuggestions, setShowProductSuggestions] = useState(false);
const [productNameError, setProductNameError] = useState('');
const [isValidatingProduct, setIsValidatingProduct] = useState(false);

// Category validation and suggestions
const [categorySuggestions, setCategorySuggestions] = useState([]);
const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
const [availableCategories, setAvailableCategories] = useState([]);

// Store theme configuration state (for database storage)
const [storeTheme, setStoreTheme] = useState(() => {
const saved = localStorage.getItem('managerStoreTheme');
return saved || 'dark';
});

// Get current theme styles from global context
const theme = getThemeStyles(currentTheme);

// Store details state (simplified - main data is in managerProfile.storeSettings)
const [storeDetails, setStoreDetails] = useState({
name: "StoreZen"
});

// Manager profile state
const [managerProfile, setManagerProfile] = useState({
id: null,
name: "Store Manager",
storeAddress: "",
email: "",
contact: "",
whatsappNumber: "",
lowStockThreshold: 10,
whatsappAlertsEnabled: true,
storeSettings: {
storeName: "StoreZen",
storeTheme: "dark",
currency: "₹",
timezone: "Asia/Kolkata"
}
});

// Loading states
const [profileLoading, setProfileLoading] = useState(false);

// Function to fetch manager profile from MongoDB
const fetchManagerProfile = async () => {
setProfileLoading(true);

try {
const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.manager.profile}`);
if (response.ok) {
const data = await response.json();
if (data.success) {
const manager = data.manager;
setManagerProfile({
    id: manager.id,
    name: manager.name,
    storeAddress: manager.storeAddress,
    email: manager.email,
    contact: manager.contact,
    whatsappNumber: manager.whatsappNumber || "",
    lowStockThreshold: manager.lowStockThreshold || 10,
    whatsappAlertsEnabled: manager.whatsappAlertsEnabled !== false,
    storeSettings: manager.storeSettings || {
    storeName: "StoreZen",
    storeTheme: "dark",
    currency: "₹",
    timezone: "Asia/Kolkata"
    }
});

// Store the manager's theme preference but don't force it on page load
const savedStoreTheme = manager.storeSettings?.storeTheme || 'dark';
setStoreTheme(savedStoreTheme);

// Only update localStorage for managerStoreTheme, don't override current theme
localStorage.setItem('managerStoreTheme', savedStoreTheme);

// Update store details
setStoreDetails(prev => ({
    ...prev,
    name: manager.storeSettings?.storeName || "StoreZen"
}));
}
} else {
throw new Error('Failed to fetch manager profile');
}
} catch (error) {
console.error('Error fetching manager profile:', error);
} finally {
setProfileLoading(false);
}
};

// Function to save manager profile to MongoDB
const saveManagerProfile = async () => {
setProfileLoading(true);

try {
const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.manager.profile}`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
name: managerProfile.name,
email: managerProfile.email,
storeAddress: managerProfile.storeAddress,
contact: managerProfile.contact
}),
});

if (response.ok) {
const data = await response.json();
if (data.success) {
return { success: true, message: data.message };
} else {
throw new Error(data.message || 'Failed to save profile');
}
} else {
throw new Error('Failed to save profile');
}
} catch (error) {
console.error('Error saving manager profile:', error);
return { success: false, message: error.message };
} finally {
setProfileLoading(false);
}
};

// Function to save WhatsApp alert settings to MongoDB
const saveWhatsAppSettings = async () => {
setProfileLoading(true);

try {
const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.manager.profile}`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
whatsappNumber: managerProfile.whatsappNumber,
lowStockThreshold: managerProfile.lowStockThreshold,
whatsappAlertsEnabled: managerProfile.whatsappAlertsEnabled
}),
});

if (response.ok) {
const data = await response.json();
if (data.success) {
return { success: true, message: data.message };
} else {
throw new Error(data.message || 'Failed to save WhatsApp settings');
}
} else {
throw new Error('Failed to save WhatsApp settings');
}
} catch (error) {
console.error('Error saving WhatsApp settings:', error);
return { success: false, message: error.message };
} finally {
setProfileLoading(false);
}
};

// Function to save store settings to MongoDB
const saveStoreSettings = async () => {
setProfileLoading(true);

try {
const response = await fetch(`${API_CONFIG.NODE_SERVER}${API_CONFIG.endpoints.manager.storeSettings}`, {
method: 'PUT',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
storeName: storeDetails.name,
storeTheme: storeTheme,
currency: managerProfile.storeSettings?.currency || "₹",
timezone: managerProfile.storeSettings?.timezone || "Asia/Kolkata"
}),
});

if (response.ok) {
const data = await response.json();
if (data.success) {
// Update local state
setManagerProfile(prev => ({
    ...prev,
    storeSettings: {
    ...prev.storeSettings,
    storeName: storeDetails.name,
    storeTheme: storeTheme
    }
}));

// Update global theme context
setCurrentTheme(storeTheme);

// Save manager's store theme separately for main page toggle
localStorage.setItem('managerStoreTheme', storeTheme);

// Update current theme in localStorage and dispatch event
localStorage.setItem('storeZenTheme', storeTheme);
localStorage.setItem('storeName', storeDetails.name);

// Trigger storage event to sync with main page
window.dispatchEvent(new StorageEvent('storage', {
    key: 'storeZenTheme',
    newValue: storeTheme,
    oldValue: localStorage.getItem('storeZenTheme')
}));

// Also dispatch managerStoreTheme event for main page toggle tracking
window.dispatchEvent(new StorageEvent('storage', {
    key: 'managerStoreTheme',
    newValue: storeTheme,
    oldValue: localStorage.getItem('managerStoreTheme')
}));

return { success: true, message: data.message || 'Store settings saved successfully!' };
} else {
throw new Error(data.message || 'Failed to save store settings');
}
} else {
throw new Error('Failed to save store settings');
}
} catch (error) {
console.error('Error saving store settings:', error);
return { success: false, message: error.message };
} finally {
setProfileLoading(false);
}
};

useEffect(() => {
// Load manager profile from MongoDB on component mount
fetchManagerProfile();

// Load stock data for validation
fetchStockData();

// Initialize store theme from manager profile when component mounts
const savedStoreTheme = localStorage.getItem('managerStoreTheme') || 'dark';
setStoreTheme(savedStoreTheme);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Listen for theme changes from other pages/tabs
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'managerStoreTheme' && e.newValue !== null) {
      setStoreTheme(e.newValue);
    }
    // Listen for theme changes from main page
    if (e.key === 'storeZenTheme' && e.newValue !== null) {
      setCurrentTheme(e.newValue);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);const inventoryFeatures = [
{
title: "View Product Inventory",
description: "Complete inventory management with real-time stock levels",
icon: Package,
color: "from-emerald-500 to-teal-500",
category: "inventory",
actions: ["View Stock", "Other Options"],
},
];

const analyticsFeatures = [
{
title: "View Sales Report",
description: "Comprehensive sales analytics with AI-driven insights",
icon: BarChart,
color: "from-purple-500 to-pink-500",
category: "analytics",
actions: ["View Report", "Download PDF"],
},
];

const marketingFeatures = [
{
title: "Send Promotional Messages",
description: "Launch targeted SMS campaigns via Twilio integration",
icon: Megaphone,
color: "from-cyan-500 to-blue-500",
category: "marketing",
actions: ["Send Now"],
},
{
title: "Add New Discount Coupons",
description: "Create and manage promotional discount codes",
icon: Percent,
color: "from-amber-500 to-orange-500",
category: "marketing",
actions: ["Add Coupon", "View Active"],
},
];

const customerFeatures = [
{
title: "View Customer Data",
description: "Customer insights and top purchased items analysis",
icon: Users,
color: "from-blue-500 to-indigo-500",
category: "customer",
actions: ["View Profiles", "Export Data"],
},
{
title: "View Feedbacks from Customers",
description: "Customer reviews and satisfaction analytics",
icon: Send,
color: "from-rose-500 to-pink-500",
category: "customer",
actions: ["View All", "Analytics"],
},
{
title: "View Wishlist Submitted by Customers",
description: "Customer wishlist requests for out-of-stock items",
icon: Heart,
color: "from-pink-500 to-rose-500",
category: "customer",
actions: ["View All"],
},
];

const systemFeatures = [
{
title: "View Chatbot Logs",
description: "Monitor AI chatbot interactions and performance",
icon: MessageCircle,
color: "from-violet-500 to-purple-500",
category: "system",
actions: ["View Logs", "Export Data"],
},
{
title: "Settings",
description: "Configure store settings and manager profile",
icon: Settings,
color: "from-gray-500 to-slate-500",
category: "system",
actions: ["Store Name", "Store Theme", "Profile"],
},
];

const allFeatures = [
...inventoryFeatures,
...analyticsFeatures,
...marketingFeatures,
...customerFeatures,
...systemFeatures,
];

const getCategoryTitle = (category) => {
const titles = {
inventory: "Inventory Management",
analytics: "Sales Analytics",
marketing: "Marketing Tools",
customer: "Customer Management",
system: "System Monitoring",
};
return titles[category];
};

const categories = ["inventory", "analytics", "marketing", "customer", "system"];

// Function to fetch stock data from Django backend
const fetchStockData = async () => {
setStockLoading(true);
setStockError(null);

try {
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}`);
if (!response.ok) {
throw new Error('Failed to fetch stock data');
}

const data = await response.json();
// Transform data to show only required fields
const transformedData = data.map(product => ({
id: product.id,
name: product.name,
category: product.category,
price: product.price,
stock: product.stock || 0 // Using the actual stock field from Django model
}));

// Clear and populate Trie with new data
productTrie.root = new TrieNode();
transformedData.forEach(product => {
productTrie.insert(product);
});

setStockData(transformedData);
setFilteredStockData(transformedData);
setUpdateStockData(transformedData);
// Initialize filtered data for stock update and remove products
setFilteredUpdateStockData(transformedData);
setFilteredRemoveProductData(transformedData);

// Extract unique categories for suggestions
const categories = [...new Set(transformedData.map(product => product.category))];
setAvailableCategories(categories);

} catch (error) {
console.error('Error fetching stock data:', error);
setStockError('Failed to load stock data. Please try again.');
} finally {
setStockLoading(false);
}
};

// Utility function to capitalize first letter of each word
const capitalizeWords = (str) => {
return str.replace(/\b\w/g, char => char.toUpperCase());
};

// Function to normalize product name for comparison
const normalizeProductName = (name) => {
return name.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Function to validate product name and check for duplicates
const validateProductName = async (inputName) => {
if (!inputName.trim()) {
setProductNameError('');
setProductSuggestions([]);
setShowProductSuggestions(false);
return;
}

setIsValidatingProduct(true);
const normalizedInput = normalizeProductName(inputName);

// Find similar products in stock data
const similarProducts = stockData.filter(product => {
const normalizedProductName = normalizeProductName(product.name);
return normalizedProductName.includes(normalizedInput) || 
       normalizedInput.includes(normalizedProductName);
});

if (similarProducts.length > 0) {
// Check for exact match
const exactMatch = similarProducts.find(product => 
normalizeProductName(product.name) === normalizedInput
);

if (exactMatch) {
setProductNameError('This product already exists in your inventory!');
setProductSuggestions([]);
setShowProductSuggestions(false);
} else {
setProductNameError('');
setProductSuggestions(similarProducts);
setShowProductSuggestions(true);
}
} else {
setProductNameError('');
setProductSuggestions([]);
setShowProductSuggestions(false);
}

setIsValidatingProduct(false);
};

// Function to validate and suggest categories
const validateCategory = (inputCategory) => {
if (!inputCategory.trim()) {
setCategorySuggestions([]);
setShowCategorySuggestions(false);
return;
}

const normalizedInput = inputCategory.toLowerCase().trim();
const matchingCategories = availableCategories.filter(category =>
category.toLowerCase().includes(normalizedInput)
);

if (matchingCategories.length > 0) {
setCategorySuggestions(matchingCategories);
setShowCategorySuggestions(true);
} else {
setCategorySuggestions([]);
setShowCategorySuggestions(false);
}
};

// Function to handle product name input
const handleProductNameChange = (value) => {
const capitalizedValue = capitalizeWords(value);
setNewProduct({...newProduct, name: capitalizedValue});

// Debounce validation
clearTimeout(window.productNameTimeout);
window.productNameTimeout = setTimeout(() => {
validateProductName(capitalizedValue);
}, 300);
};

// Function to handle category input
const handleCategoryChange = (value) => {
const capitalizedValue = capitalizeWords(value);
setNewProduct({...newProduct, category: capitalizedValue});
validateCategory(capitalizedValue);
};

// Function to add new product
const addProduct = async () => {
// Validate all fields
if (!newProduct.name.trim()) {
setProductNameError('Product name is required');
return;
}

if (!newProduct.category.trim()) {
return;
}

if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
return;
}

if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
return;
}

// Check for exact product name match
const exactMatch = stockData.find(product => 
normalizeProductName(product.name) === normalizeProductName(newProduct.name)
);

if (exactMatch) {
setProductNameError('This product already exists in your inventory!');
return;
}

setLoading(true);
setProductNameError('');

try {
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}`, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
name: newProduct.name.trim(),
category: newProduct.category.trim(),
price: parseFloat(newProduct.price),
stock: parseInt(newProduct.stock),
demand: 'normal' // Default demand level
}),
});

if (!response.ok) {
throw new Error('Failed to add product');
}

// Show success animation
setShowSuccess(true);
setNewProduct({ name: '', category: '', price: '', stock: '' });
setProductSuggestions([]);
setShowProductSuggestions(false);
setCategorySuggestions([]);
setShowCategorySuggestions(false);

// After 2 seconds, show "add more" modal
setTimeout(() => {
setShowSuccess(false);
setShowAddMore(true);
}, 2000);

fetchStockData(); // Refresh data
} catch (error) {
console.error('Error adding product:', error);
setProductNameError('Failed to add product. Please try again.');
} finally {
setLoading(false);
}
};
// Function to update stock
const updateStock = async (productId, newStock) => {
setLoading(true);
try {
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}${productId}/`, {
method: 'PATCH',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
stock: parseInt(newStock)
}),
});

if (!response.ok) {
throw new Error('Failed to update stock');
}

// Show success tick for this specific product
setUpdateSuccess(productId);
setTimeout(() => setUpdateSuccess(''), 2000);

fetchStockData(); // Refresh data
} catch (error) {
console.error('Error updating stock:', error);
alert('Failed to update stock. Please try again.');
} finally {
setLoading(false);
}
};

// Function to remove product
const removeProduct = async (productId) => {
setLoading(true);
try {
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}${productId}/`, {
method: 'DELETE',
});

if (!response.ok) {
throw new Error('Failed to remove product');
}

// Close confirmation modal and refresh data
setShowRemoveConfirm(false);
setProductToRemove(null);
fetchStockData(); // Refresh data
} catch (error) {
console.error('Error removing product:', error);
alert('Failed to remove product. Please try again.');
} finally {
setLoading(false);
}
};

// Function to clear all products
const clearAllProducts = async () => {
setLoading(true);
try {
// Get all products first
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}`);
if (!response.ok) {
throw new Error('Failed to fetch products');
}

const products = await response.json();

if (products.length === 0) {
alert('No products found to clear.');
return;
}

// Delete each product
const deletePromises = products.map(product => 
fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}${product.id}/`, {
method: 'DELETE',
})
);

await Promise.all(deletePromises);

// Refresh data
fetchStockData();
alert(`Successfully cleared ${products.length} products from your inventory!`);
} catch (error) {
console.error('Error clearing all products:', error);
alert('Failed to clear all products. Please try again.');
} finally {
setLoading(false);
}
};// Handle search functionality
const handleSearch = (query) => {
setSearchQuery(query);

if (!query.trim()) {
setFilteredStockData(stockData);
return;
}

console.log('Searching for:', query);
console.log('Stock data available:', stockData.length);

// Fallback to simple filter if Trie search fails
try {
const searchResults = productTrie.search(query);
console.log('Trie search results:', searchResults.length);

if (searchResults.length === 0) {
// Fallback to simple string search
const fallbackResults = stockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
console.log('Fallback search results:', fallbackResults.length);
setFilteredStockData(fallbackResults);
} else {
setFilteredStockData(searchResults);
}
} catch (error) {
console.error('Search error:', error);
// Fallback to simple filter
const fallbackResults = stockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
setFilteredStockData(fallbackResults);
}
};

// Search function for stock update modal
const handleUpdateStockSearch = (query) => {
setUpdateStockSearchQuery(query);

if (!query.trim()) {
setFilteredUpdateStockData(updateStockData);
return;
}

try {
const searchResults = productTrie.search(query);
if (searchResults.length === 0) {
// Fallback to simple string search
const fallbackResults = updateStockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
setFilteredUpdateStockData(fallbackResults);
} else {
// Filter search results to only include products in updateStockData
const filteredResults = searchResults.filter(searchProduct => 
updateStockData.some(updateProduct => updateProduct.id === searchProduct.id)
);
setFilteredUpdateStockData(filteredResults);
}
} catch (error) {
console.error('Update stock search error:', error);
// Fallback to simple filter
const fallbackResults = updateStockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
setFilteredUpdateStockData(fallbackResults);
}
};

// Search function for remove products modal
const handleRemoveProductSearch = (query) => {
setRemoveProductSearchQuery(query);

if (!query.trim()) {
setFilteredRemoveProductData(stockData);
return;
}

try {
const searchResults = productTrie.search(query);
if (searchResults.length === 0) {
// Fallback to simple string search
const fallbackResults = stockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
setFilteredRemoveProductData(fallbackResults);
} else {
setFilteredRemoveProductData(searchResults);
}
} catch (error) {
console.error('Remove product search error:', error);
// Fallback to simple filter
const fallbackResults = stockData.filter(product => 
product.name.toLowerCase().includes(query.toLowerCase()) ||
product.category.toLowerCase().includes(query.toLowerCase())
);
setFilteredRemoveProductData(fallbackResults);
}
};

// Function to download stock PDF report
const downloadStockPDF = async () => {
    try {
        console.log('Starting PDF download...');
        setStockLoading(true);
        
        const response = await fetch('http://127.0.0.1:8000/api/manager/download-stock-pdf/', {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'Content-Type': 'application/json',
            },
            mode: 'cors', // Explicitly set CORS mode
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        // Get the content-disposition header to extract filename
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'stock_inventory.pdf';
        
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch) {
                filename = filenameMatch[1];
            }
        } else {
            // Fallback filename with current date
            const currentDate = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
            filename = `stock_inventory_${currentDate}.pdf`;
        }

        console.log('Using filename:', filename);

        // Create blob from response
        const blob = await response.blob();
        console.log('Blob size:', blob.size, 'bytes');

        if (blob.size === 0) {
            throw new Error('Received empty PDF file');
        }

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // Add to DOM, trigger download, then cleanup
        document.body.appendChild(link);
        link.click();
        
        // Cleanup after a short delay
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }, 100);

        console.log('PDF download initiated successfully');
        
        // Show success modal instead of alert
        setShowPdfSuccess(true);
        
        // Auto-hide the modal after 3 seconds
        setTimeout(() => {
            setShowPdfSuccess(false);
        }, 3000);
        
    } catch (error) {
        console.error('Detailed PDF download error:', error);
        console.error('Error stack:', error.stack);
        
        // More specific error messages
        if (error.message.includes('Failed to fetch')) {
            alert('❌ Network error: Unable to connect to server. Please check if the Django server is running on port 8000.');
        } else if (error.message.includes('HTTP error')) {
            alert(`❌ Server error: ${error.message}. Please check the server logs.`);
        } else {
            alert(`❌ Download failed: ${error.message}. Please try again or check the console for more details.`);
        }
    } finally {
        setStockLoading(false);
    }
};

const handleInventoryClick = (action) => {
if (action === "Other Options") {
setShowInventoryOptions(true);
// Refresh stock data for validation
fetchStockData();
} else if (action === "View Stock") {
setShowStockView(true);
setSearchQuery(''); // Reset search when opening
fetchStockData();
}
};

// Helper function to close add product and return to inventory options
const handleCancelAddProduct = () => {
setShowAddProduct(false);
setShowInventoryOptions(true);
setNewProduct({ name: '', category: '', price: '', stock: '' });
setProductNameError('');
setProductSuggestions([]);
setShowProductSuggestions(false);
setCategorySuggestions([]);
setShowCategorySuggestions(false);
};

const handleReportClick = (action) => {
if (action === "View Report") {
setShowReportOptions(true);
}
};

const handleSettingsClick = (action) => {
if (action === "Store Name") {
setShowStoreSettings(true);
} else if (action === "Store Theme") {
setShowThemeSettings(true);
} else if (action === "Profile") {
setShowProfileSettings(true);
}
};

const handleStoreDetailsChange = (field, value) => {
if (field === 'name') {
setStoreDetails(prev => ({
...prev,
[field]: value
}));
}
};

const saveStoreSettingsLocal = async () => {
const result = await saveStoreSettings();
if (result.success) {
setShowStoreSettings(false);
alert(`✅ ${result.message}`);
} else {
alert(`❌ Failed to save settings: ${result.message}`);
}
};

const saveThemeSettingsLocal = async () => {
const result = await saveStoreSettings();
if (result.success) {
setShowThemeSettings(false);
alert(`✅ ${result.message}`);
} else {
alert(`❌ Failed to save theme: ${result.message}`);
}
};

const renderInventoryModal = () => {
if (!showInventoryOptions) return null;

return (
<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
<div className="relative w-full max-w-md">
{/* Floating particles background - reduced for mobile */}
<div className="absolute inset-0 overflow-hidden rounded-2xl">
<div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-20"></div>
<div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
<div className="absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full animate-bounce opacity-25"></div>
<div className="absolute bottom-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-15"></div>
</div>

{/* Main modal container with glassmorphism */}
<div className={`relative rounded-2xl p-4 sm:p-6 w-full shadow-2xl backdrop-blur-xl border border-white/20 ${theme.cardBg}/90 max-h-[90vh] overflow-y-auto`}
     style={{
       background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
       boxShadow: '0 25px 45px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
     }}>
     
{/* Animated header with holographic effect */}
<div className="text-center mb-4 sm:mb-6">
<div className="relative inline-block">
<h3 className={`text-xl sm:text-2xl font-bold ${theme.text} bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>
Inventory Center
</h3>
<div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-lg blur opacity-20"></div>
</div>
<p className={`mt-1 ${theme.textSecondary} text-xs sm:text-sm opacity-80`}>
Choose your action
</p>
</div>

{/* Interactive action cards */}
<div className="space-y-3">
{/* Add Products Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-white/10`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-green-500/10 transition-all duration-300"
onClick={() => {
setShowInventoryOptions(false);
setShowAddProduct(true);
fetchStockData();
}}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-all duration-300">
<Plus className="h-4 w-4 text-green-400 group-hover:rotate-90 transition-transform duration-300" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm ${theme.text} group-hover:text-green-400 transition-colors duration-300`}>Add Products</h4>
<p className={`text-xs ${theme.textSecondary} opacity-70 truncate`}>Expand inventory</p>
</div>
</div>
</Button>
</div>
</div>

{/* Stock Update Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-white/10`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-blue-500/10 transition-all duration-300"
onClick={() => {
setShowInventoryOptions(false);
setShowUpdateStock(true);
setUpdateStockSearchQuery('');
fetchStockData();
}}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-all duration-300">
<Settings className="h-4 w-4 text-blue-400 group-hover:rotate-90 transition-transform duration-300" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm ${theme.text} group-hover:text-blue-400 transition-colors duration-300`}>Stock Update</h4>
<p className={`text-xs ${theme.textSecondary} opacity-70 truncate`}>Modify quantities</p>
</div>
</div>
</Button>
</div>
</div>

{/* Remove Products Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-white/10`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-red-500/10 transition-all duration-300"
onClick={() => {
setShowInventoryOptions(false);
setShowRemoveProduct(true);
setRemoveProductSearchQuery('');
fetchStockData();
}}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-all duration-300">
<AlertTriangle className="h-4 w-4 text-red-400" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm ${theme.text} group-hover:text-red-400 transition-colors duration-300`}>Remove Products</h4>
<p className={`text-xs ${theme.textSecondary} opacity-70 truncate`}>Delete items</p>
</div>
</div>
</Button>
</div>
</div>

{/* Danger Zone Separator */}
<div className="relative my-3">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-red-500/30"></div>
</div>
<div className="relative flex justify-center text-xs">
<span className={`bg-red-500/20 px-2 py-1 rounded-full text-red-400 font-medium backdrop-blur-sm`}>
Danger
</span>
</div>
</div>

{/* Clear All Products Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-red-500/20`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-red-500/10 transition-all duration-300"
onClick={() => {
setShowInventoryOptions(false);
setShowClearAllConfirm(true);
}}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-red-600/20 rounded-lg group-hover:bg-red-600/30 transition-all duration-300">
<AlertTriangle className="h-4 w-4 text-red-500" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm text-red-400 group-hover:text-red-300 transition-colors duration-300`}>Clear All Products</h4>
<p className={`text-xs text-red-500/70 opacity-70 truncate`}>⚠️ Cannot be undone</p>
</div>
</div>
</Button>
</div>
</div>

{/* Advanced Features Separator */}
<div className="relative my-3">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-purple-500/30"></div>
</div>
<div className="relative flex justify-center text-xs">
<span className={`bg-purple-500/20 px-2 py-1 rounded-full text-purple-400 font-medium backdrop-blur-sm`}>
Advanced
</span>
</div>
</div>

{/* WhatsApp Alerts Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-white/10`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-orange-500/10 transition-all duration-300"
onClick={() => {
setShowInventoryOptions(false);
setShowOutOfStockSettings(true);
}}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-all duration-300">
<MessageCircle className="h-4 w-4 text-orange-400" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm ${theme.text} group-hover:text-orange-400 transition-colors duration-300`}>WhatsApp Alerts</h4>
<p className={`text-xs ${theme.textSecondary} opacity-70 truncate`}>Smart notifications</p>
</div>
</div>
</Button>
</div>
</div>

{/* High Demand Items Card */}
<div className="group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
<div className={`rounded-lg p-3 ${theme.cardBg} h-full backdrop-blur-sm border border-white/10`}>
<Button 
className="w-full bg-transparent text-left p-0 h-auto justify-start group-hover:bg-purple-500/10 transition-all duration-300"
onClick={() => setShowInventoryOptions(false)}
>
<div className="flex items-center space-x-3 w-full">
<div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-all duration-300">
<TrendingUp className="h-4 w-4 text-purple-400" />
</div>
<div className="flex-1 min-w-0">
<h4 className={`font-semibold text-sm ${theme.text} group-hover:text-purple-400 transition-colors duration-300`}>High Demand Items</h4>
<p className={`text-xs ${theme.textSecondary} opacity-70 truncate`}>Analytics & insights</p>
</div>
</div>
</Button>
</div>
</div>
</div>

{/* Close button with neon effect */}
<div className="mt-4 text-center">
<Button 
variant="outline" 
className={`px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30 ${theme.text} hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-sm`}
onClick={() => setShowInventoryOptions(false)}
>
<ArrowLeft className="mr-1 h-3 w-3" />
Close
</Button>
</div>
</div>
</div>
</div>
);
};

const renderAddProductModal = () => {
if (!showAddProduct) return null;

// Success animation modal
if (showSuccess) {
return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
<div className="animate-bounce text-6xl mb-4">
<svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
</svg>
</div>
<h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>
    Product Added Successfully!
</h3>
<p className={`${theme.textSecondary} text-lg`}>
    Your product has been added to inventory
</p>
</div>
</div>
);
}

// Add more confirmation modal
if (showAddMore) {
return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
<h3 className={`text-2xl font-bold mb-6 ${theme.text}`}>
    Add Another Product?
</h3>
<p className={`mb-8 ${theme.textSecondary}`}>
    Would you like to add more products to your inventory?
</p>
<div className="flex space-x-4">
    <Button 
    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg"
    onClick={() => {
        setShowAddMore(false);
        // Reset all validation states
        setProductNameError('');
        setProductSuggestions([]);
        setShowProductSuggestions(false);
        setCategorySuggestions([]);
        setShowCategorySuggestions(false);
    }}
    >
    Yes, Add More
    </Button>
    <Button 
    variant="outline" 
    className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
    onClick={() => {
        setShowAddMore(false);
        setShowAddProduct(false);
        setShowInventoryOptions(true);
        // Reset all validation states
        setProductNameError('');
        setProductSuggestions([]);
        setShowProductSuggestions(false);
        setCategorySuggestions([]);
        setShowCategorySuggestions(false);
    }}
    >
    Done
    </Button>
</div>
</div>
</div>
);
}

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border max-h-[90vh] overflow-y-auto`}>
<div className="flex items-center justify-between mb-8">
<h3 className={`text-2xl font-bold ${theme.text}`}>
Add New Product
</h3>
<button 
onClick={handleCancelAddProduct}
className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${theme.textSecondary} hover:${theme.text}`}
>
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
</svg>
</button>
</div>

<div className="space-y-6">
{/* Product Name with Smart Validation */}
<div className="space-y-2">
<label className={`block text-sm font-semibold ${theme.text}`}>
Product Name
</label>
<div className="relative">
<input
type="text"
value={newProduct.name}
onChange={(e) => handleProductNameChange(e.target.value)}
className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm ${
productNameError ? 'border-red-400 focus:border-red-500 bg-red-50' : `${theme.border} focus:border-blue-400 ${theme.cardBg}`
} ${theme.text} placeholder-gray-400`}
placeholder="Enter product name"
/>
{isValidatingProduct && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
</div>
)}
{!isValidatingProduct && newProduct.name && !productNameError && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
</svg>
</div>
</div>
)}
</div>

{/* Error Message */}
{productNameError && (
<div className="mt-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
<div className="flex items-center space-x-2">
<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
</svg>
<span>{productNameError}</span>
</div>
</div>
)}

{/* Similar Products Suggestions */}
{showProductSuggestions && productSuggestions.length > 0 && (
<div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
<div className="flex items-center space-x-2 mb-3">
<svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
</svg>
<span className="text-amber-800 font-medium">Similar products found</span>
</div>
<div className="space-y-2">
{productSuggestions.map((product) => (
<div key={product.id} className="flex items-center justify-between p-2 bg-white rounded border">
<span className="text-amber-700 font-medium">{product.name}</span>
<span className="text-amber-600 bg-amber-100 px-2 py-1 rounded-full text-xs">
Stock: {product.stock}
</span>
</div>
))}
</div>
<p className="text-amber-600 text-xs mt-2">
Make sure your product name is unique and descriptive
</p>
</div>
)}
</div>

{/* Category with Smart Suggestions */}
<div className="space-y-2">
<label className={`block text-sm font-semibold ${theme.text}`}>
Category
</label>
<div className="relative">
<input
type="text"
value={newProduct.category}
onChange={(e) => handleCategoryChange(e.target.value)}
className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border} focus:border-blue-400 placeholder-gray-400`}
placeholder="Enter category"
/>
{newProduct.category && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
</svg>
</div>
</div>
)}
</div>

{/* Category Suggestions */}
{showCategorySuggestions && categorySuggestions.length > 0 && (
<div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
<div className="flex items-center space-x-2 mb-3">
<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
</svg>
<span className="text-blue-800 font-medium">Existing categories</span>
</div>
<div className="flex flex-wrap gap-2">
{categorySuggestions.map((category, index) => (
<button
key={index}
onClick={() => {
setNewProduct({...newProduct, category});
setShowCategorySuggestions(false);
}}
className="text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-full text-sm transition-colors duration-200 border border-blue-300"
>
{category}
</button>
))}
</div>
</div>
)}
</div>

{/* Price and Stock Row */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div className="space-y-2">
<label className={`block text-sm font-semibold ${theme.text}`}>
Price (₹)
</label>
<div className="relative">
<input
type="number"
step="0.01"
min="0"
value={newProduct.price}
onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border} focus:border-blue-400 placeholder-gray-400`}
placeholder="0.00"
/>
{newProduct.price && parseFloat(newProduct.price) > 0 && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
</svg>
</div>
</div>
)}
</div>
</div>

<div className="space-y-2">
<label className={`block text-sm font-semibold ${theme.text}`}>
Initial Stock
</label>
<div className="relative">
<input
type="number"
min="0"
value={newProduct.stock}
onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border} focus:border-blue-400 placeholder-gray-400`}
placeholder="0"
/>
{newProduct.stock && parseInt(newProduct.stock) >= 0 && (
<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
<div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
</svg>
</div>
</div>
)}
</div>
</div>
</div>
</div>

{/* Action Buttons */}
<div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
<Button 
className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
onClick={addProduct}
disabled={loading || !!productNameError || !newProduct.name.trim() || !newProduct.category.trim() || !newProduct.price || !newProduct.stock}
>
{loading ? (
<div className="flex items-center justify-center">
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
Adding Product...
</div>
) : (
'Add Product'
)}
</Button>
<Button 
variant="outline" 
className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${theme.border} ${theme.text} hover:bg-gray-50`}
onClick={handleCancelAddProduct}
>
Cancel
</Button>
</div>
</div>
</div>
);
};

const renderUpdateStockModal = () => {
if (!showUpdateStock) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className={`rounded-xl p-4 md:p-8 w-full max-w-sm md:max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<div className="flex justify-between items-center mb-6">
<h3 className={`text-xl md:text-2xl font-bold ${theme.text}`}>
Update Stock Levels
</h3>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10 p-2`}
onClick={() => {
setShowUpdateStock(false);
setShowInventoryOptions(true);
}}
>
← Back
</Button>
</div>

{/* Search Bar */}
<div className="mb-6">
<div className="relative">
<input
type="text"
placeholder="Search products by name or category..."
value={updateStockSearchQuery}
onChange={(e) => handleUpdateStockSearch(e.target.value)}
className={`w-full px-4 py-3 pl-12 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
/>
<div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`}>
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
</div>
{updateStockSearchQuery && (
<button
    onClick={() => handleUpdateStockSearch('')}
    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}
>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
</button>
)}
</div>
{updateStockSearchQuery && (
<p className={`text-sm mt-2 ${theme.textSecondary}`}>
Found {filteredUpdateStockData.length} product(s) matching "{updateStockSearchQuery}"
</p>
)}
</div>

{stockLoading && (
<div className="flex justify-center items-center py-12">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
<span className={`ml-4 text-lg ${theme.text}`}>Loading products...</span>
</div>
)}

{!stockLoading && filteredUpdateStockData.length > 0 && (
<div className="space-y-4">
{/* Desktop Header - Hidden on mobile */}
<div className={`hidden md:grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
<div className={`${theme.text}`}>Product Name</div>
<div className={`${theme.text}`}>Category</div>
<div className={`${theme.text}`}>Current Stock</div>
<div className={`${theme.text}`}>Actions</div>
</div>

{filteredUpdateStockData.map((product) => (
<div 
key={product.id} 
className={`rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-purple-500/5`}
>
{/* Mobile Layout - Stack vertically */}
<div className="md:hidden p-4 space-y-3">
<div className={`font-medium ${theme.text} text-lg`}>
{product.name}
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Category:</span>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
{product.category}
</span>
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Current Stock:</span>
<span className={`font-semibold text-lg ${theme.text}`}>
{product.stock}
</span>
</div>
<div className="flex items-center space-x-2 justify-between">
<span className={`text-sm ${theme.textSecondary}`}>New Stock:</span>
<div className="flex items-center space-x-2">
<input
type="number"
defaultValue={product.stock}
min="0"
className={`w-16 px-2 py-1 rounded border text-center ${theme.cardBg} ${theme.text} ${theme.border}`}
id={`stock-${product.id}`}
/>
<Button
size="sm"
className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg rounded px-3 py-1 text-sm flex items-center"
onClick={() => {
    const newStockValue = document.getElementById(`stock-${product.id}`).value;
    updateStock(product.id, newStockValue);
}}
disabled={loading}
>
{updateSuccess === product.id ? (
    <span className="text-green-500">Updated</span>
) : (
    'Update'
)}
</Button>
</div>
</div>
</div>

{/* Desktop Layout - Grid */}
<div className="hidden md:grid grid-cols-4 gap-4 p-4">
<div className={`font-medium ${theme.text} flex items-center`}>
{product.name}
</div>
<div className={`${theme.textSecondary} flex items-center`}>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
{product.category}
</span>
</div>
<div className={`font-semibold text-lg ${theme.text} flex items-center`}>
{product.stock}
</div>
<div className="flex items-center space-x-2">
<input
type="number"
defaultValue={product.stock}
min="0"
className={`w-20 px-2 py-1 rounded border text-center ${theme.cardBg} ${theme.text} ${theme.border}`}
id={`stock-desktop-${product.id}`}
/>
<Button
size="sm"
className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg rounded px-3 py-1 text-sm flex items-center"
onClick={() => {
    const newStockValue = document.getElementById(`stock-desktop-${product.id}`).value;
    updateStock(product.id, newStockValue);
}}
disabled={loading}
>
{updateSuccess === product.id ? (
    <span className="text-green-500">Updated</span>
) : (
    'Update'
)}
</Button>
</div>
</div>
</div>
))}
</div>
)}

{!stockLoading && filteredUpdateStockData.length === 0 && updateStockData.length > 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
<p className="text-lg">No products found matching "{updateStockSearchQuery}"</p>
<button 
onClick={() => handleUpdateStockSearch('')}
className="mt-2 text-purple-600 hover:text-purple-800 underline"
>
Clear search to see all products
</button>
</div>
)}

{!stockLoading && updateStockData.length === 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
<p className="text-lg">No products found</p>
</div>
)}

<div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10 w-full md:w-auto`}
onClick={() => {
setShowUpdateStock(false);
setShowInventoryOptions(true);
}}
>
← Back
</Button>
</div>
</div>
</div>
);
};

const renderRemoveProductModal = () => {
if (!showRemoveProduct) return null;

// Confirmation modal for removal
if (showRemoveConfirm && productToRemove) {
return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className={`rounded-xl p-4 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
<div className="text-4xl md:text-6xl mb-4">
<svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
</svg>
</div>
<h3 className={`text-xl md:text-2xl font-bold mb-4 ${theme.text}`}>
    Remove Product?
</h3>
<p className={`mb-2 ${theme.text} font-medium`}>
    {productToRemove.name}
</p>
<p className={`mb-8 ${theme.textSecondary} text-sm md:text-base`}>
    This action cannot be undone. The product will be permanently removed from your inventory.
</p>
<div className="flex space-x-4">
    <Button 
    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg rounded-lg py-3"
    onClick={() => removeProduct(productToRemove.id)}
    disabled={loading}
    >
    {loading ? 'Removing...' : 'Yes, Remove'}
    </Button>
    <Button 
    variant="outline" 
    className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10 py-3`}
    onClick={() => {
        setShowRemoveConfirm(false);
        setProductToRemove(null);
    }}
    >
    ← Back
    </Button>
</div>
</div>
</div>
);
}

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className={`rounded-xl p-4 md:p-8 w-full max-w-sm md:max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<div className="flex justify-between items-center mb-6">
<h3 className={`text-xl md:text-2xl font-bold ${theme.text}`}>
Remove Products
</h3>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10 p-2`}
onClick={() => {
setShowRemoveProduct(false);
setShowInventoryOptions(true);
}}
>
← Back
</Button>
</div>

{/* Search Bar */}
<div className="mb-6">
<div className="relative">
<input
type="text"
placeholder="Search products by name or category..."
value={removeProductSearchQuery}
onChange={(e) => handleRemoveProductSearch(e.target.value)}
className={`w-full px-4 py-3 pl-12 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
/>
<div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`}>
<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
</div>
{removeProductSearchQuery && (
<button
    onClick={() => handleRemoveProductSearch('')}
    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}
>
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
</button>
)}
</div>
{removeProductSearchQuery && (
<p className={`text-sm mt-2 ${theme.textSecondary}`}>
Found {filteredRemoveProductData.length} product(s) matching "{removeProductSearchQuery}"
</p>
)}
</div>

{stockLoading && (
<div className="flex justify-center items-center py-12">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
<span className={`ml-4 text-lg ${theme.text}`}>Loading products...</span>
</div>
)}

{!stockLoading && filteredRemoveProductData.length > 0 && (
<div className="space-y-4">
{/* Desktop Header - Hidden on mobile */}
<div className={`hidden md:grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
<div className={`${theme.text}`}>Product Name</div>
<div className={`${theme.text}`}>Category</div>
<div className={`${theme.text}`}>Stock</div>
<div className={`${theme.text}`}>Action</div>
</div>

{filteredRemoveProductData.map((product) => (
<div 
key={product.id} 
className={`rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-red-500/5`}
>
{/* Mobile Layout - Stack vertically */}
<div className="md:hidden p-4 space-y-3">
<div className={`font-medium ${theme.text} text-lg`}>
{product.name}
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Category:</span>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
{product.category}
</span>
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Stock:</span>
<span className={`font-semibold ${theme.text}`}>
{product.stock}
</span>
</div>
<div className="flex justify-center pt-2">
<Button
size="sm"
className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg rounded px-6 py-2 text-sm w-full"
onClick={() => {
    setProductToRemove(product);
    setShowRemoveConfirm(true);
}}
disabled={loading}
>
Remove
</Button>
</div>
</div>

{/* Desktop Layout - Grid */}
<div className="hidden md:grid grid-cols-4 gap-4 p-4">
<div className={`font-medium ${theme.text} flex items-center`}>
{product.name}
</div>
<div className={`${theme.textSecondary} flex items-center`}>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
{product.category}
</span>
</div>
<div className={`font-semibold ${theme.text} flex items-center`}>
{product.stock}
</div>
<div className="flex items-center">
<Button
size="sm"
className="bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg rounded px-4 py-2 text-sm"
onClick={() => {
    setProductToRemove(product);
    setShowRemoveConfirm(true);
}}
disabled={loading}
>
Remove
</Button>
</div>
</div>
</div>
))}
</div>
)}

{!stockLoading && filteredRemoveProductData.length === 0 && stockData.length > 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
<p className="text-lg">No products found matching "{removeProductSearchQuery}"</p>
<button 
onClick={() => handleRemoveProductSearch('')}
className="mt-2 text-purple-600 hover:text-purple-800 underline"
>
Clear search to see all products
</button>
</div>
)}

{!stockLoading && stockData.length === 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
<p className="text-lg">No products found</p>
</div>
)}

<div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10 w-full md:w-auto`}
onClick={() => {
setShowRemoveProduct(false);
setShowInventoryOptions(true);
}}
>
← Back
</Button>
</div>
</div>
</div>
);
};

const renderClearAllProductsModal = () => {
if (!showClearAllConfirm) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
<div className={`rounded-xl p-4 md:p-8 w-full max-w-sm md:max-w-md shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
<div className="text-4xl md:text-6xl mb-4">
<svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
</svg>
</div>
<h3 className={`text-xl md:text-2xl font-bold mb-4 ${theme.text}`}>
Clear All Products?
</h3>
<p className={`mb-8 ${theme.textSecondary} text-sm md:text-base`}>
This will permanently delete ALL products from your inventory. This action cannot be undone.
</p>
<div className="flex space-x-4">
<Button 
className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg rounded-lg py-3"
onClick={() => {
clearAllProducts();
setShowClearAllConfirm(false);
}}
disabled={loading}
>
{loading ? 'Clearing...' : 'Yes, Clear All'}
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10 py-3`}
onClick={() => {
setShowClearAllConfirm(false);
setShowInventoryOptions(true);
}}
>
Cancel
</Button>
</div>
</div>
</div>
);
};

const renderStockViewModal = () => {
if (!showStockView) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className={`rounded-2xl p-4 md:p-8 w-full max-w-sm md:max-w-4xl shadow-2xl max-h-[90vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
        {/* Header with Back Button */}
        <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl md:text-2xl font-bold ${theme.text}`}>
                Stock Inventory Overview
            </h3>
            <Button 
                variant="outline" 
                className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10 p-2`}
                onClick={() => setShowStockView(false)}
            >
                ← Back
            </Button>
        </div>

        {/* Action Buttons Section */}
        <div className={`mb-6 p-4 rounded-lg border ${theme.cardBg} ${theme.border}`}>
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                {/* Product Count */}
                <div className={`text-lg font-semibold ${theme.text} flex items-center`}>
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    <span>
                        {searchQuery ? 
                            `Showing ${filteredStockData.length} of ${stockData.length} products` : 
                            `Total Products: ${stockData.length}`
                        }
                    </span>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
                    <Button 
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg w-full md:w-auto px-4 py-2"
                        onClick={downloadStockPDF}
                        disabled={stockLoading}
                    >
                        📄 Download PDF
                    </Button>
                    <Button 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg rounded-lg w-full md:w-auto px-4 py-2 flex items-center justify-center"
                        onClick={() => fetchStockData()}
                        disabled={stockLoading}
                    >
                        <svg 
                            className={`w-4 h-4 mr-2 ${stockLoading ? 'animate-spin' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                            />
                        </svg>
                        {stockLoading ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>
            </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search products by name or category..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={`w-full px-4 py-3 pl-12 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
                />
                <div className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textSecondary}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {searchQuery && (
                    <button
                        onClick={() => handleSearch('')}
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            {searchQuery && (
                <p className={`text-sm mt-2 ${theme.textSecondary}`}>
                    Found {filteredStockData.length} product(s) matching "{searchQuery}"
                </p>
            )}
        </div>

{stockLoading && (
<div className="flex justify-center items-center py-12">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
<span className={`ml-4 text-lg ${theme.text}`}>Loading stock data...</span>
</div>
)}

{stockError && (
<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
<strong>Error:</strong> {stockError}
</div>
)}

{!stockLoading && !stockError && filteredStockData.length > 0 && (
<div className="space-y-4">
{/* Desktop Header - Hidden on mobile */}
<div className={`hidden md:grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
<div className={`${theme.text}`}>Product Name</div>
<div className={`${theme.text}`}>Category</div>
<div className={`${theme.text}`}>Stock Count</div>
<div className={`${theme.text}`}>Status</div>
</div>

{/* Data Rows */}
{filteredStockData.map((product) => (
<div 
key={product.id} 
className={`rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-purple-500/5`}
>
{/* Mobile Layout - Stack vertically */}
<div className="md:hidden p-4 space-y-3">
<div className={`font-medium ${theme.text} text-lg`}>
{product.name}
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Category:</span>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
{product.category}
</span>
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Stock:</span>
<span className={`font-semibold text-lg ${theme.text}`}>
{product.stock}
</span>
</div>
<div className="flex items-center justify-between">
<span className={`text-sm ${theme.textSecondary}`}>Status:</span>
<div>
{product.stock > 50 ? (
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
    In Stock
</span>
) : product.stock > 10 ? (
<span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
    Low Stock
</span>
) : product.stock >= 1 ? (
<span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
    Last Few
</span>
) : (
<span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
    Out of Stock
</span>
)}
</div>
</div>
</div>

{/* Desktop Layout - Grid */}
<div className="hidden md:grid grid-cols-4 gap-4 p-4">
<div className={`font-medium ${theme.text}`}>
{product.name}
</div>
<div className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${theme.textSecondary}`}>
<span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
{product.category}
</span>
</div>
<div className={`font-semibold text-lg ${theme.text}`}>
{product.stock}
</div>
<div>
{product.stock > 50 ? (
<span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
    In Stock
</span>
) : product.stock > 10 ? (
<span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
    Low Stock
</span>
) : product.stock >= 1 ? (
<span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
    Last Few
</span>
) : (
<span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
    Out of Stock
</span>
)}
</div>
</div>
</div>
))}
</div>
)}

{!stockLoading && !stockError && filteredStockData.length === 0 && stockData.length > 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
</svg>
<p className="text-lg">No products found matching "{searchQuery}"</p>
<button 
onClick={() => handleSearch('')}
className="mt-2 text-purple-600 hover:text-purple-800 underline"
>
Clear search to see all products
</button>
</div>
)}

{!stockLoading && !stockError && stockData.length === 0 && (
<div className={`text-center py-12 ${theme.textSecondary}`}>
<Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
<p className="text-lg">No products found in inventory</p>
</div>
)}

</div>
</div>
);
};

const renderOutOfStockModal = () => {
if (!showOutOfStockSettings) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border max-h-[80vh] overflow-y-auto`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
WhatsApp Low Stock Alerts
</h3>
<div className="space-y-6">
{/* Enable WhatsApp Alerts Toggle */}
<div className="flex items-center justify-between">
<div>
<span className={`text-lg font-medium ${theme.text}`}>Enable WhatsApp Alerts</span>
<p className={`text-sm ${theme.textSecondary}`}>Get instant notifications on WhatsApp</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input 
type="checkbox" 
className="sr-only peer" 
checked={managerProfile.whatsappAlertsEnabled}
onChange={(e) => setManagerProfile({...managerProfile, whatsappAlertsEnabled: e.target.checked})}
/>
<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
</label>
</div>

{/* WhatsApp Number Input */}
<div>
<label className={`block text-lg font-medium mb-2 ${theme.text}`}>
WhatsApp Number
</label>
<input
type="tel"
value={managerProfile.whatsappNumber}
onChange={(e) => setManagerProfile({...managerProfile, whatsappNumber: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="+1234567890 (include country code)"
/>
<p className={`text-sm mt-1 ${theme.textSecondary}`}>Include country code (e.g., +1234567890)</p>
</div>

{/* Alert Threshold */}
<div>
<label className={`block text-lg font-medium mb-2 ${theme.text}`}>
Alert Threshold
</label>
<div className="flex items-center space-x-4">
<input 
type="range" 
min="1" 
max="100" 
value={managerProfile.lowStockThreshold} 
onChange={(e) => setManagerProfile({...managerProfile, lowStockThreshold: parseInt(e.target.value)})}
className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
/>
<span className="text-xl font-bold text-blue-600 min-w-[3rem]">{managerProfile.lowStockThreshold}</span>
</div>
<p className={`text-sm mt-2 ${theme.textSecondary}`}>Alert when stock falls below this number</p>
</div>
</div>

<div className="flex space-x-4 mt-8">
<Button 
className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg rounded-xl"
onClick={async () => {
const result = await saveWhatsAppSettings();
if (result.success) {
setShowOutOfStockSettings(false);
alert('✅ WhatsApp alert settings saved successfully!');
} else {
alert(`❌ Failed to save settings: ${result.message}`);
}
}}
>
Save Settings
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-xl backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowOutOfStockSettings(false)}
>
← Back
</Button>
</div>
</div>
</div>
);
};

const renderReportModal = () => {
if (!showReportOptions) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
Select Report Type
</h3>
<div className="space-y-4">
<Button 
className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg rounded-xl py-3"
onClick={() => setShowReportOptions(false)}
>
<Clock className="mr-2 h-5 w-5" />
Today's Report
</Button>
<Button 
className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:shadow-lg rounded-xl py-3"
onClick={() => setShowReportOptions(false)}
>
<Calendar className="mr-2 h-5 w-5" />
Monthly Report
</Button>
<Button 
className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg rounded-xl py-3"
onClick={() => setShowReportOptions(false)}
>
<BarChart className="mr-2 h-5 w-5" />
Yearly Report
</Button>
</div>
<Button 
variant="outline" 
className={`w-full mt-6 rounded-xl backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowReportOptions(false)}
>
Cancel
</Button>
</div>
</div>
);
};

const renderStoreSettingsModal = () => {
if (!showStoreSettings) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
Edit Store Name
</h3>

<div className="space-y-4">
<div>
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Store Name
</label>
<input
type="text"
value={storeDetails.name}
onChange={(e) => handleStoreDetailsChange('name', e.target.value)}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter store name"
/>
</div>
</div>

<div className="flex space-x-4 mt-8">
<Button 
className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg rounded-lg"
onClick={saveStoreSettingsLocal}
disabled={profileLoading}
>
{profileLoading ? 'Saving...' : 'Save Changes'}
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowStoreSettings(false)}
>
Cancel
</Button>
</div>
</div>
</div>
);
};

const renderProfileSettingsModal = () => {
if (!showProfileSettings) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
Manager Profile
</h3>

<div className="space-y-6">
<div className="relative">
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Manager Name
</label>
<div className="relative">
<input
type="text"
value={managerProfile.name}
onChange={(e) => setManagerProfile({...managerProfile, name: e.target.value})}
className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter manager name"
disabled={profileLoading}
/>
<button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
</button>
</div>
</div>

<div className="relative">
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Store Address
</label>
<div className="relative">
<textarea
value={managerProfile.storeAddress}
onChange={(e) => setManagerProfile({...managerProfile, storeAddress: e.target.value})}
rows={3}
className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter store address"
disabled={profileLoading}
/>
<button className={`absolute right-3 top-3 ${theme.textSecondary} hover:${theme.text}`}>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
</button>
</div>
</div>

<div className="relative">
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Email Address
</label>
<div className="relative">
<input
type="email"
value={managerProfile.email}
onChange={(e) => setManagerProfile({...managerProfile, email: e.target.value})}
className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter email address"
disabled={profileLoading}
/>
<button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
</button>
</div>
</div>

<div className="relative">
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Contact Number
</label>
<div className="relative">
<input
type="tel"
value={managerProfile.contact}
onChange={(e) => setManagerProfile({...managerProfile, contact: e.target.value})}
className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter contact number"
disabled={profileLoading}
/>
<button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${theme.textSecondary} hover:${theme.text}`}>
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
    </svg>
</button>
</div>
</div>
</div>

<div className="flex space-x-4 mt-8">
<Button 
className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg"
onClick={async () => {
const result = await saveManagerProfile();
if (result.success) {
setShowProfileSettings(false);
alert('✅ Manager profile saved successfully!');
} else {
alert(`❌ Failed to save profile: ${result.message}`);
}
}}
disabled={profileLoading}
>
{profileLoading ? 'Saving...' : 'Save Profile'}
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowProfileSettings(false)}
>
Cancel
</Button>
</div>
</div>
</div>
);
};

const renderThemeSettingsModal = () => {
if (!showThemeSettings) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
Configure Store Theme
</h3>

<div className="space-y-6">
<div>
<label className={`block text-sm font-medium mb-3 ${theme.textSecondary}`}>
Choose your store's theme for customers
</label>
<div className="grid grid-cols-2 gap-3">
{[
    { value: 'dark', label: '🌙 Dark', desc: 'Modern & sleek' },
    { value: 'christmas', label: '🎄 Christmas', desc: 'Holiday spirit' },
    { value: 'halloween', label: '🎃 Halloween', desc: 'Spooky fun' },
    { value: 'cyberpunk', label: '🌟 Cyberpunk', desc: 'Futuristic' },
    { value: 'diwali', label: '🪔 Diwali', desc: 'Festival of lights' }
].map((themeOption) => (
    <div
    key={themeOption.value}
    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
        storeTheme === themeOption.value
        ? 'border-purple-500 bg-purple-500/10'
        : `${theme.border} hover:border-purple-300 hover:bg-purple-500/5`
    }`}
    onClick={() => setStoreTheme(themeOption.value)}
    >
    <div className={`font-medium text-sm ${theme.text}`}>
        {themeOption.label}
    </div>
    <div className={`text-xs ${theme.textSecondary}`}>
        {themeOption.desc}
    </div>
    </div>
))}
</div>
</div>

<div className={`p-4 rounded-lg ${theme.gradientOverlay} border ${theme.border}`}>
<p className={`text-sm ${theme.textSecondary}`}>
💡 <strong>How it works:</strong> The main page toggle will switch between Light mode and your selected store theme.
</p>
</div>
</div>

<div className="flex space-x-4 mt-8">
<Button 
className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg rounded-lg"
onClick={saveThemeSettingsLocal}
disabled={profileLoading}
>
{profileLoading ? 'Saving...' : 'Save Theme'}
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowThemeSettings(false)}
>
Cancel
</Button>
</div>
</div>
</div>
);
};

return (
<div className={`min-h-screen transition-all duration-500 ${theme.bg}`}>
{/* Animated Background Elements for Seasonal Themes */}
{currentTheme === 'christmas' && (
<div className="fixed inset-0 pointer-events-none overflow-hidden">
<div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>❄️</div>
<div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🎄</div>
<div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🎅</div>
<div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>⭐</div>
<div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🎁</div>
</div>
)}

{currentTheme === 'halloween' && (
<div className="fixed inset-0 pointer-events-none overflow-hidden">
<div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🎃</div>
<div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>👻</div>
<div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🦇</div>
<div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🕷️</div>
<div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🧙</div>
</div>
)}

{currentTheme === 'cyberpunk' && (
<div className="fixed inset-0 pointer-events-none overflow-hidden">
<div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🌟</div>
<div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>⚡</div>
<div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🔮</div>
<div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>💎</div>
<div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🌌</div>
</div>
)}

{currentTheme === 'ocean' && (
<div className="fixed inset-0 pointer-events-none overflow-hidden">
<div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🌊</div>
<div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🐚</div>
<div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>🐠</div>
<div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🦀</div>
<div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🐙</div>
</div>
)}

{currentTheme === 'diwali' && (
<div className="fixed inset-0 pointer-events-none overflow-hidden">
<div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🪔</div>
<div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🎆</div>
<div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>✨</div>
<div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🌟</div>
<div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🎇</div>
</div>
)}

{/* Header - Enhanced with Theme Selector */}
<header className={`backdrop-blur-md shadow-lg border-b transition-all duration-500 ${theme.navBg} ${theme.border}`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
{/* Logo */}
<div className="flex items-center space-x-3">
<Store className={`h-8 w-8 ${theme.accent}`} />
<span className={`text-2xl font-bold ${theme.text}`}>
StoreZen
</span>
{currentTheme === 'christmas' && <span className="text-xl">🎄</span>}
{currentTheme === 'halloween' && <span className="text-xl">🎃</span>}
{currentTheme === 'cyberpunk' && <span className="text-xl">🌟</span>}
{currentTheme === 'ocean' && <span className="text-xl">🌊</span>}
{currentTheme === 'diwali' && <span className="text-xl">🪔</span>}
</div>

{/* Theme Selector & Controls */}
<div className="flex items-center space-x-6">
<Link to="/">
<Button
variant="outline"
className={`flex items-center space-x-2 transition-all duration-200 backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
>
<ArrowLeft className="h-4 w-4" />
<span>Back to Home</span>
</Button>
</Link>
</div>
</div>
</div>
</header>

{/* Main Content */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
{/* Page Title */}
<div className="text-center mb-16">
<h1 className={`text-4xl md:text-5xl font-bold mb-4 ${theme.text} drop-shadow-lg`}>
Manager Dashboard
</h1>
<p className={`text-xl max-w-3xl mx-auto ${theme.textSecondary}`}>
Complete retail management suite with AI-powered insights and automation
</p>
{/* Theme decorations */}
{currentTheme === 'christmas' && (
<div className="flex justify-center items-center space-x-2 mt-4">
<span className="text-2xl">🎄</span>
<span className="text-lg text-red-600 font-semibold">Happy Holidays!</span>
<span className="text-2xl">🎅</span>
</div>
)}
{currentTheme === 'halloween' && (
<div className="flex justify-center items-center space-x-2 mt-4">
<span className="text-2xl">🎃</span>
<span className="text-lg text-orange-600 font-semibold">Spooky Management!</span>
<span className="text-2xl">👻</span>
</div>
)}
</div>

{/* Feature Cards */}
{categories.map((category) => {
const categoryFeatures = allFeatures.filter(
(feature) => feature.category === category
);
if (categoryFeatures.length === 0) return null;

return (
<div key={category} className="mb-16">
<h2 className={`text-3xl font-bold mb-8 text-center ${theme.text}`}>
{getCategoryTitle(category)}
</h2>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{categoryFeatures.map((feature, index) => (
<Card
key={feature.title}
className={`group transition-all duration-300 cursor-pointer border rounded-xl relative overflow-hidden backdrop-blur-sm ${theme.cardBg} ${theme.border} ${theme.hover} hover:-translate-y-1`}
>
{/* Gradient overlay for hover effect */}
<div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${theme.gradientOverlay} rounded-xl`}></div>

<CardHeader className="text-center pb-4 relative z-10">
<div
className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300 relative`}
>
<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
<feature.icon className="h-8 w-8 text-white relative z-10" />
</div>
<CardTitle className={`text-xl font-semibold leading-tight ${theme.text}`}>
{feature.title}
</CardTitle>
</CardHeader>
<CardContent className="text-center px-6 pb-6 relative z-10">
<CardDescription className={`leading-relaxed mb-6 ${theme.textSecondary}`}>
{feature.description}
</CardDescription>
<div className="space-y-2">
{feature.actions.map((action, i) => (
    <Button
    key={i}
    size="sm"
    className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-lg font-medium py-2 backdrop-blur-sm ${
        i === 0 ? "ring-2 ring-purple-200" : "opacity-95"
    }`}
    onClick={() => {
        if (feature.title === "View Product Inventory") {
            handleInventoryClick(action);
        } else if (feature.title === "View Sales Report" && action === "View Report") {
            handleReportClick(action);
        } else if (feature.title === "Settings" && (action === "Store Name" || action === "Store Theme" || action === "Profile" || action === "Stock Alerts")) {
            handleSettingsClick(action);
        }
    }}
    >
    {action}
    </Button>
))}
</div>
</CardContent>
</Card>
))}
</div>
</div>
);
})}

{/* Management Stats */}
<div className={`mt-20 rounded-xl shadow-lg p-8 md:p-12 backdrop-blur-sm ${theme.cardBg} ${theme.border} border`}>
<h2 className={`text-3xl font-bold text-center mb-12 ${theme.text}`}>
Platform Overview
</h2>
<div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
<div className="space-y-2">
<div className={`text-4xl font-bold ${theme.accent}`}>2,847</div>
<div className={`font-medium ${theme.textSecondary}`}>Active Products</div>
</div>
<div className="space-y-2">
<div className="text-4xl font-bold text-blue-600">1,234</div>
<div className={`font-medium ${theme.textSecondary}`}>Customer Requests</div>
</div>
<div className="space-y-2">
<div className="text-4xl font-bold text-purple-600">$125K</div>
<div className={`font-medium ${theme.textSecondary}`}>Monthly Revenue</div>
</div>
<div className="space-y-2">
<div className="text-4xl font-bold text-pink-600">4.8 Stars</div>
<div className={`font-medium ${theme.textSecondary}`}>Customer Rating</div>
</div>
</div>
</div>

{/* System Health */}
<div className={`mt-12 rounded-xl p-8 shadow-lg border backdrop-blur-sm ${theme.cardBg} ${theme.border}`}>
<h3 className={`text-2xl font-bold mb-8 text-center ${theme.accent}`}>
System Health Monitor
</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
<div className={`space-y-2 p-4 rounded-lg shadow-sm backdrop-blur-sm ${theme.cardBg} ${theme.border} border`}>
<div className="text-3xl font-bold text-green-600">99.9%</div>
<div className={`font-medium ${theme.textSecondary}`}>System Uptime</div>
</div>
<div className={`space-y-2 p-4 rounded-lg shadow-sm backdrop-blur-sm ${theme.cardBg} ${theme.border} border`}>
<div className="text-3xl font-bold text-blue-600">1.2s</div>
<div className={`font-medium ${theme.textSecondary}`}>Response Time</div>
</div>
<div className={`space-y-2 p-4 rounded-lg shadow-sm backdrop-blur-sm ${theme.cardBg} ${theme.border} border`}>
<div className={`text-3xl font-bold ${theme.accent}`}>AI</div>
<div className={`font-medium ${theme.textSecondary}`}>Powered Analytics</div>
</div>
</div>
</div>
</div>

{/* Modals */}
{renderInventoryModal()}
{renderAddProductModal()}
{renderUpdateStockModal()}
{renderRemoveProductModal()}
{renderClearAllProductsModal()}
{renderStockViewModal()}
{renderOutOfStockModal()}
{renderReportModal()}
{renderStoreSettingsModal()}
{renderThemeSettingsModal()}
{renderProfileSettingsModal()}

{/* PDF Download Success Modal */}
{showPdfSuccess && (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
<div className="animate-bounce text-6xl mb-4">
<svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
</svg>
</div>
<h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>
    PDF Downloaded Successfully!
</h3>
<p className={`${theme.textSecondary} text-lg`}>
    Your stock inventory report has been saved to your downloads folder
</p>
<Button 
    className="mt-6 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg"
    onClick={() => setShowPdfSuccess(false)}
>
    Got it!
</Button>
</div>
</div>
)}
</div>
);
};

export default Manager;