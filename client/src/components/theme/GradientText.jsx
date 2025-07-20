import React from 'react';
import { cn } from '../../lib/utils';

// Text gradient variants
const textGradientVariants = {
  primary: 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
  success: 'bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 bg-clip-text text-transparent',
  warning: 'bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 bg-clip-text text-transparent',
  danger: 'bg-gradient-to-r from-red-400 via-red-500 to-pink-500 bg-clip-text text-transparent',
  info: 'bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500 bg-clip-text text-transparent',
  purple: 'bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 bg-clip-text text-transparent',
  rainbow: 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent',
  fire: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent',
  ocean: 'bg-gradient-to-r from-blue-400 via-teal-500 to-cyan-400 bg-clip-text text-transparent',
  sunset: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent',
};

const GradientText = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  as: Component = 'span',
  ...props
}, ref) => {
  const gradientClass = textGradientVariants[variant] || textGradientVariants.primary;
  
  return (
    <Component
      ref={ref}
      className={cn(
        'font-bold',
        gradientClass,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

GradientText.displayName = 'GradientText';

export default GradientText;
