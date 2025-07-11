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
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Settings state
  const [threshold, setThreshold] = useState(10);
  
  // Dark mode sync with global state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    const isDark = saved ? JSON.parse(saved) : false;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return isDark;
  });
  
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
}, []);

// Apply dark mode to document whenever state changes
useEffect(() => {
if (darkMode) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
}, [darkMode]);

// Listen for dark mode changes from other pages/tabs
useEffect(() => {
const handleStorageChange = (e) => {
    if (e.key === 'darkMode' && e.newValue !== null) {
        const isDark = JSON.parse(e.newValue);
        setDarkMode(isDark);
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
actions: ["Store Name", "Profile"],
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
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <h3 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Edit Store Name
    </h3>
    
    <div className="space-y-4">
        <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Store Name
            </label>
            <input
            type="text"
            value={storeDetails.name}
            onChange={(e) => handleStoreDetailsChange('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
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
        className={`flex-1 rounded-lg ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className={`rounded-lg p-8 max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <h3 className={`text-2xl font-bold mb-6 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Manager Profile
    </h3>
    
    <div className="space-y-6">
        <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Manager Name
            </label>
            <div className="relative">
                <input
                type="text"
                value={managerProfile.name}
                onChange={(e) => setManagerProfile({...managerProfile, name: e.target.value})}
                className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter manager name"
                />
                <button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Store Address
            </label>
            <div className="relative">
                <textarea
                value={managerProfile.storeAddress}
                onChange={(e) => setManagerProfile({...managerProfile, storeAddress: e.target.value})}
                rows={3}
                className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter store address"
                />
                <button className={`absolute right-3 top-3 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Email Address
            </label>
            <div className="relative">
                <input
                type="email"
                value={managerProfile.email}
                onChange={(e) => setManagerProfile({...managerProfile, email: e.target.value})}
                className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter email address"
                />
                <button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
            </div>
        </div>

        <div className="relative">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Contact Number
            </label>
            <div className="relative">
                <input
                type="tel"
                value={managerProfile.contact}
                onChange={(e) => setManagerProfile({...managerProfile, contact: e.target.value})}
                className={`w-full px-4 py-3 pr-10 rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
                placeholder="Enter contact number"
                />
                <button className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
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
        className={`flex-1 rounded-lg ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
        onClick={() => setShowProfileSettings(false)}
        >
        Cancel
        </Button>
    </div>
    </div>
</div>
);
};

return (
<div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
{/* Header - Matching Landing Page Style */}
<header className={`shadow-sm border-b transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
    {/* Logo - Same as Landing Page */}
    <div className="flex items-center space-x-3">
        <Store className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        StoreZen
        </span>
    </div>

    {/* Right side controls */}
    <div className="flex items-center space-x-6">
        <Link to="/">
        <Button
            variant="outline"
            className={`flex items-center space-x-2 transition-all duration-200 ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
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
    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
    Manager Dashboard
    </h1>
    <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    Complete retail management suite with AI-powered insights and automation
    </p>
</div>

{/* Feature Cards */}
{categories.map((category) => {
    const categoryFeatures = allFeatures.filter(
    (feature) => feature.category === category
    );
    if (categoryFeatures.length === 0) return null;

    return (
    <div key={category} className="mb-16">
        <h2 className={`text-3xl font-bold mb-8 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {getCategoryTitle(category)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryFeatures.map((feature, index) => (
            <Card
            key={feature.title}
            className={`group hover:shadow-lg transition-all duration-200 border rounded-lg ${
                darkMode 
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                : 'bg-white border-gray-200'
            }`}
            >
            <CardHeader className="text-center pb-4">
                <div
                className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-md group-hover:shadow-lg transition-all duration-200`}
                >
                <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className={`text-xl font-semibold leading-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center px-6 pb-6">
                <CardDescription className={`leading-relaxed mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
                </CardDescription>
                <div className="space-y-2">
                {feature.actions.map((action, i) => (
                    <Button
                    key={i}
                    size="sm"
                    className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-md transition-all duration-200 rounded-lg font-medium py-2 ${
                        i === 0 ? "ring-2 ring-gray-200" : "opacity-95"
                    }`}
                    onClick={() => {
                        if (feature.title === "View Product Inventory" && action === "Update Inventory") {
                        handleInventoryClick(action);
                        } else if (feature.title === "View Sales Report" && action === "View Report") {
                        handleReportClick(action);
                        } else if (feature.title === "Settings" && (action === "Store Name" || action === "Profile")) {
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
<div className={`mt-20 rounded-lg shadow-sm p-8 md:p-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
    <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Platform Overview
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-2">
        <div className="text-4xl font-bold text-emerald-600">2,847</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Active Products</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-blue-600">1,234</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer Requests</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-purple-600">$125K</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Monthly Revenue</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-pink-600">4.8 Stars</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Customer Rating</div>
        </div>
    </div>
</div>

{/* System Health */}
<div className={`mt-12 rounded-lg p-8 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-100'}`}>
    <h3 className={`text-2xl font-bold mb-8 text-center ${darkMode ? 'text-green-400' : 'text-green-800'}`}>
    System Health Monitor
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
    <div className={`space-y-2 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="text-3xl font-bold text-green-600">99.9%</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>System Uptime</div>
    </div>
    <div className={`space-y-2 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="text-3xl font-bold text-blue-600">1.2s</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Response Time</div>
    </div>
    <div className={`space-y-2 p-4 rounded-lg shadow-sm ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
        <div className="text-3xl font-bold text-purple-600">AI</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Powered Analytics</div>
    </div>
    </div>
</div>
</div>

{/* Modals */}
{renderInventoryModal()}
{renderOutOfStockModal()}
{renderReportModal()}
{renderStoreSettingsModal()}
{renderProfileSettingsModal()}
</div>
);
};

export default Manager;