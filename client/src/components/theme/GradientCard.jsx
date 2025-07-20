import React from 'react';
import { cn } from '../../lib/utils';

// Card gradient variants for different types of cards
const cardGradientVariants = {
  // Dashboard Cards
  stats: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  analytics: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-blue-400 via-cyan-500 to-sky-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  alerts: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  critical: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  warning: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  info: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-purple-400 via-violet-500 to-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  
  // Feature Cards
  primary: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  secondary: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  
  // Special Effects
  rainbow: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
  sunset: 'group relative overflow-hidden rounded-xl p-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]',
};

const GradientCard = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  hasGlow = false,
  glowColor = 'blue',
  ...props
}, ref) => {
  const gradientClass = cardGradientVariants[variant] || cardGradientVariants.primary;
  
  return (
    <div
      ref={ref}
      className={cn(gradientClass, className)}
      {...props}
    >
      {hasGlow && (
        <div className={`absolute -inset-1 bg-gradient-to-r from-${glowColor}-400 via-${glowColor === 'blue' ? 'purple' : glowColor}-500 to-${glowColor === 'blue' ? 'pink' : glowColor}-500 rounded-lg blur opacity-20`}></div>
      )}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg h-full p-4 flex flex-col">
        {children}
      </div>
    </div>
  );
});

GradientCard.displayName = 'GradientCard';

export default GradientCard;
