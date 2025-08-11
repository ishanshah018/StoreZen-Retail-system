import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../lib/utils';
import { Store, ArrowLeft, Mail, Lock, LogIn, Eye, EyeOff} from 'lucide-react';
import { useTheme, getThemeStyles, ThemeBackground, getThemeEmoji, getToastTheme } from '../components/theme';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    })

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [particles, setParticles] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [typingText, setTypingText] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);
    const containerRef = useRef(null);

    // Get theme from context
    const { currentTheme } = useTheme();

    const navigate = useNavigate();

    // Get theme styles
    const themeStyles = getThemeStyles(currentTheme);

    // Typing animation for welcome text
    const welcomeText = "Welcome Back !";
    useEffect(() => {
        let index = 0;
        const timer = setInterval(() => {
            if (index < welcomeText.length) {
                setTypingText(welcomeText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(timer);
            }
        }, 100);
        return () => clearInterval(timer);
    }, []);

    // Initialize particles for interactive background
    useEffect(() => {
        const initParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.5 + 0.1,
                });
            }
            setParticles(newParticles);
        };
        initParticles();
    }, []);

    // Animate particles
    useEffect(() => {
        const animateParticles = () => {
            setParticles(prev => prev.map(particle => {
                let newX = particle.x + particle.vx;
                let newY = particle.y + particle.vy;
                
                if (newX < 0 || newX > window.innerWidth) particle.vx *= -1;
                if (newY < 0 || newY > window.innerHeight) particle.vy *= -1;
                
                return {
                    ...particle,
                    x: Math.max(0, Math.min(window.innerWidth, newX)),
                    y: Math.max(0, Math.min(window.innerHeight, newY)),
                };
            }));
        };

        const interval = setInterval(animateParticles, 50);
        return () => clearInterval(interval);
    }, []);

    // Track mouse position for particle connections
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
        
        // Reset states when user starts typing after an error
        if (isLoading && !loginSuccess) {
            setIsLoading(false);
        }
        if (loginSuccess) {
            setLoginSuccess(false);
            setShowConfetti(false);
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginSuccess(false);
        setShowConfetti(false);
        
        // Safety timeout to reset loading state if something goes wrong
        const timeoutId = setTimeout(() => {
            setIsLoading(false);
            setLoginSuccess(false);
        }, 10000); // 10 seconds timeout
        
        const { email, password } = loginInfo;
        if (!email || !password) {
            setIsLoading(false);
            clearTimeout(timeoutId);
            return handleError('Email and password are required')
        }
        try {
            const url = `http://localhost:8080/auth/login`;
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, userId, error } = result;
            
            // Clear the safety timeout since we got a response
            clearTimeout(timeoutId);
            
            if (success) {
                // Show success animation and confetti
                setLoginSuccess(true);
                setShowConfetti(true);

                // Store user data
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                localStorage.setItem('customerName', name);
                localStorage.setItem('userId', userId);

                // Increment customer request counter (only on real login)
                const currentClicks = localStorage.getItem('customerDashboardClicks') || '0';
                const newClickCount = parseInt(currentClicks) + 1;
                localStorage.setItem('customerDashboardClicks', newClickCount.toString());
                // Optionally, clear session flag if used elsewhere
                sessionStorage.removeItem('dashboardCountedThisSession');

                // Show success message
                handleSuccess(message);

                // Wait for success animation to complete, then redirect
                setTimeout(() => {
                    navigate('/customer')
                }, 2000) // Increased time to show success animation
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
                setIsLoading(false);
                setLoginSuccess(false);
            } else if (!success) {
                handleError(message);
                setIsLoading(false);
                setLoginSuccess(false);
            }
        } catch (err) {
            clearTimeout(timeoutId);
            handleError(err.message || 'Login failed');
            setIsLoading(false);
            setLoginSuccess(false);
        }
    }

    return (
        <div ref={containerRef} className={`min-h-screen flex items-center justify-center px-4 py-12 transition-all duration-500 ${themeStyles.bg} relative overflow-hidden`}>
            {/* Interactive Particle Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <svg className="w-full h-full">
                    {/* Draw particles */}
                    {particles.map(particle => (
                        <circle
                            key={particle.id}
                            cx={particle.x}
                            cy={particle.y}
                            r={particle.size}
                            fill={currentTheme === 'light' ? '#3b82f6' : '#60a5fa'}
                            opacity={particle.opacity}
                            className="animate-pulse"
                        />
                    ))}
                    {/* Draw connections between nearby particles and mouse */}
                    {particles.map(particle => {
                        const distance = Math.sqrt(
                            Math.pow(particle.x - mousePos.x, 2) + Math.pow(particle.y - mousePos.y, 2)
                        );
                        if (distance < 100) {
                            return (
                                <line
                                    key={`line-${particle.id}`}
                                    x1={particle.x}
                                    y1={particle.y}
                                    x2={mousePos.x}
                                    y2={mousePos.y}
                                    stroke={currentTheme === 'light' ? '#3b82f6' : '#60a5fa'}
                                    strokeWidth="1"
                                    opacity={1 - distance / 100}
                                />
                            );
                        }
                        return null;
                    })}
                    {/* Draw connections between nearby particles */}
                    {particles.map((particle, i) => 
                        particles.slice(i + 1).map((other, j) => {
                            const distance = Math.sqrt(
                                Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
                            );
                            if (distance < 80) {
                                return (
                                    <line
                                        key={`connection-${i}-${j}`}
                                        x1={particle.x}
                                        y1={particle.y}
                                        x2={other.x}
                                        y2={other.y}
                                        stroke={currentTheme === 'light' ? '#3b82f6' : '#60a5fa'}
                                        strokeWidth="0.5"
                                        opacity={1 - distance / 80}
                                    />
                                );
                            }
                            return null;
                        })
                    )}
                </svg>
            </div>

            {/* Animated Gradient Waves */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, ${currentTheme === 'light' ? '#3b82f6' : '#60a5fa'} 0%, transparent 50%)`,
                        transition: 'background 0.3s ease'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent transform rotate-45 animate-spin" style={{animationDuration: '20s'}} />
            </div>

            {/* Confetti Animation */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 animate-bounce"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10px`,
                                backgroundColor: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                                transform: `rotate(${Math.random() * 360}deg)`,
                            }}
                        />
                    ))}
                </div>
            )}

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
                            <Store className={`h-12 w-12 ${themeStyles.accent} transform hover:rotate-12 transition-transform duration-300`} />
                        </div>
                        <h2 className={`text-3xl font-bold ${themeStyles.text} min-h-[2.5rem]`}>
                            {typingText}
                            <span className="animate-pulse">|</span>
                            {getThemeEmoji(currentTheme) && <span className="ml-2">{getThemeEmoji(currentTheme)}</span>}
                        </h2>
                        <p className={`mt-2 ${themeStyles.text} opacity-80 animate-fade-in`}>
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
                                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${themeStyles.input}`}
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
                                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm ${themeStyles.input}`}
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