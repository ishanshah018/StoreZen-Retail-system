import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { 
ShoppingBag, Settings, Sun, Moon, Store,User,MessageCircle,Star,Receipt,FileText,BarChart,
Package,Users,TrendingUp,Shield,Zap,Clock
} from "lucide-react";




const Main = () => {
// Initialize dark mode from localStorage
const [darkMode, setDarkMode] = useState(() => {
const saved = localStorage.getItem('darkMode');
return saved ? JSON.parse(saved) : false;
});

// Initialize store name from localStorage
const [storeName, setStoreName] = useState(() => {
const saved = localStorage.getItem('storeName');
return saved || "StoreZen";
});

// Apply dark mode to document and save to localStorage
useEffect(() => {
if (darkMode) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}
localStorage.setItem('darkMode', JSON.stringify(darkMode));
}, [darkMode]);

// Listen for storage changes from other pages
useEffect(() => {
const handleStorageChange = (e) => {
    if (e.key === 'darkMode' && e.newValue !== null) {
    const isDark = JSON.parse(e.newValue);
    setDarkMode(isDark);
    }
    if (e.key === 'storeName' && e.newValue !== null) {
    setStoreName(e.newValue);
    }
};

window.addEventListener('storage', handleStorageChange);
return () => window.removeEventListener('storage', handleStorageChange);
}, []);

// Toggle dark mode
const toggleDarkMode = () => {
setDarkMode(!darkMode);
};

// Smooth scroll to sections
const scrollToSection = (sectionId) => {
const element = document.getElementById(sectionId);
if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
}
};

// Customer features data
const customerFeatures = [
{
    icon: User,
    title: "Profile Management",
    description: "Manage personal information and shopping preferences"
},
{
    icon: ShoppingBag,
    title: "Product Browsing",
    description: "Browse extensive catalog with AI-powered filtering"
},
{
    icon: MessageCircle,
    title: "AI Chatbot",
    description: "Instant help and personalized recommendations"
},
{
    icon: Star,
    title: "Smart Shopping Assistant",
    description: "AI-powered search and product suggestions"
},
{
    icon: Receipt,
    title: "Smart Billing",
    description: "Lightning-fast checkout with multiple discount & payment options"
},
{
    icon: FileText,
    title: "Purchase History",
    description: "Access complete purchase history and digital receipts"
},
{
    icon: BarChart,
    title: "Spending Analytics",
    description: "Visualize shopping patterns and budget insights"
}
];

// Manager features data
const managerFeatures = [
{
    icon: Package,
    title: "Inventory Management",
    description: "Real-time stock tracking and automated reordering"
},
{
    icon: Users,
    title: "Customer Analytics",
    description: "Detailed customer behavior and preference insights"
},
{
    icon: TrendingUp,
    title: "Sales Reports",
    description: "Comprehensive sales analytics and performance metrics"
},
{
    icon: Settings,
    title: "Store Configuration",
    description: "Customize store settings and business parameters"
},
{
    icon: Receipt,
    title: "Transaction Management",
    description: "Monitor all transactions and payment processing"
},
{
    icon: BarChart,
    title: "Business Intelligence",
    description: "Advanced analytics for data-driven decisions"
}
];

return (
<div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
    {/* Navigation Bar */}
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-200'} backdrop-blur-md border-b`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center space-x-3">
            <Store className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            StoreZen
            </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
            <button
            onClick={() => scrollToSection('home')}
            className={`font-medium transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
            >
            Home
            </button>
            <button
            onClick={() => scrollToSection('features')}
            className={`font-medium transition-colors duration-200 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
            >
            Features
            </button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center">
            <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${darkMode ? 'bg-blue-600 focus:ring-offset-gray-900' : 'bg-gray-300 focus:ring-offset-white'}`}
            >
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${darkMode ? 'translate-x-7 bg-gray-900' : 'translate-x-0 bg-white'}`}>
                {darkMode ? (
                <Moon className="h-4 w-4 text-blue-400" />
                ) : (
                <Sun className="h-4 w-4 text-yellow-500" />
                )}
            </div>
            </button>
        </div>
        </div>
    </div>
    </nav>

    {/* Hero Section */}
    <section id="home" className="pt-24 pb-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
        <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome to <span className="text-blue-600">{storeName}</span>
        </h1>
        
        <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A modern retail experience built for smarter shopping and seamless store management.
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/customer">
            <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
            >
                <ShoppingBag className="mr-3 h-6 w-6" />
                Customer Portal
            </Button>
            </Link>

            <Link to="/manager">
            <Button
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
            >
                <Settings className="mr-3 h-6 w-6" />
                Manager Portal
            </Button>
            </Link>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Secure & Reliable
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Enterprise-grade security with 99.9% uptime guarantee
            </p>
            </div>
            <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Lightning Fast
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Optimized performance for seamless user experience
            </p>
            </div>
            <div className={`text-center p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                24/7 Support
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Round-the-clock assistance and AI-powered help
            </p>
            </div>
        </div>
        </div>
    </div>
    </section>

    {/* Features Section */}
    <section id="features" className={`py-20 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 relative">
        <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Powerful Features
        </h2>
        <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Discover what makes StoreZen the perfect solution for modern retail
        </p>
        <div className="absolute -top-20 right-0 hidden md:block">
            <div
            dangerouslySetInnerHTML={{
                __html: `<lottie-player
                src="https://assets9.lottiefiles.com/packages/lf20_qp1q7mct.json"
                background="transparent"
                speed="1"
                style="width: 300px; height: 300px"
                loop
                autoplay
                ></lottie-player>`,
            }}
            />
        </div>

        
        </div>

        {/* Customer Features */}
        <div className="mb-16">
        <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Customer Experience
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Enhanced shopping experience with AI-powered features
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {customerFeatures.map((feature, index) => (
            <div
                key={index}
                className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
            >
                <feature.icon className="h-10 w-10 text-blue-600 mb-4" />
                <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
                </h4>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
                </p>

                
            </div>
            ))}
        </div>
        </div>

        {/* Manager Features */}
        <div>
        <div className="text-center mb-12">
            <h3 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Manager Dashboard
            </h3>
            <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Complete business management and analytics tools
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {managerFeatures.map((feature, index) => (
            <div
                key={index}
                className={`p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 ${darkMode ? 'bg-gray-700' : 'bg-white'}`}
            >
                <feature.icon className="h-10 w-10 text-purple-600 mb-4" />
                <h4 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
                </h4>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {feature.description}
                </p>
            </div>
            ))}
        </div>
        </div>
    </div>
    </section>

    {/* Footer */}
    <footer className={`py-12 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
            <Store className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            StoreZen
            </span>
        </div>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2025 StoreZen. All rights reserved. Transforming retail experiences worldwide.
        </p>
        </div>
    </div>
    </footer>
</div>
);
};

export default Main;