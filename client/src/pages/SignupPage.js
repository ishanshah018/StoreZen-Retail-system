import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../lib/utils';
import { Store, ArrowLeft, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useTheme, getThemeStyles, ThemeBackground, getThemeEmoji, getToastTheme } from '../components/theme';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    })

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Get theme from context
    const { currentTheme } = useTheme();

    const navigate = useNavigate();

    // Get theme styles
    const themeStyles = getThemeStyles(currentTheme);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }

    const handleSignup = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            setIsLoading(false);
            return handleError('Name, email and password are required')
        }
        try {
            const url = `http://localhost:8080/auth/signup`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login')
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(err.message || 'Signup failed');
        } finally {
            setIsLoading(false);
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

                {/* Signup Card */}
                <div className={`${themeStyles.cardBg} backdrop-blur-xl border rounded-2xl shadow-2xl p-8`}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <Store className={`h-12 w-12 ${themeStyles.accent}`} />
                        </div>
                        <h2 className={`text-3xl font-bold ${themeStyles.text}`}>
                            SignUp
                            {getThemeEmoji(currentTheme) && <span className="ml-2">{getThemeEmoji(currentTheme)}</span>}
                        </h2>
                        <p className={`mt-2 ${themeStyles.text} opacity-80`}>
                            Create your new account
                        </p>
                    </div>

                    {/* Signup Form */}
                    <form onSubmit={handleSignup} className="space-y-6">
                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className={`h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={signupInfo.name}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

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
                                    value={signupInfo.email}
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
                                    autoComplete="new-password"
                                    required
                                    value={signupInfo.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                    placeholder="Create a password"
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

                        {/* Signup Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-white font-medium rounded-lg ${themeStyles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                    <UserPlus className="h-5 w-5 text-white group-hover:text-blue-100 transition-colors" />
                                </span>
                                {isLoading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center">
                            <p className={`${themeStyles.text} opacity-80`}>
                                Already have an account?{' '}
                                <Link 
                                    to="/login" 
                                    className={`font-medium ${themeStyles.link} transition-colors duration-200`}
                                >
                                    Sign in here
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

export default Signup