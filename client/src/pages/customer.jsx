import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import {
User,
ShoppingCart,
MessageCircle,
Receipt,
FileText,
Ticket,
Coins,
BarChart,
Star,
Heart,
Send,
Store,
ArrowLeft,
} from "lucide-react";

const Customer = () => {
// Customer name state
const [customerName, setCustomerName] = useState("Guest");

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

// Load customer name on component mount
useEffect(() => {
const savedCustomerName = localStorage.getItem('customerName') || "Guest";
setCustomerName(savedCustomerName);
}, []);

// Apply dark mode to document
useEffect(() => {
if (darkMode) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
}, [darkMode]);

// Listen for dark mode changes from other pages
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
const profileFeatures = [
{
title: "Your Profile Handle",
description: "Manage your personal information and preferences",
icon: User,
color: "from-blue-500 to-cyan-500",
category: "profile",
},
];

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

const insightsFeatures = [
{
title: "Visualize Your Spending Trends",
description: "Smart analytics of your shopping patterns and budget",
icon: BarChart,
color: "from-violet-500 to-purple-500",
category: "insights",
},
];

const allFeatures = [
...profileFeatures,
...shoppingFeatures,
...billingFeatures,
...supportFeatures,
...insightsFeatures,
];

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

const categories = ["profile", "shopping", "billing", "support", "insights"];

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

    {/* Right side - Welcome message and controls */}
    <div className="flex items-center space-x-6">
        {/* Welcome Message */}
        <div className="text-right hidden sm:block">
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Welcome back,</p>
        <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{customerName}</p>
        </div>
        
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
    Customer Dashboard
    </h1>
    <p className={`text-xl max-w-3xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    Your complete shopping experience with AI-powered features and smart analytics
    </p>
</div>

{/* Features by Category */}
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
            } ${
                feature.special
                ? darkMode 
                    ? "ring-2 ring-blue-400 ring-opacity-30 shadow-lg" 
                    : "ring-2 ring-blue-500 ring-opacity-20 shadow-lg"
                : ""
            }`}
            >
            <CardHeader className="text-center pb-4 relative">
                {feature.special && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                    AI
                </div>
                )}
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
                <Button
                className={`bg-gradient-to-r ${feature.color} hover:shadow-md transition-all duration-200 rounded-lg px-6 py-2 font-medium ${
                    feature.special
                    ? "ring-2 ring-blue-300 ring-opacity-50"
                    : ""
                }`}
                >
                {feature.special ? "Launch AI Assistant" : "Get Started"}
                </Button>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
    );
})}

{/* Stats Section */}
<div className={`mt-20 rounded-lg shadow-sm p-8 md:p-12 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
    <h2 className={`text-3xl font-bold text-center mb-12 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Your StoreZen Experience
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-2">
        <div className="text-4xl font-bold text-purple-600">24/7</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>AI Support</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-blue-600">1M+</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Products Available</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-green-600">Smart</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Billing System</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-orange-600">AI</div>
        <div className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Recommendations</div>
        </div>
    </div>
</div>
</div>
</div>
);
};

export default Customer;