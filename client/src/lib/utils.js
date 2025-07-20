import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from 'react-toastify';

// =============================================================================
// UTILITY FUNCTIONS - Common helper functions used across the application
// =============================================================================

/**
 * cn - Merge Tailwind CSS classes with conditional logic
 * Combines clsx for conditional classes and twMerge for Tailwind conflicts
 * @param {...string} inputs - CSS class strings or conditional objects
 * @returns {string} - Merged CSS class string
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs))
}

// =============================================================================
// TOAST NOTIFICATIONS - Consistent notification system
// =============================================================================

/**
 * handleSuccess - Display success toast notification
 * @param {string} msg - Success message to display
 */
export const handleSuccess = (msg) => {
  toast.success(msg, {
    position: 'top-right',
    autoClose: 3000,        // Auto-close after 3 seconds
    hideProgressBar: false,  // Show progress bar
    closeOnClick: true,     // Close on click
    pauseOnHover: true,     // Pause on hover
  })
}

/**
 * handleError - Display error toast notification
 * @param {string} msg - Error message to display
 */
export const handleError = (msg) => {
  toast.error(msg, {
    position: 'top-right',
    autoClose: 5000,        // Keep error messages longer
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  })
}

/**
 * handleInfo - Display info toast notification
 * @param {string} msg - Info message to display
 */
export const handleInfo = (msg) => {
  toast.info(msg, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  })
}

/**
 * handleWarning - Display warning toast notification
 * @param {string} msg - Warning message to display
 */
export const handleWarning = (msg) => {
  toast.warning(msg, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
  })
}

// =============================================================================
// FORMAT UTILITIES - Data formatting helpers
// =============================================================================

/**
 * formatCurrency - Format number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * formatDate - Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * truncateText - Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length (default: 50)
 * @returns {string} - Truncated text with ellipsis
 */
export const truncateText = (text, length = 50) => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// =============================================================================
// VALIDATION UTILITIES - Form validation helpers
// =============================================================================

/**
 * validateEmail - Check if email format is valid
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * validatePhone - Check if phone number format is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * validateRequired - Check if field is not empty
 * @param {string} value - Value to validate
 * @returns {boolean} - True if value is not empty
 */
export const validateRequired = (value) => {
  return value && value.trim().length > 0;
}