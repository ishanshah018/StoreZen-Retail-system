import React from 'react';
import { cn } from '../../lib/utils';

// Badge/Tag gradient variants
const badgeGradientVariants = {
  success: 'bg-gradient-to-r from-green-500 to-green-600',
  warning: 'bg-gradient-to-r from-orange-500 to-orange-600', 
  danger: 'bg-gradient-to-r from-red-500 to-red-600',
  info: 'bg-gradient-to-r from-blue-500 to-blue-600',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600',
  pink: 'bg-gradient-to-r from-pink-500 to-pink-600',
  indigo: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
  cyan: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
  emerald: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
  amber: 'bg-gradient-to-r from-amber-500 to-amber-600',
  primary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  secondary: 'bg-gradient-to-r from-gray-500 to-gray-600',
};

// Size variants for badges
const badgeSizeVariants = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm', 
  lg: 'px-4 py-2 text-sm',
};

const GradientBadge = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'sm',
  rounded = true,
  ...props
}, ref) => {
  const gradientClass = badgeGradientVariants[variant] || badgeGradientVariants.primary;
  const sizeClass = badgeSizeVariants[size] || badgeSizeVariants.sm;
  const roundedClass = rounded ? 'rounded' : '';
  
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center font-medium text-white hover:shadow-lg transition-all duration-200',
        gradientClass,
        sizeClass,
        roundedClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

GradientBadge.displayName = 'GradientBadge';

export default GradientBadge;
