import React, { useState, useEffect } from 'react';
import { X, Tag, Plus, Trash2, Calendar, Percent, IndianRupee, AlertCircle, CheckCircle, Sparkles, Gift } from 'lucide-react';

// =============================================================================
// COUPON MANAGEMENT COMPONENT
// =============================================================================

/**
 * CouponManagement - Comprehensive coupon creation and management interface
 * Features: Create, view, edit, delete coupons with real-time validation
 * Supports both percentage and fixed amount discount types
 * 
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {object} theme - Theme configuration object
 * @param {string} mode - Operation mode: 'add' | 'view' | 'edit'
 */
const CouponManagement = ({ isOpen, onClose, theme, mode = 'add' }) => {
    // =============================================================================
    // STATE MANAGEMENT
    // =============================================================================
    
    const [activeTab, setActiveTab] = useState(mode === 'view' ? 'view' : 'add');
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [createdCoupon, setCreatedCoupon] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [couponToDelete, setCouponToDelete] = useState(null);
    
    // Form data state
    const [formData, setFormData] = useState({
        coupon_code: '',
        type: '%',
        value: '',
        max_discount: '',
        min_purchase: '',
        valid_from: '',
        valid_until: '',
        applicable_categories: []
    });

    // Available categories - fetched from Django backend
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // Get today's date for form validation
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen && activeTab === 'view') {
            fetchCoupons();
        }
        // Fetch categories when component opens
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen, activeTab]);

    const fetchCategories = async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('http://localhost:8000/api/customer/categories/');
            if (response.ok) {
                const data = await response.json();
                setCategories(data);
            } else {
                console.error('Failed to fetch categories');
                // Fallback to empty array, user will see no categories available
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to empty array in case Django server is not running
            setCategories([]);
        } finally {
            setCategoriesLoading(false);
        }
    };

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:8080/api/coupons/active');
            const data = await response.json();
            
            if (data.success) {
                setCoupons(data.coupons);
            } else {
                setError('Failed to fetch coupons');
            }
        } catch (error) {
            console.error('Error fetching coupons:', error);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Convert coupon code to uppercase automatically
        if (name === 'coupon_code') {
            setFormData(prev => ({
                ...prev,
                [name]: value.toUpperCase()
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleCategoryChange = (category) => {
        setFormData(prev => ({
            ...prev,
            applicable_categories: prev.applicable_categories.includes(category)
                ? prev.applicable_categories.filter(c => c !== category)
                : [...prev.applicable_categories, category]
        }));
    };

    const resetForm = () => {
        setFormData({
            coupon_code: '',
            type: '%',
            value: '',
            max_discount: '',
            min_purchase: '',
            valid_from: '',
            valid_until: '',
            applicable_categories: []
        });
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.coupon_code.trim()) {
            setError('Coupon code is required');
            return;
        }
        
        if (!formData.value || formData.value <= 0) {
            setError('Value must be greater than 0');
            return;
        }
        
        if (formData.type === '%' && formData.value > 100) {
            setError('Percentage discount cannot exceed 100%');
            return;
        }
        
        // Max discount validation only for percentage type
        if (formData.type === '%' && (!formData.max_discount || formData.max_discount < 0)) {
            setError('Max discount is required for percentage discounts and cannot be negative');
            return;
        }
        
        // For fixed amount (rs), set max_discount to the discount value itself
        const finalMaxDiscount = formData.type === 'rs' ? formData.value : formData.max_discount;
        
        if (!formData.min_purchase || formData.min_purchase < 0) {
            setError('Min purchase is required and cannot be negative');
            return;
        }
        
        // For fixed amount (rs), min purchase should be more than discount value
        if (formData.type === 'rs' && parseFloat(formData.min_purchase) <= parseFloat(formData.value)) {
            setError('For fixed amount discounts, minimum purchase must be greater than the discount value');
            return;
        }
        
        if (!formData.valid_until) {
            setError('Valid until date is required');
            return;
        }
        
        // Improved date validation
        const validFromDate = new Date(formData.valid_from || today);
        const validUntilDate = new Date(formData.valid_until);
        
        if (validUntilDate <= validFromDate) {
            setError('Valid until date must be after the valid from date');
            return;
        }
        
        // Check if valid until is not in the past
        const todayDate = new Date(today);
        if (validUntilDate <= todayDate) {
            setError('Valid until date must be in the future');
            return;
        }
        
        if (formData.applicable_categories.length === 0) {
            setError('Please select at least one category (add products with categories first if none available)');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await fetch('http://localhost:8080/api/coupons/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    max_discount: finalMaxDiscount,
                    valid_from: formData.valid_from || today
                })
            });

            const data = await response.json();

            if (data.success) {
                setCreatedCoupon({
                    ...formData,
                    valid_from: formData.valid_from || today
                });
                setShowSuccessModal(true);
                resetForm();
            } else {
                setError(data.message || 'Failed to create coupon');
            }
        } catch (error) {
            console.error('Error creating coupon:', error);
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const deleteCoupon = async (id) => {
        // Show custom modal instead of browser alert
        const coupon = coupons.find(c => c._id === id);
        setCouponToDelete(coupon);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!couponToDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/api/coupons/${couponToDelete._id}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Coupon deleted successfully!');
                fetchCoupons();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(data.message || 'Failed to delete coupon');
            }
        } catch (error) {
            console.error('Error deleting coupon:', error);
            setError('Failed to connect to server');
        } finally {
            setShowDeleteModal(false);
            setCouponToDelete(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className={`relative w-full max-w-6xl max-h-[95vh] ${theme.cardBg} rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${theme.border}`}>
                
                {/* Header */}
                <div className={`px-8 py-6 border-b ${theme.border}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                <Tag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className={`text-2xl font-bold ${theme.text}`}>
                                    Coupon Management
                                </h2>
                                <p className={`text-sm ${theme.textSecondary} mt-1`}>
                                    Create and manage discount coupons for your store
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl ${theme.cardBg} ${theme.textSecondary} hover:bg-red-50 hover:text-red-600 transition-all duration-200 border ${theme.border}`}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex space-x-1 mt-6">
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                activeTab === 'add'
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : `${theme.cardBg} ${theme.textSecondary} hover:bg-blue-50 border ${theme.border}`
                            }`}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Coupon</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('view');
                                fetchCoupons();
                            }}
                            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                                activeTab === 'view'
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : `${theme.cardBg} ${theme.textSecondary} hover:bg-green-50 border ${theme.border}`
                            }`}
                        >
                            <Tag className="w-4 h-4" />
                            <span>View Active Coupons</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    
                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <p className="text-green-700 font-medium">{success}</p>
                        </div>
                    )}
                    
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Add Coupon Tab */}
                    {activeTab === 'add' && (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            
                            {/* Basic Details */}
                            <div className={`p-6 rounded-xl border ${theme.border} bg-opacity-50 backdrop-blur-sm`} style={{backgroundColor: `${theme.cardBg}CC`}}>
                                <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center space-x-2`}>
                                    <Tag className="w-5 h-5 text-blue-500" />
                                    <span>Basic Details</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Coupon Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="coupon_code"
                                            value={formData.coupon_code}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.text} ${theme.cardBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            placeholder="e.g., SAVE20, NEWUSER10"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Discount Type *
                                        </label>
                                        <div className="flex space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ 
                                                    ...prev, 
                                                    type: '%',
                                                    max_discount: '' // Clear max_discount for percentage to let user input
                                                }))}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border ${
                                                    formData.type === '%'
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : `${theme.border} ${theme.textSecondary} ${theme.cardBg} hover:border-blue-300`
                                                }`}
                                            >
                                                <Percent className="w-4 h-4" />
                                                <span>Percentage</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ 
                                                        ...prev, 
                                                        type: 'rs',
                                                        max_discount: prev.value || '' // Set max_discount to value for fixed amount
                                                    }));
                                                }}
                                                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 border ${
                                                    formData.type === 'rs'
                                                        ? 'bg-blue-500 text-white border-blue-500'
                                                        : `${theme.border} ${theme.textSecondary} ${theme.cardBg} hover:border-blue-300`
                                                }`}
                                            >
                                                <IndianRupee className="w-4 h-4" />
                                                <span>Fixed Amount</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Discount Configuration */}
                            <div className={`p-6 rounded-xl border ${theme.border} bg-opacity-50 backdrop-blur-sm`} style={{backgroundColor: `${theme.cardBg}CC`}}>
                                <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                                    Discount Configuration
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Value * {formData.type === '%' ? '(%)' : '(₹)'}
                                        </label>
                                        <input
                                            type="number"
                                            name="value"
                                            value={formData.value}
                                            onChange={handleInputChange}
                                            min="0"
                                            max={formData.type === '%' ? '100' : undefined}
                                            step={formData.type === '%' ? '0.01' : '1'}
                                            className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.text} ${theme.cardBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            placeholder={formData.type === '%' ? 'e.g., 20' : 'e.g., 100'}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Max Discount (₹) {formData.type === '%' ? '*' : ''}
                                            {formData.type === 'rs' && (
                                                <span className={`text-xs ${theme.textSecondary} ml-2`}>
                                                    (Not applicable for fixed amount)
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            name="max_discount"
                                            value={formData.max_discount}
                                            onChange={handleInputChange}
                                            min="0"
                                            disabled={formData.type === 'rs'}
                                            className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.text} ${
                                                formData.type === 'rs' 
                                                    ? `${theme.cardBg} opacity-50 cursor-not-allowed bg-gray-100` 
                                                    : theme.cardBg
                                            } focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            placeholder={formData.type === 'rs' ? 'Not applicable' : 'e.g., 500'}
                                            required={formData.type === '%'}
                                        />
                                        {formData.type === 'rs' && (
                                            <p className={`text-xs ${theme.textSecondary} mt-1`}>
                                                For fixed amount discounts, the discount value itself is the maximum
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Min Purchase (₹) *
                                            {formData.type === 'rs' && formData.value && (
                                                <span className={`text-xs ${theme.textSecondary} ml-2`}>
                                                    (Must be more than ₹{formData.value})
                                                </span>
                                            )}
                                        </label>
                                        <input
                                            type="number"
                                            name="min_purchase"
                                            value={formData.min_purchase}
                                            onChange={handleInputChange}
                                            min="0"
                                            className={`w-full px-4 py-3 rounded-xl border ${
                                                formData.type === 'rs' && formData.value && formData.min_purchase && 
                                                parseFloat(formData.min_purchase) <= parseFloat(formData.value)
                                                    ? 'border-red-500 focus:ring-red-500/20'
                                                    : `${theme.border} focus:border-blue-500 focus:ring-blue-500/20`
                                            } ${theme.text} ${theme.cardBg} transition-all`}
                                            placeholder="e.g., 1000"
                                            required
                                        />
                                        {formData.type === 'rs' && formData.value && formData.min_purchase && 
                                         parseFloat(formData.min_purchase) <= parseFloat(formData.value) && (
                                            <p className="text-xs text-red-500 mt-1">
                                                Minimum purchase must be greater than discount amount (₹{formData.value})
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Validity Period */}
                            <div className={`p-6 rounded-xl border ${theme.border} bg-opacity-50 backdrop-blur-sm`} style={{backgroundColor: `${theme.cardBg}CC`}}>
                                <h3 className={`text-lg font-semibold ${theme.text} mb-4 flex items-center space-x-2`}>
                                    <Calendar className="w-5 h-5 text-green-500" />
                                    <span>Validity Period</span>
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Valid From
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_from"
                                            value={formData.valid_from}
                                            onChange={handleInputChange}
                                            min={today}
                                            className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.text} ${theme.cardBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                        />
                                        <p className={`text-xs ${theme.textSecondary} mt-1`}>
                                            Leave empty to start from today
                                        </p>
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-2`}>
                                            Valid Until *
                                        </label>
                                        <input
                                            type="date"
                                            name="valid_until"
                                            value={formData.valid_until}
                                            onChange={handleInputChange}
                                            min={formData.valid_from || today}
                                            className={`w-full px-4 py-3 rounded-xl border ${theme.border} ${theme.text} ${theme.cardBg} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className={`p-6 rounded-xl border ${theme.border} bg-opacity-50 backdrop-blur-sm`} style={{backgroundColor: `${theme.cardBg}CC`}}>
                                <h3 className={`text-lg font-semibold ${theme.text} mb-4`}>
                                    Applicable Categories *
                                </h3>
                                {categoriesLoading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2" />
                                        <p className={`text-sm ${theme.textSecondary}`}>Loading categories from products...</p>
                                    </div>
                                ) : categories.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {categories.map(category => (
                                            <label 
                                                key={category}
                                                className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
                                                    formData.applicable_categories.includes(category)
                                                        ? `border-blue-500 bg-blue-500/10 ${theme.cardBg}`
                                                        : `${theme.border} hover:border-blue-300 ${theme.cardBg}`
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicable_categories.includes(category)}
                                                    onChange={() => handleCategoryChange(category)}
                                                    className="w-4 h-4 text-blue-600 bg-transparent border-2 border-gray-400 focus:ring-blue-500 rounded transition-all"
                                                />
                                                <span className={`text-sm font-medium ${theme.text}`}>
                                                    {category}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className={`text-center py-8 ${theme.textSecondary}`}>
                                        <p className="text-lg mb-2">No Product Categories Found</p>
                                        <p className="text-sm">Please add some products with categories first.</p>
                                        <p className="text-xs mt-2 opacity-70">
                                            Make sure your Django server is running at localhost:8000
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className={`px-6 py-3 rounded-xl font-medium transition-all border ${theme.border} ${theme.textSecondary} ${theme.cardBg} hover:bg-opacity-70`}
                                >
                                    Reset Form
                                </button>
                                <div className="flex space-x-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className={`px-6 py-3 rounded-xl font-medium ${theme.textSecondary} ${theme.cardBg} hover:bg-opacity-70 transition-all border ${theme.border}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                                <span>Creating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4" />
                                                <span>Create Coupon</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {/* View Coupons Tab */}
                    {activeTab === 'view' && (
                        <div className="space-y-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
                                    <p className={`${theme.textSecondary}`}>Loading coupons...</p>
                                </div>
                            ) : coupons.length === 0 ? (
                                <div className={`text-center py-12 ${theme.textSecondary}`}>
                                    <Tag className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-semibold mb-2">No Active Coupons</h3>
                                    <p className="mb-6">Create your first discount coupon to get started</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all flex items-center space-x-2 mx-auto"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create First Coupon</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {coupons.map(coupon => (
                                        <div 
                                            key={coupon._id}
                                            className={`p-6 rounded-xl border ${theme.border} bg-opacity-50 backdrop-blur-sm hover:shadow-lg transition-all`}
                                            style={{backgroundColor: `${theme.cardBg}CC`}}
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="p-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg">
                                                        <Tag className="w-4 h-4 text-white" />
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${theme.text}`}>
                                                        {coupon.coupon_code}
                                                    </h3>
                                                </div>
                                                <button
                                                    onClick={() => deleteCoupon(coupon._id)}
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.textSecondary}`}>Discount:</span>
                                                    <span className={`font-semibold ${theme.text} flex items-center space-x-1`}>
                                                        {coupon.type === '%' ? (
                                                            <span className="flex items-center space-x-1">
                                                                <span>{coupon.value}</span>
                                                                <Percent className="w-3 h-3" />
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center space-x-1">
                                                                <IndianRupee className="w-3 h-3" />
                                                                <span>{coupon.value}</span>
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.textSecondary}`}>Max Discount:</span>
                                                    <span className={`font-semibold ${theme.text}`}>₹{coupon.max_discount}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.textSecondary}`}>Min Purchase:</span>
                                                    <span className={`font-semibold ${theme.text}`}>₹{coupon.min_purchase}</span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.textSecondary}`}>Valid From:</span>
                                                    <span className={`font-semibold ${theme.text}`}>
                                                        {new Date(coupon.valid_from).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <span className={`${theme.textSecondary}`}>Valid Until:</span>
                                                    <span className={`font-semibold ${theme.text}`}>
                                                        {new Date(coupon.valid_until).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="pt-2 border-t border-gray-100">
                                                    <span className={`${theme.textSecondary} text-xs`}>Categories:</span>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {coupon.applicable_categories.map(category => (
                                                            <span 
                                                                key={category}
                                                                className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30"
                                                            >
                                                                {category}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Beautiful Success Modal */}
            {showSuccessModal && createdCoupon && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            setShowSuccessModal(false);
                            setCreatedCoupon(null);
                            // Stay in the coupon management modal, don't close it
                        }}
                    />
                    <div className={`relative w-full max-w-md ${theme.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${theme.border}`}>
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowSuccessModal(false);
                                setCreatedCoupon(null);
                                onClose(); // Close the entire coupon management modal and go back to manager dashboard
                            }}
                            className={`absolute top-4 right-4 p-2 rounded-xl ${theme.cardBg} ${theme.textSecondary} hover:bg-red-50 hover:text-red-600 transition-all duration-200 border ${theme.border}`}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Success Animation */}
                        <div className="mb-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <div className="flex justify-center space-x-2 mb-4">
                                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" style={{animationDelay: '0s'}} />
                                <Gift className="w-8 h-8 text-purple-500 animate-bounce" style={{animationDelay: '0.2s'}} />
                                <Sparkles className="w-6 h-6 text-yellow-400 animate-bounce" style={{animationDelay: '0.4s'}} />
                            </div>
                        </div>

                        {/* Success Message */}
                        <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>
                            Coupon Created Successfully!
                        </h3>
                        <p className={`${theme.textSecondary} mb-6`}>
                            Your discount coupon is ready to use
                        </p>

                        {/* Coupon Details Preview */}
                        <div className={`p-4 rounded-xl border ${theme.border} bg-gradient-to-r from-blue-500/10 to-purple-500/10 mb-6`}>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <Tag className="w-5 h-5 text-blue-500" />
                                <span className={`text-xl font-bold ${theme.text}`}>
                                    {createdCoupon.coupon_code}
                                </span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <span className={`${theme.textSecondary} text-sm`}>Discount:</span>
                                <span className={`font-semibold ${theme.text}`}>
                                    {createdCoupon.type === '%' ? (
                                        <span className="flex items-center space-x-1">
                                            <span>{createdCoupon.value}</span>
                                            <Percent className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1">
                                            <IndianRupee className="w-4 h-4" />
                                            <span>{createdCoupon.value}</span>
                                        </span>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center justify-center space-x-2 mt-1">
                                <span className={`${theme.textSecondary} text-xs`}>
                                    Valid until {new Date(createdCoupon.valid_until).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setActiveTab('view');
                                    setShowSuccessModal(false);
                                    setCreatedCoupon(null);
                                    fetchCoupons();
                                }}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                            >
                                View All Coupons
                            </button>
                            <button
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    setCreatedCoupon(null);
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium ${theme.textSecondary} ${theme.cardBg} hover:bg-opacity-70 transition-all border ${theme.border}`}
                            >
                                Create Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && couponToDelete && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setCouponToDelete(null);
                        }}
                    />
                    <div className={`relative w-full max-w-md ${theme.cardBg} rounded-2xl shadow-2xl p-8 text-center border ${theme.border}`}>
                        {/* Close Button */}
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setCouponToDelete(null);
                            }}
                            className={`absolute top-4 right-4 p-2 rounded-xl ${theme.cardBg} ${theme.textSecondary} hover:bg-red-50 hover:text-red-600 transition-all duration-200 border ${theme.border}`}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Warning Icon */}
                        <div className="mb-6">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-10 h-10 text-white" />
                            </div>
                        </div>

                        {/* Delete Confirmation Message */}
                        <h3 className={`text-2xl font-bold ${theme.text} mb-2`}>
                            Delete Coupon?
                        </h3>
                        <p className={`${theme.textSecondary} mb-6`}>
                            Are you sure you want to delete this coupon? This action cannot be undone.
                        </p>

                        {/* Coupon Details */}
                        <div className={`p-4 rounded-xl border ${theme.border} bg-red-500/10 mb-6`}>
                            <div className="flex items-center justify-center space-x-2 mb-2">
                                <Tag className="w-5 h-5 text-red-500" />
                                <span className={`text-xl font-bold ${theme.text}`}>
                                    {couponToDelete.coupon_code}
                                </span>
                            </div>
                            <div className="flex items-center justify-center space-x-2">
                                <span className={`${theme.textSecondary} text-sm`}>Discount:</span>
                                <span className={`font-semibold ${theme.text}`}>
                                    {couponToDelete.type === '%' ? (
                                        <span className="flex items-center space-x-1">
                                            <span>{couponToDelete.value}</span>
                                            <Percent className="w-4 h-4" />
                                        </span>
                                    ) : (
                                        <span className="flex items-center space-x-1">
                                            <IndianRupee className="w-4 h-4" />
                                            <span>{couponToDelete.value}</span>
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setCouponToDelete(null);
                                }}
                                className={`flex-1 px-4 py-3 rounded-xl font-medium ${theme.textSecondary} ${theme.cardBg} hover:bg-opacity-70 transition-all border ${theme.border}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponManagement;
