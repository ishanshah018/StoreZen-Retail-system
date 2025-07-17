import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
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
const [updateSuccess, setUpdateSuccess] = useState('');// Store theme configuration state
const [storeTheme, setStoreTheme] = useState(() => {
const saved = localStorage.getItem('storeZenTheme');
return saved || 'dark';
});

// Theme management system
const [currentTheme, setCurrentTheme] = useState(() => {
const saved = localStorage.getItem('storeZenTheme');
return saved || 'dark';
});

// Theme styles configuration
const themeStyles = {
light: {
bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
cardBg: 'bg-white',
text: 'text-gray-900',
textSecondary: 'text-gray-600',
accent: 'text-purple-600',
border: 'border-gray-200',
hover: 'hover:shadow-xl hover:shadow-purple-500/20',
gradientOverlay: 'bg-gradient-to-r from-purple-600/10 to-pink-600/10'
},
dark: {
bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
cardBg: 'bg-gray-800',
text: 'text-white',
textSecondary: 'text-gray-300',
accent: 'text-purple-400',
border: 'border-gray-700',
hover: 'hover:shadow-xl hover:shadow-purple-500/30',
gradientOverlay: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20'
},
christmas: {
bg: 'bg-gradient-to-br from-red-50 via-green-50 to-red-50',
cardBg: 'bg-white/90 backdrop-blur-sm border-red-200',
text: 'text-green-800',
textSecondary: 'text-red-700',
accent: 'text-red-600',
border: 'border-red-200',
hover: 'hover:shadow-xl hover:shadow-red-500/20 hover:border-green-300',
gradientOverlay: 'bg-gradient-to-r from-red-500/20 to-green-500/20'
},
halloween: {
bg: 'bg-gradient-to-br from-orange-100 via-purple-50 to-orange-100',
cardBg: 'bg-gray-900/90 backdrop-blur-sm border-orange-400',
text: 'text-orange-200',
textSecondary: 'text-purple-300',
accent: 'text-orange-400',
border: 'border-orange-400',
hover: 'hover:shadow-xl hover:shadow-orange-500/30 hover:border-purple-400',
gradientOverlay: 'bg-gradient-to-r from-orange-500/20 to-purple-500/20'
},
cyberpunk: {
bg: 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900',
cardBg: 'bg-gray-800/90 backdrop-blur-sm border-cyan-400',
text: 'text-cyan-100',
textSecondary: 'text-purple-300',
accent: 'text-cyan-400',
border: 'border-cyan-400',
hover: 'hover:shadow-xl hover:shadow-cyan-500/30 hover:border-purple-400',
gradientOverlay: 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20'
},
diwali: {
bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
cardBg: 'bg-white/90 backdrop-blur-sm border-yellow-300',
text: 'text-orange-900',
textSecondary: 'text-red-700',
accent: 'text-yellow-600',
border: 'border-yellow-300',
hover: 'hover:shadow-xl hover:shadow-yellow-500/20 hover:border-orange-300',
gradientOverlay: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
}
};

// Get current theme styles
const theme = themeStyles[currentTheme] || themeStyles.dark;

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
},
permissions: {
canManageInventory: true,
canViewAnalytics: true,
canManageCustomers: true,
canConfigureStore: true
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
        },
        permissions: manager.permissions || {
        canManageInventory: true,
        canViewAnalytics: true,
        canManageCustomers: true,
        canConfigureStore: true
        }
    });
    
    // Update current theme
    setStoreTheme(manager.storeSettings?.storeTheme || 'dark');
    setCurrentTheme(manager.storeSettings?.storeTheme || 'dark');
    
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
    
    setCurrentTheme(storeTheme);
    
    // Trigger storage event to sync with main page
    window.dispatchEvent(new StorageEvent('storage', {
        key: 'storeZenTheme',
        newValue: storeTheme,
        oldValue: localStorage.getItem('storeZenTheme')
    }));
    
    // Still update localStorage for compatibility
    localStorage.setItem('storeZenTheme', storeTheme);
    localStorage.setItem('storeName', storeDetails.name);
    
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

// Apply theme to document
// Remove all theme classes first
document.documentElement.classList.remove('dark', 'christmas', 'halloween', 'cyberpunk', 'diwali');

// Add current theme class (light doesn't need a class)
if (currentTheme !== 'light') {
document.documentElement.classList.add(currentTheme);
}
}, [currentTheme]);

// Listen for theme changes from other pages/tabs
useEffect(() => {
const handleStorageChange = (e) => {
if (e.key === 'storeZenTheme' && e.newValue !== null) {
setCurrentTheme(e.newValue);
}
};

window.addEventListener('storage', handleStorageChange);
return () => window.removeEventListener('storage', handleStorageChange);
}, []);

const inventoryFeatures = [
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
} catch (error) {
console.error('Error fetching stock data:', error);
setStockError('Failed to load stock data. Please try again.');
} finally {
setStockLoading(false);
}
};

// Function to add new product
const addProduct = async () => {
if (!newProduct.name || !newProduct.category || !newProduct.price || !newProduct.stock) {
alert('Please fill all fields');
return;
}

setLoading(true);
try {
const response = await fetch(`${API_CONFIG.DJANGO_SERVER}${API_CONFIG.endpoints.django.products}`, {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json',
    },
    body: JSON.stringify({
    name: newProduct.name,
    category: newProduct.category,
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

// After 2 seconds, show "add more" modal
setTimeout(() => {
    setShowSuccess(false);
    setShowAddMore(true);
}, 2000);

fetchStockData(); // Refresh data
} catch (error) {
console.error('Error adding product:', error);
alert('Failed to add product. Please try again.');
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

const handleInventoryClick = (action) => {
if (action === "Other Options") {
setShowInventoryOptions(true);
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
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
📦 Inventory Management
</h3>
<div className="space-y-4">
<Button 
className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg rounded-xl py-3"
onClick={() => {
setShowInventoryOptions(false);
setShowAddProduct(true);
}}
>
<Plus className="mr-2 h-5 w-5" />
Add New Products
</Button>
<Button 
className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg rounded-xl py-3"
onClick={() => {
setShowInventoryOptions(false);
setShowUpdateStock(true);
fetchStockData();
}}
>
<Settings className="mr-2 h-5 w-5" />
Stock Update
</Button>
<Button 
className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg rounded-xl py-3"
onClick={() => {
setShowInventoryOptions(false);
setShowRemoveProduct(true);
fetchStockData();
}}
>
<AlertTriangle className="mr-2 h-5 w-5" />
Remove Products
</Button>
<div className="border-t pt-4">
<Button 
className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg rounded-xl py-3"
onClick={() => {
    setShowInventoryOptions(false);
    setShowOutOfStockSettings(true);
}}
>
<AlertTriangle className="mr-2 h-5 w-5" />
📱 WhatsApp Stock Alerts
</Button>
<Button 
className="w-full bg-gradient-to-r from-purple-500 to-violet-500 hover:shadow-lg rounded-xl py-3 mt-2"
onClick={() => setShowInventoryOptions(false)}
>
<TrendingUp className="mr-2 h-5 w-5" />
View High Demand Items
</Button>
</div>
</div>
<Button 
variant="outline" 
className={`w-full mt-6 rounded-xl backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowInventoryOptions(false)}
>
Cancel
</Button>
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
    <div className="animate-bounce text-6xl mb-4">✅</div>
    <h3 className={`text-2xl font-bold mb-2 ${theme.text}`}>
        Product Added Successfully!
    </h3>
    <p className={`${theme.textSecondary}`}>
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
        🛍️ Add Another Product?
    </h3>
    <p className={`mb-8 ${theme.textSecondary}`}>
        Would you like to add more products to your inventory?
    </p>
    <div className="flex space-x-4">
        <Button 
        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg"
        onClick={() => {
            setShowAddMore(false);
            // Stay in add product modal
        }}
        >
        ➕ Yes, Add More
        </Button>
        <Button 
        variant="outline" 
        className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
        onClick={() => {
            setShowAddMore(false);
            setShowAddProduct(false);
            setShowInventoryOptions(true);
        }}
        >
        ✅ Done
        </Button>
    </div>
    </div>
</div>
);
}

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<h3 className={`text-2xl font-bold mb-6 text-center ${theme.text}`}>
➕ Add New Product
</h3>

<div className="space-y-4">
<div>
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Product Name
</label>
<input
type="text"
value={newProduct.name}
onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter product name"
/>
</div>

<div>
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Category
</label>
<input
type="text"
value={newProduct.category}
onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter category"
/>
</div>

<div>
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Price (₹)
</label>
<input
type="number"
step="0.01"
value={newProduct.price}
onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter price"
/>
</div>

<div>
<label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
Initial Stock
</label>
<input
type="number"
value={newProduct.stock}
onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 backdrop-blur-sm ${theme.cardBg} ${theme.text} ${theme.border}`}
placeholder="Enter stock quantity"
/>
</div>
</div>

<div className="flex space-x-4 mt-8">
<Button 
className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg rounded-lg"
onClick={addProduct}
disabled={loading}
>
{loading ? 'Adding...' : 'Add Product'}
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={handleCancelAddProduct}
>
← Back
</Button>
</div>
</div>
</div>
);
};

const renderUpdateStockModal = () => {
if (!showUpdateStock) return null;

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<div className="flex justify-between items-center mb-6">
<h3 className={`text-2xl font-bold ${theme.text}`}>
📦 Update Stock Levels
</h3>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-red-500/10`}
onClick={() => setShowUpdateStock(false)}
>
✕
</Button>
</div>

{stockLoading && (
<div className="flex justify-center items-center py-12">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
<span className={`ml-4 text-lg ${theme.text}`}>Loading products...</span>
</div>
)}

{!stockLoading && updateStockData.length > 0 && (
<div className="space-y-4">
<div className={`grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
<div className={`${theme.text}`}>Product Name</div>
<div className={`${theme.text}`}>Category</div>
<div className={`${theme.text}`}>Current Stock</div>
<div className={`${theme.text}`}>Actions</div>
</div>

{updateStockData.map((product) => (
<div 
key={product.id} 
className={`grid grid-cols-4 gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-purple-500/5`}
>
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
        <span className="animate-bounce text-green-500">✅</span>
    ) : (
        'Update'
    )}
    </Button>
</div>
</div>
))}
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
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10`}
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
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
    <div className={`rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl backdrop-blur-md ${theme.cardBg} ${theme.border} border text-center`}>
    <div className="text-6xl mb-4">⚠️</div>
    <h3 className={`text-2xl font-bold mb-4 ${theme.text}`}>
        Remove Product?
    </h3>
    <p className={`mb-2 ${theme.text} font-medium`}>
        {productToRemove.name}
    </p>
    <p className={`mb-8 ${theme.textSecondary}`}>
        This action cannot be undone. The product will be permanently removed from your inventory.
    </p>
    <div className="flex space-x-4">
        <Button 
        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg rounded-lg"
        onClick={() => removeProduct(productToRemove.id)}
        disabled={loading}
        >
        {loading ? 'Removing...' : '🗑️ Yes, Remove'}
        </Button>
        <Button 
        variant="outline" 
        className={`flex-1 rounded-lg backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
        onClick={() => {
            setShowRemoveConfirm(false);
            setProductToRemove(null);
        }}
        >
        Cancel
        </Button>
    </div>
    </div>
</div>
);
}

return (
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
<div className={`rounded-xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<div className="flex justify-between items-center mb-6">
<h3 className={`text-2xl font-bold ${theme.text}`}>
🗑️ Remove Products
</h3>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-red-500/10`}
onClick={() => {
    setShowRemoveProduct(false);
    setShowInventoryOptions(true);
}}
>
✕
</Button>
</div>

{stockLoading && (
<div className="flex justify-center items-center py-12">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
<span className={`ml-4 text-lg ${theme.text}`}>Loading products...</span>
</div>
)}

{!stockLoading && stockData.length > 0 && (
<div className="space-y-4">
<div className={`grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
    <div className={`${theme.text}`}>Product Name</div>
    <div className={`${theme.text}`}>Category</div>
    <div className={`${theme.text}`}>Stock</div>
    <div className={`${theme.text}`}>Action</div>
</div>

{stockData.map((product) => (
    <div 
    key={product.id} 
    className={`grid grid-cols-4 gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-red-500/5`}
    >
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
))}
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
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10`}
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
};const renderStockViewModal = () => {
if (!showStockView) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className={`rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto backdrop-blur-md ${theme.cardBg} ${theme.border} border`}>
<div className="flex justify-between items-center mb-6">
<h3 className={`text-2xl font-bold ${theme.text}`}>
📦 Stock Inventory Overview
</h3>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-red-500/10`}
onClick={() => setShowStockView(false)}
>
✕
</Button>
</div>

{/* Search Bar */}
<div className="mb-6">
<div className="relative">
<input
    type="text"
    placeholder="🔍 Search products by name or category..."
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
{/* Header */}
<div className={`grid grid-cols-4 gap-4 p-4 rounded-lg font-semibold ${theme.gradientOverlay} ${theme.border} border`}>
<div className={`${theme.text}`}>Product Name</div>
<div className={`${theme.text}`}>Category</div>
<div className={`${theme.text}`}>Stock Count</div>
<div className={`${theme.text}`}>Status</div>
</div>

{/* Data Rows */}
{filteredStockData.map((product) => (
<div 
key={product.id} 
className={`grid grid-cols-4 gap-4 p-4 rounded-lg transition-all duration-200 hover:shadow-md ${theme.cardBg} ${theme.border} border hover:bg-purple-500/5`}
>
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
        ✅ In Stock
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
        ❌ Out of Stock
    </span>
    )}
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

<div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-200">
<div className={`text-sm ${theme.textSecondary}`}>
{searchQuery ? 
`Showing ${filteredStockData.length} of ${stockData.length} products` : 
`Total Products: ${stockData.length}`
}
</div>
<div className="flex space-x-4">
<Button 
className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg rounded-lg"
onClick={() => fetchStockData()}
>
🔄 Refresh
</Button>
<Button 
variant="outline" 
className={`rounded-lg ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowStockView(false)}
>
Close
</Button>
</div>
</div>
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
📱 WhatsApp Low Stock Alerts
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
💾 Save Settings
</Button>
<Button 
variant="outline" 
className={`flex-1 rounded-xl backdrop-blur-sm ${theme.border} ${theme.text} hover:bg-purple-500/10`}
onClick={() => setShowOutOfStockSettings(false)}
>
Cancel
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
🎨 Configure Store Theme
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
{renderStockViewModal()}
{renderOutOfStockModal()}
{renderReportModal()}
{renderStoreSettingsModal()}
{renderThemeSettingsModal()}
{renderProfileSettingsModal()}
</div>
);
};

export default Manager;