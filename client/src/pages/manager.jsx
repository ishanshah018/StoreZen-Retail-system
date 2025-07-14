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

const Manager = () => {
// Modal states
const [showInventoryOptions, setShowInventoryOptions] = useState(false);
const [showReportOptions, setShowReportOptions] = useState(false);
const [showOutOfStockSettings, setShowOutOfStockSettings] = useState(false);
const [showStoreSettings, setShowStoreSettings] = useState(false);
const [showThemeSettings, setShowThemeSettings] = useState(false);
const [showProfileSettings, setShowProfileSettings] = useState(false);

// Settings state
const [threshold, setThreshold] = useState(10);

// Store theme configuration state
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

// Store details state
const [storeDetails, setStoreDetails] = useState({
name: "StoreZen",
manager: "",
location: "",
contact: "",
email: "",
description: ""
});

// Manager profile state
const [managerProfile, setManagerProfile] = useState({
name: "John Smith",
storeAddress: "123 Main Street, City, State 12345",
email: "manager@storezen.com",
contact: "+1 (555) 123-4567"
});

useEffect(() => {
// Load store details from localStorage  
const savedStoreName = localStorage.getItem('storeName');
if (savedStoreName) {
    setStoreDetails(prev => ({ ...prev, name: savedStoreName }));
}

// Initialize manager store theme if not set
const savedManagerTheme = localStorage.getItem('managerStoreTheme');
if (!savedManagerTheme) {
    localStorage.setItem('managerStoreTheme', currentTheme);
}

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
actions: ["View Stock", "Update Inventory"],
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

const handleInventoryClick = (action) => {
if (action === "Update Inventory") {
setShowInventoryOptions(true);
}
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
setStoreDetails(prev => ({
...prev,
[field]: value
}));
};

const saveStoreSettings = () => {
localStorage.setItem('storeName', storeDetails.name);
setShowStoreSettings(false);
// Here you would typically save to backend
alert(`Store settings saved! Store name updated to: ${storeDetails.name}`);
};

const saveThemeSettings = () => {
localStorage.setItem('storeZenTheme', storeTheme);
localStorage.setItem('managerStoreTheme', storeTheme); // Also save as manager's store theme
setCurrentTheme(storeTheme);
setShowThemeSettings(false);

// Trigger storage event to sync with main page
window.dispatchEvent(new StorageEvent('storage', {
key: 'storeZenTheme',
newValue: storeTheme,
oldValue: localStorage.getItem('storeZenTheme')
}));

alert('Store theme updated successfully!');
};

const renderInventoryModal = () => {
if (!showInventoryOptions) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
    Update Inventory
</h3>
<div className="space-y-4">
    <Button 
    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg rounded-xl py-3"
    onClick={() => setShowInventoryOptions(false)}
    >
    <Plus className="mr-2 h-5 w-5" />
    Add New Products
    </Button>
    <Button 
    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg rounded-xl py-3"
    onClick={() => setShowInventoryOptions(false)}
    >
    <Settings className="mr-2 h-5 w-5" />
    Update Existing Products
    </Button>
    <Button 
    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:shadow-lg rounded-xl py-3"
    onClick={() => setShowInventoryOptions(false)}
    >
    <AlertTriangle className="mr-2 h-5 w-5" />
    Remove Products
    </Button>
    <div className="border-t pt-4">
    <Button 
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-lg rounded-xl py-3"
        onClick={() => setShowOutOfStockSettings(true)}
    >
        <AlertTriangle className="mr-2 h-5 w-5" />
        Out of Stock Alerts
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
    className="w-full mt-6 rounded-xl"
    onClick={() => setShowInventoryOptions(false)}
>
    Cancel
</Button>
</div>
</div>
);
};

const renderOutOfStockModal = () => {
if (!showOutOfStockSettings) return null;

return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
    Out of Stock Alert Settings
</h3>
<div className="space-y-6">
    <div className="flex items-center justify-between">
    <span className="text-lg font-medium text-gray-700">Enable Alerts</span>
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" defaultChecked />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
    </div>
    <div>
    <label className="block text-lg font-medium text-gray-700 mb-2">
        Alert Threshold
    </label>
    <div className="flex items-center space-x-4">
        <input 
        type="range" 
        min="1" 
        max="100" 
        value={threshold} 
        onChange={(e) => setThreshold(e.target.value)}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-xl font-bold text-blue-600 min-w-[3rem]">{threshold}</span>
    </div>
    <p className="text-sm text-gray-500 mt-2">Alert when stock falls below this number</p>
    </div>
</div>
<div className="flex space-x-4 mt-8">
    <Button 
    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg rounded-xl"
    onClick={() => {
        setShowOutOfStockSettings(false);
        setShowInventoryOptions(false);
    }}
    >
    Save Settings
    </Button>
    <Button 
    variant="outline" 
    className="flex-1 rounded-xl"
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
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
<div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
<h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
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
    className="w-full mt-6 rounded-xl"
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
    onClick={saveStoreSettings}
    >
    Save Changes
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
    onClick={() => {
        setShowProfileSettings(false);
        alert('Profile updated successfully!');
    }}
    >
    Save Profile
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
    onClick={saveThemeSettings}
    >
    Save Theme
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
                    if (feature.title === "View Product Inventory" && action === "Update Inventory") {
                    handleInventoryClick(action);
                    } else if (feature.title === "View Sales Report" && action === "View Report") {
                    handleReportClick(action);
                    } else if (feature.title === "Settings" && (action === "Store Name" || action === "Store Theme" || action === "Profile")) {
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
{renderOutOfStockModal()}
{renderReportModal()}
{renderStoreSettingsModal()}
{renderThemeSettingsModal()}
{renderProfileSettingsModal()}
</div>
);
};

export default Manager;