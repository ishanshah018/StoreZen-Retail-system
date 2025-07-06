import React from "react";
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
Repeat,
Percent,
MessageCircle,
FileText,
Heart,
Plus,
Download,
Send,
} from "lucide-react";

const Manager = () => {
const inventoryFeatures = [
{
    title: "View Product Inventory",
    description: "Complete inventory management with real-time stock levels",
    icon: Package,
    color: "from-emerald-500 to-teal-500",
    category: "inventory",
    actions: ["View Details", "Add Product", "Update Stock"],
},
];

const analyticsFeatures = [
{
    title: "View Sales Report",
    description: "Comprehensive sales analytics with AI-driven insights",
    icon: BarChart,
    color: "from-purple-500 to-pink-500",
    category: "analytics",
    actions: ["View Report", "Download PDF", "Schedule Email"],
},
];

const marketingFeatures = [
{
    title: "Send Promotional Messages",
    description: "Launch targeted SMS campaigns via Twilio integration",
    icon: Megaphone,
    color: "from-cyan-500 to-blue-500",
    category: "marketing",
    actions: ["Create Campaign", "Send Now", "Schedule"],
},
{
    title: "Add New Discount Coupons",
    description: "Create and manage promotional discount codes",
    icon: Percent,
    color: "from-amber-500 to-orange-500",
    category: "marketing",
    actions: ["Add Coupon", "View Active", "Set Expiry"],
},
];

const customerFeatures = [
{
    title: "View Customer Data",
    description: "Customer insights and top purchased items analysis",
    icon: Users,
    color: "from-blue-500 to-indigo-500",
    category: "customer",
    actions: ["View Profiles", "Export Data", "Send Message"],
},
{
    title: "View Returned Items",
    description: "Track and manage product returns and exchanges",
    icon: Repeat,
    color: "from-orange-500 to-red-500",
    category: "customer",
    actions: ["Process Return", "Update Status", "Generate Report"],
},
{
    title: "View Feedbacks from Customers",
    description: "Customer reviews and satisfaction analytics",
    icon: Send,
    color: "from-rose-500 to-pink-500",
    category: "customer",
    actions: ["View All", "Respond", "Analytics"],
},
{
    title: "View Wishlist Submitted by Customers",
    description: "Customer wishlist requests for out-of-stock items",
    icon: Heart,
    color: "from-pink-500 to-rose-500",
    category: "customer",
    actions: ["View Requests", "Notify Stock", "Priority List"],
},
];

const systemFeatures = [
{
    title: "View Chatbot Logs",
    description: "Monitor AI chatbot interactions and performance",
    icon: MessageCircle,
    color: "from-violet-500 to-purple-500",
    category: "system",
    actions: ["View Logs", "Export Data", "Performance"],
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
    inventory: "📦 Inventory Management",
    analytics: "📊 Sales Analytics",
    marketing: "📣 Marketing Tools",
    customer: "👥 Customer Management",
    system: "🔧 System Monitoring",
};
return titles[category];
};

const categories = ["inventory", "analytics", "marketing", "customer", "system"];

return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 font-poppins">
    {/* Header */}
    <div className="bg-gradient-to-r from-slate-900 to-gray-800 text-white shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-3">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            StoreZen
            </div>
            <span className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full font-medium">
            Manager Portal
            </span>
        </Link>
        <Link to="/">
            <Button
            variant="outline"
            className="rounded-full border-white/20 text-white hover:bg-white/10"
            >
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
        Manager Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
        Complete retail management suite with AI-powered insights and automation
        </p>
    </div>

    {/* Quick Actions */}
    <div className="mb-12 flex flex-wrap gap-4 justify-center">
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg rounded-xl px-8">
        <Plus className="mr-2 h-5 w-5" />
        Quick Add Product
        </Button>
        <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg rounded-xl px-8">
        <BarChart className="mr-2 h-5 w-5" />
        Today's Report
        </Button>
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:shadow-lg rounded-xl px-8">
        <Send className="mr-2 h-5 w-5" />
        Send Campaign
        </Button>
    </div>

    {/* Feature Cards */}
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
                className="group hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-0 shadow-lg animate-fade-in rounded-2xl overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                >
                <CardHeader className="text-center pb-4">
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
                    <CardDescription className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                    </CardDescription>
                    <div className="space-y-2">
                    {feature.actions.slice(0, 2).map((action, i) => (
                        <Button
                        key={i}
                        size="sm"
                        className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-md transition-all duration-300 rounded-lg text-sm ${
                            i === 0 ? "font-semibold" : "opacity-90"
                        }`}
                        >
                        {action}
                        </Button>
                    ))}
                    {feature.actions.length > 2 && (
                        <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-lg text-sm border-gray-200 hover:bg-gray-50"
                        >
                        More Options
                        </Button>
                    )}
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        </div>
        );
    })}

    {/* Management Stats */}
    <div className="mt-20 bg-gradient-to-r from-slate-900 to-gray-800 rounded-3xl shadow-2xl p-8 md:p-12 text-white">
        <h2 className="text-3xl font-bold text-center mb-12">Platform Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div className="space-y-2">
            <div className="text-4xl font-bold text-emerald-400">2,847</div>
            <div className="text-gray-300">Active Products</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-blue-400">1,234</div>
            <div className="text-gray-300">Customer Requests</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-purple-400">$125K</div>
            <div className="text-gray-300">Monthly Revenue</div>
        </div>
        <div className="space-y-2">
            <div className="text-4xl font-bold text-pink-400">4.8★</div>
            <div className="text-gray-300">Customer Rating</div>
        </div>
        </div>
    </div>

    {/* System Health */}
    <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        System Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <div className="text-gray-600">Uptime</div>
        </div>
        <div className="space-y-2">
            <div className="text-2xl font-bold text-blue-600">1.2s</div>
            <div className="text-gray-600">Response Time</div>
        </div>
        <div className="space-y-2">
            <div className="text-2xl font-bold text-purple-600">AI</div>
            <div className="text-gray-600">Powered</div>
        </div>
        </div>
    </div>
    </div>
</div>
);
};

export default Manager;