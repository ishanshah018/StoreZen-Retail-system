import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../lib/utils';
import { ArrowLeft, User, Mail, Lock, MapPin, Bell, Save, Eye, EyeOff, Home, Building } from 'lucide-react';
import { useTheme, getThemeStyles, ThemeBackground, getThemeEmoji, getToastTheme } from '../components/theme';

function Profile() {
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        password: '',
        contactNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        },
        notificationPreferences: {
            promotions: false
        }
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);

    // Get theme from context
    const { currentTheme } = useTheme();
    const navigate = useNavigate();

    // Get theme styles
    const themeStyles = getThemeStyles(currentTheme);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/signup');
                return;
            }

            const response = await fetch('http://localhost:8000/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                setProfileData({
                    ...result.profile,
                    password: '' // Don't show password
                });
            } else {
                handleError(result.message || 'Failed to load profile');
            }
        } catch (error) {
            handleError('Error loading profile');
        } finally {
            setIsLoading(false);
            setInitialLoad(false);
        }
    }, [navigate]);

    // Load profile data on component mount
    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else if (name.startsWith('notificationPreferences.')) {
            const prefField = name.split('.')[1];
            setProfileData(prev => ({
                ...prev,
                notificationPreferences: {
                    ...prev.notificationPreferences,
                    [prefField]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setProfileData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');
            const updateData = {
                name: profileData.name,
                email: profileData.email,
                contactNumber: profileData.contactNumber,
                address: profileData.address,
                notificationPreferences: profileData.notificationPreferences
            };

            // Only include password if it's been changed
            if (profileData.password.trim()) {
                updateData.password = profileData.password;
            }

            const response = await fetch('http://localhost:8000/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();
            
            if (result.success) {
                handleSuccess('Profile updated successfully!');
                // Update localStorage if name changed
                if (updateData.name) {
                    localStorage.setItem('loggedInUser', updateData.name);
                    localStorage.setItem('customerName', updateData.name);
                }
                // Clear password field after successful update
                setProfileData(prev => ({ ...prev, password: '' }));
            } else {
                handleError(result.message || 'Failed to update profile');
            }
        } catch (error) {
            handleError('Error updating profile');
        } finally {
            setIsSaving(false);
        }
    };

    if (initialLoad && isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${themeStyles.bg}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className={`${themeStyles.text} text-lg`}>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-all duration-500 ${themeStyles.bg} relative overflow-hidden`}>
            {/* Animated Background Elements */}
            <ThemeBackground currentTheme={currentTheme} />

            <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
                {/* Back Button */}
                <div className="flex justify-start mb-6">
                    <button
                        onClick={() => navigate('/customer')}
                        className={`inline-flex items-center ${themeStyles.link} transition-colors duration-200 hover:scale-105`}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Profile Card */}
                <div className={`${themeStyles.cardBg} backdrop-blur-xl border rounded-2xl shadow-2xl p-8`}>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <User className={`h-16 w-16 ${themeStyles.accent} transform hover:rotate-12 transition-transform duration-300`} />
                        </div>
                        <h1 className={`text-4xl font-bold ${themeStyles.text}`}>
                            Your Profile
                            {getThemeEmoji(currentTheme) && <span className="ml-2">{getThemeEmoji(currentTheme)}</span>}
                        </h1>
                        <p className={`mt-2 ${themeStyles.text} opacity-80`}>
                            Manage your personal information and preferences
                        </p>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Personal Information Section */}
                        <div className={`p-6 rounded-xl ${themeStyles.cardBg} border border-gray-200/20`}>
                            <h2 className={`text-2xl font-semibold ${themeStyles.text} mb-6 flex items-center`}>
                                <User className="h-6 w-6 mr-2" />
                                Personal Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Password (Leave blank to keep current password)
                                    </label>
                                    <div className="relative">
                                        <Lock className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={profileData.password}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter new password"
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

                                {/* Contact Number Field */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Contact Number
                                    </label>
                                    <div className="relative">
                                        <svg className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={profileData.contactNumber}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your contact number"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className={`p-6 rounded-xl ${themeStyles.cardBg} border border-gray-200/20`}>
                            <h2 className={`text-2xl font-semibold ${themeStyles.text} mb-6 flex items-center`}>
                                <MapPin className="h-6 w-6 mr-2" />
                                Address Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Street Address */}
                                <div className="md:col-span-2">
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Street Address
                                    </label>
                                    <div className="relative">
                                        <Home className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={profileData.address.street}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your street address"
                                        />
                                    </div>
                                </div>

                                {/* City */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        City
                                    </label>
                                    <div className="relative">
                                        <Building className={`absolute left-3 top-3 h-5 w-5 ${themeStyles.accent} opacity-70`} />
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={profileData.address.city}
                                            onChange={handleInputChange}
                                            className={`block w-full pl-10 pr-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>

                                {/* State */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={profileData.address.state}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                        placeholder="Enter your state"
                                    />
                                </div>

                                {/* Pincode */}
                                <div>
                                    <label className={`block text-sm font-medium ${themeStyles.text} mb-2`}>
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="address.pincode"
                                        value={profileData.address.pincode}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-3 border rounded-lg ${themeStyles.input} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                                        placeholder="Enter your pincode"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Notification Preferences Section */}
                        <div className={`p-6 rounded-xl ${themeStyles.cardBg} border border-gray-200/20`}>
                            <h2 className={`text-2xl font-semibold ${themeStyles.text} mb-6 flex items-center`}>
                                <Bell className="h-6 w-6 mr-2" />
                                Notification Preferences
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg border-gray-200/20">
                                    <div>
                                        <h3 className={`font-medium ${themeStyles.text}`}>Promotions & Offers</h3>
                                        <p className={`text-sm ${themeStyles.text} opacity-70`}>
                                            Receive notifications about special deals and promotions
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="notificationPreferences.promotions"
                                            checked={profileData.notificationPreferences.promotions}
                                            onChange={handleInputChange}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className={`group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r ${themeStyles.button} text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </button>
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
    );
}

export default Profile;
