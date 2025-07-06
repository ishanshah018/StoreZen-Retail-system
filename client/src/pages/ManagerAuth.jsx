import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, Mail, User, Lock, ArrowLeft, Shield } from "lucide-react";
import { loginManager } from "../lib/utils";

const ManagerAuth = () => {
const navigate = useNavigate();
const [isLogin, setIsLogin] = useState(true);
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [showOTP, setShowOTP] = useState(false);
const [formData, setFormData] = useState({
name: '',
email: '',
password: '',
confirmPassword: '',
otp: ''
});
const [errors, setErrors] = useState({});

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) =>
password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password);

const handleInputChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));

if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
}
};

const handleSubmit = (e) => {
e.preventDefault();
const newErrors = {};

if (!isLogin && !formData.name.trim()) {
    newErrors.name = 'Name is required';
}

if (!validateEmail(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
}

if (!validatePassword(formData.password)) {
    newErrors.password =
    'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
}

if (!isLogin && formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
}

setErrors(newErrors);

if (Object.keys(newErrors).length === 0) {
    if (!isLogin) {
    setShowOTP(true);
    } else {
    console.log('Manager login successful');
    loginManager();
    navigate('/manager');
    }
}
};

const handleOTPSubmit = (e) => {
e.preventDefault();
if (formData.otp.length === 6) {
    console.log('Manager registration successful');
    loginManager();
    navigate('/manager');
} else {
    setErrors({ otp: 'Please enter the 6-digit OTP' });
}
};

if (showOTP) {
return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center p-4 font-poppins">
    <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">Verify Manager Account</CardTitle>
        <CardDescription>
            We've sent a secure 6-digit OTP to {formData.email}
        </CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={formData.otp}
                onChange={handleInputChange}
                className="text-center text-2xl tracking-widest"
            />
            {errors.otp && <p className="text-sm text-red-600">{errors.otp}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500">
            Verify & Complete Registration
            </Button>
            <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowOTP(false)}
            >
            Back to Registration
            </Button>
        </form>
        </CardContent>
    </Card>
    </div>
);
}

return (
<div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 flex items-center justify-center p-4 font-poppins">
    <div className="w-full max-w-md">
    <Link to="/" className="inline-flex items-center text-white mb-6 hover:text-yellow-300 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
    </Link>

    <Card className="shadow-2xl">
        <CardHeader className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">
            Manager {isLogin ? 'Login' : 'Register'}
        </CardTitle>
        <CardDescription>
            {isLogin ? 'Access your StoreZen admin panel' : 'Join StoreZen Management Team'}
        </CardDescription>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10"
                />
                </div>
                {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
            )}

            <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10"
                />
            </div>
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 pr-10"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
            {!isLogin && (
                <p className="text-xs text-gray-500">
                Must include uppercase, lowercase, number, and special character
                </p>
            )}
            </div>

            {!isLogin && (
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium text-orange-600 hover:text-orange-500"
            >
                {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
            </p>
        </div>
        </CardContent>
    </Card>
    </div>
</div>
);
};

export default ManagerAuth;