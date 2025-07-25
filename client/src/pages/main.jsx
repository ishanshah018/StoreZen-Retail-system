import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// UI Components
import { Button } from "../components/ui/button";

// Theme Components
import { useTheme, getThemeStyles, ThemeBackground, getThemeEmoji } from "../components/theme";

// Icons
import { 
  ShoppingBag, Settings, Sun, Moon, Store, User, MessageCircle, Star, Receipt, 
  FileText, BarChart, Package, Users, TrendingUp, Shield, Zap, Bot
} from "lucide-react";

// =============================================================================
// MAIN LANDING PAGE COMPONENT
// =============================================================================

const Main = () => {
  // Theme management
  const { currentTheme, setCurrentTheme } = useTheme();

  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  // Store configuration
  const [storeName, setStoreName] = useState(() => {
    const saved = localStorage.getItem('storeName');
    return saved || "StoreZen";
  });

  // =============================================================================
  // LIFECYCLE EFFECTS
  // =============================================================================

  /** Fetch manager's theme on component load */
  useEffect(() => {
    const fetchManagerTheme = async () => {
      try {
        const response = await fetch('http://localhost:8080/manager/profile');
        if (response.ok) {
          const data = await response.json();
          const managerTheme = data.manager?.storeSettings?.storeTheme || 'dark';
          
          // Always update to manager's theme on load
          setCurrentTheme(managerTheme);
          localStorage.setItem('storeZenTheme', managerTheme);
          localStorage.setItem('managerStoreTheme', managerTheme);
        }
      } catch (error) {
        console.log('Could not fetch manager theme, using default');
      }
    };

    fetchManagerTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /** Listen for localStorage changes from other pages */
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Update store name when changed from manager page
      if (e.key === 'storeName' && e.newValue !== null) {
        setStoreName(e.newValue);
      }
      
      // Update theme when changed from manager page
      if (e.key === 'storeZenTheme' && e.newValue !== null) {
        setCurrentTheme(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // =============================================================================
  // THEME FUNCTIONS
  // =============================================================================

  /** Toggle between light theme and manager's selected store theme */
  const toggleTheme = () => {
    if (currentTheme === 'light') {
      // Switch from light to manager's selected theme
      const savedManagerTheme = localStorage.getItem('managerStoreTheme') || 'dark';
    setCurrentTheme(savedManagerTheme);
    localStorage.setItem('storeZenTheme', savedManagerTheme);
    
    // Dispatch event to sync with manager page
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'storeZenTheme',
      newValue: savedManagerTheme,
      oldValue: 'light'
    }));
  } else {
    // Switch to light mode and save it
    setCurrentTheme('light');
    // Save current theme as manager's store theme before switching to light
    localStorage.setItem('managerStoreTheme', currentTheme);
    localStorage.setItem('storeZenTheme', 'light');
    
    // Dispatch event to sync with manager page
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'storeZenTheme',
      newValue: 'light',
      oldValue: currentTheme
    }));
  }
};

// Get theme styles and extend with additional properties for landing page
const baseThemeStyles = getThemeStyles(currentTheme);
const themeStyles = {
...baseThemeStyles,
buttonPrimary: currentTheme === 'christmas' ? 'from-red-600 to-green-600 hover:from-red-700 hover:to-green-700' :
            currentTheme === 'halloween' ? 'from-orange-600 to-purple-600 hover:from-orange-700 hover:to-purple-700' :
            currentTheme === 'cyberpunk' ? 'from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700' :
            currentTheme === 'diwali' ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' :
            currentTheme === 'dark' ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' :
            'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
buttonSecondary: currentTheme === 'christmas' ? 'from-green-600 to-red-600 hover:from-green-700 hover:to-red-700' :
            currentTheme === 'halloween' ? 'from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700' :
            currentTheme === 'cyberpunk' ? 'from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700' :
            currentTheme === 'diwali' ? 'from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' :
            currentTheme === 'dark' ? 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' :
            'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
particles: currentTheme === 'christmas' ? ['bg-red-400/20', 'bg-green-400/30', 'bg-yellow-400/25', 'bg-white/20'] :
        currentTheme === 'halloween' ? ['bg-orange-400/20', 'bg-purple-400/30', 'bg-yellow-400/25', 'bg-black/20'] :
        currentTheme === 'cyberpunk' ? ['bg-cyan-400/20', 'bg-purple-400/30', 'bg-pink-400/25', 'bg-blue-400/20'] :
        currentTheme === 'diwali' ? ['bg-yellow-400/20', 'bg-orange-400/30', 'bg-red-400/25', 'bg-pink-400/20'] :
        currentTheme === 'dark' ? ['bg-blue-400/20', 'bg-purple-400/30', 'bg-green-400/25', 'bg-indigo-400/25'] :
        ['bg-blue-400/20', 'bg-purple-400/30', 'bg-green-400/25', 'bg-yellow-400/20']
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
<div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${themeStyles.bg}`}>
{/* Animated Background Elements */}
<ThemeBackground currentTheme={currentTheme} />

{(currentTheme === 'light' || currentTheme === 'dark') && (
    /* Regular Floating Particles Background */
    <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-10 left-10 w-2 h-2 ${themeStyles.particles[0]} rounded-full animate-bounce`} style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className={`absolute top-20 right-20 w-1 h-1 ${themeStyles.particles[1]} rounded-full animate-bounce`} style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className={`absolute bottom-32 left-16 w-1.5 h-1.5 ${themeStyles.particles[2]} rounded-full animate-bounce`} style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className={`absolute top-1/3 right-1/4 w-1 h-1 ${themeStyles.particles[3]} rounded-full animate-bounce`} style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        <div className={`absolute bottom-1/4 right-10 w-2 h-2 ${themeStyles.particles[0]} rounded-full animate-bounce`} style={{animationDelay: '1.5s', animationDuration: '4.5s'}}></div>
        <div className={`absolute top-1/2 left-1/3 w-1 h-1 ${themeStyles.particles[3]} rounded-full animate-bounce`} style={{animationDelay: '2.5s', animationDuration: '3.8s'}}></div>
    </div>
)}
{/* Navigation Bar with Glassmorphism */}
<nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${themeStyles.navBg} backdrop-blur-xl border-b ${themeStyles.border} shadow-lg`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
    {/* Logo */}
    <div className="flex items-center space-x-3">
        <Store className={`h-8 w-8 ${themeStyles.accent}`} />
        <span className={`text-2xl font-bold ${themeStyles.text}`}>
        StoreZen
        </span>
    </div>

    {/* Navigation Links */}
    <div className="hidden md:flex items-center space-x-8">
        <button
        onClick={() => scrollToSection('home')}
        className={`font-medium transition-colors duration-200 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} hover:${themeStyles.text}`}
        >
        Home
        </button>
        <button
        onClick={() => scrollToSection('features')}
        className={`font-medium transition-colors duration-200 ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} hover:${themeStyles.text}`}
        >
        Features
        </button>
    </div>

    {/* Theme Toggle */}
    <div className="flex items-center">
        <button
        onClick={toggleTheme}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            currentTheme === 'light' ? 'bg-gray-300 focus:ring-blue-500' : 
            currentTheme === 'christmas' ? 'bg-red-600 focus:ring-red-500' :
            currentTheme === 'halloween' ? 'bg-orange-600 focus:ring-orange-500' :
            currentTheme === 'cyberpunk' ? 'bg-cyan-600 focus:ring-cyan-500' :
            currentTheme === 'diwali' ? 'bg-yellow-600 focus:ring-yellow-500' :
            'bg-blue-600 focus:ring-blue-500'
        } ${
            currentTheme === 'light' ? 'focus:ring-offset-white' : 
            currentTheme === 'christmas' ? 'focus:ring-offset-red-900' :
            currentTheme === 'halloween' ? 'focus:ring-offset-orange-900' :
            currentTheme === 'cyberpunk' ? 'focus:ring-offset-cyan-900' :
            currentTheme === 'diwali' ? 'focus:ring-offset-orange-100' :
            'focus:ring-offset-gray-900'
        }`}
        >
        <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${
            currentTheme === 'light' ? 'translate-x-0 bg-white' : 
            currentTheme === 'christmas' ? 'translate-x-7 bg-red-900' :
            currentTheme === 'halloween' ? 'translate-x-7 bg-orange-900' :
            currentTheme === 'cyberpunk' ? 'translate-x-7 bg-cyan-800' :
            currentTheme === 'diwali' ? 'translate-x-7 bg-orange-800' :
            'translate-x-7 bg-gray-900'
        }`}>
            {currentTheme === 'light' ? (
            <Sun className="h-4 w-4 text-yellow-500" />
            ) : currentTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-blue-400" />
            ) : currentTheme === 'christmas' ? (
            <span className="text-xs">🎄</span>
            ) : currentTheme === 'halloween' ? (
            <span className="text-xs">🎃</span>
            ) : currentTheme === 'cyberpunk' ? (
            <span className="text-xs">🌟</span>
            ) : currentTheme === 'diwali' ? (
            <span className="text-xs">🪔</span>
            ) : (
            <Moon className="h-4 w-4 text-blue-400" />
            )}
        </div>
        </button>
    </div>
    </div>
</div>
</nav>

{/* Hero Section */}
<section id="home" className="pt-24 pb-20 relative">

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center max-w-4xl mx-auto">
    <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${themeStyles.text}`}>
        Welcome to <span className={`${themeStyles.accent}`}>{storeName}</span>
        {getThemeEmoji(currentTheme) && <span className="ml-2">{getThemeEmoji(currentTheme)}</span>}
    </h1>
    
    <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
        A modern retail experience built for smarter shopping and seamless store management.
    </p>
    
    {/* Action Buttons with Theme-Aware Ripple Effect */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
        <Link to="/signup">
        <Button
            size="lg"
            className={`bg-gradient-to-r ${themeStyles.buttonPrimary} text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg ${themeStyles.hover} transition-all duration-300 flex items-center relative overflow-hidden group transform hover:scale-105`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <ShoppingBag className="mr-3 h-6 w-6 relative z-10" />
            <span className="relative z-10">Customer Portal</span>
        </Button>
        </Link>

        <Link to="/manager">
        <Button
            size="lg"
            className={`bg-gradient-to-r ${themeStyles.buttonSecondary} text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg ${themeStyles.hover} transition-all duration-300 flex items-center relative overflow-hidden group transform hover:scale-105`}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
            <Settings className="mr-3 h-6 w-6 relative z-10" />
            <span className="relative z-10">Manager Portal</span>
        </Button>
        </Link>
    </div>

    {/* Key Benefits with 3D Tilt Effect */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className={`text-center p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 relative overflow-hidden group cursor-pointer ${themeStyles.cardBg} ${themeStyles.border} backdrop-blur-sm ${themeStyles.hover}`}>
        <div className={`absolute inset-0 ${themeStyles.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <Shield className={`h-12 w-12 ${themeStyles.accent} mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300`} />
        <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text} relative z-10`}>
            Secure & Reliable
        </h3>
        <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} relative z-10`}>
            Enterprise-grade security with 99.9% uptime guarantee
        </p>
        </div>
        <div className={`text-center p-6 rounded-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group cursor-pointer ${themeStyles.cardBg} ${themeStyles.border} backdrop-blur-sm ${themeStyles.hover}`}>
        <div className={`absolute inset-0 ${themeStyles.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <Zap className={`h-12 w-12 ${themeStyles.accent} mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300`} />
        <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text} relative z-10`}>
            Lightning Fast
        </h3>
        <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} relative z-10`}>
            Optimized performance for seamless user experience
        </p>
        </div>
        <div className={`text-center p-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 relative overflow-hidden group cursor-pointer ${themeStyles.cardBg} ${themeStyles.border} backdrop-blur-sm ${themeStyles.hover}`}>
        <div className={`absolute inset-0 ${themeStyles.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <Bot className={`h-12 w-12 ${themeStyles.accent} mx-auto mb-4 transform group-hover:scale-110 transition-transform duration-300`} />
        <h3 className={`text-lg font-semibold mb-2 ${themeStyles.text} relative z-10`}>
            AI Integrated System
        </h3>
        <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} relative z-10`}>
            Round-the-clock assistance and AI-powered help
        </p>
        </div>
    </div>
    </div>
</div>
</section>

{/* Features Section */}
<section id="features" className={`py-20 ${themeStyles.cardBg} relative`}>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
    <div className="text-center mb-16 relative">
    <h2 className={`text-4xl font-bold mb-4 ${themeStyles.text}`}>
        Powerful Features
    </h2>
    <p className={`text-xl ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
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
        <h3 className={`text-3xl font-bold mb-4 ${themeStyles.text}`}>
        Customer Experience
        </h3>
        <p className={`text-lg ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
        Enhanced shopping experience with AI-powered features
        </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {customerFeatures.map((feature, index) => (
        <div
            key={index}
            className={`p-6 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden group transform hover:scale-105 border-2 border-transparent ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.hover} backdrop-blur-sm`}
            style={{
            transform: `perspective(1000px) rotateX(${Math.sin(index * 0.5) * 2}deg) rotateY(${Math.cos(index * 0.3) * 2}deg)`,
            animationDelay: `${index * 0.1}s`
            }}
        >
            <div className={`absolute inset-0 ${themeStyles.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className={`absolute top-0 left-0 w-full h-1 ${themeStyles.button} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            <feature.icon className={`h-10 w-10 ${themeStyles.accent} mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 relative z-10`} />
            <h4 className={`text-lg font-semibold mb-2 ${themeStyles.text} relative z-10`}>
            {feature.title}
            </h4>
            <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} relative z-10`}>
            {feature.description}
            </p>
        </div>
        ))}
    </div>
    </div>

    {/* Manager Features */}
    <div>
    <div className="text-center mb-12">
        <h3 className={`text-3xl font-bold mb-4 ${themeStyles.text}`}>
        Manager Dashboard
        </h3>
        <p className={`text-lg ${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')}`}>
        Complete business management and analytics tools
        </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {managerFeatures.map((feature, index) => (
        <div
            key={index}
            className={`p-6 rounded-xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer relative overflow-hidden group transform hover:scale-105 border-2 border-transparent ${themeStyles.border} ${themeStyles.cardBg} ${themeStyles.hover} backdrop-blur-sm`}
            style={{
            transform: `perspective(1000px) rotateX(${Math.sin((index + 3) * 0.5) * 2}deg) rotateY(${Math.cos((index + 3) * 0.3) * 2}deg)`,
            animationDelay: `${(index + customerFeatures.length) * 0.1}s`
            }}
        >
            <div className={`absolute inset-0 ${themeStyles.gradientOverlay} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className={`absolute top-0 left-0 w-full h-1 ${themeStyles.button} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
            <feature.icon className={`h-10 w-10 ${themeStyles.accent} mb-4 transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300 relative z-10`} />
            <h4 className={`text-lg font-semibold mb-2 ${themeStyles.text} relative z-10`}>
            {feature.title}
            </h4>
            <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-600')} relative z-10`}>
            {feature.description}
            </p>
        </div>
        ))}
    </div>
    </div>
</div>
</section>

{/* Footer */}
<footer className={`py-12 ${themeStyles.bg} border-t ${themeStyles.border}`}>
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center">
    <div className="flex items-center justify-center space-x-3 mb-4">
        <Store className={`h-8 w-8 ${themeStyles.accent}`} />
        <span className={`text-2xl font-bold ${themeStyles.text}`}>
        StoreZen
        </span>
        {currentTheme === 'christmas' && <span className="text-xl">🎅</span>}
        {currentTheme === 'halloween' && <span className="text-xl">👻</span>}
        {currentTheme === 'cyberpunk' && <span className="text-xl">🌟</span>}
        {currentTheme === 'diwali' && <span className="text-xl">🪔</span>}
    </div>
    <p className={`${themeStyles.text.replace('text-', 'text-').replace('-900', '-400')}`}>
        © 2025 StoreZen. All rights reserved. Transforming retail experiences worldwide.
    </p>
    </div>
</div>
</footer>
</div>
);
};

export default Main;