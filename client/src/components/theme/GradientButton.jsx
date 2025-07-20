import React from 'react';
import { cn } from '../../lib/utils';

// =============================================================================
// GRADIENT BUTTON COMPONENT - Reusable gradient button with multiple variants
// =============================================================================

/** 
 * Gradient color variants for different button types 
 * Each variant includes hover states for smooth transitions
 */
const gradientVariants = {
  // Primary Actions - Blue gradients
  primary: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  
  // Success Actions - Green gradients  
  success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  emerald: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
  
  // Warning/Alert Actions - Orange/Yellow gradients
  warning: 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 hover:from-orange-500 hover:via-amber-600 hover:to-yellow-600',
  
  // Danger Actions - Red gradients
  danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  destructive: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900',
  
  // Info Actions - Blue/Cyan gradients
  info: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
  cyan: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500 hover:from-blue-500 hover:via-cyan-600 hover:to-sky-600',
  
  // Purple/Violet gradients
  purple: 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600',
  indigo: 'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 hover:from-purple-500 hover:via-violet-600 hover:to-indigo-600',
  
  // Colorful/Rainbow gradients
  rainbow: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 hover:from-orange-500 hover:via-red-600 hover:to-pink-600',
  vibrant: 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 hover:from-blue-500 hover:via-purple-600 hover:to-pink-600',
  
  // Subtle/Neutral gradients
  neutral: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
  dark: 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-gray-950',
};

/** Button size variants */
const sizeVariants = {
  sm: 'px-3 py-1 text-sm',      // Small buttons
  md: 'px-4 py-2 text-sm',      // Medium buttons (default)
  lg: 'px-6 py-3 text-base',    // Large buttons
  xl: 'px-8 py-4 text-lg',      // Extra large buttons
};

/** Button shape variants */
const shapeVariants = {
  rounded: 'rounded',            // Slightly rounded corners
  'rounded-lg': 'rounded-lg',    // Medium rounded corners
  'rounded-xl': 'rounded-xl',    // Large rounded corners
  pill: 'rounded-full',          // Pill-shaped buttons
};

const GradientButton = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  shape = 'rounded-lg',
  disabled = false,
  fullWidth = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const gradientClass = gradientVariants[variant] || gradientVariants.primary;
  const sizeClass = sizeVariants[size] || sizeVariants.md;
  const shapeClass = shapeVariants[shape] || shapeVariants['rounded-lg'];
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        baseClasses,
        gradientClass,
        sizeClass,
        shapeClass,
        widthClass,
        'flex items-center justify-center gap-2',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </button>
  );
});

GradientButton.displayName = 'GradientButton';

export default GradientButton;
