import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import GradientText from './GradientText';

const GlassmorphismModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  theme,
  className,
  size = 'md',
  showCloseButton = true,
  ...props
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated background with floating particles */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      >
        {/* Floating particles */}
        <div className="absolute top-4 left-6 w-2 h-2 bg-blue-400 rounded-full animate-pulse opacity-40"></div>
        <div className="absolute top-12 right-12 w-1 h-1 bg-purple-400 rounded-full animate-bounce opacity-35"></div>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-25"></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-40"></div>
        <div className="absolute top-8 right-6 w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-green-400 rounded-full animate-bounce opacity-25"></div>
        <div className="absolute bottom-4 right-4 w-2 h-2 bg-pink-400 rounded-full animate-ping opacity-15"></div>
      </div>

      {/* Main modal container with glassmorphism */}
      <div 
        className={cn(
          'relative rounded-2xl p-4 sm:p-6 w-full shadow-2xl backdrop-blur-xl border border-white/20 max-h-[90vh] overflow-y-auto',
          `${theme?.cardBg}/90`,
          sizeClasses[size],
          className
        )}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
          boxShadow: '0 25px 45px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
        }}
        {...props}
      >
        {/* Animated header with holographic effect */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="relative inline-block">
            <GradientText 
              as="h3" 
              variant="vibrant" 
              className="text-xl sm:text-2xl"
            >
              {title}
            </GradientText>
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-lg blur opacity-20"></div>
          </div>
          {subtitle && (
            <p className={`mt-1 ${theme?.textSecondary} text-xs sm:text-sm opacity-80`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3">
          {children}
        </div>

        {/* Close button with neon effect */}
        {showCloseButton && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              className={cn(
                'px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-sm',
                theme?.text
              )}
              onClick={onClose}
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlassmorphismModal;
