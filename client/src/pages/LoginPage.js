import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../lib/utils';
import { Store, ArrowLeft, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useTheme, getThemeStyles, ThemeBackground, getThemeEmoji, getToastTheme } from '../components/theme';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Get theme from context
    const { currentTheme } = useTheme();

    const navigate = useNavigate();

    // Get theme styles
    const themeStyles = getThemeStyles(currentTheme);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginSuccess(false);
        const { email, password } = loginInfo;
        if (!email || !password) {
            setIsLoading(false);
            return handleError('Email and password are required')
        }
        try {
            const url = `http://localhost:8000/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                // Show success animation
                setLoginSuccess(true);
                
                // Store user data
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('customerName', name);
                
                // Show success message
                handleSuccess(message);
                
                // Wait for success animation to complete, then redirect
                setTimeout(() => {
                    navigate('/customer')
                }, 2000) // Increased time to show success animation
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err.message || 'Login failed');
            setIsLoading(false);
            setLoginSuccess(false);
        }
    }

    return (
        <div className={`min-h-screen flex items-center justify-center px-4 py-12 transition-all duration-500 ${themeStyles.bg}`}>
            {/* Animated Background Elements */}
            <ThemeBackground currentTheme={currentTheme} />

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Back to Home Button */}
                <div className="flex justify-start">
                    <Link to="/" className={`inline-flex items-center ${themeStyles.link} transition-colors duration-200`}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Home
                    </Link>
                </div>

                {/* Login Card */}
                <div className={`${themeStyles.cardBg} backdrop-blur-xl border rounded-2xl shadow-2xl p-8`}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Store className={`h-12 w-12 ${themeStyles.accent}`} />
                        </div>
                        <h2 className={`text-3xl font-bold ${themeStyles.text}`}>
                            Welcome Back
                            {getThemeEmoji(currentTheme) && <span className="ml-2">{getThemeEmoji(currentTheme)}</span>}
                        </h2>
                        <p className={`mt-2 ${themeStyles.text} opacity-80`}>
                            Sign in to your StoreZen account
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className={`h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={loginInfo.email}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className={`h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    required
                                    value={loginInfo.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className={`h-5 w-5 ${themeStyles.accent} opacity-70 hover:opacity-100 transition-opacity`} />
                                    ) : (
                                        <Eye className={`h-5 w-5 ${themeStyles.accent} opacity-70 hover:opacity-100 transition-opacity`} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || loginSuccess}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg ${
                                    loginSuccess 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                                        : themeStyles.button
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed overflow-hidden`}
                            >
                                {/* Loading Animation */}
                                {isLoading && !loginSuccess && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                        {/* Animated Background Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse"></div>
                                        
                                        {/* Loading Content */}
                                        <div className="relative flex items-center space-x-3 z-10">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                            
                                            {/* Loading Dots */}
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                            </div>
                                            
                                            <span className="text-white font-medium">Signing In...</span>
                                        </div>
                                        
                                        {/* Shimmer Effect */}
                                        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                                    </div>
                                )}
                                
                                {/* Success Animation */}
                                {loginSuccess && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                                        {/* Success Content */}
                                        <div className="relative flex items-center space-x-3 z-10">
                                            {/* Success Checkmark */}
                                            <div className="relative">
                                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center animate-pulse">
                                                    <svg className="w-4 h-4 text-green-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                {/* Success Ring Animation */}
                                                <div className="absolute inset-0 w-6 h-6 border-2 border-white rounded-full animate-ping opacity-75"></div>
                                            </div>
                                            
                                            <span className="text-white font-medium animate-pulse">Login Successful!</span>
                                            
                                            {/* Success Particles */}
                                            <div className="flex space-x-1">
                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '100ms'}}></div>
                                                <div className="w-1 h-1 bg-white rounded-full animate-bounce" style={{animationDelay: '200ms'}}></div>
                                            </div>
                                        </div>
                                        
                                        {/* Success Shimmer */}
                                        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                    </div>
                                )}
                                
                                {/* Default Button Content */}
                                <div className={`flex items-center justify-center transition-opacity duration-300 ${(isLoading || loginSuccess) ? 'opacity-0' : 'opacity-100'}`}>
                                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                        <LogIn className="h-5 w-5 text-white group-hover:text-blue-100 transition-colors" />
                                    </span>
                                    <span className="ml-6">Sign In</span>
                                </div>
                            </button>
                        </div>

                        {/* Signup Link */}
                        <div className="text-center">
                            <p className={`${themeStyles.text} opacity-80`}>
                                Don't have an account?{' '}
                                <Link 
                                    to="/signup" 
                                    className={`font-medium ${themeStyles.link} transition-colors duration-200`}
                                >
                                    Sign up here
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={getToastTheme(currentTheme)}
            />
        </div>
    )
}

export default Login