import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ShoppingCart, Users } from "lucide-react";

const Main = () => {
return (
<div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4 font-poppins">
    <div className="text-center space-y-12 animate-fade-in">
    {/* Header */}
    <div className="space-y-6">
        <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl tracking-tight">
        Store<span className="text-yellow-300">Zen</span>
        </h1>
        <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
        Welcome to StoreZen - Choose Your Role to Proceed
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-300 to-pink-300 mx-auto rounded-full"></div>
    </div>

    {/* CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link to="/customer">
        <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-gray-100 font-semibold text-lg px-8 py-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl w-64 h-16 animate-scale-in"
        >
            <ShoppingCart className="mr-3 h-6 w-6" />
            I'm a Customer
        </Button>
        </Link>

        <Link to="/manager">
        <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-semibold text-lg px-8 py-6 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-3xl w-64 h-16 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
        >
            <Users className="mr-3 h-6 w-6" />
            I'm a Manager
        </Button>
        </Link>
    </div>

    {/* Features Preview */}
    <div
        className="text-white/80 text-sm space-y-2 animate-fade-in"
        style={{ animationDelay: "0.4s" }}
    >
        <p>✨ AI-Powered Product Suggestions</p>
        <p>📊 Real-time Analytics Dashboard</p>
        <p>💬 Smart Chatbot Support</p>
    </div>
    </div>
</div>
);
};

export default Main;