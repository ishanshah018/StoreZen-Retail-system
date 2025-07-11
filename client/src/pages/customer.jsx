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

// Theme state - sync with store theme from manager
const [currentTheme, setCurrentTheme] = useState(() => {
const saved = localStorage.getItem('storeZenTheme');
return saved || 'dark';
});

// Load customer name on component mount
useEffect(() => {
const savedCustomerName = localStorage.getItem('customerName') || "Guest";
setCustomerName(savedCustomerName);
}, []);

// Apply theme to document
useEffect(() => {
// Remove all theme classes
document.documentElement.classList.remove('dark', 'christmas', 'halloween', 'cyberpunk', 'diwali');

// Add current theme class (light doesn't need a class)
if (currentTheme !== 'light') {
    document.documentElement.classList.add(currentTheme);
}
}, [currentTheme]);

// Listen for theme changes from manager
useEffect(() => {
const handleStorageChange = (e) => {
    if (e.key === 'storeZenTheme' && e.newValue !== null) {
    setCurrentTheme(e.newValue);
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

// Get theme-specific colors and styles
const getThemeStyles = () => {
switch (currentTheme) {
    case 'christmas':
    return {
        bg: 'bg-gradient-to-br from-red-900 via-green-900 to-red-900',
        navBg: 'bg-red-900/80 border-green-600/50',
        text: 'text-green-100',
        accent: 'text-red-400',
        cardBg: 'bg-red-800/50',
        hoverBg: 'hover:bg-red-700/30'
    };
    case 'halloween':
    return {
        bg: 'bg-gradient-to-br from-orange-900 via-black to-purple-900',
        navBg: 'bg-orange-900/80 border-purple-600/50',
        text: 'text-orange-100',
        accent: 'text-orange-400',
        cardBg: 'bg-orange-800/50',
        hoverBg: 'hover:bg-orange-700/30'
    };
    case 'cyberpunk':
    return {
        bg: 'bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900',
        navBg: 'bg-gray-900/80 border-cyan-600/50',
        text: 'text-cyan-100',
        accent: 'text-cyan-400',
        cardBg: 'bg-gray-800/50',
        hoverBg: 'hover:bg-gray-700/30'
    };
    case 'diwali':
    return {
        bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
        navBg: 'bg-orange-200/80 border-yellow-400/50',
        text: 'text-orange-900',
        accent: 'text-red-600',
        cardBg: 'bg-yellow-50/50',
        hoverBg: 'hover:bg-yellow-100/30'
    };
    case 'dark':
    return {
        bg: 'bg-gray-900',
        navBg: 'bg-gray-900/80 border-gray-700/50',
        text: 'text-white',
        accent: 'text-blue-400',
        cardBg: 'bg-gray-800/50',
        hoverBg: 'hover:bg-gray-700/30'
    };
    default: // light
    return {
        bg: 'bg-white',
        navBg: 'bg-white/80 border-gray-200/50',
        text: 'text-gray-900',
        accent: 'text-blue-600',
        cardBg: 'bg-gray-50/50',
        hoverBg: 'hover:bg-gray-100/30'
    };
}
};

const themeStyles = getThemeStyles();

return (
<div className={`min-h-screen transition-all duration-500 ${themeStyles.bg}`}>
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
    
    {currentTheme === 'diwali' && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-10 left-10 text-2xl animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}>🪔</div>
            <div className="absolute top-20 right-20 text-xl animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}>🎆</div>
            <div className="absolute bottom-32 left-16 text-lg animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}>✨</div>
            <div className="absolute top-1/3 right-1/4 text-sm animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}>🌟</div>
            <div className="absolute bottom-1/4 right-10 text-xl animate-bounce" style={{animationDelay: '1.5s', animationDuration: '4.5s'}}>🎇</div>
        </div>
    )}

{/* Header - Matching Landing Page Style */}
<header className={`shadow-sm border-b transition-all duration-300 ${themeStyles.navBg} backdrop-blur-xl`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
    {/* Logo - Same as Landing Page */}
    <div className="flex items-center space-x-3">
        <Store className={`h-8 w-8 ${themeStyles.accent}`} />
        <span className={`text-2xl font-bold ${themeStyles.text}`}>
        StoreZen
        {currentTheme === 'christmas' && <span className="ml-2">🎄</span>}
        {currentTheme === 'halloween' && <span className="ml-2">🎃</span>}
        {currentTheme === 'cyberpunk' && <span className="ml-2">🌟</span>}
        {currentTheme === 'diwali' && <span className="ml-2">🪔</span>}
        </span>
    </div>

    {/* Right side - Welcome message and controls */}
    <div className="flex items-center space-x-6">
        {/* Welcome Message */}
        <div className="text-right hidden sm:block">
        <p className={`text-sm ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Welcome back,</p>
        <p className={`text-lg font-semibold ${themeStyles.text}`}>{customerName}</p>
        </div>
        
        <Link to="/">
        <Button
            variant="outline"
            className={`flex items-center space-x-2 transition-all duration-200 ${themeStyles.cardBg} border-2 ${themeStyles.text} ${themeStyles.hoverBg}`}
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
    <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${themeStyles.text}`}>
    Customer Dashboard
    {currentTheme === 'christmas' && <span className="ml-2">🎄</span>}
    {currentTheme === 'halloween' && <span className="ml-2">🎃</span>}
    {currentTheme === 'cyberpunk' && <span className="ml-2">🌟</span>}
    </h1>
    <p className={`text-xl max-w-3xl mx-auto ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
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
        <h2 className={`text-3xl font-bold mb-8 text-center ${themeStyles.text}`}>
        {getCategoryTitle(category)}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryFeatures.map((feature, index) => (
            <Card
            key={feature.title}
            className={`group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border rounded-lg relative overflow-visible ${
                feature.special
                ? `backdrop-blur-xl border-2 ${themeStyles.cardBg} border-gradient-to-r from-blue-400 to-purple-400 ${themeStyles.hoverBg} hover:shadow-blue-500/30 ring-2 ring-blue-400/50 shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:ring-blue-400/70`
                : `${themeStyles.cardBg} border-gray-200/20 ${themeStyles.hoverBg} hover:shadow-blue-500/15`
            } hover:shadow-xl`}
            style={{
                boxShadow: feature.special 
                ? `0 25px 50px -12px rgba(59, 130, 246, 0.25), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                : undefined,
                background: feature.special 
                ? `linear-gradient(135deg, ${currentTheme === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(31, 41, 55, 0.6)'} 0%, ${currentTheme === 'light' ? 'rgba(249, 250, 251, 0.4)' : 'rgba(55, 65, 81, 0.4)'} 100%)`
                : undefined
            }}
            >
                {/* AI Badge */}
                {feature.special && (
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-xl border-2 border-white/30 backdrop-blur-sm z-50 transform group-hover:scale-110 transition-all duration-300">
                    <span className="relative z-10">AI</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-500/50 rounded-full blur-sm"></div>
                </div>
                )}
                
                {/* Full Card Diamond Effects */}
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
<div className={`mt-20 rounded-lg shadow-sm p-8 md:p-12 ${themeStyles.cardBg}`}>
    <h2 className={`text-3xl font-bold text-center mb-12 ${themeStyles.text}`}>
        Your StoreZen Experience
        {currentTheme === 'christmas' && <span className="ml-2">🎄</span>}
        {currentTheme === 'halloween' && <span className="ml-2">🎃</span>}
        {currentTheme === 'cyberpunk' && <span className="ml-2">🌟</span>}
        {currentTheme === 'diwali' && <span className="ml-2">🪔</span>}
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-2">
        <div className="text-4xl font-bold text-purple-600">24/7</div>
        <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>AI Support</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-blue-600">1M+</div>
        <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Products Available</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-green-600">Smart</div>
        <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Billing System</div>
        </div>
        <div className="space-y-2">
        <div className="text-4xl font-bold text-orange-600">AI</div>
        <div className={`font-medium ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>Recommendations</div>
        </div>
    </div>
</div>
</div>
</div>
);
};

export default Customer;