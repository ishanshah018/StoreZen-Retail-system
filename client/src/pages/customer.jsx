import React from "react";
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
Percent,
Repeat,
BarChart,
Star,
Heart,
Send,
} from "lucide-react";

const Customer = () => {
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
{
    title: "View Discount Coupons",
    description: "Personal discount codes and promotional offers",
    icon: Percent,
    color: "from-teal-500 to-cyan-500",
    category: "billing",
},
];

const supportFeatures = [
{
    title: "Return/Replacement Product",
    description: "Easy returns and exchanges with tracking",
    icon: Repeat,
    color: "from-orange-500 to-red-500",
    category: "support",
},
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
    profile: "👤 Profile Management",
    shopping: "🛒 Shopping Experience",
    billing: "💳 Billing & Rewards",
    support: "🛠️ Support & Services",
    insights: "📊 Smart Insights",
};
return titles[category];
};

const categories = ["profile", "shopping", "billing", "support", "insights"];

return (
<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-poppins">
    {/* Header */}
    <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StoreZen
            </div>
            <span className="text-sm bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            Customer Portal
            </span>
        </Link>
        <Link to="/">
            <Button variant="outline" className="rounded-full">
            ← Back to Home
            </Button>
        </Link>
        </div>
    </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
        Customer Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Your complete shopping experience powered by AI technology
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
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {getCategoryTitle(category)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categoryFeatures.map((feature, index) => (
                <Card
                key={feature.title}
                className={`group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg animate-fade-in rounded-2xl overflow-hidden ${
                    feature.special
                    ? "ring-2 ring-yellow-400 ring-opacity-50"
                    : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                >
                <CardHeader className="text-center pb-4 relative">
                    {feature.special && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ✨ AI
                    </div>
                    )}
                    <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-shadow`}
                    >
                    <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {feature.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                    </CardDescription>
                    <Button
                    className={`bg-gradient-to-r ${feature.color} hover:shadow-lg transition-all duration-300 rounded-full px-6 ${
                        feature.special
                        ? "ring-2 ring-yellow-300 ring-opacity-50"
                        : ""
                    }`}
                    >
                    {feature.special ? "✨ Launch AI" : "Get Started"}
                    </Button>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
        );
    })}

    {/* Stats Section */}
    <div className="mt-20 bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
        Your StoreZen Experience
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-2">
            <div className="text-4xl font-bold text-purple-600">24/7</div>
            <div className="text-gray-600">AI Support</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-600">1M+</div>
            <div className="text-gray-600">Products Available</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-green-600">Smart</div>
            <div className="text-gray-600">Billing System</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-orange-600">AI</div>
            <div className="text-gray-600">Recommendations</div>
        </div>
        </div>
    </div>
    </div>
</div>
);
};

export default Customer;